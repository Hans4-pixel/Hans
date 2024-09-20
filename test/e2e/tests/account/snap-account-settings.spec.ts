import { Suite } from 'mocha';
import { withFixtures } from '../../helpers';
import FixtureBuilder from '../../fixture-builder';
import { Driver } from '../../webdriver/driver';
import AccountSettingsPage from '../../page-objects/pages/account-settings-page';
import HomePage from '../../page-objects/pages/homepage';
import { loginWithBalanceValidation } from '../../page-objects/flows/login.flow';
import HeaderNavbar from '../../page-objects/pages/header-navbar';
import AccountListPage from '../../page-objects/pages/account-list-page';

describe('Add snap account experimental settings', function (this: Suite) {
  it('switch "Enable Add account snap" to on', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder().build(),
        title: this.test?.fullTitle(),
      },
      async ({ driver }: { driver: Driver }) => {
        await loginWithBalanceValidation(driver);

        // Make sure the "Add snap account" button is not visible.
        const headerNavbar = new HeaderNavbar(driver);
        await headerNavbar.openAccountMenu();
        const accountListPage = new AccountListPage(driver);
        await accountListPage.openAddAccountModal();
        await accountListPage.check_addAccountSnapButtonNotPresent();
        await accountListPage.closeAccountModal();

        // Navigate to experimental settings and enable Add account Snap.
        await headerNavbar.goToSettingsPage();
        await new SettingsPage(driver).goToExperimentalSettings();
        await new ExperimentalSettings( driver).toggleAddAccountSnap();

        // Make sure the "Add account Snap" button is visible.
        await headerNavbar.openAccountMenu();
        await accountListPage.openAddAccountModal();
        await accountListPage.check_addAccountSnapButtonIsDisplayed();
      },
    );
  });
});
