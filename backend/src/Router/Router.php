<?php

declare(strict_types=1);

namespace App\Router;

class Router
{
    private array $routes = [];
    private const ALLOWED_METHODS = ['GET', 'POST'];

    public function addRoute(string $method, string $path, callable $handler): void
    {
        if (!in_array($method, self::ALLOWED_METHODS, true)) {
            throw new \InvalidArgumentException('HTTP method not allowed: ' . $method);
        }

        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
        ];
    }

    public function handleRequest(): void
    {
        $method = $this->getRequestMethod();
        $path = $this->getRequestPath();

        if (!in_array($method, self::ALLOWED_METHODS, true)) {
            $this->sendErrorResponse('Method not allowed', 405);
            return;
        }

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $this->matchPath($route['path'], $path)) {
                try {
                    call_user_func($route['handler']);
                    return;
                } catch (\Exception $e) {
                    error_log('Route handler error: ' . $e->getMessage());
                    $this->sendErrorResponse('Internal server error', 500);
                    return;
                }
            }
        }

        $this->sendErrorResponse('Not found', 404);
    }

    private function getRequestMethod(): string
    {
        if (!isset($_SERVER['REQUEST_METHOD'])) {
            return 'GET';
        }

        $method = strtoupper(trim($_SERVER['REQUEST_METHOD']));
        if (!preg_match('/^[A-Z]+$/', $method)) {
            return 'GET';
        }

        return $method;
    }

    private function getRequestPath(): string
    {
        if (!isset($_SERVER['REQUEST_URI'])) {
            return '/';
        }

        $uri = $_SERVER['REQUEST_URI'];
        $parsed = parse_url($uri, PHP_URL_PATH);
        if ($parsed === false || $parsed === null) {
            return '/';
        }

        $path = $parsed;
        if (strpos($path, '/api') === 0) {
            $path = substr($path, 4);
        }

        return $path ?: '/';
    }

    private function matchPath(string $routePath, string $requestPath): bool
    {
        return $routePath === $requestPath;
    }

    private function sendErrorResponse(string $message, int $statusCode): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        $json = json_encode(['success' => false, 'error' => $message], JSON_THROW_ON_ERROR);
        echo $json;
    }
}

