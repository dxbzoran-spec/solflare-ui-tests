/**
 * Run configuration. Every setting has a default and can be overridden with an environment variable,
 * so local runs, CI and other runners all use the same mechanism.
 * The CLI wrapper (`scripts/run.mjs`) only translates `--browser` / `--headless` into these variables.
 */

/** Browsers this suite supports. */
export const supportedBrowsers = ['chrome', 'firefox'] as const

export type BrowserName = (typeof supportedBrowsers)[number]

/** Reads a boolean variable; accepts `true/false`, `1/0`, `yes/no`. */
function readBoolean(name: string, defaultValue: boolean): boolean {
    const value = process.env[name]?.trim().toLowerCase()
    if (!value) return defaultValue
    return ['true', '1', 'yes'].includes(value)
}

/** Reads a positive number (milliseconds etc.) and fails fast on a typo. */
function readNumber(name: string, defaultValue: number): number {
    const value = process.env[name]?.trim()
    if (!value) return defaultValue
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`${name} must be a positive number, got "${value}"`)
    }
    return parsed
}

/** Reads `BROWSER` and rejects anything that is not supported, with a clear message. */
function readBrowser(): BrowserName {
    const value = (process.env.BROWSER?.trim().toLowerCase() || 'chrome') as BrowserName
    if (!supportedBrowsers.includes(value)) {
        throw new Error(`Unsupported BROWSER "${value}". Use one of: ${supportedBrowsers.join(', ')}`)
    }
    return value
}

export const env = {
    /** Browser to run in: `chrome` (default) or `firefox`. */
    browser: readBrowser(),
    /** Run without a visible browser window. Default: headed. */
    headless: readBoolean('HEADLESS', false),
    /** Site under test. */
    baseUrl: process.env.BASE_URL?.trim() || 'https://solflare.com',
    /** Wallet password; when empty a random one is generated for every run. */
    walletPassword: process.env.WALLET_PASSWORD || undefined,
    /** Console log level (the log file always gets `debug`). */
    logLevel: process.env.LOG_LEVEL?.trim() || 'info',
    /** Default timeout of WebdriverIO `waitFor*` commands. */
    waitTimeout: readNumber('WAIT_TIMEOUT_MS', 15_000),
    /** How long `expect` assertions keep retrying. */
    expectTimeout: readNumber('EXPECT_TIMEOUT_MS', 10_000),
    /** Timeout of a whole Mocha test. */
    testTimeout: readNumber('TEST_TIMEOUT_MS', 120_000),
    /**
     * Headless Chrome only: send the normal Chrome user agent instead of `HeadlessChrome`, which the site
     * answers with HTTP 429. Agreed with Solflare. Default: on; `false` shows the site's original behaviour.
     */
    overrideHeadlessUserAgent: readBoolean('OVERRIDE_HEADLESS_USER_AGENT', true),
    /** True on CI servers (GitHub Actions sets `CI=true`); enables one retry. */
    isCi: readBoolean('CI', false),
    /** Browser window size, identical in headed and headless mode so the layout is the same. */
    windowSize: { width: 1920, height: 1080 }
}
