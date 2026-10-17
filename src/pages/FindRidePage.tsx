import { useEffect, useState, useCallback } from 'react';
import { Search, Filter, MapPin, Calendar, Clock, X, Bus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageContainer, PageHeader, Spinner, EmptyState, ErrorState } from '@/components/ui';
import { RideCard, type RideCardData } from '@/components/RideCard';
import { todayISO, toRideCardData } from '@/lib/utils';
import type { RideType, PickupZone } from '@/lib/types';


type DemoRide = {
  id: string;
  pickup: string;
  destination: string;
  time: string;
  seats: number;
  vehicle: string;
  fare: string;
  note: string;
};

const DEMO_RIDES: Record<RideType, DemoRide[]> = {
  GOING_TO_COLLEGE: [
    { id: 'demo-guindy-metro', pickup: 'Guindy Metro Station, Guindy', destination: 'SRMIST Vadapalani — C Block, 100 Feet Road (near SIMS Hospital)', time: '07:45 AM', seats: 3, vehicle: 'Maruti Swift · Hatchback', fare: '₹80/person (demo)', note: 'Illustrative sample — not a real booking' },
    { id: 'demo-guindy-rail', pickup: 'Guindy Railway Station, station entrance', destination: 'SRMIST Vadapalani — C Block, 100 Feet Road (near SIMS Hospital)', time: '08:10 AM', seats: 2, vehicle: 'Hyundai i20 · Hatchback', fare: '₹90/person (demo)', note: 'Illustrative sample — not a real booking' },
    { id: 'demo-guindy-estate', pickup: 'Guindy Industrial Estate Bus Stand', destination: 'SRMIST Vadapalani — C Block, 100 Feet Road (near SIMS Hospital)', time: '08:25 AM', seats: 3, vehicle: 'Honda Amaze · Sedan', fare: '₹100/person (demo)', note: 'Illustrative sample — not a real booking' },
  ],
  RETURNING_FROM_COLLEGE: [
    { id: 'demo-srm-vadapalani-metro', pickup: 'SRMIST Vadapalani — C Block, 100 Feet Road', destination: 'Guindy Metro Station, Guindy', time: '04:15 PM', seats: 3, vehicle: 'Maruti Swift · Hatchback', fare: '₹80/person (demo)', note: 'Illustrative sample — not a real booking' },
    { id: 'demo-srm-guindy-rail', pickup: 'SRMIST Vadapalani — near SIMS Hospital', destination: 'Guindy Railway Station, station entrance', time: '05:00 PM', seats: 2, vehicle: 'Hyundai i20 · Hatchback', fare: '₹90/person (demo)', note: 'Illustrative sample — not a real booking' },
    { id: 'demo-srm-guindy-estate', pickup: 'Vadapalani Metro Station, Vadapalani', destination: 'Guindy Industrial Estate Bus Stand', time: '05:30 PM', seats: 3, vehicle: 'Honda Amaze · Sedan', fare: '₹100/person (demo)', note: 'Illustrative sample — not a real booking' },
  ],
};

