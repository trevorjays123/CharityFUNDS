/*
# Seed categories, campaigns, donations, and updates

1. Data
- 6 categories: Education, Health, Water & Sanitation, Disaster Relief, Animals, Environment.
- 8 approved campaigns with real stock photography, goals, and raised amounts.
- 1 pending campaign (for the admin approval flow demo).
- ~30 donations spread across campaigns (leaderboards + donor history).
- 6 campaign updates (recent news section + campaign update tabs).

2. Notes
- Rows are located by stable titles (unique), so re-running is safe via NOT EXISTS guards.
- Campaign ids are resolved by title lookups, never hardcoded uuids.
*/

INSERT INTO categories (name, slug) VALUES
  ('Education', 'education'),
  ('Health', 'health'),
  ('Water & Sanitation', 'water-sanitation'),
  ('Disaster Relief', 'disaster-relief'),
  ('Animals', 'animals'),
  ('Environment', 'environment')
ON CONFLICT (name) DO NOTHING;

INSERT INTO campaigns (title, description, story, category_id, goal_amount, raised_amount, image_url, status, creator_name, creator_email, location, featured)
SELECT v.title, v.description, v.story,
  (SELECT id FROM categories WHERE slug = v.category_slug),
  v.goal_amount, v.raised_amount, v.image_url, v.status, v.creator_name, v.creator_email, v.location, v.featured
