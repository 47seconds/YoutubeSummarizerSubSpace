/*
  # Create summaries table

  1. New Tables
    - `summaries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `youtube_url` (text)
      - `summary_content` (text)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `summaries` table
    - Add policy for users to read and create their own summaries
*/

CREATE TABLE IF NOT EXISTS summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  youtube_url text NOT NULL,
  summary_content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own summaries"
  ON summaries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own summaries"
  ON summaries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);