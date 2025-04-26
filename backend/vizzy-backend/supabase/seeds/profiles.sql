/* -- Create trigger to handle new user creation
create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();
 */
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

INSERT INTO profiles (id, username, email, name, is_deleted, location_id) VALUES 
('11111111-1111-1111-1111-111111111111', 'testuser1', 'test1@example.com', 'Test User 1', false, null),
('22222222-2222-2222-2222-222222222222', 'testuser2', 'test2@example.com', 'Test User 2', false, null); 
