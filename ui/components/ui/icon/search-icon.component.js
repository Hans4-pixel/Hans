import React from 'react';
import PropTypes from 'prop-types';

export default function SearchIcon({ color }) {
  return (
    <svg height="17" width="17" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.019 6.906c0-2.656 2.231-4.887 4.887-4.887s4.782 2.125 4.782 4.887a4.761 4.761 0 01-4.782 4.782c-2.762 0-4.887-2.126-4.887-4.782zm14.556 8.181l-4.25-4.25C13.175 9.67 13.6 8.288 13.6 6.8 13.706 3.081 10.625 0 6.906 0 3.081 0 0 3.081 0 6.906s3.081 6.907 6.906 6.907c1.275 0 2.55-.426 3.507-1.063l4.25 4.25z"
        fill={color}
      />
    </svg>
  );
}

SearchIcon.propTypes = {
  /**
   * Color of the icon should be a valid design system color and is required
   */
  color: PropTypes.string.isRequired,
};
