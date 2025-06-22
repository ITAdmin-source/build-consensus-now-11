
-- Insert poll categories first
INSERT INTO polis_poll_categories (category_id, name) VALUES
('11111111-1111-1111-1111-111111111111', 'פוליטיקה'),
('22222222-2222-2222-2222-222222222222', 'חינוך'),
('33333333-3333-3333-3333-333333333333', 'איכות סביבה'),
('44444444-4444-4444-4444-444444444444', 'כלכלה'),
('55555555-5555-5555-5555-555555555555', 'חברה')
ON CONFLICT (category_id) DO NOTHING;

-- Insert diverse polls with different settings
INSERT INTO polis_polls (
  poll_id, title, topic, description, category_id, end_time, 
  min_consensus_points_to_win, allow_user_statements, auto_approve_statements,
  status, min_support_pct, max_opposition_pct, min_votes_per_group
) VALUES
-- Poll 1: Politics - Strict consensus requirements
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'עתיד הדמוקרטיה בישראל',
  'דמוקרטיה',
  'דיון על הרפורמות הנדרשות במערכת הדמוקרטית בישראל',
  '11111111-1111-1111-1111-111111111111',
  now() + interval '30 days',
  7,
  true,
  false,
  'active',
  70,
  20,
  5
),
-- Poll 2: Education - Moderate settings
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'מהפכה דיגיטלית בחינוך',
  'טכנולוגיה בחינוך',
  'איך להטמיע טכנולוגיה מתקדמת במערכת החינוך',
  '22222222-2222-2222-2222-222222222222',
  now() + interval '21 days',
  5,
  true,
  true,
  'active',
  60,
  30,
  3
),
-- Poll 3: Environment - Lenient consensus
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'משבר האקלים בישראל',
  'שינוי אקלים',
  'פתרונות לוכדים למשבר האקלים בישראל',
  '33333333-3333-3333-3333-333333333333',
  now() + interval '14 days',
  3,
  true,
  false,
  'active',
  55,
  35,
  2
),
-- Poll 4: Economy - No user statements
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'כלכלת היי-טק בישראל',
  'חדשנות כלכלית',
  'איך לשמור על המובילות הטכנולוגית של ישראל',
  '44444444-4444-4444-4444-444444444444',
  now() + interval '45 days',
  4,
  false,
  false,
  'active',
  65,
  25,
  4
),
-- Poll 5: Society - High consensus threshold
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'שוויון חברתי בישראל',
  'צדק חברתי',
  'דרכים לצמצום הפערים החברתיים בישראל',
  '55555555-5555-5555-5555-555555555555',
  now() + interval '60 days',
  8,
  true,
  true,
  'active',
  75,
  15,
  6
);

-- Insert statements for Poll 1 (Politics - Democracy)
INSERT INTO polis_statements (statement_id, poll_id, content, is_approved) VALUES
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'יש להגביל את כוחה של הכנסת על ידי חוקת כתובה', true),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'בית המשפט העליון צריך לשמור על עצמאותו המלאה', true),
('a3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'יש להגדיל את מספר חברי הכנסת לייצוג טוב יותר', true),
('a4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'המערכת הפוליטית זקוקה לרפורמה מיידית', true),
('a5555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'יש לעבור לבחירות ישירות לראש הממשלה', true),
('a6666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'אחוז החסימה צריך לעמוד על 5%', true),
('a7777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'יש לחזק את השלטון המקומי על חשבון הממשלה', true),
('a8888888-8888-8888-8888-888888888888', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'יש להקים בית משפט חוקתי נפרד', true);

-- Insert statements for Poll 2 (Education - Digital Revolution)
INSERT INTO polis_statements (statement_id, poll_id, content, is_approved) VALUES
('b1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'כל תלמיד צריך לקבל מחשב נישא אישי', true),
('b2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'יש להחליף ספרי לימוד בתוכן דיגיטלי', true),
('b3333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'המורים צריכים הכשרה נרחבת בטכנולוגיה', true),
('b4444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'בינה מלאכותית תשנה את פני החינוך', true),
('b5555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'יש להקדיש יותר שעות ללימודי מחשב', true),
('b6666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'למידה מרחוק תהפוך לנורמה', true);

-- Insert statements for Poll 3 (Environment - Climate Crisis)
INSERT INTO polis_statements (statement_id, poll_id, content, is_approved) VALUES
('c1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ישראל צריכה להגיע לפליטות אפס עד 2040', true),
('c2222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'יש להטיל מס פחמן על תעשיות מזהמות', true),
('c3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'תחבורה ציבורית חינמית תפחית זיהום אוויר', true),
('c4444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'יש להשקיע יותר באנרגיה סולארית', true),
('c5555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'השקיה חכמה חסכון במים הכרחי', true);

-- Insert statements for Poll 4 (Economy - Hi-Tech)
INSERT INTO polis_statements (statement_id, poll_id, content, is_approved) VALUES
('d1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'יש להקל על רגולציה לסטארט-אפים', true),
('d2222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'השקעה במחקר ופיתוח היא המפתח', true),
('d3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'יש לעודד חברות גלובליות להקים מרכזי פיתוח בישראל', true),
('d4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'מערכת החינוך צריכה לתת דגש על מקצועות הטכנולוגיה', true),
('d5555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'יש לאמץ מטבע דיגיטלי ממשלתי', true),
('d6666666-6666-6666-6666-666666666666', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'הבנק הישראלי צריך לווסת מטבעות קריפטו', true);

-- Insert statements for Poll 5 (Society - Social Equality)
INSERT INTO polis_statements (statement_id, poll_id, content, is_approved) VALUES
('e1111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'שכר מינימום צריך לעמוד על 40 שקל לשעה', true),
('e2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'יש להגדיל את המלגות לסטודנטים', true),
('e3333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'דיור ציבורי צריך להיות זמין לכל משפחה', true),
('e4444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'מס הכנסה על עשירים צריך לעלות', true),
('e5555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'רפואה פרטית צריכה להיות מוגבלת', true),
('e6666666-6666-6666-6666-666666666666', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'חינוך חינם מלידה ועד גיל 18', true),
('e7777777-7777-7777-7777-777777777777', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'יש להקים קרן לוכדת לצמצום פערים', true),
('e8888888-8888-8888-8888-888888888888', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'עבודה מרחוק תפחית את הפערים הגיאוגרפיים', true),
('e9999999-9999-9999-9999-999999999999', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'יש לחזק את האיגודים המקצועיים', true);
