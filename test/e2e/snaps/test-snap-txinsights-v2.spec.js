const {
  defaultGanacheOptions,
  withFixtures,
  unlockWallet,
  switchToNotificationWindow,
  WINDOW_TITLES,
  clickNestedButton,
} = require('../helpers');
const FixtureBuilder = require('../fixture-builder');
const { TEST_SNAPS_WEBSITE_URL } = require('./enums');

describe('Test Snap TxInsights-v2', function () {
  it('tests tx insights v2 functionality', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder().build(),
        ganacheOptions: defaultGanacheOptions,
        title: this.test.fullTitle(),
      },
      async ({ driver }) => {
        await unlockWallet(driver);

        // navigate to test snaps page and connect
        await driver.openNewPage(TEST_SNAPS_WEBSITE_URL);

        // wait for page to load
        await driver.waitForSelector({
          text: 'Installed Snaps',
          tag: 'h2',
        });

        // find and scroll to the transaction-insights test and connect
        const snapButton1 = await driver.findElement(
          '#connecttransaction-insights',
        );
        await driver.scrollToElement(snapButton1);
        await driver.delay(1000);
        await driver.clickElement('#connecttransaction-insights');

        // switch to metamask extension and click connect
        await switchToNotificationWindow(driver);
        await driver.clickElement({
          text: 'Connect',
          tag: 'button',
        });

        await driver.waitForSelector({ text: 'Confirm' });

        await driver.clickElement({
          text: 'Confirm',
          tag: 'button',
        });

        await driver.waitForSelector({ text: 'OK' });

        await driver.clickElement({
          text: 'OK',
          tag: 'button',
        });

        // switch to test-snaps page and get accounts
        await driver.switchToWindowWithTitle(WINDOW_TITLES.TestSnaps);
        await driver.clickElement('#getAccounts');

        // switch back to MetaMask window and deal with dialogs
        await switchToNotificationWindow(driver);
        await driver.clickElement({
          text: 'Next',
          tag: 'button',
        });
        await driver.waitForSelector({
          text: 'Confirm',
          tag: 'button',
        });
        await driver.clickElement({
          text: 'Confirm',
          tag: 'button',
        });

        // switch to test-snaps page and send tx
        await driver.switchToWindowWithTitle(WINDOW_TITLES.TestSnaps);
        await driver.clickElement('#sendInsights');

        // switch back to MetaMask window and switch to tx insights pane
        await driver.delay(2000);
        await switchToNotificationWindow(driver);

        await driver.findClickableElement({
          text: 'Confirm',
          tag: 'button',
        });

        await clickNestedButton(driver, 'Insights Example Snap');

        // check that txinsightstest tab contains the right info
        await driver.waitForSelector({
          css: '.snap-ui-renderer__content',
          text: 'ERC-20',
        });

        // click confirm to continue
        await driver.clickElement({
          text: 'Confirm',
          tag: 'button',
        });

        // check for warning from txinsights
        await driver.waitForSelector({
          css: '.snap-delineator__header__text',
          text: 'Warning from Insights Example Snap',
        });

        // check info in warning
        await driver.waitForSelector({
          css: '.snap-ui-renderer__text',
          text: 'ERC-20',
        });

        // click the warning confirm checkbox
        await driver.clickElement('.mm-checkbox__input');

        // click confirm button to send transaction
        await driver.clickElement({
          css: '.mm-box--color-error-inverse',
          text: 'Confirm',
          tag: 'button',
        });

        // switch back to MetaMask tab and switch to activity pane
        await driver.switchToWindowWithTitle(
          WINDOW_TITLES.ExtensionInFullScreenView,
        );
        await clickNestedButton(driver, 'Activity');

        // wait for transaction confirmation
        await driver.waitForSelector({
          css: '.transaction-status-label',
          text: 'Confirmed',
        });
      },
    );
  });
});
