import { useState, useEffect, type FormEvent } from 'react';
import { User, Phone, GraduationCap, Car, Save, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { PageContainer, PageHeader, Spinner, EmptyState } from '@/components/ui';
import type { Vehicle } from '@/lib/types';

export function ProfilePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { profile, session, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [homeLocation, setHomeLocation] = useState(profile?.home_location || '');
  const [collegeLocation, setCollegeLocation] = useState(profile?.college_location || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vMake, setVMake] = useState('');
  const [vModel, setVModel] = useState('');
  const [vPlate, setVPlate] = useState('');
  const [vColor, setVColor] = useState('');
  const [vCapacity, setVCapacity] = useState(4);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [vehicleSubmitting, setVehicleSubmitting] = useState(false);

  const isDriver = profile?.role === 'DRIVER';

  async function loadVehicles() {
    if (!profile) return;
    setVehiclesLoading(true);
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    setVehicles(data || []);
    setVehiclesLoading(false);
  }

  useEffect(() => {
    if (isDriver) loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDriver]);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone || null,
        home_location: homeLocation.trim() || null,
        college_location: collegeLocation.trim() || null,
      })
      .eq('id', profile.id);

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    setSaveSuccess(true);
    await refreshProfile();
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  async function handleAddVehicle(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setVehicleError(null);

    if (vCapacity < 2) {
      setVehicleError('Vehicle capacity must be at least 2.');
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
    }
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
      setVehicleError('Could not delete vehicle — it may be linked to an active ride.');
      return;
    }
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }

  if (!profile) return <PageContainer><Spinner /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader title="Profile" subtitle="Manage your account and vehicle information." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile info */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-sm font-bold text-slate-800">Account Information</h3>

            {saveError && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                Profile saved successfully.
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">College / University</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={profile.college}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-500"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">College cannot be changed after registration.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Home Area / Town</label>
                  <input
                    type="text"
                    value={homeLocation}
                    onChange={(e) => setHomeLocation(e.target.value)}
                    placeholder="e.g. Tambaram, Chennai"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                  <p className="mt-1 text-xs text-slate-400">Enter your area or nearest landmark, not your house number.</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">College Location / Area</label>
                  <input
                    type="text"
                    value={collegeLocation}
                    onChange={(e) => setCollegeLocation(e.target.value)}
                    placeholder="e.g. Potheri, Chennai"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                  <p className="mt-1 text-xs text-slate-400">Add the campus area or a nearby landmark.</p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  value={session?.user?.email || ''}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Role</label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                    {profile.role}
                  </span>
                  <span className="text-xs text-slate-400">Role is set during registration.</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Vehicles sidebar (drivers only) */}
        <div>
          {isDriver ? (
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

              {vehicleError && (
                <p className="mb-3 text-xs font-medium text-rose-600">{vehicleError}</p>
              )}

              {showVehicleForm && (
                <form onSubmit={handleAddVehicle} className="mb-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <input type="text" required placeholder="Make" value={vMake} onChange={(e) => setVMake(e.target.value)} className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-sky-500" />
                  <input type="text" required placeholder="Model" value={vModel} onChange={(e) => setVModel(e.target.value)} className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-sky-500" />
                  <input type="text" required placeholder="Plate" value={vPlate} onChange={(e) => setVPlate(e.target.value)} className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-sky-500" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Color" value={vColor} onChange={(e) => setVColor(e.target.value)} className="rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-sky-500" />
                    <input type="number" required min={2} placeholder="Capacity" value={vCapacity} onChange={(e) => setVCapacity(parseInt(e.target.value, 10) || 2)} className="rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-sky-500" />
                  </div>
                  <button type="submit" disabled={vehicleSubmitting} className="w-full rounded-md bg-sky-600 py-2 text-xs font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60">
                    {vehicleSubmitting ? 'Adding...' : 'Add Vehicle'}
                  </button>
                </form>
              )}

              {vehiclesLoading ? (
                <Spinner size="sm" />
              ) : vehicles.length === 0 && !showVehicleForm ? (
                <EmptyState
                  icon={<Car className="h-6 w-6 text-slate-300" />}
                  title="No vehicles yet"
                  message="Add a vehicle to start posting rides."
                />
              ) : (
                <div className="space-y-2">
                  {vehicles.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{v.make} {v.model}</p>
                        <p className="text-xs text-slate-500">{v.plate_number} · {v.color || '—'} · {v.capacity} seats</p>
                      </div>
                      <button onClick={() => handleDeleteVehicle(v.id)} className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="mb-2 text-sm font-bold text-slate-800">Passenger Account</h3>
              <p className="text-xs text-slate-500">
                You are registered as a passenger. You can search for rides and request seats.
                To post rides, register as a driver.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
