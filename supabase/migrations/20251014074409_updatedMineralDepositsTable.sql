-- Add new columns to mineralDeposits table
ALTER TABLE public."mineralDeposits"
ADD COLUMN location text NULL,
ADD COLUMN discovery bigint NULL,
ADD COLUMN created_at timestamp with time zone NULL,
ADD COLUMN "roverName" text NULL;

-- Add foreign key constraint for discovery -> classifications(id)
ALTER TABLE public."mineralDeposits"
ADD CONSTRAINT mineraldeposits_discovery_fkey
FOREIGN KEY (discovery) REFERENCES classifications(id);