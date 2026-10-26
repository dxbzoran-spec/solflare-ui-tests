import Page from './page.js'

/**
 * Onboarding start: the landing page (`/onboard`) and the "Get started" choice screen (`/onboard/create`).
 */
class OnboardPage extends Page {
    /** "Get started" button on the landing page. */
    public get getStartedButton() {
        return this.byTestId('btn-get-started')
    }

    /** "Create new wallet" button on the second screen (not mentioned in the brief, but required by the app). */
    public get createNewWalletButton() {
        return this.byTestId('btn-manual-create')
    }

    /** Opens the onboarding landing page. */
    public async open(): Promise<void> {
        await super.open('/onboard')
    }

    /** Clicks "Get started". */
    public async clickGetStarted(): Promise<void> {
        await this.click(this.getStartedButton, '"Get started"')
    }

    /** Clicks "Create new wallet", which leads to the password form. */
    public async clickCreateNewWallet(): Promise<void> {
        await this.click(this.createNewWalletButton, '"Create new wallet"')
    }
}

export default new OnboardPage()
