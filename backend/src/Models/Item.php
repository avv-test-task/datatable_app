<?php

declare(strict_types=1);

namespace App\Models;

use PDO;

class Item
{
    public function __construct(
        private PDO $db
    ) {}

    public function getByPosition(string $position): array
    {
        if (!in_array($position, ['a', 'b'], true)) {
            throw new \InvalidArgumentException('Invalid position: ' . $position);
        }

        $stmt = $this->db->prepare(
            'SELECT id, name, value, position, created_at, updated_at 
             FROM items 
             WHERE position = :position 
             ORDER BY id');
        $stmt->execute(['position' => $position]);
        
        return $stmt->fetchAll();
    }

    public function switchPosition(int $id): bool
    {
        if ($id <= 0) {
            throw new \InvalidArgumentException('ID must be a positive integer');
        }

        $stmt = $this->db->prepare(
            'UPDATE items 
             SET position = CASE 
                 WHEN position = \'a\' THEN \'b\' 
                 WHEN position = \'b\' THEN \'a\' 
             END 
             WHERE id = :id'
        );
        $stmt->execute(['id' => $id]);

        return $stmt->rowCount() > 0;
    }
}

