-- ═══ LAUNCH RESET ═══════════════════════════════════════════
-- Clean slate before sharing app to users.
-- Keeps: auth.users, profiles rows, is_admin flags, teams/groups/matches schedule
-- Resets: predictions, pools, pool_members, coin_transactions, match scores, coins/streak/daily

-- 1. Clear all game state
delete from coin_transactions;
delete from predictions;
delete from pool_members;
delete from pools;

-- 2. Reset matches: clear scores, set back to scheduled
update matches set
  home_score = null,
  away_score = null,
  status = 'scheduled';

-- 3. Reset profiles: 100 coins, no streak, no bonus claimed
update profiles set
  coins = 100,
  last_daily_bonus_at = null,
  current_streak = 0;

-- 4. Re-grant initial 100 tx so future audits show grant history
insert into coin_transactions (user_id, amount, reason)
select id, 100, 'initial_grant' from profiles;
