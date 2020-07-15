# taker-ui

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

> You don't need to restart the app to see changes. The react app has hot-reloading built-in, so you can refresh with Cmd + R to reload the app.
>
> In some cases, such as changes to package.json, you need to restart `yarn dev` to see changes.

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

Follow [these steps](https://www.electron.build/configuration/publish#recommended-github-releases-workflow) when creating a new [release](https://github.com/comit-network/taker-ui/releases), so that you always have the latest artifacts, and the release can be published once it is ready.

## Learning Resources

React:

- [Intro to React](https://reactjs.org/tutorial/tutorial.html)
- [React Hooks](https://reactjs.org/docs/hooks-overview.html)
- [React Router](https://reactrouter.com/)
- [React Component Testing](https://testing-library.com/docs/react-testing-library/intro)
- [React E2E with Testcafe](https://devexpress.github.io/testcafe/documentation/getting-started/)

Electron:

- [Electron](https://www.electronjs.org/)
- [Electron Builder](https://www.electron.build/)
- [Electron Rebuild](https://github.com/electron/electron-rebuild)
