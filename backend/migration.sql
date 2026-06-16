-- ============================================================
-- RBMS Migration Script (MySQL 8.0 Compliant)
-- Run this if you already have an existing database schema
-- and need to add the new enhancement columns.
-- ============================================================

USE resource_booking_db;

-- 1. Users Table Additions
ALTER TABLE users
  ADD COLUMN phone_number VARCHAR(20) DEFAULT NULL,
  ADD COLUMN address TEXT DEFAULT NULL;

-- 2. Resources Table Additions
ALTER TABLE resources
  ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00;

-- 3. Booking Resource Table Additions
ALTER TABLE booking_resource
  ADD COLUMN user_name VARCHAR(255) DEFAULT NULL,
  ADD COLUMN user_email VARCHAR(255) DEFAULT NULL,
  ADD COLUMN user_phone VARCHAR(20) DEFAULT NULL,
  ADD COLUMN user_address TEXT DEFAULT NULL,
  ADD COLUMN booking_amount DECIMAL(10,2) DEFAULT 0.00;

-- 4. Resource Pricing Table (NEW)
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
