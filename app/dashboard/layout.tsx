import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isCurrentSuperAdmin } from "@/lib/clerk";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const isSuperAdmin = await isCurrentSuperAdmin();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <div className="axm-container py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-60 shrink-0">
            <DashboardSidebar isSuperAdmin={isSuperAdmin} />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0" id="dashboard-main">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