FROM (VALUES
  ('Clean Water for Kasese Village',
   'Help us drill a solar-powered borehole so 2,400 people in Kasese no longer walk 6 miles a day for unsafe water.',
   'Every morning, Sarah and her daughters set out before dawn to collect water from a stream shared with livestock. The water makes their children sick, but there is no alternative. We are working with the Kasese community council to drill a solar-powered borehole at the center of the village, install four taps, and train local technicians to maintain the system. At $12,500, the borehole will serve 2,400 people for decades. Every contribution brings a family one step closer to safe water at their doorstep.',
   'water-sanitation', 12500.00, 8420.00,
   'https://images.pexels.com/photos/28101461/pexels-photo-28101461.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
   'approved', 'Hope Springs Initiative', 'hello@hopesprings.org', 'Kasese, Uganda', true),
  ('Books & Desks for Sitolo Primary',
   'Sixty children at Sitolo Primary learn sitting on the floor. Help us build two classrooms with desks, books, and solar lights.',
   'Sitolo Primary School was built by parents in 1998 — two brick rooms, no desks, no books beyond a single shared textbook per class, and no electricity. Enrollment has grown to 180 students, many of whom walk more than an hour each way. This campaign funds two new classrooms, 60 desks, a full set of grade-level textbooks, and solar lighting so evening classes can run during exam season. The community is contributing all the labor; we need help with materials.',
   'education', 18000.00, 11350.00,
   'https://images.pexels.com/photos/18506736/pexels-photo-18506736.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
   'approved', 'LiftEd Foundation', 'team@lifted.org', 'Lilongwe, Malawi', true),
  ('Emergency Surgery for Amara',
   'Amara, age 7, needs heart surgery her family cannot afford. Her window for a full recovery is this year.',
   'Amara was born with a hole in her heart. Doctors say her condition is operable, but only within a narrow window — and the surgery, travel, and six weeks of aftercare will cost $9,200. Her father works as a day laborer; her mother sells vegetables at the market. The family has already sold everything they can spare. Amara wants to be a teacher when she grows up. Right now, she cannot climb the stairs to her classroom without stopping to catch her breath. Your donation gives her the childhood she should have.',
   'health', 9200.00, 6745.00,
   'https://images.pexels.com/photos/6129870/pexels-photo-6129870.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
   'approved', 'Bright Future Children''s Fund', 'care@brightfuture.org', 'Addis Ababa, Ethiopia', true),
  ('Rebuild After the Floods',
   'Flash floods swept through three riverside neighborhoods. We are delivering food, clean water, and shelter kits to 800 families.',
   'In one night, the river took homes, farms, and the only bridge into the district. Rescue teams are still reaching cut-off families by boat. Our teams are on the ground with the district emergency office distributing food parcels, water purification tablets, blankets, and shelter kits. The immediate need is $22,000 for the next 60 days. After that, we will turn to rebuilding — but right now, survival comes first.',
   'disaster-relief', 22000.00, 15680.00,
   'https://images.pexels.com/photos/36288963/pexels-photo-36288963.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
   'approved', 'Rapid Response Alliance', 'ops@rapidresponse.org', 'Buenos Aires Province, Argentina', false),
  ('Second Chances Animal Shelter',
   'Our no-kill shelter cares for 140 rescued dogs. Help us feed them, vaccinate them, and find them homes.',
   'Second Chances began in a volunteer''s backyard and now cares for 140 rescued dogs across two rented plots. Every dog is vaccinated, spayed or neutered, and given a medical check on arrival. We run free spay-and-neuter days for the surrounding community to break the stray cycle at its source. Monthly food and medical costs run $4,800 — donations keep the gates open and the kennels warm.',
   'animals', 15000.00, 5230.00,
   'https://images.pexels.com/photos/35231858/pexels-photo-35231858.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
   'approved', 'Second Chances Shelter', 'adopt@secondchances.org', 'Bucharest, Romania', false),
  ('Plant 10,000 Trees on the Coast',
   'Deforested dunes are eroding into farmland. With your help we will plant and guard 10,000 native trees over two seasons.',
   'Twenty years ago these coastal hills were forest. Today the topsoil is washing into the sea, and farmers watch their yields shrink every year. We are partnering with five villages to plant 10,000 native seedlings across 30 hectares, with paid local guards and a watering rota for the two critical dry seasons. Seedlings survive when communities own the outcome — so every village co-signs the land stewardship agreement.',
   'environment', 10500.00, 3115.00,
   'https://images.pexels.com/photos/28662953/pexels-photo-28662953.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
   'approved', 'GreenRoots Collective', 'plant@greenroots.org', 'Phan Thiet, Vietnam', false),
  ('Mobile Health Clinic for Rural Kerala',
   'A converted van brings doctors, insulin, and screenings to 14 villages that are two hours from the nearest hospital.',
   'Fourteen villages in the backwaters of Kerala have no clinic within two hours by road. For residents with diabetes and hypertension, a routine check-up means a full day and lost wages — so most go untreated until it becomes an emergency. A retrofitted van with a small medical team will run a weekly circuit: screenings, prescription refills, prenatal checks, and referrals to the district hospital. One van, one team, 11,000 people reached.',
   'health', 28000.00, 19420.00,
   'https://images.pexels.com/photos/6129680/pexels-photo-6129680.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
   'approved', 'Care On Wheels Trust', 'info@careonwheels.in', 'Kerala, India', false),
  ('School Meals for 400 Children',
   'For many students at Mbeya Primary, the school lunch is the only full meal of the day. $2.50 feeds a child for a week.',
   'Teachers at Mbeya Primary noticed attendance dropped every afternoon — and the reason was hunger. Since the community kitchen opened, afternoon attendance has climbed 34%. The kitchen serves 400 children a daily plate of maize, beans, and vegetables grown by local farmers. We have funding for this term; we need to guarantee the whole school year. A $2.50 donation feeds a child for a week. $100 feeds a child for the year.',
   'education', 14000.00, 9860.00,
   'https://images.pexels.com/photos/5212329/pexels-photo-5212329.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
   'approved', 'Mbeya Community Kitchen', 'kitchen@mbeyaslunch.org', 'Mbeya, Tanzania', false),
  ('Art & Music Room for Riverside Youth Center',
   'We are converting a disused storeroom into an art and music room for the youth center — submitted for review.',
   'The Riverside Youth Center serves 120 kids after school. Our proposal: convert the disused storeroom into a bright art and music room with instruments, easels, and soundproofing. Budget covers materials, instruments, and a part-time program lead for one year.',
   'education', 7500.00, 0.00,
   'https://images.pexels.com/photos/7156163/pexels-photo-7156163.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
   'pending', 'Riverside Youth Center', 'hello@riversideyc.org', 'Portland, USA', false)
) AS v(title, description, story, category_slug, goal_amount, raised_amount, image_url, status, creator_name, creator_email, location, featured)
WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.title = v.title);

