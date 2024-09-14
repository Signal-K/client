ALTER TABLE public.profiles
ADD COLUMN activemission bigint NULL,
ADD COLUMN classificationPoints bigint NULL,
ADD CONSTRAINT profiles_activemission_fkey FOREIGN KEY (activemission) REFERENCES missions(id);