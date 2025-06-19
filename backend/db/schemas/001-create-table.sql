CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  date_of_sign_in TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  latitude DECIMAL,
  longitude DECIMAL
);
