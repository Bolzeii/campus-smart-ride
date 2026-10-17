import { useState, type FormEvent } from 'react';
import { Bus, Mail, Lock, User, Phone, GraduationCap, MapPin, ArrowRight, Car, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

export function RegisterPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('SRM Institute of Science and Technology');
  const [homeLocation, setHomeLocation] = useState('');
  const [collegeLocation, setCollegeLocation] = useState('Vadapalani, Chennai');
  const [role, setRole] = useState<UserRole>('PASSENGER');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const { error } = await signUp({ email, password, fullName, phone, college, homeLocation, collegeLocation, role });
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    onNavigate('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <button onClick={() => onNavigate('/')} className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 shadow-sm">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Campus Smart Ride</span>
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="mb-6 text-sm text-slate-500">Join the campus ride-sharing community.</p>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('PASSENGER')}
                  className={`flex items-center gap-3 rounded-lg border-2 p-3 transition ${
                    role === 'PASSENGER'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Users className={`h-5 w-5 ${role === 'PASSENGER' ? 'text-sky-600' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <span className="block text-sm font-semibold text-slate-800">Passenger</span>
                    <span className="block text-xs text-slate-500">Find & book rides</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('DRIVER')}
                  className={`flex items-center gap-3 rounded-lg border-2 p-3 transition ${
                    role === 'DRIVER'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Car className={`h-5 w-5 ${role === 'DRIVER' ? 'text-sky-600' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <span className="block text-sm font-semibold text-slate-800">Driver</span>
                    <span className="block text-xs text-slate-500">Post & manage rides</span>
                  </div>
                </button>
              </div>
            </div>

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
                    placeholder="John Doe"
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
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="SRM Institute of Science and Technology"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Home Area / Locality</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={homeLocation}
                    onChange={(e) => setHomeLocation(e.target.value)}
                    placeholder="e.g. Guindy, Chennai"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">Area or nearby landmark only — no house number.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Campus / College Area</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={collegeLocation}
                    onChange={(e) => setCollegeLocation(e.target.value)}
                    placeholder="e.g. Vadapalani, Chennai"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('/login')}
              className="font-semibold text-sky-600 hover:text-sky-700"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
