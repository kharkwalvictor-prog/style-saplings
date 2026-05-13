export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      back_in_stock_requests: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_phone: string | null
          id: string
          notified: boolean | null
          notified_at: string | null
          product_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_phone?: string | null
          id?: string
          notified?: boolean | null
          notified_at?: string | null
          product_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_phone?: string | null
          id?: string
          notified?: boolean | null
          notified_at?: string | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "back_in_stock_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cod_otp: {
        Row: { attempts: number | null; created_at: string | null; expires_at: string; id: string; otp_hash: string; phone: string; verified: boolean | null }
        Insert: { attempts?: number | null; created_at?: string | null; expires_at: string; id?: string; otp_hash: string; phone: string; verified?: boolean | null }
        Update: { attempts?: number | null; created_at?: string | null; expires_at?: string; id?: string; otp_hash?: string; phone?: string; verified?: boolean | null }
        Relationships: []
      }
      customer_notes: {
        Row: { created_at: string; customer_email: string; id: string; note: string }
        Insert: { created_at?: string; customer_email: string; id?: string; note: string }
        Update: { created_at?: string; customer_email?: string; id?: string; note?: string }
        Relationships: []
      }
      customer_tags: {
        Row: { created_at: string; customer_email: string; id: string; is_auto: boolean; tag: string }
        Insert: { created_at?: string; customer_email: string; id?: string; is_auto?: boolean; tag: string }
        Update: { created_at?: string; customer_email?: string; id?: string; is_auto?: boolean; tag?: string }
        Relationships: []
      }
      discount_codes: {
        Row: { code: string; created_at: string | null; description: string | null; discount_type: string; discount_value: number; id: string; is_active: boolean | null; minimum_order_amount: number | null; usage_count: number | null; usage_limit: number | null; valid_from: string | null; valid_until: string | null }
        Insert: { code: string; created_at?: string | null; description?: string | null; discount_type: string; discount_value: number; id?: string; is_active?: boolean | null; minimum_order_amount?: number | null; usage_count?: number | null; usage_limit?: number | null; valid_from?: string | null; valid_until?: string | null }
        Update: { code?: string; created_at?: string | null; description?: string | null; discount_type?: string; discount_value?: number; id?: string; is_active?: boolean | null; minimum_order_amount?: number | null; usage_count?: number | null; usage_limit?: number | null; valid_from?: string | null; valid_until?: string | null }
        Relationships: []
      }
      email_log: {
        Row: { email_type: string; error_message: string | null; id: string; order_id: string | null; sent_at: string | null; sent_to: string; status: string }
        Insert: { email_type: string; error_message?: string | null; id?: string; order_id?: string | null; sent_at?: string | null; sent_to: string; status: string }
        Update: { email_type?: string; error_message?: string | null; id?: string; order_id?: string | null; sent_at?: string | null; sent_to?: string; status?: string }
        Relationships: [{ foreignKeyName: "email_log_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }]
      }
      gst_config: {
        Row: { address: string; created_at: string; effective_from: string; gstin: string; id: string; legal_name: string; state: string; state_code: string; trade_name: string; updated_at: string }
        Insert: { address: string; created_at?: string; effective_from?: string; gstin: string; id?: string; legal_name: string; state: string; state_code: string; trade_name: string; updated_at?: string }
        Update: { address?: string; created_at?: string; effective_from?: string; gstin?: string; id?: string; legal_name?: string; state?: string; state_code?: string; trade_name?: string; updated_at?: string }
        Relationships: []
      }
      invoice_sequence: {
        Row: { last_number: number; year_month: string }
        Insert: { last_number?: number; year_month: string }
        Update: { last_number?: number; year_month?: string }
        Relationships: []
      }
      invoices: {
        Row: { created_at: string | null; id: string; invoice_date: string; invoice_number: string; order_id: string | null; pdf_url: string | null }
        Insert: { created_at?: string | null; id?: string; invoice_date?: string; invoice_number: string; order_id?: string | null; pdf_url?: string | null }
        Update: { created_at?: string | null; id?: string; invoice_date?: string; invoice_number?: string; order_id?: string | null; pdf_url?: string | null }
        Relationships: [{ foreignKeyName: "invoices_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }]
      }
      order_notes: {
        Row: { created_at: string; id: string; note: string; order_id: string; updated_at: string }
        Insert: { created_at?: string; id?: string; note: string; order_id: string; updated_at?: string }
        Update: { created_at?: string; id?: string; note?: string; order_id?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "order_notes_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }]
      }
      order_rate_limits: {
        Row: { created_at: string | null; id: string; phone: string }
        Insert: { created_at?: string | null; id?: string; phone: string }
        Update: { created_at?: string | null; id?: string; phone?: string }
        Relationships: []
      }
      order_status_history: {
        Row: { changed_by: string | null; created_at: string; from_status: string | null; id: string; order_id: string; to_status: string }
        Insert: { changed_by?: string | null; created_at?: string; from_status?: string | null; id?: string; order_id: string; to_status: string }
        Update: { changed_by?: string | null; created_at?: string; from_status?: string | null; id?: string; order_id?: string; to_status?: string }
        Relationships: [{ foreignKeyName: "order_status_history_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }]
      }
      orders: {
        Row: { cancel_reason: string | null; confirmation_email_sent: boolean | null; created_at: string; customer_company_name: string | null; customer_email: string; customer_gstin: string | null; customer_name: string; customer_phone: string; discount_amount: number | null; discount_code: string | null; gst_breakdowns: Json | null; id: string; items: Json; order_number: string; order_status: Database["public"]["Enums"]["order_status"]; payment_method: Database["public"]["Enums"]["payment_method"]; payment_status: Database["public"]["Enums"]["payment_status"]; razorpay_order_id: string | null; shipping_address: Json; shipping_email_sent: boolean | null; supply_type: string | null; total_amount: number; tracking_number: string | null; updated_at: string }
        Insert: { cancel_reason?: string | null; confirmation_email_sent?: boolean | null; created_at?: string; customer_company_name?: string | null; customer_email: string; customer_gstin?: string | null; customer_name: string; customer_phone: string; discount_amount?: number | null; discount_code?: string | null; gst_breakdowns?: Json | null; id?: string; items?: Json; order_number: string; order_status?: Database["public"]["Enums"]["order_status"]; payment_method?: Database["public"]["Enums"]["payment_method"]; payment_status?: Database["public"]["Enums"]["payment_status"]; razorpay_order_id?: string | null; shipping_address?: Json; shipping_email_sent?: boolean | null; supply_type?: string | null; total_amount: number; tracking_number?: string | null; updated_at?: string }
        Update: { cancel_reason?: string | null; confirmation_email_sent?: boolean | null; created_at?: string; customer_company_name?: string | null; customer_email?: string; customer_gstin?: string | null; customer_name?: string; customer_phone?: string; discount_amount?: number | null; discount_code?: string | null; gst_breakdowns?: Json | null; id?: string; items?: Json; order_number?: string; order_status?: Database["public"]["Enums"]["order_status"]; payment_method?: Database["public"]["Enums"]["payment_method"]; payment_status?: Database["public"]["Enums"]["payment_status"]; razorpay_order_id?: string | null; shipping_address?: Json; shipping_email_sent?: boolean | null; supply_type?: string | null; total_amount?: number; tracking_number?: string | null; updated_at?: string }
        Relationships: []
      }
      product_reviews: {
        Row: { body: string | null; created_at: string | null; customer_email: string; customer_name: string; id: string; is_approved: boolean | null; is_featured: boolean | null; order_id: string | null; photo_url: string | null; product_id: string | null; rating: number; title: string | null }
        Insert: { body?: string | null; created_at?: string | null; customer_email: string; customer_name: string; id?: string; is_approved?: boolean | null; is_featured?: boolean | null; order_id?: string | null; photo_url?: string | null; product_id?: string | null; rating: number; title?: string | null }
        Update: { body?: string | null; created_at?: string | null; customer_email?: string; customer_name?: string; id?: string; is_approved?: boolean | null; is_featured?: boolean | null; order_id?: string | null; photo_url?: string | null; product_id?: string | null; rating?: number; title?: string | null }
        Relationships: [{ foreignKeyName: "product_reviews_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }, { foreignKeyName: "product_reviews_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] }]
      }
      products: {
        Row: { category: string | null; craft_type: Database["public"]["Enums"]["craft_type"]; created_at: string; description: string | null; hsn_code: string | null; id: string; images: string[]; is_featured: boolean; low_stock_threshold: number; name: string; price: number; sale_price: number | null; search_vector: unknown; sizes: string[]; slug: string; stock_count: number; stock_status: Database["public"]["Enums"]["stock_status"]; supplier_notes: string | null; updated_at: string }
        Insert: { category?: string | null; craft_type: Database["public"]["Enums"]["craft_type"]; created_at?: string; description?: string | null; hsn_code?: string | null; id?: string; images?: string[]; is_featured?: boolean; low_stock_threshold?: number; name: string; price: number; sale_price?: number | null; search_vector?: unknown; sizes?: string[]; slug: string; stock_count?: number; stock_status?: Database["public"]["Enums"]["stock_status"]; supplier_notes?: string | null; updated_at?: string }
        Update: { category?: string | null; craft_type?: Database["public"]["Enums"]["craft_type"]; created_at?: string; description?: string | null; hsn_code?: string | null; id?: string; images?: string[]; is_featured?: boolean; low_stock_threshold?: number; name?: string; price?: number; sale_price?: number | null; search_vector?: unknown; sizes?: string[]; slug?: string; stock_count?: number; stock_status?: Database["public"]["Enums"]["stock_status"]; supplier_notes?: string | null; updated_at?: string }
        Relationships: []
      }
      refund_requests: {
        Row: { admin_notes: string | null; created_at: string; customer_email: string; customer_name: string; customer_phone: string; description: string | null; id: string; images: string[] | null; order_id: string | null; order_number: string; reason: string; refund_amount: number | null; replacement_order_id: string | null; request_type: Database["public"]["Enums"]["refund_request_type"]; requested_at: string; resolved_at: string | null; status: Database["public"]["Enums"]["refund_status"]; updated_at: string }
        Insert: { admin_notes?: string | null; created_at?: string; customer_email: string; customer_name: string; customer_phone: string; description?: string | null; id?: string; images?: string[] | null; order_id?: string | null; order_number: string; reason: string; refund_amount?: number | null; replacement_order_id?: string | null; request_type?: Database["public"]["Enums"]["refund_request_type"]; requested_at?: string; resolved_at?: string | null; status?: Database["public"]["Enums"]["refund_status"]; updated_at?: string }
        Update: { admin_notes?: string | null; created_at?: string; customer_email?: string; customer_name?: string; customer_phone?: string; description?: string | null; id?: string; images?: string[] | null; order_id?: string | null; order_number?: string; reason?: string; refund_amount?: number | null; replacement_order_id?: string | null; request_type?: Database["public"]["Enums"]["refund_request_type"]; requested_at?: string; resolved_at?: string | null; status?: Database["public"]["Enums"]["refund_status"]; updated_at?: string }
        Relationships: [{ foreignKeyName: "refund_requests_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }, { foreignKeyName: "refund_requests_replacement_order_id_fkey"; columns: ["replacement_order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }]
      }
      restock_history: {
        Row: { created_at: string | null; id: string; new_count: number; old_count: number; product_id: string | null; product_name: string; updated_by: string | null }
        Insert: { created_at?: string | null; id?: string; new_count: number; old_count: number; product_id?: string | null; product_name: string; updated_by?: string | null }
        Update: { created_at?: string | null; id?: string; new_count?: number; old_count?: number; product_id?: string | null; product_name?: string; updated_by?: string | null }
        Relationships: [{ foreignKeyName: "restock_history_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] }]
      }
      site_content: {
        Row: { field_type: string; id: string; key: string; label: string | null; section: string; sort_order: number | null; updated_at: string; value: string }
        Insert: { field_type?: string; id?: string; key: string; label?: string | null; section?: string; sort_order?: number | null; updated_at?: string; value?: string }
        Update: { field_type?: string; id?: string; key?: string; label?: string | null; section?: string; sort_order?: number | null; updated_at?: string; value?: string }
        Relationships: []
      }
      user_roles: {
        Row: { id: string; role: Database["public"]["Enums"]["app_role"]; user_id: string }
        Insert: { id?: string; role: Database["public"]["Enums"]["app_role"]; user_id: string }
        Update: { id?: string; role?: Database["public"]["Enums"]["app_role"]; user_id?: string }
        Relationships: []
      }
      wishlists: {
        Row: { created_at: string | null; id: string; product_id: string | null; session_id: string }
        Insert: { created_at?: string | null; id?: string; product_id?: string | null; session_id: string }
        Update: { created_at?: string | null; id?: string; product_id?: string | null; session_id?: string }
        Relationships: [{ foreignKeyName: "wishlists_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] }]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_invoice_number: { Args: { p_year_month: string }; Returns: number }
      has_role: { Args: { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      craft_type: "Chikankari" | "Bandhani" | "Firan" | "Festive"
      order_status: "pending" | "processing" | "packed" | "shipped" | "delivered" | "cancelled"
      payment_method: "razorpay" | "cod"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      refund_request_type: "refund" | "exchange" | "return"
      refund_status: "pending" | "approved" | "rejected" | "processed"
      stock_status: "in_stock" | "low_stock" | "out_of_stock"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R } ? R : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R } ? R : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I } ? I : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I } ? I : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U } ? U : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U } ? U : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      craft_type: ["Chikankari", "Bandhani", "Firan", "Festive"],
      order_status: ["pending", "processing", "packed", "shipped", "delivered", "cancelled"],
      payment_method: ["razorpay", "cod"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      refund_request_type: ["refund", "exchange", "return"],
      refund_status: ["pending", "approved", "rejected", "processed"],
      stock_status: ["in_stock", "low_stock", "out_of_stock"],
    },
  },
} as const
