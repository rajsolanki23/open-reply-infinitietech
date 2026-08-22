import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getDMQueue } from "@/lib/queue/client";
import {
  parseCommentEvents,
  parseMessageEvents,
  parsePostbackEvents,
  parseReadEvents,
  verifyWebhookChallenge,
  verifyWebhookSignature,
} from "@/lib/meta/webhook";
import { MESSAGE_JOB_NAME, POSTBACK_JOB_NAME } from "@/lib/queue/client";
import { Prisma } from "@/app/generated/prisma/client";
import { processDirectJob } from "@/lib/queue/dm-worker";
import { isWorkerEnabled, recordWorkerHeartbeat } from "@/lib/ops/worker-health";

const OPENING_DM_READ_FALLBACK_DELAY_MS = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    verifyWebhookChallenge(token, process.env.WEBHOOK_VERIFY_TOKEN)
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { success: false, error: "Verification failed" },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyWebhookSignature(rawBody, signature)) {
    await prisma.operationalEvent
      .create({
        data: {
          source: "SYSTEM",
          level: "WARNING",
          message: "Webhook signature verification failed",
          payload: {
            hadSignatureHeader: Boolean(signature),
            bodyLength: rawBody.length,
            bodyPreview: rawBody.slice(0, 200),
          },
        },
      })
      .catch(() => {});
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 401 }
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const webhookEvent = await prisma.webhookEvent.create({
    data: {
      object:
        typeof payload === "object" && payload && "object" in payload
          ? String(payload.object)
          : null,
      payload: payload as Prisma.InputJsonValue,
      status: "PENDING",
    },
  });

  try {
    const workerActive = await isWorkerEnabled();
    if (workerActive) {
      void recordWorkerHeartbeat({
        pid: process.pid || 1,
        hostname: process.env.VERCEL ? "vercel-webhook" : "server-webhook",
        startedAt: new Date().toISOString(),
      });
    }

    const commentEvents = parseCommentEvents(
      payload as Parameters<typeof parseCommentEvents>[0]
    );
    const queue = getDMQueue();

    for (const event of commentEvents) {
      const account = await prisma.instagramAccount.findUnique({
        where: { instagramId: event.instagramAccountId },
        select: { workspaceId: true },
      });

      const jobData = {
        instagramAccountId: event.instagramAccountId,
        commentId: event.commentId,
        commentText: event.commentText,
        commenterId: event.commenterId,
        commenterName: event.commenterName,
        mediaId: event.mediaId,
        source: "WEBHOOK" as const,
      };
      const jobId = `comment_${event.instagramAccountId}_${event.commentId}`;

      await queue.add("process-comment", jobData, { jobId });

      // Direct in-process execution on Vercel Serverless if worker is enabled
      if (workerActive) {
        try {
          await processDirectJob("process-comment", jobData, jobId);
        } catch (directErr) {
          console.error("[Webhook Direct Process] Comment error:", directErr);
        }
      }

      if (account) {
        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: { workspaceId: account.workspaceId },
        });
      }
    }

    // Button taps from opening DMs → deliver the reveal message.
    const postbackEvents = parsePostbackEvents(
      payload as Parameters<typeof parsePostbackEvents>[0]
    );

    for (const event of postbackEvents) {
      const jobData = {
        instagramAccountId: event.instagramAccountId,
        userId: event.userId,
        payload: event.payload,
        mid: event.mid,
      };
      const jobId = `postback_${event.instagramAccountId}_${event.userId}_${(
        event.mid ?? event.payload
      ).replace(/:/g, "_")}`;

      await queue.add(POSTBACK_JOB_NAME, jobData, { jobId });

      // Direct in-process execution on Vercel Serverless if worker is enabled
      if (workerActive) {
        try {
          await processDirectJob(POSTBACK_JOB_NAME, jobData, jobId);
        } catch (directErr) {
          console.error("[Webhook Direct Process] Postback error:", directErr);
        }
      }
    }

    // Inbound DMs → keyword-triggered autoreply.
    const messageEvents = parseMessageEvents(
      payload as Parameters<typeof parseMessageEvents>[0]
    );

    for (const event of messageEvents) {
      const account = await prisma.instagramAccount.findUnique({
        where: { instagramId: event.instagramAccountId },
        select: { workspaceId: true },
      });

      const jobData = {
        instagramAccountId: event.instagramAccountId,
        messageId: event.messageId,
        messageText: event.messageText,
        senderId: event.senderId,
      };
      const jobId = `message_${event.instagramAccountId}_${Buffer.from(
        event.messageId
      ).toString("base64url")}`;

      await queue.add(MESSAGE_JOB_NAME, jobData, { jobId });

      // Direct in-process execution on Vercel Serverless if worker is enabled
      if (workerActive) {
        try {
          await processDirectJob(MESSAGE_JOB_NAME, jobData, jobId);
        } catch (directErr) {
          console.error("[Webhook Direct Process] Message error:", directErr);
        }
      }

      if (account) {
        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: { workspaceId: account.workspaceId },
        });
      }
    }

    // If a user reads the opening DM and never taps the button, deliver the
    // same next-step DM after five minutes. The worker no-ops this delayed job
    // if a real button tap has already delivered the reveal.
    const readEvents = parseReadEvents(
      payload as Parameters<typeof parseReadEvents>[0]
    );

    for (const event of readEvents) {
      const openingLogs = await prisma.dmLog.findMany({
        where: {
          commenterId: event.userId,
          status: "SENT",
          automation: {
            isActive: true,
            openingDmEnabled: true,
            instagramAccount: {
              instagramId: event.instagramAccountId,
            },
          },
        },
        select: {
          automation: {
            select: {
              id: true,
            },
          },
        },
      });

      const scheduledAutomationIds = new Set<string>();
      for (const log of openingLogs) {
        const automation = log.automation;
        if (scheduledAutomationIds.has(automation.id)) continue;
        scheduledAutomationIds.add(automation.id);

        await queue.add(
          POSTBACK_JOB_NAME,
          {
            instagramAccountId: event.instagramAccountId,
            userId: event.userId,
            payload: `reveal:${automation.id}`,
            fallback: true,
          },
          {
            delay: OPENING_DM_READ_FALLBACK_DELAY_MS,
            jobId: `read_fallback_${event.instagramAccountId}_${event.userId}_${automation.id}`,
          }
        );
      }
    }

    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        status: "PROCESSED",
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        status: "FAILED",
        errorMessage: message,
        processedAt: new Date(),
      },
    });

    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
