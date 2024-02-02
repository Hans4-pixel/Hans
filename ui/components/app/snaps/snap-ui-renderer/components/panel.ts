import { Panel } from '@metamask/snaps-sdk';
import { mapToTemplate } from '../snap-ui-renderer';
import {
  Display,
  FlexDirection,
  TextColor,
} from '../../../../../helpers/constants/design-system';
import { UiComponent } from './types';

export const panel: UiComponent<Panel> = ({ element, ...params }) => ({
  element: 'Box',
  children: element.children.map((children) =>
    mapToTemplate({ ...params, element: children }),
  ),
  props: {
    display: Display.Flex,
    flexDirection: FlexDirection.Column,
    className: 'snap-ui-renderer__panel',
    color: TextColor.textDefault,
  },
});
