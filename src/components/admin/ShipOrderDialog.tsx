import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Copy, ExternalLink, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface ShipOrderDialogProps {
  order: any;
  open: boolean;
  onClose: () => void;
  onShipped: () => void;
}

interface ShipmentResult {
  shipment_id: string;
  awb_code: string;
  courier_name: string;
}

const ShipOrderDialog = ({ order, open, onClose, onShipped }: ShipOrderDialogProps) => {
  const [weight, setWeight] = useState(500);
  const [length, setLength] = useState(25);
  const [breadth, setBreadth] = useState(20);
  const [height, setHeight] = useState(10);
  const [loading, setLoading] = useState(false);
  const [labelLoading, setLabelLoading] = useState(false);
  const [result, setResult] = useState<ShipmentResult | null>(null);

  const handleCreateShipment = async () => {
    if (!order) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-shipment", {
        body: {
          order_id: order.id,
          weight_grams: weight,
          length,
          breadth,
          height,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult({
        shipment_id: data.shipment_id,
        awb_code: data.awb_code,
        courier_name: data.courier_name,
      });
      toast.success("Shipment created successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create shipment");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLabel = async () => {
    if (!result) return;
    setLabelLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-shipping-label", {
        body: { shipment_id: result.shipment_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.label_url) {
        window.open(data.label_url, "_blank");
      } else {
        toast.error("No label URL returned");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to get shipping label");
    } finally {
      setLabelLoading(false);
    }
  };

  const handleCopyAwb = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.awb_code);
    toast.success("AWB copied to clipboard");
  };

  const handleClose = () => {
    if (result) {
      onShipped();
    } else {
      onClose();
    }
    // Reset state after dialog closes
    setTimeout(() => {
      setResult(null);
      setWeight(500);
      setLength(25);
      setBreadth(20);
      setHeight(10);
    }, 200);
  };

  if (!order) return null;

  const address = order.shipping_address as any;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ship Order #{order.order_number}
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {/* Customer Info */}
            <div className="border rounded-lg p-3 bg-accent/30 space-y-1">
              <p className="font-medium text-sm">{order.customer_name}</p>
              <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
              {address?.city && (
                <p className="text-xs text-muted-foreground">{address.city}, {address.state}</p>
              )}
            </div>

            {/* Package Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Package Details
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="weight" className="text-xs">Weight (grams)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min={1}
                    value={weight}
                    onChange={e => setWeight(Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="length" className="text-xs">Length (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    min={1}
                    value={length}
                    onChange={e => setLength(Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="breadth" className="text-xs">Breadth (cm)</Label>
                  <Input
                    id="breadth"
                    type="number"
                    min={1}
                    value={breadth}
                    onChange={e => setBreadth(Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="height" className="text-xs">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min={1}
                    value={height}
                    onChange={e => setHeight(Number(e.target.value))}
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-[#7c8c6e] hover:bg-[#6b7a5e] text-white"
              onClick={handleCreateShipment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Shipment...
                </>
              ) : (
                "Create Shipment"
              )}
            </Button>
          </div>
        ) : (
          /* Success State */
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-green-50 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-green-700" />
                </div>
                <p className="font-medium text-green-800">Shipment Created!</p>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">AWB Code</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-semibold text-sm">{result.awb_code}</p>
                    <button
                      onClick={handleCopyAwb}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Copy AWB code"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Courier</p>
                  <p className="font-medium text-sm">{result.courier_name}</p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadLabel}
              disabled={labelLoading}
            >
              {labelLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching Label...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Download Label
                </>
              )}
            </Button>

            <Button
              className="w-full bg-[#7c8c6e] hover:bg-[#6b7a5e] text-white"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShipOrderDialog;
