import Page from './page.js'

/**
 * Wallet dashboard (`/portfolio`), shown after onboarding. Only the header wallet picker is needed.
 */
class PortfolioPage extends Page {
    /** Avatar in the right corner of the header ("Wallet management" button in the brief). */
    public get walletManagementButton() {
        return this.byTestId('wallet-picker-avatar')
    }

    /**
     * Opens the "My wallets" panel by clicking the avatar.
     * Waits longer than usual because the dashboard loads after the wallet is created.
     */
    public async openWalletManagement(): Promise<void> {
        await this.walletManagementButton.waitForDisplayed({ timeout: 30_000 })
        await this.click(this.walletManagementButton, 'Wallet management (header avatar)')
    }
}

export default new PortfolioPage()
