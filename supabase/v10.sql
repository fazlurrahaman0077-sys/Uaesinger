-- v10: performer gender for filtering
alter table public.artists add column if not exists gender text; -- 'male' | 'female' | 'group'
