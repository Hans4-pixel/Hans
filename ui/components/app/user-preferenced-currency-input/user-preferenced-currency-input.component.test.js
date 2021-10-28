import React from 'react';
import { shallow } from 'enzyme';
import CurrencyInput from '../../ui/currency-input';
import UserPreferencedCurrencyInput from './user-preferenced-currency-input.component';

describe('UserPreferencedCurrencyInput Component', () => {
  describe('rendering', () => {
    it('should render properly', () => {
      const passDataToSend = jest.fn();
      const wrapper = shallow(
        <UserPreferencedCurrencyInput passDataToSendAmount={passDataToSend} />,
      );

      expect(wrapper).toHaveLength(1);
      expect(wrapper.find(CurrencyInput)).toHaveLength(1);
    });

    it('should render useFiat for CurrencyInput based on preferences.useNativeCurrencyAsPrimaryCurrency', () => {
      const passDataToSend = jest.fn();
      const wrapper = shallow(
        <UserPreferencedCurrencyInput
          useNativeCurrencyAsPrimaryCurrency
          passDataToSendAmount={passDataToSend}
        />,
      );

      expect(wrapper).toHaveLength(1);
      expect(wrapper.find(CurrencyInput)).toHaveLength(1);
      expect(wrapper.find(CurrencyInput).props().useFiat).toStrictEqual(false);
      wrapper.setProps({ useNativeCurrencyAsPrimaryCurrency: false });
      expect(wrapper.find(CurrencyInput).props().useFiat).toStrictEqual(true);
    });
  });
});
