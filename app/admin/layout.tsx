import { requireSuperAdmin } from "@/lib/clerk";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AdminToastProvider } from "@/components/admin/AdminToastContext";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforces Super Admin authentication & authorization
  await requireSuperAdmin();

  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-slate-50">
        <div className="axm-container py-6 md:py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Admin Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <AdminSidebar />
            </aside>

            {/* Admin Content */}
            <main className="flex-1 min-w-0" id="admin-main">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminToastProvider>
  );
}
