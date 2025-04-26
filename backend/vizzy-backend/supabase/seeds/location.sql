grant select on table postgis.locations to authenticated;

-- Insert test location
SELECT create_location_and_update_profile(
  '00000000-0000-0000-0000-000000000001',  -- user_id
  'Test Location, Test City',              -- address
  40.730610,                               -- latitude
  -73.935242                               -- longitude
);
