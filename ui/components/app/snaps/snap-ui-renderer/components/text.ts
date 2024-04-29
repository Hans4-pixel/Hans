import { TextElement } from '@metamask/snaps-sdk/jsx';
import { getJsxChildren } from '@metamask/snaps-utils';
import { UIComponentFactory } from './types';
import { mapTextToTemplate } from '../utils';
import {
  TextVariant,
  OverflowWrap,
  TextColor,
  Display,
} from '../../../../../helpers/constants/design-system';

export const text: UIComponentFactory<TextElement> = ({ element, ...params  }) => ({
  element: 'Text',
  children: mapTextToTemplate(getJsxChildren(element), params),
  props: {
    variant: TextVariant.bodyMd,
    overflowWrap: OverflowWrap.Anywhere,
    color: TextColor.inherit,
    className: 'snap-ui-renderer__text',
  },
});
