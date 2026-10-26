import { $ } from '@wdio/globals'
import { logger } from '../utils/logger.js'
import Page from './page.js'

/** Prefix of the test id of a wallet toggle; the rest of the id is the full wallet address. */
const walletTogglePrefix = 'tgl-li-wallets-'

/**
 * "Show or hide wallets" list (`.../manage-accounts`): one switch per wallet derived from the recovery phrase.
 * The list is virtualised (react-virtuoso), so rows are located by their `data-index`, not by DOM order.
 */
class ManageAccountsPage extends Page {
    /** "Save" button; disabled until a switch changes. */
    public get saveButton() {
        return this.byTestId('btn-save')
    }

    /**
     * Switch of the wallet at a zero-based position in the list (0 = first item).
     * The switch is a `button[role="switch"]` with `aria-checked` and `disabled` attributes.
     */
    public walletToggleAt(index: number) {
        return $(`[data-testid="virtuoso-item-list"] [data-index="${index}"] button[role="switch"]`)
    }

    /**
     * Full address of the wallet at a zero-based position, read from the switch's test id
     * (`tgl-li-wallets-<address>`).
     */
    public async getWalletAddressAt(index: number): Promise<string> {
        const toggle = this.walletToggleAt(index)
        await toggle.waitForExist()
        const testId = (await toggle.getAttribute('data-testid')) ?? ''
        return testId.slice(walletTogglePrefix.length)
    }

    /**
     * Switches on the wallet at a zero-based position and waits until the switch reports "on".
     * @param index 2 = 3rd list item
     */
    public async selectWalletAt(index: number): Promise<void> {
        const toggle = this.walletToggleAt(index)
        await this.click(toggle, `switch of list item ${index + 1}`)
        await toggle.waitUntil(async () => (await toggle.getAttribute('aria-checked')) === 'true', {
            timeoutMsg: `Switch of list item ${index + 1} did not turn on`
        })
    }

    /** Clicks "Save" and waits until the list closes. */
    public async save(): Promise<void> {
        await this.saveButton.waitForEnabled()
        await this.click(this.saveButton, '"Save"')
        await this.saveButton.waitForDisplayed({ reverse: true })
        logger.debug('Show or hide wallets list closed')
    }
}

export default new ManageAccountsPage()
