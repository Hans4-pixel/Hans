import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  resetBlockList,
  deleteBlock,
  setNumericBase,
} from '../../../store/actions';
import Button from '../../ui/button';
import { Block } from '../block';

const BlockList = ({ isHexValuesEnabled, setIsHexValuesEnabled }) => {
  const dispatch = useDispatch();
  const blocks = useSelector((state) => state.metamask.blocks);
  const numericBase = useSelector((state) => state.metamask.numericBase);
  console.log('blocklist', { isHexValuesEnabled, setIsHexValuesEnabled });
  // const [isHex, setIsHex] = useState(isHexValuesEnabled || true);
  const onClick = () => {
    setNumericBase(numericBase === 'hex' ? 'dec' : 'hex');
    // console.log('blocklist onclick', { setIsHexValuesEnabled });
    // setIsHexValuesEnabled(!isHex);
    // setIsHex(!isHex);
  };

  return (
    <div className="block-list">
      <div className="block-list__buttons">
        <Button
          type="secondary"
          rounded
          onClick={() => dispatch(resetBlockList())}
        >
          Reset Block List
        </Button>
        <Button type="secondary" rounded onClick={onClick}>
          {numericBase
            ? 'Display numbers as decimals'
            : 'Display numbers as hexidecimals'}
        </Button>
      </div>
      {blocks
        ? blocks.map((block, index) => {
            const onDelete = () => dispatch(deleteBlock(index));
            const props = { ...block, numericBase, onDelete };
            return <Block key={block?.number} {...props} />;
          })
        : null}
    </div>
  );
};

BlockList.propTypes = {
  isHexValuesEnabled: PropTypes.boolean,
  setIsHexValuesEnabled: PropTypes.func,
};

export default BlockList;
