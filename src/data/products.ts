import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

export type CraftType = "Chikankari" | "Bandhani" | "Firan" | "Festive";
export type Size = "2Y" | "3Y" | "4Y" | "5Y";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  craftType: CraftType;
  sizes: Size[];
  images: string[];
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  category: string;
}

const images = [product1, product2, product3, product4];

export const products: Product[] = [
  {
    id: "1", name: "Azure Blossom Set", slug: "azure-blossom-set",
    description: "A delicate chikankari set in soft azure blue with intricate hand-embroidered floral motifs. Crafted from pure cotton mulmul for ultimate comfort.",
    price: 1299, salePrice: 1099, craftType: "Chikankari", sizes: ["2Y", "3Y", "4Y", "5Y"],
    images: [images[0]], stockStatus: "in_stock", category: "Sets",
  },
  {
    id: "2", name: "Verdure Chikankari Ensemble", slug: "verdure-chikankari-ensemble",
    description: "A lush green chikankari ensemble featuring shadow-work embroidery on soft muslin. Perfect for festive gatherings.",
    price: 1399, craftType: "Chikankari", sizes: ["2Y", "3Y", "4Y"],
    images: [images[0]], stockStatus: "in_stock", category: "Sets",
  },
  {
    id: "3", name: "Scarlet Festive Set", slug: "scarlet-festive-set",
    description: "A vibrant red festive set with gold zari accents and traditional motifs. Ideal for celebrations and special occasions.",
    price: 1499, craftType: "Festive", sizes: ["2Y", "3Y", "4Y", "5Y"],
    images: [images[3]], stockStatus: "in_stock", category: "Sets",
  },
  {
    id: "4", name: "Sunbeam Chikankari Set", slug: "sunbeam-chikankari-set",
    description: "Sun-kissed yellow chikankari kurta set with delicate threadwork. Light and breezy for everyday ethnic wear.",
    price: 999, salePrice: 849, craftType: "Chikankari", sizes: ["3Y", "4Y", "5Y"],
    images: [images[0]], stockStatus: "in_stock", category: "Sets",
  },
  {
    id: "5", name: "Teal Tide Chikankari Set", slug: "teal-tide-chikankari-set",
    description: "Deep teal chikankari set with intricate tepchi and bakhia stitches. A modern heirloom piece.",
    price: 1299, craftType: "Chikankari", sizes: ["2Y", "3Y", "4Y", "5Y"],
    images: [images[0]], stockStatus: "low_stock", category: "Sets",
  },
  {
    id: "6", name: "Olive Grove Tunic", slug: "olive-grove-tunic",
    description: "An olive green firan-style tunic with contrast border detailing. Comfortable and elegant for little ones.",
    price: 899, craftType: "Firan", sizes: ["2Y", "3Y", "4Y"],
    images: [images[2]], stockStatus: "in_stock", category: "Tunics",
  },
  {
    id: "7", name: "Marigold Firan", slug: "marigold-firan",
    description: "Bright marigold firan with traditional Kashmiri embroidery accents. A statement piece for festivals.",
    price: 1199, salePrice: 999, craftType: "Firan", sizes: ["2Y", "3Y", "4Y", "5Y"],
    images: [images[2]], stockStatus: "in_stock", category: "Tunics",
  },
  {
    id: "8", name: "Dawn Firan", slug: "dawn-firan",
    description: "Soft peach firan with minimalist hand embroidery. Understated elegance for daily ethnic wear.",
    price: 799, craftType: "Firan", sizes: ["3Y", "4Y", "5Y"],
    images: [images[2]], stockStatus: "in_stock", category: "Tunics",
  },
  {
    id: "9", name: "Blush Blossom Set", slug: "blush-blossom-set",
    description: "Dusty pink bandhani set with mirror work accents. A gorgeous blend of Rajasthani craft traditions.",
    price: 1399, craftType: "Bandhani", sizes: ["2Y", "3Y", "4Y", "5Y"],
    images: [images[1]], stockStatus: "in_stock", category: "Sets",
  },
  {
    id: "10", name: "Noor Contrast Tunic Set", slug: "noor-contrast-tunic-set",
    description: "Ivory and terracotta contrast tunic set with bandhani dupatta. A boutique favourite.",
    price: 1499, salePrice: 1299, craftType: "Bandhani", sizes: ["2Y", "3Y", "4Y"],
    images: [images[1]], stockStatus: "in_stock", category: "Sets",
  },
  {
    id: "11", name: "Meera Chikankari Set", slug: "meera-chikankari-set",
    description: "Classic white-on-white chikankari set with scalloped edges. Timeless Lucknowi craftsmanship.",
    price: 1199, craftType: "Chikankari", sizes: ["2Y", "3Y", "4Y", "5Y"],
    images: [images[0]], stockStatus: "in_stock", category: "Sets",
  },
  {
    id: "12", name: "Amber Firan Tunic", slug: "amber-firan-tunic",
    description: "Warm amber firan with silk thread embroidery along the neckline and hem.",
    price: 999, craftType: "Firan", sizes: ["2Y", "3Y", "4Y", "5Y"],
    images: [images[2]], stockStatus: "in_stock", category: "Tunics",
  },
  {
    id: "13", name: "Rosaline Firan", slug: "rosaline-firan",
    description: "Rose pink firan with delicate tilla work. A celebration of Kashmiri artisanship for little ones.",
    price: 1099, salePrice: 899, craftType: "Firan", sizes: ["3Y", "4Y", "5Y"],
    images: [images[2]], stockStatus: "in_stock", category: "Tunics",
  },
];
