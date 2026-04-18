-- Screens
INSERT INTO screens (id, name, capacity, is_active) VALUES 
  (gen_random_uuid(), 'Screen A', 10, true), 
  (gen_random_uuid(), 'Screen B', 10, true);

-- Time Slots (9AM to 10PM = 13 slots)
INSERT INTO time_slots (id, slot_label, start_time, end_time, slot_order) VALUES
  (gen_random_uuid(), '9:00 AM – 10:00 AM',  '09:00', '10:00', 1),
  (gen_random_uuid(), '10:00 AM – 11:00 AM', '10:00', '11:00', 2),
  (gen_random_uuid(), '11:00 AM – 12:00 PM', '11:00', '12:00', 3),
  (gen_random_uuid(), '12:00 PM – 1:00 PM',  '12:00', '13:00', 4),
  (gen_random_uuid(), '1:00 PM – 2:00 PM',   '13:00', '14:00', 5),
  (gen_random_uuid(), '2:00 PM – 3:00 PM',   '14:00', '15:00', 6),
  (gen_random_uuid(), '3:00 PM – 4:00 PM',   '15:00', '16:00', 7),
  (gen_random_uuid(), '4:00 PM – 5:00 PM',   '16:00', '17:00', 8),
  (gen_random_uuid(), '5:00 PM – 6:00 PM',   '17:00', '18:00', 9),
  (gen_random_uuid(), '6:00 PM – 7:00 PM',   '18:00', '19:00', 10),
  (gen_random_uuid(), '7:00 PM – 8:00 PM',   '19:00', '20:00', 11),
  (gen_random_uuid(), '8:00 PM – 9:00 PM',   '20:00', '21:00', 12),
  (gen_random_uuid(), '9:00 PM – 10:00 PM',  '21:00', '22:00', 13);

-- Pricing
INSERT INTO pricing_config (id, party_type, label, persons_min, persons_max, price_per_hour) VALUES
  (gen_random_uuid(), 'couple',      'Couple (2 persons)',  2, 2,    600),
  (gen_random_uuid(), 'group_small', 'Group - 3 persons',  3, 3,    900),
  (gen_random_uuid(), 'group_large', 'Group - 4+ persons', 4, NULL, 1500);
