import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth-guards';

export async function GET() {
  try {
    const categories = await allQuery(
      'SELECT * FROM categories ORDER BY order_index ASC'
    );
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession();
    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json();
    const { name_tr, name_en, name_ar, description_tr, description_en, description_ar, order_index } = body;

    // Ensure order_index is at least 1 (no 0 allowed)
    let targetOrderIndex = order_index || 1;
    if (targetOrderIndex < 1) {
      targetOrderIndex = 1;
    }

    // Check if there's already a category with the target order_index
    const existingCategory = await allQuery(
      'SELECT id FROM categories WHERE order_index = ?',
      [targetOrderIndex]
    );

    if (existingCategory.length > 0) {
      // Shift all categories with order_index >= targetOrderIndex up by 1
      await runQuery(
        `UPDATE categories 
         SET order_index = order_index + 1 
         WHERE order_index >= ?`,
        [targetOrderIndex]
      );
    }

    const result = await runQuery(
      `INSERT INTO categories (name_tr, name_en, name_ar, description_tr, description_en, description_ar, order_index, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [name_tr, name_en, name_ar, description_tr, description_en, description_ar, targetOrderIndex]
    );

    return NextResponse.json({ id: result.id, message: 'Category created successfully' });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
