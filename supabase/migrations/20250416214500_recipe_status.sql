-- Add status column to recipes table
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS status TEXT 
CHECK (status IN ('draft', 'published', 'archived')) 
DEFAULT 'published';
