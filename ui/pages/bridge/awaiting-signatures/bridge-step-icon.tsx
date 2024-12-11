import React from 'react';
import PropTypes from 'prop-types';

export default function BridgeStepIcon({ stepNumber = 1 }) {
  switch (stepNumber) {
    case 1:
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="7"
            cy="7"
            r="6.25"
            stroke="var(--color-primary-default)"
            strokeWidth="1.5"
          />
          <path
            d="M6.50983 5.192H5.27783L6.14183 4H7.71783V9.68H6.50983V5.192Z"
            fill="var(--color-primary-default)"
          />
        </svg>
      );
    case 2:
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="7"
            cy="7"
            r="6.25"
            stroke="var(--color-primary-default)"
            strokeWidth="1.5"
          />
          <path
            d="M8.92 9.776H5V9.368C5 9.048 5.056 8.77067 5.168 8.536C5.28 8.296 5.42133 8.08533 5.592 7.904C5.768 7.71733 5.96267 7.54933 6.176 7.4C6.39467 7.25067 6.608 7.10133 6.816 6.952C6.928 6.872 7.03467 6.78933 7.136 6.704C7.24267 6.61867 7.33333 6.53067 7.408 6.44C7.488 6.34933 7.552 6.256 7.6 6.16C7.648 6.064 7.672 5.96533 7.672 5.864C7.672 5.67733 7.616 5.52 7.504 5.392C7.39733 5.25867 7.22933 5.192 7 5.192C6.88267 5.192 6.776 5.21333 6.68 5.256C6.584 5.29333 6.50133 5.344 6.432 5.408C6.368 5.472 6.31733 5.54667 6.28 5.632C6.248 5.71733 6.232 5.808 6.232 5.904H5.024C5.024 5.62667 5.07467 5.37067 5.176 5.136C5.27733 4.90133 5.41867 4.70133 5.6 4.536C5.78133 4.36533 5.99467 4.23467 6.24 4.144C6.48533 4.048 6.752 4 7.04 4C7.28 4 7.50933 4.03733 7.728 4.112C7.952 4.18667 8.14933 4.29867 8.32 4.448C8.49067 4.59733 8.62667 4.784 8.728 5.008C8.82933 5.22667 8.88 5.48267 8.88 5.776C8.88 6.032 8.85067 6.25867 8.792 6.456C8.73333 6.648 8.65067 6.824 8.544 6.984C8.44267 7.13867 8.32 7.28 8.176 7.408C8.032 7.536 7.87733 7.66133 7.712 7.784C7.64267 7.832 7.55733 7.888 7.456 7.952C7.36 8.016 7.26133 8.08267 7.16 8.152C7.064 8.22133 6.97333 8.29333 6.888 8.368C6.80267 8.44267 6.74133 8.51467 6.704 8.584H8.92V9.776Z"
            fill="var(--color-primary-default)"
          />
        </svg>
      );
    default:
      return <></>; // Don't return any SVG if a step number is not supported.
  }
}
BridgeStepIcon.propTypes = {
  stepNumber: PropTypes.number,
};

