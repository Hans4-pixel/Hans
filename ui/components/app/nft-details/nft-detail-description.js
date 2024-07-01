import React, { useState } from 'react';
import PropTypes from 'prop-types';

import useIsOverflowing from '../../../hooks/snaps/useIsOverflowing';
import { Box, Button, ButtonVariant, Text } from '../../component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  FontWeight,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';

const NftDetailDescription = ({ value }) => {
  const t = useI18nContext();
  const { contentRef, isOverflowing } = useIsOverflowing();
  const [isOpen, setIsOpen] = useState(false);

  const shouldDisplayButton = !isOpen && isOverflowing;

  const handleClick = (e) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <Box
      className="nft-details__show-more"
      style={{
        position: 'relative',
        overflow: 'hidden',
        maxHeight: isOpen ? 'none' : undefined,
      }}
      ref={contentRef}
    >
      <Text
        variant={TextVariant.bodySm}
        fontWeight={FontWeight.Medium}
        color={TextColor.textAlternative}
        data-testid="nft-details__description"
      >
        {value}
      </Text>
      {shouldDisplayButton && (
        <Box className="buttonDescriptionContainer">
          <Button
            className="nft-details__show-more__button"
            padding={0}
            paddingLeft={9}
            variant={ButtonVariant.Link}
            onClick={handleClick}
          >
            <Text color={TextColor.infoDefault}>{t('showMore')}</Text>
          </Button>
        </Box>
      )}
    </Box>
  );
};

NftDetailDescription.propTypes = {
  value: PropTypes.string,
};
export default NftDetailDescription;