INSERT INTO donations (campaign_id, donor_name, donor_email, message, amount, payment_method, payment_status, created_at)
SELECT c.id, v.donor_name, v.donor_email, v.message, v.amount, v.payment_method, 'succeeded', v.created_at
FROM (VALUES
  ('Clean Water for Kasese Village', 'Margaret Chen', 'margaret.chen@example.com', 'Water is life. Glad to help.', 250.00, 'stripe', now() - interval '2 days'),
  ('Clean Water for Kasese Village', 'Anonymous', NULL, NULL, 50.00, 'paypal', now() - interval '4 days'),
  ('Clean Water for Kasese Village', 'The Okafor Family', 'okafor.family@example.com', 'In memory of Grandpa Joe.', 500.00, 'stripe', now() - interval '6 days'),
  ('Clean Water for Kasese Village', 'James Whitfield', 'j.whitfield@example.com', 'Keep up the incredible work.', 120.00, 'stripe', now() - interval '8 days'),
  ('Clean Water for Kasese Village', 'Priya Sharma', 'priya.s@example.com', NULL, 75.00, 'paypal', now() - interval '11 days'),
  ('Clean Water for Kasese Village', 'Anonymous', NULL, 'For the children of Kasese.', 1000.00, 'stripe', now() - interval '14 days'),
  ('Books & Desks for Sitolo Primary', 'Daniel Osei', 'd.osei@example.com', 'Education changes everything.', 300.00, 'stripe', now() - interval '1 day'),
  ('Books & Desks for Sitolo Primary', 'Helen Marsh', 'helen.marsh@example.com', NULL, 45.00, 'stripe', now() - interval '3 days'),
  ('Books & Desks for Sitolo Primary', 'Anonymous', NULL, NULL, 200.00, 'paypal', now() - interval '5 days'),
  ('Books & Desks for Sitolo Primary', 'Tomás Rivera', 'tomas.rivera@example.com', 'A desk for every child!', 150.00, 'stripe', now() - interval '9 days'),
  ('Books & Desks for Sitolo Primary', 'Grace Nwosu', 'grace.n@example.com', NULL, 500.00, 'stripe', now() - interval '12 days'),
  ('Emergency Surgery for Amara', 'Anonymous', NULL, 'Get well soon, Amara.', 100.00, 'stripe', now() - interval '1 day'),
  ('Emergency Surgery for Amara', 'Linda Kowalski', 'l.kowalski@example.com', 'Praying for a successful surgery.', 400.00, 'paypal', now() - interval '3 days'),
  ('Emergency Surgery for Amara', 'Ahmed Hassan', 'ahmed.h@example.com', NULL, 250.00, 'stripe', now() - interval '7 days'),
  ('Emergency Surgery for Amara', 'The Sunday School Class', NULL, 'Our kids collected this for your kids.', 645.00, 'stripe', now() - interval '10 days'),
  ('Rebuild After the Floods', 'Carlos Mendez', 'c.mendez@example.com', 'Standing with Argentina.', 350.00, 'stripe', now() - interval '2 days'),
  ('Rebuild After the Floods', 'Anonymous', NULL, NULL, 90.00, 'paypal', now() - interval '4 days'),
  ('Rebuild After the Floods', 'Nordic Aid Group', 'contact@nordicaid.example.org', 'For shelter kits.', 2000.00, 'stripe', now() - interval '5 days'),
  ('Rebuild After the Floods', 'Emma Thompson', 'emma.t@example.com', NULL, 60.00, 'stripe', now() - interval '8 days'),
  ('Second Chances Animal Shelter', 'Dog Lover United', 'woof@doglovers.example.com', 'For the paws!', 125.00, 'stripe', now() - interval '2 days'),
  ('Second Chances Animal Shelter', 'Anonymous', NULL, NULL, 40.00, 'paypal', now() - interval '6 days'),
  ('Second Chances Animal Shelter', 'Viktor Petrov', 'v.petrov@example.com', 'Thank you for caring for them.', 300.00, 'stripe', now() - interval '9 days'),
  ('Plant 10,000 Trees on the Coast', 'Fernando Silva', 'f.silva@example.com', NULL, 85.00, 'stripe', now() - interval '3 days'),
  ('Plant 10,000 Trees on the Coast', 'Anonymous', NULL, 'Trees for our grandchildren.', 500.00, 'paypal', now() - interval '7 days'),
  ('Plant 10,000 Trees on the Coast', 'Kira Andersen', 'kira.a@example.com', NULL, 30.00, 'stripe', now() - interval '13 days'),
  ('Mobile Health Clinic for Rural Kerala', 'Rajesh Menon', 'r.menon@example.com', 'My mother is from one of these villages. Thank you.', 1000.00, 'stripe', now() - interval '2 days'),
  ('Mobile Health Clinic for Rural Kerala', 'Anonymous', NULL, NULL, 250.00, 'stripe', now() - interval '5 days'),
  ('Mobile Health Clinic for Rural Kerala', 'Dr. Susan Lee', 's.lee@example.com', 'Preventive care saves lives.', 420.00, 'paypal', now() - interval '8 days'),
  ('School Meals for 400 Children', 'Anna Kowalska', 'anna.k@example.com', 'No child should learn on an empty stomach.', 100.00, 'stripe', now() - interval '1 day'),
  ('School Meals for 400 Children', 'Anonymous', NULL, NULL, 25.00, 'paypal', now() - interval '4 days'),
  ('School Meals for 400 Children', 'Feeding Minds Match', 'match@feedingminds.example.org', 'Matching challenge — double the meals!', 3000.00, 'stripe', now() - interval '6 days'),
  ('School Meals for 400 Children', 'Peter Bandawe', 'peter.b@example.com', NULL, 75.00, 'stripe', now() - interval '10 days')
) AS v(campaign_title, donor_name, donor_email, message, amount, payment_method, created_at)
JOIN campaigns c ON c.title = v.campaign_title
WHERE NOT EXISTS (
  SELECT 1 FROM donations d
  WHERE d.campaign_id = c.id AND d.donor_name = v.donor_name AND d.amount = v.amount
    AND d.created_at = v.created_at
);

