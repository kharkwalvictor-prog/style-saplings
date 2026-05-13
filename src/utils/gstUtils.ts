/**
 * GST Calculation Utility
 * All prices on the site are INCLUSIVE of GST.
 * GST rate: 5% if price < 1000, 12% if price >= 1000
 * HSN 62099090 = children's garments, cotton, not knitted
 */

export const SELLER_STATE = "Delhi";

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export const STATE_CODES: Record<string, string> = {
  "Jammu and Kashmir": "01", "Himachal Pradesh": "02", "Punjab": "03",
  "Chandigarh": "04", "Uttarakhand": "05", "Haryana": "06", "Delhi": "07",
  "Rajasthan": "08", "Uttar Pradesh": "09", "Bihar": "10",
  "Sikkim": "11", "Arunachal Pradesh": "12", "Nagaland": "13",
  "Manipur": "14", "Mizoram": "15", "Tripura": "16", "Meghalaya": "17",
  "Assam": "18", "West Bengal": "19", "Jharkhand": "20",
  "Odisha": "21", "Chhattisgarh": "22", "Madhya Pradesh": "23",
  "Gujarat": "24", "Dadra and Nagar Haveli and Daman and Diu": "26",
  "Maharashtra": "27", "Andhra Pradesh": "37", "Karnataka": "29",
  "Goa": "30", "Lakshadweep": "31", "Kerala": "32", "Tamil Nadu": "33",
  "Puducherry": "34", "Andaman and Nicobar Islands": "35",
  "Telangana": "36", "Ladakh": "38",
};

export interface GSTResult {
  inclusivePrice: number;
  gstRate: number;
  gstAmount: number;
  basePrice: number;
  supplyType: "intra" | "inter";
  cgst: number;
  sgst: number;
  igst: number;
  hsnCode: string;
}

export const getGSTRate = (price: number): number => price < 1000 ? 5 : 12;

export const calculateGST = (
  inclusivePrice: number,
  customerState: string,
  hsnCode: string = "62099090"
): GSTResult => {
  const gstRate = getGSTRate(inclusivePrice);
  const basePrice = round2(inclusivePrice / (1 + gstRate / 100));
  const gstAmount = round2(inclusivePrice - basePrice);
  const isIntra = customerState.toLowerCase().trim() === SELLER_STATE.toLowerCase();
  const supplyType = isIntra ? "intra" : "inter";

  return {
    inclusivePrice,
    gstRate,
    gstAmount,
    basePrice,
    supplyType,
    cgst: isIntra ? round2(gstAmount / 2) : 0,
    sgst: isIntra ? round2(gstAmount / 2) : 0,
    igst: isIntra ? 0 : gstAmount,
    hsnCode,
  };
};

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export interface CartGSTSummary {
  subtotalExclGST: number;
  totalGST: number;
  gstByRate: { rate: number; hsn: string; taxable: number; cgst: number; sgst: number; igst: number; total: number }[];
  supplyType: "intra" | "inter";
  grandTotal: number;
}

export const calculateCartGST = (
  items: { price: number; quantity: number; hsnCode?: string }[],
  customerState: string,
  shipping: number
): CartGSTSummary => {
  const rateMap = new Map<number, { hsn: string; taxable: number; cgst: number; sgst: number; igst: number; total: number }>();
  let subtotalExclGST = 0;
  let totalGST = 0;
  let supplyType: "intra" | "inter" = "inter";

  items.forEach(item => {
    const gst = calculateGST(item.price * item.quantity, customerState, item.hsnCode || "62099090");
    supplyType = gst.supplyType;
    subtotalExclGST += gst.basePrice;
    totalGST += gst.gstAmount;

    const existing = rateMap.get(gst.gstRate);
    if (existing) {
      existing.taxable += gst.basePrice;
      existing.cgst += gst.cgst;
      existing.sgst += gst.sgst;
      existing.igst += gst.igst;
      existing.total += gst.inclusivePrice;
    } else {
      rateMap.set(gst.gstRate, {
        hsn: gst.hsnCode,
        taxable: gst.basePrice,
        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,
        total: gst.inclusivePrice,
      });
    }
  });

  const gstByRate = Array.from(rateMap.entries()).map(([rate, data]) => ({
    rate,
    hsn: data.hsn,
    taxable: round2(data.taxable),
    cgst: round2(data.cgst),
    sgst: round2(data.sgst),
    igst: round2(data.igst),
    total: round2(data.total),
  }));

  const grandTotal = round2(subtotalExclGST + totalGST + shipping);

  return {
    subtotalExclGST: round2(subtotalExclGST),
    totalGST: round2(totalGST),
    gstByRate,
    supplyType,
    grandTotal,
  };
};

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const validateGSTIN = (gstin: string): boolean => GSTIN_REGEX.test(gstin.toUpperCase().trim());

export const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = "Rupees " + convert(rupees);
  if (paise > 0) result += " and " + convert(paise) + " Paise";
  return result + " Only";
};
