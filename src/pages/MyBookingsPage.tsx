import { useEffect, useState, useCallback } from 'react';
import { Calendar, ArrowRight, ArrowLeft, MapPin, Clock, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { PageContainer, PageHeader, Spinner, EmptyState, ErrorState, StatusBadge } from '@/components/ui';
import { formatTime, formatDate, formatRideType } from '@/lib/utils';
import type { Booking, Ride, PickupZone, Vehicle } from '@/lib/types';

interface BookingWithRide extends Booking {
  ride: Ride & { pickup_zone: PickupZone | null; vehicle: Vehicle | null };
}

export function MyBookingsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingWithRide[]>([]);

  const loadBookings = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        ride:rides(
          *,
          pickup_zone:pickup_zones(*),
          vehicle:vehicles(*)
        )
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError('Failed to load your bookings.');
      setLoading(false);
      return;
    }

    setBookings((data || []) as unknown as BookingWithRide[]);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function handleCancel(bookingId: string) {
    if (!confirm('Cancel this booking?')) return;
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', bookingId);
    if (error) {
      setError('Failed to cancel booking.');
      return;
    }
    await loadBookings();
  }

  if (loading) return <PageContainer><Spinner /></PageContainer>;
  if (error) return <PageContainer><ErrorState message={error} onRetry={loadBookings} /></PageContainer>;

  const active = bookings.filter((b) => b.status === 'PENDING' || b.status === 'ACCEPTED');
  const past = bookings.filter((b) => b.status === 'REJECTED' || b.status === 'CANCELLED');

  return (
    <PageContainer>
      <PageHeader
        title="My Bookings"
        subtitle="Rides you have requested as a passenger."
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-8 w-8 text-slate-300" />}
          title="No bookings yet"
          message="Search for a ride to college or back home to get started."
          action={
            <button
              onClick={() => onNavigate('/find-ride')}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              <Search className="h-4 w-4" />
              Find a Ride
            </button>
          }
        />
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                Active Bookings ({active.length})
              </h2>
              <div className="space-y-3">
                {active.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onNavigate={onNavigate}
                    onCancel={() => handleCancel(b.id)}
                  />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
                Past Bookings ({past.length})
              </h2>
              <div className="space-y-3 opacity-70">
                {past.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}

function BookingCard({
  booking,
  onNavigate,
  onCancel,
}: {
  booking: BookingWithRide;
  onNavigate: (path: string) => void;
  onCancel?: () => void;
}) {
  const ride = booking.ride;
  if (!ride) return null;
  const isGoing = ride.ride_type === 'GOING_TO_COLLEGE';
  const canCancel = onCancel && (booking.status === 'PENDING' || booking.status === 'ACCEPTED');

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${isGoing ? 'bg-sky-50 text-sky-600' : 'bg-teal-50 text-teal-600'}`}>
          {isGoing ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">{formatRideType(ride.ride_type)}</span>
            <StatusBadge status={booking.status} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {ride.pickup_zone?.name || '—'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(ride.ride_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(ride.ride_time)}
            </span>
            <span>{booking.seats_requested} seat(s)</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => onNavigate(`/ride/${ride.id}`)}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            View Ride
          </button>
          {canCancel && (
            <button
              onClick={onCancel}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
