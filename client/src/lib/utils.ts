import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isSameDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

export function getDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Reset hours to avoid time zone issues
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // If the dates are the same, return 1 day
  if (isSameDay(start, end)) {
    return 1;
  }
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function calculateTotalPrice(pricePerNight: number, nights: number): number {
  return pricePerNight * nights;
}

export function calculateServiceFee(price: number): number {
  return Math.round(price * 0.1); // 10% service fee
}

export const getTimeSlots = (start: number, end: number, intervalMinutes: number = 30): string[] => {
  const slots: string[] = [];
  for (let hour = start; hour < end; hour++) {
    slots.push(`${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`);
    if (intervalMinutes === 30) {
      slots.push(`${hour % 12 || 12}:30 ${hour < 12 ? 'AM' : 'PM'}`);
    }
  }
  return slots;
};

export const generateAvailableTimeSlots = (
  serviceName: string,
  date?: Date
): string[] => {
  if (!date) return [];
  
  // Different services might have different hours
  if (serviceName.toLowerCase().includes('spa')) {
    return getTimeSlots(9, 20); // 9AM to 8PM
  } else if (serviceName.toLowerCase().includes('restaurant')) {
    // Restaurant hours vary by meal period
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    // Restaurant opens earlier and closes later on weekends
    return isWeekend ? getTimeSlots(7, 22) : getTimeSlots(8, 21);
  }
  
  // Default time slots
  return getTimeSlots(9, 18);
};
