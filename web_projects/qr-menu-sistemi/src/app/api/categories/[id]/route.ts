import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth-guards';

interface Category {
  id: number;
  name_tr: string;
  name_en: string;
  name_ar: string;
  description_tr?: string;
  description_en?: string;
  description_ar?: string;
  order_index: number;
  is_active: boolean;
}

interface CategoryOrderIndex {
  order_index: number;
}

interface ProductCount {
  count: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await getQuery(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    ) as Category | null;
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
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
    const { name_tr, name_en, name_ar, description_tr, description_en, description_ar, order_index, is_active } = body;

    // Ensure order_index is at least 1 (no 0 allowed)
    let targetOrderIndex = order_index;
    if (targetOrderIndex < 1) {
      targetOrderIndex = 1;
    }

    // Get current category to check if order_index is changing
    const currentCategory = await getQuery(
      'SELECT order_index FROM categories WHERE id = ?',
      [id]
    ) as CategoryOrderIndex | null;

    if (!currentCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // If order_index is changing, we need to handle the reordering
    if (currentCategory.order_index !== targetOrderIndex) {
      // Check if there's already a category with the target order_index
      const existingCategory = await getQuery(
        'SELECT id FROM categories WHERE order_index = ? AND id != ?',
        [targetOrderIndex, id]
      ) as { id: number } | null;

      if (existingCategory) {
        // If moving to a higher order_index, shift down categories between current and target
        if (targetOrderIndex > currentCategory.order_index) {
          await runQuery(
            `UPDATE categories 
             SET order_index = order_index - 1 
             WHERE order_index > ? AND order_index <= ? AND id != ?`,
            [currentCategory.order_index, targetOrderIndex, id]
          );
        } 
        // If moving to a lower order_index, shift up categories between target and current
        else {
          await runQuery(
            `UPDATE categories 
             SET order_index = order_index + 1 
             WHERE order_index >= ? AND order_index < ? AND id != ?`,
            [targetOrderIndex, currentCategory.order_index, id]
          );
        }
      }
    }

    // Update the category
    await runQuery(
      `UPDATE categories 
       SET name_tr = ?, name_en = ?, name_ar = ?, description_tr = ?, description_en = ?, description_ar = ?, order_index = ?, is_active = ?
       WHERE id = ?`,
      [name_tr, name_en, name_ar, description_tr, description_en, description_ar, targetOrderIndex, is_active ? 1 : 0, id]
    );

    return NextResponse.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
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
    // Check if category has products
    const products = await getQuery(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id]
    ) as ProductCount;

    if (products.count > 0) {
      return NextResponse.json({ error: 'Bu kategoride ürünler bulunuyor, kategoriyi silemezsiniz' }, { status: 400 });
    }

    // Get the order_index of the category being deleted
    const categoryToDelete = await getQuery(
      'SELECT order_index FROM categories WHERE id = ?',
      [id]
    ) as CategoryOrderIndex | null;

    if (!categoryToDelete) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Delete the category
    await runQuery('DELETE FROM categories WHERE id = ?', [id]);

    // Shift down all categories with order_index > deleted category's order_index
    await runQuery(
      `UPDATE categories 
       SET order_index = order_index - 1 
       WHERE order_index > ?`,
      [categoryToDelete.order_index]
    );

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
