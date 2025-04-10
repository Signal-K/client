CREATE TABLE public.events (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    location BIGINT NOT NULL REFERENCES anomalies(id) ON DELETE CASCADE,
    classification_location BIGINT NOT NULL REFERENCES classifications(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    configuration JSONB NOT NULL,
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed BOOLEAN NOT NULL DEFAULT FALSE
) TABLESPACE pg_default;