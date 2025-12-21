-- Insert sample users (drivers)
INSERT INTO auth.users (id, email, phone, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'driver1@example.com', '+84912345678', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'driver2@example.com', '+84923456789', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'driver3@example.com', '+84934567890', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert user profiles
INSERT INTO public.users (id, phone, full_name, role, verified, rating, total_trips)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '+84912345678', 'Nguyễn Văn Minh', 'driver', true, 4.8, 156),
  ('22222222-2222-2222-2222-222222222222', '+84923456789', 'Trần Thị Hương', 'driver', true, 4.9, 203),
  ('33333333-3333-3333-3333-333333333333', '+84934567890', 'Lê Hoàng Nam', 'driver', true, 4.7, 89)
ON CONFLICT (id) DO NOTHING;

-- Insert driver profiles
INSERT INTO public.driver_profiles (user_id, vehicle_type, vehicle_seats, vehicle_plate, vehicle_color, zalo_phone, verified_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Sedan', 4, '30A-12345', 'Trắng', '+84912345678', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'SUV', 7, '29B-67890', 'Đen', '+84923456789', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Sedan', 4, '30C-11111', 'Xám', '+84934567890', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample trips (active trips for today and tomorrow)
INSERT INTO public.trips (
  driver_id, 
  from_location, 
  to_location, 
  departure_date, 
  departure_time, 
  seats_available, 
  total_seats, 
  price, 
  vehicle_type, 
  distance_km,
  status
)
VALUES 
  -- Trip 1: Hà Nội - Hải Phòng (today)
  (
    '11111111-1111-1111-1111-111111111111',
    'Hà Nội',
    'Hải Phòng',
    CURRENT_DATE,
    '14:30:00',
    2,
    4,
    150000,
    '4 chỗ',
    120,
    'active'
  ),
  -- Trip 2: Hà Nội - Nam Định (today)
  (
    '22222222-2222-2222-2222-222222222222',
    'Hà Nội',
    'Nam Định',
    CURRENT_DATE,
    '16:00:00',
    3,
    7,
    120000,
    '7 chỗ',
    90,
    'active'
  ),
  -- Trip 3: Hà Nội - Ninh Bình (tomorrow)
  (
    '33333333-3333-3333-3333-333333333333',
    'Hà Nội',
    'Ninh Bình',
    CURRENT_DATE + INTERVAL '1 day',
    '08:00:00',
    1,
    4,
    130000,
    '4 chỗ',
    95,
    'active'
  ),
  -- Trip 4: HCM - Vũng Tàu (today)
  (
    '11111111-1111-1111-1111-111111111111',
    'TP. Hồ Chí Minh',
    'Vũng Tàu',
    CURRENT_DATE,
    '09:00:00',
    3,
    4,
    180000,
    '4 chỗ',
    125,
    'active'
  ),
  -- Trip 5: Hà Nội - Nội Bài (today)
  (
    '22222222-2222-2222-2222-222222222222',
    'Hà Nội',
    'Sân bay Nội Bài',
    CURRENT_DATE,
    '18:00:00',
    2,
    7,
    80000,
    '7 chỗ',
    35,
    'active'
  );
