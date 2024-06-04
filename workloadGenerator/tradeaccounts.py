import datetime as dt
import psycopg
import random
import uuid
import string
import logging

class Tradeaccounts:
    def __init__(self, args: dict):

        self.read_pct: float = float(args.get("read_pct", 50) / 100)

        # users
        self.user_id = uuid.uuid4()               #UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        self.username = ""                        #STRING UNIQUE NOT NULL,
        self.password_hash = ""                   #STRING NOT NULL,
        self.email = ""                           #STRING UNIQUE NOT NULL,
        self.created_at = dt.datetime.now()       #TIMESTAMPTZ DEFAULT now(),
        self.updated_at = dt.datetime.now()       #TIMESTAMPTZ DEFAULT now()


    def setup(self, conn: psycopg.Connection, id: int, total_thread_count: int):
        with conn.cursor() as cur:
            print(f"My thread ID is {id}. The total count of threads is {total_thread_count}")
            print(cur.execute(f"select version()").fetchone())

    def run(self):
        return [self.txn_acc_mgmt, self.txn_stocks] #txn_stocks , txn_acc_mgmt
    
    def txn_acc_mgmt(self, conn: psycopg.Connection):

        #users
        self.user_id = uuid.uuid4()               
        self.username = ''.join(random.choices(string.ascii_letters + string.digits, k=8)) #length of username 8
        self.password_hash = ''.join(random.choices(string.ascii_letters + string.digits + string.punctuation, k=12))
        self.email = self.username + random.choice(["example.com", "test.com", "email.com"])
        self.created_at = dt.datetime.now()  
        self.updated_at = dt.datetime.now()

        # inserts into the users table
        with conn.cursor() as cur:
            stmt = """
                insert into users values (%s, %s, %s, %s, %s, %s);
                """
            cur.execute(stmt, (self.user_id, self.username, self.password_hash, self.email,self.created_at,self.updated_at))
        
        #accounts
        self.account_id = uuid.uuid4()
        self.account_nbr = ''.join(random.choices(string.digits, k=10))  # 10-digit account number
        self.balance = round(random.uniform(0, 100000), 2)  # Random balance between 0 and 10000 with 2 decimal places

        # inserts into the account table
        with conn.cursor() as cur:
            stmt = """
                insert into accounts values (%s, %s, %s, %s, %s, %s);
                """
            cur.execute(stmt, (self.account_nbr, self.user_id, self.account_id, self.balance,self.created_at,self.updated_at))
        

    def txn_stocks(self, conn: psycopg.Connection):

        #users
        self.symbol = ''.join(random.choices(string.ascii_uppercase, k=4))  # 4-character symbol
        self.name = ''.join(random.choices(string.ascii_letters, k=10))  # 10-character name
        self.current_price = round(random.uniform(10, 1000), 2)  # Random price between 10 and 1000 with 2 decimal places
        self.created_at = dt.datetime.now()

        # inserts into the users table
        with conn.cursor() as cur:
            stmt = """
                insert into instruments values (%s, %s, %s, %s);
                """
            cur.execute(stmt, (self.symbol, self.name, self.current_price, self.created_at))
        