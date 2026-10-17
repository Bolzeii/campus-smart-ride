import { useState } from 'react';
import { Bus, Shield, MapPin, Users, ArrowRight, CheckCircle2, Lock, Route, Clock, Car, ChevronDown, ExternalLink, Navigation, Info } from 'lucide-react';

export function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [showRideDetails, setShowRideDetails] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(true);
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="relative isolate overflow-hidden bg-slate-950">
        <div className="absolute inset-0 -z-10 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 12% 20%, #0284c7 0, transparent 34%), radial-gradient(circle at 85% 30%, #0f766e 0, transparent 32%)' }} />
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <button onClick={() => onNavigate('/')} className="flex items-center gap-3 text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 shadow-lg shadow-sky-950/40"><Bus className="h-6 w-6 text-white" /></span>
            <span><span className="block text-base font-extrabold text-white">Campus Smart Ride</span><span className="block text-xs text-slate-400">Your campus. Your commute.</span></span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => onNavigate('/login')} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:px-4">Sign in</button>
            <button onClick={() => onNavigate('/register')} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-50">Join now <ArrowRight className="ml-1 inline h-4 w-4" /></button>
          </div>
        </nav>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 sm:pb-24 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:pb-28 lg:pt-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-2 text-xs font-semibold text-emerald-200"><Shield className="h-4 w-4" /> Thoughtful, privacy-conscious commuting</div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">Your daily commute, <span className="text-sky-400">shared smarter.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">Connect with your campus community, coordinate a ride, and make the journey to and from college simpler.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => onNavigate('/register')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-950/40 transition hover:-translate-y-0.5 hover:bg-sky-400">Create your account <ArrowRight className="h-4 w-4" /></button>
              <button onClick={() => onNavigate('/login')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"><Lock className="h-4 w-4" /> I already have an account</button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-400"><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Clear ride details</span><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Booking requests you control</span><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Area-level locations</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2rem] bg-sky-400/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/[0.07] p-3 shadow-2xl backdrop-blur sm:p-4">
              <div className="flex items-center justify-between gap-3 px-2 pb-3">
                <div><p className="text-sm font-bold text-white">Live route map</p><p className="mt-1 text-xs text-slate-400">Guindy Metro Station → SRMIST Vadapalani</p></div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-200"><span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> Demo ride</span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
                <iframe title="Map route from Guindy Metro Station to SRMIST Vadapalani" className="h-64 w-full sm:h-72" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?output=embed&saddr=Guindy+Metro+Station,+Chennai,+Tamil+Nadu&daddr=SRM+Institute+of+Science+and+Technology,+Vadapalani,+Chennai,+Tamil+Nadu" />
                <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-2.5 sm:px-4">
                  <p className="text-[11px] leading-4 text-slate-500">Map preview · Route may vary with traffic</p>
                  <a className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900" href="https://www.google.com/maps/dir/?api=1&origin=Guindy+Metro+Station,+Chennai&destination=SRM+Institute+of+Science+and+Technology,+Vadapalani,+Chennai&travelmode=driving" target="_blank" rel="noreferrer">Open directions <ExternalLink className="h-3.5 w-3.5" /></a>
                </div>
              </div>
              <div className="mt-3 rounded-2xl bg-white p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-sky-700">Sample listing · Not bookable</p><h3 className="mt-1 text-lg font-extrabold text-slate-950">Morning campus commute</h3><p className="mt-1 text-xs text-slate-500">Illustrative details for preview only</p></div>
                  <span className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800 ring-1 ring-amber-200">DEMO DATA</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-slate-50 p-3"><Clock className="h-4 w-4 text-sky-700" /><p className="mt-2 text-[10px] text-slate-500">Example time</p><p className="text-sm font-extrabold text-slate-900">7:45 AM</p></div>
                  <div className="rounded-xl bg-slate-50 p-3"><Users className="h-4 w-4 text-sky-700" /><p className="mt-2 text-[10px] text-slate-500">Example seats</p><p className="text-sm font-extrabold text-slate-900">3 seats</p></div>
                  <div className="rounded-xl bg-slate-50 p-3"><Car className="h-4 w-4 text-emerald-700" /><p className="mt-2 text-[10px] text-slate-500">Driver</p><p className="text-sm font-extrabold text-slate-900">Sample</p></div>
                </div>
                {showRideDetails && <div className="mt-4 rounded-xl border border-slate-200 p-3.5 text-sm">
                  <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" /><div><p className="font-bold text-slate-800">Pickup</p><p className="mt-0.5 text-slate-600">Guindy Metro Station, Chennai</p></div></div>
                  <div className="my-3 ml-2 h-4 border-l border-dashed border-slate-300" />
                  <div className="flex items-start gap-3"><Navigation className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /><div><p className="font-bold text-slate-800">Drop-off</p><p className="mt-0.5 text-slate-600">SRMIST Vadapalani campus area, Chennai</p></div></div>
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs leading-5 text-amber-900"><Info className="mt-0.5 h-4 w-4 shrink-0" />This is a fictional preview. No real driver, vehicle, seats, or booking is associated with it.</div>
                </div>}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => setShowRideDetails(!showRideDetails)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50">{showRideDetails ? 'Hide details' : 'View ride details'} <ChevronDown className={`h-4 w-4 transition ${showRideDetails ? 'rotate-180' : ''}`} /></button>
                  <button onClick={() => onNavigate('/find-ride')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-sky-700">Find real rides <ArrowRight className="h-4 w-4" /></button>
                </div>
                <p className="mt-3 text-center text-[10px] leading-4 text-slate-400">The demo card is not an actual ride listing. Real availability appears only in Find Rides.</p>
              </div>
              <button onClick={() => setMapExpanded(!mapExpanded)} className="mt-3 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-xs font-semibold text-slate-200 transition hover:bg-white/10"><span className="inline-flex items-center gap-2"><Navigation className="h-4 w-4 text-sky-300" /> {mapExpanded ? 'Map visible' : 'Map hidden'} · Guindy to Vadapalani</span><ChevronDown className={`h-4 w-4 transition ${mapExpanded ? 'rotate-180' : ''}`} /></button>
              {!mapExpanded && <p className="px-2 pt-2 text-xs text-slate-400">Open Google Maps directions above to view the route.</p>}
            </div>
          </div>
        </div>
      </header>
      <section className="border-b border-slate-100 bg-white"><div className="mx-auto grid max-w-7xl gap-4 px-5 py-7 sm:grid-cols-3 sm:px-8"><TrustPoint icon={<MapPin className="h-5 w-5" />} title="Recognizable meet-up points" text="Choose public landmarks and campus areas." /><TrustPoint icon={<Users className="h-5 w-5" />} title="Passenger or driver" text="Create a profile suited to how you travel." /><TrustPoint icon={<Shield className="h-5 w-5" />} title="Transparent booking" text="Review ride details and request confirmation." /></div></section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20"><div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-700">Made for everyday campus travel</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">A better way to get there together.</h2><p className="mt-4 leading-7 text-slate-500">Straightforward tools to plan the trip, share useful details, and stay in control of your ride requests.</p></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><FeatureCard icon={<Route className="h-6 w-6 text-sky-700" />} title="Two-way commute" description="Find a ride to college in the morning or look for a trip back home after classes." /><FeatureCard icon={<MapPin className="h-6 w-6 text-teal-700" />} title="Public pickup areas" description="Use recognizable meeting points and keep your exact home address private." /><FeatureCard icon={<Shield className="h-6 w-6 text-emerald-700" />} title="Clear ride status" description="See the ride details and booking status rather than guessing whether a seat is confirmed." /><FeatureCard icon={<Car className="h-6 w-6 text-violet-700" />} title="Role-specific accounts" description="Passengers find and request seats; drivers add a vehicle and post available rides." /><FeatureCard icon={<Lock className="h-6 w-6 text-slate-700" />} title="Privacy-conscious" description="Share an area or public landmark instead of your exact residential address." /><FeatureCard icon={<CheckCircle2 className="h-6 w-6 text-amber-700" />} title="You stay in control" description="Review the route and timing before requesting a seat, and wait for the driver's response." /></div></section>
      <section className="bg-slate-50"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20"><div className="grid gap-10 lg:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-700">Simple steps</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">From sign-up to shared commute.</h2><p className="mt-4 max-w-lg leading-7 text-slate-500">A clear process helps everyone know what happens next.</p><button onClick={() => onNavigate('/register')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">Get started <ArrowRight className="h-4 w-4" /></button></div><div className="grid gap-4 sm:grid-cols-2"><StepCard number="01" title="Create your profile" text="Choose passenger or driver and add your commute area." /><StepCard number="02" title="Find or post a ride" text="Search available listings or share a trip you plan to make." /><StepCard number="03" title="Review the details" text="Check pickup point, departure time, seats, and vehicle information." /><StepCard number="04" title="Confirm the plan" text="Request a seat and wait for the driver to respond before relying on the ride." /></div></div></div></section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20"><div className="rounded-3xl bg-slate-950 px-6 py-10 text-center shadow-xl sm:px-12 sm:py-14"><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-300">Your next commute starts here</p><h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">Make your campus journey a little easier.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300">Create an account to find rides or offer seats on a trip you are already taking.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={() => onNavigate('/register')} className="rounded-xl bg-sky-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-sky-400">Create account <ArrowRight className="ml-1 inline h-4 w-4" /></button><button onClick={() => onNavigate('/login')} className="rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">Sign in</button></div></div></section>
      <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><span className="font-bold text-slate-700">Campus Smart Ride</span><span>Student commute coordination · Privacy-conscious by design</span><span>© {new Date().getFullYear()} Campus Smart Ride</span></div></footer>
    </div>
  );
}

function TrustPoint({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"><span className="rounded-xl bg-slate-50 p-2.5 text-slate-700">{icon}</span><span><span className="block text-sm font-bold text-slate-900">{title}</span><span className="mt-1 block text-sm leading-5 text-slate-500">{text}</span></span></div>;
}

function StepCard({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"><span className="text-xs font-black tracking-widest text-sky-700">{number}</span><h3 className="mt-3 font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>;
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 transition group-hover:bg-sky-50">{icon}</div><h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3><p className="text-sm leading-6 text-slate-500">{description}</p></div>;
}
