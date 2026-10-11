/*
# Campus Smart Ride — Initial Schema

## Overview
Creates the full database for a privacy-preserving college student ride-sharing platform.
Students post rides between predefined pickup zones and college, and book seats on rides posted by other students.

## Tables

### pickup_zones
Predefined pickup zones (e.g., SRM Main Gate, SRM Hostel, Ramapuram Bus Stop, DLF Bus Stop).
- `id` uuid PK
- `name` text unique NOT NULL — the display name of the zone
- `created_at` timestamptz

### profiles
Extends auth.users with app-specific data for each student.
- `id` uuid PK — references auth.users(id), ON DELETE CASCADE
- `full_name` text NOT NULL
- `phone` text
- `college` text NOT NULL
- `role` text NOT NULL DEFAULT 'PASSENGER' — 'DRIVER' or 'PASSENGER'
- `created_at` timestamptz

### vehicles
Vehicles owned by drivers.
- `id` uuid PK
- `user_id` uuid NOT NULL DEFAULT auth.uid() — owner (driver)
- `make` text NOT NULL
- `model` text NOT NULL
- `plate_number` text NOT NULL
- `color` text
- `capacity` int NOT NULL — total seats including driver
- `created_at` timestamptz

### rides
A ride posted by a driver.
- `id` uuid PK
- `user_id` uuid NOT NULL DEFAULT auth.uid() — the driver who posted
- `ride_type` text NOT NULL — 'GOING_TO_COLLEGE' or 'RETURNING_FROM_COLLEGE'
- `pickup_zone_id` uuid NOT NULL REFERENCES pickup_zones(id)
- `destination` text NOT NULL — the college name / campus
- `ride_date` date NOT NULL
- `ride_time` time NOT NULL
- `available_seats` int NOT NULL — seats available for passengers (excludes driver)
- `vehicle_id` uuid NOT NULL REFERENCES vehicles(id)
- `notes` text
- `status` text NOT NULL DEFAULT 'ACTIVE' — 'ACTIVE' or 'CANCELLED'
- `created_at` timestamptz

### bookings
A passenger's request for a seat on a ride.
- `id` uuid PK
- `user_id` uuid NOT NULL DEFAULT auth.uid() — the passenger
- `ride_id` uuid NOT NULL REFERENCES rides(id) ON DELETE CASCADE
- `seats_requested` int NOT NULL DEFAULT 1
- `status` text NOT NULL DEFAULT 'PENDING' — 'PENDING','ACCEPTED','REJECTED','CANCELLED'
- `created_at` timestamptz

## Security (RLS)
All tables have RLS enabled. Policies:
- pickup_zones: readable by all authenticated users (shared reference data). Inserts/updates/deletes restricted to authenticated (admin-managed seed data).
- profiles: each user reads/updates their own profile row. No inserts needed from client (auto-created via trigger).
- vehicles: owner-scoped CRUD (a driver manages only their own vehicles). All authenticated users can SELECT (to see vehicle info on rides).
- rides: all authenticated users can SELECT (to find rides). Only the ride's driver can INSERT/UPDATE/DELETE their own rides.
- bookings: all authenticated users can SELECT (drivers need to see requests for their rides, passengers see their own bookings). A passenger can INSERT/DELETE their own bookings. A passenger can UPDATE (cancel) their own bookings. A ride's driver can UPDATE bookings on their rides (to accept/reject).

## Trigger
A trigger auto-creates a profile row when a new auth.users row is inserted, so signUp works without a separate profile insert.

## Notes
1. The `profiles` table uses a trigger to auto-insert on signup. The client passes full_name/college/role via user_metadata during signUp, and the trigger copies those into the profile row.
2. `available_seats` on rides is decremented by the application logic when a booking is accepted (done in client code by updating the ride row).
3. Pickup zones are seeded with 4 example zones.
*/

