import { ethers } from 'ethers';
import { test } from '@playwright/test';

import { ChromeExtensionPage } from '../../shared/pageObjects/extension-page';
import { SignUpPage } from '../../shared/pageObjects/signup-page';
import { NetworkController } from '../../shared/pageObjects/network-controller-page';
import { SwapPage } from '../pageObjects/swap-page';
import { WalletPage } from '../../shared/pageObjects/wallet-page';
import { ActivityListPage } from '../../shared/pageObjects/activity-list-page';
import { Tenderly, addFundsToAccount } from '../tenderly-network';

let swapPage: SwapPage;
let networkController: NetworkController;
let walletPage: WalletPage;
let activityListPage: ActivityListPage;

const testSet = [
  {
    quantity: '.5',
    source: 'ETH',
    type: 'native',
    destination: 'DAI',
    network: Tenderly.Mainnet,
  },
  {
    quantity: '50',
    source: 'DAI',
    type: 'unapproved',
    destination: 'ETH',
    network: Tenderly.Mainnet,
  },

  {
    source: 'ETH',
    quantity: '.5',
    type: 'native',
    destination: 'WETH',
    network: Tenderly.Mainnet,
  },
  {
    quantity: '.3',
    source: 'WETH',
    type: 'wrapped',
    destination: 'ETH',
    network: Tenderly.Mainnet,
  },
  {
    quantity: '50',
    source: 'DAI',
    type: 'ERC20->ERC20',
    destination: 'USDC',
    network: Tenderly.Mainnet,
  },
];

test.beforeAll(
  'Initialize extension, import wallet and add custom networks',
  async () => {
    const extension = new ChromeExtensionPage();
    const page = await extension.initExtension();
    page.setDefaultTimeout(15000);

    const wallet = ethers.Wallet.createRandom();
    await addFundsToAccount(Tenderly.Mainnet.url, wallet.address);

    const signUp = new SignUpPage(page);
    await signUp.createWallet();

    networkController = new NetworkController(page);
    swapPage = new SwapPage(page);
    activityListPage = new ActivityListPage(page);
    walletPage = new WalletPage(page);

    await networkController.addCustomNetwork(Tenderly.Mainnet);
    await walletPage.importAccount(wallet.privateKey);
  },
);
testSet.forEach((options) => {
  test(`should swap ${options.type} token ${options.source} to ${options.destination} on ${options.network.name}'`, async () => {
    await networkController.selectNetwork(options.network);
    await walletPage.selectSwapAction();
    await swapPage.enterQuote({
      from: options.source,
      to: options.destination,
      qty: options.quantity,
    });
    const quoteFound = await swapPage.waitForQuote();
    if (quoteFound) {
      await swapPage.swap();
      await swapPage.waitForTransactionToComplete();
      await walletPage.selectActivityList();
      await activityListPage.checkActivityIsConfirmed({
        activity: `Swap ${options.source} to ${options.destination}`,
      });
    } else {
      await swapPage.gotBack();
      // eslint-disable-next-line no-console
      console.error(
        `\t\tERROR: No quotes found on ${options.network.name} network' Skipping the test`,
      );
      test.skip();
    }
  });
});
