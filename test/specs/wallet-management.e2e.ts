import { expect } from '@wdio/globals'
import { env } from '../config/env.js'
import { generatePassword } from '../utils/password.js'
import { logger } from '../utils/logger.js'
import OnboardPage from '../pageobjects/onboard.page.js'
import SetPasswordPage from '../pageobjects/set-password.page.js'
import PortfolioPage from '../pageobjects/portfolio.page.js'
import WalletManagementPage from '../pageobjects/wallet-management.page.js'
import RecoveryPhraseMenuPage from '../pageobjects/recovery-phrase-menu.page.js'
import ManageAccountsPage from '../pageobjects/manage-accounts.page.js'

describe('Wallet management', () => {
    it('should list the original wallet and the 2 newly added wallets under the recovery phrase', async () => {
        // Fresh browser profile = new wallet on every run, so the password is throw-away test data
        const password = env.walletPassword ?? generatePassword()

        // Steps 1-6: onboarding
        await OnboardPage.open()
        await OnboardPage.clickGetStarted()
        await OnboardPage.clickCreateNewWallet() // extra screen in the live app, not in the brief
        await SetPasswordPage.enterPassword(password)
        await SetPasswordPage.enterRepeatPassword(password)
        await SetPasswordPage.acceptTerms()
        await expect(SetPasswordPage.termsCheckboxInput).toBeSelected()
        await SetPasswordPage.clickContinue()

        // Steps 7-8: wallet management shows the Main wallet
        await PortfolioPage.openWalletManagement()
        await expect(WalletManagementPage.mainWalletName).toBeDisplayed()
        await expect(WalletManagementPage.mainWalletName).toHaveText('Main Wallet')
        await expect(WalletManagementPage.recoveryPhraseWallets).toBeElementsArrayOfSize(1)
        const [originalAddress] = await WalletManagementPage.getRecoveryPhraseWalletAddresses()
        logger.info(`Original wallet: ${originalAddress}`)

        // Steps 9-10: recovery phrase options -> Show or hide wallets
        await expect(WalletManagementPage.recoveryPhraseLabel).toHaveText('Recovery phrase', { ignoreCase: true })
        await WalletManagementPage.openRecoveryPhraseOptions()
        await RecoveryPhraseMenuPage.clickShowOrHideWallets()

        // Steps 11-12: the first item is the original wallet; its switch is on and cannot be turned off
        const firstToggle = ManageAccountsPage.walletToggleAt(0)
        await expect(firstToggle).toBeDisabled()
        await expect(firstToggle).toHaveAttribute('aria-checked', 'true')
        expect(await ManageAccountsPage.getWalletAddressAt(0)).toBe(originalAddress)

        // Step 13: select the 3rd and 4th list items, remembering their addresses for the final check
        const thirdAddress = await ManageAccountsPage.getWalletAddressAt(2)
        const fourthAddress = await ManageAccountsPage.getWalletAddressAt(3)
        logger.info(`Selecting wallets: ${thirdAddress}, ${fourthAddress}`)
        await ManageAccountsPage.selectWalletAt(2)
        await ManageAccountsPage.selectWalletAt(3)

        // Step 14: save
        await ManageAccountsPage.save()

        // Expected result: exactly the original wallet + the 2 selected wallets, matched by full address
        await expect(WalletManagementPage.recoveryPhraseWallets).toBeElementsArrayOfSize(3)
        const addresses = await WalletManagementPage.getRecoveryPhraseWalletAddresses()
        expect([...addresses].sort()).toEqual([originalAddress, thirdAddress, fourthAddress].sort())
    })
})
