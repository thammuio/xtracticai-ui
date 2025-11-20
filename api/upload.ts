import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import { readFileSync } from 'fs';

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Upload request received');
    
    // Parse form data with formidable
    const form = formidable({});
    const [, files] = await form.parse(req);
    
    const fileArray = files.file;
    if (!fileArray || fileArray.length === 0) {
      console.log('No file provided in request');
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = fileArray[0];
    console.log('File received:', file.originalFilename, 'Size:', file.size);

    // Read file buffer
    const fileBuffer = readFileSync(file.filepath);

    // Get environment variables
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const directory = process.env.BLOB_STORAGE_DIRECTORY || 'pdfs';
    const storeId = process.env.BLOB_STORE_ID || 'store_ru1xAuQqi4bFrEKR';
    const baseUrl = process.env.BLOB_BASE_URL || 'https://ru1xauqqi4bfrekr.public.blob.vercel-storage.com';
    const region = process.env.BLOB_REGION || 'IAD1';
    
    console.log('Environment check - Token exists:', !!blobToken, 'Directory:', directory);
    
    if (!blobToken) {
      console.error('BLOB_READ_WRITE_TOKEN not found in environment');
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not configured' });
    }

    // Upload to Vercel Blob
    console.log('Uploading to Vercel Blob...');
    const blob = await put(`${directory}/${file.originalFilename}`, fileBuffer, {
      access: 'public',
      token: blobToken,
      contentType: file.mimetype || 'application/pdf',
    });

    console.log('Upload successful:', blob.url);

    return res.status(200).json({
      url: blob.url,
      filename: file.originalFilename,
      pathname: blob.pathname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      storeId: storeId,
      baseUrl: baseUrl,
      region: region,
      contentType: blob.contentType,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Upload failed', 
      message: error.message,
      details: error.toString()
    });
  }
}
