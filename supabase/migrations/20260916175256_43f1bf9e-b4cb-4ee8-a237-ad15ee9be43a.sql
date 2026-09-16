CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM public;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY "Admins can insert menu pages" ON public.menu_pages;
DROP POLICY "Admins can update menu pages" ON public.menu_pages;
DROP POLICY "Admins can delete menu pages" ON public.menu_pages;
DROP POLICY "Admins can update version" ON public.site_version;

CREATE POLICY "Admins can insert menu pages" ON public.menu_pages
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update menu pages" ON public.menu_pages
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete menu pages" ON public.menu_pages
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update version" ON public.site_version
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.reorder_menu_pages(_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  UPDATE public.menu_pages mp
     SET position = t.ord
    FROM (SELECT unnest(_ids) AS id, generate_subscripts(_ids, 1) AS ord) t
   WHERE mp.id = t.id;
  UPDATE public.site_version SET version = version + 1, updated_at = now() WHERE id;
END; $$;

CREATE OR REPLACE FUNCTION public.bump_site_version()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v integer;
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  UPDATE public.site_version SET version = version + 1, updated_at = now() WHERE id RETURNING version INTO v;
  RETURN v;
END; $$;

DROP FUNCTION public.has_role(uuid, public.app_role);

REVOKE ALL ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.reorder_menu_pages(uuid[]) FROM anon, public;
REVOKE ALL ON FUNCTION public.bump_site_version() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.reorder_menu_pages(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bump_site_version() TO authenticated;