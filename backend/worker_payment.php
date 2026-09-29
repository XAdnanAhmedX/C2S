<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'payslips';

function getWorkerByUserId($conn, $userId) {
    $stmt = $conn->prepare(
        "SELECT w.*, u.email FROM workers w
         LEFT JOIN users u ON w.user_id = u.id
         WHERE w.user_id = ? LIMIT 1"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $worker = $result ? $result->fetch_assoc() : null;

    if (!$worker) {
        $stmt2 = $conn->prepare("SELECT w.*, u.email FROM workers w LEFT JOIN users u ON w.user_id = u.id WHERE w.id = ? LIMIT 1");
        $stmt2->bind_param("i", $userId);
        $stmt2->execute();
        $worker = $stmt2->get_result()->fetch_assoc();
    }
    return $worker;
}

switch ($action) {
    case 'payslips':
        $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
        $worker = getWorkerByUserId($conn, $userId);
        $workerId = $worker ? $worker['id'] : 0;

        $conn->query("CREATE TABLE IF NOT EXISTS worker_payslips (
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
            UNIQUE KEY uq_worker_pay_period (worker_id, pay_period)
        )");

        $listStmt = $conn->prepare(
            "SELECT ps.*, wpm.method_type, wpm.account_number
             FROM worker_payslips ps
             LEFT JOIN worker_payment_methods wpm ON ps.payment_method_id = wpm.id
             WHERE ps.worker_id = ?
             ORDER BY ps.pay_period DESC"
        );
        $listStmt->bind_param("i", $workerId);
        $listStmt->execute();
        $payslips = [];
        $res = $listStmt->get_result();
        while ($row = $res->fetch_assoc()) $payslips[] = $row;

        sendJsonResponse(['success' => true, 'data' => $payslips]);
        break;

    case 'payment_methods':
        $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
        $worker = getWorkerByUserId($conn, $userId);
        $workerId = $worker ? $worker['id'] : 0;

        $conn->query("CREATE TABLE IF NOT EXISTS worker_payment_methods (
            id INT AUTO_INCREMENT PRIMARY KEY,
            worker_id INT NOT NULL,
            method_type ENUM('bKash','Nagad','Rocket','Bank Transfer') NOT NULL,
            account_number VARCHAR(50) NOT NULL,
            account_name VARCHAR(100),
            is_primary TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        $stmt = $conn->prepare("SELECT * FROM worker_payment_methods WHERE worker_id=? ORDER BY is_primary DESC, created_at ASC");
        $stmt->bind_param("i", $workerId);
        $stmt->execute();
        $methods = [];
        $res = $stmt->get_result();
        while ($row = $res->fetch_assoc()) $methods[] = $row;

        sendJsonResponse(['success' => true, 'data' => $methods]);
        break;

    case 'add_method':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'POST required'], 405);
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = (int)($input['user_id'] ?? 0);
        $worker = getWorkerByUserId($conn, $userId);
        $workerId = $worker ? $worker['id'] : 0;

        $methodType    = $input['method_type'] ?? 'bKash';
        $accountNumber = $input['account_number'] ?? '';
        $accountName   = $input['account_name'] ?? ($worker['full_name'] ?? 'Worker');
        $isPrimary     = !empty($input['is_primary']) ? 1 : 0;

        if ($isPrimary) {
            $conn->query("UPDATE worker_payment_methods SET is_primary=0 WHERE worker_id=$workerId");
        }

        $stmt = $conn->prepare("INSERT INTO worker_payment_methods (worker_id, method_type, account_number, account_name, is_primary) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("isssi", $workerId, $methodType, $accountNumber, $accountName, $isPrimary);

        if ($stmt->execute()) {
            sendJsonResponse(['success' => true, 'message' => 'Payment method added', 'method_id' => $stmt->insert_id]);
        } else {
            sendJsonResponse(['success' => false, 'message' => $conn->error], 500);
        }
        break;

    case 'set_primary':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'POST required'], 405);
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = (int)($input['user_id'] ?? 0);
        $worker = getWorkerByUserId($conn, $userId);
        $workerId = $worker ? $worker['id'] : 0;
        $methodId = (int)($input['method_id'] ?? 0);

        $conn->query("UPDATE worker_payment_methods SET is_primary=0 WHERE worker_id=$workerId");
        $conn->query("UPDATE worker_payment_methods SET is_primary=1 WHERE id=$methodId AND worker_id=$workerId");

        sendJsonResponse(['success' => true, 'message' => 'Primary payment method updated']);
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}
