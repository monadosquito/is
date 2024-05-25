DROP TABLE IF EXISTS holiday;
CREATE TABLE holiday (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL
);

DROP TABLE IF EXISTS working_weekend;
CREATE TABLE working_weekend (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE
);

DROP TABLE IF EXISTS working_hours;
CREATE TABLE working_hours (
    id SERIAL PRIMARY KEY,
    month INT UNIQUE,
    working_hours INT NOT NULL,
    CONSTRAINT month CHECK (month >= 0 AND month <= 11) 
);
