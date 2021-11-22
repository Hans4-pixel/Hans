import React from 'react';
import { screen, fireEvent } from '@testing-library/react';

import { GAS_ESTIMATE_TYPES } from '../../../../shared/constants/gas';
import {
  TRANSACTION_ENVELOPE_TYPES,
  TRANSACTION_STATUSES,
} from '../../../../shared/constants/transaction';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import mockEstimates from '../../../../test/data/mock-estimates.json';
import mockState from '../../../../test/data/mock-state.json';
import { GasFeeContextProvider } from '../../../contexts/gasFee';
import configureStore from '../../../store/store';

import TransactionAlerts from './transaction-alerts';

jest.mock('../../../store/actions', () => ({
  disconnectGasFeeEstimatePoller: jest.fn(),
  getGasFeeEstimatesAndStartPolling: jest
    .fn()
    .mockImplementation(() => Promise.resolve()),
  addPollingTokenToAppState: jest.fn(),
}));

const render = (transactionProps, state, componentProps) => {
  const store = configureStore({
    metamask: {
      ...mockState.metamask,
      accounts: {
        [mockState.metamask.selectedAddress]: {
          address: mockState.metamask.selectedAddress,
          balance: '0x1F4',
        },
      },
      gasFeeEstimates: mockEstimates[GAS_ESTIMATE_TYPES.FEE_MARKET],
      ...state,
    },
  });

  return renderWithProvider(
    <GasFeeContextProvider
      transaction={{
        txParams: {
          type: TRANSACTION_ENVELOPE_TYPES.FEE_MARKET,
        },
        ...transactionProps,
      }}
    >
      <TransactionAlerts {...componentProps} />
    </GasFeeContextProvider>,
    store,
  );
};

describe('TransactionAlerts', () => {
  beforeEach(() => {
    process.env.EIP_1559_V2 = true;
  });

  afterEach(() => {
    process.env.EIP_1559_V2 = false;
  });

  it('should returning warning message for low gas estimate', () => {
    render({ userFeeLevel: 'low' });
    expect(
      document.getElementsByClassName('actionable-message--warning'),
    ).toHaveLength(1);
  });

  it('should return null for gas estimate other than low', () => {
    render({ userFeeLevel: 'high' });
    expect(
      document.getElementsByClassName('actionable-message--warning'),
    ).toHaveLength(0);
  });

  it('should not show insufficient balance message if transaction value is less than balance', () => {
    render({
      userFeeLevel: 'high',
      txParams: { value: '0x64' },
    });
    expect(screen.queryByText('Insufficient funds.')).not.toBeInTheDocument();
  });

  it('should show insufficient balance message if transaction value is more than balance', () => {
    render({
      userFeeLevel: 'high',
      txParams: { value: '0x5208' },
    });
    expect(screen.queryByText('Insufficient funds.')).toBeInTheDocument();
  });

  it('should show pending transaction message if there are >= 1 pending transactions', () => {
    render(undefined, {
      currentNetworkTxList: [
        {
          id: 0,
          time: 0,
          txParams: {
            from: mockState.metamask.selectedAddress,
            to: '0xRecipient',
          },
          status: TRANSACTION_STATUSES.SUBMITTED,
        },
      ],
    });
    expect(
      screen.queryByText('You have (1) pending transaction(s).'),
    ).toBeInTheDocument();
  });

  describe('SimulationError Message', () => {
    it('should show simulation error message along with option to proceed anyway if transaction.simulationFails is true', () => {
      render({ simulationFails: true });
      expect(
        screen.queryByText(
          'We were not able to estimate gas. There might be an error in the contract and this transaction may fail.',
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('I want to proceed anyway'),
      ).toBeInTheDocument();
    });

    it('should not show options to proceed anyways if compoennt prop userAcknowledgedGasMissing is already true', () => {
      render({ simulationFails: true }, undefined, {
        userAcknowledgedGasMissing: true,
      });
      expect(
        screen.queryByText(
          'We were not able to estimate gas. There might be an error in the contract and this transaction may fail.',
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('I want to proceed anyway'),
      ).not.toBeInTheDocument();
    });

    it('should call prop setUserAcknowledgedGasMissing if proceed anyways option is clicked', () => {
      const setUserAcknowledgedGasMissing = jest.fn();
      render({ simulationFails: true }, undefined, {
        setUserAcknowledgedGasMissing,
      });
      fireEvent.click(screen.queryByText('I want to proceed anyway'));
      expect(setUserAcknowledgedGasMissing).toHaveBeenCalledTimes(1);
    });

    it('should return null for legacy transactions', () => {
      const { container } = render({
        txParams: {
          type: TRANSACTION_ENVELOPE_TYPES.LEGACY,
        },
      });
      expect(container.firstChild).toBeNull();
    });
  });
});
