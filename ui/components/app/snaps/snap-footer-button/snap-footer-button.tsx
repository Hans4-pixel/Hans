import React, { FunctionComponent, MouseEvent } from 'react';
import { ButtonVariant, UserInputEventType } from '@metamask/snaps-sdk';
import { Button, ButtonSize, IconSize } from '../../../component-library';
import {
  AlignItems,
  BorderColor,
  Display,
  FlexDirection,
  IconColor,
} from '../../../../helpers/constants/design-system';
import { useSnapInterfaceContext } from '../../../../contexts/snaps';
import { SnapIcon } from '../snap-icon';

type SnapFooterButtonProps = {
  name?: string;
  isSnapAction?: boolean;
  onCancel?: () => void;
};

export const SnapFooterButton: FunctionComponent<SnapFooterButtonProps> = ({
  onCancel,
  name,
  children,
  isSnapAction = false,
  ...props
}) => {
  const { handleEvent, snapId } = useSnapInterfaceContext();

  const handleSnapAction = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();

    handleEvent({
      event: UserInputEventType.ButtonClickEvent,
      name,
    });
  };

  const handleClick = isSnapAction ? handleSnapAction : onCancel;

  return (
    <Button
      className="snap-footer-button"
      {...props}
      size={ButtonSize.Lg}
      block
      variant={isSnapAction ? ButtonVariant.Primary : ButtonVariant.Secondary}
      onClick={handleClick}
      textProps={{
        display: Display.Flex,
        alignItems: AlignItems.center,
        flexDirection: FlexDirection.Row,
      }}
      borderColor={
        isSnapAction
          ? undefined
          : (IconColor.iconDefault as unknown as BorderColor)
      }
    >
      {isSnapAction && (
        <SnapIcon snapId={snapId} avatarSize={IconSize.Xs} marginRight={1} />
      )}
      {children}
    </Button>
  );
};
