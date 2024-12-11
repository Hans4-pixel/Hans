import { Suite } from 'mocha';
import { strict as assert } from 'assert';
import HeaderNavbar from '../../page-objects/pages/header-navbar';
import AccountListPage from '../../page-objects/pages/account-list-page';
import { withSolanaAccountSnap } from './common-solana';
import { logging } from 'selenium-webdriver';

import SelectNetwork from '../../page-objects/pages/dialog/select-network';

describe('Switching between account from different networks', function (this: Suite) {
  beforeEach(async function () {
    // Setup code to run before each test
    // For example, you can reset the application state or create a fresh environment
  });

  afterEach(async function () {
    // Teardown code to run after each test
    // For example, you can clean up any data created during the test
  });
  it('Switch from Solana account to another Network account', async function () {
    await withSolanaAccountSnap(
      { title: this.test?.fullTitle() },
      async (driver) => {
        const logs = await driver.driver.manage().logs().get(logging.Type.BROWSER)
        logs.forEach(log => {
          console.log(`[${log.level.name}] ${log.message}`);
        });
        const headerNavbar = new HeaderNavbar(driver);
        await headerNavbar.check_pageIsLoaded();
        await headerNavbar.check_accountLabel('Solana 1');
        assert.equal(await headerNavbar.isNetworkPickerEnabled(), false)
        await headerNavbar.check_currentSelectedNetwork('Solana')
        await headerNavbar.openAccountMenu()
        const accountListPage = new AccountListPage(driver);
        await accountListPage.selectAccount('Account 1')
        assert.equal(await headerNavbar.isNetworkPickerEnabled(), true)
        await headerNavbar.check_currentSelectedNetwork('Localhost 8545')
      },
    );
  });
});
