CREATE DATABASE trade_db;

-- CockroachDB only
USE trade_db;

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username STRING UNIQUE NOT NULL,
    password_hash STRING NOT NULL,
    email STRING UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE accounts (
    account_nbr STRING PRIMARY KEY UNIQUE NOT NULL,
    user_id UUID REFERENCES users(user_id),
    account_id UUID DEFAULT gen_random_uuid(),
    balance DECIMAL(20, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE instruments (
    symbol STRING PRIMARY KEY UNIQUE NOT NULL,
    name STRING NOT NULL,
    current_price DECIMAL(20, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    details JSONB
);

CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_nbr STRING UNIQUE NOT NULL,
    account_nbr STRING NOT NULL,
    symbol STRING NOT NULL,
    order_entry_ts TIMESTAMPTZ DEFAULT now(),
    total_qty INT NOT NULL,
    order_type STRING NOT NULL,
    unit_price DECIMAL(20, 2) NOT NULL,
    CONSTRAINT fk_symbol FOREIGN KEY (symbol) REFERENCES instruments(symbol),
    CONSTRAINT fk_account FOREIGN KEY (account_nbr) REFERENCES accounts(account_nbr)
);

CREATE TABLE order_activity (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(order_id),
    order_nbr STRING NOT NULL,
    order_status STRING NOT NULL,
    activity_entry_ts TIMESTAMPTZ DEFAULT now(),
    symbol STRING NOT NULL,
    total_qty INT NOT NULL,
    order_type STRING NOT NULL,
    unit_price DECIMAL(20, 2) NOT NULL,
    CONSTRAINT fk_orderid FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_symbol FOREIGN KEY (symbol) REFERENCES instruments(symbol)
);

CREATE TABLE order_processing (
    execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(order_id),
    order_status STRING NOT NULL,
    order_nbr STRING NOT NULL,
    order_executed_ts TIMESTAMPTZ DEFAULT now(),
    symbol STRING NOT NULL,
    total_qty INT NOT NULL,
    unit_price DECIMAL(20, 2) NOT NULL,
    CONSTRAINT fk_orderid FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_symbol FOREIGN KEY (symbol) REFERENCES instruments(symbol)
);


CREATE TABLE trades (
    trade_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES order_processing(execution_id),
    symbol STRING NOT NULL,
    order_type STRING NOT NULL,
    trade_price DECIMAL(20, 2) NOT NULL,
    quantity INT NOT NULL,
    trade_ts TIMESTAMPTZ DEFAULT now()
); /* add constraint on forgein key  */

/* Multi-region and enteprise setup */
SET CLUSTER SETTING cluster.organization = 'AWS-Petere_Williams';
SET CLUSTER SETTING enterprise.license = 'crl-0-EIfzlbQGGAIiE0FXUy1QZXRlcmVfV2lsbGlhbXM'; 
ALTER DATABASE trade_db SURVIVE REGION FAILURE;
ALTER DATABASE trade_db SET PRIMARY REGION "us-west-2";
ALTER DATABASE trade_db ADD REGION "us-east-1";
ALTER DATABASE trade_db ADD REGION "eu-west-1";


/* insert some kickstarted data */

INSERT INTO users (user_id, username, password_hash, email, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'john_doe', 'hashed_password1', 'john@example.com', now(), now());

INSERT INTO accounts (account_id, user_id, account_nbr, balance, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '0005821112', 10000.00, now(), now());

INSERT INTO instruments (
    symbol, name, current_price, created_at, details
)
VALUES (
    'GOOGL', 'Alphabet Inc.', 175.76, now(), 
    '{
        "description": "Alphabet, Inc. is a holding company, which engages in software, health care, transportation, and other technologies. It operates through the following segments: Google Services, Google Cloud, and Other Bets.",
        "ceo": "Sundar Pichai",
        "employees": 182502,
        "headquarters": "Mountain View, California",
        "founded": 2015,
        "market_cap": "2.20T",
        "pe_ratio": 27.04,
        "dividend_yield": null,
        "average_volume": 16.79,
        "high_today": 178.51,
        "low_today": 174.70,
        "open_price": 175.76,
        "high_52_week": 179.95,
        "low_52_week": 115.83,
        "volume": 15.64
    }'
);

INSERT INTO instruments (
    symbol, name, current_price, created_at, details
)
VALUES (
    'MSFT', 'Microsoft Corp.', 429.82, now(), 
    '{
        "description": "Microsoft Corp. engages in the development and support of software, services, devices, and solutions. It operates through the following business segments: Productivity and Business Processes, Intelligent Cloud, and More Personal Computing.",
        "ceo": "Satya Nadella",
        "employees": 221000,
        "headquarters": "Redmond, Washington",
        "founded": 1975,
        "market_cap": "3.20T",
        "pe_ratio": 37.27,
        "dividend_yield": 0.66,
        "average_volume": 17.05,
        "high_today": 431.62,
        "low_today": 426.63,
        "open_price": 429.82,
        "high_52_week": 433.60,
        "low_52_week": 309.45,
        "volume": 15.71
    }'
);

INSERT INTO instruments (
    symbol, name, current_price, created_at, details
)
VALUES (
    'DIS', 'The Walt Disney Co.', 101.29, now(), 
    '{
        "description": "The Walt Disney Co. engages in the business of international family entertainment and media enterprise. It owns and operates television and radio production, distribution and broadcasting stations, direct-to-consumer services, amusement parks, and hotels.",
        "ceo": "Robert A. Iger",
        "employees": 225000,
        "headquarters": "Burbank, California",
        "founded": 1923,
        "market_cap": "186.78B",
        "pe_ratio": 110.25,
        "dividend_yield": 0.29,
        "average_volume": 9.77,
        "high_today": 102.86,
        "low_today": 100.95,
        "open_price": 101.29,
        "high_52_week": 123.74,
        "low_52_week": 78.73,
        "volume": 7.81
    }'
);

