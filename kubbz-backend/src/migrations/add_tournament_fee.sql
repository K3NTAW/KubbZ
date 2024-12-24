-- Add fee column to tournaments table
ALTER TABLE tournaments
ADD COLUMN fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- Update existing tournaments to have a default fee if needed
UPDATE tournaments SET fee = 0.00 WHERE fee IS NULL;
