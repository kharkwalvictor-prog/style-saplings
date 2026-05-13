import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WishlistContextType {
  wishlistedIds: Set<string>;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const SESSION_KEY = "ss_wishlist_session";

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sessionId = useRef(getSessionId());
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from("wishlists")
      .select("product_id")
      .eq("session_id", sessionId.current)
      .then(({ data }) => {
        if (data) {
          setIds(new Set(data.map((r) => r.product_id).filter(Boolean) as string[]));
        }
      });
  }, []);

  const isWishlisted = useCallback((productId: string) => ids.has(productId), [ids]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const sid = sessionId.current;
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) {
          next.delete(productId);
          supabase.from("wishlists").delete().eq("session_id", sid).eq("product_id", productId).then();
          toast("Removed from wishlist");
        } else {
          next.add(productId);
          supabase.from("wishlists").insert({ session_id: sid, product_id: productId }).then();
          toast("Added to wishlist ♥");
        }
        return next;
      });
    },
    []
  );

  const count = ids.size;

  return (
    <WishlistContext.Provider value={{ wishlistedIds: ids, isWishlisted, toggleWishlist, count }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
