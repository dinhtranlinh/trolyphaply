-- Database function for incrementing rule usage counter
-- This is called when a rule is used to send a reply

CREATE OR REPLACE FUNCTION increment_rule_usage(rule_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE auto_reply_rules
  SET 
    daily_uses_count = daily_uses_count + 1,
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE id = rule_id;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION increment_rule_usage IS 'Increments the daily usage counter for a reply rule and updates last_used_at timestamp';
