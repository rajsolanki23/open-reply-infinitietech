import { NextResponse } from "next/server";
import { getDMQueue } from "@/lib/queue/client";
import {
  getWorkerHealth,
  setWorkerEnabled,
} from "@/lib/ops/worker-health";
import { runWorkerSyncNow } from "@/lib/queue/dm-worker";
import { canManageWorkspace, getCurrentWorkspaceContext } from "@/lib/workspace-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageWorkspace(context.role)) {
    return NextResponse.json(
      { success: false, error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  const [health, queueCounts] = await Promise.all([
    getWorkerHealth(),
    getDMQueue().getJobCounts("waiting", "active", "delayed", "failed").catch(() => ({})),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      ...health,
      queueCounts,
      platform: process.env.VERCEL ? "vercel-serverless" : "standard-node",
    },
  });
}

export async function POST(request: Request) {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageWorkspace(context.role)) {
    return NextResponse.json(
      { success: false, error: "Forbidden. Only workspace owners and admins can control background workers." },
      { status: 403 }
    );
  }

  const { workspaceId, userId } = context;

  try {
    const body = await request.json();
    const action = String(body.action ?? "").toLowerCase();

    if (action === "turn_on") {
      await setWorkerEnabled(true, `workspace_${workspaceId}_user_${userId}`);
      const syncResult = await runWorkerSyncNow().catch(() => null);

      return NextResponse.json({
        success: true,
        message: "Worker turned ON. Automated DM delivery is now active.",
        enabled: true,
        status: "ACTIVE",
        syncResult,
      });
    }

    if (action === "turn_off") {
      await setWorkerEnabled(false, `workspace_${workspaceId}_user_${userId}`);

      return NextResponse.json({
        success: true,
        message: "Worker turned OFF. Background message processing is paused.",
        enabled: false,
        status: "PAUSED",
      });
    }

    if (action === "sync_now") {
      const syncResult = await runWorkerSyncNow();

      return NextResponse.json({
        success: true,
        message: `Sync complete: processed ${syncResult.processed} tasks (${syncResult.failed} failed).`,
        result: syncResult,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported: turn_on, turn_off, sync_now" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Worker Control API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform worker action." },
      { status: 500 }
    );
  }
}
