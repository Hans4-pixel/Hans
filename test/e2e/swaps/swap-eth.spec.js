const { withFixtures } = require('../helpers');
const {
  withFixturesOptions,
  loadExtension,
  buildQuote,
  reviewQuote,
  waitForTransactionToComplete,
  checkActivityTransaction,
} = require('./shared');

describe('Swap Eth for another Token', function () {
  it('Completes second Swaps while first swap is processing', async function () {
    withFixturesOptions.ganacheOptions.blockTime = 10;

    await withFixtures(
      {
        ...withFixturesOptions,
        failOnConsoleError: false,
        title: this.test.title,
      },
      async ({ driver }) => {
        await loadExtension(driver);
        await buildQuote(driver, {
          amount: 0.001,
          swapTo: 'USDC',
        });
        await reviewQuote(driver, {
          amount: '0.001',
          swapFrom: 'TESTETH',
          swapTo: 'USDC',
        });
        await driver.clickElement({ text: 'Swap', tag: 'button' });
        await driver.clickElement({ text: 'View in activity', tag: 'button' });
        await buildQuote(driver, {
          amount: 0.003,
          swapTo: 'DAI',
        });
        await reviewQuote(driver, {
          amount: '0.003',
          swapFrom: 'TESTETH',
          swapTo: 'DAI',
        });
        await driver.clickElement({ text: 'Swap', tag: 'button' });
        await waitForTransactionToComplete(driver, 'DAI');
        await checkActivityTransaction(driver, {
          index: 0,
          amount: '0.003',
          swapFrom: 'TESTETH',
          swapTo: 'DAI',
        });
        await checkActivityTransaction(driver, {
          index: 1,
          amount: '0.001',
          swapFrom: 'TESTETH',
          swapTo: 'USDC',
        });
      },
    );
  });
  it('Completes a Swap between Eth and Dai', async function () {
    await withFixtures(
      {
        ...withFixturesOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await loadExtension(driver);
        await buildQuote(driver, {
          amount: 2,
          swapTo: 'DAI',
        });
        await reviewQuote(driver, {
          amount: '2',
          swapFrom: 'TESTETH',
          swapTo: 'DAI',
        });
        await driver.clickElement({ text: 'Swap', tag: 'button' });
        await waitForTransactionToComplete(driver, 'DAI');
        await checkActivityTransaction(driver, {
          index: 0,
          amount: '2',
          swapFrom: 'TESTETH',
          swapTo: 'DAI',
        });
      },
    );
  });
});
