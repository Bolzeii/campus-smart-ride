import { useEffect, useState, useCallback } from 'react';
import { Search, Filter, MapPin, Calendar, Clock, X, Bus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageContainer, PageHeader, Spinner, EmptyState, ErrorState } from '@/components/ui';
import { RideCard, type RideCardData } from '@/components/RideCard';
import { todayISO, toRideCardData } from '@/lib/utils';
import type { RideType, PickupZone } from '@/lib/types';

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
      ) : rides.length === 0 ? (
        <EmptyState
          icon={<Bus className="h-8 w-8 text-slate-300" />}
          title={hasFilters ? 'No rides match your filters' : 'No rides available'}
          message={
            hasFilters
              ? 'Try adjusting or clearing your filters to see more rides.'
              : 'There are no active rides for this direction right now. Check back later or post one yourself.'
          }
          action={
            hasFilters ? (
              <button
                onClick={clearFilters}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Clear Filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">
            {rides.length} ride{rides.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid gap-4 md:grid-cols-2">
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
    </PageContainer>
  );
}
