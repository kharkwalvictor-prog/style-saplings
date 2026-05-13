import { useState, useMemo } from "react";
import { useProductReviews, ProductReview } from "@/hooks/useReviews";
import { supabase } from "@/integrations/supabase/client";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  productId: string;
}

const ProductReviews = ({ productId }: Props) => {
  const { data: reviews = [], isLoading, refetch } = useProductReviews(productId);
  const [modalOpen, setModalOpen] = useState(false);
  const [photoModal, setPhotoModal] = useState<string | null>(null);

  const summary = useMemo(() => {
    if (reviews.length === 0) return null;
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
      pct: Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100),
    }));
    return { avg: Math.round(avg * 10) / 10, count: reviews.length, dist };
  }, [reviews]);

  if (isLoading) return null;

  return (
    <section className="mt-16 border-t pt-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-2xl font-semibold">Customer Reviews</h2>
        <Button variant="outline" className="border-sale text-sale hover:bg-sale/10" onClick={() => setModalOpen(true)}>
          Write a Review
        </Button>
      </div>

      {summary ? (
        <>
          {/* Summary */}
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="flex items-center gap-4">
              <span className="font-serif text-5xl font-bold">{summary.avg}</span>
              <div>
                <StarRating value={Math.round(summary.avg)} readonly size={20} />
                <p className="text-sm text-muted-foreground mt-1">Based on {summary.count} review{summary.count !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 max-w-xs">
              {summary.dist.map((d) => (
                <div key={d.star} className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-right text-muted-foreground">{d.star}★</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-sale h-full rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="w-8 text-xs text-muted-foreground">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-6">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} onPhotoClick={setPhotoModal} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reviews yet — be the first!</p>
        </div>
      )}

      <ReviewFormModal productId={productId} open={modalOpen} onClose={() => setModalOpen(false)} onSubmitted={refetch} />

      {/* Photo enlargement */}
      <Dialog open={!!photoModal} onOpenChange={() => setPhotoModal(null)}>
        <DialogContent className="max-w-lg p-2">
          {photoModal && <img src={photoModal} alt="Review photo" className="w-full rounded" />}
        </DialogContent>
      </Dialog>
    </section>
  );
};

function ReviewCard({ review, onPhotoClick }: { review: ProductReview; onPhotoClick: (url: string) => void }) {
  const firstName = review.customer_name.split(" ")[0];
  const lastInitial = review.customer_name.split(" ").length > 1 ? review.customer_name.split(" ").slice(-1)[0][0] + "." : "";

  return (
    <div className="border-b pb-6">
      <StarRating value={review.rating} readonly size={14} />
      {review.title && <p className="font-medium mt-2">{review.title}</p>}
      {review.body && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{review.body}</p>}
      {review.photo_url && (
        <button onClick={() => onPhotoClick(review.photo_url!)} className="mt-3">
          <img src={review.photo_url} alt="Review" className="h-20 w-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" />
        </button>
      )}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{firstName} {lastInitial}</span>
        <span>·</span>
        <span>{review.created_at ? format(new Date(review.created_at), "MMM yyyy") : ""}</span>
        {review.order_id && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-3 w-3" /> Verified Purchase
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function ReviewFormModal({ productId, open, onClose, onSubmitted }: { productId: string; open: boolean; onClose: () => void; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setRating(0); setTitle(""); setBody(""); setName(""); setEmail(""); setOrderNumber(""); setPhoto(null);
  };

  const handleSubmit = async () => {
    if (!rating) { toast.error("Please select a star rating"); return; }
    if (!body || body.trim().length < 20) { toast.error("Review must be at least 20 characters"); return; }
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!email.trim() || !email.includes("@")) { toast.error("Valid email is required"); return; }

    setSubmitting(true);
    try {
      let photoUrl: string | null = null;

      if (photo) {
        const ext = photo.name.split(".").pop();
        const path = `reviews/${productId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("return-images").upload(path, photo);
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("return-images").getPublicUrl(path);
          photoUrl = urlData.publicUrl;
        }
      }

      // Lookup order_id if order number provided
      let orderId: string | null = null;
      if (orderNumber.trim()) {
        const { data: orderData } = await supabase
          .from("orders")
          .select("id")
          .eq("order_number", orderNumber.trim().toUpperCase())
          .eq("customer_email", email.trim().toLowerCase())
          .maybeSingle();
        orderId = orderData?.id || null;
      }

      const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        customer_name: name.trim(),
        customer_email: email.trim().toLowerCase(),
        rating,
        title: title.trim() || null,
        body: body.trim(),
        photo_url: photoUrl,
        order_id: orderId,
        is_approved: false,
      });

      if (error) throw error;
      toast.success("Thank you! Your review will appear after a quick check by our team (usually within 24 hours).");
      reset();
      onClose();
      onSubmitted();
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Write a Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Rating *</label>
            <StarRating value={rating} onChange={setRating} size={28} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarise your experience" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Review * (min 20 chars)</label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="How was the quality, fit, craftsmanship?" rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email * (never shown)</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Order Number (optional)</label>
            <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="SS-XXXXXX" />
            <p className="text-[10px] text-muted-foreground mt-1">Helps us verify your purchase</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Photo (optional)</label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
                setPhoto(f || null);
              }}
            />
          </div>
          <Button className="w-full bg-sale hover:bg-sale/90 text-white" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductReviews;
