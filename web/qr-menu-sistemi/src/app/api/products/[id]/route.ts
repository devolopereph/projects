import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth-guards';
import { decrementImageUsage, isLogoImage } from '@/lib/image-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getQuery(
      `SELECT p.*, c.name_tr as category_name_tr, c.name_en as category_name_en, c.name_ar as category_name_ar
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession();
    if ('response' in auth) {
      return auth.response;
    }

    const { id } = await params;
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
      is_published,
      order_index,
      oldImageUrl
    } = body;

    // If image URL changed and old image exists, decrement usage count
    if (oldImageUrl && oldImageUrl !== image_url && !isLogoImage(oldImageUrl)) {
      await decrementImageUsage(oldImageUrl);
    }

    // Convert boolean to integer for SQLite compatibility
    const is_published_int = is_published ? 1 : 0;

    await runQuery(
      `UPDATE products 
       SET category_id = ?, name_tr = ?, name_en = ?, name_ar = ?, description_tr = ?, description_en = ?, description_ar = ?, 
           price = ?, original_price = ?, discount_percent = ?, image_url = ?, is_published = ?, order_index = ?
       WHERE id = ?`,
      [category_id, name_tr, name_en, name_ar, description_tr, description_en, description_ar, price, original_price, discount_percent, image_url, is_published_int, order_index, id]
    );

    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession();
    if ('response' in auth) {
      return auth.response;
    }

    const { id } = await params;
    
    // Get the image URL before deleting the product
    let imageUrl = '';
    try {
      const body = await request.json();
      imageUrl = body.imageUrl || '';
    } catch {
      // If no body provided, fetch the image URL from database
      const product = await getQuery('SELECT image_url FROM products WHERE id = ?', [id]) as { image_url?: string } | null;
      imageUrl = product?.image_url || '';
    }
    
    // First delete related records to avoid foreign key constraint errors
    await runQuery('DELETE FROM daily_menu WHERE product_id = ?', [id]);
    await runQuery('DELETE FROM product_views WHERE product_id = ?', [id]);
    
    // Then delete the product
    await runQuery('DELETE FROM products WHERE id = ?', [id]);
    
    // Finally decrement image usage count (will auto-delete if unused)
    if (imageUrl && !isLogoImage(imageUrl)) {
      await decrementImageUsage(imageUrl);
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
