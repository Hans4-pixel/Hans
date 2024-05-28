import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';

import { retrieveIssue } from './shared/issue';
import {
  Labelable,
  LabelableType,
  findLabel,
  addLabelToLabelable,
  removeLabelFromLabelable,
  removeLabelFromLabelableIfPresent,
} from './shared/labelable';
import {
  Label,
  externalContributorLabel,
  flakyTestsLabel,
  invalidIssueTemplateLabel,
  invalidPullRequestTemplateLabel,
} from './shared/label';
import { TemplateType, templates } from './shared/template';
import { retrievePullRequest } from './shared/pull-request';

const knownBots = ["metamaskbot", "dependabot", "github-actions", "sentry-io"];

main().catch((error: Error): void => {
  console.error(error);
  process.exit(1);
});

async function main(): Promise<void> {
  // "GITHUB_TOKEN" is an automatically generated, repository-specific access token provided by GitHub Actions.
  // We can't use "GITHUB_TOKEN" here, as its permissions don't allow neither to create new labels
  // nor to retrieve the list of organisations a user belongs to.
  // In our case, we may want to create "regression-prod-x.y.z" label when it doesn't already exist.
  // We may also want to retrieve the list of organisations a user belongs to.
  // As a consequence, we need to create our own "LABEL_TOKEN" with "repo" and "read:org" permissions.
  // Such a token allows both to create new labels and fetch user's list of organisations.
  const personalAccessToken = process.env.LABEL_TOKEN;
  if (!personalAccessToken) {
    core.setFailed('LABEL_TOKEN not found');
    process.exit(1);
  }

  // Initialise octokit, required to call Github GraphQL API
  const octokit: InstanceType<typeof GitHub> = getOctokit(personalAccessToken, {
    previews: ['bane'], // The "bane" preview is required for adding, updating, creating and deleting labels.
  });

  // Retrieve labelable object (i.e. a pull request or an issue) info from context
  const labelableRepoOwner = context.repo.owner;
  const labelableRepoName = context.repo.repo;
  let labelable: Labelable;
  if (context.payload.issue?.number) {
    // Retrieve issue
    labelable = await retrieveIssue(
      octokit,
      labelableRepoOwner,
      labelableRepoName,
      context.payload.issue?.number,
    );
  } else if (context.payload.pull_request?.number) {
    // Retrieve PR
    labelable = await retrievePullRequest(
      octokit,
      labelableRepoOwner,
      labelableRepoName,
      context.payload.pull_request?.number,
    );
  } else {
    core.setFailed(
      'Labelable object (i.e. a pull request or an issue) number not found',
    );
    process.exit(1);
  }

  // If author is not part of the MetaMask organisation
  if (!(await userBelongsToMetaMaskOrg(octokit, labelable?.author))) {
    // Add external contributor label to the issue
    await addLabelToLabelable(octokit, labelable, externalContributorLabel);
  }

  // Check if labelable's body matches one of the issue or PR templates ('general-issue.yml' or 'bug-report.yml' or 'pull-request-template.md').
  const templateType: TemplateType = extractTemplateTypeFromBody(
    labelable.body,
  );

  // If labelable's author is a bot we skip the template checks as bots don't use templates
  if (knownBots.includes(labelable.author)) {
    console.log(`${labelable.type === LabelableType.PullRequest ? 'PR' : 'Issue'} was created by a bot (${labelable.author}). Skip template checks.`);
    process.exit(0); // Stop the process and exit with a success status code
  }

  if (labelable.type === LabelableType.Issue) {

    // If labelable is a flaky test report, no template is needed (we just add a link to circle.ci in the description), we skip the template checks
    const flakyTestsLabelFound = findLabel(labelable, flakyTestsLabel);
    if (flakyTestsLabelFound?.id) {
      console.log(`Issue ${labelable?.number} was created to report a flaky test. Issue's description doesn't need to match issue template in that case as the issue's description only includes a link redirecting to circle.ci. Skip template checks.`);
      await removeLabelFromLabelableIfPresent(
        octokit,
        labelable,
        invalidIssueTemplateLabel,
      );
      process.exit(0); // Stop the process and exit with a success status code
    }

    if (templateType === TemplateType.GeneralIssue) {
      console.log("Issue matches 'general-issue.yml' template.");
      await removeLabelFromLabelableIfPresent(
        octokit,
        labelable,
        invalidIssueTemplateLabel,
      );
    } else if (templateType === TemplateType.BugReportIssue) {
      console.log("Issue matches 'bug-report.yml' template.");
      await removeLabelFromLabelableIfPresent(
        octokit,
        labelable,
        invalidIssueTemplateLabel,
      );

      // Extract release version from bug report issue body (if existing)
      const releaseVersion = extractReleaseVersionFromBugReportIssueBody(
        labelable.body,
      );

      // Add regression prod label to the bug report issue if release version was found in issue body
      if(isReleaseCandidateIssue(labelable)) {
        console.log(
          `Issue ${labelable?.number} is not a production issue. Regression prod label is not needed.`,
        );
      } else if (releaseVersion) {
        await addRegressionProdLabelToIssue(octokit, releaseVersion, labelable);
      } else {
        console.log(
          `No release version was found in body of bug report issue ${labelable?.number}.`,
        );
      }
    } else {
      const errorMessage =
        "Issue body does not match any of expected templates ('general-issue.yml' or 'bug-report.yml').\n\nMake sure issue's body includes all section titles.\n\nSections titles are listed here: https://github.com/MetaMask/metamask-extension/blob/develop/.github/scripts/shared/template.ts#L14-L37";
      console.log(errorMessage);

      // Add label to indicate issue doesn't match any template
      await addLabelToLabelable(octokit, labelable, invalidIssueTemplateLabel);

      // Github action shall fail in case issue body doesn't match any template
      core.setFailed(errorMessage);
      process.exit(1);
    }
  } else if (labelable.type === LabelableType.PullRequest) {
    if (templateType === TemplateType.PullRequest) {
      console.log("PR matches 'pull-request-template.md' template.");
      await removeLabelFromLabelableIfPresent(
        octokit,
        labelable,
        invalidPullRequestTemplateLabel,
      );
    } else {
      const errorMessage =
        `PR body does not match template ('pull-request-template.md').\n\nMake sure PR's body includes all section titles.\n\nSections titles are listed here: https://github.com/MetaMask/metamask-extension/blob/develop/.github/scripts/shared/template.ts#L40-L47`;
      console.log(errorMessage);

      // Add label to indicate PR body doesn't match template
      await addLabelToLabelable(
        octokit,
        labelable,
        invalidPullRequestTemplateLabel,
      );

      // TODO: Remove these two lines in January 2024. By then, most PRs will match the new PR template, and we'll want the action to fail if they don't.
      // For now, we're in a transition period and Github action shall add an annotation in case PR doesn't match template, but shall not fail.
      // Indeed, many PRs were created before the new PR template was introduced and don't match the template for now.
      core.error(errorMessage, {
        title: invalidPullRequestTemplateLabel.name,
        file: '.github/scripts/shared/template.ts',
        startLine: 40,
        endLine: 47,
      }); // This creates an annotation on the PR
      process.exit(0);

      // TODO: Uncomment these two lines in January 2024. By then, most PRs will match the new PR template, and we'll want the action to fail if they don't.
      // Github action shall fail in case PR doesn't match template
      // core.setFailed(errorMessage); // This creates a failure status for the action
      // process.exit(1);
    }
  } else {
    core.setFailed(
      `Shall never happen: Labelable is neither an issue nor a PR (${JSON.stringify(
        labelable,
      )}).`,
    );
    process.exit(1);
  }
}

