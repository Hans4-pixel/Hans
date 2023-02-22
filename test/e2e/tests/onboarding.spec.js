const { strict: assert } = require('assert');
const { By } = require('selenium-webdriver');
const {
  convertToHexValue,
  withFixtures,
  completeCreateNewWalletOnboardingFlow,
  completeImportSRPOnboardingFlow,
  importSRPOnboardingFlow,
  importWrongSRPOnboardingFlow,
  testDropdownIterations,
} = require('../helpers');
const FixtureBuilder = require('../fixture-builder');

describe('MetaMask onboarding', function () {
  const testSeedPhrase =
    'forum vessel pink push lonely enact gentle tail admit parrot grunt dress';
  const testPassword = 'correct horse battery staple';
  const wrongSeedPhrase =
    'test test test test test test test test test test test test';

  const ganacheOptions = {
    accounts: [
      {
        secretKey:
          '0x53CB0AB5226EEBF4D872113D98332C1555DC304443BEE1CF759D15798D3C55A9',
        balance: convertToHexValue(25000000000000000000),
      },
    ],
  };

  it('Clicks create a new wallet, accepts a secure password, reveals the Secret Recovery Phrase, confirm SRP', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder({ onboarding: true }).build(),
        ganacheOptions,
        title: this.test.title,
        failOnConsoleError: false,
      },
      async ({ driver }) => {
        await driver.navigate();

        await completeCreateNewWalletOnboardingFlow(
          driver,
          testSeedPhrase,
          testPassword,
        );
      },
    );
  });

  it('Clicks import a new wallet, accepts a secure password, reveals the Secret Recovery Phrase, confirm SRP', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder({ onboarding: true }).build(),
        ganacheOptions,
        title: this.test.title,
        failOnConsoleError: false,
      },
      async ({ driver }) => {
        await driver.navigate();

        await completeImportSRPOnboardingFlow(
          driver,
          testSeedPhrase,
          testPassword,
        );
      },
    );
  });

  it('User import wrong secure password', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder({ onboarding: true }).build(),
        ganacheOptions,
        title: this.test.title,
        failOnConsoleError: false,
      },
      async ({ driver }) => {
        await driver.navigate();

        await importWrongSRPOnboardingFlow(driver, wrongSeedPhrase);
      },
    );
  });

  it('Check if user select different type your secret recovery phrase', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder({ onboarding: true }).build(),
        ganacheOptions,
        title: this.test.title,
        failOnConsoleError: false,
      },
      async ({ driver }) => {
        await driver.navigate();

        // welcome
        await driver.clickElement('[data-testid="onboarding-import-wallet"]');

        await driver.clickElement('[data-testid="metametrics-no-thanks"]');

        const dropdowns = await driver.findElements('select');
        const dropdownElement = dropdowns[1];
        await dropdownElement.click();
        const options = await dropdownElement.findElements(
          By.tagName('option'),
        );

        const iterations = options.length;

        await testDropdownIterations(options, driver, iterations);
      },
    );
  });

  const ganacheOptions2 = {
    accounts: [
      {
        secretKey:
          '0x53CB0AB5226EEBF4D872113D98332C1555DC304443BEE1CF759D15798D3C55A9',
        balance: convertToHexValue(10000000000000000000),
      },
    ],
  };

  it(`User can add custom network during onboarding`, async function () {
    const networkName = 'Localhost 8546';
    const networkUrl = 'http://127.0.0.1:8546';
    const currencySymbol = 'ETH';
    const port = 8546;
    const chainId = 1338;
    await withFixtures(
      {
        fixtures: new FixtureBuilder({ onboarding: true }).build(),
        ganacheOptions: {
          ...ganacheOptions,
          concurrent: { port, chainId, ganacheOptions2 },
        },
        title: this.test.title,
      },

      async ({ driver }) => {
        await driver.navigate();
        await importSRPOnboardingFlow(driver, testSeedPhrase, testPassword);

        // Add custome network localhost 8546 during onboarding
        await driver.clickElement({ text: 'Advanced configuration', tag: 'a' });
        await driver.clickElement({
          text: 'Add custom network',
          tag: 'button',
        });

        const [
          networkNameField,
          networkUrlField,
          chainIdField,
          currencySymbolField,
        ] = await driver.findElements('input[type="text"]');
        await networkNameField.sendKeys(networkName);
        await networkUrlField.sendKeys(networkUrl);
        await chainIdField.sendKeys(chainId.toString());
        await currencySymbolField.sendKeys(currencySymbol);

        await driver.clickElement({ text: 'Save', tag: 'button' });
        await driver.waitForElementNotPresent('span .modal');
        await driver.clickElement({ text: 'Done', tag: 'button' });

        // After login, check that notification message for added network is displayed
        const notificationMessage = `“${networkName}” was successfully added!`;
        const networkNotification = await driver.isElementPresent({
          css: '[class*="actionable-message__message"]',
          text: notificationMessage,
        });
        assert.equal(networkNotification, true);

        // Check localhost 8546 is selected and its balance value is correct
        const networkDisplay = await driver.findElement(
          '[data-testid="network-display"]',
        );
        assert.equal(await networkDisplay.getText(), networkName);

        const balance1 = await driver.findElement(
          '[data-testid="eth-overview__primary-currency"]',
        );
        assert.ok(/^10\sETH$/u.test(await balance1.getText()));
      },
    );
  });
});
