import { useEffect, useState, useCallback } from 'react';
import { List, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { PageContainer, PageHeader, Spinner, EmptyState, ErrorState } from '@/components/ui';
import { RideCard, type RideCardData } from '@/components/RideCard';
import { toRideCardData, type FlatRideRow } from '@/lib/utils';

export function MyRidesPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rides, setRides] = useState<RideCardData[]>([]);

  const loadRides = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        pickup_zone:pickup_zones(*),
        vehicle:vehicles(*),
        bookings(*)
      `)
      .eq('user_id', profile.id)
      .order('ride_date', { ascending: false })
      .order('ride_time', { ascending: false });

    if (error) {
      setError('Failed to load your rides.');
      setLoading(false);
      return;
    }

    setRides((data || []).map((r) => toRideCardData(r as FlatRideRow)));
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  if (loading) return <PageContainer><Spinner /></PageContainer>;
  if (error) return <PageContainer><ErrorState message={error} onRetry={loadRides} /></PageContainer>;

  const activeRides = rides.filter((r) => r.ride.status === 'ACTIVE');
  const cancelledRides = rides.filter((r) => r.ride.status === 'CANCELLED');

  return (
    <PageContainer>
      <PageHeader
        title="My Rides"
        subtitle="Rides you have posted as a driver."
        action={
          <button
            onClick={() => onNavigate('/post-ride')}
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" />
            Post a Ride
          </button>
        }
      />

      {rides.length === 0 ? (
        <EmptyState
          icon={<List className="h-8 w-8 text-slate-300" />}
          title="No rides posted yet"
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
        <div className="space-y-8">
          {activeRides.length > 0 && (
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                Active Rides ({activeRides.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeRides.map((ride) => (
                  <RideCard
                    key={ride.ride.id}
                    data={ride}
                    showDriver={false}
                    onClick={() => onNavigate(`/ride/${ride.ride.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
          {cancelledRides.length > 0 && (
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
                Cancelled Rides ({cancelledRides.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 opacity-60">
                {cancelledRides.map((ride) => (
                  <RideCard
                    key={ride.ride.id}
                    data={ride}
                    showDriver={false}
                    onClick={() => onNavigate(`/ride/${ride.ride.id}`)}
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
