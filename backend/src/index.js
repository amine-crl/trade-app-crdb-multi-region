const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const Decimal = require('decimal.js');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const connectionStrings = ['postgresql://amine.cluster.sko-iam-demo.com:26257/trade_db?sslmode=disable&application_name=birdtrade'];

const createPool = (connectionString) => {
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    }
  });

  // Handle errors on the pool
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
};

const pools = connectionStrings.map(createPool);

const queryWithRetry = async (query, values, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    for (const pool of pools) {
      try {
        const client = await pool.connect();
        try {
          const res = await client.query(query, values);
          client.release();
          return res;
        } catch (queryErr) {
          client.release();
          console.error(`Query error on attempt ${attempt + 1} with pool ${pool.options.connectionString}: ${queryErr.message}`);
          continue;
        }
      } catch (connectErr) {
        console.error(`Connection error on attempt ${attempt + 1} with pool ${pool.options.connectionString}: ${connectErr.message}`);
      }
    }
  }
  throw new Error('All retries failed');
};

// Define a simple route to fetch data
app.get('/api/data', async (req, res) => {
  try {
    const result = await queryWithRetry(
      `SELECT symbol, current_price, details, name FROM instruments WHERE symbol IN ('NVDA','JPM','NFLX','GOOGL','DIS','MSFT','AAPL')`,
      []
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Query failed:', err);
    res.status(500).send('Server Error');
  }
});

// Define a POST route to handle order submission
app.post('/api/submitOrder', async (req, res) => {
  const { stock, orderType, shares, currentPrice, estimatedCost } = req.body;

  if (!stock || !orderType || !shares || !currentPrice || !estimatedCost) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const orderId = generateUUID();
  const orderNbr = generateOrderNumber();
  const activityId = generateUUID();
  const executionId = generateUUID();
  const tradeId = generateUUID();
  const newactivityId = generateUUID();

  try {
    const orderResult = await queryWithRetry(
      `INSERT INTO orders (order_id, order_nbr, account_nbr, symbol, order_entry_ts, total_qty, order_type, unit_price) 
       VALUES ($1, $2, $3, $4, now(), $5, $6, $7) RETURNING order_id`,
      [orderId, orderNbr, '0005821112', stock, shares, orderType, currentPrice]
    );

    await queryWithRetry(
      `INSERT INTO order_activity (activity_id, order_id, order_nbr, order_status, activity_entry_ts, symbol, total_qty, order_type, unit_price) 
       VALUES ($1, $2, $3, 'order_received', now(), $4, $5, $6, $7)`,
      [activityId, orderId, orderNbr, stock, shares, orderType, currentPrice]
    );

    const convertedCurrentPrice = new Decimal(currentPrice);
    let newPrice;

    if (orderType === 'buy') {
      newPrice = convertedCurrentPrice.plus(new Decimal('0.10'));
      await queryWithRetry(
        `UPDATE instruments SET current_price = $1 WHERE symbol = $2`,
        [newPrice.toFixed(2), stock]
      );
    } else {
      newPrice = convertedCurrentPrice.minus(new Decimal('0.10'));
      await queryWithRetry(
        `UPDATE instruments SET current_price = $1 WHERE symbol = $2`,
        [newPrice.toFixed(2), stock]
      );
    }

    setTimeout(async () => {
      try {
        await queryWithRetry(
          `INSERT INTO order_processing (execution_id, order_id, order_status, order_nbr, order_executed_ts, symbol, total_qty, unit_price) 
           VALUES ($1, $2, 'order_processed', $3, now(), $4, $5, $6)`,
          [executionId, orderId, orderNbr, stock, shares, currentPrice]
        );

        await queryWithRetry(
          `INSERT INTO order_activity (activity_id, order_id, order_nbr, order_status, activity_entry_ts, symbol, total_qty, order_type, unit_price) 
           VALUES ($1, $2, $3, 'order_processed', now(), $4, $5, $6, $7)`,
          [newactivityId, orderId, orderNbr, stock, shares, orderType, currentPrice]
        );

        await queryWithRetry(
          `INSERT INTO trades (trade_id, execution_id, symbol, order_type, trade_price, quantity, trade_ts) 
           VALUES ($1, $2, $3, $4, $5, $6, now())`,
          [tradeId, executionId, stock, orderType, currentPrice, shares]
        );
        console.log('Order processed and trades recorded');
      } catch (err) {
        console.error('Error processing order:', err);
      }
    }, 250);

    res.status(200).json({ message: 'Order submitted successfully', orderId: orderResult.rows[0].order_id });
  } catch (err) {
    console.error('Error submitting order:', err);
    res.status(500).send('Server Error');
  }
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
