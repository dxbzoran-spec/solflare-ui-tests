import Page from './page.js'

/**
 * Recovery phrase menu (`/wallet-management/recovery-phrase/<id>`):
 * Create new wallet, Rename, Show or hide wallets, Reveal, Remove. Only "Show or hide wallets" is needed.
 */
class RecoveryPhraseMenuPage extends Page {
    /** "Show or hide wallets" menu item. */
    public get showOrHideWalletsButton() {
        return this.byTestId('li-recovery-phrase-show-or-hide')
    }

    /** Opens the list of wallets derived from the recovery phrase. */
    public async clickShowOrHideWallets(): Promise<void> {
        await this.click(this.showOrHideWalletsButton, '"Show or hide wallets"')
    }
}

export default new RecoveryPhraseMenuPage()
