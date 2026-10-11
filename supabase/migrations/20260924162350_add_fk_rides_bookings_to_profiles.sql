-- Add FK from rides.user_id to profiles.id so PostgREST can join rides -> profiles (driver info)
ALTER TABLE rides
  ADD CONSTRAINT rides_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add FK from bookings.user_id to profiles.id so PostgREST can join bookings -> profiles (passenger info)
ALTER TABLE bookings
  ADD CONSTRAINT bookings_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
