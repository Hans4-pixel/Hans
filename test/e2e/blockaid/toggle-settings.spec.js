const { strict: assert } = require('assert');
const {
  withFixtures,
  unlockWallet,
  openDapp,
  defaultGanacheOptions,
  getWindowHandles,
} = require('../helpers');
const FixtureBuilder = require('../fixture-builder');

describe('Blockaid Settings', function () {
  it('should not show blockaid UI when toggle is off', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        ganacheOptions: defaultGanacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        await unlockWallet(driver);

        await driver.clickElement(
          '[data-testid="account-options-menu-button"]',
        );

        await driver.clickElement({ text: 'Settings', tag: 'div' });
        await driver.clickElement({ text: 'Experimental', tag: 'div' });

        await openDapp(driver);
        await driver.clickElement('#maliciousPermit');
      },
    );
  });

  it('should show the blockaid UI when the toggle is on', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        ganacheOptions: defaultGanacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        await unlockWallet(driver);

        await driver.clickElement(
          '[data-testid="account-options-menu-button"]',
        );

        await driver.clickElement({ text: 'Settings', tag: 'div' });
        await driver.clickElement({ text: 'Experimental', tag: 'div' });

        await driver.clickElement(
          '[data-testid="advanced-setting-security-alerts-toggle-option"] .toggle-button > div',
        );

        await openDapp(driver);
        await driver.clickElement('#maliciousPermit');
        const windowHandles = await getWindowHandles(driver, 3);
        await driver.switchToWindow(windowHandles.popup);

        const blockaidResponseTitle = '[data-testid="mm-banner-base-title"]';
        const exists = await driver.isElementPresent(blockaidResponseTitle);
        assert.equal(exists, true, 'Request may not be safe');
      },
    );
  });
});
