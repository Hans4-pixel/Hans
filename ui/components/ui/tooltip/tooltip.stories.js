import React from 'react';
import Box from '../box/box';
import { Text } from '../../component-library';
import Tooltip from '.';
import { ICON_COLORS } from '../../../helpers/constants/design-system';
import { Icon, ICON_NAMES } from '../../component-library';

export default {
  title: 'Components/UI/Tooltip',

  argTypes: {
    containerClassName: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    html: {
      control: 'html',
    },
    interactive: {
      control: 'boolean',
    },
    onHidden: {
      action: 'onHidden',
    },
    position: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
    size: {
      control: 'select',
      options: ['small', 'regular', 'big'],
    },
    title: {
      control: 'text',
    },
    trigger: {
      control: 'any',
    },
    wrapperClassName: {
      control: 'text',
    },
    style: {
      control: 'object',
    },
    tabIndex: {
      control: 'number',
    },
    tag: {
      control: 'text',
    },
  },
  args: {
    position: 'top',
    title: 'Title of the tooltip',
    trigger: 'mouseenter',
  },
};

export const DefaultStory = (args) => (
  <Box display="flex">
    <Text>Hover over the info icon to see the tooltip</Text>
    <Tooltip {...args}>
      <Icon
        name={ICON_NAMES.INFO}
        className="deprecated-test-networks__content__icon"
        color={ICON_COLORS.ICON_ALTERNATIVE}
      />
    </Tooltip>
  </Box>
);

DefaultStory.storyName = 'Default';

export const HTML = (args) => (
  <Box display="flex">
    <Text>This tooltips content is html</Text>
    <Tooltip {...args}>
      <Icon
        name={ICON_NAMES.INFO}
        className="deprecated-test-networks__content__icon"
        color={ICON_COLORS.ICON_ALTERNATIVE}
      />
    </Tooltip>
  </Box>
);

HTML.args = {
  interactive: true,
  html: (
    <Box>
      And includes a <a href="#">link</a>
    </Box>
  ),
};
