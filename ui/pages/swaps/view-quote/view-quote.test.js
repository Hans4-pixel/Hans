import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  renderWithProvider,
  createSwapsMockStore,
  setBackgroundConnection,
} from '../../../../test/jest';
import ViewQuote from '.';

const middleware = [thunk];
const createProps = (customProps = {}) => {
  return {
    inputValue: '5',
    onInputChange: jest.fn(),
    ethBalance: '6 ETH',
    setMaxSlippage: jest.fn(),
    maxSlippage: 15,
    selectedAccountAddress: 'selectedAccountAddress',
    isFeatureFlagLoaded: false,
    ...customProps,
  };
};

setBackgroundConnection({
  resetPostFetchState: jest.fn(),
  safeRefetchQuotes: jest.fn(),
  setSwapsErrorKey: jest.fn(),
});

describe('ViewQuote', () => {
  it('renders the component with initial props', () => {
    const store = configureMockStore(middleware)(createSwapsMockStore());
    const props = createProps();
    const { getByText, getByTestId } = renderWithProvider(
      <ViewQuote {...props} />,
      store,
    );
    expect(getByText('New quotes in')).toBeInTheDocument();
    expect(getByTestId('main-quote-summary__source-row')).toMatchSnapshot();
    expect(
      getByTestId('main-quote-summary__exchange-rate-container'),
    ).toMatchSnapshot();
    expect(
      getByTestId('fee-card__savings-and-quotes-header'),
    ).toMatchSnapshot();
    expect(getByTestId('fee-card__row-header')).toMatchSnapshot();
    expect(getByText('Back')).toBeInTheDocument();
    expect(getByText('Swap')).toBeInTheDocument();
  });
});
