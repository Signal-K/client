CREATE TABLE planet_status (
    id SERIAL PRIMARY KEY,
    planet_id INTEGER REFERENCES planetsss (id),
    status VARCHAR(20) NOT NULL,
    updated_by VARCHAR(36)
);