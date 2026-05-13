import { useEffect } from "react";

interface JsonLdProps {
  data: Record<string, unknown>;
}

const JsonLd = ({ data }: JsonLdProps) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    script.setAttribute("data-jsonld", "true");
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [data]);

  return null;
};

export default JsonLd;

export const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Style Saplings",
  url: "https://stylesaplings.com",
  logo: "https://stylesaplings.com/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-9810901031",
    contactType: "customer service",
  },
};
