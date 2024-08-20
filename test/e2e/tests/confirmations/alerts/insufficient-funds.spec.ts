import { strict as assert } from 'assert';
import FixtureBuilder from '../../../fixture-builder';
import {
  PRIVATE_KEY,
  convertETHToHexGwei,
  withFixtures,
  WINDOW_TITLES,
} from '../../../helpers';
import { SMART_CONTRACTS } from '../../../seeder/smart-contracts';
import { scrollAndConfirmAndAssertConfirm } from '../helpers';
import {
  TestSuiteArguments,
  openDAppWithContract,
} from '../transactions/shared';

describe.only('Alert for insufficient funds', function () {
  it.only('Shows an alert when the user tries to send a transaction with insufficient funds', async function () {
    const nftSmartContract = SMART_CONTRACTS.NFTS;
    const ganacheOptions = {
      accounts: [
        {
          secretKey: PRIVATE_KEY,
          balance: convertETHToHexGwei(0.0053),
        },
      ],
    };
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .withPreferencesController({
            preferences: {
              redesignedConfirmationsEnabled: true,
              isRedesignedConfirmationsDeveloperEnabled: true,
            },
          })
          .build(),
        ganacheOptions,
        smartContract: nftSmartContract,
        title: this.test?.fullTitle(),
      },
      async ({ driver, contractRegistry }: TestSuiteArguments) => {
        await openDAppWithContract(driver, contractRegistry, nftSmartContract);
        await driver.switchToWindowWithTitle(WINDOW_TITLES.TestDApp);
        await driver.clickElement(`#mintButton`);

        await driver.waitUntilXWindowHandles(3);
        await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);

        const alert = await driver.findElement('[data-testid="inline-alert"]');
        assert.equal(await alert.getText(), 'Alert');
        await driver.clickElementSafe('.confirm-scroll-to-bottom__button');
        await driver.clickElement('[data-testid="inline-alert"]');

        const alertDescription = await driver.findElement(
          '[data-testid="alert-modal__selected-alert"]',
        );
        const alertDescriptionText = await alertDescription.getText();
        assert.equal(
          alertDescriptionText,
          'You do not have enough ETH in your account to pay for transaction fees.',
        );
        await driver.clickElement('[data-testid="alert-modal-close-button"]');

        await scrollAndConfirmAndAssertConfirm(driver);

        const confirmButton = await driver.findElement(
          '[data-testid="confirm-alert-modal-submit-button"]',
        );
        assert.equal(await confirmButton.isEnabled(), false);
      },
    );
  });
});
