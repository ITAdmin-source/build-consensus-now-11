
-- Add custom voting button label columns to polis_polls table
ALTER TABLE polis_polls 
ADD COLUMN support_button_label TEXT DEFAULT 'תומך',
ADD COLUMN unsure_button_label TEXT DEFAULT 'לא בטוח', 
ADD COLUMN oppose_button_label TEXT DEFAULT 'מתנגד';

-- Update existing polls to have the default labels
UPDATE polis_polls 
SET support_button_label = 'תומך',
    unsure_button_label = 'לא בטוח',
    oppose_button_label = 'מתנגד'
WHERE support_button_label IS NULL 
   OR unsure_button_label IS NULL 
   OR oppose_button_label IS NULL;
