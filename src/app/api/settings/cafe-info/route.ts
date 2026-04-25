import { NextResponse } from 'next/server';
import { allQuery } from '@/lib/db';

interface Setting {
  key: string;
  value_tr: string;
  value_en: string;
  value_ar: string;
}

export async function GET() {
  try {
    const settings = await allQuery(`
      SELECT key, value_tr, value_en, value_ar 
      FROM settings 
      WHERE key LIKE 'cafe_%' OR key LIKE 'working_hours%'
    `) as Setting[];

    // Convert to the format expected by the customer menu page
    const cafeInfo: Record<string, string> = {};
    
    settings.forEach((setting: Setting) => {
      const key = setting.key;
      
      if (key === 'cafe_name') {
        cafeInfo.name_tr = setting.value_tr || '';
        cafeInfo.name_en = setting.value_en || '';
        cafeInfo.name_ar = setting.value_ar || '';
      } else if (key === 'cafe_description') {
        cafeInfo.description_tr = setting.value_tr || '';
        cafeInfo.description_en = setting.value_en || '';
        cafeInfo.description_ar = setting.value_ar || '';
      } else if (key === 'cafe_address') {
        cafeInfo.address_tr = setting.value_tr || '';
        cafeInfo.address_en = setting.value_en || '';
        cafeInfo.address_ar = setting.value_ar || '';
      } else if (key === 'cafe_phone') {
        cafeInfo.phone = setting.value_tr || setting.value_en || setting.value_ar || '';
      } else if (key === 'cafe_email') {
        cafeInfo.email = setting.value_tr || setting.value_en || setting.value_ar || '';
      } else if (key === 'cafe_website') {
        cafeInfo.website = setting.value_tr || setting.value_en || setting.value_ar || '';
      } else if (key === 'cafe_logo_url') {
        cafeInfo.cafe_logo_url = setting.value_tr || setting.value_en || setting.value_ar || '';
      } else if (key.startsWith('working_hours')) {
        // Handle working hours separately
        cafeInfo[key] = setting.value_tr || setting.value_en || setting.value_ar || '';
      }
    });

    return NextResponse.json(cafeInfo);
  } catch (error) {
    console.error('Cafe info fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cafe info' },
      { status: 500 }
    );
  }
}