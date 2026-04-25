import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function getLocalizedText(
  item: Record<string, unknown>,
  field: string,
  language: string = 'tr'
): string {
  const key = `${field}_${language}`;
  return (item[key] as string) || (item[`${field}_tr`] as string) || (item[field] as string) || '';
}

export function calculateDiscountedPrice(originalPrice: number, discountPercent: number): number {
  return originalPrice - (originalPrice * discountPercent / 100);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function getDateRange(period: 'today' | 'week' | 'month'): { start: string; end: string } {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  switch (period) {
    case 'today':
      return { start: today, end: today };
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: weekAgo.toISOString().split('T')[0], end: today };
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: monthAgo.toISOString().split('T')[0], end: today };
    default:
      return { start: today, end: today };
  }
}