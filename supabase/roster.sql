-- Real roster for both events, generated from the uploaded spreadsheets.
-- Run AFTER schema.sql. WARNING: the delete wipes all rows (including check-ins),
-- so run this once before the event, not during it.

delete from public.physicians;

-- Liaison Lunch (26 physicians). Seat = their home table; Rotates = tables they're responsible for.
insert into public.physicians (event_type, name, rotation_tables, designated_seat)
values
  ('liaison_lunch', 'Unger', null, 'Table 30'),
  ('liaison_lunch', 'Law', 'Table 31', 'Table 32'),
  ('liaison_lunch', 'Cummings', null, 'Table 33'),
  ('liaison_lunch', 'Oaks', null, 'Table 34'),
  ('liaison_lunch', 'Moenster', 'Table 29', 'Table 35'),
  ('liaison_lunch', 'Robbins', 'Table 28', 'Table 36'),
  ('liaison_lunch', 'Myers', null, 'Table 38'),
  ('liaison_lunch', 'Scott', null, 'Table 39'),
  ('liaison_lunch', 'Brock', null, 'Table 40'),
  ('liaison_lunch', 'Fonte', 'Table 42', 'Table 41'),
  ('liaison_lunch', 'Belkoff', null, 'Table 43'),
  ('liaison_lunch', 'Smith', 'Table 45', 'Table 44'),
  ('liaison_lunch', 'Sudhakar Vadivelu', 'Table 45', 'Table 44'),
  ('liaison_lunch', 'Sungunro', 'Table 48', 'Table 46'),
  ('liaison_lunch', 'Lam', 'Table 48', 'Table 47'),
  ('liaison_lunch', 'Van Fossen', null, 'Table 49'),
  ('liaison_lunch', 'Gable', null, 'Table 50'),
  ('liaison_lunch', 'Richardson', 'Table 37', 'Table 51'),
  ('liaison_lunch', 'Nelson', 'Table 53', 'Table 52'),
  ('liaison_lunch', 'Byrge', null, 'Table 53'),
  ('liaison_lunch', 'Lopez', 'Table 55', 'Table 54'),
  ('liaison_lunch', 'Blanke', null, 'Table 56'),
  ('liaison_lunch', 'Patel', 'Table 37', 'Table 57'),
  ('liaison_lunch', 'Davis', null, 'Table 58'),
  ('liaison_lunch', 'Donatelli', null, 'Table 59'),
  ('liaison_lunch', 'Mangano', null, 'Table 60');

-- Speed Mentoring (28 physicians). Specialty tables weren't in the sheet; fill in via SQL or leave blank.
insert into public.physicians (event_type, name, specialty)
values
  ('speed_mentoring', 'Fonte', 'Trauma'),
  ('speed_mentoring', 'Mangano', 'Neurosurgery'),
  ('speed_mentoring', 'Richardson', 'Trauma'),
  ('speed_mentoring', 'Belkoff', 'Urology'),
  ('speed_mentoring', 'Lopez', 'Bariatric Surgery'),
  ('speed_mentoring', 'Scott', 'General Surgery'),
  ('speed_mentoring', 'Barrett Anderson', 'Urology'),
  ('speed_mentoring', 'Michael C. Bibler', 'CT/Vascular'),
  ('speed_mentoring', 'William A. Cline', 'General Surgery'),
  ('speed_mentoring', 'Hiren Patel', 'Neurosurgery'),
  ('speed_mentoring', 'Ron Cheney', 'General Surgery'),
  ('speed_mentoring', 'Bradley D. Carman', 'General Surgery'),
  ('speed_mentoring', 'Gary DellaZ''anna', 'General Surgery'),
  ('speed_mentoring', 'Caligiuri', 'Urology'),
  ('speed_mentoring', 'Elizabeth Boes', 'Urology'),
  ('speed_mentoring', 'Paul Levy', 'General Surgery'),
  ('speed_mentoring', 'Wayen Waterman', 'Neurosurgery'),
  ('speed_mentoring', 'Seyed-Mojtaba Gashti', 'Vascular'),
  ('speed_mentoring', 'John James Kowalczyk', 'Urology'),
  ('speed_mentoring', 'Christie Brock', 'General Surgery'),
  ('speed_mentoring', 'Moenster', 'Plastics'),
  ('speed_mentoring', 'Van Fossen', 'General Surgery'),
  ('speed_mentoring', 'Jiri Konecny', 'Plastics/Vascular'),
  ('speed_mentoring', 'Blanke', 'CT/Vascular'),
  ('speed_mentoring', 'Joseph Haydu', 'Vascular/Insurance Review'),
  ('speed_mentoring', 'Law', 'General Surgery'),
  ('speed_mentoring', 'Jump', 'Urology'),
  ('speed_mentoring', 'Carl Pesta', 'General Surgery');
