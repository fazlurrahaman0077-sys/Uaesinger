-- v13: storage limits — photos 25MB; videos 500MB bucket cap
update storage.buckets set file_size_limit=26214400 where id='creator-photos';
update storage.buckets set file_size_limit=524288000 where id='creator-videos';
