# xBILLPAY monorepo microservice

## Breakdown of Functionality:

- Agent Authentication and Authorization
- XBillpay Agent Wallet
- Bill Payment via Agent Wallet
- Wallet to Wallet Transfer

## Design Microservices:

- Auth Service: Responsible for authentication and authorization of agents.
- Wallet Service: Manages agent wallets and wallet transactions.
- Payment Service: Handles bill payments.
- Transfer Service: Facilitates wallet-to-wallet transfers.

## start app

- clone repo: git clone git@github.com:Olaoluwa402/xbillpay-nestjs-microservice.git
- cd servers
- npm i
- create .env file in root dir. check env.example for env values
- start containers: docker compose up -d --build -V

## api services url

- localhost/api
- localhost/wallet-api/api
- localhost/payment-api/api
- localhost/transfer-api/api
