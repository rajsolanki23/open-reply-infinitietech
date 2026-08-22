import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { ensureWorkspaceForUser } from "@/lib/workspace";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let userId = session?.user?.id;
  const email = session?.user?.email;

  if (!userId && email) {
    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (dbUser) {
      userId = dbUser.id;
    }
  }

  if (!userId) {
    redirect("/login");
  }

  const workspace = await ensureWorkspaceForUser(
    userId,
    email
  );
  const accounts = await prisma.instagramAccount.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { connectedAt: "desc" },
    select: { username: true },
  });

  return (
    <DashboardShell
      workspaceName={workspace.name}
      instagramUsername={accounts[0]?.username ?? null}
      instagramAccountCount={accounts.length}
    >
      {children}
    </DashboardShell>
  );
}
