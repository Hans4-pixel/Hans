import React from 'react';
import PropTypes from 'prop-types';

const LogoSelf = ({
  width = '100%',
  color = 'var(--color-text-default)',
  className,
  ariaLabel,
}) => {
  return (
    <svg
      width={width}
      fill={color}
      className={className}
      aria-label={ariaLabel}
      viewBox="0 0 2568 723"
    >
      <path
        d="M 1156.443 1.874 C 1131.104 6.490, 1111.255 16.155, 1094.682 31.946 C 1075.256 50.456, 1065 75.514, 1065 104.466 C 1065 124.936, 1068.343 140.240, 1079.048 168.769 C 1082.872 178.959, 1086 187.411, 1086 187.551 C 1086 187.691, 1078.013 187.973, 1068.250 188.177 C 1052.379 188.510, 1049.971 188.790, 1045.500 190.826 C 1039.181 193.703, 1034.551 198.122, 1031.173 204.500 C 1028.719 209.133, 1028.524 210.418, 1028.512 222 C 1028.502 232.650, 1028.814 235.179, 1030.623 239.089 C 1033.332 244.946, 1039.054 250.668, 1044.911 253.377 C 1049.477 255.489, 1049.993 255.501, 1147.928 255.769 C 1256.779 256.067, 1252.525 256.295, 1261.173 249.698 C 1263.844 247.662, 1266.615 244.193, 1268.470 240.567 C 1271.095 235.434, 1271.506 233.462, 1271.841 224.418 C 1272.134 216.519, 1271.810 212.804, 1270.453 208.490 C 1268.161 201.203, 1261.800 194.059, 1254.779 190.886 L 1249.500 188.500 1202.955 188.213 L 1156.410 187.926 1149.199 168.490 C 1145.233 157.799, 1141.268 146.454, 1140.388 143.277 C 1138.203 135.385, 1137.408 116.256, 1138.970 109.123 C 1143.197 89.813, 1157.713 75.805, 1179.700 69.821 C 1186.024 68.099, 1190.432 67.688, 1203 67.646 C 1211.525 67.617, 1221.875 68.168, 1226 68.870 C 1236.416 70.642, 1254.145 75.372, 1262.500 78.609 C 1276.168 83.902, 1289.030 82.019, 1297.290 73.513 C 1303.374 67.249, 1305.379 61.897, 1305.836 50.707 C 1306.694 29.687, 1300.928 22.419, 1276.819 14.137 C 1247.116 3.933, 1228.954 0.946, 1193.500 0.433 C 1170.481 0.100, 1165.017 0.313, 1156.443 1.874 M 796.500 8.368 C 790.465 10.303, 787.911 11.837, 783.240 16.334 C 770.201 28.888, 771.222 59.475, 785.077 71.334 C 792.434 77.632, 795.755 78.314, 821.243 78.763 L 843.986 79.164 844.243 351.332 L 844.500 623.500 846.801 628.500 C 851.426 638.548, 859.618 644.190, 872.490 646.191 C 891.918 649.211, 908.591 641.292, 913.716 626.609 C 915.412 621.751, 915.500 606.975, 915.500 326 L 915.500 30.500 912.917 24.994 C 909.640 18.009, 904.991 13.360, 898.006 10.083 L 892.500 7.500 846.500 7.293 C 811.352 7.135, 799.556 7.389, 796.500 8.368 M 132 181.026 C 62.205 190.654, 16.953 238.977, 17.008 303.822 C 17.032 331.603, 24.297 357.112, 37.379 375.352 C 49.429 392.151, 76.818 412.769, 93.425 417.541 C 108.044 421.742, 125.737 414.087, 133.230 400.318 C 138.136 391.305, 138.615 378.958, 134.378 370.764 C 131.172 364.564, 128.531 361.898, 119.533 355.773 C 97.939 341.075, 90.764 328.929, 90.722 307 C 90.680 285.121, 101.180 267.881, 120.204 258.593 C 130.823 253.408, 137.760 251.861, 153 251.279 C 174.136 250.473, 193.387 253.864, 215 262.199 C 243.358 273.135, 244.659 273.494, 256 273.497 C 268.124 273.500, 271.575 272.183, 278.699 264.833 C 285.283 258.039, 288.438 250.179, 288.472 240.479 C 288.497 233.419, 288.111 231.667, 285.250 225.856 C 283.407 222.113, 280.081 217.486, 277.569 215.170 C 269.551 207.780, 241.314 194.924, 219 188.505 C 198.814 182.698, 185.206 180.826, 160.500 180.457 C 148.400 180.277, 135.575 180.532, 132 181.026 M 527.684 181.484 C 454.941 191.840, 399.833 241.270, 385.072 309.404 C 381.489 325.939, 380.866 341.202, 381.192 404.500 C 381.475 459.700, 381.643 464.805, 383.292 468.317 C 386.179 474.470, 392.441 480.469, 399.253 483.608 C 405.032 486.272, 406.399 486.488, 417.500 486.494 C 427.982 486.499, 430.161 486.201, 434.727 484.137 C 437.602 482.837, 441.799 479.772, 444.053 477.326 C 451.924 468.788, 451.436 473.788, 452.041 395.500 C 452.569 327.206, 452.636 325.307, 454.791 317.592 C 465.909 277.780, 495.878 251.794, 537.996 245.445 C 550.017 243.632, 558.983 243.632, 571.004 245.445 C 613.339 251.826, 645.272 278.881, 656.088 317.530 C 658.085 324.666, 658.363 328.403, 658.752 353.250 L 659.187 381 587.459 381 C 534.939 381, 514.670 381.318, 511.764 382.189 C 509.582 382.843, 505.653 385.304, 503.034 387.659 C 487.770 401.383, 490.662 428.819, 508.372 438.292 L 512.500 440.500 609 440.500 L 705.500 440.500 710.714 438.142 C 717.629 435.015, 724.138 427.920, 726.925 420.471 C 729.119 414.607, 729.139 414.054, 728.733 370.021 C 728.351 328.576, 728.169 324.809, 726.104 315.500 C 712.069 252.242, 665.902 203.307, 604.354 186.448 C 587.660 181.876, 579.443 180.811, 558 180.440 C 544.008 180.198, 534.384 180.530, 527.684 181.484 M 1113.045 295.029 C 1101.834 297.386, 1092.053 305.211, 1088.327 314.805 C 1086.594 319.269, 1086.477 328.587, 1085.959 504 C 1085.443 678.519, 1085.314 688.879, 1083.584 695.500 C 1078.198 716.115, 1069.316 726.641, 1053.967 730.597 C 1046.575 732.502, 1030.089 732.073, 1012.500 729.517 C 992.691 726.638, 985.863 728.081, 976.822 737.058 C 969.484 744.344, 967.580 750.162, 968.202 763.394 C 968.692 773.815, 970.503 778.265, 976.665 784.183 C 984.250 791.466, 993.425 794.683, 1016.142 798.026 C 1032.773 800.472, 1061.585 800.726, 1074.119 798.535 C 1120.634 790.407, 1150.403 752.670, 1156.973 693.500 C 1157.758 686.435, 1157.998 629.796, 1157.792 500.500 L 1157.500 317.500 1155.012 312.629 C 1151.743 306.228, 1144.257 299.614, 1137.359 297.033 C 1130.929 294.627, 1119.456 293.682, 1113.045 295.029 M 189 395.935 C 180.201 398.621, 171.361 406.508, 166.376 416.117 C 163.940 420.814, 163.579 422.647, 163.544 430.500 C 163.509 438.356, 163.840 440.136, 166.153 444.500 C 169.504 450.825, 171.715 452.842, 181 458.049 C 203.042 470.408, 215.221 483.255, 220.258 499.458 C 223.076 508.524, 223.244 525.292, 220.614 534.913 C 214.732 556.429, 200.088 570.949, 177 578.158 C 170.202 580.281, 167.676 580.498, 150 580.483 C 121.084 580.457, 117.265 579.561, 60 559.364 C 44.141 553.770, 43.111 553.543, 33.500 553.527 C 24.757 553.513, 22.789 553.843, 17.845 556.157 C 5.641 561.867, -0 571.566, -0 586.841 C -0 594.253, 0.397 596.405, 2.572 600.770 C 6.289 608.227, 14.359 615.110, 25.797 620.576 C 119.380 665.297, 207.161 661.870, 257.533 611.528 C 285.586 583.492, 298.939 543.945, 295.178 500.036 C 291.467 456.702, 275.672 433.350, 234.500 410.327 C 216.027 399.997, 212.369 398.167, 207.068 396.603 C 201.399 394.930, 193.277 394.630, 189 395.935 M 437.746 532.351 C 422.199 536.741, 411.070 552.932, 412.357 569.290 C 413.337 581.764, 420.078 592.241, 438.360 609.705 C 460.511 630.864, 485.747 643.337, 519.146 649.631 C 530.444 651.761, 565.593 652.599, 579.113 651.062 C 608.269 647.747, 635.539 639.426, 662.990 625.467 C 683.016 615.284, 688.343 610.679, 692.770 599.718 C 694.867 594.525, 695.168 592.433, 694.806 585.562 C 693.765 565.822, 680.745 553.009, 661.712 552.995 C 654.619 552.989, 654.161 553.153, 634 562.916 C 612.055 573.542, 601.582 577.439, 584.975 581.156 C 575.902 583.186, 571.957 583.490, 555.500 583.427 C 533.764 583.344, 526.814 581.998, 512.294 575.057 C 497.598 568.032, 489.055 561.144, 472.809 543.222 C 465.778 535.466, 459.017 532.081, 449.290 531.449 C 445.261 531.187, 440.567 531.554, 437.746 532.351"
        stroke="none"
        fill="#fffcfc"
        fill-rule="evenodd"
      />
      <path d="" stroke="none" fill="#fcfcfc" fill-rule="evenodd" />
    </svg>
  );
};

LogoSelf.propTypes = {
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

export default LogoSelf;
