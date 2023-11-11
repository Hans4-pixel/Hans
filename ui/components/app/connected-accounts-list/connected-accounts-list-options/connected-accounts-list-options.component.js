import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { IconName, ButtonIcon,Popover } from '../../../component-library';
import { useI18nContext } from '../../../../hooks/useI18nContext';

const ConnectedAccountsListOptions = ({
  children,
  onShowOptions,
  onHideOptions,
  show,
}) => {
  const ref = useRef(false);
  const t = useI18nContext();

  return (
    <div ref={ref}>
      <ButtonIcon
        iconName={IconName.MoreVertical}
        className="connected-accounts-options__button"
        onClick={onShowOptions}
        ariaLabel={t('options')}
      />
      {show ? (
        <Popover
          anchorElement={ref.current}
          onHide={onHideOptions}
          popperOptions={{
            modifiers: [
              { name: 'preventOverflow', options: { altBoundary: true } },
            ],
          }}
        >
          {children}
        </Popover>
      ) : null}
    </div>
  );
};

ConnectedAccountsListOptions.propTypes = {
  children: PropTypes.node.isRequired,
  onHideOptions: PropTypes.func.isRequired,
  onShowOptions: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

export default ConnectedAccountsListOptions;
