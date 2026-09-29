<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'profile';

switch ($action) {
    case 'profile':
        $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
        $stmt = $conn->prepare(
            "SELECT w.*, u.email, u.full_name as user_full_name, u.role, pl.line_name
             FROM workers w
             LEFT JOIN users u ON w.user_id = u.id
             LEFT JOIN production_lines pl ON w.current_line_id = pl.id
             WHERE w.user_id = ? LIMIT 1"
        );
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $worker = $stmt->get_result()->fetch_assoc();

        if (!$worker) {
            $stmt2 = $conn->prepare("SELECT id, email, full_name, role, phone FROM users WHERE id=? LIMIT 1");
            $stmt2->bind_param("i", $userId);
            $stmt2->execute();
            $worker = $stmt2->get_result()->fetch_assoc();
        }

        if (!$worker) {
            sendJsonResponse(['success' => false, 'message' => 'Worker record not found'], 404);
        }

        sendJsonResponse(['success' => true, 'data' => $worker]);
        break;

    case 'update_profile':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'POST required'], 405);
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $userId   = (int)($input['user_id'] ?? 0);
        $fullName = trim($input['full_name'] ?? '');
        $phone    = trim($input['phone'] ?? '');

        if ($userId && !empty($fullName)) {
            $stmt = $conn->prepare("UPDATE users SET full_name=? WHERE id=?");
            $stmt->bind_param("si", $fullName, $userId);
            $stmt->execute();

            $stmt2 = $conn->prepare("UPDATE workers SET full_name=? WHERE user_id=?");
            $stmt2->bind_param("si", $fullName, $userId);
            $stmt2->execute();
        }

        if ($userId && !empty($phone)) {
            $stmt3 = $conn->prepare("UPDATE users SET phone=? WHERE id=?");
            $stmt3->bind_param("si", $phone, $userId);
            $stmt3->execute();

            $stmt4 = $conn->prepare("UPDATE workers SET phone=? WHERE user_id=?");
            $stmt4->bind_param("si", $phone, $userId);
            $stmt4->execute();
        }

        sendJsonResponse(['success' => true, 'message' => 'Profile updated successfully']);
        break;

    case 'change_password':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'POST required'], 405);
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = (int)($input['user_id'] ?? 0);
        $newPassword = $input['new_password'] ?? '';

        if (!$userId || empty($newPassword)) {
            sendJsonResponse(['success' => false, 'message' => 'New password required'], 400);
        }

        $stmt = $conn->prepare("UPDATE users SET password=? WHERE id=?");
        $stmt->bind_param("si", $newPassword, $userId);
        $stmt->execute();

        sendJsonResponse(['success' => true, 'message' => 'Password changed successfully']);
        break;

    case 'get_supervisors':
        $res = $conn->query(
            "SELECT w.id, w.full_name, w.employee_id, pl.line_name
             FROM workers w
             LEFT JOIN production_lines pl ON w.current_line_id = pl.id
             ORDER BY w.full_name ASC LIMIT 20"
        );
        $supervisors = [];
        if ($res) {
            while ($row = $res->fetch_assoc()) $supervisors[] = $row;
        }

        sendJsonResponse(['success' => true, 'data' => $supervisors]);
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}
