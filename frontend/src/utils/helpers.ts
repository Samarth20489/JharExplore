import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export const CATEGORIES = [
  { value: 'waterfall', label: 'Waterfalls', icon: '💧' },
  { value: 'heritage', label: 'Heritage', icon: '🏛️' },
  { value: 'forest', label: 'Forests', icon: '🌳' },
  { value: 'wildlife', label: 'Wildlife', icon: '🐅' },
  { value: 'tribal_culture', label: 'Tribal Culture', icon: '🎭' },
  { value: 'religious', label: 'Religious', icon: '🛕' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'lake', label: 'Lakes', icon: '🏞️' },
  { value: 'hill_station', label: 'Hill Stations', icon: '⛰️' },
];
