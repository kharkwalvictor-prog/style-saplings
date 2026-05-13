import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { useAllReviews } from "@/hooks/useReviews";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, LayoutDashboard, ShoppingCart, Users, Package, RotateCcw, Megaphone, CircleDot, Receipt, Settings, FileText } from "lucide-react";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminBlog from "@/components/admin/AdminBlog";
import AdminCustomers from "@/components/admin/AdminCustomers";
import AdminRefunds from "@/components/admin/AdminRefunds";
import AdminMarketing from "@/components/admin/AdminMarketing";
import AdminGSTReport from "@/components/admin/AdminGSTReport";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminContent from "@/components/admin/AdminContent";

type Tab = "dashboard" | "orders" | "customers" | "inventory" | "refunds" | "marketing" | "gst" | "blog" | "content" | "settings";

const sidebarTabs = [
  { key: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard, mobileIcon: "📊" },
  { key: "orders" as Tab, label: "Orders", icon: ShoppingCart, mobileIcon: "🛍️" },
  { key: "customers" as Tab, label: "Customers", icon: Users, mobileIcon: "👥" },
  { key: "inventory" as Tab, label: "Inventory", icon: Package, mobileIcon: "📦" },
  { key: "refunds" as Tab, label: "Refunds", icon: RotateCcw, mobileIcon: "🔄" },
  { key: "gst" as Tab, label: "GST", icon: Receipt, mobileIcon: "🧾" },
  { key: "marketing" as Tab, label: "Marketing", icon: Megaphone, mobileIcon: "📣" },
];

const mobileTabs = [
  { key: "dashboard" as Tab, label: "Dashboard", mobileIcon: "📊" },
  { key: "orders" as Tab, label: "Orders", mobileIcon: "🛍️" },
  { key: "inventory" as Tab, label: "Inventory", mobileIcon: "📦" },
  { key: "customers" as Tab, label: "Customers", mobileIcon: "👥" },
  { key: "refunds" as Tab, label: "Refunds", mobileIcon: "🔄" },
  { key: "gst" as Tab, label: "GST", mobileIcon: "🧾" },
  { key: "blog" as Tab, label: "Blog", mobileIcon: "📝" },
  { key: "content" as Tab, label: "Content", mobileIcon: "📄" },
  { key: "marketing" as Tab, label: "Marketing", mobileIcon: "📣" },
];

const Admin = () => {
  const { isAdmin, loading, signOut } = useAdmin();
  const { isConnected } = useAdminRealtime();
  const { data: allReviews = [] } = useAllReviews();
  const pendingReviewCount = allReviews.filter(r => r.is_approved === false).length;
  const [tab, setTab] = useState<Tab>("dashboard");

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return <AdminLogin />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="font-serif text-xl font-semibold">Style Saplings</h1>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs">
              <CircleDot className={`h-3 w-3 ${isConnected ? "text-green-500" : "text-red-500"}`} />
              <span className="hidden sm:inline text-muted-foreground">{isConnected ? "Live" : "Offline"}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Logout</span></Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 border-r bg-background shrink-0">
          <nav className="flex-1 py-4 space-y-1 px-2">
            {sidebarTabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  tab === t.key ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}>
                <t.icon className="h-4 w-4 shrink-0" />
                {t.label}
                {t.key === "marketing" && pendingReviewCount > 0 && (
                  <span className="ml-auto bg-sale text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{pendingReviewCount}</span>
                )}
              </button>
            ))}
            {/* Blog & Settings */}
            <div className="pt-4 mt-4 border-t space-y-1">
              <button onClick={() => setTab("blog")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  tab === "blog" ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}>
                <span className="text-base">📝</span> Blog
              </button>
              <button onClick={() => setTab("content")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  tab === "content" ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}>
                <FileText className="h-4 w-4 shrink-0" /> Content
              </button>
              <button onClick={() => setTab("settings")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  tab === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}>
                <Settings className="h-4 w-4 shrink-0" /> Settings
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {tab === "dashboard" && <AdminDashboard onNavigate={(t: string) => setTab(t as Tab)} />}
          {tab === "orders" && <AdminOrders />}
          {tab === "customers" && <AdminCustomers />}
          {tab === "inventory" && <AdminProducts />}
          {tab === "refunds" && <AdminRefunds />}
          {tab === "gst" && <AdminGSTReport />}
          {tab === "marketing" && <AdminMarketing />}
          {tab === "blog" && <AdminBlog />}
          {tab === "content" && <AdminContent />}
          {tab === "settings" && <AdminSettings />}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 flex">
        {mobileTabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex flex-col items-center py-2 text-[10px] transition-colors ${
              tab === t.key ? "text-primary" : "text-muted-foreground"
            }`}>
            <span className="text-lg">{t.mobileIcon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Admin;
