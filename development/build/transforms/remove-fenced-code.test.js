const deepFreeze = require('deep-freeze-strict');
const { BuildTypes } = require('../utils');
const {
  createRemoveFencedCodeTransform,
  removeFencedCode,
} = require('./remove-fenced-code');

// The test data is just strings. We get it from a function at the end of this
// file because it takes up a lot of lines and is very distracting.
const testData = getTestData();

const getMinimalFencedCode = (params = 'flask') =>
  `///: BEGIN:ONLY_INCLUDE_IN(${params})
Conditionally_Included
///: END:ONLY_INCLUDE_IN
`;

describe('build/transforms/remove-fenced-code', () => {
  describe('createRemoveFencedCodeTransform', () => {
    const mockJsFileName = 'file.js';

    it('rejects invalid build types', () => {
      expect(() => createRemoveFencedCodeTransform('foobar')).toThrow(
        /received unrecognized build type "foobar".$/u,
      );
    });

    it('returns a PassThrough stream for files with ignored extensions', async () => {
      const fileContent = '"Valid JSON content"\n';
      const stream = createRemoveFencedCodeTransform('main')('file.json');
      let streamOutput = '';

      await new Promise((resolve) => {
        stream.on('data', (data) => {
          streamOutput = streamOutput.concat(data.toString('utf8'));
        });

        stream.on('end', () => {
          expect(streamOutput).toStrictEqual(fileContent);
          resolve();
        });

        stream.write(Buffer.from(fileContent));
        setTimeout(() => stream.end());
      });
    });

    it('transforms a file read as a single chunk', async () => {
      const filePrefix = '// A comment\n';
      const fileContent = filePrefix.concat(getMinimalFencedCode());

      const stream = createRemoveFencedCodeTransform('main')(mockJsFileName);
      let streamOutput = '';

      await new Promise((resolve) => {
        stream.on('data', (data) => {
          streamOutput = streamOutput.concat(data.toString('utf8'));
        });

        stream.on('end', () => {
          expect(streamOutput).toStrictEqual(filePrefix);
          resolve();
        });

        stream.end(fileContent);
      });
    });

    it('transforms a file read as multiple chunks', async () => {
      const filePrefix = '// A comment\n';
      const chunks = filePrefix
        .concat(getMinimalFencedCode())
        .split('\n')
        // The final element in the split array is the empty string, which is
        // useful for calling .join, but undesirable here.
        .filter((line) => line !== '')
        .map((line) => `${line}\n`);

      const stream = createRemoveFencedCodeTransform('main')(mockJsFileName);
      let streamOutput = '';

      await new Promise((resolve) => {
        stream.on('data', (data) => {
          streamOutput = streamOutput.concat(data.toString('utf8'));
        });

        stream.on('end', () => {
          expect(streamOutput).toStrictEqual(filePrefix);
          resolve();
        });

        chunks.forEach((chunk) => stream.write(chunk));
        setTimeout(() => stream.end());
      });
    });

    it('handles file with fences that is unmodified by the transform', async () => {
      const fileContent = getMinimalFencedCode('main');

      const stream = createRemoveFencedCodeTransform('main')(mockJsFileName);
      let streamOutput = '';

      await new Promise((resolve) => {
        stream.on('data', (data) => {
          streamOutput = streamOutput.concat(data.toString('utf8'));
        });

        stream.on('end', () => {
          expect(streamOutput).toStrictEqual(fileContent);
          resolve();
        });

        stream.end(fileContent);
      });
    });
  });

  describe('removeFencedCode', () => {
    const mockFileName = 'file.js';

    // Valid inputs
    Object.keys(BuildTypes).forEach((buildType) => {
      it(`transforms file with fences for build type "${buildType}"`, () => {
        expect(
          removeFencedCode(
            mockFileName,
            buildType,
            testData.validInputs.withFences,
          ),
        ).toStrictEqual(testData.validOutputs[buildType]);

        // Ensure that the minimal input template is in fact valid
        const minimalInput = getMinimalFencedCode(buildType);
        expect(
          removeFencedCode(mockFileName, buildType, minimalInput),
        ).toStrictEqual([minimalInput, false]);
      });

      it(`does not modify file without fences for build type "${buildType}"`, () => {
        expect(
          removeFencedCode(
            mockFileName,
            buildType,
            testData.validInputs.withoutFences,
          ),
        ).toStrictEqual([testData.validInputs.withoutFences, false]);
      });
    });

    // Invalid inputs
    it('rejects empty fences', () => {
      const jsComment = '// A comment\n';

      const emptyFence = getMinimalFencedCode()
        .split('\n')
        .filter((line) => line.startsWith('///:'))
        .map((line) => `${line}\n`)
        .join('');

      const emptyFenceWithPrefix = jsComment.concat(emptyFence);
      const emptyFenceWithSuffix = emptyFence.concat(jsComment);
      const emptyFenceSurrounded = emptyFenceWithPrefix.concat(jsComment);

      const inputs = [
        emptyFence,
        emptyFenceWithPrefix,
        emptyFenceWithSuffix,
        emptyFenceSurrounded,
      ];

      inputs.forEach((input) => {
        expect(() =>
          removeFencedCode(mockFileName, BuildTypes.flask, input),
        ).toThrow(
          `Empty fence found in file "${mockFileName}":\n${emptyFence}`,
        );
      });
    });

    it('rejects sentinels preceded by non-whitespace', () => {
      // Matches the sentinel component of the first line beginning with "///:"
      const fenceSentinelRegex = /^\/\/\/:/mu;
      const replacements = ['a ///:', '2 ///:', '_ ///:'];

      replacements.forEach((replacement) => {
        expect(() =>
          removeFencedCode(
            mockFileName,
            BuildTypes.flask,
            getMinimalFencedCode().replace(fenceSentinelRegex, replacement),
          ),
        ).toThrow(
          /Fence sentinel may only appear at the start of a line, optionally preceded by whitespace.$/u,
        );
      });
    });

    it('rejects sentinels not followed by a single space and a multi-character alphabetical string', () => {
      // Matches the sentinel and terminus component of the first line
      // beginning with "///: TERMINUS"
      const fenceSentinelAndTerminusRegex = /^\/\/\/: \w+/mu;

      const replacements = [
        '///:BEGIN',
        '///:XBEGIN',
        '///:_BEGIN',
        '///:B',
        '///:_',
        '///: ',
        '///:',
      ];

      replacements.forEach((replacement) => {
        expect(() =>
          removeFencedCode(
            mockFileName,
            BuildTypes.flask,
            getMinimalFencedCode().replace(
              fenceSentinelAndTerminusRegex,
              replacement,
            ),
          ),
        ).toThrow(
          /Fence sentinel must be followed by a single space and an alphabetical string of two or more characters.$/u,
        );
      });
    });

    it('rejects malformed BEGIN directives', () => {
      // This is the first line of the minimal input template
      const directiveString = '///: BEGIN:ONLY_INCLUDE_IN(flask)';

      const replacements = [
        // Invalid terminus
        '///: BE_GIN:ONLY_INCLUDE_IN(flask)',
        '///: BE6IN:ONLY_INCLUDE_IN(flask)',
        '///: BEGIN7:ONLY_INCLUDE_IN(flask)',
        '///: BeGIN:ONLY_INCLUDE_IN(flask)',
        '///: BE3:ONLY_INCLUDE_IN(flask)',
        '///: BEG-IN:ONLY_INCLUDE_IN(flask)',
        '///: BEG N:ONLY_INCLUDE_IN(flask)',

        // Invalid commands
        '///: BEGIN:ONLY-INCLUDE_IN(flask)',
        '///: BEGIN:ONLY_INCLUDE:IN(flask)',
        '///: BEGIN:ONL6_INCLUDE_IN(flask)',
        '///: BEGIN:ONLY_IN@LUDE_IN(flask)',
        '///: BEGIN:ONLy_INCLUDE_IN(flask)',
        '///: BEGIN:ONLY INCLUDE_IN(flask)',

        // Invalid parameters
        '///: BEGIN:ONLY_INCLUDE_IN(,flask)',
        '///: BEGIN:ONLY_INCLUDE_IN(flask,)',
        '///: BEGIN:ONLY_INCLUDE_IN(flask,,main)',
        '///: BEGIN:ONLY_INCLUDE_IN(,)',
        '///: BEGIN:ONLY_INCLUDE_IN()',
        '///: BEGIN:ONLY_INCLUDE_IN( )',
        '///: BEGIN:ONLY_INCLUDE_IN(flask]',
        '///: BEGIN:ONLY_INCLUDE_IN[flask)',
        '///: BEGIN:ONLY_INCLUDE_IN(flask.main)',
        '///: BEGIN:ONLY_INCLUDE_IN(flask,@)',
        '///: BEGIN:ONLY_INCLUDE_IN(fla k)',

        // Stuff after the directive
        '///: BEGIN:ONLY_INCLUDE_IN(flask) A',
        '///: BEGIN:ONLY_INCLUDE_IN(flask) 9',
        '///: BEGIN:ONLY_INCLUDE_IN(flask)A',
        '///: BEGIN:ONLY_INCLUDE_IN(flask)9',
        '///: BEGIN:ONLY_INCLUDE_IN(flask)_',
        '///: BEGIN:ONLY_INCLUDE_IN(flask))',
      ];

      replacements.forEach((replacement) => {
        expect(() =>
          removeFencedCode(
            mockFileName,
            BuildTypes.flask,
            getMinimalFencedCode().replace(directiveString, replacement),
          ),
        ).toThrow(
          new RegExp(
            `${replacement.replace(
              /([()[\]])/gu,
              '\\$1',
            )}":\nFailed to parse fence directive.$`,
            'u',
          ),
        );
      });
    });

    it('rejects malformed END directives', () => {
      // This is the last line of the minimal input template
      const directiveString = '///: END:ONLY_INCLUDE_IN';

      const replacements = [
        // Invalid terminus
        '///: ENx:ONLY_INCLUDE_IN',
        '///: EN3:ONLY_INCLUDE_IN',
        '///: EN_:ONLY_INCLUDE_IN',
        '///: EN :ONLY_INCLUDE_IN',
        '///: EN::ONLY_INCLUDE_IN',

        // Invalid commands
        '///: END:ONLY-INCLUDE_IN',
        '///: END::ONLY_INCLUDE_IN',
        '///: END:ONLY_INCLUDE:IN',
        '///: END:ONL6_INCLUDE_IN',
        '///: END:ONLY_IN@LUDE_IN',
        '///: END:ONLy_INCLUDE_IN',
        '///: END:ONLY INCLUDE_IN',

        // Stuff after the directive
        '///: END:ONLY_INCLUDE_IN A',
        '///: END:ONLY_INCLUDE_IN 9',
        '///: END:ONLY_INCLUDE_IN _',
      ];

      replacements.forEach((replacement) => {
        expect(() =>
          removeFencedCode(
            mockFileName,
            BuildTypes.flask,
            getMinimalFencedCode().replace(directiveString, replacement),
          ),
        ).toThrow(
          new RegExp(
            `${replacement}":\nFailed to parse fence directive.$`,
            'u',
          ),
        );
      });
    });

    it('rejects files with uneven number of fence lines', () => {
      const additions = [
        '///: BEGIN:ONLY_INCLUDE_IN(flask)',
        '///: END:ONLY_INCLUDE_IN',
      ];
      additions.forEach((addition) => {
        expect(() =>
          removeFencedCode(
            mockFileName,
            BuildTypes.flask,
            getMinimalFencedCode().concat(addition),
          ),
        ).toThrow(
          /A valid fence consists of two fence lines, but the file contains an uneven number, "3", of fence lines.$/u,
        );
      });
    });

    it('rejects invalid terminuses', () => {
      const testCases = [
        ['BEGIN', ['KAPLAR', 'FLASK', 'FOO']],
        ['END', ['KAPLAR', 'FOO', 'BAR']],
      ];

      testCases.forEach(([validTerminus, replacements]) => {
        replacements.forEach((replacement) => {
          expect(() =>
            removeFencedCode(
              mockFileName,
              BuildTypes.flask,
              getMinimalFencedCode().replace(validTerminus, replacement),
            ),
          ).toThrow(
            new RegExp(
              `Line contains invalid directive terminus "${replacement}".$`,
              'u',
            ),
          );
        });
      });
    });

    it('rejects invalid commands', () => {
      const testCases = [
        [/ONLY_INCLUDE_IN\(/mu, ['ONLY_KEEP_IN(', 'FLASK(', 'FOO(']],
        [/ONLY_INCLUDE_IN$/mu, ['ONLY_KEEP_IN', 'FLASK', 'FOO']],
      ];

      testCases.forEach(([validCommand, replacements]) => {
        replacements.forEach((replacement) => {
          expect(() =>
            removeFencedCode(
              mockFileName,
              BuildTypes.flask,
              getMinimalFencedCode().replace(validCommand, replacement),
            ),
          ).toThrow(
            new RegExp(
              `Line contains invalid directive command "${replacement.replace(
                '(',
                '',
              )}".$`,
              'u',
            ),
          );
        });
      });
    });

    it('rejects invalid command parameters', () => {
      const testCases = [
        ['bar', ['bar', 'flask,bar', 'flask,beta,main,bar']],
        ['Foo', ['Foo', 'flask,Foo', 'flask,beta,main,Foo']],
        ['b3ta', ['b3ta', 'flask,b3ta', 'flask,beta,main,b3ta']],
        ['bEta', ['bEta', 'flask,bEta', 'flask,beta,main,bEta']],
      ];

      testCases.forEach(([invalidParam, replacements]) => {
        replacements.forEach((replacement) => {
          expect(() =>
            removeFencedCode(
              mockFileName,
              BuildTypes.flask,
              getMinimalFencedCode(replacement),
            ),
          ).toThrow(
            new RegExp(`"${invalidParam}" is not a valid build type.$`, 'u'),
          );
        });
      });

      // Should fail for empty params
      expect(() =>
        removeFencedCode(
          mockFileName,
          BuildTypes.flask,
          getMinimalFencedCode('').replace('()', ''),
        ),
      ).toThrow(/No params specified.$/u);
    });

    it('rejects directive pairs with wrong terminus order', () => {
      // We need more than one directive pair for this test
      const input = getMinimalFencedCode().concat(getMinimalFencedCode('beta'));

      const expectedBeginError =
        'The first directive of a pair must be a "BEGIN" directive.';
      const expectedEndError =
        'The second directive of a pair must be an "END" directive.';
      const testCases = [
        [
          'BEGIN:ONLY_INCLUDE_IN(flask)',
          'END:ONLY_INCLUDE_IN',
          expectedBeginError,
        ],
        [
          /END:ONLY_INCLUDE_IN/mu,
          'BEGIN:ONLY_INCLUDE_IN(main)',
          expectedEndError,
        ],
        [
          'BEGIN:ONLY_INCLUDE_IN(beta)',
          'END:ONLY_INCLUDE_IN',
          expectedBeginError,
        ],
      ];

      testCases.forEach(([target, replacement, expectedError]) => {
        expect(() =>
          removeFencedCode(
            mockFileName,
            BuildTypes.flask,
            input.replace(target, replacement),
          ),
        ).toThrow(expectedError);
      });
    });

    // We can't do this until there's more than one command
    it.todo('rejects directive pairs with mismatched commands');
  });
});

function getTestData() {
  const data = {
    validInputs: {
      withFences: `
///: BEGIN:ONLY_INCLUDE_IN(flask,beta)
Conditionally_Included
///: END:ONLY_INCLUDE_IN
  Always_Included
Always_Included
   Always_Included
Always_Included
  ///: BEGIN:ONLY_INCLUDE_IN(flask,beta)
  Conditionally_Included

  Conditionally_Included
  Conditionally_Included
  ///: END:ONLY_INCLUDE_IN
Always_Included

Always_Included
   Always_Included
          ///: BEGIN:ONLY_INCLUDE_IN(flask)

  Conditionally_Included
    Conditionally_Included
       ///: END:ONLY_INCLUDE_IN
Always_Included
   Always_Included
Always_Included

///: BEGIN:ONLY_INCLUDE_IN(flask)
  Conditionally_Included
Conditionally_Included

       ///: END:ONLY_INCLUDE_IN
`,

      withoutFences: `
  Always_Included
Always_Included
   Always_Included
Always_Included
Always_Included

Always_Included
   Always_Included
Always_Included
   Always_Included
Always_Included

`,
    },

    validOutputs: {
      beta: [
        `
///: BEGIN:ONLY_INCLUDE_IN(flask,beta)
Conditionally_Included
///: END:ONLY_INCLUDE_IN
  Always_Included
Always_Included
   Always_Included
Always_Included
  ///: BEGIN:ONLY_INCLUDE_IN(flask,beta)
  Conditionally_Included

  Conditionally_Included
  Conditionally_Included
  ///: END:ONLY_INCLUDE_IN
Always_Included

Always_Included
   Always_Included
Always_Included
   Always_Included
Always_Included

`,
        true,
      ],
    },
  };

  data.validOutputs.flask = [data.validInputs.withFences, false];
  data.validOutputs.main = [data.validInputs.withoutFences, true];
  return deepFreeze(data);
}
