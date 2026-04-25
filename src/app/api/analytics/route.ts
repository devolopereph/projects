import { NextRequest, NextResponse } from 'next/server';
import { allQuery } from '@/lib/db';
import { getDateRange } from '@/lib/utils';
import { requireAdminSession } from '@/lib/auth-guards';

interface AnalyticsResult {
  total: number;
}

interface ProductResult {
  name_tr: string;
  name_en: string;
  name_ar: string;
  views: number;
}

interface CategoryResult {
  name_tr: string;
  name_en: string;
  name_ar: string;
  views: number;
}

interface DailyStats {
  date: string;
  visits: number;
  product_views: number;
  unique_sessions: number;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminSession();
    if ('response' in auth) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    const { start, end } = getDateRange(period as 'today' | 'week' | 'month');

    // Site visits
    const siteVisits = await allQuery(
      'SELECT SUM(visit_count) as total FROM site_visits WHERE visit_date BETWEEN ? AND ?',
      [start, end]
    ) as AnalyticsResult[];

    // Unique sessions (aktif session sayısı)
    const uniqueSessions = await allQuery(
      'SELECT COUNT(DISTINCT session_id) as total FROM visitor_sessions WHERE DATE(first_visit) BETWEEN ? AND ?',
      [start, end]
    ) as AnalyticsResult[];

    // Session timeout kontrolü (2 saat)
    const sessionTimeout = 2 * 60 * 60 * 1000; // 2 saat
    const timeoutDate = new Date(Date.now() - sessionTimeout).toISOString();
    
    // Aktif session sayısı
    const activeSessions = await allQuery(
      'SELECT COUNT(*) as total FROM visitor_sessions WHERE last_visit > ?',
      [timeoutDate]
    ) as AnalyticsResult[];

    // Product views
    const productViews = await allQuery(
      'SELECT SUM(view_count) as total FROM product_views WHERE view_date BETWEEN ? AND ?',
      [start, end]
    ) as AnalyticsResult[];

    // Most viewed products
    const topProducts = await allQuery(
      `SELECT p.name_tr, p.name_en, p.name_ar, SUM(pv.view_count) as views
       FROM product_views pv
       JOIN products p ON pv.product_id = p.id
       WHERE pv.view_date BETWEEN ? AND ?
       GROUP BY pv.product_id
       ORDER BY views DESC
       LIMIT 10`,
      [start, end]
    ) as ProductResult[];

    // Most viewed categories
    const topCategories = await allQuery(
      `SELECT c.name_tr, c.name_en, c.name_ar, SUM(pv.view_count) as views
       FROM product_views pv
       JOIN products p ON pv.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       WHERE pv.view_date BETWEEN ? AND ?
       GROUP BY c.id
       ORDER BY views DESC
       LIMIT 10`,
      [start, end]
    ) as CategoryResult[];

    // Daily breakdown for charts
    const dailyStats = await allQuery(
      `SELECT 
         sv.visit_date as date,
         COALESCE(sv.visit_count, 0) as visits,
         COALESCE(pv.views, 0) as product_views,
         COALESCE(us.unique_sessions, 0) as unique_sessions
       FROM site_visits sv
       LEFT JOIN (
         SELECT view_date, SUM(view_count) as views
         FROM product_views
         GROUP BY view_date
       ) pv ON sv.visit_date = pv.view_date
       LEFT JOIN (
         SELECT DATE(first_visit) as session_date, COUNT(DISTINCT session_id) as unique_sessions
         FROM visitor_sessions
         GROUP BY DATE(first_visit)
       ) us ON sv.visit_date = us.session_date
       WHERE sv.visit_date BETWEEN ? AND ?
       ORDER BY sv.visit_date ASC`,
      [start, end]
    ) as DailyStats[];

    return NextResponse.json({
      period,
      totalVisits: siteVisits[0]?.total || 0,
      uniqueSessions: uniqueSessions[0]?.total || 0,
      activeSessions: activeSessions[0]?.total || 0,
      totalProductViews: productViews[0]?.total || 0,
      topProducts,
      topCategories,
      dailyStats
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
