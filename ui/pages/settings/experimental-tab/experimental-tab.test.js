import React from 'react';
import { fireEvent, renderWithProvider } from '../../../../test/jest';
import configureStore from '../../../store/store';
import mockState from '../../../../test/data/mock-state.json';
import { LegacyMetaMetricsProvider } from '../../../contexts/metametrics';
import ExperimentalTab from './experimental-tab.component';

const render = (overrideMetaMaskState, props = {}) => {
  const store = configureStore({
    metamask: {
      ...mockState.metamask,
      ...overrideMetaMaskState,
    },
  });
  const comp = <ExperimentalTab {...props} />;
  return renderWithProvider(
    <LegacyMetaMetricsProvider>{comp}</LegacyMetaMetricsProvider>,
    store,
  );
};

describe('ExperimentalTab', () => {
  it('renders ExperimentalTab component without error', () => {
    expect(() => {
      render();
    }).not.toThrow();
  });

  describe('with desktop enabled', () => {
    it('renders ExperimentalTab component without error', () => {
      const { container } = render({ desktopEnabled: true });
      expect(container).toMatchSnapshot();
    });
  });

  it('should render multiple toggle options', () => {
    const { getAllByRole } = render({ desktopEnabled: true });
    const toggle = getAllByRole('checkbox');
    expect(toggle).toHaveLength(4);
  });

  it('should disable opensea when blockaid is enabled', () => {
    const setSecurityAlertsEnabled = jest.fn();
    const setTransactionSecurityCheckEnabled = jest.fn();
    const { getAllByRole } = render(
      { desktopEnabled: true },
      {
        securityAlertsEnabled: false,
        transactionSecurityCheckEnabled: true,
        setSecurityAlertsEnabled,
        setTransactionSecurityCheckEnabled,
      },
    );
    const toggle = getAllByRole('checkbox');
    fireEvent.click(toggle[0]);
    expect(setSecurityAlertsEnabled).toHaveBeenCalledWith(true);
    expect(setTransactionSecurityCheckEnabled).toHaveBeenCalledWith(false);
  });

  it('should disable blockaid when opensea is enabled', () => {
    const setSecurityAlertsEnabled = jest.fn();
    const setTransactionSecurityCheckEnabled = jest.fn();
    const { getAllByRole } = render(
      { desktopEnabled: true },
      {
        transactionSecurityCheckEnabled: false,
        securityAlertsEnabled: true,
        setSecurityAlertsEnabled,
        setTransactionSecurityCheckEnabled,
      },
    );
    const toggle = getAllByRole('checkbox');
    fireEvent.click(toggle[1]);
    expect(setTransactionSecurityCheckEnabled).toHaveBeenCalledWith(true);
    expect(setSecurityAlertsEnabled).toHaveBeenCalledWith(false);
  });
});
