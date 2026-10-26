import fs from 'node:fs'
import path from 'node:path'
import { browser } from '@wdio/globals'
import allureReporter from '@wdio/allure-reporter'
import { env } from '../config/env.js'
import { logger } from './logger.js'

const screenshotDirectory = path.resolve('screenshots')

/** Turns a test title into a safe file name, e.g. `should show 3 wallets` -> `should-show-3-wallets`. */
function toFileName(title: string): string {
    return title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 100)
}

/**
 * Takes a screenshot of the current browser window, saves it under `screenshots/`
 * and attaches it to the Allure report. Generic: it does not know anything about the test,
 * it is called from the `afterTest` hook in `wdio.conf.ts` for every failed test.
 *
 * @param testTitle title of the test, used in the file name
 * @returns absolute path of the saved PNG file
 */
export async function saveFailureScreenshot(testTitle: string): Promise<string> {
    fs.mkdirSync(screenshotDirectory, { recursive: true })
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const file = path.join(screenshotDirectory, `${env.browser}-${toFileName(testTitle)}-${timestamp}.png`)

    await browser.saveScreenshot(file)
    allureReporter.addAttachment('Screenshot on failure', fs.readFileSync(file), 'image/png')
    logger.error(`Screenshot saved: ${file}`)
    return file
}
