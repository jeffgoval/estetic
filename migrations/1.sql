
-- Tenants table for multi-tenant architecture
CREATE TABLE tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  subdomain TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  is_active BOOLEAN DEFAULT 1,
  plan_type TEXT DEFAULT 'basic',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table with tenant association
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  mocha_user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT 1,
  permissions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dentists table
CREATE TABLE dentists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  cro_number TEXT,
  specialty TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT 1,
  working_hours TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  cpf TEXT,
  birth_date DATE,
  address TEXT,
  emergency_contact TEXT,
  medical_history TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  dentist_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  status TEXT DEFAULT 'scheduled',
  appointment_type TEXT,
  notes TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Procedures table
CREATE TABLE procedures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  price REAL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Waiting list table
CREATE TABLE waiting_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  dentist_id INTEGER,
  procedure_id INTEGER,
  preferred_date DATE,
  preferred_time_start TEXT,
  preferred_time_end TEXT,
  priority INTEGER DEFAULT 1,
  status TEXT DEFAULT 'waiting',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
