import { NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth-guards';

interface CategoryOrderInfo {
  id: number;
  order_index: number;
}

export async function POST() {
  try {
    const auth = await requireAdminSession();
    if ('response' in auth) {
      return auth.response;
    }

    // Get all categories ordered by current order_index, then by id
    const categories = await allQuery(
      'SELECT id, order_index FROM categories ORDER BY order_index ASC, id ASC'
    ) as CategoryOrderInfo[];

    if (categories.length === 0) {
      return NextResponse.json({ message: 'No categories found' });
    }

    // Update each category with a proper order_index starting from 1
    for (let i = 0; i < categories.length; i++) {
      const newOrderIndex = i + 1;
      await runQuery(
        'UPDATE categories SET order_index = ? WHERE id = ?',
        [newOrderIndex, categories[i].id]
      );
    }

    return NextResponse.json({ 
      message: 'Category order fixed successfully',
      updatedCount: categories.length 
    });

  } catch (error) {
    console.error('Error fixing category order:', error);
    return NextResponse.json({ error: 'Failed to fix category order' }, { status: 500 });
  }
}
