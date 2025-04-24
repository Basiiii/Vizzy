-- Create trigger to handle new user creation
create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();

-- Insert test profile
INSERT INTO public.profiles (id, username, name, location_id, is_deleted, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Basi',
  'Test User',
  NULL,
  false,
  'basi@test.com'
);
