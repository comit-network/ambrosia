# Ambrosia

This is alpha software, feel free to contact us for help if you want to try it out:

- Email: [hello@comit.network](mailto:hello@comit.network)
- Matrix chat: [#comit:matrix.org](https://matrix.to/#/!HYBOPcopXgKbEnEELc:matrix.org?via=matrix.org&via=privacytools.io)
- Twitter: [@comit_network](https://twitter.com/comit_network)

Ambrosia is a decentralized exchange user interface, that uses the [COMIT network daemon (cnd)](https://github.com/comit-network/comit-rs) for atomic swaps.

## Prerequisites

Swapping requires setting up a Ledger Nano S device and a [Bitcoin Core](https://bitcoincore.org) node.

[cnd](https://github.com/comit-network/comit-rs) must be installed separately to use Ambrosia.

For testing Ambrosia with a development setup (on regtest) we recommend using [comit-scripts](https://github.com/comit-network/create-comit-app/tree/master/scripts).

## Build from code

```
git clone https://github.com/comit-network/ambrosia.git
cd ambrosia
yarn install
```

### Run Development build

```bash
yarn dev
```

## Run Production build

```bash
yarn start
```

## Packaging for Production

To package apps for the local platform:

```bash
yarn package
```
