const { strict: assert } = require('assert');
const { regularDelayMs, largeDelayMs, withFixtures } = require('../helpers');

describe('Stores custom RPC history', function () {
  const ganacheOptions = {
    accounts: [
      {
        secretKey:
          '0x7C9529A67102755B7E6102D6D950AC5D5863C98713805CEC576B945B15B71EAC',
        balance: 25000000000000000000,
      },
    ],
  };
  it(`creates first custom RPC entry`, async function () {
    await withFixtures(
      {
        fixtures: 'imported-account',
        ganacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        const rpcUrl = 'http://127.0.0.1:8545/1';
        const chainId = '0x539'; // Ganache default, decimal 1337

        await driver.clickElement('.network-display');
        await driver.delay(regularDelayMs);

        await driver.clickElement({ text: 'Custom RPC', tag: 'span' });
        await driver.delay(regularDelayMs);

        await driver.findElement('.settings-page__sub-header-text');

        const customRpcInputs = await driver.findElements('input[type="text"]');
        const rpcUrlInput = customRpcInputs[1];
        const chainIdInput = customRpcInputs[2];

        await rpcUrlInput.clear();
        await rpcUrlInput.sendKeys(rpcUrl);

        await chainIdInput.clear();
        await chainIdInput.sendKeys(chainId);

        await driver.clickElement('.network-form__footer .btn-secondary');
        await driver.findElement({ text: rpcUrl, tag: 'div' });
      },
    );
  });

  it('selects another provider', async function () {
    await withFixtures(
      {
        fixtures: 'imported-account',
        ganacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        await driver.clickElement('.network-display');
        await driver.delay(regularDelayMs);

        await driver.clickElement({ text: 'Ethereum Mainnet', tag: 'span' });
        await driver.delay(largeDelayMs * 2);
      },
    );
  });

  it('finds all recent RPCs in history', async function () {
    await withFixtures(
      {
        fixtures: 'custom-rpc',
        ganacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        await driver.clickElement('.network-display');
        await driver.delay(regularDelayMs);

        // only recent 3 are found and in correct order (most recent at the top)
        const customRpcs = await driver.findElements({
          text: 'http://127.0.0.1:8545/',
          tag: 'span',
        });

        // click Mainnet to dismiss network dropdown
        await driver.clickElement({ text: 'Ethereum Mainnet', tag: 'span' });

        assert.equal(customRpcs.length, 2);
      },
    );
  });

  it('deletes a custom RPC', async function () {
    await withFixtures(
      {
        fixtures: 'custom-rpc',
        ganacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        await driver.clickElement('.network-display');
        await driver.delay(regularDelayMs);

        await driver.clickElement({ text: 'Custom RPC', tag: 'span' });
        await driver.delay(regularDelayMs);

        // cancel new custom rpc
        await driver.clickElement('.network-form__footer button.btn-default');

        const networkListItems = await driver.findClickableElements(
          '.networks-tab__networks-list-name',
        );
        const lastNetworkListItem =
          networkListItems[networkListItems.length - 1];
        await lastNetworkListItem.click();
        await driver.delay(100);

        await driver.clickElement('.btn-danger');
        await driver.delay(regularDelayMs);

        // wait for confirm delete modal to be visible
        const confirmDeleteModal = await driver.findVisibleElement(
          'span .modal',
        );

        await driver.clickElement(
          '.button.btn-danger.modal-container__footer-button',
        );

        // wait for confirm delete modal to be removed from DOM.
        await confirmDeleteModal.waitForElementState('hidden');

        const newNetworkListItems = await driver.findElements(
          '.networks-tab__networks-list-name',
        );

        assert.equal(networkListItems.length - 1, newNetworkListItems.length);
      },
    );
  });
});
