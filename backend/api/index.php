<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;
use App\Models\Item;
use App\Router\Router;

header('Content-Type: application/json');

$dbPath = __DIR__ . '/../database/database.db';
$database = new Database($dbPath);
$db = $database->getConnection();
$itemModel = new Item($db);
$router = new Router();

$router->addRoute('GET', '/api/table-a', function () use ($itemModel) {
    try {
        $items = $itemModel->getByPosition('a');
        http_response_code(200);
        echo json_encode($items);
    } catch (\Exception $e) {
        error_log('Error fetching items for position a: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal server error']);
    }
});

$router->addRoute('GET', '/api/table-b', function () use ($itemModel) {
    try {
        $items = $itemModel->getByPosition('b');
        http_response_code(200);
        echo json_encode($items);
    } catch (\Exception $e) {
        error_log('Error fetching items for position b: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal server error']);
    }
});

$router->addRoute('POST', '/api/move', function () use ($itemModel) {
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
            return;
        }

        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required field: id']);
            return;
        }

        if (!is_int($data['id']) || $data['id'] <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID must be a positive integer']);
            return;
        }

        $success = $itemModel->switchPosition($data['id']);

        if (!$success) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Item not found']);
            return;
        }

        http_response_code(200);
        echo json_encode(['success' => true]);
    } catch (\InvalidArgumentException $e) {
        error_log('Validation error: ' . $e->getMessage());
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    } catch (\Exception $e) {
        error_log('Error moving item: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal server error']);
    }
});

$router->handleRequest();

