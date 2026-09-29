<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'profile';

// Create worker_daily_output table if not exists
$conn->query("CREATE TABLE IF NOT EXISTS worker_daily_output (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    output_date DATE NOT NULL,
    quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_worker_date (worker_id, output_date),
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
)");

function getWorkerByUserId($conn, $userId) {
    $stmt = $conn->prepare(
        "SELECT w.*, u.email, u.full_name as user_full_name, pl.line_name
          FROM workers w
          LEFT JOIN users u ON w.user_id = u.id
          LEFT JOIN production_lines pl ON w.current_line_id = pl.id
          WHERE w.user_id = ? LIMIT 1"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $worker = $result ? $result->fetch_assoc() : null;

    if (!$worker) {
        $stmt2 = $conn->prepare(
            "SELECT w.*, u.email, u.full_name as user_full_name, pl.line_name
             FROM workers w
             LEFT JOIN users u ON w.user_id = u.id
             LEFT JOIN production_lines pl ON w.current_line_id = pl.id
             WHERE w.id = ? LIMIT 1"
        );
        $stmt2->bind_param("i", $userId);
        $stmt2->execute();
        $result2 = $stmt2->get_result();
        $worker = $result2 ? $result2->fetch_assoc() : null;
    }

    return $worker;
}

function computeGrade($score) {
    if ($score >= 95) return 'A+';
    if ($score >= 88) return 'A';
    if ($score >= 80) return 'A-';
    if ($score >= 70) return 'B';
    if ($score >= 60) return 'C';
    return 'D';
}

// Helper: count present days (present + half_day both count as present)
function getAttendanceStats($conn, $workerId, $monthStart, $monthEnd) {
    $stmt = $conn->prepare(
        "SELECT COUNT(*) as total,
                SUM(status IN ('present', 'half_day')) as present_days
         FROM attendance
         WHERE worker_id = ? AND date BETWEEN ? AND ?"
    );
    $stmt->bind_param("iss", $workerId, $monthStart, $monthEnd);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();

    $workedDays  = (int)($result['total'] ?? 0);
    $presentDays = (int)($result['present_days'] ?? 0);
    $attRate = $workedDays > 0 ? round(($presentDays / $workedDays) * 100, 1) : 0;

    return ['worked_days' => $workedDays, 'present_days' => $presentDays, 'attendance_rate' => $attRate];
}

switch ($action) {
    case 'profile':
        $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
        $worker = getWorkerByUserId($conn, $userId);

        if (!$worker) {
            sendJsonResponse(['success' => false, 'message' => 'Worker record not found'], 404);
        }

        $workerId = $worker['id'];
        $today = date('Y-m-d');

        // Today's attendance
        $attStmt = $conn->prepare("SELECT * FROM attendance WHERE worker_id = ? AND date = ? LIMIT 1");
        $attStmt->bind_param("is", $workerId, $today);
        $attStmt->execute();
        $todayAtt = $attStmt->get_result()->fetch_assoc();

        $monthStart = date('Y-m-01');
        $monthEnd   = date('Y-m-t');

        // Overtime this month
        $otStmt = $conn->prepare("SELECT COALESCE(SUM(overtime_hours), 0) as total_ot FROM attendance WHERE worker_id = ? AND date BETWEEN ? AND ?");
        $otStmt->bind_param("iss", $workerId, $monthStart, $monthEnd);
        $otStmt->execute();
        $otResult = $otStmt->get_result()->fetch_assoc();

        // Attendance rate (present + half_day both count)
        $attStats = getAttendanceStats($conn, $workerId, $monthStart, $monthEnd);

        // Today's output from worker_daily_output table
        $outputStmt = $conn->prepare("SELECT COALESCE(quantity, 0) as today_output FROM worker_daily_output WHERE worker_id = ? AND output_date = ? LIMIT 1");
        $outputStmt->bind_param("is", $workerId, $today);
        $outputStmt->execute();
        $outputResult = $outputStmt->get_result()->fetch_assoc();
        $todayOutput = (int)($outputResult['today_output'] ?? 0);

        sendJsonResponse([
            'success' => true,
            'data' => [
                'worker'          => $worker,
                'today_att'       => $todayAtt,
                'attendance_rate' => $attStats['attendance_rate'],
                'present_days'    => $attStats['present_days'],
                'worked_days'     => $attStats['worked_days'],
                'total_ot_hours'  => (float)($otResult['total_ot'] ?? 0),
                'today_output'    => $todayOutput,
            ]
        ]);
        break;

    case 'attendance_chart':
        $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
        $worker = getWorkerByUserId($conn, $userId);
        $workerId = $worker ? $worker['id'] : 0;

        $days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $stmt = $conn->prepare("SELECT status FROM attendance WHERE worker_id = ? AND date = ? LIMIT 1");
            $stmt->bind_param("is", $workerId, $date);
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            $status = $row ? $row['status'] : 'absent';
            $isPresent = in_array($status, ['present', 'half_day']) ? 1 : 0;
            $days[] = [
                'date'    => $date,
                'day'     => date('D', strtotime($date)),
                'status'  => $status,
                'present' => $isPresent,
            ];
        }

        sendJsonResponse(['success' => true, 'data' => $days]);
        break;

    case 'recent_attendance':
        $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
        $worker = getWorkerByUserId($conn, $userId);
        $workerId = $worker ? $worker['id'] : 0;

        $stmt = $conn->prepare("SELECT * FROM attendance WHERE worker_id = ? ORDER BY date DESC LIMIT 10");
        $stmt->bind_param("i", $workerId);
        $stmt->execute();
        $rows = [];
        $result = $stmt->get_result();
        while ($r = $result->fetch_assoc()) $rows[] = $r;

        sendJsonResponse(['success' => true, 'data' => $rows]);
        break;

    case 'consistency_rating':
        $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
        $worker = getWorkerByUserId($conn, $userId);
        $workerId = $worker ? $worker['id'] : 0;

        $monthStart = date('Y-m-01');
        $monthEnd   = date('Y-m-t');

        // Attendance rate
        $attStats = getAttendanceStats($conn, $workerId, $monthStart, $monthEnd);
        $attRate = $attStats['attendance_rate'];

        // Training completion rate
        $trainStmt = $conn->prepare("SELECT COUNT(*) as total, SUM(status='completed') as completed FROM training_assignments WHERE worker_id = ? AND start_date BETWEEN ? AND ?");
        $trainStmt->bind_param("iss", $workerId, $monthStart, $monthEnd);
        $trainStmt->execute();
        $trainCount = $trainStmt->get_result()->fetch_assoc();

        $trainTotal = (int)($trainCount['total'] ?? 0);
        $trainCompleted = (int)($trainCount['completed'] ?? 0);
        $trainRate = $trainTotal > 0 ? round(($trainCompleted / $trainTotal) * 100, 1) : 0;

        // Efficiency = attendance rate (simplified)
        $efficiency = $attRate;

        $score = ($attRate * 0.40) + ($trainRate * 0.30) + ($efficiency * 0.30);
        $grade = computeGrade($score);

        $ranks = [
            ['grade' => 'A+', 'min_score' => 95, 'description' => 'Exceptional performer'],
            ['grade' => 'A',  'min_score' => 88, 'description' => 'High performer'],
            ['grade' => 'A-', 'min_score' => 80, 'description' => 'Above average'],
            ['grade' => 'B',  'min_score' => 70, 'description' => 'Meets expectations'],
            ['grade' => 'C',  'min_score' => 60, 'description' => 'Below expectations'],
            ['grade' => 'D',  'min_score' => 0,  'description' => 'Needs improvement'],
        ];

        sendJsonResponse([
            'success' => true,
            'data' => [
                'grade'           => $grade,
                'score'           => round($score, 1),
                'attendance_rate' => $attRate,
                'train_rate'      => $trainRate,
                'efficiency'      => $efficiency,
                'ranks'           => $ranks,
            ]
        ]);
        break;

    case 'bonus_eligibility':
        $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
        $worker = getWorkerByUserId($conn, $userId);
        $workerId = $worker ? $worker['id'] : 0;
        $hourlyRate = $worker ? (float)$worker['hourly_rate'] : 0;

        $monthStart = date('Y-m-01');
        $monthEnd   = date('Y-m-t');

        // Attendance rate (present + half_day both count)
        $attStats = getAttendanceStats($conn, $workerId, $monthStart, $monthEnd);
        $attRate = $attStats['attendance_rate'];

        // Safety issues
        $safetyStmt = $conn->prepare("SELECT COUNT(*) as total FROM safety_reports WHERE reported_by = ? AND status != 'Resolved'");
        $safetyStmt->bind_param("i", $workerId);
        $safetyStmt->execute();
        $safetyCount = (int)($safetyStmt->get_result()->fetch_assoc()['total'] ?? 0);

        $eligible = ($attRate >= 85 && $safetyCount === 0);
        $bonusAmount = $eligible ? round($hourlyRate * 160 * 0.10, 2) : 0;

        sendJsonResponse([
            'success' => true,
            'data' => [
                'eligible'        => $eligible,
                'attendance_rate' => $attRate,
                'safety_issues'   => $safetyCount,
                'bonus_amount'    => $bonusAmount,
                'reasons'         => $eligible ? ['Met 85%+ attendance', 'No safety violations'] : ['Attendance below 85%'],
                'required_att'    => 85,
                'required_safety' => 0,
            ]
        ]);
        break;

    case 'overtime_status':
        $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
        $worker = getWorkerByUserId($conn, $userId);
        $workerId = $worker ? $worker['id'] : 0;

        // Count present days in last 7 days (present + half_day both count)
        $recentPresent = 0;
        for ($i = 0; $i < 7; $i++) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $stmt = $conn->prepare("SELECT status FROM attendance WHERE worker_id = ? AND date = ? LIMIT 1");
            $stmt->bind_param("is", $workerId, $date);
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            if ($row && in_array($row['status'], ['present', 'half_day'])) $recentPresent++;
        }

        $eligible = $recentPresent >= 5;

        $lastRequest = null;
        $reqStmt = $conn->prepare("SELECT * FROM worker_overtime_requests WHERE worker_id = ? ORDER BY created_at DESC LIMIT 1");
        $reqStmt->bind_param("i", $workerId);
        $reqStmt->execute();
        $reqResult = $reqStmt->get_result();
        if ($reqResult && $reqResult->num_rows > 0) {
            $lastRequest = $reqResult->fetch_assoc();
        }

        sendJsonResponse([
            'success' => true,
            'data' => [
                'eligible'       => $eligible,
                'recent_present' => $recentPresent,
                'last_request'   => $lastRequest,
            ]
        ]);
        break;

    case 'request_overtime':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'POST required'], 405);
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = (int)($input['user_id'] ?? 0);
        $worker = getWorkerByUserId($conn, $userId);
        $workerId = $worker ? $worker['id'] : 0;

        $date   = $input['requested_date'] ?? date('Y-m-d');
        $hours  = (float)($input['overtime_hours'] ?? 2.0);
        $reason = $input['reason'] ?? '';

        $stmt = $conn->prepare("INSERT INTO worker_overtime_requests (worker_id, requested_date, overtime_hours, reason) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("isds", $workerId, $date, $hours, $reason);

        if ($stmt->execute()) {
            sendJsonResponse([
                'success' => true,
                'message' => 'Overtime request submitted successfully',
                'request_id' => $stmt->insert_id
            ]);
        } else {
            sendJsonResponse(['success' => false, 'message' => 'Failed: ' . $conn->error], 500);
        }
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}
