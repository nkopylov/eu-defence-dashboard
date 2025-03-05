-- Database Schema for EU Defence Dashboard

-- Company Categories
CREATE TABLE IF NOT EXISTS company_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO company_categories (name, description) 
VALUES 
  ('defense', 'Current defence manufacturers'),
  ('potential', 'Potential defence manufacturers'),
  ('materials', 'Material suppliers')
ON CONFLICT DO NOTHING;

-- Material Categories
CREATE TABLE IF NOT EXISTS material_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default material categories
INSERT INTO material_categories (name, description) 
VALUES 
  ('steel', 'Steel & Metals'),
  ('rareEarth', 'Rare Earth & Critical Minerals'),
  ('explosives', 'Explosives & Chemicals'),
  ('composites', 'Advanced Composites & Materials'),
  ('electronics', 'Electronics & Semiconductor Materials')
ON CONFLICT DO NOTHING;

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ticker VARCHAR(50) NOT NULL UNIQUE,
  country VARCHAR(100) NOT NULL,
  products TEXT NOT NULL,
  sector VARCHAR(100),
  defense_potential TEXT,
  description TEXT,
  category_id INTEGER REFERENCES company_categories(id),
  material_category_id INTEGER REFERENCES material_categories(id),
  defense_uses TEXT,
  revenue DECIMAL(10, 2),
  market_cap DECIMAL(10, 2),
  eu_fund_focus BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dependencies (Supply Chain Relationships)
CREATE TABLE IF NOT EXISTS dependencies (
  id SERIAL PRIMARY KEY,
  source_ticker VARCHAR(50) NOT NULL REFERENCES companies(ticker),
  target_ticker VARCHAR(50) NOT NULL REFERENCES companies(ticker),
  description TEXT NOT NULL,
  value INTEGER NOT NULL, -- Strength of dependency from 1-10
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (source_ticker, target_ticker)
);

-- Historical Stock Data (Optional - could be cached from Yahoo Finance)
CREATE TABLE IF NOT EXISTS stock_data (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  date DATE NOT NULL,
  open DECIMAL(10, 2) NOT NULL,
  high DECIMAL(10, 2) NOT NULL,
  low DECIMAL(10, 2) NOT NULL,
  close DECIMAL(10, 2) NOT NULL,
  volume BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (company_id, date)
);

-- User Access (Optional - if you want to add authentication later)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $func$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$func$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_companies_timestamp BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_dependencies_timestamp BEFORE UPDATE ON dependencies
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_stock_data_timestamp BEFORE UPDATE ON stock_data
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_company_categories_timestamp BEFORE UPDATE ON company_categories
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_material_categories_timestamp BEFORE UPDATE ON material_categories
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();