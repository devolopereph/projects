import { NextRequest, NextResponse } from 'next/server';
import { runQuery, allQuery } from '@/lib/db';

interface VisitorSession {
  session_id: string;
  first_visit: string;
  last_visit: string;
  visit_count: number;
  user_agent: string;
  ip_address: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Session süresi kontrolü (2 saat = 7200000 ms)
    const sessionTimeout = 2 * 60 * 60 * 1000; // 2 saat
    const timeoutDate = new Date(Date.now() - sessionTimeout).toISOString();

    // Device fingerprint'i extract et (fp_ ile başlıyorsa)
    const deviceFingerprint = sessionId.startsWith('fp_') ? sessionId.split('_')[1] : null;

    let shouldCountVisit = false;
    let existingSession: VisitorSession[];

    if (deviceFingerprint) {
      // Device fingerprint varsa, aynı fingerprint'e sahip aktif session'ları kontrol et
      existingSession = await allQuery(
        'SELECT * FROM visitor_sessions WHERE session_id LIKE ? AND last_visit > ?',
        [`fp_${deviceFingerprint}%`, timeoutDate]
      ) as VisitorSession[];
    } else {
      // Normal session ID kontrolü
      existingSession = await allQuery(
        'SELECT * FROM visitor_sessions WHERE session_id = ? AND last_visit > ?',
        [sessionId, timeoutDate]
      ) as VisitorSession[];
    }

    if (existingSession.length === 0) {
      // Yeni session veya timeout olmuş session
      await runQuery(`
        INSERT OR REPLACE INTO visitor_sessions 
        (session_id, first_visit, last_visit, visit_count, user_agent, ip_address) 
        VALUES (?, ?, ?, 1, ?, ?)
      `, [sessionId, now, now, userAgent, ip]);
      
      shouldCountVisit = true;
    } else {
      // Mevcut session'ı güncelle (en son session'ı kullan)
      const latestSession = existingSession[0];
      await runQuery(`
        UPDATE visitor_sessions 
        SET last_visit = ?, visit_count = visit_count + 1 
        WHERE session_id = ?
      `, [now, latestSession.session_id]);
    }

    // Sadece yeni session veya timeout olmuş session için site_visits'i artır
    if (shouldCountVisit) {
      await runQuery(`
        INSERT OR REPLACE INTO site_visits (visit_date, visit_count) 
        VALUES (?, COALESCE((SELECT visit_count FROM site_visits WHERE visit_date = ?), 0) + 1)
      `, [today, today]);
    }

    return NextResponse.json({ 
      success: true, 
      counted: shouldCountVisit,
      message: shouldCountVisit ? 'New visit counted' : 'Session updated, visit not counted',
      sessionType: deviceFingerprint ? 'fingerprint' : 'standard'
    });
  } catch (error) {
    console.error('Visit tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track visit' },
      { status: 500 }
    );
  }
}