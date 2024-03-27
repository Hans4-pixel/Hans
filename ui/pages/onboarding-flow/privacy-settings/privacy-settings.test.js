import React from 'react';
import { fireEvent } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { setBackgroundConnection } from '../../../store/background-connection';
import { renderWithProvider } from '../../../../test/jest';
import { CHAIN_IDS } from '../../../../shared/constants/network';
import { SHOW_BASIC_FUNCTIONALITY_MODAL_OPEN } from '../../../store/actionConstants';
import PrivacySettings from './privacy-settings';

const mockOpenBasicFunctionalityModal = jest.fn().mockImplementation(() => {
  return {
    type: SHOW_BASIC_FUNCTIONALITY_MODAL_OPEN,
  };
});

jest.mock('../../../ducks/app/app.ts', () => {
  return {
    openBasicFunctionalityModal: () => {
      return mockOpenBasicFunctionalityModal();
    },
  };
});

describe('Privacy Settings Onboarding View', () => {
  const mockStore = {
    metamask: {
      networkConfigurations: {},
      preferences: {
        petnamesEnabled: true,
      },
      providerConfig: {
        type: 'test',
      },
      incomingTransactionsPreferences: {
        [CHAIN_IDS.MAINNET]: true,
        [CHAIN_IDS.LINEA_MAINNET]: false,
        [CHAIN_IDS.SEPOLIA]: false,
        [CHAIN_IDS.LINEA_GOERLI]: true,
        [CHAIN_IDS.LINEA_SEPOLIA]: true,
      },
      usePhishDetect: true,
      use4ByteResolution: true,
      useTokenDetection: false,
      useCurrencyRateCheck: true,
      useMultiAccountBalanceChecker: true,
      ipfsGateway: 'test.link',
      useAddressBarEnsResolution: true,
      ///: BEGIN:ONLY_INCLUDE_IF(transaction-simulation)
      useTransactionSimulations: true,
      ///: END:ONLY_INCLUDE_IF
    },
    appState: {
      externalServicesOnboardingToggleState: true,
    },
  };

  const store = configureMockStore([thunk])(mockStore);
  const setFeatureFlagStub = jest.fn();
  const setUsePhishDetectStub = jest.fn();
  const setUse4ByteResolutionStub = jest.fn();
  const setUseTokenDetectionStub = jest.fn();
  const setUseCurrencyRateCheckStub = jest.fn();
  const setIpfsGatewayStub = jest.fn();
  const completeOnboardingStub = jest
    .fn()
    .mockImplementation(() => Promise.resolve());
  const setUseMultiAccountBalanceCheckerStub = jest.fn();
  const setUseAddressBarEnsResolutionStub = jest.fn();
  const setIncomingTransactionsPreferencesStub = jest.fn();
  const onboardingToggleBasicFunctionalityOnStub = jest.fn();
  const setDisableExternalServicesStub = jest.fn();
  ///: BEGIN:ONLY_INCLUDE_IF(transaction-simulation)
  const setUseTransactionSimulationsStub = jest.fn();
  ///: END:ONLY_INCLUDE_IF
  const setPreferenceStub = jest.fn();

  setBackgroundConnection({
    setFeatureFlag: setFeatureFlagStub,
    setUsePhishDetect: setUsePhishDetectStub,
    setUse4ByteResolution: setUse4ByteResolutionStub,
    setUseTokenDetection: setUseTokenDetectionStub,
    setUseCurrencyRateCheck: setUseCurrencyRateCheckStub,
    setIpfsGateway: setIpfsGatewayStub,
    completeOnboarding: completeOnboardingStub,
    setUseMultiAccountBalanceChecker: setUseMultiAccountBalanceCheckerStub,
    setUseAddressBarEnsResolution: setUseAddressBarEnsResolutionStub,
    setIncomingTransactionsPreferences: setIncomingTransactionsPreferencesStub,
    setDisableExternalServices: setDisableExternalServicesStub,
    onboardingToggleBasicFunctionalityOn:
      onboardingToggleBasicFunctionalityOnStub,
    ///: BEGIN:ONLY_INCLUDE_IF(transaction-simulation)
    setUseTransactionSimulations: setUseTransactionSimulationsStub,
    ///: END:ONLY_INCLUDE_IF
    setPreference: setPreferenceStub,
  });

  it('should update preferences', () => {
    const { container, getByText } = renderWithProvider(
      <PrivacySettings />,
      store,
    );
    // All settings are initialized toggled to be same as default
    expect(setUsePhishDetectStub).toHaveBeenCalledTimes(0);
    expect(setUse4ByteResolutionStub).toHaveBeenCalledTimes(0);
    expect(setUseTokenDetectionStub).toHaveBeenCalledTimes(0);
    expect(setUseMultiAccountBalanceCheckerStub).toHaveBeenCalledTimes(0);
    expect(setUseCurrencyRateCheckStub).toHaveBeenCalledTimes(0);
    expect(setUseAddressBarEnsResolutionStub).toHaveBeenCalledTimes(0);
    expect(setIncomingTransactionsPreferencesStub).toHaveBeenCalledTimes(0);
    expect(setUseTransactionSimulationsStub).toHaveBeenCalledTimes(0);
    expect(setPreferenceStub).toHaveBeenCalledTimes(0);

    const toggles = container.querySelectorAll('input[type=checkbox]');
    const submitButton = getByText('Done');
    // toggle to false
    fireEvent.click(toggles[0]);
    fireEvent.click(toggles[1]);
    fireEvent.click(toggles[4]);
    fireEvent.click(toggles[5]);
    fireEvent.click(toggles[6]);
    fireEvent.click(toggles[7]);
    fireEvent.click(toggles[8]);
    fireEvent.click(toggles[9]);
    fireEvent.click(toggles[10]);
    ///: BEGIN:ONLY_INCLUDE_IF(transaction-simulation)
    fireEvent.click(toggles[11]);
    ///: END:ONLY_INCLUDE_IF

    expect(mockOpenBasicFunctionalityModal).toHaveBeenCalledTimes(1);
    fireEvent.click(toggles[12]);

    fireEvent.click(submitButton);

    expect(setDisableExternalServicesStub).toHaveBeenCalledTimes(1);
    expect(setIncomingTransactionsPreferencesStub).toHaveBeenCalledTimes(2);
    expect(setUsePhishDetectStub).toHaveBeenCalledTimes(1);
    expect(setUse4ByteResolutionStub).toHaveBeenCalledTimes(1);
    expect(setUseTokenDetectionStub).toHaveBeenCalledTimes(1);
    expect(setUseMultiAccountBalanceCheckerStub).toHaveBeenCalledTimes(1);
    expect(setUseCurrencyRateCheckStub).toHaveBeenCalledTimes(1);
    expect(setUseAddressBarEnsResolutionStub).toHaveBeenCalledTimes(1);
    expect(setUseTransactionSimulationsStub).toHaveBeenCalledTimes(1);
    expect(setPreferenceStub).toHaveBeenCalledTimes(1);

    expect(setIncomingTransactionsPreferencesStub).toHaveBeenCalledWith(
      CHAIN_IDS.MAINNET,
      false,
      expect.anything(),
    );
    expect(setDisableExternalServicesStub.mock.calls[0][0]).toStrictEqual(
      false,
    ); // the modal hasn't been interacted with yet, so this is still ends up being false.
    expect(setUsePhishDetectStub.mock.calls[0][0]).toStrictEqual(false);
    expect(setUse4ByteResolutionStub.mock.calls[0][0]).toStrictEqual(false);
    expect(setUseTokenDetectionStub.mock.calls[0][0]).toStrictEqual(true);
    expect(setUseMultiAccountBalanceCheckerStub.mock.calls[0][0]).toStrictEqual(
      false,
    );
    expect(setUseCurrencyRateCheckStub.mock.calls[0][0]).toStrictEqual(true);
    expect(setUseAddressBarEnsResolutionStub.mock.calls[0][0]).toStrictEqual(
      false,
    );
    expect(setUseTransactionSimulationsStub.mock.calls[0][0]).toStrictEqual(
      false,
    );
    expect(setPreferenceStub.mock.calls[0][0]).toStrictEqual(
      'petnamesEnabled',
      false,
    );
  });

  describe('IPFS', () => {
    it('should handle proper IPFS input', () => {
      const { queryByTestId, queryByText } = renderWithProvider(
        <PrivacySettings />,
        store,
      );

      const ipfsInput = queryByTestId('ipfs-input');
      const ipfsEvent = {
        target: {
          value: 'ipfs.io',
        },
      };

      fireEvent.change(ipfsInput, ipfsEvent);

      const validIpfsUrl = queryByText('IPFS gateway URL is valid');
      expect(validIpfsUrl).toBeInTheDocument();

      const submitButton = queryByText('Done');
      fireEvent.click(submitButton);

      expect(setIpfsGatewayStub).toHaveBeenCalled();
    });

    it('should error with gateway.ipfs.io IPFS input', () => {
      const { queryByTestId, queryByText } = renderWithProvider(
        <PrivacySettings />,
        store,
      );

      const ipfsInput = queryByTestId('ipfs-input');
      const ipfsEvent = {
        target: {
          value: 'gateway.ipfs.io',
        },
      };

      fireEvent.change(ipfsInput, ipfsEvent);

      const invalidErrorMsg = queryByText('Please enter a valid URL');

      expect(invalidErrorMsg).toBeInTheDocument();
    });

    it('should error with improper IPFS input', () => {
      const { queryByTestId, queryByText } = renderWithProvider(
        <PrivacySettings />,
        store,
      );

      const ipfsInput = queryByTestId('ipfs-input');
      const ipfsEvent = {
        target: {
          value: ' ',
        },
      };

      fireEvent.change(ipfsInput, ipfsEvent);

      const invalidErrorMsg = queryByText('Please enter a valid URL');

      expect(invalidErrorMsg).toBeInTheDocument();
    });
  });
});
