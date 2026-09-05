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
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Left — info card */}
            <motion.div {...fade} transition={{ duration: 0.5 }} className="md:col-span-2 rounded-2xl p-8 text-white" style={{ backgroundColor: '#1E3320' }}>
              <h2 className="font-serif text-xl font-semibold mb-8">Contact Details</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-0.5 shrink-0 opacity-80" />
                  <div>
                    <p className="text-[14px] font-medium mb-0.5">Email</p>
                    <a href="mailto:support@stylesaplings.com" className="text-[14px] text-white/70 hover:text-white transition-colors">support@stylesaplings.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 mt-0.5 shrink-0 opacity-80" />
                  <div>
                    <p className="text-[14px] font-medium mb-0.5">Phone</p>
                    <a href="tel:+919810901031" className="text-[14px] text-white/70 hover:text-white transition-colors">+91-9810901031</a>
                    <p className="text-[13px] text-white/70 mt-0.5">Mon-Fri, 9AM-6PM IST</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 shrink-0 opacity-80" />
                  <div>
                    <p className="text-[14px] font-medium mb-0.5">Address</p>
                    <p className="text-[14px] text-white/70">6488, Vatika Apartment Pocket 6 & 7,<br/>Vasant Kunj, New Delhi 110070</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-0.5 shrink-0 opacity-80" />
                  <div>
                    <p className="text-[14px] font-medium mb-0.5">Hours</p>
                    <p className="text-[14px] text-white/70">Monday to Friday<br />9:00 AM - 6:00 PM IST</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20 flex items-center gap-4">
                <a href="https://instagram.com/stylesaplings" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/60 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://wa.me/919810901031" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-white/60 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>
            </motion.div>

            {/* Right — form card */}
            <motion.div {...fade} transition={{ duration: 0.5, delay: 0.1 }} className="md:col-span-3 rounded-2xl p-8 border border-border/50">
              <h2 className="font-serif text-xl font-semibold mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text" placeholder="Full Name" required value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-border/60 rounded-xl px-4 py-3.5 text-[15px] bg-background focus:outline-none focus:ring-1 focus:ring-[#4A6B45]/40 transition-all placeholder:text-muted-foreground/50"
                />
                <input
                  type="email" placeholder="Email Address" required value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-border/60 rounded-xl px-4 py-3.5 text-[15px] bg-background focus:outline-none focus:ring-1 focus:ring-[#4A6B45]/40 transition-all placeholder:text-muted-foreground/50"
                />
                <select
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  className="w-full border border-border/60 rounded-xl px-4 py-3.5 text-[15px] bg-background focus:outline-none focus:ring-1 focus:ring-[#4A6B45]/40 transition-all text-foreground"
                >
                  <option value="Order Query">Order Query</option>
                  <option value="Product Information">Product Information</option>
                  <option value="Returns & Exchange">Returns &amp; Exchange</option>
                  <option value="General">General</option>
                </select>
                <textarea
                  placeholder="Your Message" required value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full border border-border/60 rounded-xl px-4 py-3.5 text-[15px] bg-background focus:outline-none focus:ring-1 focus:ring-[#4A6B45]/40 transition-all resize-none h-32 placeholder:text-muted-foreground/50"
                />
                <Button type="submit" className="w-full bg-[#1E3320] hover:bg-[#2a4a2e] text-white py-4 rounded-full text-[13px] font-medium tracking-wide min-h-[44px]">
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
