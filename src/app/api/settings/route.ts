import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth-guards';

// Type definitions for settings
interface SettingRow {
  key: string;
  value_tr: string;
  value_en: string;
  value_ar: string;
}

interface SettingsObject {
  [key: string]: string;
}

interface GroupedSettingValues {
  value_tr?: string;
  value_en?: string;
  value_ar?: string;
}

interface GroupedSettings {
  [baseKey: string]: GroupedSettingValues;
}

export async function GET() {
  try {
    const settings = await allQuery('SELECT * FROM settings') as SettingRow[];
    const singleValueFields = ['cafe_logo_url', 'cafe_phone', 'cafe_email', 'cafe_website'];
    
    const settingsObj: SettingsObject = settings.reduce((acc, setting) => {
      const baseKey = setting.key;
      
      // Special handling for single-value fields
      if (singleValueFields.includes(baseKey)) {
        acc[baseKey] = setting.value_tr || '';
      } else if (baseKey.startsWith('working_hours')) {
        // working_hours_tr, working_hours_en, working_hours_ar are stored as separate keys
        acc[baseKey] = setting.value_tr || '';
      } else {
        // Multi-language fields
        acc[`${baseKey}_tr`] = setting.value_tr || '';
        acc[`${baseKey}_en`] = setting.value_en || '';
        acc[`${baseKey}_ar`] = setting.value_ar || '';
      }
      return acc;
    }, {} as SettingsObject);
    
    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminSession();
    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json();
    
    // Handle single-value fields separately
    const singleValueFields = ['cafe_logo_url', 'cafe_phone', 'cafe_email', 'cafe_website'];
    const workingHoursFields = ['working_hours_tr', 'working_hours_en', 'working_hours_ar'];
    
    // Process single-value fields
    for (const fieldName of singleValueFields) {
      if (body[fieldName] !== undefined) {
        await runQuery(
          'INSERT OR REPLACE INTO settings (key, value_tr, value_en, value_ar) VALUES (?, ?, ?, ?)',
          [fieldName, body[fieldName], '', '']
        );
      }
    }
    
    // Process working hours fields
    for (const fieldName of workingHoursFields) {
      if (body[fieldName] !== undefined) {
        await runQuery(
          'INSERT OR REPLACE INTO settings (key, value_tr, value_en, value_ar) VALUES (?, ?, ?, ?)',
          [fieldName, body[fieldName], '', '']
        );
      }
    }
    
    // Group multi-language settings by base key (cafe_name, cafe_description, etc.)
    const groupedSettings: GroupedSettings = {};
    
    for (const [fieldName, value] of Object.entries(body)) {
      // Skip single-value and working hours fields
      if (singleValueFields.includes(fieldName) || workingHoursFields.includes(fieldName)) {
        continue;
      }
      
      const parts = fieldName.split('_');
      const language = parts[parts.length - 1]; // tr, en, ar
      const baseKey = parts.slice(0, -1).join('_'); // cafe_name, cafe_description, etc.
      
      if (!groupedSettings[baseKey]) {
        groupedSettings[baseKey] = {};
      }
      groupedSettings[baseKey][`value_${language}` as keyof GroupedSettingValues] = value as string;
    }
    
    // Update each multi-language setting
    for (const [baseKey, values] of Object.entries(groupedSettings)) {
      const { value_tr = '', value_en = '', value_ar = '' } = values;
      
      await runQuery(
        'INSERT OR REPLACE INTO settings (key, value_tr, value_en, value_ar) VALUES (?, ?, ?, ?)',
        [baseKey, value_tr, value_en, value_ar]
      );
    }

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
