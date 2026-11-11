/*
# Seed initial FAQ content

1. Data
- Six FAQs covering donations, payment methods, recurring gifts, campaign approval,
  withdrawals, and refund policy. Located by unique question text, so re-running is safe.
*/

INSERT INTO faqs (question, answer, sort_order)
SELECT v.question, v.answer, v.sort_order
FROM (VALUES
  ('Is my donation tax-deductible?',
   'GiveRoot is a demonstration platform, so no real payments are processed. On a live platform, tax deductibility depends on the organizer''s registered charity status, which would be shown on each campaign page.',
   1),
  ('How are payments processed?',
   'Donations are simulated through mock Stripe and PayPal checkouts. No card details are collected and no money ever changes hands. A production deployment would use real Stripe/PayPal checkout sessions via a secure server function.',
   2),
  ('How does monthly giving work?',
   'Choose "Monthly" in the donation window. Your gift repeats automatically every month and you can see the next charge date in your dashboard. In this demo, recurring donations are recorded but never actually billed.',
   3),
  ('How long does campaign approval take?',
   'Every submitted campaign is reviewed by our team before it goes live — usually within one business day. You will see your campaign on the browse page once it is approved.',
   4),
  ('When do organizers receive the money?',
   'Organizers can request a withdrawal of the amount raised at any time from their campaign page. Our admin team reviews and processes each payout request.',
   5),
  ('Can I get a refund?',
   'If you believe a donation was made in error, contact us within 14 days via the contact page and we will work with the organizer to resolve it.',
   6)
) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM faqs f WHERE f.question = v.question);
