import { signOut } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  return signOut({ redirectTo: "/login" });
}

export async function POST() {
  return signOut({ redirectTo: "/login" });
}
