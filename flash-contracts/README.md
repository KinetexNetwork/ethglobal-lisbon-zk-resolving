# Kinetex Flash Contracts

This project uses the following stack:

- Language: Solidity v0.8.18
- Framework: Hardhat
- Node.js: v18
- Yarn: v1.22

## Setup

* `yarn`

## Build

* `yarn build` (or `yarn b`)

## Test

* `yarn test` (or `yarn t`)

## Deploy

* Pick target `network` from [package.json](./package.json)
* Make sure `.env` is configured with deployer & the `network`
* Deploy `ProofVerifier`:
  * Full: `yarn h<network> x-proof-verifier-deploy --chain <c>,... --light-client <lc>,... --broadcaster <b>,...`
  * Mock: `yarn h<network> x-proof-verifier-deploy --mock`
* Deploy `KinetexFlash` specifying collateral token and the `ProofVerifier` contract:
  * `yarn h<network> x-flash-deploy --collateral-token <ct> --proof-verifier <pv>`
