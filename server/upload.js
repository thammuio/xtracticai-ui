import express from 'express';
import multer from 'multer';
import { put } from '@vercel/blob';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

// Upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received');
    
    if (!req.file) {
      console.log('No file provided in request');
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size);

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
    const blob = await put(`${directory}/${req.file.originalname}`, req.file.buffer, {
      access: 'public',
      token: blobToken,
      contentType: req.file.mimetype,
    });

    console.log('Upload successful:', blob.url);

    res.json({
      url: blob.url,
      filename: req.file.originalname,
      pathname: blob.pathname,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      storeId: storeId,
      baseUrl: baseUrl,
      region: region,
      contentType: blob.contentType,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      message: error.message,
      details: error.toString()
    });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Upload server running on http://localhost:${PORT}`);
  console.log('Environment variables loaded:');
  console.log('- BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? '✓ Set' : '✗ Not set');
  console.log('- BLOB_STORAGE_DIRECTORY:', process.env.BLOB_STORAGE_DIRECTORY || 'pdfs (default)');
  console.log('- BLOB_STORE_ID:', process.env.BLOB_STORE_ID || 'store_ru1xAuQqi4bFrEKR (default)');
});
