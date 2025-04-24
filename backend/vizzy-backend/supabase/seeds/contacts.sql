-- Create contact information for users
INSERT INTO public.contacts (name, description, phone_number, user_id) VALUES 
('Work Mobile', 'Available on business days 9-5', '+351123456789', '11111111-1111-1111-1111-111111111111'::uuid),
('Personal Mobile', 'Available evenings and weekends', '+351987654321', '11111111-1111-1111-1111-111111111111'::uuid),
('Business Line', 'Office contact', '+351444555666', '22222222-2222-2222-2222-222222222222'::uuid); 