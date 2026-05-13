import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    document.title = "Page Not Found — Style Saplings";
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PageBanner label="Oops" title="Page Not Found" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex-1 flex items-center justify-center bg-background px-4 py-16 md:py-24">
        <div className="text-center max-w-md">
          <p className="text-8xl font-serif font-semibold text-primary/20 mb-4">404</p>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            The page you're looking for doesn't exist. Let's get you back to the collection.
          </p>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 rounded-full text-sm font-medium tracking-wide text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#C47A6E" }}
          >
            Back to Shop
          </Link>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default NotFound;
