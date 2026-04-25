import { NextRequest, NextResponse } from 'next/server';
import { runQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Bugünkü ürün görüntüleme sayısını artır veya yeni kayıt oluştur
    await runQuery(`
      INSERT OR REPLACE INTO product_views (product_id, view_date, view_count) 
      VALUES (?, ?, COALESCE((SELECT view_count FROM product_views WHERE product_id = ? AND view_date = ?), 0) + 1)
    `, [productId, today, productId, today]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product view tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track product view' },
      { status: 500 }
    );
  }
}