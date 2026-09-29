-- ============================================================
-- C2S Worker Portal — Additive Table Migration
-- Run AFTER schema_v2.sql (same database: garments_management)
-- ============================================================
USE garments_management;

-- Worker Performance Ratings (computed monthly: A+/A/A-/B/C/D)
CREATE TABLE IF NOT EXISTS worker_performance_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    rating_period DATE NOT NULL,
    attendance_rate DECIMAL(5,2) DEFAULT 0.00,
    training_completion_rate DECIMAL(5,2) DEFAULT 0.00,
    production_efficiency DECIMAL(5,2) DEFAULT 0.00,
    consistency_score DECIMAL(5,2) DEFAULT 0.00,
    grade ENUM('A+','A','A-','B','C','D') DEFAULT 'B',
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_worker_period (worker_id, rating_period),
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- Worker Overtime Requests
CREATE TABLE IF NOT EXISTS worker_overtime_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    requested_date DATE NOT NULL,
    overtime_hours DECIMAL(4,2) NOT NULL DEFAULT 2.00,
    reason TEXT,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    reviewed_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Worker Payment Methods (bKash / Nagad / Rocket / Bank Transfer)
CREATE TABLE IF NOT EXISTS worker_payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    method_type ENUM('bKash','Nagad','Rocket','Bank Transfer') NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(100),
    is_primary TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- Worker Payslips (monthly salary breakdown)
CREATE TABLE IF NOT EXISTS worker_payslips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    pay_period VARCHAR(7) NOT NULL,
    base_salary DECIMAL(10,2) DEFAULT 0.00,
    attendance_bonus DECIMAL(10,2) DEFAULT 0.00,
    performance_bonus DECIMAL(10,2) DEFAULT 0.00,
    overtime_pay DECIMAL(10,2) DEFAULT 0.00,
    deductions DECIMAL(10,2) DEFAULT 0.00,
    net_salary DECIMAL(10,2) DEFAULT 0.00,
    payment_method_id INT NULL,
    status ENUM('pending','processing','paid') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_worker_pay_period (worker_id, pay_period),
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES worker_payment_methods(id) ON DELETE SET NULL
);
