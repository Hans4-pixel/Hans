import HomePage from '../pages/homepage';
import ConfirmTxPage from '../pages/send/confirm-tx-page';
import SendTokenPage from '../pages/send/send-token-page';
import { Driver } from '../../webdriver/driver';
import SnapSimpleKeyringPage from '../pages/snap-simple-keyring-page';

/**
 * This function initiates the steps required to send a transaction from the homepage to final confirmation.
 *
 * @param driver - The webdriver instance.
 * @param recipientAddress - The recipient address.
 * @param amount - The amount of the asset to be sent in the transaction.
 * @param gasFee - The expected transaction gas fee.
 * @param totalFee - The expected total transaction fee.
 */
export const sendTransactionToAddress = async (
  driver: Driver,
  recipientAddress: string,
  amount: string,
  gasFee: string,
  totalFee: string,
): Promise<void> => {
  console.log(
    `Start flow to send amount ${amount} to recipient ${recipientAddress} on home screen`,
  );
  // click send button on homepage to start flow
  const homePage = new HomePage(driver);
  await homePage.startSendFlow();

  // user should land on send token screen to fill recipient and amount
  const sendToPage = new SendTokenPage(driver);
  await sendToPage.check_pageIsLoaded();
  await sendToPage.fillRecipient(recipientAddress);
  await sendToPage.fillAmount(amount);
  await sendToPage.goToNextScreen();

  // confirm transaction when user lands on confirm transaction screen
  const confirmTxPage = new ConfirmTxPage(driver);
  await confirmTxPage.check_pageIsLoaded(gasFee, totalFee);
  await confirmTxPage.confirmTx();
};

/**
 * This function initiates the steps required to send a transaction from the homepage to final confirmation.
 *
 * @param driver - The webdriver instance.
 * @param recipientAccount - The recipient account.
 * @param amount - The amount of the asset to be sent in the transaction.
 * @param gasFee - The expected transaction gas fee.
 * @param totalFee - The expected total transaction fee.
 */
export const sendTransactionToAccount = async (
  driver: Driver,
  recipientAccount: string,
  amount: string,
  gasFee: string,
  totalFee: string,
): Promise<void> => {
  console.log(
    `Start flow to send amount ${amount} to recipient account ${recipientAccount} on home screen`,
  );
  // click send button on homepage to start flow
  const homePage = new HomePage(driver);
  await homePage.startSendFlow();

  // user should land on send token screen to fill recipient and amount
  const sendToPage = new SendTokenPage(driver);
  await sendToPage.check_pageIsLoaded();
  await sendToPage.selectRecipientAccount(recipientAccount);
  await sendToPage.fillAmount(amount);
  await sendToPage.goToNextScreen();

  // confirm transaction when user lands on confirm transaction screen
  const confirmTxPage = new ConfirmTxPage(driver);
  await confirmTxPage.check_pageIsLoaded(gasFee, totalFee);
  await confirmTxPage.confirmTx();
};

/**
 * This function initiates the steps required to send a transaction from snap account on homepage to final confirmation.
 *
 * @param driver - The webdriver instance.
 * @param recipientAddress - The recipient address.
 * @param amount - The amount of the asset to be sent in the transaction.
 * @param gasFee - The expected transaction gas fee.
 * @param totalFee - The expected total transaction fee.
 * @param isSyncFlow - Indicates whether synchronous approval option is on for the snap. Defaults to true.
 * @param approveTransaction - Indicates whether the transaction should be approved. Defaults to true.
 */
export const sendTransactionWithSnapAccount = async (
  driver: Driver,
  recipientAddress: string,
  amount: string,
  gasFee: string,
  totalFee: string,
  isSyncFlow: boolean = true,
  approveTransaction: boolean = true,
): Promise<void> => {
  await sendTransactionToAddress(
    driver,
    recipientAddress,
    amount,
    gasFee,
    totalFee,
  );
  if (!isSyncFlow) {
    await new SnapSimpleKeyringPage(driver).approveRejectSnapAccountTransaction(
      approveTransaction,
    );
  }
};
