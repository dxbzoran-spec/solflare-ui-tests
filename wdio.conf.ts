import fs from 'node:fs'
import { setOptions as setExpectOptions } from 'expect-webdriverio'
import { env } from './test/config/env.js'
import { logger, logFile } from './test/utils/logger.js'
import { saveFailureScreenshot } from './test/utils/screenshot.js'

const { width, height } = env.windowSize

/**
 * Capabilities for the selected browser. `browserVersion: 'stable'` makes WebdriverIO download
 * the current stable browser and the matching driver, so nothing has to be installed by hand.
 */
function buildCapabilities(): WebdriverIO.Capabilities {
    if (env.browser === 'firefox') {
        return {
            browserName: 'firefox',
            browserVersion: 'stable',
            'moz:firefoxOptions': {
                args: [...(env.headless ? ['-headless'] : []), `--width=${width}`, `--height=${height}`]
            }
        }
    }
    return {
        browserName: 'chrome',
        browserVersion: 'stable',
        'goog:chromeOptions': {
            args: [
                ...(env.headless ? ['--headless=new'] : []),
                `--window-size=${width},${height}`,
                // Linux CI runners (Ubuntu 23.10+) do not allow Chrome's sandbox, so Chrome exits on start without this
                ...(env.isCi && process.platform === 'linux' ? ['--no-sandbox', '--disable-dev-shm-usage'] : [])
            ]
        }
    }
}

export const config: WebdriverIO.Config = {
    runner: 'local',
    tsConfigPath: './tsconfig.json',

    specs: ['./test/specs/**/*.e2e.ts'],
    maxInstances: 1,
    capabilities: [buildCapabilities()],

    // only WebdriverIO/driver errors; geckodriver prints harmless warnings on every run
    logLevel: 'error',
    bail: 0,
    baseUrl: env.baseUrl,
    waitforTimeout: env.waitTimeout,
    connectionRetryTimeout: 120_000,
    connectionRetryCount: 2,
    // A virtual display (Xvfb) is only needed for headed runs on Linux. On Ubuntu 26.04 starting workers
    // through xvfb-run breaks their IPC channel ("write EINVAL", webdriverio/webdriverio#15685).
    autoXvfb: !env.headless,

    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: env.testTimeout,
        // Retry only on CI, where a flaky network should not fail the pipeline; locally a failure stays visible
        retries: env.isCi ? 1 : 0
    },

    reporters: [
        'spec',
        [
            'allure',
            {
                outputDir: 'reports/allure-results',
                // page-object actions are logged by winston; raw WebDriver commands would only add noise
                disableWebdriverStepsReporting: true,
                // the failure screenshot is attached explicitly by saveFailureScreenshot()
                disableWebdriverScreenshotsReporting: true,
                reportedEnvironmentVars: { Browser: env.browser, Headless: String(env.headless), 'Base URL': env.baseUrl }
            }
        ],
        ['junit', { outputDir: 'reports/junit', outputFileFormat: ({ cid }: { cid: string }) => `results-${env.browser}-${cid}.xml` }]
    ],

    /** Runs once in the launcher process, before any worker starts. Each run starts with empty reports. */
    onPrepare() {
        fs.rmSync('reports', { recursive: true, force: true })
        logger.info(`Run: browser=${env.browser}, headless=${env.headless}, baseUrl=${env.baseUrl}, CI=${env.isCi}`)
        logger.info(`Log file: ${logFile}`)
    },

    /** Runs in the worker before the first test: same window size and assertion timeout everywhere. */
    async before() {
        setExpectOptions({ wait: env.expectTimeout })
        await browser.setWindowSize(width, height)
    },

    beforeTest(test) {
        logger.info(`START: ${test.parent} > ${test.title}`)
    },

    /** Generic failure handling: every failed test gets a screenshot, saved to disk and attached to Allure. */
    async afterTest(test, _context, { passed, error, duration }) {
        if (passed) {
            logger.info(`PASSED: ${test.title} (${duration} ms)`)
            return
        }
        logger.error(`FAILED: ${test.title} (${duration} ms): ${error?.message}`)
        await saveFailureScreenshot(test.title)
    }
}
