import React from 'react';
import {
  BUTTON_SIZES,
  ALIGN_ITEMS,
  DISPLAY,
  FLEX_DIRECTION,
} from '../../../helpers/constants/design-system';
import Box from '../../ui/box/box';

import { ButtonBase } from './button-base';
import README from './README.mdx';

const marginSizeControlOptions = [
  undefined,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  'auto',
];

export default {
  title: 'Components/ComponentLibrary/ButtonBase',
  id: __filename,
  component: ButtonBase,
  parameters: {
    docs: {
      page: README,
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: Object.values(BUTTON_SIZES),
    },
    as: {
      control: 'select',
      options: ['button', 'a'],
    },
    block: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    children: {
      control: 'text',
    },
    className: {
      control: 'text',
    },
    display: {
      options: Object.values(DISPLAY),
      control: 'select',
      table: { category: 'box props' },
    },
    marginTop: {
      options: marginSizeControlOptions,
      control: 'select',
      table: { category: 'box props' },
    },
    marginRight: {
      options: marginSizeControlOptions,
      control: 'select',
      table: { category: 'box props' },
    },
    marginBottom: {
      options: marginSizeControlOptions,
      control: 'select',
      table: { category: 'box props' },
    },
    marginLeft: {
      options: marginSizeControlOptions,
      control: 'select',
      table: { category: 'box props' },
    },
  },
  args: {
    children: 'Base Button',
  },
};

export const DefaultStory = (args) => <ButtonBase {...args} />;

DefaultStory.storyName = 'Default';

export const Size = (args) => (
  <Box display={DISPLAY.FLEX} alignItems={ALIGN_ITEMS.BASELINE} gap={1}>
    <ButtonBase {...args} size={BUTTON_SIZES.ZERO_PADDING} />
    <ButtonBase {...args} size={BUTTON_SIZES.SM} />
    <ButtonBase {...args} size={BUTTON_SIZES.MD} />
    <ButtonBase {...args} size={BUTTON_SIZES.LG} />
  </Box>
);

export const Block = (args) => (
  <>
    <ButtonBase {...args} marginBottom={2}>
      Default Button
    </ButtonBase>
    <ButtonBase {...args} block marginBottom={2}>
      Block Button
    </ButtonBase>
    <ButtonBase {...args} display={DISPLAY.BLOCK}>
      Block Button
    </ButtonBase>
  </>
);

export const As = (args) => (
  <Box display={DISPLAY.FLEX} flexDirection={FLEX_DIRECTION.ROW} gap={2}>
    <ButtonBase {...args}>Button Element</ButtonBase>
    <ButtonBase as="a" href="#" {...args}>
      Anchor Element
    </ButtonBase>
  </Box>
);

export const Disabled = (args) => (
  <ButtonBase {...args}>Disabled Button</ButtonBase>
);

Disabled.args = {
  disabled: true,
};

export const Loading = (args) => (
  <ButtonBase {...args}>Loading Button</ButtonBase>
);

Loading.args = {
  loading: true,
};
