import { Suite } from 'mocha';
import { Driver } from '../../webdriver/driver';
import { Anvil } from '../../seeder/anvil';
import {
  withFixtures,
  tempToggleSettingRedesignedTransactionConfirmations,
} from '../../helpers';
import FixtureBuilder from '../../fixture-builder';
import { loginWithBalanceValidation } from '../../page-objects/flows/login.flow';
import { sendTransactionToAddress } from '../../page-objects/flows/send-transaction.flow';
import HomePage from '../../page-objects/pages/homepage';

describe('Simple send eth', function (this: Suite) {
  it('can send a simple transaction from one account to another', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder().build(),
        title: this.test?.fullTitle(),
        useAnvil: true,
      },
      async ({
        driver,
        anvilServer,
      }: {
        driver: Driver;
        anvilServer?: Anvil;
      }) => {
        await loginWithBalanceValidation(driver, anvilServer);

        await tempToggleSettingRedesignedTransactionConfirmations(driver);

        await sendTransactionToAddress({
          driver,
          recipientAddress: '0x985c30949c92df7a0bd42e0f3e3d539ece98db24',
          amount: '1',
          gasFee: '0.000042',
          totalFee: '1.000042',
        });
        const homePage = new HomePage(driver);
        await homePage.check_pageIsLoaded();
        await homePage.check_confirmedTxNumberDisplayedInActivity();
        await homePage.check_txAmountInActivity();
      },
    );
  });
});
