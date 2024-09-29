CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


create policy "Anyone can upload an avatar."
on "storage"."objects"
as permissive
for insert
to public
with check ((bucket_id = 'avatars'::text));


create policy "Avatar images are publicly accessible."
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'avatars'::text));


create policy "Enable read access for all users zj231d_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'anomalies'::text));


create policy "Enable read access for all users zj231d_1"
on "storage"."objects"
as permissive
for insert
to public
with check ((bucket_id = 'anomalies'::text));


create policy "Enable read access for all users zj231d_2"
on "storage"."objects"
as permissive
for update
to public
using ((bucket_id = 'anomalies'::text));


create policy "Enable read access for all users zj231d_3"
on "storage"."objects"
as permissive
for delete
to public
using ((bucket_id = 'anomalies'::text));


-- create policy "Enable read access for all users zj231d_0"
-- on "storage"."objects"
-- as permissive
-- for select
-- to public
-- using ((bucket_id = 'clouds'::text));


-- create policy "Enable read access for all users zj231d_1"
-- on "storage"."objects"
-- as permissive
-- for insert
-- to public
-- with check ((bucket_id = 'clouds'::text));


-- create policy "Enable read access for all users zj231d_2"
-- on "storage"."objects"
-- as permissive
-- for update
-- to public
-- using ((bucket_id = 'clouds'::text));


-- create policy "Enable read access for all users zj231d_3"
-- on "storage"."objects"
-- as permissive
-- for delete
-- to public
-- using ((bucket_id = 'clouds'::text));

-- create policy "Enable read access for all users zj231d_0"
-- on "storage"."objects"
-- as permissive
-- for select
-- to public
-- using ((bucket_id = 'zoodex'::text));


-- create policy "Enable read access for all users zj231d_1"
-- on "storage"."objects"
-- as permissive
-- for insert
-- to public
-- with check ((bucket_id = 'zoodex'::text));


-- create policy "Enable read access for all users zj231d_2"
-- on "storage"."objects"
-- as permissive
-- for update
-- to public
-- using ((bucket_id = 'zoodex'::text));


-- create policy "Enable read access for all users zj231d_3"
-- on "storage"."objects"
-- as permissive
-- for delete
-- to public
-- using ((bucket_id = 'zoodex'::text));