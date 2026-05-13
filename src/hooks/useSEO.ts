import { useEffect } from "react";

const SITE_NAME = "Style Saplings";
const BASE_URL = "https://stylesaplings.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.jpg`;

interface SEOProps {
  title: string;
  description: string;
  ogImage?: string;
  canonicalPath?: string;
  type?: "website" | "article" | "product";
}

const setMeta = (attr: string, key: string, content: string) => {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setCanonical = (url: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
};

export const useSEO = ({ title, description, ogImage, canonicalPath, type = "website" }: SEOProps) => {
  useEffect(() => {
    document.title = title;

    const url = `${BASE_URL}${canonicalPath || window.location.pathname}`;
    const image = ogImage || DEFAULT_OG_IMAGE;

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", image);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", type);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);

    setCanonical(url);
  }, [title, description, ogImage, canonicalPath, type]);
};
