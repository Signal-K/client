ALTER TABLE public.profiles
ADD COLUMN activeMission bigint NULL,
ADD CONSTRAINT profiles_activeMission_fkey FOREIGN KEY (activeMission) REFERENCES missions(id);