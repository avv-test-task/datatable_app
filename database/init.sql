CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    position TEXT NOT NULL DEFAULT 'a' CHECK(position IN ('a', 'b')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_position ON items(position);

CREATE TRIGGER IF NOT EXISTS update_items_timestamp 
AFTER UPDATE ON items
BEGIN
    UPDATE items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

INSERT INTO items (name, value, position) VALUES
('Item A1', 'Value 1', 'a'),
('Item A2', 'Value 2', 'a'),
('Item A3', 'Value 3', 'a'),
('Item A4', 'Value 4', 'a'),
('Item A5', 'Value 5', 'a'),
('Item A6', 'Value 6', 'a'),
('Item A7', 'Value 7', 'a'),
('Item A8', 'Value 8', 'a'),
('Item A9', 'Value 9', 'a'),
('Item A10', 'Value 10', 'a');

INSERT INTO items (name, value, position) VALUES
('Item B1', 'Value 11', 'b'),
('Item B2', 'Value 12', 'b'),
('Item B3', 'Value 13', 'b'),
('Item B4', 'Value 14', 'b'),
('Item B5', 'Value 15', 'b');

