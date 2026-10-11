import { MapPin, Clock, Calendar, Users, Car, User, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Ride, PickupZone, Vehicle, Profile, Booking } from '@/lib/types';
import { formatTime, formatDate, formatRideType } from '@/lib/utils';
import { StatusBadge } from '@/components/ui';

export interface RideCardData {
  ride: Ride;
  pickup_zone: PickupZone | null;
  vehicle: Vehicle | null;
  driver: Profile | null;
  bookings: Booking[];
}

export function RideCard({
  data,
  onClick,
  showDriver = true,
}: {
  data: RideCardData;
  onClick: () => void;
  showDriver?: boolean;
}) {
  const { ride, pickup_zone, vehicle, driver, bookings } = data;
  const acceptedBookings = bookings.filter((b) => b.status === 'ACCEPTED');
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const isGoing = ride.ride_type === 'GOING_TO_COLLEGE';

  return (
    <button
      onClick={onClick}
      className="group w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-sky-300 hover:shadow-md"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            isGoing ? 'bg-sky-100 text-sky-600' : 'bg-teal-100 text-teal-600'
          }`}
        >
          {isGoing ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <span className="text-sm font-semibold text-slate-800">{formatRideType(ride.ride_type)}</span>
          <span className="ml-2 text-xs text-slate-400">{ride.destination}</span>
        </div>
        <StatusBadge status={ride.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 px-5 py-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Pickup Zone
              </span>
              <span className="text-sm font-semibold text-slate-800">{pickup_zone?.name || '—'}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Date
              </span>
              <span className="text-sm font-semibold text-slate-800">{formatDate(ride.ride_date)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Time
              </span>
              <span className="text-sm font-semibold text-slate-800">{formatTime(ride.ride_time)}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Seats Available
              </span>
              <span className="text-sm font-semibold text-slate-800">{ride.available_seats}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {showDriver && driver && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {driver.full_name}
            </span>
          )}
          {vehicle && (
            <span className="flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5" />
              {vehicle.make} {vehicle.model}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          {pendingBookings.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
              {pendingBookings.length} pending
            </span>
          )}
          {acceptedBookings.length > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
              {acceptedBookings.length} confirmed
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
