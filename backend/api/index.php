<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;
use App\Models\Item;
use App\Router\Router;

header('Content-Type: application/json');

$dbPath = __DIR__ . '/../database/database.db';
$database = new Database($dbPath);
$itemModel = new Item($database->getConnection());
$router = new Router();

function sendJsonResponse(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    $json = json_encode($data, JSON_THROW_ON_ERROR);
    echo $json;
}

function sendErrorResponse(string $message, int $statusCode = 500): void
{
    sendJsonResponse(['success' => false, 'error' => $message], $statusCode);
}

$router->addRoute('GET', '/table-a', function () use ($itemModel) {
    try {
        $items = $itemModel->getByPosition('a');
        sendJsonResponse($items, 200);
    } catch (\Exception $e) {
        error_log('Error fetching items for position a: ' . $e->getMessage());
        sendErrorResponse('Internal server error', 500);
    }
});

$router->addRoute('GET', '/table-b', function () use ($itemModel) {
    try {
        $items = $itemModel->getByPosition('b');
        sendJsonResponse($items, 200);
    } catch (\Exception $e) {
        error_log('Error fetching items for position b: ' . $e->getMessage());
        sendErrorResponse('Internal server error', 500);
    }
});

$router->addRoute('POST', '/move', function () use ($itemModel) {
    try {
        $input = file_get_contents('php://input');
        if ($input === false) {
            sendErrorResponse('Failed to read request body', 400);
            return;
        }

        $data = json_decode($input, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            sendErrorResponse('Invalid JSON', 400);
            return;
        }

        if (!isset($data['id'])) {
            sendErrorResponse('Missing required field: id', 400);
            return;
        }

        if (!is_int($data['id']) || $data['id'] <= 0) {
            sendErrorResponse('ID must be a positive integer', 400);
            return;
        }

        $success = $itemModel->switchPosition($data['id']);

        if (!$success) {
            sendErrorResponse('Item not found', 404);
            return;
        }

        sendJsonResponse(['success' => true], 200);
    } catch (\InvalidArgumentException $e) {
        error_log('Validation error: ' . $e->getMessage());
        sendErrorResponse($e->getMessage(), 400);
    } catch (\JsonException $e) {
        error_log('JSON encoding error: ' . $e->getMessage());
        sendErrorResponse('Internal server error', 500);
    } catch (\Exception $e) {
        error_log('Error moving item: ' . $e->getMessage());
        sendErrorResponse('Internal server error', 500);
    }
});

$router->handleRequest();