export function FindRidePage({
  rideType,
  title,
  subtitle,
  onNavigate,
}: {
  rideType: RideType;
  title: string;
  subtitle: string;
  onNavigate: (path: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rides, setRides] = useState<RideCardData[]>([]);
  const [zones, setZones] = useState<PickupZone[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<string>('');

  const loadZones = useCallback(async () => {
    const { data, error } = await supabase.from('pickup_zones').select('*').order('name');
    if (error) {
      setError('Failed to load pickup zones.');
      return;
    }
    setZones(data || []);
  }, []);

  const loadRides = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('rides')
      .select(`
        *,
        pickup_zone:pickup_zones(*),
        vehicle:vehicles(*),
        driver:profiles!rides_user_id_profiles_fkey(*),
        bookings(*)
      `)
      .eq('ride_type', rideType)
      .eq('status', 'ACTIVE')
      .gt('available_seats', 0)
      .order('ride_date', { ascending: true })
      .order('ride_time', { ascending: true });

    if (zoneFilter !== 'all') {
      query = query.eq('pickup_zone_id', zoneFilter);
    }
    if (dateFilter) {
      query = query.eq('ride_date', dateFilter);
    }

    const { data, error } = await query;

    if (error) {
      setError('Failed to load rides. Please try again.');
      setLoading(false);
      return;
    }

    let filtered = (data || []) as unknown as any[];

    // Time filter (client-side since time comparison is tricky)
    if (timeFilter) {
      filtered = filtered.filter((r) => r.ride_time >= timeFilter);
    }

    setRides(filtered.map((r) => toRideCardData(r)));
    setLoading(false);
  }, [rideType, zoneFilter, dateFilter, timeFilter]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  function clearFilters() {
    setZoneFilter('all');
    setDateFilter('');
    setTimeFilter('');
  }

  const hasFilters = zoneFilter !== 'all' || dateFilter || timeFilter;

  return (
    <PageContainer>
      <PageHeader title={title} subtitle={subtitle} />

      {/* Search bar */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-8 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              >
                <option value="all">All Pickup Zones</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                min={todayISO()}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                showFilters || hasFilters
                  ? 'border-sky-500 bg-sky-50 text-sky-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="time"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <span className="text-xs text-slate-500">Show rides at or after this time</span>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={loadRides} />
      ) : (
        <>
          {rides.length > 0 && (
            <>
              <p className="mb-4 text-sm text-slate-500">
                {rides.length} real ride{rides.length !== 1 ? 's' : ''} posted by users
              </p>
              <div className="mb-8 grid gap-4 md:grid-cols-2">
                {rides.map((ride) => (
                  <RideCard
                    key={ride.ride.id}
                    data={ride}
                    onClick={() => onNavigate(`/ride/${ride.ride.id}`)}
                  />
                ))}
              </div>
            </>
          )}

          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sample rides for preview</h2>
              <p className="text-sm text-slate-500">Real local landmarks · fictional demo schedules and fares</p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">DEMO ONLY · NOT BOOKABLE</span>
          </div>
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            These sample listings demonstrate the interface only. Drivers, times, seat counts and fares are fictional examples; they are not live availability or confirmed prices.
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {DEMO_RIDES[rideType]
              .filter((sample) => {
                if (zoneFilter === 'all') return true;
                const selectedZone = zones.find((zone) => zone.id === zoneFilter)?.name.toLowerCase() || '';
                return sample.pickup.toLowerCase().includes(selectedZone) || selectedZone.includes('guindy') && sample.pickup.toLowerCase().includes('guindy') || selectedZone.includes('srmist') && sample.pickup.toLowerCase().includes('srmist') || selectedZone.includes('vadapalani') && sample.pickup.toLowerCase().includes('vadapalani');
              })
              .filter((sample) => !timeFilter || (() => {
                const [time, period] = sample.time.split(' ');
                let [hour, minute] = time.split(':').map(Number);
                if (period === 'PM' && hour !== 12) hour += 12;
                if (period === 'AM' && hour === 12) hour = 0;
                return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` >= timeFilter;
              })())
              .map((sample) => (
                <article key={sample.id} className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-amber-100 bg-amber-50 px-5 py-3">
                    <span className="text-sm font-bold text-slate-800">{rideType === 'GOING_TO_COLLEGE' ? 'Home area → College' : 'College → Home area'}</span>
                    <span className="rounded-full bg-amber-200 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-amber-900">SAMPLE</span>
                  </div>
                  <div className="space-y-4 p-5">
                    <div>
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Pickup</p>
                      <p className="text-sm font-semibold text-slate-900">{sample.pickup}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Drop-off</p>
                      <p className="text-sm font-semibold text-slate-900">{sample.destination}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                      <div><p className="text-[11px] text-slate-400">Departure</p><p className="text-sm font-semibold text-slate-800">{sample.time}</p></div>
                      <div><p className="text-[11px] text-slate-400">Seats</p><p className="text-sm font-semibold text-slate-800">{sample.seats} (demo)</p></div>
                      <div><p className="text-[11px] text-slate-400">Fare</p><p className="text-sm font-semibold text-slate-800">{sample.fare}</p></div>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-xs text-slate-600">{sample.vehicle}</span>
                      <span className="text-[10px] font-semibold text-amber-700">Not bookable</span>
                    </div>
                  </div>
                </article>
              ))}
          </div>
          {rides.length === 0 && (
            <p className="mt-5 text-sm text-slate-500">No real user-posted rides match this search yet. The sample cards above are for demonstration only.</p>
          )}
        </>
      )}
    </PageContainer>
  );
}
