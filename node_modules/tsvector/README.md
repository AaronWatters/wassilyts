# tsVector
Quick and dirty and minimalist vector and matrix operations in Typescript.  KISS.

📖 **[API Documentation](https://aaronwatters.github.io/tsVector/)**
📖 **[Tutorial](https://aaronwatters.github.io/tsVector/tutorial.html)**

This library supplies simple math operations useful for implementing
interactive graphics in javascript (among other purposes).

It is also a bit like a "hello world" typescript library implementation.

![CI](https://github.com/AaronWatters/tsVector/actions/workflows/ci.yml/badge.svg)
![npm version](https://img.shields.io/npm/v/@awatters_flatiron/tsvector)
![npm downloads](https://img.shields.io/npm/dm/@awatters_flatiron/tsvector)
![bundle size](https://img.shields.io/bundlephobia/minzip/@awatters_flatiron/tsvector)
![License](https://img.shields.io/badge/license-BSD%202--Clause-blue)
![GitHub stars](https://img.shields.io/github/stars/AaronWatters/tsVector.svg)

## Using this library in another project

You can add the latest `tsVector` to any JavaScript or TypeScript project from npm or github

To install from npm:

```bash
npm install @awatters_flatiron/tsvector
```

To install from github:

```bash
npm install github:AaronWatters/tsVector
```

npm will fetch the repository and add it to your `package.json` dependencies.

### Import the library

After installation, import using the package name `tsvector`:

**TypeScript / ES modules**

```typescript
import { /* functions you need */ } from "tsvector";
```

**CommonJS**

```javascript
const tsVector = require("tsvector");
```

## Development

### Install dependencies

```bash
npm install
```

### Run the dev server

Start the Vite development server to preview the library in the browser:

```bash
npm run dev
```

The server will print a local URL (e.g. `http://localhost:5173`) that you can open in your browser.

### Run tests

```bash
npm test
```

### Generate a code coverage report

Run the test suite with coverage instrumentation:

```bash
npm run test:coverage
```

After the run completes, an HTML report is written to the `coverage/` directory.
Open `coverage/index.html` in your browser to explore the results.

> **Note:** The `coverage/` directory is listed in `.gitignore` and will not be committed to the repository.

### Generate API documentation

Generate comprehensive API documentation using TypeDoc:

```bash
npm run docs
```

This command will:
- Generate API documentation from your TypeScript source code
- Create an HTML documentation site in the `docs/` directory
- Include a tutorial page with getting started information

After generation, open `docs/index.html` in your browser to view the documentation. The documentation includes:
- Complete API reference for all exported functions and types
- Type information and parameter descriptions
- A tutorial page accessible from the navigation menu

> **Note:** The `docs/` directory is listed in `.gitignore` and regenerated as needed. You can customize the documentation by editing `typedoc.json` and the tutorial content in `docs-assets/tutorial.html`. The documentation is also automatically built and published to [GitHub Pages](https://aaronwatters.github.io/tsVector/) on every push to `main`.

## GitHub Actions CI

This repository includes a CI workflow at [`.github/workflows/ci.yml`](.github/workflows/ci.yml) that automatically runs the test suite on every push and pull request.

The workflow has two jobs:

| Job | Tool | Command |
|-----|------|---------|
| **Unit Tests** | Vitest | `npm test -- --run` |
| **End-to-End Tests** | Playwright | `npm run test:e2e` |

The Playwright job also uploads its HTML report as a downloadable **artifact** (retained for 30 days) so you can inspect failures without re-running locally.

A separate workflow at [`.github/workflows/docs.yml`](.github/workflows/docs.yml) automatically generates and publishes the API documentation to [GitHub Pages](https://aaronwatters.github.io/tsVector/) on every push to `main`.

### Enabling Actions on your fork

GitHub Actions are enabled by default on the original repository.  If you have
forked the repository and Actions are not running, follow these steps:

1. Open your fork on GitHub.
2. Click the **Actions** tab near the top of the page.
3. If Actions have been disabled, GitHub shows a banner — click **"I understand my workflows, go ahead and enable them"**.
4. Actions will now run automatically on every push and pull request to your fork.

### Viewing results and artifacts

1. Go to the **Actions** tab of the repository.
2. Click any workflow run to see individual job logs.
3. Scroll down to the **Artifacts** section at the bottom of the run summary to download the `playwright-report` produced by the e2e job.
