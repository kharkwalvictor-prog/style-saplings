import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, Instagram } from "lucide-react";
import { toast } from "sonner";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as const };

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "General", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you! We'll get back to you soon.");
    setForm({ name: "", email: "", subject: "General", message: "" });
  };

  useSEO({ title: "Contact Us | Style Saplings", description: "Have a question about our handcrafted ethnic wear? Reach out via email, phone, or our contact form. We'd love to hear from you.", canonicalPath: "/contact" });

  return (
    <div className="min-h-screen">
      <JsonLd data={ORGANIZATION_JSONLD} />
      <Header />

      <PageBanner label="Get In Touch" title="Contact Us" />

      {/* Body */}
      <section className="py-16 md:py-24" style={{ backgroundColor: "#F7F4EF" }}>
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Left — info card */}
            <motion.div {...fade} transition={{ duration: 0.5 }} className="md:col-span-2 rounded-2xl p-8 text-white" style={{ backgroundColor: '#1A2B22' }}>
              <h2 className="font-serif text-xl font-semibold mb-8">Contact Details</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-0.5 shrink-0 opacity-80" />
                  <div>
                    <p className="text-sm font-medium mb-0.5">Email</p>
                    <a href="mailto:support@stylesaplings.com" className="text-sm text-white/70 hover:text-white transition-colors">support@stylesaplings.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 mt-0.5 shrink-0 opacity-80" />
                  <div>
                    <p className="text-sm font-medium mb-0.5">Phone</p>
                    <a href="tel:+919810901031" className="text-sm text-white/70 hover:text-white transition-colors">+91-9810901031</a>
                    <p className="text-xs text-white/50 mt-0.5">Mon–Fri, 9AM–6PM IST</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 shrink-0 opacity-80" />
                  <div>
                    <p className="text-sm font-medium mb-0.5">Address</p>
                    <p className="text-sm text-white/70">6488, C6, Vasant Kunj,<br/>New Delhi 110070</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-0.5 shrink-0 opacity-80" />
                  <div>
                    <p className="text-sm font-medium mb-0.5">Hours</p>
                    <p className="text-sm text-white/70">Monday to Friday<br />9:00 AM – 6:00 PM IST</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20 flex items-center gap-4">
                <a href="https://instagram.com/stylesaplings" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/60 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://facebook.com/stylesaplings" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/60 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
              </div>
            </motion.div>

            {/* Right — form card */}
            <motion.div {...fade} transition={{ duration: 0.5, delay: 0.1 }} className="md:col-span-3 rounded-2xl p-8 bg-white shadow-sm">
              <h2 className="font-serif text-xl font-semibold mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text" placeholder="Full Name" required value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-border rounded-md px-4 py-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <input
                  type="email" placeholder="Email Address" required value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-border rounded-md px-4 py-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <select
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  className="w-full border border-border rounded-md px-4 py-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="Order Query">Order Query</option>
                  <option value="Product Information">Product Information</option>
                  <option value="Returns & Exchange">Returns &amp; Exchange</option>
                  <option value="General">General</option>
                </select>
                <textarea
                  placeholder="Your Message" required value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full border border-border rounded-md px-4 py-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none h-32"
                />
                <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 py-3 rounded-full text-[14px] font-medium">
                  Send Message
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
