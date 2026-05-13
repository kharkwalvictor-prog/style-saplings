
-- Create private invoices storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false);

-- RLS: Admin can read invoice files
CREATE POLICY "Admins can read invoices"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));

-- RLS: Service role inserts (no policy needed, service role bypasses RLS)
-- Block public insert/update/delete
CREATE POLICY "Block public insert on invoices"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));
