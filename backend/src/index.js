const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const Decimal = require('decimal.js');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const connectionStrings = [
  'postgres://root@haproxy-us-west-2:26256/trade_db?sslmode=disable&application_name=birdtrade',
  'postgres://root@haproxy-us-east-1:26256/trade_db?sslmode=disable&application_name=birdtrade',
  'postgres://root@haproxy-eu-west-1:26256/trade_db?sslmode=disable&application_name=birdtrade'
];

// CockroachDB connection pool creation
const createPool = (connectionString) => {
  return new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    }
  });
};

const pools = connectionStrings.map(createPool);

const queryWithRetry = async (pool, query, values, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      const res = await client.query(query, values);
      client.release();
      return res;
    } catch (err) {
      console.error(`Attempt ${i + 1} with pool ${pool.options.connectionString} failed: ${err.message}`);
    }
  }
  throw new Error('All retries failed');
};

// Define a simple route to fetch data
app.get('/api/data', async (req, res) => {
  try {
    for (const pool of pools) {
      try {
        const result = await queryWithRetry(pool, `SELECT symbol, current_price, details FROM instruments WHERE symbol IN ('NVDA','JPM','NFLX','GOOGL','DIS','MSFT','AAPL')`);
        return res.json(result.rows);
      } catch (err) {
        console.error('Query failed:', err);
      }
    }
    res.status(500).send('Server Error');
  } catch (err) {
    console.error('Query failed:', err);
    res.status(500).send('Server Error');
  }
});

// Define a POST route to handle order submission
app.post('/api/submitOrder', async (req, res) => {
  const { stock, orderType, shares, currentPrice, estimatedCost } = req.body;

  // Basic validation
  if (!stock || !orderType || !shares || !currentPrice || !estimatedCost) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Generate unique IDs and order number
  const orderId = generateUUID();
  const orderNbr = generateOrderNumber();
  const activityId = generateUUID();
  const executionId = generateUUID();
  const tradeId = generateUUID();
  const newactivityId = generateUUID();

  for (const pool of pools) {
    try {
      const client = await pool.connect();
      await client.query('BEGIN');

      // Insert the order into the orders table
      const orderResult = await queryWithRetry(pool, 
        `INSERT INTO orders 
         (order_id, order_nbr, account_nbr, symbol, order_entry_ts, total_qty, order_type, unit_price) 
         VALUES ($1, $2, $3, $4, now(), $5, $6, $7) 
         RETURNING order_id`,
        [orderId, orderNbr, '0005821112', stock, shares, orderType, currentPrice]
      );

      console.log('Order received:', req.body);

      // Insert into the order_activity table
      await queryWithRetry(pool,
        `INSERT INTO order_activity 
         (activity_id, order_id, order_nbr, order_status, activity_entry_ts, symbol, total_qty, order_type, unit_price) 
         VALUES ($1, $2, $3, 'order_received', now(), $4, $5, $6, $7)`,
        [activityId, orderId, orderNbr, stock, shares, orderType, currentPrice]
      );

      const convertedCurrentPrice = new Decimal(currentPrice);
      let newPrice;

      // Update the instruments table (assuming some logic here, e.g., updating the current price)
      if (orderType === 'buy') {
        newPrice = convertedCurrentPrice.plus(new Decimal('0.10'));
        await queryWithRetry(pool,
          `UPDATE instruments SET current_price = $1 WHERE symbol = $2`,
          [newPrice.toFixed(2), stock]
        );
      } else {
        newPrice = convertedCurrentPrice.minus(new Decimal('0.10'));
        await queryWithRetry(pool,
          `UPDATE instruments SET current_price = $1 WHERE symbol = $2`,
          [newPrice.toFixed(2), stock]
        );
      }

      console.log('newPrice:', newPrice.toFixed(2));

      await client.query('COMMIT');
      client.release();

      // Wait for 250ms before processing the order further
      setTimeout(async () => {
        for (const pool of pools) {
          try {
            const client = await pool.connect();

            await client.query('BEGIN');

            // Insert into the order_processing table
            await queryWithRetry(pool,
              `INSERT INTO order_processing 
               (execution_id, order_id, order_status, order_nbr, order_executed_ts, symbol, total_qty, unit_price) 
               VALUES ($1, $2, 'order_processed', $3, now(), $4, $5, $6)`,
              [executionId, orderId, orderNbr, stock, shares, currentPrice]
            );

            // Insert into the order_activity table
            await queryWithRetry(pool,
              `INSERT INTO order_activity 
               (activity_id, order_id, order_nbr, order_status, activity_entry_ts, symbol, total_qty, order_type, unit_price) 
               VALUES ($1, $2, $3, 'order_processed', now(), $4, $5, $6, $7)`,
              [newactivityId, orderId, orderNbr, stock, shares, orderType, currentPrice]
            );

            // Insert into the trades table
            await queryWithRetry(pool,
              `INSERT INTO trades 
               (trade_id, execution_id, symbol, order_type, trade_price, quantity, trade_ts) 
               VALUES ($1, $2, $3, $4, $5, $6, now())`,
              [tradeId, executionId, stock, orderType, currentPrice, shares]
            );

            await client.query('COMMIT');
            client.release();

            console.log('Order processed and trades recorded');
            break; // If successful, break out of the retry loop
          } catch (err) {
            console.error('Error processing order:', err);
          }
        }
      }, 250);

      // Send a success response
      return res.status(200).json({ message: 'Order submitted successfully', orderId: orderResult.rows[0].order_id });
    } catch (err) {
      console.error('Error submitting order:', err);
    }
  }
  res.status(500).send('Server Error');
});

// Utility function to generate a random order number (for demo purposes)
function generateOrderNumber() {
  return 'ORD' + Math.floor(Math.random() * 1000000);
}

// Utility function to generate a UUID (for demo purposes)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
