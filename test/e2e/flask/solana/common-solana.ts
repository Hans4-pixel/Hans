import { Mockttp } from 'mockttp';
import { withFixtures, unlockWallet } from '../../helpers';
import { Driver } from '../../webdriver/driver';
import HeaderNavbar from '../../page-objects/pages/header-navbar';
import AccountListPage from '../../page-objects/pages/account-list-page';
import FixtureBuilder from '../../fixture-builder';

const SOLANA_URL_REGEX = /^https:\/\/.*\.solana.*/u;

export enum SendFlowPlaceHolders {
  AMOUNT = 'Enter amount to send',
  RECIPIENT = 'Enter receiving address',
  LOADING = 'Preparing transaction',
}

export async function mockSolanaBalanceQuote(mockServer: Mockttp) {
  return await mockServer
    .forPost(SOLANA_URL_REGEX)
    .withJsonBodyIncluding({
      method: 'getBalance',
    })
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: {
          result: {
            context: {
              apiVersion: '2.0.15',
              slot: 305352614,
            },
            value: 0,
          },
        },
      };
    });
}

export async function withSolanaAccountSnap(
  {
    title,
    solanaSupportEnabled,
  }: { title?: string; solanaSupportEnabled?: boolean },
  test: (driver: Driver, mockServer: Mockttp) => Promise<void>,
) {
  console.log('Starting withSolanaAccountSnap');
  await withFixtures(
    {
      fixtures: new FixtureBuilder()
        .withPreferencesControllerAndFeatureFlag({
          solanaSupportEnabled: solanaSupportEnabled ?? true,
        })
        .build(),
      title,
      dapp: true,
      testSpecificMock: async (mockServer: Mockttp) => {
        console.log('Setting up test-specific mocks');
        return [await mockSolanaBalanceQuote(mockServer)];
      },
    },
    async ({ driver, mockServer }: { driver: Driver; mockServer: Mockttp }) => {
      await unlockWallet(driver);
      const headerComponen = new HeaderNavbar(driver);
      console.log('Opening account menu');
      await headerComponen.openAccountMenu();
      const accountListPage = new AccountListPage(driver);
      console.log('Opening add account modal');
      await accountListPage.openAddAccountModal();
      console.log('Adding new Solana account: Solana 1');
      await accountListPage.addNewSolanaAccount({ accountName: 'Solana 1' });
      console.log('Running test');
      await test(driver, mockServer);
    },
  );
}
