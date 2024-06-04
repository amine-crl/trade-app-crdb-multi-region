# Multi-Region CRDB Supported Trading App 

This demo showcases a trading application leveraging CockroachDB's multi-region capabilities to ensure high availability and low latency. The application comprises a frontend React app, a backend Node.js service, and multiple CockroachDB instances across different regions along with Loadbalancers for each region. It also includes Python scripts for generating trading workloads created using PGWorkload.

### Features
- Frontend: Built with React.js, providing a responsive UI for trading activities.
- Backend: Node.js service handling API requests and connecting to CockroachDB.
- Multi-Region Database: CockroachDB instances deployed in US West, US East, and EU West regions, demonstrating multi-region support and fault tolerance.
- Python Workloads: Scripts to simulate trading account creation, order processing, and trade execution.

![alt text](/assets/image.png)

# Prerequisites

Docker compatible [*nix OS](https://en.wikipedia.org/wiki/Unix-like) and [Docker](https://docs.docker.com/get-docker) installed.

Note : Please have 8-12 vCPU*, 20GB RAM and 20GB storage for the multi-region setup to function properly. Adjust the resources based on your requirements.

***MacOS Users:*** If you don't have or can't get Docker Desktop then install docker and buildx using homebrew
I use docker with [colima](https://github.com/abiosoft/colima):

`brew install docker`

`brew install docker-compose`

`brew install colima`

`colima start --cpu 12 --memory 20`

```
$ colima list
PROFILE    STATUS     ARCH       CPUS    MEMORY    DISK     RUNTIME    ADDRESS
default    Running    aarch64    8       20GiB     60GiB    docker
```

### Architecture 
![alt text](/assets/Trade-app-arch.png)


# Setup 
- ### Clone the Repository

  ```
  git clone https://github.com/david7joy/trade-app-crdb-multi-region.git
  ```

-  ### Setup the infrastructure

   Start Services using Docker Compose to start the services.

    ```
    docker-compose up -d
    ```

   This will start to create the below Infrastructure : 
   - 9 node cockroachDB cluster across 3 regions -> us-west-2,us-east-1,eu-west-1
   - 3 HAProxy load balancers per region
   - Frontend - Trading/Order Processing App React App
   - Backend - node app 
   - Trading Account workload generator
   - Trading Order workload generatro 

   P.S -  You will see errors for trade-account-generator and trade-order-generator service, these may fail because CRDB will be getting setup. We will set it up in just a bit.

- ### Verify CockroachDB is initialized 

  Check CockroachDB is running by going to `http://0.0.0.0:8080/#/overview/list` you should see 9 nodes. But, currently this enterprise features are not enabled. If the DB Console URL doesnt work that means cockroachdb has not been initalized. Run the below command by adding container Id of any crdb node.

  
  ```
  docker exec -it <crdb_container_id> /cockroach/cockroach init --insecure
  ```  

  Try the DB Console URL again and it should work. 

- ### Database setup, starter data and enterprise license

  ```
  docker exec -it <crdb_container_id> /cockroach/cockroach sql --insecure
  ```

  Note : it can be any crdb container.  

- ### Create TradeDB Scehma and some account data for the trade-app-ui

  Go to the `sql` folder and use the `trade.sql` file and run all the sql statements to create the tradeDB database, tables and schema required by the app. 
  Note : you will need CockroachDB Enterprise license for some of the features, replace the org_name and license in the below statement. Everything else can be used as is.

  ```
  SET CLUSTER SETTING cluster.organization = 'org_name';
  SET CLUSTER SETTING enterprise.license = 'org_license';
  ```

  Here is the schema for the trade-app-ui tradedb database.

  ![alt text](/assets/schema.png)


- ### Check Backend is running

  Open `http://localhost:5000/api/data` to see data is available. 

  If the backend server is not up, then run `docker-compose up backend` in terminal this should start it up and try the url again.

- ### Check Frontend is running

  Open `http://localhost/` to see if the app is running. Create a few orders either buy or sell and submit the orders. On submission the button will change colors. 

  P.S - Notice you will see the price change on stock by +10/-10 Cents depending on buy / sell order. 

  Here is the application logic and how it works with tradedb database in cockroachdb. 

  ![alt text](/assets/app-logic.png)

- ### Verify orders have been created

  The easiest way to check the order has been created is by checking the order_id in the browser console for the app or by running a simple sql statemenr like below.

  ```
  select * from trades where symbol = 'APPL';
  ```

  This will show the orders that are created, change symbol to whichever stock you used to create the order. 

- ### Start and create some sample data for generating orders for accounts

  This will create some sample account data for 15s

  ```
  DURATION=15 ITERATIONS=100000 CONCURRENCY=4 docker-compose up -d trade-accounts-generator
  ``` 

- ### Start Generating orders

  This will start generating orders and process the orders as well. 
  To understand how this works look `tradeorder.py` in `workloads` folder.

   ```
   DURATION=600 ITERATIONS=10000000 CONCURRENCY=4 docker-compose up -d trade-order-generator
   ```

   Feel free to change the variables as required. 
  
-----------

# Demo Scenarios 

###  Resilience, Reliability
- Infrastructure issue : Server Down

   Drop a node - while the workload is running and create a new order from the app

  `docker-compose stop crdb3-us-west-2`

- Infrastructure issue : Region down 

  Drop all nodes in us-west-2 : while the workload is running and create a new order from the app

  `docker-compose stop crdb1-us-west-2`
  `docker-compose stop crdb1-us-west-2`

- Network issues : Kill Load balancer 
  `docker-compose stop haproxy-us-west-2` 

### Consistency

- Create a new buy or sell order on Trade App for any of the available stocks. You will notice that whenever you create a new order either buy or sell from the price will go up and down by + 10cents. 

  Showcasing consitency in writes as well as during reads after writes. 

- The Live ticker on price changes when workload changes price on the available orders

### Scale

- Run the below order-generator workload to scale up the cluster , change the duration, iterations and concurrency as required. 

  ```
  DURATION=600 ITERATIONS=10000000 CONCURRENCY=4 docker-compose up -d trade-order-generator
  ```

### Bonus Features (Developer Experience)
- JSONB data renders frontend (Instruments Table) (Document workload/Mongo)
- Connection pooling with node.js
- Dockerized & automated installation 


# Trade app SQL Info 

- Use the `trade.sql` file to create schema 
- Use the `trade_sample_insert.sql` to do some quick inserts 


# Useful commands 

- Remove all docker containers `docker rm $(docker ps -a -q)`
- Remove all docker images `docker rmi $(docker images -q)`
- Remove all docker volumens `docker volume rm $(docker volume ls -q)`
- Remove all docker networks `docker network rm $(docker network ls -q)`
- Prune unused networks, containers, images and volumens `docker system prune`
- docker-compose stop backend

# Useful cockroach commands 
-  `docker exec -it <container id> /cockroach/cockroach node status --insecure` 

- `docker exec -it <container id> /cockroach/cockroach init --insecure`
- `docker exec -it <container id> /cockroach/cockroach sql --insecure`

# Contributing
Reach out to David Joy for details on this project and supporting material.
Feel free to submit issues and pull requests. Contributions are welcome!
