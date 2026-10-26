#!/usr/bin/env node
/**
 * Command-line entry point: `npm test -- --browser=firefox --headless`.
 *
 * Environment variables (BROWSER, HEADLESS) are the single source of truth read by wdio.conf.ts.
 * This wrapper only translates the CLI arguments into those variables and starts WebdriverIO;
 * every other argument (e.g. `--spec`) is passed through to `wdio run`.
 *
 * Supported arguments:
 *   --browser=<chrome|firefox>   or   --browser <chrome|firefox>
 *   --headless                   run without a visible window
 *   --headed                     force a visible window (overrides HEADLESS=true)
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// @wdio/cli does not export its bin file, so it is located relative to this script
const wdioBin = fileURLToPath(new URL('../node_modules/@wdio/cli/bin/wdio.js', import.meta.url))

const passThrough = []
const args = process.argv.slice(2)
for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--browser=')) {
        process.env.BROWSER = arg.slice('--browser='.length)
    } else if (arg === '--browser') {
        process.env.BROWSER = args[++i]
    } else if (arg === '--headless') {
        process.env.HEADLESS = 'true'
    } else if (arg === '--headed') {
        process.env.HEADLESS = 'false'
    } else {
        passThrough.push(arg)
    }
}

const child = spawn(process.execPath, [wdioBin, 'run', './wdio.conf.ts', ...passThrough], {
    stdio: 'inherit',
    env: process.env
})
child.on('exit', (code) => process.exit(code ?? 1))
