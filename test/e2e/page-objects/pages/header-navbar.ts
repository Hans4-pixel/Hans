import { Driver } from '../../webdriver/driver';

class HeaderNavbar {
  private driver: Driver;

  private readonly accountMenuButton = '[data-testid="account-menu-icon"]';

  private readonly accountOptionMenu =
    '[data-testid="account-options-menu-button"]';

  private readonly accountSnapButton = { text: 'Snaps', tag: 'div' };

  private readonly lockMetaMaskButton = '[data-testid="global-menu-lock"]';

  private readonly mmiPortfolioButton =
    '[data-testid="global-menu-mmi-portfolio"]';

  private readonly selectNetworkMessage = {
    text: 'Select a network',
    tag: 'h4',
  };

  private readonly settingsButton = '[data-testid="global-menu-settings"]';

  private readonly switchNetworkDropDownButton =
    '[data-testid="network-display"]';

  constructor(driver: Driver) {
    this.driver = driver;
  }

  async check_pageIsLoaded(): Promise<void> {
    try {
      await this.driver.waitForMultipleSelectors([
        this.accountMenuButton,
        this.accountOptionMenu,
      ]);
    } catch (e) {
      console.log('Timeout while waiting for header navbar to be loaded', e);
      throw e;
    }
    console.log('Header navbar is loaded');
  }

  async lockMetaMask(): Promise<void> {
    await this.driver.clickElement(this.accountOptionMenu);
    // fix race condition with mmi build
    if (process.env.MMI) {
      await this.driver.waitForSelector(this.mmiPortfolioButton);
    }
    await this.driver.clickElement(this.lockMetaMaskButton);
  }

  async openAccountMenu(): Promise<void> {
    await this.driver.clickElement(this.accountMenuButton);
  }

  async openSnapListPage(): Promise<void> {
    console.log('Open account snap page');
    await this.driver.clickElement(this.accountOptionMenu);
    await this.driver.clickElement(this.accountSnapButton);
  }

  async openSettingsPage(): Promise<void> {
    console.log('Open settings page');
    await this.driver.clickElement(this.accountOptionMenu);
    // fix race condition with mmi build
    if (process.env.MMI) {
      await this.driver.waitForSelector(this.mmiPortfolioButton);
    }
    await this.driver.clickElement(this.settingsButton);
  }

  /**
   * Switches to the specified network.
   *
   * @param networkName - The name of the network to switch to.
   */
  async switchToNetwork(networkName: string): Promise<void> {
    console.log(`Switch to network ${networkName} in header bar`);
    await this.driver.clickElement(this.switchNetworkDropDownButton);
    await this.driver.waitForSelector(this.selectNetworkMessage);
    await this.driver.clickElementAndWaitToDisappear(
      `[data-testid="${networkName}"]`,
    );
    // check the network is correctly selected and the toaster message is displayed
    await this.driver.waitForSelector(
      `${this.switchNetworkDropDownButton}[aria-label="Network Menu ${networkName}"]`,
    );
    await this.driver.waitForSelector({
      tag: 'h6',
      text: `“${networkName}” was successfully added!`,
    });
  }

  /**
   * Verifies that the displayed account label in header matches the expected label.
   *
   * @param expectedLabel - The expected label of the account.
   */
  async check_accountLabel(expectedLabel: string): Promise<void> {
    console.log(
      `Verify the displayed account label in header is: ${expectedLabel}`,
    );
    await this.driver.waitForSelector({
      css: this.accountMenuButton,
      text: expectedLabel,
    });
  }
}

export default HeaderNavbar;
