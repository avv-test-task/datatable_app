<?php

declare(strict_types=1);

namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private ?PDO $connection = null;
    private string $dbPath;
    
    public function __construct(string $dbPath)
    {
        $this->dbPath = $dbPath;
    }
    
    public function getConnection(): PDO
    {
        if ($this->connection !== null) {
            return $this->connection;
        }

        try {
            return $this->connection = new PDO(
                'sqlite:' . $this->dbPath,
                null,
                null,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                    ]
                );
            } catch (PDOException $e) {
                error_log('Database connection failed: ' . $e->getMessage());
                throw new \RuntimeException('Database connection failed');
            }
        }
    }
    
    