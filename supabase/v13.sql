-- v13: storage limits — photos 25MB; videos 50MB (Supabase Free global cap)
update storage.buckets set file_size_limit=26214400 where id='creator-photos';
update storage.buckets set file_size_limit=52428800 where id='creator-videos';
