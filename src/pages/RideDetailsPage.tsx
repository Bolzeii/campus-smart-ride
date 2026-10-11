import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Clock, Calendar, Users, Car, User, FileText, Check, X, Edit, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { PageContainer, Spinner, ErrorState, StatusBadge, EmptyState } from '@/components/ui';
import { formatTime, formatDate, formatRideType, todayISO, toRideCardData } from '@/lib/utils';
import type { Ride, PickupZone, Vehicle, Profile, Booking, RideType } from '@/lib/types';

interface RideDetails {
  ride: Ride;
  pickup_zone: PickupZone | null;
  vehicle: Vehicle | null;
  driver: Profile | null;
  bookings: (Booking & { passenger: Profile | null })[];
}

export function RideDetailsPage({
  rideId,
  onNavigate,
}: {
  rideId: string;
  onNavigate: (path: string) => void;
}) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RideDetails | null>(null);
  const [editing, setEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Booking form
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Edit form
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editSeats, setEditSeats] = useState(1);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'CANCELLED'>('ACTIVE');

  const loadRide = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: rideData, error: rideError } = await supabase
      .from('rides')
      .select(`
        *,
        pickup_zone:pickup_zones(*),
        vehicle:vehicles(*),
        driver:profiles!rides_user_id_profiles_fkey(*),
        bookings(*, passenger:profiles!bookings_user_id_profiles_fkey(*))
      `)
      .eq('id', rideId)
      .maybeSingle();

    if (rideError || !rideData) {
      setError('Ride not found or you do not have permission to view it.');
      setLoading(false);
      return;
    }

    const flat = rideData as unknown as any;
    const cardData = toRideCardData(flat);
    const details: RideDetails = {
      ride: cardData.ride,
      pickup_zone: cardData.pickup_zone,
      vehicle: cardData.vehicle,
      driver: cardData.driver,
      bookings: (flat.bookings || []).map((b: any) => ({
        ...b,
        passenger: b.passenger ?? null,
      })),
    };
    setData(details);
    setEditDate(details.ride.ride_date);
    setEditTime(details.ride.ride_time);
    setEditSeats(details.ride.available_seats);
    setEditNotes(details.ride.notes || '');
    setEditStatus(details.ride.status);
    setLoading(false);
  }, [rideId]);

  useEffect(() => {
    loadRide();
  }, [loadRide]);

  const isOwner = profile?.id === data?.ride.user_id;
  const isDriver = profile?.role === 'DRIVER';
  const myBooking = data?.bookings.find((b) => b.user_id === profile?.id);

  async function handleRequestSeats() {
    if (!profile || !data) return;
    setBookingError(null);

    if (seatsRequested < 1) {
      setBookingError('You must request at least 1 seat.');
      return;
    }
    if (seatsRequested > data.ride.available_seats) {
      setBookingError(`Only ${data.ride.available_seats} seat(s) available.`);
      return;
    }
    if (isDriver) {
      setBookingError('Drivers cannot book rides. Switch to a passenger account.');
      return;
    }

    setBookingSubmitting(true);
    const { error } = await supabase.from('bookings').insert({
      user_id: profile.id,
      ride_id: rideId,
      seats_requested: seatsRequested,
      status: 'PENDING',
    });

    setBookingSubmitting(false);

    if (error) {
      setBookingError(error.message);
      return;
    }

    await loadRide();
  }

  async function handleCancelBooking() {
    if (!myBooking) return;
    setActionLoading(true);
    setActionError(null);

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', myBooking.id);

    setActionLoading(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    await loadRide();
  }

  async function handleAcceptBooking(bookingId: string, seats: number) {
    if (!data) return;
    setActionLoading(true);
    setActionError(null);

    const acceptedCount = data.bookings.filter((b) => b.status === 'ACCEPTED').reduce((sum, b) => sum + b.seats_requested, 0);
    if (acceptedCount + seats > data.ride.available_seats) {
      setActionError('Not enough seats available to accept this request.');
      setActionLoading(false);
      return;
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'ACCEPTED' })
      .eq('id', bookingId);

    setActionLoading(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    await loadRide();
  }

  async function handleRejectBooking(bookingId: string) {
    setActionLoading(true);
    setActionError(null);

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'REJECTED' })
      .eq('id', bookingId);

    setActionLoading(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    await loadRide();
  }

  async function handleSaveEdit() {
    if (!data) return;
    setActionLoading(true);
    setActionError(null);

    const acceptedBookings = data.bookings.filter((b) => b.status === 'ACCEPTED');
    const acceptedSeats = acceptedBookings.reduce((sum, b) => sum + b.seats_requested, 0);
    if (editSeats < acceptedSeats) {
      setActionError(`Cannot reduce seats below ${acceptedSeats} (already accepted bookings).`);
      setActionLoading(false);
      return;
    }

    const { error } = await supabase
      .from('rides')
      .update({
        ride_date: editDate,
        ride_time: editTime,
        available_seats: editSeats,
        notes: editNotes || null,
        status: editStatus,
      })
      .eq('id', rideId);

    setActionLoading(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setEditing(false);
    await loadRide();
  }

  async function handleCancelRide() {
    if (!data) return;
    if (!confirm('Are you sure you want to cancel this ride? All bookings will be affected.')) return;

    setActionLoading(true);
    setActionError(null);

    const { error } = await supabase
      .from('rides')
      .update({ status: 'CANCELLED' })
      .eq('id', rideId);

    setActionLoading(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    await loadRide();
  }

  if (loading) return <PageContainer><Spinner /></PageContainer>;
  if (error) return <PageContainer><ErrorState message={error} onRetry={() => onNavigate('/find-ride')} /></PageContainer>;
  if (!data) return null;

  const { ride, pickup_zone, vehicle, driver, bookings } = data;
  const isGoing = ride.ride_type === 'GOING_TO_COLLEGE';
  const acceptedBookings = bookings.filter((b) => b.status === 'ACCEPTED');
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const acceptedSeats = acceptedBookings.reduce((sum, b) => sum + b.seats_requested, 0);

  return (
    <PageContainer>
      <button
        onClick={() => onNavigate(isOwner ? '/my-rides' : '/find-ride')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {actionError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {actionError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ride info */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className={`flex items-center gap-3 px-6 py-4 ${isGoing ? 'bg-sky-50' : 'bg-teal-50'}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isGoing ? 'bg-sky-100 text-sky-600' : 'bg-teal-100 text-teal-600'}`}>
                {isGoing ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-slate-900">{formatRideType(ride.ride_type)}</h1>
                <p className="text-sm text-slate-500">{ride.destination}</p>
              </div>
              <StatusBadge status={ride.status} />
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 px-6 py-5">
              <DetailRow icon={<MapPin className="h-4 w-4" />} label="Pickup Zone" value={pickup_zone?.name || '—'} />
              <DetailRow icon={<Calendar className="h-4 w-4" />} label="Date" value={formatDate(ride.ride_date)} />
              <DetailRow icon={<Clock className="h-4 w-4" />} label="Departure Time" value={formatTime(ride.ride_time)} />
              <DetailRow icon={<Users className="h-4 w-4" />} label="Seats Available" value={`${ride.available_seats - acceptedSeats} of ${ride.available_seats}`} />
              {vehicle && (
                <DetailRow icon={<Car className="h-4 w-4" />} label="Vehicle" value={`${vehicle.make} ${vehicle.model}`} />
              )}
              {vehicle && (
                <DetailRow icon={<FileText className="h-4 w-4" />} label="Plate" value={vehicle.plate_number} />
              )}
              {driver && (
                <DetailRow icon={<User className="h-4 w-4" />} label="Driver" value={driver.full_name} />
              )}
              {vehicle?.color && (
                <DetailRow icon={<Car className="h-4 w-4" />} label="Color" value={vehicle.color} />
              )}
            </div>

            {/* Notes */}
            {ride.notes && (
              <div className="border-t border-slate-100 px-6 py-4">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</span>
                <p className="text-sm text-slate-600">{ride.notes}</p>
              </div>
            )}

            {/* Driver actions */}
            {isOwner && !editing && ride.status === 'ACTIVE' && (
              <div className="flex gap-2 border-t border-slate-100 px-6 py-4">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={handleCancelRide}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Cancel Ride
                </button>
              </div>
            )}

            {/* Edit form */}
            {isOwner && editing && (
              <div className="border-t border-slate-100 px-6 py-4">
                <h3 className="mb-4 text-sm font-bold text-slate-800">Edit Ride</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Date</label>
                    <input
                      type="date"
                      min={todayISO()}
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Time</label>
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Available Seats</label>
                    <input
                      type="number"
                      min={acceptedSeats}
                      value={editSeats}
                      onChange={(e) => setEditSeats(parseInt(e.target.value, 10) || 0)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as 'ACTIVE' | 'CANCELLED')}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={actionLoading}
                    className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
                  >
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: booking or passenger requests */}
        <div className="space-y-4">
          {/* Passenger booking panel */}
          {!isOwner && ride.status === 'ACTIVE' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Request a Seat</h3>

              {bookingError && (
                <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  {bookingError}
                </div>
              )}

              {myBooking ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">Your Request</span>
                      <StatusBadge status={myBooking.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {myBooking.seats_requested} seat(s) requested
                    </p>
                  </div>
                  {(myBooking.status === 'PENDING' || myBooking.status === 'ACCEPTED') && (
                    <button
                      onClick={handleCancelBooking}
                      disabled={actionLoading}
                      className="w-full rounded-lg border border-rose-300 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {isDriver && (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
                      <p className="text-xs text-amber-700">Drivers cannot book rides as passengers.</p>
                    </div>
                  )}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Seats</label>
                    <input
                      type="number"
                      min={1}
                      max={ride.available_seats}
                      value={seatsRequested}
                      onChange={(e) => setSeatsRequested(parseInt(e.target.value, 10) || 1)}
                      disabled={isDriver}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:opacity-50"
                    />
                    <p className="mt-1 text-xs text-slate-400">{ride.available_seats - acceptedSeats} seats currently available</p>
                  </div>
                  <button
                    onClick={handleRequestSeats}
                    disabled={bookingSubmitting || isDriver || ride.available_seats - acceptedSeats <= 0}
                    className="w-full rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
                  >
                    {ride.available_seats - acceptedSeats <= 0 ? 'No seats available' : bookingSubmitting ? 'Requesting...' : 'Request Seats'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Driver: passenger requests */}
          {isOwner && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Passenger Requests</h3>

              {bookings.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-6 w-6 text-slate-300" />}
                  title="No requests yet"
                  message="Passenger requests will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {/* Pending */}
                  {pendingBookings.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
                        Pending ({pendingBookings.length})
                      </p>
                      {pendingBookings.map((b) => (
                        <BookingRequestCard
                          key={b.id}
                          booking={b}
                          onAccept={() => handleAcceptBooking(b.id, b.seats_requested)}
                          onReject={() => handleRejectBooking(b.id)}
                          disabled={actionLoading}
                        />
                      ))}
                    </div>
                  )}

                  {/* Accepted */}
                  {acceptedBookings.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        Confirmed ({acceptedBookings.length})
                      </p>
                      {acceptedBookings.map((b) => (
                        <BookingRequestCard key={b.id} booking={b} disabled={actionLoading} />
                      ))}
                    </div>
                  )}

                  {/* Rejected */}
                  {bookings.filter((b) => b.status === 'REJECTED').length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-600">
                        Rejected
                      </p>
                      {bookings.filter((b) => b.status === 'REJECTED').map((b) => (
                        <BookingRequestCard key={b.id} booking={b} disabled={actionLoading} />
                      ))}
                    </div>
                  )}

                  {/* Cancelled */}
                  {bookings.filter((b) => b.status === 'CANCELLED').length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Cancelled
                      </p>
                      {bookings.filter((b) => b.status === 'CANCELLED').map((b) => (
                        <BookingRequestCard key={b.id} booking={b} disabled={actionLoading} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Privacy note */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-slate-400 mt-0.5" />
              <p className="text-xs text-slate-500">
                Only pickup zones are shared — your exact home address is never displayed.
                Contact the driver/passenger via phone after confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function BookingRequestCard({
  booking,
  onAccept,
  onReject,
  disabled,
}: {
  booking: Booking & { passenger: Profile | null };
  onAccept?: () => void;
  onReject?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mb-2 rounded-lg border border-slate-200 px-3 py-2.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">{booking.passenger?.full_name || 'Unknown'}</p>
          <p className="text-xs text-slate-500">{booking.seats_requested} seat(s)</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      {booking.status === 'PENDING' && onAccept && onReject && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={onAccept}
            disabled={disabled}
            className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" />
            Accept
          </button>
          <button
            onClick={onReject}
            disabled={disabled}
            className="flex items-center gap-1 rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
