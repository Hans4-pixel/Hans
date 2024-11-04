import { strict as assert } from 'assert';
import { Driver } from '../../../webdriver/driver';

class SendTokenPage {
  private driver: Driver;

  private readonly assetPickerButton = '[data-testid="asset-picker-button"]';

  private readonly continueButton = {
    text: 'Continue',
    tag: 'button',
  };

  private readonly ensAddressAsRecipient = '[data-testid="ens-input-selected"]';

  private readonly ensResolvedName =
    '[data-testid="multichain-send-page__recipient__item__title"]';

  private readonly inputAmount = '[data-testid="currency-input"]';

  private readonly inputNFTAmount = '[data-testid="nft-input"]';

  private readonly inputRecipient = '[data-testid="ens-input"]';

  private readonly recipientAccount =
    '.multichain-account-list-item__account-name__button';

  private readonly scanButton = '[data-testid="ens-qr-scan-button"]';

  private readonly tokenListButton =
    '[data-testid="multichain-token-list-button"]';

  constructor(driver: Driver) {
    this.driver = driver;
  }

  async check_pageIsLoaded(): Promise<void> {
    try {
      await this.driver.waitForMultipleSelectors([
        this.scanButton,
        this.inputRecipient,
      ]);
    } catch (e) {
      console.log(
        'Timeout while waiting for send token screen to be loaded',
        e,
      );
      throw e;
    }
    console.log('Send token screen is loaded');
  }

  async fillAmount(amount: string): Promise<void> {
    console.log(`Fill amount input with ${amount} on send token screen`);
    const inputAmount = await this.driver.waitForSelector(this.inputAmount);
    await this.driver.pasteIntoField(this.inputAmount, amount);
    // The return value is not ts-compatible, requiring a temporary any cast to access the element's value. This will be corrected with the driver function's ts migration.
    // TODO: Replace `any` with type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputValue = await (inputAmount as any).getProperty('value');
    assert.equal(
      inputValue,
      amount,
      `Error when filling amount field on send token screen: the value entered is ${inputValue} instead of expected ${amount}.`,
    );
  }

  async fillNFTAmount(amount: string) {
    await this.driver.pasteIntoField(this.inputNFTAmount, amount);
  }

  async fillRecipient(recipientAddress: string): Promise<void> {
    console.log(
      `Fill recipient input with ${recipientAddress} on send token screen`,
    );
    await this.driver.pasteIntoField(this.inputRecipient, recipientAddress);
  }

  async goToNextScreen(): Promise<void> {
    await this.driver.clickElement(this.continueButton);
  }

  async selectRecipientAccount(recipientAccount: string): Promise<void> {
    await this.driver.clickElement({
      text: recipientAccount,
      css: this.recipientAccount,
    });
  }

  async click_assetPickerButton() {
    await this.driver.clickElement(this.assetPickerButton);
  }

  async check_ensAddressAsRecipient(
    ensDomain: string,
    address: string,
  ): Promise<void> {
    // click to select the resolved adress
    await this.driver.clickElement({
      text: ensDomain,
      css: this.ensResolvedName,
    });
    // user should be able to send token to the resolved address
    await this.driver.waitForSelector({
      css: this.ensAddressAsRecipient,
      text: ensDomain + address,
    });
    console.log(
      `ENS domain '${ensDomain}' resolved to address '${address}' and can be used as recipient on send token screen.`,
    );
  }

  async check_ensAddressResolution(
    ensDomain: string,
    address: string,
  ): Promise<void> {
    console.log(
      `Check ENS domain resolution: '${ensDomain}' should resolve to address '${address}' on the send token screen.`,
    );
    // check if ens domain is resolved as expected address
    await this.driver.waitForSelector({
      text: ensDomain,
      css: this.ensResolvedName,
    });
    await this.driver.waitForSelector({
      text: address,
    });
  }

  async click_secondTokenListButton() {
    const elements = await this.driver.findElements(this.tokenListButton);
    await elements[1].click();
  }
}

export default SendTokenPage;
