CREATE DATABASE IF NOT EXISTS resource_booking_db;
USE resource_booking_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'USER',
  phone_number VARCHAR(20) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Resources Table
CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  capacity INT NOT NULL,
  image_url TEXT,
  availability BOOLEAN DEFAULT TRUE,
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Resource Pricing Table (Dynamic slot-based pricing)
CREATE TABLE IF NOT EXISTS resource_pricing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_id INT NOT NULL,
  pricing_type ENUM('hourly', 'slot_based', 'full_day') NOT NULL DEFAULT 'slot_based',
  slot_name VARCHAR(100) DEFAULT NULL,
  start_time TIME DEFAULT NULL,
  end_time TIME DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- 4. Booking Resource Table
CREATE TABLE IF NOT EXISTS booking_resource (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  resource_id INT NOT NULL,
  resource_name VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) DEFAULT NULL,
  user_email VARCHAR(255) DEFAULT NULL,
  user_phone VARCHAR(20) DEFAULT NULL,
  user_address TEXT DEFAULT NULL,
  booking_date DATE NOT NULL,
  booking_start_time TIME NOT NULL,
  booking_end_time TIME NOT NULL,
  purpose TEXT,
  booking_amount DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'Pending',
  remarks TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);
