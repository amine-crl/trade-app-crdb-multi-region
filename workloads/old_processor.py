import datetime as dt
import psycopg
import random
import uuid
import string, time

class Tradeprocessor:
    def __init__(self, args: dict):

        self.read_pct: float = float(args.get("read_pct", 50) / 100)

        # users
        self.order_id = uuid.uuid4()               

    def setup(self, conn: psycopg.Connection, id: int, total_thread_count: int):
        with conn.cursor() as cur:
            print(f"My thread ID is {id}. The total count of threads is {total_thread_count}")
            print(cur.execute(f"select version()").fetchone())

    def run(self):
        return [self.txn_processing]
    
    def txn_processing(self, conn: psycopg.Connection):
        # Order Processing
        
        with conn.cursor() as cur:
            cur.execute(
                    "SELECT order_id, order_nbr, symbol, total_qty, order_type,unit_price \
                    FROM order_activity \
                    WHERE order_status = 'order_received' \
                    AND order_id NOT IN ( \
                        SELECT order_id \
                        FROM order_activity \
                        WHERE order_status = 'order_processed' \
                    ) \
                    ORDER BY activity_entry_ts ASC;",
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

                # inserts into order processing
                with conn.cursor() as cur:
                    stmt = """
                        insert into order_processing values (%s, %s, %s, %s, %s, %s, %s, %s);
                        """
                    cur.execute(stmt, (self.execution_id, self.order_id, self.order_status, self.order_nbr, self.order_executed_ts, self.symbol, self.total_qty,self.unit_price))

                # order activity
                self.activity_id = uuid.uuid4()
                self.order_status = "order_processed"
                self.activity_entry_ts = dt.datetime.now()

                # inserts into order_activity
                with conn.cursor() as cur:
                    stmt = """
                        insert into order_activity values (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                        """
                    cur.execute(stmt, (self.activity_id, self.order_id, self.order_nbr, self.order_status, self.activity_entry_ts, self.symbol, self.total_qty, self.order_type,self.unit_price))

                # Trades
                self.trade_id = uuid.uuid4()

                with conn.cursor() as cur:
                    cur.execute(
                        """select current_price from instruments where symbol = %s;""",
                        (self.symbol,)
                    )

                instrument = cur.fetchone()
                self.current_price = instrument[0]
            
                # pdate trade price by updating the current_price per order. 
                if self.order_type == "BUY":
                    self.trade_price = self.unit_price
                    self.new_stock_price = self.current_price+.10
                else:
                    self.trade_price = self.unit_price
                    self.new_stock_price = self.current_price-.10
                    
                # inserts into order_activity
                with conn.cursor() as cur:
                    stmt = """
                        insert into trades values (%s, %s, %s, %s, %s, %s, %s);
                        """
                    cur.execute(stmt, (self.trade_id, self.execution_id, self.symbol, self.order_type, self.trade_price, self.total_qty, self.trade_ts))

                # Instruments
            
                # inserts into order_activity
                with conn.cursor() as cur:
                    stmt = """
                        update instruments set current_price = %s where symbol = %s;
                        """
                    cur.execute(stmt, (self.new_stock_price, self.symbol))

            