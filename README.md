# Solflare wallet E2E test

[![E2E tests](https://github.com/dxbzoran-spec/solflare-ui-tests/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/dxbzoran-spec/solflare-ui-tests/actions/workflows/e2e-tests.yml)
· [Latest Allure report](https://dxbzoran-spec.github.io/solflare-ui-tests/)

End-to-end test for the [Solflare web wallet](https://solflare.com/onboard): create a new wallet, open wallet
management, add two more wallets from the recovery phrase and verify that the list contains the original wallet
plus the two new ones.

Stack: **WebdriverIO v9**, **TypeScript** (strict), **Mocha**, page objects, **winston** logger,
**Allure** + JUnit reports, GitHub Actions.

## Prerequisites

- **Node.js 20+** (22 recommended, see `.nvmrc`) and npm. Nothing else.
- Browsers and drivers do not need to be installed: WebdriverIO downloads the current stable Chrome/Firefox
  and the matching driver on the first run (`browserVersion: 'stable'`). No Java is needed for the Allure report.

## Quick start

```bash
git clone https://github.com/dxbzoran-spec/solflare-ui-tests.git
cd solflare-ui-tests
npm ci            # install dependencies
npm test          # run the test (Chrome, headed)
npm run report    # open the Allure report of the last run
```

## Running options

The browser and the mode are chosen with **command-line arguments** or **environment variables**.
Environment variables are what the config reads; the arguments are a shortcut that sets them.

| What | Command |
| --- | --- |
| Chrome, headed (default) | `npm test` |
| Firefox, headed | `npm test -- --browser=firefox` or `npm run test:firefox` |
| Headless (default browser) | `npm test -- --headless` or `npm run test:headless` |
| Firefox, headless | `npm test -- --browser=firefox --headless` or `npm run test:firefox:headless` |
| Chrome, headless | `npm run test:chrome:headless` (blocked by the site, see [Observations](#observations)) |
| Same via environment variables | `BROWSER=firefox HEADLESS=true npm test` (PowerShell: `$env:BROWSER='firefox'; $env:HEADLESS='true'; npm test`) |
| Without npm | `node scripts/run.mjs --browser firefox --headless` |
| Type check | `npm run typecheck` |

Any other argument is passed to `wdio run`, e.g. `npm test -- --spec test/specs/wallet-management.e2e.ts`.

### Configuration

Every setting has a default and can be overridden with an environment variable (`test/config/env.ts`):

| Variable | Default | Meaning |
| --- | --- | --- |
| `BROWSER` | `chrome` | `chrome` or `firefox`; anything else fails fast with a clear message |
| `HEADLESS` | `false` | `true` runs without a visible window |
| `BASE_URL` | `https://solflare.com` | Site under test |
| `WALLET_PASSWORD` | random | Password for the new wallet; by default a random 16-character password is generated on every run |
| `LOG_LEVEL` | `info` | Console log level (`error`, `warn`, `info`, `debug`); the log file always gets `debug` |
| `WAIT_TIMEOUT_MS` | `15000` | Timeout of `waitFor*` commands |
| `EXPECT_TIMEOUT_MS` | `10000` | How long assertions keep retrying |
| `TEST_TIMEOUT_MS` | `120000` | Timeout of the whole test |
| `CI` | `false` | `true` (set by GitHub Actions) enables 1 retry; locally a failure is never retried |

The browser window is 1920×1080 in both headed and headless mode, so the layout is the same.

## Test case

`test/specs/wallet-management.e2e.ts` – one test, *"should list the original wallet and the 2 newly added wallets
under the recovery phrase"*. Each step of the brief maps to one page-object call, and every "Verify" is a real assertion:

| # | Step (brief) | Implementation |
| --- | --- | --- |
| 1 | Go to https://solflare.com/onboard | `OnboardPage.open()` |
| 2 | Click **Get started** | `OnboardPage.clickGetStarted()` |
| – | *(live app only)* Click **Create new wallet** | `OnboardPage.clickCreateNewWallet()` |
| 3 | Enter password | `SetPasswordPage.enterPassword()` – random password, masked in logs |
| 4 | Enter the same password in the second field | `SetPasswordPage.enterRepeatPassword()` |
| 5 | Check **I agree to the Terms of Service and Privacy Policy** | `SetPasswordPage.acceptTerms()` + assert checkbox is selected |
| 6 | Click **Continue** | `SetPasswordPage.clickContinue()` (waits until it is enabled) |
| 7 | Click **Wallet management** (avatar in the header) | `PortfolioPage.openWalletManagement()` |
| 8 | Verify **Main wallet** is displayed | assert "Main Wallet" is displayed and is the only wallet; its full address is remembered |
| 9 | Click the arrow icon next to **RECOVERY PHRASE** | `WalletManagementPage.openRecoveryPhraseOptions()` (a ⋮ icon in the live app) |
| 10 | Click **Show or hide wallets** | `RecoveryPhraseMenuPage.clickShowOrHideWallets()` |
| 11 | Verify the first toggle is **disabled** | `toBeDisabled()` |
| 12 | Verify the first toggle is **on** | `aria-checked="true"`, and its address is the original wallet's |
| 13 | Select the 3rd and 4th list items | their full addresses are read first, then `ManageAccountsPage.selectWalletAt(2)` / `(3)` – each waits until the switch is on |
| 14 | Click **Save** | `ManageAccountsPage.save()` (waits until the list closes) |
| ✔ | **Expected:** the list contains the original wallet + the 2 new wallets | **exactly 3** wallets under "Recovery phrase", and their full addresses equal {original, 3rd, 4th} |

Wallets are matched by their **full address** (read from the `data-testid` attributes), not by position or by the
"Wallet 2" / "Wallet 3" labels, so the check fails if a wrong or an extra wallet appears.

## Project structure

```
.github/workflows/e2e-tests.yml   CI: Chrome + Firefox headless, reports, GitHub Pages
scripts/run.mjs                   CLI entry point: --browser / --headless -> env vars -> wdio run
wdio.conf.ts                      WebdriverIO config: capabilities, reporters, hooks (screenshot on failure)
test/
  config/env.ts                   all settings, defaults, validation
  pageobjects/
    page.ts                       base page: open(), logged click/type helpers, byTestId()
    onboard.page.ts               "Get started", "Create new wallet"
    set-password.page.ts          password inputs, terms checkbox, Continue
    portfolio.page.ts             header avatar (wallet management)
    wallet-management.page.ts     "My wallets" panel: Recovery phrase section, wallet rows, options icon
    recovery-phrase-menu.page.ts  "Show or hide wallets"
    manage-accounts.page.ts       wallet switches, Save
  specs/wallet-management.e2e.ts  the test
  utils/
    logger.ts                     winston logger (console + file)
    password.ts                   random password generator
    screenshot.ts                 generic screenshot on failure (file + Allure attachment)
```

Page objects follow the [WebdriverIO page object pattern](https://webdriver.io/docs/pageobjects/): a base `Page` class,
selectors as getters, actions as methods, one exported instance per page, no state in page objects.
Selectors use the app's `data-testid` attributes wherever they exist.

## Reports, screenshots and logs

| Output | Where | Notes |
| --- | --- | --- |
| Console | terminal | spec reporter + one log line per action |
| Allure report | `npm run report` (opens in the browser); `npm run report:generate` → `reports/allure-report/` | failure screenshot attached to the failed test |
| JUnit XML | `reports/junit/` | used by the CI summary |
| Screenshots | `screenshots/<browser>-<test>-<time>.png` | taken automatically for every failed test |
| Log file | `logs/test-run-<time>.log` | `debug` level, one file per run |

`reports/` is emptied at the start of each run; screenshots and logs are kept.

On **GitHub Actions** every run uploads `results-chrome` / `results-firefox` artifacts (reports, screenshots, logs),
shows a JUnit summary per browser, and publishes a combined Allure report to
[GitHub Pages](https://dxbzoran-spec.github.io/solflare-ui-tests/) (runs on `main`).
The workflow runs on push, pull request, daily at 06:00 UTC, and manually (*Run workflow*, with a browser choice).

## Bonus tasks

| Bonus | Status | Where |
| --- | --- | --- |
| Chrome + Firefox, browser changeable | ✅ | `BROWSER` / `--browser`, `wdio.conf.ts` `buildCapabilities()` |
| Runs on any machine, no local dependency | ✅ | WebdriverIO downloads browsers + drivers; proven by GitHub Actions on a clean Ubuntu runner |
| Logger framework, actions logged | ✅ | winston, `test/utils/logger.ts`; every page-object action logs once |
| Generic screenshot on every test failure | ✅ | `afterTest` hook → `test/utils/screenshot.ts` |
| Runnable from the command line, browser chosen by argument | ✅ | `scripts/run.mjs` (`--browser`, `--headless`) |

## Observations

Things found while automating the live app (version 2.41.0, October 2026):

1. **Headless Chrome is blocked by the site.** Requests from a browser whose user agent contains `HeadlessChrome`
   get `HTTP 429 {"errors":["Too many requests."]}` (`curl` with that user agent gets 403; a normal Chrome user agent
   gets 200). The test passes in headed Chrome and in headed and headless Firefox. The failure screenshot of a
   headless Chrome run shows the error page. Overriding the user agent would work around it, but bypassing the site's
   bot protection should be agreed with Solflare first, so it is not done here; in CI the headless Chrome job is
   reported but marked `continue-on-error`.
2. **The brief is slightly out of date:**
   - after *Get started* there is an extra screen where **Create new wallet** has to be chosen;
   - the "arrow icon next to RECOVERY PHRASE" is a **⋮ More options** icon (`icon-btn-wallet-section-options`);
   - there is no recovery-phrase backup step after *Continue*; the dashboard opens directly.
3. **The first switch is disabled only while it is the only wallet switched on.** Once other wallets are selected it
   becomes enabled, so the order of the checks matters (they follow the brief's order).
4. **The "Show or hide wallets" list is virtualised** (react-virtuoso): only visible rows exist in the DOM. Rows are
   addressed by `data-index`, not by DOM order.
5. **Good test ids:** almost every element has a `data-testid`, and wallet rows/switches carry the full address
   (`li-wallets-<address>`, `tgl-li-wallets-<address>`). The terms checkbox is the exception: its native input is
   covered by a styled box, so the test clicks the box and asserts on the input.
6. Clicking the middle of the header wallet picker hits its **copy address** button ("Copied to clipboard"),
   so the test clicks the avatar, as the brief says.
7. The new wallets are auto-named **Wallet 2** and **Wallet 3**, and the section subtitle changes from "1 wallet" to
   "3 wallets". The dashboard shows several promotional banners; none of them block the flow.
