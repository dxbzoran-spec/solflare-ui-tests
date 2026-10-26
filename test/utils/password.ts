import { randomInt } from 'node:crypto'

const upperCase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const lowerCase = 'abcdefghijkmnopqrstuvwxyz'
const digits = '23456789'
const symbols = '!@#$%^&*-_'

/** Picks one random character from `characters` (crypto-strength randomness). */
function pick(characters: string): string {
    return characters[randomInt(characters.length)]
}

/**
 * Generates a random password with at least one upper-case letter, lower-case letter, digit and symbol.
 * A new wallet is created on every run, so the password is throw-away test data and is never stored.
 */
export function generatePassword(length = 16): string {
    const all = upperCase + lowerCase + digits + symbols
    const characters = [pick(upperCase), pick(lowerCase), pick(digits), pick(symbols)]
    while (characters.length < length) characters.push(pick(all))

    // Fisher-Yates shuffle so the guaranteed characters are not always at the start
    for (let i = characters.length - 1; i > 0; i--) {
        const j = randomInt(i + 1)
        ;[characters[i], characters[j]] = [characters[j], characters[i]]
    }
    return characters.join('')
}
