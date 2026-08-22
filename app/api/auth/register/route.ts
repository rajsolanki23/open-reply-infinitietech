import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Public registration is disabled. Please contact your workspace administrator in Settings to provision an account.",
    },
    { status: 403 }
  );
}
