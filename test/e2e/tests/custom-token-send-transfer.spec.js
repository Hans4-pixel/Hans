const { strict: assert } = require('assert');
const {
  convertToHexValue,
  withFixtures,
  switchToNotificationWindow,
  openDapp,
  unlockWallet,
  WINDOW_TITLES,
} = require('../helpers');
const FixtureBuilder = require('../fixture-builder');
const { SMART_CONTRACTS } = require('../seeder/smart-contracts');

const recipientAddress = '0x2f318C334780961FB129D2a6c30D0763d9a5C970';
const editGasfeeCustomToken = async (driver) => {
  const inputs = await driver.findElements('input[type="number"]');
  const gasLimitInput = inputs[0];
  const gasPriceInput = inputs[1];
  await gasLimitInput.clear();
  await gasLimitInput.fill('60000');
  await gasPriceInput.clear();
  await gasPriceInput.fill('10');
  await driver.clickElement({ text: 'Save', tag: 'button' });
};

describe('Transfer custom tokens @no-mmi', function () {
  const smartContract = SMART_CONTRACTS.HST;
  const ganacheOptions = {
    accounts: [
      {
        secretKey:
          '0x7C9529A67102755B7E6102D6D950AC5D5863C98713805CEC576B945B15B71EAC',
        balance: convertToHexValue(25000000000000000000),
      },
    ],
  };
  it('send custom tokens from extension customizing gas values', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        ganacheOptions,
        smartContract,
        title: this.test.fullTitle(),
      },
      async ({ driver, contractRegistry }) => {
        const contractAddress = await contractRegistry.getContractAddress(
          smartContract,
        );
        await unlockWallet(driver);
        if (process.env.MULTICHAIN) {
          return;
        }

        // on testdapp, add created tokens in wallet
        await openDapp(driver, contractAddress);
        await driver.findClickableElement('#deployButton');
        await driver.clickElement({
          text: 'Add Token(s) to Wallet',
          tag: 'button',
        });
        await switchToNotificationWindow(driver);
        await driver.clickElement({ text: 'Add token', tag: 'button' });

        // go to custom tokens view on extension, perform send tokens
        await driver.switchToWindowWithTitle(
          WINDOW_TITLES.ExtensionInFullScreenView,
        );
        await driver.clickElement({
          css: '[data-testid="multichain-token-list-item-value"]',
          text: '10 TST',
        });
        await driver.clickElement('[data-testid="eth-overview-send"]');
        await driver.fill(
          'input[placeholder="Enter public address (0x) or ENS name"]',
          recipientAddress,
        );
        await driver.fill('.unit-input__input', '1');
        await driver.clickElement('[data-testid="page-container-footer-next"]');

        // check transaction details
        await driver.waitForSelector({
          text: '1 TST',
          tag: 'h1',
        });
        await driver.waitForSelector({
          text: 'Transfer',
          css: '.confirm-page-container-summary__action__name',
        });
        const estimatedGasFee = await driver.findElements(
          '.currency-display-component__text',
        );
        assert.notEqual(
          await estimatedGasFee[0].getText(),
          '0',
          'Estimated gas fee should not be 0',
        );

        // check function name and hex data details in hex tab
        await driver.clickElement({
          text: 'Hex',
          tag: 'button',
        });
        await driver.waitForSelector({
          text: 'Transfer',
          tag: 'span',
        });
        await driver.waitForSelector({
          tag: 'p',
          text: '0xa9059cbb0000000000000000000000002f318c334780961fb129d2a6c30d0763d9a5c97',
        });

        // edit gas fee
        await driver.clickElement({ text: 'Details', tag: 'button' });
        await driver.clickElement({ text: 'Edit', tag: 'button' });
        await editGasfeeCustomToken(driver);
        await driver.clickElement({ text: 'Confirm', tag: 'button' });

        // check that transaction has completed correctly and is displayed in the activity list
        await driver.waitForSelector({
          css: '[data-testid="activity-list-item-action"]',
          text: 'Send TST',
        });
        await driver.waitForSelector(
          {
            css: '.transaction-list__completed-transactions [data-testid="transaction-list-item-primary-currency"]',
            text: '-1 TST',
          },
          { timeout: 10000 },
        );
      },
    );
  });

  it('transfer custom tokens from dapp customizing gas values', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        ganacheOptions,
        smartContract,
        title: this.test.fullTitle(),
      },
      async ({ driver, contractRegistry }) => {
        const contractAddress = await contractRegistry.getContractAddress(
          smartContract,
        );
        await unlockWallet(driver);

        // on testdapp, add created tokens in wallet
        await openDapp(driver, contractAddress);
        await driver.findClickableElement('#deployButton');
        await driver.clickElement({
          text: 'Add Token(s) to Wallet',
          tag: 'button',
        });
        await switchToNotificationWindow(driver);
        await driver.clickElement({ text: 'Add token', tag: 'button' });

        // transfer token from dapp
        await driver.switchToWindowWithTitle(WINDOW_TITLES.TestDApp);
        await driver.clickElement({ text: 'Transfer Tokens', tag: 'button' });
        await switchToNotificationWindow(driver);
        await driver.waitForSelector({ text: '1.5 TST', tag: 'h1' });

        // edit gas fee
        await driver.clickElement({ text: 'Edit', tag: 'button' });
        await driver.clickElement(
          { text: 'Edit suggested gas fee', tag: 'button' },
          10000,
        );
        await editGasfeeCustomToken(driver);
        await driver.clickElement({ text: 'Confirm', tag: 'button' });

        // check that transaction has completed correctly and is displayed in the activity list
        await driver.switchToWindowWithTitle(
          WINDOW_TITLES.ExtensionInFullScreenView,
        );
        await driver.clickElement({ tag: 'button', text: 'Activity' });
        await driver.waitForSelector({
          css: '[data-testid="transaction-list-item-primary-currency"]',
          text: '-1.5 TST',
        });

        // check token amount is correct after transaction
        await driver.clickElement({
          text: 'Tokens',
          tag: 'button',
        });
        const tokenAmount = await driver.findElement(
          {
            css: '[data-testid="multichain-token-list-item-value"]',
            text: '8.5 TST',
          },
          { timeout: 10000 },
        );
        assert.ok(tokenAmount, 'Token amount is not correct');
      },
    );
  });

  it('transfer custom tokens from dapp without specifying gas', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        ganacheOptions,
        smartContract,
        title: this.test.fullTitle(),
      },
      async ({ driver, contractRegistry }) => {
        const contractAddress = await contractRegistry.getContractAddress(
          smartContract,
        );
        await unlockWallet(driver);

        // on testdapp, add created tokens in wallet
        await openDapp(driver, contractAddress);
        await driver.findClickableElement('#deployButton');
        await driver.clickElement({
          text: 'Add Token(s) to Wallet',
          tag: 'button',
        });
        await switchToNotificationWindow(driver);
        await driver.clickElement({ text: 'Add token', tag: 'button' });

        // transfer token from dapp
        await driver.switchToWindowWithTitle(WINDOW_TITLES.TestDApp);
        await driver.clickElement({
          text: 'Transfer Tokens Without Gas',
          tag: 'button',
        });
        await switchToNotificationWindow(driver);
        await driver.waitForSelector({ text: '1.5 TST', tag: 'h1' });
        await driver.clickElement({ text: 'Confirm', tag: 'button' });

        // in extension, check that transaction has completed correctly and is displayed in the activity list
        await driver.switchToWindowWithTitle(
          WINDOW_TITLES.ExtensionInFullScreenView,
        );
        await driver.clickElement({ tag: 'button', text: 'Activity' });
        await driver.waitForSelector({
          css: '[data-testid="transaction-list-item-primary-currency"]',
          text: '-1.5 TST',
        });
        await driver.waitForSelector({
          css: '[data-testid="activity-list-item-action"]',
          text: 'Send TST',
        });

        // check token amount is correct after transaction
        await driver.clickElement({
          text: 'Tokens',
          tag: 'button',
        });
        const tokenAmount = await driver.findElement(
          {
            css: '[data-testid="multichain-token-list-item-value"]',
            text: '8.5 TST',
          },
          { timeout: 10000 },
        );
        assert.ok(tokenAmount, 'Token amount is not correct');
      },
    );
  });
});
