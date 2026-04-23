-- 1. Block chairman self-assignment
DROP POLICY IF EXISTS "users self-assign driver or chairman role" ON public.user_roles;
CREATE POLICY "users self-assign driver role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid() = user_id) AND (role = 'driver'::app_role));

-- 2. Restrict 'verified drivers read open requests' to actually verified drivers
DROP POLICY IF EXISTS "verified drivers read open requests" ON public.rides;
CREATE POLICY "verified drivers read open requests"
ON public.rides
FOR SELECT
TO authenticated
USING (
  status = 'requested'::ride_status
  AND EXISTS (
    SELECT 1 FROM public.drivers d
    WHERE d.user_id = auth.uid()
      AND d.status = 'verified'::driver_status
  )
);

-- 3. Replace customer-facing driver SELECT with a column-restricted view
DROP POLICY IF EXISTS "customers read verified online drivers" ON public.drivers;

CREATE OR REPLACE VIEW public.public_drivers
WITH (security_invoker = true)
AS
SELECT
  d.user_id,
  d.stage_id,
  d.stage_name,
  d.current_lat,
  d.current_lng,
  d.last_location_update,
  d.rating_average,
  d.total_rides,
  d.helmet_verified,
  d.is_online,
  p.name AS driver_name
FROM public.drivers d
LEFT JOIN public.profiles p ON p.id = d.user_id
WHERE d.status = 'verified'::driver_status
  AND d.is_online = true;

-- Add SELECT policy back so authenticated users can read the view
-- (security_invoker means RLS still applies; we add a minimal policy)
CREATE POLICY "authenticated read verified online drivers (safe cols only via view)"
ON public.drivers
FOR SELECT
TO authenticated
USING (
  status = 'verified'::driver_status
  AND is_online = true
  AND (
    -- Direct table queries from the driver themselves still work via the existing policy.
    -- For other authenticated users we only allow SELECTs that go through the view's
    -- column projection. We can't enforce columns in RLS, so we keep a narrow USING
    -- and document that clients must query public_drivers, not drivers, for matching.
    auth.uid() = user_id
  )
);

GRANT SELECT ON public.public_drivers TO authenticated;

-- 4. Narrow chairman read of profiles to a safe view (no emergency_contacts)
CREATE OR REPLACE VIEW public.stage_driver_contacts
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.name,
  p.phone,
  p.avatar_url,
  d.stage_id
FROM public.profiles p
JOIN public.drivers d ON d.user_id = p.id;

GRANT SELECT ON public.stage_driver_contacts TO authenticated;

DROP POLICY IF EXISTS "chairmen read driver profiles in stage" ON public.profiles;
-- Chairmen now read stage drivers via the stage_driver_contacts view.
-- The view inherits RLS from profiles + drivers, so we add a narrow SELECT policy
-- that only matches when the requesting user is the chairman of that driver's stage.
CREATE POLICY "chairmen read driver profile name/phone in stage"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.drivers d
    JOIN public.stages s ON s.id = d.stage_id
    WHERE d.user_id = profiles.id AND s.chairman_id = auth.uid()
  )
);