// This helper function checks if body matches one of the issue or PR templates ('general-issue.yml' or 'bug-report.yml' or 'pull-request-template.md')
function extractTemplateTypeFromBody(body: string): TemplateType {
  for (const [templateType, template] of templates) {
    let matches = true;

    for (const title of template.titles) {
      if (!body.includes(title)) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return templateType;
    }
  }

  return TemplateType.None;
}

// This helper function extracts release version from bug report issue's body.
function extractReleaseVersionFromBugReportIssueBody(
  body: string,
): string | undefined {
  // Remove newline characters
  const cleanedBody = body.replace(/\r?\n/g, ' ');

  // Extract version from the cleaned body
  const regex = /### Version\s+((.*?)(?=  |$))/;
  const versionMatch = cleanedBody.match(regex);
  const version = versionMatch?.[1];

  // Check if version is in the format x.y.z
  if (version && !/^(\d+\.)?(\d+\.)?(\*|\d+)$/.test(version)) {
    throw new Error('Version is not in the format x.y.z');
  }

  return version;
}

// This function adds the correct "regression-prod-x.y.z" label to the issue, and removes other ones
async function addRegressionProdLabelToIssue(
  octokit: InstanceType<typeof GitHub>,
  releaseVersion: string,
  issue: Labelable,
): Promise<void> {
  // Craft regression prod label to add
  const regressionProdLabel: Label = {
    name: `regression-prod-${releaseVersion}`,
    color: '5319E7', // violet
    description: `Regression bug that was found in production in release ${releaseVersion}`,
  };

  let regressionProdLabelFound: boolean = false;
  const regressionProdLabelsToBeRemoved: {
    id: string;
    name: string;
  }[] = [];

  // Loop over issue's labels, to see if regression labels are either missing, or to be removed
  issue?.labels?.forEach((label) => {
    if (label?.name === regressionProdLabel.name) {
      regressionProdLabelFound = true;
    } else if (label?.name?.startsWith('regression-prod-')) {
      regressionProdLabelsToBeRemoved.push(label);
    }
  });

  // Add regression prod label to the issue if missing
  if (regressionProdLabelFound) {
    console.log(
      `Issue ${issue?.number} already has ${regressionProdLabel.name} label.`,
    );
  } else {
    console.log(
      `Add ${regressionProdLabel.name} label to issue ${issue?.number}.`,
    );
    await addLabelToLabelable(octokit, issue, regressionProdLabel);
  }

  // Remove other regression prod label from the issue
  await Promise.all(
    regressionProdLabelsToBeRemoved.map((label) => {
      removeLabelFromLabelable(octokit, issue, label?.id);
    }),
  );
}

// This function checks if user belongs to MetaMask organization on Github
async function userBelongsToMetaMaskOrg(
  octokit: InstanceType<typeof GitHub>,
  username: string,
): Promise<boolean> {
  const userBelongsToMetaMaskOrgQuery = `
    query UserBelongsToMetaMaskOrg($login: String!) {
      user(login: $login) {
        organization(login: "MetaMask") {
          id
        }
      }
    }
  `;

  const userBelongsToMetaMaskOrgResult: {
    user: {
      organization: {
        id: string;
      };
    };
  } = await octokit.graphql(userBelongsToMetaMaskOrgQuery, { login: username });

  return Boolean(userBelongsToMetaMaskOrgResult?.user?.organization?.id);
}

// This function checks if issue is a release candidate (RC) issue, discovered during release regression testing phase. If so, it means it is not a production issue.
function isReleaseCandidateIssue(
  issue: Labelable,
): boolean {
  return Boolean(issue.labels.find(label => label.name === 'regression-RC'));
}
