-- ============================================================
-- C2S Worker Dashboard — Sample Data for Testing
-- Run this AFTER schema_v2.sql and schema_worker_portal_tables.sql
-- ============================================================
USE garments_management;

-- ============================================================
-- 0. CREATE TABLES IF NOT EXISTS
-- ============================================================

CREATE TABLE IF NOT EXISTS worker_daily_output (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    output_date DATE NOT NULL,
    quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_worker_date (worker_id, output_date),
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- ============================================================
-- 1. DAILY OUTPUT DATA (for "Today's Output" card)
-- ============================================================
-- Replace <WORKER_ID> with the actual worker ID for Jannatul Ferdous (EMP-1004)
-- You can find it by running: SELECT id FROM workers WHERE employee_id = 'EMP-1004';

INSERT INTO worker_daily_output (worker_id, output_date, quantity) VALUES
(<WORKER_ID>, CURDATE(), 62),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 58),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 55),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 60),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 65),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 52),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 48)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

-- ============================================================
-- 2. ATTENDANCE DATA (for "Attendance Rate" and "Attendance Chart")
-- ============================================================
-- This creates attendance records for the current month
-- Adjust dates as needed for your testing

INSERT INTO attendance (worker_id, date, shift, check_in, check_out, status, overtime_hours) VALUES
-- This week (for the 7-day chart)
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'morning', '07:55:00', '17:05:00', 'present', 1.5),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'morning', '08:00:00', '17:00:00', 'present', 0),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'morning', '08:15:00', '17:00:00', 'late', 0),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'morning', '07:50:00', '19:00:00', 'present', 2.0),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'morning', '08:00:00', '12:00:00', 'half_day', 0),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'morning', '07:45:00', '17:30:00', 'present', 1.0),
(<WORKER_ID>, CURDATE(), 'morning', '08:00:00', NULL, 'present', 0),

-- Earlier this month (for monthly attendance rate)
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'morning', '07:55:00', '17:05:00', 'present', 1.5),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 11 DAY), 'morning', '08:00:00', '17:00:00', 'present', 0),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'morning', '08:00:00', '17:00:00', 'present', 0),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 13 DAY), 'morning', '07:50:00', '17:10:00', 'present', 0.5),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'morning', '08:00:00', '12:00:00', 'half_day', 0),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 17 DAY), 'morning', '07:55:00', '17:05:00', 'present', 1.5),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 18 DAY), 'morning', '08:00:00', '17:00:00', 'present', 0),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 19 DAY), 'morning', '08:00:00', '17:00:00', 'present', 0),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'morning', '07:50:00', '17:10:00', 'present', 0.5),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 21 DAY), 'morning', '08:00:00', '12:00:00', 'half_day', 0)
ON DUPLICATE KEY UPDATE status = VALUES(status), check_in = VALUES(check_in), check_out = VALUES(check_out), overtime_hours = VALUES(overtime_hours);

-- ============================================================
-- 3. OVERTIME REQUESTS (for "Overtime" card and history)
-- ============================================================

INSERT INTO worker_overtime_requests (worker_id, requested_date, overtime_hours, reason, status, reviewed_by) VALUES
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 2.0, 'Urgent order completion - Line F01', 'approved', 1),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 1.5, 'Extra production target', 'approved', 1),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 2.0, 'Machine maintenance support', 'approved', 1),
(<WORKER_ID>, DATE_SUB(CURDATE(), INTERVAL 17 DAY), 1.5, 'Monthly target push', 'approved', 1);

-- ============================================================
-- 4. TRAINING ASSIGNMENTS (for "Consistency Rating" - training component)
-- ============================================================

INSERT INTO training_assignments (worker_id, training_module, supervisor_id, start_date, target_completion_date, status, score, notes) VALUES
(<WORKER_ID>, 'Advanced Finishing Techniques', 1, DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'completed', 88.5, 'Excellent progress on finishing quality'),
(<WORKER_ID>, 'Quality Control Standards', 1, DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'completed', 92.0, 'Passed all QC assessments'),
(<WORKER_ID>, 'Workplace Safety Protocol', 1, DATE_SUB(CURDATE(), INTERVAL 8 DAY), DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'in_progress', NULL, 'Ongoing safety training');

-- ============================================================
-- 5. WORKER PAYSLIPS (for Payment History)
-- ============================================================

INSERT INTO worker_payslips (worker_id, pay_period, base_salary, attendance_bonus, performance_bonus, overtime_pay, deductions, net_salary, payment_method_id, status, paid_at) VALUES
(<WORKER_ID>, DATE_FORMAT(CURDATE(), '%Y-%m'), 14500.00, 1200.00, 800.00, 1440.00, 450.00, 17490.00, 1, 'pending', NULL),
(<WORKER_ID>, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 14500.00, 1000.00, 750.00, 960.00, 450.00, 16760.00, 1, 'paid', DATE_SUB(CURDATE(), INTERVAL 1 MONTH)),
(<WORKER_ID>, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m'), 14500.00, 1100.00, 700.00, 1200.00, 450.00, 17050.00, 1, 'paid', DATE_SUB(CURDATE(), INTERVAL 2 MONTH));

-- ============================================================
-- 6. WORKER PAYMENT METHODS (for Payment Methods display)
-- ============================================================

INSERT INTO worker_payment_methods (worker_id, method_type, account_number, account_name, is_primary) VALUES
(<WORKER_ID>, 'bKash', '017110000007', 'Jannatul Ferdous', 1),
(<WORKER_ID>, 'Nagad', '01898765432', 'Jannatul Ferdous', 0);

-- ============================================================
-- VERIFICATION QUERIES (run these to verify the data)
-- ============================================================
-- SELECT * FROM worker_daily_output WHERE worker_id = <WORKER_ID>;
-- SELECT * FROM attendance WHERE worker_id = <WORKER_ID> ORDER BY date DESC;
-- SELECT * FROM worker_overtime_requests WHERE worker_id = <WORKER_ID>;
-- SELECT * FROM training_assignments WHERE worker_id = <WORKER_ID>;
-- SELECT * FROM worker_payslips WHERE worker_id = <WORKER_ID>;
-- SELECT * FROM worker_payment_methods WHERE worker_id = <WORKER_ID>;
