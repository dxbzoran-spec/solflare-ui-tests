import { $ } from '@wdio/globals'
import { logger } from '../utils/logger.js'
import Page from './page.js'

/**
 * "Set a Password for Your Wallet" form (`/onboard/create/manual`).
 */
class SetPasswordPage extends Page {
    /** First password input ("New Password..."). */
    public get newPasswordInput() {
        return this.byTestId('input-new-password')
    }

    /** Second password input ("Repeat Password..."). */
    public get repeatPasswordInput() {
        return this.byTestId('input-repeat-password')
    }

    /**
     * Visible box of the "I agree to the Terms of Service and Privacy Policy" checkbox.
     * The native input is covered by a styled element, so the click goes to this box.
     */
    public get termsCheckbox() {
        return $('label[data-key="onboard-term-and-conditions-check"] [data-id="checkbox"]')
    }

    /** Native checkbox input behind the box; used to verify the checked state. */
    public get termsCheckboxInput() {
        return $('input[name="termsAccepted"]')
    }

    /** "Continue" submit button; disabled until the form is valid. */
    public get continueButton() {
        return this.byTestId('btn-continue')
    }

    /** Types the password into the first input. */
    public async enterPassword(password: string): Promise<void> {
        await this.type(this.newPasswordInput, password, 'New Password', true)
    }

    /** Types the password into the second input. */
    public async enterRepeatPassword(password: string): Promise<void> {
        await this.type(this.repeatPasswordInput, password, 'Repeat Password', true)
    }

    /** Ticks the Terms of Service checkbox (only if it is not ticked yet). */
    public async acceptTerms(): Promise<void> {
        if (await this.termsCheckboxInput.isSelected()) {
            logger.debug('Terms checkbox is already checked')
            return
        }
        await this.click(this.termsCheckbox, '"I agree to the Terms of Service and Privacy Policy"')
    }

    /** Waits until "Continue" becomes enabled, then clicks it. */
    public async clickContinue(): Promise<void> {
        await this.continueButton.waitForEnabled()
        await this.click(this.continueButton, '"Continue"')
    }
}

export default new SetPasswordPage()
