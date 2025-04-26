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
