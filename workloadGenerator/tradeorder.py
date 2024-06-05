import datetime as dt
import psycopg
import random
import uuid
import string
from decimal import Decimal
import time
from psycopg import OperationalError

connection_strings = [
    'postgres://root@haproxy-us-west-2:26256/trade_db?sslmode=disable&application_name=birdtrade',
    'postgres://root@haproxy-us-east-1:26256/trade_db?sslmode=disable&application_name=birdtrade',
    'postgres://root@haproxy-eu-west-1:26256/trade_db?sslmode=disable&application_name=birdtrade'
]

def connect_with_failover(retries=5, delay=5):
    for attempt in range(retries):
        for conn_string in random.sample(connection_strings, len(connection_strings)):
            try:
                connection = psycopg.connect(conn_string)
                print(f"Connected to {conn_string}")
                return connection
            except OperationalError as e:
                print(f"Connection failed: {e}")
                continue
        print(f"Retrying in {delay} seconds...")
        time.sleep(delay)
    raise Exception("All connection attempts failed")

class Tradeorder:
    def __init__(self, args: dict):
        self.read_pct = float(args.get("read_pct", 50) / 100)
        self.order_id = uuid.uuid4()
        self.trade_price = None

    def setup(self, conn: psycopg.Connection, id: int, total_thread_count: int):
        with conn.cursor() as cur:
            print(f"My thread ID is {id}. The total count of threads is {total_thread_count}")
            cur.execute("SELECT version()")
            print(cur.fetchone())

    def run(self):
        return [self.txn_order, self.txn_processing]

    def txn_order(self, conn: psycopg.Connection):
        with conn.transaction():
            with conn.cursor() as cur:
                cur.execute("SELECT symbol, current_price FROM instruments ORDER BY random() LIMIT 1;")
                instrument = cur.fetchone()
                self.symbol = instrument[0]
                self.unit_price = float(instrument[1])

                cur.execute("SELECT account_nbr FROM accounts ORDER BY random() LIMIT 1;")
                accounts = cur.fetchone()
                self.account_nbr = accounts[0]

                self.order_id = uuid.uuid4()
                self.order_nbr = ''.join(random.choices(string.ascii_uppercase + string.digits, k=14))
                self.order_entry_ts = dt.datetime.now()
                self.total_qty = random.randint(1, 100)
                self.order_type = random.choice(["buy", "sell"])

                stmt = "INSERT INTO orders VALUES (%s, %s, %s, %s, %s, %s, %s, %s);"
                cur.execute(stmt, (self.order_id, self.order_nbr, self.account_nbr, self.symbol, self.order_entry_ts, self.total_qty, self.order_type, self.unit_price))

                self.activity_id = uuid.uuid4()
                self.order_status = "order_received"
                self.activity_entry_ts = dt.datetime.now()

                stmt = "INSERT INTO order_activity VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);"
                cur.execute(stmt, (self.activity_id, self.order_id, self.order_nbr, self.order_status, self.activity_entry_ts, self.symbol, self.total_qty, self.order_type, self.unit_price))

                if self.order_type == "buy":
                    self.new_stock_price = self.unit_price + 0.10
                else:
                    self.new_stock_price = self.unit_price - 0.10

                update_instruments_stmt = "UPDATE instruments SET current_price = %s WHERE symbol = %s;"
                cur.execute(update_instruments_stmt, (Decimal(self.new_stock_price), self.symbol))

    def txn_processing(self, conn: psycopg.Connection):
        time.sleep(0.5)
        with conn.transaction():
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT order_id, order_nbr, symbol, total_qty, order_type, unit_price \
                    FROM order_activity \
                    WHERE order_status = 'order_received' \
                    AND order_id NOT IN ( \
                        SELECT order_id \
                        FROM order_activity \
                        WHERE order_status = 'order_processed' \
                    ) \
                    ORDER BY activity_entry_ts ASC \
                    FOR UPDATE SKIP LOCKED;"
                )
                orders_for_processing = cur.fetchall()

                for order_activity in orders_for_processing:
                    self.order_id = order_activity[0]
                    self.order_nbr = order_activity[1]
                    self.symbol = order_activity[2]
                    self.total_qty = order_activity[3]
                    self.order_type = order_activity[4]
                    self.unit_price = order_activity[5]

                    self.execution_id = uuid.uuid4()
                    self.order_status = "order_processed"
                    self.order_executed_ts = dt.datetime.now()

                    processing_stmt = """
                        INSERT INTO order_processing (execution_id, order_id, order_status, order_nbr, order_executed_ts, symbol, total_qty, unit_price)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                    """
                    cur.execute(processing_stmt, (self.execution_id, self.order_id, self.order_status, self.order_nbr, self.order_executed_ts, self.symbol, self.total_qty, self.unit_price))

                    self.activity_id = uuid.uuid4()
                    self.activity_entry_ts = dt.datetime.now()
                    new_activity_stmt = """
                        INSERT INTO order_activity (activity_id, order_id, order_nbr, order_status, activity_entry_ts, symbol, total_qty, order_type, unit_price)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                    """
                    cur.execute(new_activity_stmt, (self.activity_id, self.order_id, self.order_nbr, self.order_status, self.activity_entry_ts, self.symbol, self.total_qty, self.order_type, self.unit_price))

                    self.trade_price = self.unit_price
                    self.trade_id = uuid.uuid4()
                    self.trade_ts = dt.datetime.now()
                    trade_stmt = """
                        INSERT INTO trades (trade_id, execution_id, symbol, order_type, trade_price, quantity, trade_ts)
                        VALUES (%s, %s, %s, %s, %s, %s, %s);
                    """
                    cur.execute(trade_stmt, (self.trade_id, self.execution_id, self.symbol, self.order_type, self.trade_price, self.total_qty, self.trade_ts))

                    cur.execute("SELECT current_price FROM instruments WHERE symbol = %s;", (self.symbol,))
                    instrument = cur.fetchone()
                    self.new_stock_price = float(instrument[0])

            print(f"Order: {self.order_nbr} [{self.order_type} | {self.symbol} | {self.trade_price} | {round(self.new_stock_price, 2)}] - processed successfully")
