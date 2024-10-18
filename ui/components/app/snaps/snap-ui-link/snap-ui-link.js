import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  AlignItems,
  BlockSize,
  Display,
  FlexDirection,
} from '../../../../helpers/constants/design-system';
import {
  ButtonLink,
  ButtonLinkSize,
  Icon,
  IconName,
  IconSize,
} from '../../../component-library';
import SnapLinkWarning from '../snap-link-warning';
import useSnapNavigation from '../../../../hooks/snaps/useSnapNavigation';

export const SnapUILink = ({ href, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isMetaMaskUrl = href.startsWith('metamask:');
  const { navigate } = useSnapNavigation();

  const handleLinkClick = () => {
    if (isMetaMaskUrl) {
      navigate(href);
    } else {
      setIsOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsOpen(false);
  };

  if (isMetaMaskUrl) {
    return (
      <ButtonLink
        as="a"
        size={ButtonLinkSize.Inherit}
        className="snap-ui-link"
        onClick={handleLinkClick}
      >
        {children}
      </ButtonLink>
    );
  }

  return (
    <>
      <SnapLinkWarning isOpen={isOpen} onClose={handleModalClose} url={href} />
      <ButtonLink
        as="a"
        onClick={handleLinkClick}
        externalLink
        size={ButtonLinkSize.Inherit}
        display={Display.InlineBlock}
        className="snap-ui-link"
        style={{
          // Prevents the link from taking up the full width of the parent.
          width: 'fit-content',
        }}
        textProps={{
          display: Display.InlineFlex,
          flexDirection: FlexDirection.Row,
          alignItems: AlignItems.center,
        }}
      >
        {children}
        <Icon name={IconName.Export} size={IconSize.Inherit} marginLeft={1} />
      </ButtonLink>
    </>
  );
};

SnapUILink.propTypes = {
  children: PropTypes.string,
  href: PropTypes.string,
};
