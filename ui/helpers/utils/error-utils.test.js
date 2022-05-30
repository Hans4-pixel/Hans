import { SUPPORT_LINK } from '../constants/common';
import { getErrorHtml } from './error-utils';

const mockStore = {
  localeMessages: {
    current: {
      troubleStarting: {
        message:
          'MetaMask had trouble starting. This error could be intermittent, so try restarting the extension.',
      },
      restartMetamask: {
        message: 'Restart MetaMask',
      },
      stillGettingMessage: {
        message: 'Still getting this message?',
      },
      sendBugReport: {
        message: 'Send us a bug report.',
      },
    },
  },
  metamask: {
    currentLocale: 'en',
  },
};

jest.mock('./i18n-helper', () => ({
  fetchLocale: jest.fn((_locale) => mockStore.localeMessages.current),
  loadRelativeTimeFormatLocaleData: jest.fn(),
}));

describe('Error utils Tests', () => {
  it('should get error html', async () => {
    const errorHtml = await getErrorHtml(SUPPORT_LINK, mockStore.metamask);
    const currentLocale = mockStore.localeMessages.current;
    const troubleStartingMessage = currentLocale.troubleStarting.message;
    const restartMetamaskMessage = currentLocale.restartMetamask.message;
    const stillGettingMessageMessage =
      currentLocale.stillGettingMessage.message;
    const sendBugReportMessage = currentLocale.sendBugReport.message;

    expect(errorHtml).toContain(troubleStartingMessage);
    expect(errorHtml).toContain(restartMetamaskMessage);
    expect(errorHtml).toContain(stillGettingMessageMessage);
    expect(errorHtml).toContain(sendBugReportMessage);
  });
});
