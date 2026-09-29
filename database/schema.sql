-- Garments Management System Database Schema

CREATE DATABASE IF NOT EXISTS garments_management;
USE garments_management;

-- Users table for authentication
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'worker') DEFAULT 'worker',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Workers table
CREATE TABLE workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    position VARCHAR(50),
    line_assignment VARCHAR(20),
    hire_date DATE,
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Inventory products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    product_code VARCHAR(20) UNIQUE NOT NULL,
    category VARCHAR(50),
    buying_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2),
    quantity INT DEFAULT 0,
    threshold_value INT DEFAULT 10,
    manufacture_date DATE,
    expiry_date DATE,
    supplier VARCHAR(100),
    status ENUM('in_stock', 'low_stock', 'out_of_stock') DEFAULT 'in_stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Production lines table
CREATE TABLE production_lines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    line_name VARCHAR(20) UNIQUE NOT NULL,
    line_type VARCHAR(50),
    supervisor_id INT,
    capacity INT DEFAULT 0,
    current_workers INT DEFAULT 0,
    status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
    FOREIGN KEY (supervisor_id) REFERENCES workers(id) ON DELETE SET NULL
);

-- Production records table
CREATE TABLE production_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    line_id INT,
    worker_id INT,
    product_id INT,
    quantity_produced INT DEFAULT 0,
    production_date DATE NOT NULL,
    shift VARCHAR(20),
    quality_status ENUM('passed', 'failed', 'pending') DEFAULT 'pending',
    FOREIGN KEY (line_id) REFERENCES production_lines(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Defects table
CREATE TABLE defects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    production_record_id INT,
    defect_type ENUM('dirtying', 'color', 'cutting', 'stitching', 'finishing', 'other') NOT NULL,
    description TEXT,
    severity ENUM('minor', 'major', 'critical') DEFAULT 'minor',
    reported_by INT,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('open', 'investigating', 'resolved') DEFAULT 'open',
    FOREIGN KEY (production_record_id) REFERENCES production_records(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES workers(id) ON DELETE SET NULL
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    order_date DATE NOT NULL,
    delivery_date DATE,
    total_quantity INT DEFAULT 0,
    total_amount DECIMAL(12, 2),
    status ENUM('pending', 'in_production', 'completed', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT DEFAULT 0,
    unit_price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Machine maintenance table
CREATE TABLE machines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machine_name VARCHAR(100) NOT NULL,
    machine_code VARCHAR(20) UNIQUE NOT NULL,
    line_id INT,
    purchase_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    status ENUM('operational', 'maintenance', 'broken') DEFAULT 'operational',
    FOREIGN KEY (line_id) REFERENCES production_lines(id) ON DELETE SET NULL
);

-- Maintenance records table
CREATE TABLE maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id INT,
    maintenance_type VARCHAR(50),
    description TEXT,
    cost DECIMAL(10, 2),
    performed_by INT,
    maintenance_date DATE,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES workers(id) ON DELETE SET NULL
);

-- Attendance table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    shift VARCHAR(20),
    status ENUM('present', 'absent', 'late', 'half_day') DEFAULT 'present',
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- Waste tracking table
CREATE TABLE waste_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    line_id INT,
    waste_type VARCHAR(50),
    quantity_kg DECIMAL(10, 2),
    cost_usd DECIMAL(10, 2),
    date DATE NOT NULL,
    reason TEXT,
    FOREIGN KEY (line_id) REFERENCES production_lines(id) ON DELETE SET NULL
);

-- Insert default admin user (password: admin123 - should be hashed in production)
INSERT INTO users (email, password, full_name, role) VALUES 
('admin@c2s.com', 'admin123', 'System Administrator', 'admin');

-- Insert sample products
INSERT INTO products (product_name, product_code, category, buying_price, selling_price, quantity, threshold_value, manufacture_date, status) VALUES
('Shirt', 'PRD001', 'Apparel', 15.00, 25.00, 500, 50, '2024-01-15', 'in_stock'),
('Jacket', 'PRD002', 'Apparel', 35.00, 55.00, 0, 30, '2024-01-10', 'out_of_stock'),
('Jeans', 'PRD003', 'Apparel', 20.00, 35.00, 800, 60, '2024-01-20', 'in_stock'),
('Pants', 'PRD004', 'Apparel', 18.00, 30.00, 0, 40, '2024-01-12', 'out_of_stock'),
('V Neck', 'PRD005', 'Apparel', 12.00, 22.00, 300, 35, '2024-01-18', 'in_stock'),
('Polo', 'PRD006', 'Apparel', 14.00, 24.00, 450, 45, '2024-01-16', 'in_stock'),
('Cotton', 'PRD007', 'Raw Material', 8.00, 15.00, 0, 100, '2024-01-08', 'out_of_stock'),
('Tank Top', 'PRD008', 'Apparel', 10.00, 18.00, 200, 25, '2024-01-22', 'in_stock'),
('Hoodie', 'PRD009', 'Apparel', 25.00, 45.00, 15, 30, '2024-01-14', 'low_stock');

-- Insert sample production lines
INSERT INTO production_lines (line_name, line_type, capacity, current_workers, status) VALUES
('Line-A', 'Sewing', 50, 45, 'active'),
('Line-B', 'Sewing', 50, 42, 'active'),
('Line-C', 'Finishing', 30, 28, 'active'),
('Line-D', 'Quality Control', 20, 18, 'active'),
('Line-E', 'Packaging', 25, 22, 'active'),
('Line-F', 'Sewing', 50, 35, 'maintenance');