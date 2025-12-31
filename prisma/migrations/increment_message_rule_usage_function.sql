-- Database function for incrementing message rule usage counter
-- This is called when a rule is used to send an inbox message

CREATE OR REPLACE FUNCTION increment_message_rule_usage(rule_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE auto_message_rules
  SET 
    daily_uses_count = daily_uses_count + 1,
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE id = rule_id;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION increment_message_rule_usage IS 'Increments the daily usage counter for a message rule and updates last_used_at timestamp';
