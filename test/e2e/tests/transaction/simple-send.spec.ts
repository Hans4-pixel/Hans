import { Suite } from 'mocha';
import { Driver } from '../../webdriver/driver';
import { withFixtures, defaultGanacheOptions } from '../../helpers';
import FixtureBuilder from '../../fixture-builder';
import { loginWithBalanceValidaiton } from '../../page-objects/processes/login.process';
import { sendTransaction } from '../../page-objects/processes/send-transaction.process';
import HomePage from '../../page-objects/pages/homepage';

describe('Simple send eth', function (this: Suite) {
  it('can send a simple transaction from one account to another', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder().build(),
        ganacheOptions: defaultGanacheOptions,
        title: this.test?.fullTitle(),
      },
      async ({ driver }: { driver: Driver }) => {
        await loginWithBalanceValidaiton(driver);
        await sendTransaction(
          driver,
          '0x985c30949c92df7a0bd42e0f3e3d539ece98db24',
          '1',
          '0.000042',
          '1.000042',
        );
        const homePage = new HomePage(driver);
        await homePage.check_confirmedTxNumberDisplayedInActivity();
        await homePage.check_txAmountInActivity();
      },
    );
  });
});
