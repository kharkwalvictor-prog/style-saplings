import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type SiteContent = Record<string, string>;

export const useSiteContent = () => {
  return useQuery({
    queryKey: ["site-content"],
    queryFn: async (): Promise<SiteContent> => {
      // Note: site_content table isn't in the generated types, so use .from() with type assertion
      const { data, error } = await (supabase as any)
        .from("site_content")
        .select("key, value");

      if (error) throw error;

      const content: SiteContent = {};
      (data || []).forEach((row: { key: string; value: string }) => {
        content[row.key] = row.value;
      });
      return content;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Helper to get content with fallback
export const getContent = (
  content: SiteContent | undefined,
  key: string,
  fallback: string
): string => {
  return content?.[key] || fallback;
};
