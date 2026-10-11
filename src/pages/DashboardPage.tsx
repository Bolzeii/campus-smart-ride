import { useEffect, useState } from 'react';
import { Bus, Car, Calendar, Users, Plus, Search, List, ArrowRight, ArrowLeft, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { PageContainer, PageHeader, Spinner, EmptyState, StatusBadge } from '@/components/ui';
import { RideCard, type RideCardData } from '@/components/RideCard';
import { formatTime, formatDate, formatRideType, toRideCardData, type FlatRideRow } from '@/lib/utils';
import type { Booking, Ride, PickupZone, Vehicle, Profile } from '@/lib/types';

interface BookingWithRide extends Booking {
  ride: Ride & { pickup_zone: PickupZone | null; vehicle: Vehicle | null };
}

export function DashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myRides, setMyRides] = useState<RideCardData[]>([]);
  const [myBookings, setMyBookings] = useState<BookingWithRide[]>([]);
  const [vehicleCount, setVehicleCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    loadData();
  }, [profile]);

  async function loadData() {
    setLoading(true);
    if (!profile) return;

    if (profile.role === 'DRIVER') {
      const { data: rides } = await supabase
        .from('rides')
        .select(`
          *,
          pickup_zone:pickup_zones(*),
          vehicle:vehicles(*),
          bookings(*)
        `)
        .eq('user_id', profile.id)
        .order('ride_date', { ascending: false });

      if (rides) {
        setMyRides(rides.map((r) => toRideCardData(r as FlatRideRow)));
      }

      const { count } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);
      setVehicleCount(count || 0);
    } else {
      const { data: bookings } = await supabase
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

      if (bookings) {
        setMyBookings(bookings as unknown as BookingWithRide[]);
      }
    }

    setLoading(false);
  }

  if (loading) return <PageContainer><Spinner /></PageContainer>;
  if (!profile) return null;

  const isDriver = profile.role === 'DRIVER';
  const activeRides = myRides.filter((r) => r.ride.status === 'ACTIVE');
  const upcomingBookings = myBookings.filter(
    (b) => b.status === 'PENDING' || b.status === 'ACCEPTED'
  );

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome, ${profile.full_name.split(' ')[0]}`}
        subtitle={isDriver ? 'Manage your rides and passenger requests.' : 'Find and manage your ride bookings.'}
      />

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isDriver ? (
          <>
            <StatCard icon={<List className="h-5 w-5" />} label="Active Rides" value={activeRides.length} color="sky" />
            <StatCard icon={<Car className="h-5 w-5" />} label="Vehicles" value={vehicleCount} color="teal" />
            <StatCard icon={<Users className="h-5 w-5" />} label="Total Rides Posted" value={myRides.length} color="emerald" />
            <StatCard icon={<Calendar className="h-5 w-5" />} label="Role" value="Driver" color="slate" textValue />
          </>
        ) : (
          <>
            <StatCard icon={<Calendar className="h-5 w-5" />} label="Active Bookings" value={upcomingBookings.length} color="sky" />
            <StatCard icon={<Clock className="h-5 w-5" />} label="Total Bookings" value={myBookings.length} color="teal" />
            <StatCard icon={<Bus className="h-5 w-5" />} label="Confirmed Rides" value={myBookings.filter(b => b.status === 'ACCEPTED').length} color="emerald" />
            <StatCard icon={<Users className="h-5 w-5" />} label="Role" value="Passenger" color="slate" textValue />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isDriver ? (
          <>
            <QuickAction
              icon={<Plus className="h-5 w-5" />}
              title="Post a Ride"
              description="Offer a ride to or from college"
              onClick={() => onNavigate('/post-ride')}
            />
            <QuickAction
              icon={<List className="h-5 w-5" />}
              title="My Rides"
              description="View and manage your posted rides"
              onClick={() => onNavigate('/my-rides')}
            />
            <QuickAction
              icon={<Search className="h-5 w-5" />}
              title="Find a Ride"
              description="Search for rides as a passenger"
              onClick={() => onNavigate('/find-ride')}
            />
          </>
        ) : (
          <>
            <QuickAction
              icon={<Search className="h-5 w-5" />}
              title="Find a Ride to College"
              description="Search morning rides to campus"
              onClick={() => onNavigate('/find-ride')}
            />
            <QuickAction
              icon={<ArrowLeft className="h-5 w-5" />}
              title="Find a Ride Home"
              description="Search rides returning home"
              onClick={() => onNavigate('/find-ride-home')}
            />
            <QuickAction
              icon={<Calendar className="h-5 w-5" />}
              title="My Bookings"
              description="View your ride bookings"
              onClick={() => onNavigate('/my-bookings')}
            />
          </>
        )}
      </div>

      {/* Recent activity */}
      {isDriver ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Recent Rides</h2>
            <button
              onClick={() => onNavigate('/my-rides')}
              className="text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
              View all
            </button>
          </div>
          {activeRides.length === 0 ? (
            <EmptyState
              icon={<List className="h-8 w-8 text-slate-300" />}
              title="No active rides yet"
              message="Post your first ride to start receiving passenger requests."
              action={
                <button
                  onClick={() => onNavigate('/post-ride')}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  <Plus className="h-4 w-4" />
                  Post a Ride
                </button>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeRides.slice(0, 4).map((ride) => (
                <RideCard
                  key={ride.ride.id}
                  data={ride}
                  showDriver={false}
                  onClick={() => onNavigate(`/ride/${ride.ride.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Recent Bookings</h2>
            <button
              onClick={() => onNavigate('/my-bookings')}
              className="text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
              View all
            </button>
          </div>
          {upcomingBookings.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-8 w-8 text-slate-300" />}
              title="No active bookings"
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
            <div className="space-y-3">
              {upcomingBookings.slice(0, 5).map((booking) => (
                <BookingRow key={booking.id} booking={booking} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  textValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'sky' | 'teal' | 'emerald' | 'slate';
  textValue?: boolean;
}) {
  const colors = {
    sky: 'bg-sky-50 text-sky-600',
    teal: 'bg-teal-50 text-teal-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{textValue ? value : value}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-sky-300 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-100">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-sky-500" />
    </button>
  );
}

function BookingRow({
  booking,
  onNavigate,
}: {
  booking: BookingWithRide;
  onNavigate: (path: string) => void;
}) {
  const ride = booking.ride;
  if (!ride) return null;
  const isGoing = ride.ride_type === 'GOING_TO_COLLEGE';

  return (
    <button
      onClick={() => onNavigate(`/ride/${ride.id}`)}
      className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:border-sky-300 hover:shadow-md"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isGoing ? 'bg-sky-50 text-sky-600' : 'bg-teal-50 text-teal-600'}`}>
        {isGoing ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{formatRideType(ride.ride_type)}</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            {ride.pickup_zone?.name || '—'}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
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
      <StatusBadge status={booking.status} />
    </button>
  );
}
