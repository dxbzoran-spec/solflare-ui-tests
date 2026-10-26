import { $, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'
import { logger } from '../utils/logger.js'

/**
 * Main page object that all page objects inherit from (WebdriverIO page object pattern).
 * It holds the shared actions; every action waits for its element and writes one log line,
 * so the spec stays free of waits and logging.
 */
export default class Page {
    /**
     * Opens a path relative to `baseUrl` (see `wdio.conf.ts`).
     * @param path e.g. `/onboard`
     */
    public async open(path: string): Promise<void> {
        logger.info(`Open ${path}`)
        await browser.url(path)
    }

    /** Element by its `data-testid` attribute (the most stable selector the app offers). */
    protected byTestId(testId: string): ChainablePromiseElement {
        return $(`[data-testid="${testId}"]`)
    }

    /**
     * Waits until the element is clickable, then clicks it.
     * @param element element to click
     * @param name human-readable name used in the log
     */
    protected async click(element: ChainablePromiseElement, name: string): Promise<void> {
        logger.info(`Click ${name}`)
        await element.waitForClickable()
        await element.click()
    }

    /**
     * Waits until the input is displayed, then replaces its value.
     * @param element input element
     * @param value text to type
     * @param name human-readable name used in the log
     * @param secret mask the value in the log (passwords)
     */
    protected async type(element: ChainablePromiseElement, value: string, name: string, secret = false): Promise<void> {
        logger.info(`Type ${secret ? '*'.repeat(8) : `"${value}"`} into ${name}`)
        await element.waitForDisplayed()
        await element.setValue(value)
    }
}
