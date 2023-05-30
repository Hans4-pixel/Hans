import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  MetaMetricsEventAccountImportType,
  MetaMetricsEventAccountType,
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { ButtonLink, Label, Text } from '../../../components/component-library';
import Box from '../../../components/ui/box';
import Dropdown from '../../../components/ui/dropdown';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  BLOCK_SIZES,
  FONT_WEIGHT,
  JustifyContent,
  Size,
  TextVariant,
} from '../../../helpers/constants/design-system';
import ZENDESK_URLS from '../../../helpers/constants/zendesk-url';
import { useI18nContext } from '../../../hooks/useI18nContext';
import * as actions from '../../../store/actions';

// Subviews
import JsonImportView from './json';
import PrivateKeyImportView from './private-key';

export default function NewAccountImportForm({ onActionComplete }) {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const trackEvent = useContext(MetaMetricsContext);

  const menuItems = [t('privateKey'), t('jsonFile')];

  const [type, setType] = useState(menuItems[0]);

  function importAccount(strategy, importArgs) {
    const loadingMessage = getLoadingMessage(strategy);

    dispatch(actions.importNewAccount(strategy, importArgs, loadingMessage))
      .then(({ selectedAddress }) => {
        if (selectedAddress) {
          trackImportEvent(strategy, true);
          dispatch(actions.hideWarning());
          onActionComplete();
        } else {
          dispatch(actions.displayWarning(t('importAccountError')));
        }
      })
      .catch((error) => {
        trackImportEvent(strategy, error.message);
        translateWarning(error.message);
      });
  }

  function trackImportEvent(strategy, wasSuccessful) {
    const accountImportType =
      strategy === 'Private Key'
        ? MetaMetricsEventAccountImportType.PrivateKey
        : MetaMetricsEventAccountImportType.Json;

    const event = wasSuccessful
      ? MetaMetricsEventName.AccountAdded
      : MetaMetricsEventName.AccountAddFailed;

    trackEvent({
      category: MetaMetricsEventCategory.Accounts,
      event,
      properties: {
        account_type: MetaMetricsEventAccountType.Imported,
        account_import_type: accountImportType,
      },
    });
  }

  function getLoadingMessage(strategy) {
    if (strategy === 'JSON File') {
      return (
        <Text width={BLOCK_SIZES.THREE_FOURTHS} fontWeight={FONT_WEIGHT.BOLD}>
          <br />
          {t('importAccountJsonLoading1')}
          <br />
          <br />
          {t('importAccountJsonLoading2')}
        </Text>
      );
    }

    return '';
  }

  /**
   * @param {string} message - an Error/Warning message caught in importAccount()
   * This function receives a message that is a string like:
   * `t('importAccountErrorNotHexadecimal')`
   * `t('importAccountErrorIsSRP')`
   * `t('importAccountErrorNotAValidPrivateKey')`
   * and feeds it through useI18nContext
   */
  function translateWarning(message) {
    if (message && !message.startsWith('t(')) {
      // This is just a normal error message
      dispatch(actions.displayWarning(message));
    } else {
      // This is an error message in a form like
      // `t('importAccountErrorNotHexadecimal')`
      // so slice off the first 3 chars and last 2 chars, and feed to i18n
      dispatch(actions.displayWarning(t(message.slice(3, -2))));
    }
  }

  function PrivateKeyOrJson() {
    switch (type) {
      case menuItems[0]:
        return (
          <PrivateKeyImportView
            importAccountFunc={importAccount}
            onActionComplete={onActionComplete}
          />
        );
      case menuItems[1]:
      default:
        return (
          <JsonImportView
            importAccountFunc={importAccount}
            onActionComplete={onActionComplete}
          />
        );
    }
  }

  return (
    <>
      <Text variant={TextVariant.bodySm} marginTop={2}>
        {t('importAccountMsg')}{' '}
        <ButtonLink
          size={Size.inherit}
          href={ZENDESK_URLS.IMPORTED_ACCOUNTS}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('here')}
        </ButtonLink>
      </Text>
      <Box paddingTop={4} paddingBottom={8}>
        <Label
          width={BLOCK_SIZES.FULL}
          marginBottom={4}
          justifyContent={JustifyContent.spaceBetween}
        >
          {t('selectType')}
          <Dropdown
            options={menuItems.map((text) => ({ value: text }))}
            selectedOption={type}
            onChange={(value) => {
              dispatch(actions.hideWarning());
              setType(value);
            }}
          />
        </Label>
        <PrivateKeyOrJson />
      </Box>
    </>
  );
}

NewAccountImportForm.propTypes = {
  onActionComplete: PropTypes.func.isRequired,
};
