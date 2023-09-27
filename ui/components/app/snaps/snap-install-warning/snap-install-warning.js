import React, { useCallback, useReducer } from 'react';
import PropTypes from 'prop-types';
import { produce } from 'immer';
import { useI18nContext } from '../../../../hooks/useI18nContext';

import {
  AlignItems,
  BackgroundColor,
  Display,
  FlexDirection,
  FontWeight,
  IconColor,
  JustifyContent,
  TextAlign,
  TextVariant,
} from '../../../../helpers/constants/design-system';

import {
  AvatarIcon,
  AvatarIconSize,
  Box,
  BUTTON_SIZES,
  Button,
  Checkbox,
  IconName,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  IconName,
  Text,
} from '../../../component-library';

/**
 * a very simple reducer using produce from Immer to keep checkboxes state manipulation
 * immutable and painless.
 */
const checkboxStateReducer = produce((state, action) => {
  switch (action.type) {
    case 'check':
      state[action.checkboxId] = state[action.checkboxId]
        ? !state[action.checkboxId]
        : true;
      break;
    default:
      throw new Error(
        'You must provide a type when dispatching an action for checkboxState',
      );
  }
});
export default function SnapInstallWarning({
  onCancel,
  onSubmit,
  warnings,
  snapName,
  isOpen,
}) {
  const t = useI18nContext();
  const [checkboxState, dispatch] = useReducer(checkboxStateReducer, {});
  const isAllChecked = warnings.every((warning) => checkboxState[warning.id]);
  const onCheckboxClicked = useCallback((checkboxId) => {
    dispatch({ type: 'check', checkboxId });
  }, []);

  return (
    <Modal className="snap-install-warning" onClose={onCancel} isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent
        modalDialogProps={{
          display: Display.Flex,
          flexDirection: FlexDirection.Column,
          gap: 4,
        }}
      >
        <ModalHeader
          onClose={onCancel}
          childrenWrapperProps={{
            display: Display.Flex,
            flexDirection: FlexDirection.Column,
            alignItems: AlignItems.center,
            justifyContent: JustifyContent.Center,
            gap: 4,
          }}
        >
          <AvatarIcon
            iconName={IconName.Danger}
            color={IconColor.warningDefault}
            backgroundColor={BackgroundColor.warningMuted}
            size={AvatarIconSize.Xl}
          />
          <Text variant={TextVariant.headingMd} textAlign={TextAlign.Center}>
            {t('snapInstallWarningHeading')}
          </Text>
        </ModalHeader>
        <Text textAlign={TextAlign.Center} marginBottom={4}>
          {warnings.length > 1
            ? t('snapInstallWarningCheckPlural', [
                <Text
                  key="snapNameInWarningDescription"
                  fontWeight={FontWeight.Medium}
                  as="span"
                >
                  {snapName}
                </Text>,
              ])
            : t('snapInstallWarningCheck', [
                <Text
                  key="snapNameInWarningDescription"
                  fontWeight={FontWeight.Medium}
                  as="span"
                >
                  {snapName}
                </Text>,
              ])}
        </Text>
        <Box
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          gap={4}
          marginBottom={4}
        >
          {warnings.map((warning) => (
            <Box
              key={warning.id}
              display={Display.Flex}
              gap={2}
              alignItems={AlignItems.center}
            >
              <Checkbox
                isChecked={checkboxState[warning.id] ?? false}
                id={warning.id}
                onChange={() => onCheckboxClicked(warning.id)}
                label={warning.message}
              />
            </Box>
          ))}
        </Box>
        <Button
          size={BUTTON_SIZES.LG}
          disabled={!isAllChecked}
          onClick={onSubmit}
        >
          {t('confirm')}
        </Button>
      </ModalContent>
    </Modal>
  );
}

SnapInstallWarning.propTypes = {
  /**
   * Whether the modal is open or not
   */
  isOpen: PropTypes.bool,
  /**
   * onCancel handler
   */
  onCancel: PropTypes.func,
  /**
   * onSubmit handler
   */
  onSubmit: PropTypes.func,
  /**
   * warnings list
   */
  warnings: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.node,
      id: PropTypes.string,
    }),
  ),
  /**
   * Snap name
   */
  snapName: PropTypes.string.isRequired,
};
