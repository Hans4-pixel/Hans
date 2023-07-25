import React from 'react';
import PropTypes from 'prop-types';
import {
  AlignItems,
  BackgroundColor,
  BorderRadius,
  Color,
  Display,
  FlexDirection,
  TextVariant,
} from '../../../../helpers/constants/design-system';
import {
  BUTTON_VARIANT,
  Button,
  Icon,
  IconName,
  IconSize,
  Text,
  Box,
} from '../../../component-library';
import Preloader from '../../../ui/icon/preloader/preloader-icon.component';

const SnapVersion = ({ version, url }) => {
  return (
    <Button
      variant={BUTTON_VARIANT.LINK}
      href={url}
      target="_blank"
      className="snap-version"
    >
      <Box
        className="snap-version__wrapper"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        alignItems={AlignItems.center}
        backgroundColor={BackgroundColor.backgroundAlternative}
        borderRadius={BorderRadius.pill}
        paddingTop={1}
        paddingBottom={1}
        paddingLeft={2}
        paddingRight={2}
      >
        {version ? (
          <Text color={Color.textAlternative} variant={TextVariant.bodyMd}>
            {version}
          </Text>
        ) : (
          <Preloader size={18} />
        )}
        <Icon
          name={IconName.Export}
          color={Color.textAlternative}
          size={IconSize.Sm}
          marginLeft={1}
        />
      </Box>
    </Button>
  );
};

SnapVersion.propTypes = {
  /**
   * The version of the snap
   */
  version: PropTypes.string,
  /**
   * The url to the snap package
   */
  url: PropTypes.string,
};

export default SnapVersion;
