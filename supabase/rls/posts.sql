CREATE POLICY "Any user can create posts" ON "public"."posts"
AS PERMISSIVE FOR INSERT
TO public

WITH CHECK (author = auth.uid()) /* https://app.supabase.com/project/qwbufbmxkjfaikoloudl/auth/policies#27609 */

CREATE POLICY "Anyone can see all posts" ON "public"."posts"
AS PERMISSIVE FOR SELECT
TO public
USING (true)