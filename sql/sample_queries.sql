/* check forgein key constrain works */
select * from users where user_id = (select user_id from accounts where account_id='fff4c54a-df6e-452f-8940-f9d76ecf7c56');  

/* get username if you know account_nbr */
select username,email from users where user_id = (select user_id from accounts where account_nbr='3764508619'); 

/* get account balance from order_number */
select account_nbr,user_id,balance from accounts where account_nbr = (select account_nbr from orders where order_nbr='9209T4BAUZCSEX'); 

/* get ticker info from order activity */
select account_nbr,symbol,total_qty from orders where order_id = (select order_id from order_activity where order_nbr='R2MQTJAUU0RDBV');

/* order table reads */
select * from orders limit 5; 
select * from order_activity limit 5; 
select * from order_processing limit 5; 
select * from order_processing where order_nbr='NT01FQ3OXJ3A0Z';
select * from order_activity where order_status='order_processing';
select * from order_activity where order_nbr='MISNEJSL0GQEY6';

/* read other tables */
select * from users; 
select * from accounts; 
select * from instruments; 

/* truncate all data */ 
truncate table users,accounts,orders,instruments,order_activity, order_processing, trades;
drop table users,accounts, orders,instruments,order_activity, order_processing, trades;
truncate table orders,order_activity, order_processing, trades;
truncate table instruments, orders, order_activity, order_processing, trades;

/* */
select * from trades where symbol='QUJY';
select * from instruments where symbol='QUJY';

INSERT INTO orders (order_id, order_nbr, account_nbr, order_entry_ts, total_qty, order_type, symbol) VALUES
('850e8400-e29b-41d4-a716-446655440000', 'ORD001', '0000312587', now(), 100, 'BUY', 'JMPD');

/* testing ui based generated orders */
select * from orders where account_nbr in ('0005821112','2176541586'); 
select * from orders where order_id='673eff66-b24a-482a-91d3-19ddf358aa48';
select * from order_activity where order_id='673eff66-b24a-482a-91d3-19ddf358aa48';
select * from instruments where symbol='ABKP';
select * from order_processing where order_id='134ee2be-e657-44c5-a642-f0412cea76b6';
select * from trades where execution_id='5a842e44-54aa-4203-994a-17254fee42ed'; 

/* Verify orders are correct */
select order_id,count(activity_id) from order_activity group by 1;
select order_id,count(execution_id) from order_processing group by 1 ;
select * from trades where execution_id = ( select execution_id from order_processing where order_id='12982348-1369-43d1-b627-8366ff70095e');

/* UI Stock data */

INSERT INTO instruments (
        symbol, name, current_price, created_at, details
      )
      VALUES (
        'NVDA', 'NVIDIA Corp.', 1102.24, now(), 
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
    'AAPL', 'Apple Inc.', 191.51, now(), 
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

INSERT INTO users (user_id, username, password_hash, email, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'john_doe', 'hashed_password1', 'john@example.com', now(), now());

INSERT INTO accounts (account_id, user_id, account_nbr, balance, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '0005821112', 10000.00, now(), now());