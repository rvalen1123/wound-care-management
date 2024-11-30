-- Add name column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name text;

-- Update the name column for existing users from auth.users metadata
UPDATE profiles
SET name = (
  SELECT raw_user_meta_data->>'name'
  FROM auth.users
  WHERE auth.users.id = profiles.id
)
WHERE name IS NULL;
