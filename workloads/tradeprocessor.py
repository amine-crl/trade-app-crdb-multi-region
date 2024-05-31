import datetime as dt
import psycopg
import uuid
from decimal import Decimal

class Tradeprocessor:
    def __init__(self, args: dict):
        self.read_pct = float(args.get("read_pct", 50) / 100)
        self.order_id = uuid.uuid4()

    def setup(self, conn: psycopg.Connection, id: int, total_thread_count: int):
        with conn.cursor() as cur:
            print(f"My thread ID is {id}. The total count of threads is {total_thread_count}")
            cur.execute("select version()")
            print(cur.fetchone())

    def run(self):
        return [self.txn_processing]

    def txn_processing(self, conn: psycopg.Connection):
        with conn.cursor() as cur:
            # Fetch orders with status 'order_received' that have not been processed
            cur.execute(
                    "SELECT order_id, order_nbr, symbol, total_qty, order_type,unit_price \
                    FROM order_activity \
                    WHERE order_status = 'order_received' \
                    AND order_id NOT IN ( \
                        SELECT order_id \
                        FROM order_activity \
                        WHERE order_status = 'order_processed' \
                    ) \
                    ORDER BY activity_entry_ts ASC \
                    FOR UPDATE SKIP LOCKED;",
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

                # Insert into order_processing
                processing_stmt = """
                    INSERT INTO order_processing (execution_id, order_id, order_status, order_nbr, order_executed_ts, symbol, total_qty, unit_price)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                """
                cur.execute(processing_stmt, (self.execution_id, self.order_id, self.order_status, self.order_nbr, self.order_executed_ts, self.symbol, self.total_qty, self.unit_price))

                # Insert a new entry into order_activity to log the processing activity
                self.activity_id = uuid.uuid4()
                self.activity_entry_ts = dt.datetime.now()
                new_activity_stmt = """
                    INSERT INTO order_activity (activity_id, order_id, order_nbr, order_status, activity_entry_ts, symbol, total_qty, order_type, unit_price)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                """
                cur.execute(new_activity_stmt, (self.activity_id, self.order_id, self.order_nbr, self.order_status, self.activity_entry_ts, self.symbol, self.total_qty, self.order_type, self.unit_price))

                # Fetch the current price of the symbol
                cur.execute("SELECT current_price FROM instruments WHERE symbol = %s;", (self.symbol,))
                instrument = cur.fetchone()
                self.current_price = float(instrument[0])

                # Update trade price by updating the current_price per order
                if self.order_type == "BUY":
                    self.trade_price = self.unit_price
                    self.new_stock_price = self.current_price + 0.10
                else:
                    self.trade_price = self.unit_price
                    self.new_stock_price = self.current_price - 0.10

                # Insert into trades
                self.trade_id = uuid.uuid4()
                self.trade_ts = dt.datetime.now()
                trade_stmt = """
                    INSERT INTO trades (trade_id, execution_id, symbol, order_type, trade_price, quantity, trade_ts)
                    VALUES (%s, %s, %s, %s, %s, %s, %s);
                """
                cur.execute(trade_stmt, (self.trade_id, self.execution_id, self.symbol, self.order_type, self.trade_price, self.total_qty, self.trade_ts))

                # Update instruments
                update_instruments_stmt = """
                    UPDATE instruments SET current_price = %s WHERE symbol = %s;
                """
                cur.execute(update_instruments_stmt, (Decimal(self.new_stock_price), self.symbol))
        
         # Commit the transaction to ensure all changes are saved

        print("All orders processed successfully")
