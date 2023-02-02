import React from 'react';
import { useArgs } from '@storybook/client-api';

import {
  RESIZE,
  BorderStyle,
  BLOCK_SIZES,
  BorderRadius,
  BorderColor,
  Size,
} from '../../../helpers/constants/design-system';

import README from './README.mdx';
import Textarea from '.';

export default {
  title: 'Components/UI/Textarea',

  component: Textarea,
  parameters: {
    docs: {
      page: README,
    },
  },
  argTypes: {
    className: {
      control: 'text',
    },
    value: {
      control: 'text',
    },
    onChange: {
      action: 'onChange',
    },
    resize: {
      control: 'select',
      options: Object.values(RESIZE),
    },
    scrollable: {
      control: 'boolean',
    },
    height: {
      control: 'number',
    },
    boxProps: {
      control: 'object',
    },
  },
};

export const DefaultStory = (args) => {
  const [{ value }, updateArgs] = useArgs();

  const handleOnChange = (e) => {
    updateArgs({
      value: e.target.value,
    });
  };
  return (
    <>
      <label htmlFor="textarea">Label</label>
      <Textarea {...args} value={value} onChange={handleOnChange} id="textarea">
        {args.children}
      </Textarea>
    </>
  );
};

DefaultStory.storyName = 'Default';

DefaultStory.args = {
  value:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporld, Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporld, Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporld',
  resize: RESIZE.BOTH,
  scrollable: false,
  boxProps: {
    borderColor: BorderColor.borderMuted,
    borderRadius: Size.SM,
    borderStyle: BorderStyle.solid,
    padding: [2, 4],
  },
  height: 'auto',
};

export const Scrollable = (args) => {
  const [{ value }, updateArgs] = useArgs();

  const handleOnChange = (e) => {
    updateArgs({
      value: e.target.value,
    });
  };
  return (
    <div style={{ width: 280 }}>
      <Textarea
        {...args}
        value={value}
        onChange={handleOnChange}
        aria-label="textarea"
      >
        {args.children}
      </Textarea>
    </div>
  );
};

Scrollable.args = {
  value:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporld, Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporld, Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporld. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporld, Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporld, Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporld',
  resize: RESIZE.NONE,
  scrollable: true,
  height: 170,
  boxProps: {
    borderColor: BorderColor.transparent,
    borderRadius: BorderRadius.none,
    borderStyle: BorderStyle.none,
    padding: [2, 4],
    width: BLOCK_SIZES.FULL,
  },
};
