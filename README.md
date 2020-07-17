# taker-ui

## Screenshots

<img width="1020" alt="Screenshot 2020-07-17 at 5 07 48 PM" src="https://user-images.githubusercontent.com/1084226/87769499-52c80300-c850-11ea-8791-4a4397e98455.png">
<img width="1019" alt="Screenshot 2020-07-17 at 5 07 55 PM" src="https://user-images.githubusercontent.com/1084226/87769496-522f6c80-c850-11ea-8af5-0c7d5ae05a0c.png">
<img width="1020" alt="Screenshot 2020-07-17 at 5 08 26 PM" src="https://user-images.githubusercontent.com/1084226/87769479-4e034f00-c850-11ea-9346-cc347d9a01d2.png">
<img width="1021" alt="Screenshot 2020-07-17 at 5 08 03 PM" src="https://user-images.githubusercontent.com/1084226/87769492-5196d600-c850-11ea-841f-a5482a77a516.png">

## Prerequisites

First, you'll need to set up the following:

- [create-comit-app](https://github.com/comit-network/create-comit-app)
- [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions

In addition, you may need to:

- Locate where on your system the `comit-scripts` binary is and replace it with this one: https://github.com/comit-network/create-comit-app/suites/839923778/artifacts/9463974. The path to the binary can be found in the `node_modules` folder of your project. This is a temporary solution until https://github.com/comit-network/create-comit-app/issues/741 is released.
- [Run an unreleased version of cnd](https://gist.github.com/yosriady/5ad0401995599099aa68bd5cb34ff98b) to interact with the new Orderbook API.

## Starting Development

In another terminal:

```bash
cd my-comit-app
yarn start-env
```

Run the app:

```bash
git clone git@github.com:comit-network/taker-ui.git
nvm use
yarn
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

## CI Pipeline

The project includes a Github Actions pipeline for generating cross-platform executables [here](https://github.com/comit-network/taker-ui/actions).

## Publishing new releases

Follow [these steps](https://www.electron.build/configuration/publish#recommended-github-releases-workflow)when creating a new [release](https://github.com/comit-network/taker-ui/releases), so that you always have the latest artifacts, and the release can be published once it is ready.

## Learning Resources

React:

- [Intro to React](https://reactjs.org/tutorial/tutorial.html)
- [React Hooks](https://reactjs.org/docs/hooks-overview.html)

Electron:

- [Electron](https://www.electronjs.org/)
- [Electron Builder](https://www.electron.build/)
- [Electron Rebuild](https://github.com/electron/electron-rebuild)
