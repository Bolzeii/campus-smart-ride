export type UserRole = 'DRIVER' | 'PASSENGER';

export type RideType = 'GOING_TO_COLLEGE' | 'RETURNING_FROM_COLLEGE';

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export type RideStatus = 'ACTIVE' | 'CANCELLED';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  college: string;
  role: UserRole;
  created_at: string;
}

export interface PickupZone {
  id: string;
  name: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  plate_number: string;
  color: string | null;
  capacity: number;
  created_at: string;
}

export interface Ride {
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
}

export interface Booking {
  id: string;
  user_id: string;
  ride_id: string;
  seats_requested: number;
  status: BookingStatus;
  created_at: string;
}

export interface RideWithDetails extends Ride {
  pickup_zone: PickupZone | null;
  vehicle: Vehicle | null;
  driver: Profile | null;
  bookings: Booking[];
}

export interface BookingWithDetails extends Booking {
  ride: Ride | null;
}