INSERT INTO updates (campaign_id, title, body, created_at)
SELECT c.id, v.title, v.body, v.created_at
FROM (VALUES
  ('Clean Water for Kasese Village', 'Hydro survey complete', 'The geological survey confirmed a strong aquifer 60 meters below the village center. Drilling equipment arrives next week. Thank you to everyone who has given — we are 67% of the way there.', now() - interval '5 days'),
  ('Clean Water for Kasese Village', 'Community water committee elected', 'Eight residents, including four women, were elected to manage the borehole once complete. They will set collection schedules and oversee maintenance — the community owns this project.', now() - interval '18 days'),
  ('Books & Desks for Sitolo Primary', 'Local carpenters begin desk prototypes', 'Two carpentry teams from the village are building desk prototypes this week. Once approved, they will produce all 60 desks — keeping the entire materials budget inside the community.', now() - interval '3 days'),
  ('Emergency Surgery for Amara', 'Surgery date scheduled', 'Wonderful news: Amara has been accepted for surgery next month. Your donations covered the hospital deposit. We still need support for her six weeks of recovery medication and follow-up visits.', now() - interval '4 days'),
  ('Rebuild After the Floods', '600 families reached so far', 'Our teams delivered food and water purification supplies to 600 of the 800 affected families. Bridge repairs begin tomorrow, which will let trucks reach the last two neighborhoods directly.', now() - interval '2 days'),
  ('School Meals for 400 Children', 'Matching challenge met', 'The Feeding Minds $3,000 matching challenge was fully matched — that is 2,400 additional meals. Thank you for doubling your impact!', now() - interval '6 days')
) AS v(campaign_title, title, body, created_at)
JOIN campaigns c ON c.title = v.campaign_title
WHERE NOT EXISTS (SELECT 1 FROM updates u WHERE u.campaign_id = c.id AND u.title = v.title);
