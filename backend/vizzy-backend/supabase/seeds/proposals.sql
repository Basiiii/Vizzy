-- Insert proposal statuses
INSERT INTO public.proposal_statuses (id, description) VALUES 
(1, 'pending'),
(2, 'accepted'),
(3, 'rejected'),
(4, 'cancelled');

-- Sale proposals
SELECT create_proposal(
    'Offer for iPhone 13 Pro',
    'I would like to buy your iPhone. Can you deliver it?',
    1, -- listing_id
    'sale',
    'pending',
    '11111111-1111-1111-1111-111111111111', -- sender_id
    '00000000-0000-0000-0000-000000000001', -- receiver_id (owner of the listing)
    850, -- offered_price (lower than the asking price)
    NULL, -- offered_rent_per_day (not applicable for sale)
    NULL, -- start_date (not applicable for sale)
    NULL, -- end_date (not applicable for sale)
    NULL, -- swap_with (not applicable for sale)
    NULL  -- message (not applicable for sale)
);

SELECT create_proposal(
    'Interested in Gaming PC',
    'I am interested in your gaming PC. Would you accept 1400?',
    2, -- listing_id
    'sale',
    'pending',
    '22222222-2222-2222-2222-222222222222', -- sender_id
    '00000000-0000-0000-0000-000000000001', -- receiver_id (owner of the listing)
    1400, -- offered_price
    NULL, -- offered_rent_per_day
    NULL, -- start_date
    NULL, -- end_date
    NULL, -- swap_with
    NULL  -- message
);

-- Rental proposals
SELECT create_proposal(
    'Rent IKEA Desk for Event',
    'I need a desk for a week-long event. Can I rent yours?',
    6, -- listing_id
    'rental',
    'pending',
    '11111111-1111-1111-1111-111111111111', -- sender_id
    '00000000-0000-0000-0000-000000000001', -- receiver_id
    NULL, -- offered_price
    10, -- offered_rent_per_day
    '2023-12-01', -- start_date
    '2023-12-07', -- end_date
    NULL, -- swap_with
    NULL  -- message
);

-- Swap proposals
SELECT create_proposal(
    'Swap my PS5 for your Nintendo Switch',
    'I have a PS5 with extra controller. Would you be interested in swapping?',
    13, -- listing_id
    'swap',
    'pending',
    '22222222-2222-2222-2222-222222222222', -- sender_id
    '00000000-0000-0000-0000-000000000001', -- receiver_id
    NULL, -- offered_price
    NULL, -- offered_rent_per_day
    NULL, -- start_date
    NULL, -- end_date
    'PlayStation 5 with extra DualSense controller and 3 games', -- swap_with
    NULL  -- message
);

-- Giveaway proposals
SELECT create_proposal(
    'Request for Harry Potter Books',
    'My daughter is a huge Harry Potter fan and would love these books',
    10, -- listing_id
    'giveaway',
    'pending',
    '11111111-1111-1111-1111-111111111111', -- sender_id
    '00000000-0000-0000-0000-000000000001', -- receiver_id
    NULL, -- offered_price
    NULL, -- offered_rent_per_day
    NULL, -- start_date
    NULL, -- end_date
    NULL, -- swap_with
    'I would be very grateful if you could give these books to my daughter who is a huge Harry Potter fan. She has been wanting to read the complete series for a long time.'  -- message
);