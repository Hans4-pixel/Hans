const {
  withFixtures,
  logInWithBalanceValidation,
  openActionMenuAndStartSendFlow,
  generateGanacheOptions,
  tempToggleSettingRedesignedTransactionConfirmations,
} = require('../../helpers');
const FixtureBuilder = require('../../fixture-builder');
const { CHAIN_IDS } = require('../../../../shared/constants/network');
const { GAS_API_BASE_URL } = require('../../../../shared/constants/swaps');

describe('Gas estimates generated by MetaMask', function () {
  const preLondonGanacheOptions = generateGanacheOptions({
    hardfork: 'berlin',
  });
  const postLondonGanacheOptions = generateGanacheOptions({
    hardfork: 'london',
  });

  describe('Old confirmation screens', function () {
    describe('Send on a network that is EIP-1559 compatible', function () {
      it('show expected gas defaults', async function () {
        await withFixtures(
          {
            fixtures: new FixtureBuilder().build(),
            ganacheOptions: postLondonGanacheOptions,
            title: this.test.fullTitle(),
          },
          async ({ driver, ganacheServer }) => {
            await logInWithBalanceValidation(driver, ganacheServer);

            await tempToggleSettingRedesignedTransactionConfirmations(driver);

            await openActionMenuAndStartSendFlow(driver);

            await driver.fill(
              'input[placeholder="Enter public address (0x) or domain name"]',
              '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            );

            await driver.fill('input[placeholder="0"]', '1');

            await driver.clickElement({ css: 'button', text: 'Continue' });

            // Check that the gas estimation is what we expect
            await driver.findElement({
              css: '[data-testid="confirm-gas-display"]',
              text: '0.00043983',
            });
          },
        );
      });

      it('show expected gas defaults when API is down', async function () {
        await withFixtures(
          {
            fixtures: new FixtureBuilder().build(),
            ganacheOptions: postLondonGanacheOptions,
            testSpecificMock: (mockServer) => {
              mockServer
                .forGet(`${GAS_API_BASE_URL}/networks/1337/suggestedGasFees`)
                .thenCallback(() => {
                  return {
                    json: {
                      error: 'cannot get gas prices for chain id 1337',
                    },
                    statusCode: 503,
                  };
                });
            },
            title: this.test.fullTitle(),
          },
          async ({ driver, ganacheServer }) => {
            await logInWithBalanceValidation(driver, ganacheServer);

            await tempToggleSettingRedesignedTransactionConfirmations(driver);

            await openActionMenuAndStartSendFlow(driver);

            await driver.fill(
              'input[placeholder="Enter public address (0x) or domain name"]',
              '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            );

            await driver.fill('input[placeholder="0"]', '1');

            await driver.clickElement({ css: 'button', text: 'Continue' });

            // Check that the gas estimation is what we expect
            await driver.findElement({
              css: '[data-testid="confirm-gas-display"]',
              text: '0.00043983',
            });
          },
        );
      });

      it('show expected gas defaults when the network is not supported', async function () {
        await withFixtures(
          {
            fixtures: new FixtureBuilder().build(),
            ganacheOptions: postLondonGanacheOptions,
            testSpecificMock: (mockServer) => {
              mockServer
                .forGet(`${GAS_API_BASE_URL}/networks/1337/suggestedGasFees`)
                .thenCallback(() => {
                  return {
                    statusCode: 422,
                  };
                });
            },
            title: this.test.fullTitle(),
          },
          async ({ driver, ganacheServer }) => {
            await logInWithBalanceValidation(driver, ganacheServer);

            await tempToggleSettingRedesignedTransactionConfirmations(driver);

            await openActionMenuAndStartSendFlow(driver);

            await driver.fill(
              'input[placeholder="Enter public address (0x) or domain name"]',
              '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            );

            await driver.fill('input[placeholder="0"]', '1');

            await driver.clickElement({ css: 'button', text: 'Continue' });

            // Check that the gas estimation is what we expect
            await driver.findElement({
              css: '[data-testid="confirm-gas-display"]',
              text: '0.00043983',
            });
          },
        );
      });
    });

    describe('Send on a network that is not EIP-1559 compatible', function () {
      it('show expected gas defaults on a network supported by legacy gas API', async function () {
        await withFixtures(
          {
            fixtures: new FixtureBuilder().build(),
            ganacheOptions: {
              ...preLondonGanacheOptions,
              chainId: parseInt(CHAIN_IDS.BSC, 16),
            },
            title: this.test.fullTitle(),
          },
          async ({ driver, ganacheServer }) => {
            await logInWithBalanceValidation(driver, ganacheServer);

            await tempToggleSettingRedesignedTransactionConfirmations(driver);

            await openActionMenuAndStartSendFlow(driver);
            await driver.fill(
              'input[placeholder="Enter public address (0x) or domain name"]',
              '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            );

            await driver.fill('input[placeholder="0"]', '1');

            await driver.clickElement({ css: 'button', text: 'Continue' });

            // Check that the gas estimation is what we expect
            await driver.findElement({
              css: '[data-testid="confirm-gas-display"]',
              text: '0.000042',
            });
          },
        );
      });

      it('show expected gas defaults on a network supported by legacy gas API when that API is down', async function () {
        await withFixtures(
          {
            fixtures: new FixtureBuilder().build(),
            ganacheOptions: {
              ...preLondonGanacheOptions,
              chainId: parseInt(CHAIN_IDS.BSC, 16),
            },
            testSpecificMock: (mockServer) => {
              mockServer
                .forGet(
                  `${GAS_API_BASE_URL}/networks/${parseInt(
                    CHAIN_IDS.BSC,
                    16,
                  )}/gasPrices`,
                )
                .thenCallback(() => {
                  return {
                    statusCode: 422,
                  };
                });
            },
            title: this.test.fullTitle(),
          },
          async ({ driver, ganacheServer }) => {
            await logInWithBalanceValidation(driver, ganacheServer);

            await tempToggleSettingRedesignedTransactionConfirmations(driver);

            await openActionMenuAndStartSendFlow(driver);
            await driver.fill(
              'input[placeholder="Enter public address (0x) or domain name"]',
              '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            );

            await driver.fill('input[placeholder="0"]', '1');

            await driver.clickElement({ css: 'button', text: 'Continue' });

            // Check that the gas estimation is what we expect
            await driver.findElement({
              css: '[data-testid="confirm-gas-display"]',
              text: '0.000042',
            });
          },
        );
      });

      it('show expected gas defaults on a network not supported by legacy gas API', async function () {
        await withFixtures(
          {
            fixtures: new FixtureBuilder().build(),
            ganacheOptions: preLondonGanacheOptions,
            title: this.test.fullTitle(),
          },
          async ({ driver, ganacheServer }) => {
            await logInWithBalanceValidation(driver, ganacheServer);

            await tempToggleSettingRedesignedTransactionConfirmations(driver);

            await openActionMenuAndStartSendFlow(driver);
            await driver.fill(
              'input[placeholder="Enter public address (0x) or domain name"]',
              '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            );

            await driver.fill('input[placeholder="0"]', '1');

            await driver.clickElement({ css: 'button', text: 'Continue' });

            // Check that the gas estimation is what we expect
            await driver.findElement({
              css: '[data-testid="confirm-gas-display"]',
              text: '0.000042',
            });
          },
        );
      });
    });
  });

  describe('Redesigned confirmation screens', function () {
    describe('Send on a network that is EIP-1559 compatible', function () {
      it('show expected gas defaults', async function () {
        await withFixtures(
          {
            fixtures: new FixtureBuilder().build(),
            ganacheOptions: postLondonGanacheOptions,
            title: this.test.fullTitle(),
          },
          async ({ driver, ganacheServer }) => {
            await logInWithBalanceValidation(driver, ganacheServer);

            await openActionMenuAndStartSendFlow(driver);

            await driver.fill(
              'input[placeholder="Enter public address (0x) or domain name"]',
              '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            );

            await driver.fill('input[placeholder="0"]', '1');

            await driver.clickElement({ css: 'button', text: 'Continue' });

            // Check that the gas estimation is what we expect
            await driver.findElement({
              css: '[data-testid="first-gas-field"]',
              text: '0.0004 ETH',
            });
          },
        );
      });

      it('show expected gas defaults when API is down', async function () {
        await withFixtures(
          {
            fixtures: new FixtureBuilder().build(),
            ganacheOptions: postLondonGanacheOptions,
            testSpecificMock: (mockServer) => {
              mockServer
                .forGet(`${GAS_API_BASE_URL}/networks/1337/suggestedGasFees`)
                .thenCallback(() => {
                  return {
                    json: {
                      error: 'cannot get gas prices for chain id 1337',
                    },
                    statusCode: 503,
                  };
                });
            },
            title: this.test.fullTitle(),
          },
          async ({ driver, ganacheServer }) => {
            await logInWithBalanceValidation(driver, ganacheServer);

            await openActionMenuAndStartSendFlow(driver);

            await driver.fill(
              'input[placeholder="Enter public address (0x) or domain name"]',
              '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            );

            await driver.fill('input[placeholder="0"]', '1');

            await driver.clickElement({ css: 'button', text: 'Continue' });

            // Check that the gas estimation is what we expect
            await driver.findElement({
              css: '[data-testid="first-gas-field"]',
              text: '0 ETH',
            });
          },
        );
      });

      it('show expected gas defaults when the network is not supported', async function () {
        await withFixtures(
          {
            fixtures: new FixtureBuilder().build(),
            ganacheOptions: postLondonGanacheOptions,
            testSpecificMock: (mockServer) => {
              mockServer
                .forGet(`${GAS_API_BASE_URL}/networks/1337/suggestedGasFees`)
                .thenCallback(() => {
                  return {
                    statusCode: 422,
                  };
                });
            },
            title: this.test.fullTitle(),
          },
          async ({ driver, ganacheServer }) => {
            await logInWithBalanceValidation(driver, ganacheServer);

            await openActionMenuAndStartSendFlow(driver);

            await driver.fill(
              'input[placeholder="Enter public address (0x) or domain name"]',
              '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            );

            await driver.fill('input[placeholder="0"]', '1');

            await driver.clickElement({ css: 'button', text: 'Continue' });

            // Check that the gas estimation is what we expect
            await driver.findElement({
              css: '[data-testid="first-gas-field"]',
              text: '0 ETH',
            });
          },
        );
      });
    });

    describe('Send on a network that is not EIP-1559 compatible', function () {
      it('show expected gas defaults on a network supported by legacy gas API', async function () {
        await withFixtures(
          {
            fixtures: new FixtureBuilder().build(),
            ganacheOptions: {
              ...preLondonGanacheOptions,
              chainId: parseInt(CHAIN_IDS.BSC, 16),
            },
            title: this.test.fullTitle(),
          },
          async ({ driver, ganacheServer }) => {
            await logInWithBalanceValidation(driver, ganacheServer);

            await openActionMenuAndStartSendFlow(driver);
            await driver.fill(
              'input[placeholder="Enter public address (0x) or domain name"]',
              '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            );

            await driver.fill('input[placeholder="0"]', '1');

            await driver.clickElement({ css: 'button', text: 'Continue' });

            // Check that the gas estimation is what we expect
            await driver.findElement({
              css: '[data-testid="first-gas-field"]',
              text: '0 ETH',
            });
          },
        );
      });

      it('show expected gas defaults on a network supported by legacy gas API when that API is down', async function () {
        await withFixtures(
          {
            fixtures: new FixtureBuilder().build(),
            ganacheOptions: {
              ...preLondonGanacheOptions,
              chainId: parseInt(CHAIN_IDS.BSC, 16),
            },
            testSpecificMock: (mockServer) => {
              mockServer
                .forGet(
                  `${GAS_API_BASE_URL}/networks/${parseInt(
                    CHAIN_IDS.BSC,
                    16,
                  )}/gasPrices`,
                )
                .thenCallback(() => {
                  return {
                    statusCode: 422,
                  };
                });
            },
            title: this.test.fullTitle(),
          },
          async ({ driver, ganacheServer }) => {
            await logInWithBalanceValidation(driver, ganacheServer);

            await openActionMenuAndStartSendFlow(driver);
            await driver.fill(
              'input[placeholder="Enter public address (0x) or domain name"]',
              '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            );

            await driver.fill('input[placeholder="0"]', '1');

            await driver.clickElement({ css: 'button', text: 'Continue' });

            // Check that the gas estimation is what we expect
            await driver.findElement({
              css: '[data-testid="first-gas-field"]',
              text: '0 ETH',
            });
          },
        );
      });

      it('show expected gas defaults on a network not supported by legacy gas API', async function () {
        await withFixtures(
          {
            fixtures: new FixtureBuilder().build(),
            ganacheOptions: preLondonGanacheOptions,
            title: this.test.fullTitle(),
          },
          async ({ driver, ganacheServer }) => {
            await logInWithBalanceValidation(driver, ganacheServer);

            await openActionMenuAndStartSendFlow(driver);
            await driver.fill(
              'input[placeholder="Enter public address (0x) or domain name"]',
              '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            );

            await driver.fill('input[placeholder="0"]', '1');

            await driver.clickElement({ css: 'button', text: 'Continue' });

            // Check that the gas estimation is what we expect
            await driver.findElement({
              css: '[data-testid="first-gas-field"]',
              text: '0 ETH',
            });
          },
        );
      });
    });
  });
});
