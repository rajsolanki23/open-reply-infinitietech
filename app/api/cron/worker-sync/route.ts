import { NextRequest, NextResponse } from "next/server";
import { runWorkerSyncNow } from "@/lib/queue/dm-worker";
import { verifyCronRequest } from "@/lib/cron-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runWorkerSyncNow();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error("[Cron Worker Sync] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
