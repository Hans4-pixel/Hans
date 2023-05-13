import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import EventEmitter from 'events';

import {
  fillInFoxColor,
  FOX_COLOR_PALETTE,
  generateColorPurelyOnAddress,
  generateColorsFromAI,
} from '../../../helpers/utils/generative-color';
import Mascot from '../../../components/ui/mascot';

import { PREDEFINED_COLOR_PALETTES } from '../../../helpers/constants/color-palette';
import useDidMountEffect from '../../../helpers/utils/useDidMountEffect';

export const COLOR_PALETTE_TYPE = {
  generative: 'generative',
  ai: 'ai',
  editorSelection: 'editorSelection',
  previousSelected: 'previousSelected',
  default: 'default',
};

const baseFoxJson = {
  "positions": [
    [111.024597, 52.604599, 46.225899],
    [114.025002, 87.673302, 58.9818],
    [66.192001, 80.898003, 55.394299],
    [72.113297, 35.491798, 30.871401],
    [97.804497, 116.560997, 73.978798],
    [16.7623, 58.010899, 58.078201],
    [52.608898, 30.3641, 42.556099],
    [106.881401, 31.945499, 46.9133],
    [113.484596, 38.6049, 49.121498],
    [108.6633, 43.2332, 46.315399],
    [101.216599, 15.9822, 46.308201],
    [16.6605, -16.2883, 93.618698],
    [40.775002, -10.2288, 85.276398],
    [23.926901, -2.5103, 86.736504],
    [11.1691, -7.0037, 99.377602],
    [9.5692, -34.393902, 141.671997],
    [12.596, 7.1655, 88.740997],
    [61.180901, 8.8142, 76.996803],
    [39.719501, -28.927099, 88.963799],
    [13.7962, -68.575699, 132.057007],
    [15.2674, -62.32, 129.688004],
    [14.8446, -52.6096, 140.113007],
    [12.8917, -49.771599, 144.740997],
    [35.604198, -71.758003, 81.063904],
    [47.462502, -68.606102, 63.369701],
    [38.2486, -64.730202, 38.909901],
    [-12.8917, -49.771599, 144.740997],
    [-13.7962, -68.575699, 132.057007],
    [17.802099, -71.758003, 81.063904],
    [19.1243, -69.0168, 49.420101],
    [38.2486, -66.275597, 17.776199],
    [12.8928, -36.703499, 141.671997],
    [109.283997, -93.589897, 27.824301],
    [122.117996, -36.8894, 35.025002],
    [67.7668, -30.197001, 78.417801],
    [33.180698, 101.851997, 25.3186],
    [9.4063, -35.589802, 150.722],
    [-9.5692, -34.393902, 141.671997],
    [-9.4063, -35.589802, 150.722],
    [11.4565, -37.899399, 150.722],
    [-12.596, 7.1655, 88.740997],
    [-11.1691, -7.0037, 99.377602],
    [70.236504, 62.836201, -3.9475],
    [47.263401, 54.293999, -27.414801],
    [28.7302, 91.731102, -24.972601],
    [69.167603, 6.5862, -12.7757],
    [28.7302, 49.1003, -48.3596],
    [31.903, 5.692, -47.821999],
    [35.075802, -34.432899, -16.280899],
    [115.284103, 48.681499, 48.684101],
    [110.842796, 28.4821, 49.176201],
    [-19.1243, -69.0168, 49.420101],
    [-38.2486, -66.275597, 17.776199],
    [-111.024597, 52.604599, 46.225899],
    [-72.113297, 35.491798, 30.871401],
    [-66.192001, 80.898003, 55.394299],
    [-114.025002, 87.673302, 58.9818],
    [-97.804497, 116.560997, 73.978798],
    [-52.608898, 30.3641, 42.556099],
    [-16.7623, 58.010899, 58.078201],
    [-106.881401, 31.945499, 46.9133],
    [-108.6633, 43.2332, 46.315399],
    [-113.484596, 38.6049, 49.121498],
    [-101.216599, 15.9822, 46.308201],
    [-16.6605, -16.2883, 93.618698],
    [-23.926901, -2.5103, 86.736504],
    [-40.775002, -10.2288, 85.276398],
    [-61.180901, 8.8142, 76.996803],
    [-39.719501, -28.927099, 88.963799],
    [-14.8446, -52.6096, 140.113007],
    [-15.2674, -62.32, 129.688004],
    [-47.462502, -68.606102, 63.369701],
    [-35.604198, -71.758003, 81.063904],
    [-38.2486, -64.730202, 38.909901],
    [-17.802099, -71.758003, 81.063904],
    [-12.8928, -36.703499, 141.671997],
    [-67.7668, -30.197001, 78.417801],
    [-122.117996, -36.8894, 35.025002],
    [-109.283997, -93.589897, 27.824301],
    [-33.180698, 101.851997, 25.3186],
    [-11.4565, -37.899399, 150.722],
    [-70.236504, 62.836201, -3.9475],
    [-28.7302, 91.731102, -24.972601],
    [-47.263401, 54.293999, -27.414801],
    [-69.167603, 6.5862, -12.7757],
    [-28.7302, 49.1003, -48.3596],
    [-31.903, 5.692, -47.821999],
    [-35.075802, -34.432899, -16.280899],
    [-115.284103, 48.681499, 48.684101],
    [-110.842796, 28.4821, 49.176201]
  ],
  "chunks": [
    {
      "color": [119, 57, 0],
      "faces": [
        [0, 1, 2],
        [2, 3, 0],
        [4, 5, 2],
        [6, 3, 2],
        [2, 5, 6],
        [7, 8, 9],
        [10, 3, 6],
        [10, 50, 7],
        [7, 3, 10],
        [7, 9, 3],
        [49, 0, 9],
        [3, 9, 0],
        [53, 54, 55],
        [55, 56, 53],
        [57, 56, 55],
        [58, 59, 55],
        [55, 54, 58],
        [60, 61, 62],
        [63, 58, 54],
        [63, 60, 89],
        [60, 63, 54],
        [60, 54, 61],
        [88, 61, 53],
        [54, 53, 61],
        [2, 1, 4],
        [55, 59, 57]
      ]
    },
    {
      "color": [36, 51, 67],
      "faces": [
        [11, 12, 13],
        [64, 65, 66]
      ]
    },
    {
      "color": [228, 116, 36],
      "faces": [
        [14, 15, 11],
        [11, 16, 14],
        [17, 12, 18],
        [41, 64, 37],
        [67, 68, 66]
      ]
    },
    {
      "color": [192, 172, 157],
      "faces": [
        [19, 20, 21],
        [21, 22, 19],
        [20, 19, 23],
        [23, 24, 20],
        [23, 25, 24],
        [19, 22, 26],
        [26, 27, 19],
        [23, 28, 29],
        [23, 29, 30],
        [25, 23, 30],
        [29, 51, 52],
        [52, 30, 29],
        [27, 26, 69],
        [69, 70, 27],
        [70, 71, 72],
        [72, 27, 70],
        [72, 71, 73],
        [51, 74, 72],
        [52, 51, 72],
        [73, 52, 72],
        [19, 27, 74],
        [74, 28, 19],
        [51, 29, 28],
        [28, 74, 51],
        [74, 27, 72],
        [28, 23, 19]
      ]
    },
    {
      "color": [214, 194, 178],
      "faces": [
        [21, 20, 24],
        [24, 31, 21],
        [69, 71, 70],
        [71, 69, 75]
      ]
    },
    {
      "color": [228, 119, 25],
      "faces": [
        [31, 24, 18],
        [6, 5, 16],
        [16, 17, 6],
        [24, 32, 33],
        [33, 34, 24],
        [5, 4, 35],
        [75, 68, 71],
        [58, 67, 40],
        [40, 59, 58],
        [71, 76, 77],
        [77, 78, 71]
      ]
    },
    {
      "color": [205, 98, 0],
      "faces": [
        [24, 34, 18],
        [16, 13, 12],
        [12, 17, 16],
        [13, 16, 11],
        [71, 68, 76],
        [40, 67, 66],
        [66, 65, 40],
        [65, 64, 40]
      ]
    },
    {
      "color": [0, 0, 0],
      "faces": [
        [36, 15, 37],
        [37, 38, 36],
        [31, 39, 22],
        [22, 21, 31],
        [31, 15, 36],
        [36, 39, 31],
        [75, 69, 26],
        [26, 80, 75],
        [75, 80, 38],
        [38, 37, 75],
        [38, 80, 39],
        [39, 36, 38],
        [39, 80, 26],
        [26, 22, 39]
      ]
    },
    {
      "color": [247, 132, 25],
      "faces": [
        [17, 33, 10],
        [17, 18, 34],
        [34, 33, 17],
        [10, 6, 17],
        [11, 15, 31],
        [31, 18, 11],
        [18, 12, 11],
        [14, 16, 40],
        [40, 41, 14],
        [59, 5, 35],
        [35, 79, 59],
        [67, 63, 77],
        [67, 77, 76],
        [76, 68, 67],
        [63, 67, 58],
        [64, 68, 75],
        [75, 37, 64],
        [68, 64, 66],
        [14, 41, 37],
        [37, 15, 14],
        [5, 59, 40],
        [40, 16, 5]
      ]
    },
    {
      "color": [225, 119, 25],
      "faces": [
        [35, 4, 42],
        [4, 1, 42],
        [42, 43, 44],
        [44, 35, 42],
        [45, 43, 42],
        [42, 10, 45],
        [30, 32, 24],
        [24, 25, 30],
        [30, 33, 32],
        [33, 30, 10],
        [44, 43, 46],
        [43, 45, 47],
        [47, 46, 43],
        [48, 47, 45],
        [45, 30, 48],
        [30, 45, 10],
        [49, 42, 0],
        [8, 7, 42],
        [50, 42, 7],
        [50, 10, 42],
        [1, 0, 42],
        [42, 9, 8],
        [42, 49, 9],
        [64, 41, 40],
        [57, 59, 79],
        [79, 81, 57],
        [57, 81, 56],
        [82, 79, 35],
        [35, 44, 82],
        [81, 79, 82],
        [82, 83, 81],
        [84, 63, 81],
        [81, 83, 84],
        [44, 46, 85],
        [85, 82, 44],
        [52, 73, 71],
        [71, 78, 52],
        [52, 78, 77],
        [77, 63, 52],
        [82, 85, 83],
        [83, 85, 86],
        [86, 84, 83],
        [87, 52, 84],
        [84, 86, 87],
        [52, 63, 84],
        [88, 53, 81],
        [62, 81, 60],
        [89, 60, 81],
        [89, 81, 63],
        [56, 81, 53],
        [81, 62, 61],
        [81, 61, 88],
        [48, 87, 86],
        [86, 47, 48],
        [47, 86, 85],
        [85, 46, 47],
        [48, 30, 52],
        [52, 87, 48]
      ]
    }
  ]
}

