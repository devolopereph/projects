import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePath = resolvedParams.path.join('/');
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    const fullPath = path.resolve(uploadsDir, filePath);

    if (fullPath === uploadsDir || !fullPath.startsWith(`${uploadsDir}${path.sep}`)) {
      return new NextResponse('Invalid file path', { status: 400 });
    }
    
    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return new NextResponse('File not found', { status: 404 });
    }

    // Read file
    const fileBuffer = await fs.readFile(fullPath);
    
    // Get file extension to determine content type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving upload file:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
