-- v17: Lifestyle Companion category
insert into public.categories (slug,label,emoji,blurb,sort_order) values ('lifestyle','Lifestyle Companion','🥂','Event companions, social hosts & hostesses and dinner companions.',19) on conflict (slug) do update set label=excluded.label, emoji=excluded.emoji, blurb=excluded.blurb, sort_order=excluded.sort_order;
