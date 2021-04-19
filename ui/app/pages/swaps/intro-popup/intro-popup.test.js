import React from 'react';
import configureMockStore from 'redux-mock-store';

import {
  renderWithProvider,
  createSwapsMockStore,
} from '../../../../../test/jest';
import IntroPopup from '.';

describe('IntroPopup', () => {
  const createProps = (customProps = {}) => {
    return {
      onClose: jest.fn(),
      ...customProps,
    };
  };

  const store = configureMockStore()(createSwapsMockStore());

  it('renders the component with initial props', () => {
    const props = createProps();
    const { container } = renderWithProvider(<IntroPopup {...props} />, store);
    expect(container).toMatchSnapshot();
  });
});
