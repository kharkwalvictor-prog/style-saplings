import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X, CheckCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";

const REASONS = [
  "Wrong size",
  "Changed mind",
  "Damaged/defective",
  "Wrong item received",
  "Quality issue",
];

const REQUEST_TYPES = [
  { value: "return", label: "Return & Refund" },
  { value: "exchange", label: "Exchange" },
  { value: "refund", label: "Damaged Item" },
];

const Returns = () => {
  const [form, setForm] = useState({
    order_number: "",
    phone: "",
    request_type: "return",
    reason: REASONS[0],
    description: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (!form.order_number.trim() || !form.phone.trim()) {
      toast.error("Please enter order number and phone first");
      return;
    }
    setUploading(true);
    const urls: string[] = [];

    for (const file of files.slice(0, 3 - images.length)) {
      if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB per image"); continue; }

      // Get signed upload URL from edge function
      const { data: signedData, error: signedErr } = await supabase.functions.invoke(
        "validate-return-upload",
        {
          body: {
            order_number: form.order_number.trim().toUpperCase(),
            phone: form.phone.trim(),
            filename: file.name,
          },
        }
      );

      if (signedErr || !signedData?.signedUrl) {
        toast.error(signedData?.error || "Upload validation failed. Check order number and phone.");
        continue;
      }

      // Upload using the signed URL
      const uploadRes = await fetch(signedData.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        toast.error("Upload failed");
        continue;
      }

      urls.push(signedData.publicUrl);
    }

    setImages(prev => [...prev, ...urls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.order_number.trim() || !form.phone.trim()) {
      setError("Order number and phone are required");
      return;
    }

    setSubmitting(true);
    try {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email, customer_phone")
        .eq("order_number", form.order_number.trim().toUpperCase())
        .single();

      if (orderErr || !order) {
        setError("Order not found. Please check your order number.");
        setSubmitting(false);
        return;
      }

      const orderPhone = order.customer_phone.replace(/\D/g, "");
      const inputPhone = form.phone.replace(/\D/g, "");
      if (!orderPhone.endsWith(inputPhone.slice(-10)) && !inputPhone.endsWith(orderPhone.slice(-10))) {
        setError("Phone number doesn't match order records.");
        setSubmitting(false);
        return;
      }

      const { error: insertErr } = await supabase.from("refund_requests").insert({
        order_id: order.id,
        order_number: form.order_number.trim().toUpperCase(),
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_email: order.customer_email.trim().toLowerCase(),
        request_type: form.request_type as any,
        reason: form.reason,
        description: form.description || null,
        images,
      });

      if (insertErr) throw insertErr;

      setSubmitted(true);
      toast.success("Return request submitted!");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full border rounded-2xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring";

  useSEO({ title: "Returns & Exchanges | Style Saplings", description: "Request a return, exchange, or refund for your Style Saplings order.", canonicalPath: "/returns" });

  return (
    <div className="min-h-screen">
      <Header />

      <PageBanner label="Support" title="Returns & Exchanges" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <section className="container px-4 py-16 md:py-24 max-w-lg mx-auto">
        {submitted ? (
          <div className="text-center space-y-4 py-10">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            <h2 className="font-serif text-2xl font-semibold">Request Submitted</h2>
            <p className="text-muted-foreground text-sm">
              We've received your return request and will respond within 24–48 hours.
              You'll receive an update via email and WhatsApp.
            </p>
            <Button onClick={() => window.location.href = "/"}>Back to Home</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium block mb-1.5">Order Number *</label>
              <Input placeholder="e.g. SS-M1A2B3" value={form.order_number}
                onChange={e => setForm(p => ({ ...p, order_number: e.target.value }))} required />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Phone Number *</label>
              <Input placeholder="Phone used during order" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
              <p className="text-xs text-muted-foreground mt-1">Must match the phone number on your order</p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Request Type *</label>
              <select value={form.request_type}
                onChange={e => setForm(p => ({ ...p, request_type: e.target.value }))}
                className={inputClass}>
                {REQUEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Reason *</label>
              <select value={form.reason}
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                className={inputClass}>
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Description (optional)</label>
              <Textarea placeholder="Tell us more about the issue..." value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="min-h-[80px]" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Photos (optional, max 3)</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {images.map((url, i) => (
                  <div key={url} className="relative w-20 h-20 border rounded overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              {images.length < 3 && (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 border rounded-lg hover:bg-accent disabled:opacity-50">
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Request
            </Button>
          </form>
        )}
      </section>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Returns;
