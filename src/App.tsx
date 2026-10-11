/* 
 * Project: Campus Smart Ride
 * Author: [Your Name]
 * Description: Frontend routing and main application wrapper.
 */

import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/AppLayout';
import { FullPageSpinner } from '@/components/ui';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FindRidePage } from '@/pages/FindRidePage';
import { PostRidePage } from '@/pages/PostRidePage';
import { RideDetailsPage } from '@/pages/RideDetailsPage';
import { MyRidesPage } from '@/pages/MyRidesPage';
import { MyBookingsPage } from '@/pages/MyBookingsPage';
import { ProfilePage } from '@/pages/ProfilePage';

function parsePath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

function useRouter() {
  const [path, setPath] = useState(parsePath());

  useEffect(() => {
    const onHashChange = () => setPath(parsePath());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
    setPath(to);
    window.scrollTo(0, 0);
  }, []);

  return { path, navigate };
}

const PUBLIC_ROUTES = ['/', '/login', '/register'];

function Router() {
  const { session, profile, loading } = useAuth();
  const { path, navigate } = useRouter();

  if (loading) return <FullPageSpinner />;

  const isPublic = PUBLIC_ROUTES.includes(path);

  // Unauthenticated users can only see public routes
  if (!session) {
    if (path === '/login') return <LoginPage onNavigate={navigate} />;
    if (path === '/register') return <RegisterPage onNavigate={navigate} />;
    return <LandingPage onNavigate={navigate} />;
  }

  // Authenticated but profile not yet loaded
  if (!profile) return <FullPageSpinner />;

  // Redirect away from public routes when logged in
  if (isPublic) {
    navigate('/dashboard');
    return <FullPageSpinner />;
  }

  // Authenticated app routes
  let content: ReactNode = null;

  if (path === '/dashboard') {
    content = <DashboardPage onNavigate={navigate} />;
  } else if (path === '/find-ride') {
    content = (
      <FindRidePage
        rideType="GOING_TO_COLLEGE"
        title="Find a Ride to College"
        subtitle="Search for morning rides heading to campus."
        onNavigate={navigate}
      />
    );
  } else if (path === '/find-ride-home') {
    content = (
      <FindRidePage
        rideType="RETURNING_FROM_COLLEGE"
        title="Find a Ride Home"
        subtitle="Search for rides returning from college."
        onNavigate={navigate}
      />
    );
  } else if (path === '/post-ride') {
    content = <PostRidePage onNavigate={navigate} />;
  } else if (path === '/my-rides') {
    content = <MyRidesPage onNavigate={navigate} />;
  } else if (path === '/my-bookings') {
    content = <MyBookingsPage onNavigate={navigate} />;
  } else if (path === '/profile') {
    content = <ProfilePage onNavigate={navigate} />;
  } else if (path.startsWith('/ride/')) {
    const rideId = path.slice('/ride/'.length);
    content = <RideDetailsPage rideId={rideId} onNavigate={navigate} />;
  } else {
    // Unknown route — redirect to dashboard
    navigate('/dashboard');
    return <FullPageSpinner />;
  }

  return (
    <AppLayout currentPath={path} onNavigate={navigate}>
      {content}
    </AppLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
