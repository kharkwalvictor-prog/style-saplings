import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReviewSummary {
  product_id: string;
  review_count: number;
  avg_rating: number;
}

export interface ProductReview {
  id: string;
  product_id: string | null;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string | null;
  body: string | null;
  photo_url: string | null;
  order_id: string | null;
  is_approved: boolean | null;
  is_featured: boolean | null;
  created_at: string | null;
}

export const useReviewSummaries = () => {
  return useQuery({
    queryKey: ["review-summaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_review_summary" as any)
        .select("*");
      if (error) throw error;
      return (data as unknown as ReviewSummary[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductReviews = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as ProductReview[]) || [];
    },
    enabled: !!productId,
  });
};

export const useAllReviews = () => {
  return useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as ProductReview[]) || [];
    },
  });
};
