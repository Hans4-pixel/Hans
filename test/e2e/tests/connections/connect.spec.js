const { strict: assert } = require('assert');
const {
  withFixtures,
  WINDOW_TITLES,
  connectToDapp,
  logInWithBalanceValidation,
  defaultGanacheOptions,
} = require('../../helpers');
const FixtureBuilder = require('../../fixture-builder');

describe('Connections page', function () {
  it('should disconnect when click on Disconnect button in connections page', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder().build(),
        title: this.test.fullTitle(),
        ganacheOptions: defaultGanacheOptions,
      },
      async ({ driver, ganacheServer }) => {
        await logInWithBalanceValidation(driver, ganacheServer);
        await connectToDapp(driver);

        // It should render connected status for button if dapp is connected
        const getConnectedStatus = await driver.waitForSelector({
          css: '#connectButton',
          text: 'Connected',
        });
        assert.ok(getConnectedStatus, 'Account is connected to Dapp');

        // Switch to extension Tab
        await driver.switchToWindowWithTitle(
          WINDOW_TITLES.ExtensionInFullScreenView,
        );
        await driver.clickElement(
          '[data-testid ="account-options-menu-button"]',
        );
        await driver.clickElement({ text: 'All Permissions', tag: 'div' });
        await driver.clickElement({
          text: '127.0.0.1:8080',
          tag: 'p',
        });
        const connectionsPageAccountInfo = await driver.isElementPresent({
          text: 'See your accounts and suggest transactions',
          tag: 'p',
        });
        assert.ok(connectionsPageAccountInfo, 'Connections Page is defined');
        const connectionsPageNetworkInfo = await driver.isElementPresent({
          text: 'Use your enabled networks',
          tag: 'p',
        });
        assert.ok(connectionsPageNetworkInfo, 'Connections Page is defined');
        await driver.clickElement(
          '[data-testid ="account-list-item-menu-button"]',
        );
        await driver.clickElement({ text: 'Disconnect', tag: 'button' });
        await driver.clickElement('[data-testid ="disconnect-all"]');
        await driver.clickElement('button[aria-label="Back"]');
        await driver.clickElement({ text: 'All Permissions', tag: 'div' });
        const noAccountConnected = await driver.isElementPresent({
          text: 'MetaMask isn’t connected to this site',
          tag: 'p',
        });
        assert.ok(
          noAccountConnected,
          'Account disconected from connections page',
        );

        // Switch back to Dapp
        await driver.switchToWindowWithTitle(WINDOW_TITLES.TestDApp);

        // Button should show Connect text if dapp is not connected

        const getConnectStatus = await driver.waitForSelector({
          css: '#connectButton',
          text: 'Connect',
        });

        assert.ok(
          getConnectStatus,
          'Account is not connected to Dapp and button has text connect',
        );
      },
    );
  });
});