-- =============================================================
-- PICKUP ZONES
-- =============================================================
CREATE TABLE IF NOT EXISTS pickup_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pickup_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "zones_select_all" ON pickup_zones;
CREATE POLICY "zones_select_all" ON pickup_zones FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "zones_insert_auth" ON pickup_zones;
CREATE POLICY "zones_insert_auth" ON pickup_zones FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "zones_update_auth" ON pickup_zones;
CREATE POLICY "zones_update_auth" ON pickup_zones FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "zones_delete_auth" ON pickup_zones;
CREATE POLICY "zones_delete_auth" ON pickup_zones FOR DELETE
  TO authenticated USING (true);

-- =============================================================
-- PROFILES
-- =============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  college text NOT NULL,
  role text NOT NULL DEFAULT 'PASSENGER' CHECK (role IN ('DRIVER','PASSENGER')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =============================================================
-- VEHICLES
-- =============================================================
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  make text NOT NULL,
  model text NOT NULL,
  plate_number text NOT NULL,
  color text,
  capacity int NOT NULL CHECK (capacity > 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicles_select_all" ON vehicles;
CREATE POLICY "vehicles_select_all" ON vehicles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "vehicles_insert_own" ON vehicles;
CREATE POLICY "vehicles_insert_own" ON vehicles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "vehicles_update_own" ON vehicles;
CREATE POLICY "vehicles_update_own" ON vehicles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "vehicles_delete_own" ON vehicles;
CREATE POLICY "vehicles_delete_own" ON vehicles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =============================================================
-- RIDES
-- =============================================================
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  ride_type text NOT NULL CHECK (ride_type IN ('GOING_TO_COLLEGE','RETURNING_FROM_COLLEGE')),
  pickup_zone_id uuid NOT NULL REFERENCES pickup_zones(id),
  destination text NOT NULL,
  ride_date date NOT NULL,
  ride_time time NOT NULL,
  available_seats int NOT NULL CHECK (available_seats >= 0),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id),
  notes text,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','CANCELLED')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rides_select_all" ON rides;
CREATE POLICY "rides_select_all" ON rides FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "rides_insert_own" ON rides;
CREATE POLICY "rides_insert_own" ON rides FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "rides_update_own" ON rides;
CREATE POLICY "rides_update_own" ON rides FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "rides_delete_own" ON rides;
CREATE POLICY "rides_delete_own" ON rides FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =============================================================
-- BOOKINGS
-- =============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  ride_id uuid NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  seats_requested int NOT NULL DEFAULT 1 CHECK (seats_requested > 0),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACCEPTED','REJECTED','CANCELLED')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Passengers can see their own bookings; drivers can see bookings for their rides
DROP POLICY IF EXISTS "bookings_select_relevant" ON bookings;
CREATE POLICY "bookings_select_relevant" ON bookings FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM rides r WHERE r.id = bookings.ride_id AND r.user_id = auth.uid()
    )
  );

-- Only the passenger can create their booking
DROP POLICY IF EXISTS "bookings_insert_own" ON bookings;
CREATE POLICY "bookings_insert_own" ON bookings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Passenger can cancel their own booking; driver can accept/reject
DROP POLICY IF EXISTS "bookings_update_own_or_driver" ON bookings;
CREATE POLICY "bookings_update_own_or_driver" ON bookings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM rides r WHERE r.id = bookings.ride_id AND r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM rides r WHERE r.id = bookings.ride_id AND r.user_id = auth.uid()
    )
  );

-- Passenger can delete their own booking
DROP POLICY IF EXISTS "bookings_delete_own" ON bookings;
CREATE POLICY "bookings_delete_own" ON bookings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, college, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'college', 'Unknown College'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'PASSENGER')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- SEED PICKUP ZONES
-- =============================================================
INSERT INTO pickup_zones (name) VALUES
  ('SRM Main Gate'),
  ('SRM Hostel'),
  ('Ramapuram Bus Stop'),
  ('DLF Bus Stop')
ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_rides_user_id ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_ride_type ON rides(ride_type);
CREATE INDEX IF NOT EXISTS idx_rides_pickup_zone ON rides(pickup_zone_id);
CREATE INDEX IF NOT EXISTS idx_rides_date ON rides(ride_date);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ride_id ON bookings(ride_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
