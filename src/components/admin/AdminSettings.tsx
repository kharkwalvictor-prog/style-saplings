import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Rocket } from "lucide-react";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeLive, setStoreLive] = useState(false);
  const [togglingLive, setTogglingLive] = useState(false);
  const gstRowId = useRef<string | null>(null);
  const [gst, setGst] = useState({
    gstin: "",
    legal_name: "",
    address: "",
    state: "Delhi",
    state_code: "07",
    trade_name: "",
  });
  const [shipping, setShipping] = useState({
    freeAbove: "999",
    flatRate: "99",
    estimatedDays: "5-7",
  });
  const [contact, setContact] = useState({
    email: "support@stylesaplings.com",
    phone: "+91-9810901031",
    address: "Vasant Kunj, New Delhi",
    instagram: "stylesaplings",
    whatsapp: "919810901031",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("gst_config")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Load GST error:", error);
      }

      if (data) {
        gstRowId.current = data.id;
        setGst({
          gstin: data.gstin || "",
          legal_name: data.legal_name || "",
          address: data.address || "",
          state: data.state || "Delhi",
          state_code: data.state_code || "07",
          trade_name: data.trade_name || "",
        });
      }
    } catch (err) {
      console.error("Load settings error:", err);
    }

    // Load store live status
    try {
      const { data: liveData } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "store_live")
        .maybeSingle();
      setStoreLive(liveData?.value === "true");
    } catch { /* ignore */ }

    const savedShipping = localStorage.getItem("ss_shipping_config");
    if (savedShipping) setShipping(JSON.parse(savedShipping));

    const savedContact = localStorage.getItem("ss_contact_config");
    if (savedContact) setContact(JSON.parse(savedContact));

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Always try update first, then insert if no rows affected
      if (gstRowId.current) {
        const { error } = await supabase
          .from("gst_config")
          .update({
            gstin: gst.gstin,
            legal_name: gst.legal_name,
            trade_name: gst.trade_name,
            address: gst.address,
            state: gst.state,
            state_code: gst.state_code,
          })
          .eq("id", gstRowId.current);

        if (error) {
          console.error("Update GST error:", error);
          throw error;
        }
      } else {
        // No existing row — insert new
        const { data, error } = await supabase
          .from("gst_config")
          .insert({
            gstin: gst.gstin,
            legal_name: gst.legal_name,
            trade_name: gst.trade_name,
            address: gst.address,
            state: gst.state,
            state_code: gst.state_code,
          })
          .select("id")
          .single();

        if (error) {
          console.error("Insert GST error:", error);
          throw error;
        }
        if (data) gstRowId.current = data.id;
      }

      // Save shipping & contact to localStorage
      localStorage.setItem("ss_shipping_config", JSON.stringify(shipping));
      localStorage.setItem("ss_contact_config", JSON.stringify(contact));

      toast.success("Settings saved successfully");
    } catch (err: any) {
      console.error("Save failed:", err);
      toast.error(err?.message || "Failed to save settings");
    }
    setSaving(false);
  };

  const inputClass = "w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring";

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-xl font-semibold mb-6">Store Settings</h2>

      {/* Go Live Toggle */}
      <section className={`border-2 rounded-2xl p-5 mb-6 ${storeLive ? "border-green-500/50 bg-green-50/30" : "border-amber-500/50 bg-amber-50/30"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className={`h-5 w-5 ${storeLive ? "text-green-600" : "text-amber-600"}`} />
            <div>
              <h3 className="font-semibold text-sm">
                {storeLive ? "Store is LIVE" : "Store is PAUSED"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {storeLive
                  ? "Customers can place orders and make payments."
                  : "Checkout is disabled. Customers see a 'Coming Soon' page."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {togglingLive && <Loader2 className="h-4 w-4 animate-spin" />}
            <Switch
              checked={storeLive}
              disabled={togglingLive}
              onCheckedChange={async (checked) => {
                setTogglingLive(true);
                try {
                  const { error } = await supabase
                    .from("site_content")
                    .update({ value: checked ? "true" : "false", updated_at: new Date().toISOString() })
                    .eq("key", "store_live");
                  if (error) throw error;
                  setStoreLive(checked);
                  toast.success(checked ? "Store is now LIVE! Customers can place orders." : "Store paused. Checkout is disabled.");
                } catch (err: any) {
                  console.error("Toggle error:", err);
                  toast.error("Failed to update store status");
                }
                setTogglingLive(false);
              }}
            />
          </div>
        </div>
      </section>

      {/* Business / GST Details */}
      <section className="border rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-4 uppercase tracking-wide text-muted-foreground">Business & Tax Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Business Name</label>
            <input value={gst.legal_name} onChange={e => setGst(p => ({ ...p, legal_name: e.target.value }))} placeholder="Victor Arun Kharkwal" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Trade Name</label>
            <input value={gst.trade_name} onChange={e => setGst(p => ({ ...p, trade_name: e.target.value }))} placeholder="Shivaya Enterprises" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">GSTIN</label>
            <input value={gst.gstin} onChange={e => setGst(p => ({ ...p, gstin: e.target.value }))} placeholder="07BEGPK0002P1ZN" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">State Code</label>
            <input value={gst.state_code} onChange={e => setGst(p => ({ ...p, state_code: e.target.value }))} placeholder="07" className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Business Address</label>
            <input value={gst.address} onChange={e => setGst(p => ({ ...p, address: e.target.value }))} placeholder="Full registered address" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">State (for GST calculation)</label>
            <select value={gst.state} onChange={e => setGst(p => ({ ...p, state: e.target.value }))} className={inputClass}>
              {["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Rajasthan", "West Bengal", "Gujarat", "Telangana", "Kerala", "Other"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Shipping */}
      <section className="border rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-4 uppercase tracking-wide text-muted-foreground">Shipping</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Free Shipping Above (Rs.)</label>
            <input type="number" value={shipping.freeAbove} onChange={e => setShipping(p => ({ ...p, freeAbove: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Flat Shipping Rate (Rs.)</label>
            <input type="number" value={shipping.flatRate} onChange={e => setShipping(p => ({ ...p, flatRate: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Estimated Delivery</label>
            <input value={shipping.estimatedDays} onChange={e => setShipping(p => ({ ...p, estimatedDays: e.target.value }))} placeholder="5-7 business days" className={inputClass} />
          </div>
        </div>
      </section>

      {/* Contact Details */}
      <section className="border rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-4 uppercase tracking-wide text-muted-foreground">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Support Email</label>
            <input value={contact.email} onChange={e => setContact(p => ({ ...p, email: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label>
            <input value={contact.phone} onChange={e => setContact(p => ({ ...p, phone: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Store Address</label>
            <input value={contact.address} onChange={e => setContact(p => ({ ...p, address: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Instagram Handle</label>
            <input value={contact.instagram} onChange={e => setContact(p => ({ ...p, instagram: e.target.value }))} placeholder="stylesaplings" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">WhatsApp Number <span className="text-[10px] text-muted-foreground/60">(with country code, no +)</span></label>
            <input value={contact.whatsapp} onChange={e => setContact(p => ({ ...p, whatsapp: e.target.value }))} placeholder="919810901031" className={inputClass} />
          </div>
        </div>
      </section>

      <Button onClick={handleSave} disabled={saving} className="rounded-full">
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
};

export default AdminSettings;
