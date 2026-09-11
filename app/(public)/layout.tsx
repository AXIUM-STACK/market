import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