INSERT INTO instruments (
    symbol, name, current_price, created_at, details
)
VALUES (
    'RIVN', 'Rivian Automotive Inc.', 10.43, now(), 
    '{
        "description": "Rivian Automotive, Inc. engages in the design, development, and manufacture of category-defining electric vehicles and accessories. The company was founded by Robert J.",
        "ceo": "Robert Joseph Scaringe",
        "employees": 16790,
        "headquarters": "Irvine, California",
        "founded": 2009,
        "market_cap": "10.37B",
        "pe_ratio": -1.81,
        "dividend_yield": null,
        "average_volume": 39.51,
        "high_today": 10.68,
        "low_today": 10.31,
        "open_price": 10.43,
        "high_52_week": 28.06,
        "low_52_week": 8.26,
        "volume": 22.93
    }'
);

INSERT INTO instruments (
    symbol, name, current_price, created_at, details
)
VALUES (
    'PLTR', 'Palantir Technologies Inc.', 21.08, now(), 
    '{
        "description": "Palantir Technologies, Inc. engages in the business of building and deploying software platforms that serve as the central operating systems for its customers. It operates under the Commercial and Government segments.",
        "ceo": "Alexander Caedmon Karp",
        "employees": 3735,
        "headquarters": "Denver, Colorado",
        "founded": 2003,
        "market_cap": "46.90B",
        "pe_ratio": 165.83,
        "dividend_yield": null,
        "average_volume": 33.98,
        "high_today": 21.22,
        "low_today": 20.73,
        "open_price": 21.08,
        "high_52_week": 27.50,
        "low_52_week": 12.34,
        "volume": 26.23
    }'
);

INSERT INTO instruments (
    symbol, name, current_price, created_at, details
)
VALUES (
    'NFLX', 'Netflix Inc.', 647.00, now(), 
    '{
        "description": "Netflix, Inc. engages in providing entertainment services. It also offers activities for leisure time, entertainment video, video gaming, and other sources of entertainment.",
        "ceo": "Theodore A. Sarandos",
        "employees": 13000,
        "headquarters": "Los Gatos, California",
        "founded": 1997,
        "market_cap": "279.88B",
        "pe_ratio": 44.87,
        "dividend_yield": null,
        "average_volume": 3.13,
        "high_today": 650.50,
        "low_today": 643.03,
        "open_price": 647.00,
        "high_52_week": 652.00,
        "low_52_week": 344.73,
        "volume": 2.61
    }'
);

INSERT INTO instruments (
    symbol, name, current_price, created_at, details
)
VALUES (
    'JPM', 'JPMorgan Chase & Co.', 199.83, now(), 
    '{
        "description": "JPMorgan Chase & Co. is a financial holding company, which engages in the provision of financial and investment banking services. The firm offers a range of investment banking products and services in all capital markets, including advising on corporate strategy and structure, capital raising in equity and debt markets, risk management, market making in cash securities and derivative instruments, and brokerage and research.",
        "ceo": "James Dimon",
        "employees": 309926,
        "headquarters": "New York, New York",
        "founded": 1968,
        "market_cap": "573.01B",
        "pe_ratio": 12.12,
        "dividend_yield": 2.12,
        "average_volume": 9.84,
        "high_today": 201.50,
        "low_today": 198.67,
        "open_price": 199.83,
        "high_52_week": 205.88,
        "low_52_week": 134.40,
        "volume": 6.91
    }'
);

INSERT INTO instruments (
    symbol, name, current_price, created_at, details
    )
    VALUES (
        'NVDA', 'NVIDIA Corp.', 1102.24, '2024-05-28 10:00:00', 
        '{
          "description": "NVIDIA Corp. engages in the design and manufacture of computer graphics processors, chipsets, and related multimedia software. It operates through the following segments: Graphics Processing Unit (GPU) and Compute & Networking.",
          "ceo": "Jen Hsun Huang",
          "employees": 29600,
          "headquarters": "Santa Clara, California",
          "founded": 1993,
          "high_today": 1149.39,
          "low_today": 1085.20,
          "open_price": 1102.24,
          "high_52_week": 1149.39,
          "low_52_week": 366.35,
          "average_volume": 41.48,
          "volume": 64.87
          }'
        );

INSERT INTO instruments (
        symbol, name, current_price, created_at, details
      )
      VALUES (
        'AAPL', 'Apple Inc.', 191.51, '2024-05-28 10:00:00', 
        '{
          "description": "Apple, Inc. engages in the design, manufacture, and sale of smartphones, personal computers, tablets, wearables and accessories, and other varieties of related services. It operates through the following geographical segments: Americas, Europe, Greater China, Japan, and Rest of Asia Pacific.",
          "ceo": "Timothy Donald Cook",
          "employees": 161000,
          "headquarters": "Cupertino, California",
          "founded": 1976,
          "market_cap": "2.92T",
          "pe_ratio": 29.54,
          "dividend_yield": 0.51,
          "average_volume": 49.76,
          "high_today": 194.81,
          "low_today": 189.10,
          "open_price": 191.51,
          "high_52_week": 199.62,
          "low_52_week": 164.08,
          "volume": 52.21
        }'
      );