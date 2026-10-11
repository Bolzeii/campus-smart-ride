import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Car, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { PageContainer, PageHeader, Spinner, EmptyState } from '@/components/ui';
import type { Vehicle, PickupZone, RideType } from '@/lib/types';

export function PostRidePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { profile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [zones, setZones] = useState<PickupZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  // Ride form state
  const [rideType, setRideType] = useState<RideType>('GOING_TO_COLLEGE');
  const [pickupZoneId, setPickupZoneId] = useState('');
  const [destination, setDestination] = useState('');
  const [rideDate, setRideDate] = useState('');
  const [rideTime, setRideTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState(1);
  const [vehicleId, setVehicleId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vehicle form state
  const [vMake, setVMake] = useState('');
  const [vModel, setVModel] = useState('');
  const [vPlate, setVPlate] = useState('');
  const [vColor, setVColor] = useState('');
  const [vCapacity, setVCapacity] = useState(4);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [vehicleSubmitting, setVehicleSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    if (!profile) return;

    const [vehiclesRes, zonesRes] = await Promise.all([
      supabase.from('vehicles').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('pickup_zones').select('*').order('name'),
    ]);

    setVehicles(vehiclesRes.data || []);
    setZones(zonesRes.data || []);
    setLoading(false);
  }

  async function handleAddVehicle(e: FormEvent) {
    e.preventDefault();
    setVehicleError(null);
    if (!profile) return;

    if (vCapacity < 2) {
      setVehicleError('Vehicle capacity must be at least 2 (driver + 1 passenger).');
      return;
    }

    setVehicleSubmitting(true);
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        user_id: profile.id,
        make: vMake,
        model: vModel,
        plate_number: vPlate,
        color: vColor || null,
        capacity: vCapacity,
      })
      .select('*')
      .single();

    setVehicleSubmitting(false);

    if (error) {
      setVehicleError(error.message);
      return;
    }

    if (data) {
      setVehicles((prev) => [data as Vehicle, ...prev]);
      setVehicleId(data.id);
    }

    // Reset form
    setVMake('');
    setVModel('');
    setVPlate('');
    setVColor('');
    setVCapacity(4);
    setShowVehicleForm(false);
  }

  async function handleDeleteVehicle(id: string) {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) {
      setError('Could not delete vehicle — it may be linked to an active ride.');
      return;
    }
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    if (vehicleId === id) setVehicleId('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!profile) return;
    if (profile.role !== 'DRIVER') {
      setError('Only drivers can post rides.');
      return;
    }
    if (vehicles.length === 0) {
      setError('Please add a vehicle before posting a ride.');
      return;
    }
    if (!vehicleId) {
      setError('Please select a vehicle.');
      return;
    }
    if (!pickupZoneId) {
      setError('Please select a pickup zone.');
      return;
    }
    if (availableSeats < 1) {
      setError('Available seats must be at least 1.');
      return;
    }

    const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
    if (selectedVehicle && availableSeats > selectedVehicle.capacity - 1) {
      setError(`Available seats cannot exceed ${selectedVehicle.capacity - 1} (vehicle capacity minus driver).`);
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from('rides').insert({
      user_id: profile.id,
      ride_type: rideType,
      pickup_zone_id: pickupZoneId,
      destination: destination || profile.college,
      ride_date: rideDate,
      ride_time: rideTime,
      available_seats: availableSeats,
      vehicle_id: vehicleId,
      notes: notes || null,
      status: 'ACTIVE',
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    onNavigate('/my-rides');
  }

  if (loading) return <PageContainer><Spinner /></PageContainer>;
  if (!profile) return null;

  return (
    <PageContainer>
      <PageHeader
        title="Post a Ride"
        subtitle="Offer a ride to or from college for other students."
      />

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ride form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Ride type */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Ride Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRideType('GOING_TO_COLLEGE')}
                  className={`rounded-lg border-2 p-3 text-left transition ${
                    rideType === 'GOING_TO_COLLEGE'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-sm font-semibold text-slate-800">Going to College</span>
                  <span className="block text-xs text-slate-500">Home zone → College</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRideType('RETURNING_FROM_COLLEGE')}
                  className={`rounded-lg border-2 p-3 text-left transition ${
                    rideType === 'RETURNING_FROM_COLLEGE'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-sm font-semibold text-slate-800">Returning from College</span>
                  <span className="block text-xs text-slate-500">College → Home zone</span>
                </button>
              </div>
            </div>

            {/* Pickup zone */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Pickup Zone</label>
              <select
                required
                value={pickupZoneId}
                onChange={(e) => setPickupZoneId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              >
                <option value="">Select a pickup zone</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Destination</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={profile.college}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
              <p className="mt-1 text-xs text-slate-400">
                {rideType === 'GOING_TO_COLLEGE' ? 'Where on campus are you heading?' : 'Which campus are you leaving from?'}
              </p>
            </div>

            {/* Date & Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={rideDate}
                  onChange={(e) => setRideDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Departure Time</label>
                <input
                  type="time"
                  required
                  value={rideTime}
                  onChange={(e) => setRideTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            {/* Seats & Vehicle */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Available Seats</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={8}
                  value={availableSeats}
                  onChange={(e) => setAvailableSeats(parseInt(e.target.value, 10) || 1)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Vehicle</label>
                <select
                  required
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.plate_number})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g., Luggage space limited, please be on time..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || vehicles.length === 0}
              className="w-full rounded-lg bg-sky-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-60"
            >
              {submitting ? 'Posting ride...' : 'Post Ride'}
            </button>
          </form>
        </div>

        {/* Vehicle sidebar */}
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Car className="h-4 w-4 text-slate-500" />
                Your Vehicles
              </h3>
              <button
                onClick={() => setShowVehicleForm(!showVehicleForm)}
                className="flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            {showVehicleForm && (
              <form onSubmit={handleAddVehicle} className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">New Vehicle</span>
                  <button
                    type="button"
                    onClick={() => setShowVehicleForm(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {vehicleError && (
                  <p className="text-xs font-medium text-rose-600">{vehicleError}</p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Make"
                    value={vMake}
                    onChange={(e) => setVMake(e.target.value)}
                    className="rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-sky-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Model"
                    value={vModel}
                    onChange={(e) => setVModel(e.target.value)}
                    className="rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-sky-500"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Plate Number"
                  value={vPlate}
                  onChange={(e) => setVPlate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-sky-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Color"
                    value={vColor}
                    onChange={(e) => setVColor(e.target.value)}
                    className="rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-sky-500"
                  />
                  <input
                    type="number"
                    required
                    min={2}
                    placeholder="Capacity"
                    value={vCapacity}
                    onChange={(e) => setVCapacity(parseInt(e.target.value, 10) || 2)}
                    className="rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={vehicleSubmitting}
                  className="w-full rounded-md bg-sky-600 py-2 text-xs font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
                >
                  {vehicleSubmitting ? 'Adding...' : 'Add Vehicle'}
                </button>
              </form>
            )}

            {vehicles.length === 0 && !showVehicleForm ? (
              <EmptyState
                icon={<Car className="h-6 w-6 text-slate-300" />}
                title="No vehicles yet"
                message="Add a vehicle to start posting rides."
              />
            ) : (
              <div className="space-y-2">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{v.make} {v.model}</p>
                      <p className="text-xs text-slate-500">
                        {v.plate_number} · {v.color || '—'} · {v.capacity} seats
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
