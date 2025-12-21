-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'passenger' CHECK (role IN ('passenger', 'driver', 'admin')),
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create driver_profiles table (additional info for drivers)
CREATE TABLE public.driver_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  vehicle_type VARCHAR(50) NOT NULL,
  vehicle_seats INTEGER NOT NULL,
  vehicle_plate VARCHAR(20),
  vehicle_color VARCHAR(50),
  vehicle_images TEXT[],
  license_number VARCHAR(50),
  license_images TEXT[],
  id_card_images TEXT[],
  zalo_phone VARCHAR(20),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trips table
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  from_location VARCHAR(255) NOT NULL,
  from_lat DECIMAL(10,8),
  from_lng DECIMAL(11,8),
  to_location VARCHAR(255) NOT NULL,
  to_lat DECIMAL(10,8),
  to_lng DECIMAL(11,8),
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  seats_available INTEGER NOT NULL,
  total_seats INTEGER NOT NULL,
  price DECIMAL(10,2),
  price_negotiable BOOLEAN DEFAULT FALSE,
  vehicle_type VARCHAR(50) NOT NULL,
  distance_km DECIMAL(8,2),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  passenger_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  seats_booked INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_trips_driver ON public.trips(driver_id);
CREATE INDEX idx_trips_departure ON public.trips(departure_date, departure_time);
CREATE INDEX idx_trips_locations ON public.trips(from_location, to_location);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_bookings_trip ON public.bookings(trip_id);
CREATE INDEX idx_bookings_passenger ON public.bookings(passenger_id);
CREATE INDEX idx_reviews_to_user ON public.reviews(to_user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON public.driver_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for driver_profiles table
CREATE POLICY "Anyone can view driver profiles" ON public.driver_profiles
  FOR SELECT USING (true);

CREATE POLICY "Drivers can update own profile" ON public.driver_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Drivers can insert own profile" ON public.driver_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for trips table
CREATE POLICY "Anyone can view active trips" ON public.trips
  FOR SELECT USING (status = 'active' OR driver_id = auth.uid());

CREATE POLICY "Drivers can create trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can delete own trips" ON public.trips
  FOR DELETE USING (auth.uid() = driver_id);

-- RLS Policies for bookings table
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (
    auth.uid() = passenger_id OR 
    auth.uid() IN (SELECT driver_id FROM public.trips WHERE id = trip_id)
  );

CREATE POLICY "Passengers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = passenger_id);

-- RLS Policies for reviews table
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);