const applyColoursToFoxJson = (colourArray) => {
  const chunks = baseFoxJson.chunks.map((chunk, i) => ({
    ...chunk,
    color: colourArray[i],
  }));
  return {
    ...baseFoxJson,
    chunks,
  }
}

const FoxIcon = ({
  size = 240,
  address,
  colorPaletteType,
  editorSelection = null,
  settledColorSchema,
  handleNewColorSettled,
  shouldShuffle,
  svgRef,
  followMouse = false,
}) => {
  const [colorSchema, setColorSchema] = useState(
    settledColorSchema || fillInFoxColor(generateColorPurelyOnAddress(address)),
  );
  const [eventEmitter] = useState(new EventEmitter());
  // doesnt run when component is loaded
  useDidMountEffect(() => {
    switch (colorPaletteType) {
      case COLOR_PALETTE_TYPE.generative:
        setColorSchema(fillInFoxColor(generateColorPurelyOnAddress(address)));
        break;
      case COLOR_PALETTE_TYPE.ai:
        async function fetchAISchema() {
          const colorsFromAI = await generateColorsFromAI(
            address,
            shouldShuffle,
          );
          setColorSchema(fillInFoxColor(colorsFromAI));
        }

        fetchAISchema();
        break;
      case COLOR_PALETTE_TYPE.editorSelection:
        setColorSchema(
          fillInFoxColor(PREDEFINED_COLOR_PALETTES[editorSelection - 1]),
        );
        break;
      case COLOR_PALETTE_TYPE.previousSelected:
        if (settledColorSchema) {
          setColorSchema(settledColorSchema);
        }
        break;
      case COLOR_PALETTE_TYPE.default:
        setColorSchema(Object.values(FOX_COLOR_PALETTE));
        break;
      default:
        setColorSchema(fillInFoxColor(generateColorPurelyOnAddress(address)));
        break;
    }
  }, [address, colorPaletteType, editorSelection]);

  useEffect(() => {
    if (handleNewColorSettled) {
      handleNewColorSettled(colorSchema);
    }
  }, [colorSchema, handleNewColorSettled]);

  useEffect(() => {
    if (!colorPaletteType) {
      setColorSchema(settledColorSchema);
    }
  }, [colorPaletteType, settledColorSchema]);

  // shuffle flagggg
  useEffect(() => {
    if (colorPaletteType === COLOR_PALETTE_TYPE.generative) {
      setColorSchema(fillInFoxColor(generateColorPurelyOnAddress(address)));
    } else if (colorPaletteType === COLOR_PALETTE_TYPE.ai) {
      async function fetchAISchema() {
        const colorsFromAI = await generateColorsFromAI(address);
        setColorSchema(fillInFoxColor(colorsFromAI));
      }
      fetchAISchema();
    }
  }, [shouldShuffle]);

  const [
    mouthBaseColor,
    mouthShadow,
    eyesColor,
    noseColor,
    earBaseColor,
    primaryShadow,
    secondaryShadow,
    tertiaryShadow,
    baseSkinTone,
  ] = colorSchema;

  return (
    <Mascot
      animationEventEmitter={eventEmitter}
      width={String(size)}
      height={String(size)}
      meshJson={applyColoursToFoxJson(colorSchema)}
      followMouse={followMouse}
    />
  );
};

FoxIcon.propTypes = {
  size: PropTypes.number,
  address: PropTypes.string,
  svgRef: PropTypes.string,
  colorPaletteType: PropTypes.string,
  editorSelection: PropTypes.number,
  settledColorSchema: PropTypes.array,
  handleNewColorSettled: PropTypes.func,
  shouldShuffle: PropTypes.bool,
};

export default FoxIcon;
