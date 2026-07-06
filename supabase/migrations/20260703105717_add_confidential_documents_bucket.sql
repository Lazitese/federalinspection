INSERT INTO storage.buckets (id, name, public) 
VALUES ('confidential_documents', 'confidential_documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated admins to insert into confidential_documents"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'confidential_documents');

CREATE POLICY "Allow authenticated admins to select from confidential_documents"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'confidential_documents');

CREATE POLICY "Allow authenticated admins to update confidential_documents"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'confidential_documents');

CREATE POLICY "Allow authenticated admins to delete confidential_documents"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'confidential_documents');
