# PAL Wallet
The wallet enables users to connect to PAL Network protocol and
perform normal user transactions and wallet functions. This wallet
also incorporate SuperNode functionalities.

## Installation

1. Install [Yarn](https://yarnpkg.com/en/ "yarn installation") if you haven't already.

2. Clone the repo.

```bash
$ git clone git clone https://github.com/policypalnet/go-ppn-public.git
```

4. Install dependencies.

```bash
$ yarn --ignore-engines
```

4. Start the program.

```bash
$ yarn start
```

## Deployment

1. To deploy using mac:

```bash
$ GH_TOKEN=GITHUB_TOKEN yarn publish-all
```

2. To deploy using windows:

```bash
$ set GH_TOKEN=GITHUB_TOKEN && yarn publish-all
```

## Packaging

1. To package apps for the local platform:

```bash
$ yarn package
```

2. To package apps for all platforms:

```bash
$ yarn package-all
```

3. To package apps with options:

```bash
$ yarn package -- --[option]
```

## CSS Modules

This project is configured to use [css-modules](https://github.com/css-modules/css-modules) out of the box.

All `.css` file extensions will use css-modules unless it has `.global.css`.

If you need global styles, stylesheets with `.global.css` will not go through the
css-modules loader. e.g. `app.global.css`

If you want to import global css libraries (like `bootstrap`), you can just write the following code in `.global.css`:

```css
@import '~bootstrap/dist/css/bootstrap.css';
```

## Sass support

If you want to use Sass in your app, you only need to import `.sass` files instead of `.css` once:

```js
import './app.global.scss';
```