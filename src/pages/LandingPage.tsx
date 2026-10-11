import { Bus, Shield, MapPin, Users, ArrowRight, CheckCircle2, Lock, Route } from 'lucide-react';

export function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
          <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-teal-500 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 shadow-lg">
              <Bus className="h-7 w-7 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Campus Smart Ride</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Share your daily commute.
            <span className="block text-sky-400">Protect your privacy.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            A ride-sharing platform built exclusively for verified college students. Travel together
            from predefined pickup zones to campus — no exact addresses, no tracking, no compromise.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => onNavigate('/register')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-sky-400"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => onNavigate('/login')}
              className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Why Campus Smart Ride?</h2>
          <p className="mt-3 text-slate-500">Designed for students, by students — privacy first.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-sky-600" />}
            title="Privacy-Preserving"
            description="No exact home addresses. Use predefined pickup zones like SRM Main Gate or Ramapuram Bus Stop."
          />
          <FeatureCard
            icon={<MapPin className="h-6 w-6 text-teal-600" />}
            title="Predefined Zones"
            description="Pick from a set of safe, well-known pickup and drop-off zones around campus."
          />
          <FeatureCard
            icon={<Users className="h-6 w-6 text-emerald-600" />}
            title="Verified Students"
            description="Only students from the same college can join and share rides with each other."
          />
          <FeatureCard
            icon={<Route className="h-6 w-6 text-sky-600" />}
            title="Two-Way Commute"
            description="Post rides going to college in the morning or returning home after classes."
          />
          <FeatureCard
            icon={<Lock className="h-6 w-6 text-slate-600" />}
            title="No Tracking"
            description="No live GPS, no location history. Just the pickup zone, time, and date."
          />
          <FeatureCard
            icon={<CheckCircle2 className="h-6 w-6 text-emerald-600" />}
            title="Simple & Transparent"
            description="Rule-based matching. Search, filter, request a seat, and the driver confirms."
          />
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-slate-900">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100">
                <Bus className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">For Drivers</h3>
              <ol className="space-y-2 text-sm text-slate-600">
                <li>1. Register as a driver and add your vehicle</li>
                <li>2. Post a ride with pickup zone, date, and time</li>
                <li>3. Receive and review passenger requests</li>
                <li>4. Accept or reject — passengers get notified</li>
              </ol>
            </div>
            <div className="rounded-2xl border border-slate-200 p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100">
                <Users className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">For Passengers</h3>
              <ol className="space-y-2 text-sm text-slate-600">
                <li>1. Register as a passenger</li>
                <li>2. Search rides by type, zone, date, and time</li>
                <li>3. Request seats on a ride that matches</li>
                <li>4. Wait for driver confirmation — then ride</li>
              </ol>
            </div>
          </div>
          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate('/register')}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-sky-700"
            >
              Join Campus Smart Ride
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          Campus Smart Ride — A Privacy-Preserving Student Ride Sharing System
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}
