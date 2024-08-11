import { JSXElement, SnapsChildren } from '@metamask/snaps-sdk/jsx';

export type UIComponentParams<T extends JSXElement> = {
  map: Record<string, number>;
  element: T;
  form?: string;
  useFooter: boolean;
  onCancel: () => void;
};

export type UIComponent = {
  element: string;
  props?: Record<string, unknown>;
  children?: SnapsChildren<UIComponent | string>;
  key?: string;
};

export type UIComponentFactory<T extends JSXElement> = (
  params: UIComponentParams<T>,
) => UIComponent;
