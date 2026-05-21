-- One-off: remove cgraells@hotmail.com (forgot password).
-- Cascade deletes profile, predictions, pools (creator), pool_members, coin_transactions.
delete from auth.users where email = 'cgraells@hotmail.com';
