import fs from 'node:fs'
import path from 'node:path'
import winston from 'winston'
import { env } from '../config/env.js'

/**
 * One id per `npm test` run. The launcher sets it first and the worker processes inherit it,
 * so all processes of a run write into the same log file.
 */
process.env.RUN_ID ??= new Date().toISOString().replace(/[:.]/g, '-')

const logDirectory = path.resolve('logs')
fs.mkdirSync(logDirectory, { recursive: true })

/** Path of this run's log file. */
export const logFile = path.join(logDirectory, `test-run-${process.env.RUN_ID}.log`)

const line = winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${env.browser}] ${level}: ${message}`)

/**
 * Project logger (winston).
 * - console: coloured, level from `LOG_LEVEL` (default `info`)
 * - file: `logs/test-run-<run id>.log`, always `debug`
 */
export const logger = winston.createLogger({
    level: 'debug',
    transports: [
        new winston.transports.Console({
            level: env.logLevel,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
                line
            )
        }),
        new winston.transports.File({
            filename: logFile,
            level: 'debug',
            format: winston.format.combine(winston.format.timestamp(), line)
        })
    ]
})
