import type { RideType, BookingStatus, RideStatus, Ride, PickupZone, Vehicle, Profile, Booking } from '@/lib/types';

export interface FlatRideRow {
  id: string;
  user_id: string;
  ride_type: RideType;
  pickup_zone_id: string;
  destination: string;
  ride_date: string;
  ride_time: string;
  available_seats: number;
  vehicle_id: string;
  notes: string | null;
  status: RideStatus;
  created_at: string;
  pickup_zone?: PickupZone | null;
  vehicle?: Vehicle | null;
  driver?: Profile | null;
  bookings?: Booking[];
  passenger?: Profile | null;
}

export function toRideCardData(row: FlatRideRow) {
  const { id, user_id, ride_type, pickup_zone_id, destination, ride_date, ride_time, available_seats, vehicle_id, notes, status, created_at, ...rest } = row;
  return {
    ride: { id, user_id, ride_type, pickup_zone_id, destination, ride_date, ride_time, available_seats, vehicle_id, notes, status, created_at } as Ride,
    pickup_zone: rest.pickup_zone ?? null,
    vehicle: rest.vehicle ?? null,
    driver: rest.driver ?? null,
    bookings: rest.bookings ?? [],
  };
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m} ${period}`;
}

export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRideType(type: RideType): string {
  return type === 'GOING_TO_COLLEGE' ? 'Going to College' : 'Returning from College';
}

export function rideTypeIcon(type: RideType): string {
  return type === 'GOING_TO_COLLEGE' ? '→' : '←';
}

export function formatBookingStatus(status: BookingStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function formatRideStatus(status: RideStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function statusColor(status: BookingStatus | RideStatus): string {
  switch (status) {
    case 'ACCEPTED':
    case 'ACTIVE':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'PENDING':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'REJECTED':
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
