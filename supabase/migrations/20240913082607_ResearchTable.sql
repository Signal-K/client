CREATE TABLE researched (
    id SERIAL PRIMARY KEY,  -- Unique identifier for the table (Primary Key)
    user_id INT NOT NULL,   -- Reference to the user who unlocked the technology
    tech_type VARCHAR(50) NOT NULL,  -- Type of technology to determine which API route to search (e.g., "structure", "automaton")
    tech_id INT NOT NULL,   -- ID of the unlocked technology from the relevant API route
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of when the technology was unlocked
);