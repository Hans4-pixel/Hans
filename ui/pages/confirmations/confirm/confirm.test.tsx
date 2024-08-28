import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { act } from '@testing-library/react';
import { unapprovedPersonalSignMsg } from '../../../../test/data/confirmations/personal_sign';
import {
  orderSignatureMsg,
  permitSignatureMsg,
  permitSingleSignatureMsg,
  permitBatchSignatureMsg,
  unapprovedTypedSignMsgV4,
} from '../../../../test/data/confirmations/typed_sign';
import mockState from '../../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import * as actions from '../../../store/actions';

import Confirm from './confirm';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    replace: jest.fn(),
  }),
}));

const middleware = [thunk];

describe('Confirm', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render', () => {
    const mockStore = configureMockStore(middleware)(mockState);

    act(() => {
      const { container } = renderWithProvider(<Confirm />, mockStore);
      expect(container).toBeDefined();
    });
  });

  it('should match snapshot for signature - typed sign - permit', async () => {
    const mockStateTypedSign = {
      ...mockState,
      metamask: {
        ...mockState.metamask,
      },
      confirm: { currentConfirmation: permitSignatureMsg },
    };

    jest.spyOn(actions, 'getTokenStandardAndDetails').mockResolvedValue({
      decimals: '2',
      standard: 'erc20',
    });

    const mockStore = configureMockStore(middleware)(mockStateTypedSign);
    let container;

    await act(async () => {
      const { container: renderContainer } = renderWithProvider(
        <Confirm />,
        mockStore,
      );
      container = renderContainer;
    });

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for signature - personal sign type', async () => {
    const mockStatePersonalSign = {
      ...mockState,
      metamask: {
        ...mockState.metamask,
      },
      confirm: { currentConfirmation: unapprovedPersonalSignMsg },
    };
    const mockStore = configureMockStore(middleware)(mockStatePersonalSign);

    await act(async () => {
      const { container } = await renderWithProvider(<Confirm />, mockStore);
      expect(container).toMatchSnapshot();
    });
  });

  it('should match snapshot signature - typed sign - order', async () => {
    const mockStateTypedSign = {
      ...mockState,
      metamask: {
        ...mockState.metamask,
      },
      confirm: { currentConfirmation: orderSignatureMsg },
    };

    jest.spyOn(actions, 'getTokenStandardAndDetails').mockResolvedValue({
      decimals: '2',
      standard: 'erc20',
    });

    const mockStore = configureMockStore(middleware)(mockStateTypedSign);
    let container;

    await act(async () => {
      const { container: renderContainer } = renderWithProvider(
        <Confirm />,
        mockStore,
      );
      container = renderContainer;
    });

    expect(container).toMatchSnapshot();
  });

  it('should match snapshot for signature - typed sign - V4', async () => {
    const mockStateTypedSign = {
      ...mockState,
      metamask: {
        ...mockState.metamask,
      },
      confirm: { currentConfirmation: unapprovedTypedSignMsgV4 },
    };
    const mockStore = configureMockStore(middleware)(mockStateTypedSign);

    await act(async () => {
      const { container } = await renderWithProvider(<Confirm />, mockStore);
      expect(container).toMatchSnapshot();
    });
  });

  it('should match snapshot for signature - typed sign - V4 - PermitSingle', async () => {
    const mockStateTypedSign = {
      ...mockState,
      metamask: {
        ...mockState.metamask,
      },
      confirm: { currentConfirmation: permitSingleSignatureMsg },
    };
    const mockStore = configureMockStore(middleware)(mockStateTypedSign);

    jest.spyOn(actions, 'getTokenStandardAndDetails').mockResolvedValue({
      decimals: '2',
      standard: 'erc20',
    });

    await act(async () => {
      const { container, findByText } = await renderWithProvider(
        <Confirm />,
        mockStore,
      );

      expect(await findByText('1,461,501,637,3...')).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });

  it('should match snapshot for signature - typed sign - V4 - PermitBatch', async () => {
    const mockStateTypedSign = {
      ...mockState,
      metamask: {
        ...mockState.metamask,
      },
      confirm: { currentConfirmation: permitBatchSignatureMsg },
    };
    const mockStore = configureMockStore(middleware)(mockStateTypedSign);

    jest.spyOn(actions, 'getTokenStandardAndDetails').mockResolvedValue({
      decimals: '2',
      standard: 'erc20',
    });

    await act(async () => {
      const { container, findByText } = await renderWithProvider(
        <Confirm />,
        mockStore,
      );

      expect(await findByText('1,461,501,637,3...')).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });
});
