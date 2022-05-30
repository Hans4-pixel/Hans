import React from 'react';
import PropTypes from 'prop-types';

const LogoCoinbasePay = ({
  width = '100%',
  className,
  ariaLabel,
  color = 'var(--color-text-default)',
}) => {
  return (
    <svg
      width={width}
      viewBox="0 0 125 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={`logo-coinbasepay ${className}`}
      aria-label={ariaLabel}
    >
      <path
        d="M28.4278 4.10732C28.2105 4.09956 27.9938 4.13626 27.7911 4.21515C27.5885 4.29405 27.404 4.41349 27.2491 4.56615C27.0942 4.71882 26.9721 4.9015 26.8903 5.103C26.8085 5.3045 26.7686 5.52059 26.7732 5.73803C26.7913 6.1643 26.9734 6.56711 27.2815 6.86233C27.5895 7.15755 27.9996 7.32237 28.4263 7.32237C28.853 7.32237 29.2631 7.15755 29.5712 6.86233C29.8792 6.56711 30.0613 6.1643 30.0794 5.73803C30.0844 5.52074 30.0449 5.30471 29.9634 5.10322C29.8819 4.90172 29.7601 4.71901 29.6055 4.5663C29.4508 4.41359 29.2666 4.2941 29.064 4.21517C28.8615 4.13625 28.645 4.09955 28.4278 4.10732ZM84.799 8.47177C81.4928 8.47177 79.0661 10.9611 79.0661 14.2433C79.0661 17.7015 81.6657 19.997 84.8407 19.997C87.5238 19.997 89.6285 18.408 90.1651 16.1543H87.482C87.0945 17.141 86.1494 17.7015 84.8854 17.7015C83.2309 17.7015 81.9877 16.67 81.7075 14.8664H90.2277V13.8737C90.2277 10.6957 87.9113 8.47177 84.799 8.47177ZM81.8565 13.0211C82.265 11.4768 83.4246 10.7255 84.7542 10.7255C86.215 10.7255 87.33 11.5603 87.5894 13.0211H81.8565ZM19.0102 8.47177C18.2476 8.45519 17.4894 8.59283 16.7812 8.87644C16.0731 9.16005 15.4295 9.58378 14.8891 10.1222C14.3487 10.6607 13.9227 11.3027 13.6365 12.0099C13.3503 12.717 13.2099 13.4747 13.2238 14.2374C13.2238 17.5435 15.6922 19.9911 18.9983 19.9911C19.7652 20.0134 20.5287 19.8797 21.2423 19.5982C21.956 19.3166 22.6051 18.8929 23.1501 18.3529C23.6951 17.8129 24.1247 17.1678 24.4129 16.4568C24.7011 15.7458 24.8418 14.9836 24.8265 14.2165C24.8265 10.9551 22.3581 8.47177 19.0102 8.47177ZM19.0311 17.6151C17.1858 17.6151 15.8323 16.1751 15.8323 14.2433C15.8323 12.3115 17.1649 10.8567 19.0102 10.8567C20.8556 10.8567 22.2299 12.3145 22.2299 14.2463C22.2299 16.1781 20.8765 17.6091 19.0311 17.6091V17.6151ZM37.7917 8.47177C36.1163 8.47177 35.0222 9.15744 34.3782 10.1233V8.68045H31.8234V19.7764H34.3902V13.7455C34.3902 12.0492 35.4723 10.8567 37.0732 10.8567C38.5638 10.8567 39.4761 11.9091 39.4761 13.4325V19.7764H42.0518V13.2417C42.0399 10.4394 40.6029 8.47177 37.7917 8.47177ZM6.75461 10.8567C7.38882 10.8516 8.0076 11.0523 8.51819 11.4285C9.02879 11.8047 9.4037 12.3363 9.58673 12.9435H12.3115C11.8196 10.2813 9.62847 8.47177 6.77548 8.47177C6.0138 8.45681 5.25693 8.59565 4.55016 8.87999C3.84338 9.16433 3.20123 9.58832 2.66212 10.1266C2.12302 10.6649 1.69803 11.3064 1.4126 12.0127C1.12716 12.719 0.987147 13.4757 1.00093 14.2374C1.00093 17.5435 3.46935 19.9911 6.77548 19.9911C9.56586 19.9911 11.7988 18.2023 12.2907 15.5193H9.58673C9.41182 16.1287 9.04244 16.6642 8.5349 17.0442C8.02735 17.4242 7.40949 17.6278 6.77548 17.624C4.90628 17.624 3.59754 16.1841 3.59754 14.2523C3.59754 12.3205 4.87646 10.8567 6.75461 10.8567ZM25.5361 10.9849H27.1459V19.7764H29.7216V8.68045H25.548L25.5361 10.9849ZM66.2322 12.4755C66.2322 10.0727 64.7714 8.46283 61.6799 8.46283C58.7613 8.46283 57.1306 9.95342 56.8087 12.2191H59.3635C59.4917 11.3248 60.1774 10.6093 61.6382 10.6093C62.9469 10.6093 63.5908 11.1876 63.5908 11.8971C63.5908 12.8183 62.3984 13.0538 60.9525 13.2059C58.976 13.4205 56.5284 14.1002 56.5284 16.6819C56.5284 18.6793 58.019 19.9612 60.3712 19.9612C62.2165 19.9612 63.3762 19.1891 63.9486 17.9639C64.0321 19.0579 64.8429 19.7675 65.9877 19.7675H67.4783V17.472H66.2113L66.2322 12.4755ZM63.6982 15.2659C63.6982 16.7565 62.4103 17.8416 60.8452 17.8416C59.8793 17.8416 59.0565 17.4332 59.0565 16.5746C59.0565 15.4805 60.3652 15.1794 61.5666 15.0512C62.768 14.923 63.3553 14.6875 63.6922 14.1927L63.6982 15.2659ZM74.4751 13.1612L72.5851 12.8839C71.6907 12.7557 71.0408 12.4546 71.0408 11.7451C71.0408 10.973 71.8755 10.5854 73.0144 10.5854C74.2605 10.5854 75.0535 11.122 75.2264 12.0045H77.7157C77.4354 9.77157 75.7183 8.46283 73.0799 8.46283C70.3522 8.46283 68.5485 9.85802 68.5485 11.8316C68.5485 13.7216 69.741 14.8127 72.126 15.1586L74.0131 15.4388C74.9372 15.567 75.453 15.9307 75.453 16.6313C75.453 17.5107 74.5586 17.8744 73.3065 17.8744C71.7801 17.8744 70.9216 17.2514 70.7934 16.3093H68.2624C68.4979 18.4766 70.1942 20 73.2827 20C76.0969 20 77.9631 18.7121 77.9631 16.5001C77.9512 14.5176 76.5977 13.4861 74.4751 13.1642V13.1612ZM50.0265 8.47177C49.36 8.4623 48.6998 8.60194 48.0943 8.88048C47.4887 9.15901 46.9531 9.5694 46.5266 10.0816V4H43.9508V19.7764H46.4848V18.3097C46.9093 18.8394 47.4488 19.2656 48.0624 19.5559C48.676 19.8462 49.3477 19.993 50.0265 19.9851C53.1179 19.9851 55.4552 17.5375 55.4552 14.2314C55.4552 10.9253 53.0732 8.47177 50.0265 8.47177ZM49.6389 17.6151C47.7936 17.6151 46.4401 16.1751 46.4401 14.2433C46.4401 12.3115 47.8055 10.8567 49.6598 10.8567C51.5141 10.8567 52.8377 12.2936 52.8377 14.2463C52.8377 16.199 51.4843 17.6091 49.6389 17.6091V17.6151Z"
        fill="#0052FF"
      />
      <path
        d="M97.314 8.67746H102.111C104.496 8.67746 105.846 10.016 105.846 11.9568C105.846 13.8975 104.508 15.2689 102.111 15.2689H98.9864V19.7794H97.314V8.67746ZM104.15 11.8792C104.15 10.7911 103.455 10.1114 102.063 10.1114H98.9864V13.8379H102.063C103.449 13.8379 104.15 13.1582 104.15 12.0492V11.8792Z"
        fill={color}
      />
      <path
        d="M113.025 17.1172H108.055L107.077 19.7675H105.342L109.602 8.66556H111.51L115.815 19.7675H114.026L113.025 17.1172ZM108.577 15.6833H112.497L110.541 10.4483H110.509L108.577 15.6833Z"
        fill={color}
      />
      <path
        d="M118.543 15.4269L114.602 8.67746H116.429L119.381 13.7872H119.41L122.362 8.67746H124.174L120.215 15.4269V19.7794H118.543V15.4269Z"
        fill={color}
      />
    </svg>
  );
};

LogoCoinbasePay.propTypes = {
  /**
   * The width of the logo. Defaults to 100%
   */
  width: PropTypes.string,
  /**
   * The color of the logo defaults to var(--color-text-default)
   */
  color: PropTypes.string,
  /**
   * Additional className to add to the root svg
   */
  className: PropTypes.string,
  /**
   * Aria label to add to the logo component
   */
  ariaLabel: PropTypes.string,
};

export default LogoCoinbasePay;
