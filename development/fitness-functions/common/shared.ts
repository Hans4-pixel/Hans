function filterDiffByFilePath(diff: string, regex: string): string {
  // split by `diff --git` and remove the first element which is empty
  const diffBlocks = diff.split(`diff --git`).slice(1);

  const filteredDiff = diffBlocks
    .map((block) => block.trim())
    .filter((block) => {
      let didAPathInBlockMatchRegEx = false;

      block
        // get the first line of the block which has the paths
        .split('\n')[0]
        .trim()
        // split the two paths
        .split(' ')
        // remove `a/` and `b/` from the paths
        .map((path) => path.substring(2))
        // if at least one of the two paths matches the regex, filter the
        // corresponding diff block in
        .forEach((path) => {
          if (new RegExp(regex, 'u').test(path)) {
            didAPathInBlockMatchRegEx = true;
          }
        });

      return didAPathInBlockMatchRegEx;
    })
    // prepend `git --diff` to each block
    .map((block) => `diff --git ${block}`)
    .join('\n');

  return filteredDiff;
}

function filterDiffLineAdditions(diff: string): string {
  const diffLines = diff.split('\n');

  const diffAdditionLines = diffLines.filter((line) => {
    const isAdditionLine = line.startsWith('+') && !line.startsWith('+++');

    return isAdditionLine;
  });

  return diffAdditionLines.join('/n');
}

function filterDiffFileCreations(diff: string): string {
  // split by `diff --git` and remove the first element which is empty
  const diffBlocks = diff.split(`diff --git`).slice(1);

  const filteredDiff = diffBlocks
    .map((block) => block.trim())
    .filter((block) => {
      const isFileCreationLine =
        block
          // get the second line of the block which has the file mode
          .split('\n')[1]
          .trim()
          .substring(0, 13) === 'new file mode';

      return isFileCreationLine;
    })
    // prepend `git --diff` to each block
    .map((block) => `diff --git ${block}`)
    .join('\n');

  return filteredDiff;
}

function hasNumberOfCodeBlocksIncreased(
  diffFragment: string,
  codeBlocks: string[],
): { [codeBlock: string]: boolean } {
  const diffLines = diffFragment.split('\n');

  const codeBlockFound: { [codeBlock: string]: boolean } = {};

  for (const codeBlock of codeBlocks) {
    codeBlockFound[codeBlock] = false;

    for (const diffLine of diffLines) {
      if (diffLine.includes(codeBlock)) {
        codeBlockFound[codeBlock] = true;
        break;
      }
    }
  }

  return codeBlockFound;
}

export {
  filterDiffByFilePath,
  filterDiffLineAdditions,
  filterDiffFileCreations,
  hasNumberOfCodeBlocksIncreased,
};
