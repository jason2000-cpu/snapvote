-- Create a function to increment vote count for a poll option
CREATE OR REPLACE FUNCTION increment_vote(option_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the votes count for the specified option
  UPDATE options
  SET votes = COALESCE(votes, 0) + 1
  WHERE id = option_id;
  
  -- If no rows were affected, the option doesn't exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Option with ID % not found', option_id;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_vote(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_vote(UUID) TO anon;