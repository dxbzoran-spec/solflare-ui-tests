import Page from './page.js'

/** Prefix of the test id of a wallet row; the rest of the id is the full wallet address. */
const walletRowPrefix = 'li-wallets-'

/**
 * "My wallets" panel (`/wallet-management`), opened from the header avatar.
 * Only the "Recovery phrase" section is needed by the test.
 */
class WalletManagementPage extends Page {
    /** "Recovery phrase" section of the panel. */
    public get recoveryPhraseSection() {
        return this.byTestId('section-Recovery phrase')
    }

    /** "RECOVERY PHRASE" section label. */
    public get recoveryPhraseLabel() {
        return this.recoveryPhraseSection.$('[data-testid="text-wallet-section-name"]')
    }

    /**
     * Icon button next to the "RECOVERY PHRASE" label (the "arrow icon" in the brief;
     * the app renders it as a ⋮ "More options" icon).
     */
    public get recoveryPhraseOptionsButton() {
        return this.recoveryPhraseSection.$('[data-testid="icon-btn-wallet-section-options"]')
    }

    /** Name of the first wallet in the section: the wallet created during onboarding ("Main Wallet"). */
    public get mainWalletName() {
        return this.recoveryPhraseSection.$('[data-testid="text-wallet-name"]')
    }

    /** All wallet rows in the "Recovery phrase" section. */
    public get recoveryPhraseWallets() {
        return this.recoveryPhraseSection.$$(`[data-testid^="${walletRowPrefix}"]`)
    }

    /** Clicks the icon next to the "RECOVERY PHRASE" label, which opens the recovery phrase menu. */
    public async openRecoveryPhraseOptions(): Promise<void> {
        await this.click(this.recoveryPhraseOptionsButton, 'options icon next to "RECOVERY PHRASE"')
    }

    /**
     * Full addresses of the wallets listed under "Recovery phrase", in display order.
     * The address is read from the row's test id (`li-wallets-<address>`); the visible text is shortened.
     */
    public async getRecoveryPhraseWalletAddresses(): Promise<string[]> {
        await this.recoveryPhraseSection.waitForDisplayed()
        const testIds = await this.recoveryPhraseWallets.map((row) => row.getAttribute('data-testid'))
        return testIds.map((testId) => (testId ?? '').slice(walletRowPrefix.length))
    }
}

export default new WalletManagementPage()
