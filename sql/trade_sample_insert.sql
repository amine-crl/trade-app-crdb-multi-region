INSERT INTO users (user_id, username, password_hash, email, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'john_doe', 'hashed_password1', 'john@example.com', now(), now()),
('550e8400-e29b-41d4-a716-446655440001', 'jane_smith', 'hashed_password2', 'jane@example.com', now(), now());

INSERT INTO accounts (account_id, user_id, account_nbr, balance, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'ACC123', 10000.00, now(), now()),
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'ACC124', 15000.00, now(), now());

INSERT INTO instruments (instrument_id, symbol, name, current_price, created_at, updated_at) VALUES
('750e8400-e29b-41d4-a716-446655440000', 'AAPL', 'Apple Inc.', 145.30, now(), now()),
('750e8400-e29b-41d4-a716-446655440001', 'GOOGL', 'Alphabet Inc.', 2750.00, now(), now());

INSERT INTO orders (order_id, order_nbr, account_nbr, order_entry_ts, total_qty, order_type, symbol, symbol_id, created_at, updated_at) VALUES
('850e8400-e29b-41d4-a716-446655440000', 'ORD001', 'ACC123', now(), 100, 'BUY', 'AAPL', '750e8400-e29b-41d4-a716-446655440000', now(), now()),
('850e8400-e29b-41d4-a716-446655440001', 'ORD002', 'ACC124', now(), 50, 'SELL', 'GOOGL', '750e8400-e29b-41d4-a716-446655440001', now(), now());

INSERT INTO executions (execution_id, order_id, order_status, order_nbr, account_nbr, order_executed_ts, total_qty, created_at) VALUES
('950e8400-e29b-41d4-a716-446655440000', '850e8400-e29b-41d4-a716-446655440000', 'COMPLETED', 'ORD001', 'ACC123', now(), 100, now()),
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'COMPLETED', 'ORD002', 'ACC124', now(), 50, now());

INSERT INTO order_activity (activity_id, order_id, order_nbr, order_status, activity_entry_ts, total_qty, created_at) VALUES
('940e8400-e29b-41d4-a716-446655440000', '850e8400-e29b-41d4-a716-446655440000', 'ORD001', 'COMPLETED', '2023-05-20 10:00:00', 100, '2023-05-20 10:00:00'),
('940e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'ORD002', 'COMPLETED', '2023-05-20 11:00:00', 50, '2023-05-20 11:00:00');

INSERT INTO trades (trade_id, execution_id, symbol, order_type, trade_price, quantity, trade_ts) VALUES
('150e8400-e29b-41d4-a716-446655440000', '950e8400-e29b-41d4-a716-446655440000', 'AAPL', 'BUY', 145.30, 100, '2023-05-20 10:30:00'),
('150e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'GOOGL', 'SELL', 2750.00, 50, '2023-05-20 11:30:00');
