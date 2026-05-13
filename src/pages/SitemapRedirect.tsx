import { useEffect } from "react";

const SitemapRedirect = () => {
  useEffect(() => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "azlcypjesjomiydfyoho";
    window.location.replace(`https://${projectId}.supabase.co/functions/v1/sitemap`);
  }, []);
  return null;
};

export default SitemapRedirect;
