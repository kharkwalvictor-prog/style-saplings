import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DbProduct } from "./useProducts";

export const useProductSearch = (query: string) => {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["product-search", trimmed],
    queryFn: async () => {
      if (trimmed.length < 2) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .textSearch("search_vector", trimmed, { type: "plain", config: "english" })
        .limit(20);
      if (error) throw error;
      return data as DbProduct[];
    },
    enabled: trimmed.length >= 2,
    staleTime: 60 * 1000,
  });
};
