# Ambrosia

⚠️ We are currently working on a better user experience. It is not recommended to use this application on mainnet yet.

Ambrosia is a decentralized exchange user interface, that uses the [COMIT network daemon](https://github.com/comit-network/comit-rs) for atomic swaps.

## Prerequisites

Swapping requires setting up a Ledger Nanon S device.
The development setup is currently configured to one specific device.
If you want to set this up yourself please contact that COMIT team.
UI setup support will be added shortly so you can easily do the setup yourself.

For testing Ambrosia with a development setup (on regtest) we recommend using [comit-scripts](https://github.com/comit-network/create-comit-app/tree/master/scripts).
We are working on a stable release of comit-scripts at the moment, until then you have to build the rust-code yourself.

## Starting Development

```bash
yarn dev
```

## Running production build

```bash
yarn start
```

## Packaging for Production

To package apps for the local platform:

```bash
yarn package
```
