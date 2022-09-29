import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { I18nContext } from '../../../../contexts/i18n';
import Tooltip from '../../../ui/tooltip';
import {
  DISPLAY,
  ALIGN_ITEMS,
  COLORS,
} from '../../../../helpers/constants/design-system';
import Box from '../../../ui/box';
import { Icon, ICON_NAMES } from '../../../component-library/icon';

const SignatureRequestSIWEIcon = ({ domain }) => {
  const t = useContext(I18nContext);
  return (
    <div className="signature-request-siwe-icon">
      <Tooltip
        position="bottom"
        html={<p>{t('SIWEDomainWarningBody', [domain])}</p>}
        wrapperClassName="signature-request-siwe-header__tooltip"
        containerClassName="signature-request-siwe-header__tooltip__container"
      >
        <Box
          className="signature-request-siwe-icon__icon"
          padding={1}
          display={DISPLAY.FLEX}
          alignItems={ALIGN_ITEMS.CENTER}
          backgroundColor={COLORS.ERROR_DEFAULT}
        >
          <Icon
            name={ICON_NAMES.DANGER_FILLED}
            color={COLORS.ERROR_INVERSE}
            margin={1}
          />
        </Box>
      </Tooltip>
    </div>
  );
};

export default SignatureRequestSIWEIcon;

SignatureRequestSIWEIcon.propTypes = {
  /**
   * The domain of the site that is requesting the signature
   */
  domain: PropTypes.string,
};
