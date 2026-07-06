import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');
  const requestId = searchParams.get('requestId');

  if (!fileId || !requestId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    // Verify the request ID is Approved
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from('scan_requests')
      .select('status')
      .eq('id', requestId)
      .single();

    if (requestError || !requestData) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 401 });
    }

    if (requestData.status !== 'Approved') {
      return NextResponse.json({ error: 'Request not approved' }, { status: 403 });
    }

    // Get the file path from public_files
    const { data: fileData, error: fileError } = await supabaseAdmin
      .from('public_files')
      .select('file_url')
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // file_url stores the internal storage path for confidential files
    const storagePath = fileData.file_url;

    // Generate a temporary signed URL from the confidential_documents bucket
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
      .storage
      .from('confidential_documents')
      .createSignedUrl(storagePath, 60);

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL Error:', signedUrlError);
      return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 });
    }

    // Redirect the user to the temporary signed URL
    return NextResponse.redirect(signedUrlData.signedUrl);
  } catch (err) {
    console.error('Download Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
