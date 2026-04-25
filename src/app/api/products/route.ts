import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth-guards';

export async function GET() {
  try {
    const products = await allQuery(
      `SELECT p.*, c.name_tr as category_name_tr, c.name_en as category_name_en, c.name_ar as category_name_ar
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.order_index ASC`
    );
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession();
    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json();
    const { 
      category_id, 
      name_tr, 
      name_en, 
      name_ar, 
      description_tr, 
      description_en, 
      description_ar, 
      price, 
      original_price,
      discount_percent,
      image_url,
      order_index 
    } = body;

    // Use logo.png as default if no image_url provided
    const finalImageUrl = image_url || '/uploads/logo.png';

    const result = await runQuery(
      `INSERT INTO products (category_id, name_tr, name_en, name_ar, description_tr, description_en, description_ar, price, original_price, discount_percent, image_url, is_published, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [category_id, name_tr, name_en, name_ar, description_tr, description_en, description_ar, price, original_price, discount_percent || 0, finalImageUrl, order_index || 0]
    );

    return NextResponse.json({ id: result.id, message: 'Product created successfully' });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
