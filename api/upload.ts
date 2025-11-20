import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('Upload request received');
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log('No file provided in request');
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('File received:', file.name, 'Size:', file.size);

    // Get environment variables
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const directory = process.env.BLOB_STORAGE_DIRECTORY || 'pdfs';
    const storeId = process.env.BLOB_STORE_ID || 'store_ru1xAuQqi4bFrEKR';
    const baseUrl = process.env.BLOB_BASE_URL || 'https://ru1xauqqi4bfrekr.public.blob.vercel-storage.com';
    const region = process.env.BLOB_REGION || 'IAD1';
    
    console.log('Environment check - Token exists:', !!blobToken, 'Directory:', directory);
    
    if (!blobToken) {
      console.error('BLOB_READ_WRITE_TOKEN not found in environment');
      return new Response(JSON.stringify({ error: 'BLOB_READ_WRITE_TOKEN not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Upload to Vercel Blob in configured directory
    console.log('Uploading to Vercel Blob...');
    const blob = await put(`${directory}/${file.name}`, file, {
      access: 'public',
      token: blobToken,
    });

    console.log('Upload successful:', blob.url);

    return new Response(JSON.stringify({
      url: blob.url,
      filename: file.name,
      pathname: blob.pathname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      storeId: storeId,
      baseUrl: baseUrl,
      region: region,
      contentType: blob.contentType,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
