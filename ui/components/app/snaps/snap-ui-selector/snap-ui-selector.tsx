import React, { useState } from 'react';
import {
  Box,
  ButtonBase,
  IconName,
  IconSize,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '../../../component-library';
import {
  AlignItems,
  BackgroundColor,
  BlockSize,
  BorderRadius,
  Display,
  FlexDirection,
  IconColor,
} from '../../../../helpers/constants/design-system';

export type SnapUISelectorProps = {
  options: string[];
  optionComponents: any[];
  disabled?: boolean;
};

type SelectorItemProps = {
  value: string;
  children: any;
  onSelect: (value: string) => void;
};

const SelectorItem: React.FunctionComponent<SelectorItemProps> = ({
  value,
  children,
  onSelect,
}) => {
  const handleClick = () => {
    onSelect(value);
  };

  return (
    <ButtonBase
      className="snap-ui-renderer__selector-item"
      backgroundColor={BackgroundColor.transparent}
      borderRadius={BorderRadius.LG}
      ellipsis
      textProps={{
        display: Display.Flex,
        width: BlockSize.Full,
      }}
      onClick={handleClick}
      // TODO: Decide on how to do this
      style={{ justifyContent: 'inherit', textAlign: 'inherit', height: 'inherit', minHeight: '32px', maxHeight: '48px' }}
    >
      {children}
    </ButtonBase>
  );
};

export const SnapUISelector: React.FunctionComponent<SnapUISelectorProps> = ({
  options,
  optionComponents,
  disabled,
}) => {
  const [selectedOptionValue, setSelectedOption] = useState(options[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => setIsModalOpen(true);

  const handleModalClose = () => setIsModalOpen(false);

  const handleSelect = (value: string) => {
    setSelectedOption(value);
    handleModalClose();
  };

  const selectedOptionIndex = options.findIndex(
    (option) => option === selectedOptionValue,
  );


  const selectedOption = optionComponents[selectedOptionIndex];

  return (
    <>
      <ButtonBase
        className="snap-ui-renderer__selector"
        backgroundColor={BackgroundColor.transparent}
        borderRadius={BorderRadius.LG}
        ellipsis
        textProps={{
          display: Display.Flex,
          width: BlockSize.Full,
        }}
        disabled={disabled}
        endIconName={IconName.ArrowDown}
        endIconProps={{
          color: IconColor.iconDefault,
          size: IconSize.Sm,
        }}
        gap={2}
        onClick={handleModalOpen}
        // TODO: Decide on how to do this
        style={{ justifyContent: 'inherit', textAlign: 'inherit', height: 'inherit', minHeight: '32px', maxHeight: '48px' }}
      >
        {selectedOption}
      </ButtonBase>
      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader onClose={handleModalClose}>Title</ModalHeader>
          <ModalBody>
            <Box display={Display.Flex} flexDirection={FlexDirection.Column} gap={2}>
              {optionComponents.map((component, index) => (
                <SelectorItem value={options[index]} onSelect={handleSelect}>
                  {component}
                </SelectorItem>
              ))}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
