import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IconColor } from '../../../helpers/constants/design-system';
import { IconName } from '..';
import { ButtonIconSize } from './button-icon.types';
import { ButtonIcon } from './button-icon';
import README from './README.mdx';

export default {
  title: 'Components/ComponentLibrary/ButtonIcon',

  component: ButtonIcon,
  parameters: {
    docs: {
      page: README,
    },
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['button', 'a'],
    },
  },
} as ComponentMeta<typeof ButtonIcon>;

const Template: ComponentStory<typeof ButtonIcon> = (args) => (
  <ButtonIcon {...args} />
);

export const DefaultStory = Template.bind({});

DefaultStory.args = {
  iconName: IconName.Close,
  ariaLabel: 'Close',
};

DefaultStory.storyName = 'Default';

export const IconNameStory: ComponentStory<typeof ButtonIcon> = (args) => (
  <ButtonIcon {...args} />
);

IconNameStory.args = {
  iconName: IconName.Close,
  ariaLabel: 'Close',
};

IconNameStory.storyName = 'IconName';

export const SizeStory: ComponentStory<typeof ButtonIcon> = (args) => (
  <>
    <ButtonIcon
      {...args}
      size={ButtonIconSize.Sm}
      iconName={IconName.Close}
      ariaLabel="Close"
    />
    <ButtonIcon
      {...args}
      size={ButtonIconSize.Md}
      iconName={IconName.Close}
      ariaLabel="Close"
    />
    <ButtonIcon
      {...args}
      size={ButtonIconSize.Lg}
      color={IconColor.primaryDefault}
      iconName={IconName.Close}
      ariaLabel="Close"
    />
  </>
);

SizeStory.storyName = 'Size';

export const AriaLabel: ComponentStory<typeof ButtonIcon> = (args) => (
  <>
    <ButtonIcon
      {...args}
      as="button"
      iconName={IconName.Close}
      ariaLabel="Close"
    />
    <ButtonIcon
      {...args}
      as="a"
      href="https://metamask.io/"
      target="_blank"
      color={IconColor.primaryDefault}
      iconName={IconName.Export}
      ariaLabel="Visit MetaMask.io"
    />
  </>
);

export const As: ComponentStory<typeof ButtonIcon> = (args) => (
  <>
    <ButtonIcon {...args} iconName={IconName.Close} ariaLabel="close" />
    <ButtonIcon
      as="a"
      href="#"
      {...args}
      color={IconColor.primaryDefault}
      iconName={IconName.Export}
      ariaLabel="demo"
    />
  </>
);

export const Href: ComponentStory<typeof ButtonIcon> = (args) => (
  <ButtonIcon {...args} iconName={IconName.Export} target="_blank" />
);

Href.args = {
  ariaLabel: 'Visit Metamask.io',
  href: 'https://metamask.io/',
  color: IconColor.primaryDefault,
};

export const ColorStory: ComponentStory<typeof ButtonIcon> = (args) => (
  <ButtonIcon {...args} iconName={IconName.Close} ariaLabel="close" />
);
ColorStory.storyName = 'Color';

ColorStory.args = {
  color: IconColor.primaryDefault,
};

export const Disabled: ComponentStory<typeof ButtonIcon> = (args) => (
  <ButtonIcon {...args} iconName={IconName.Close} ariaLabel="close" />
);

Disabled.args = {
  disabled: true,
};
