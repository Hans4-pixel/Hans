const CIRCLE_TOKEN = process.env.CIRCLE_OIDC_TOKEN_V2;

interface Actor {
  login: string;
  avatar_url: string | null;
}

interface Trigger {
  received_at: string;
  type: string;
  actor: Actor;
}

interface VCS {
  origin_repository_url: string;
  target_repository_url: string;
  revision: string;
  provider_name: string;
  branch: string;
}

interface WorkflowItem {
  id: string;
  errors: string[];
  project_slug: string;
  updated_at: string;
  number: number;
  state: string;
  created_at: string;
  trigger: Trigger;
  vcs: VCS;
}

interface CircleCIResponse {
  next_page_token: string | null;
  items: WorkflowItem[];
}

interface WorkflowStatusItem {
  pipeline_id: string;
  id: string;
  name: string;
  project_slug: string;
  tag?: string;
  status: string;
  started_by: string;
  pipeline_number: number;
  created_at: string;
  stopped_at: string;
}

interface WorkflowStatusResponse {
  next_page_token: string | null;
  items: WorkflowStatusItem[];
}

/**
 * Fetches the last 20 CircleCI workflows for 'develop' branch.
 * Note: the API returns the first 20 workflows by default.
 * If we wanted to get older workflows, we would need to use the 'page-token' we would get in the first response
 * and perform a subsequent request with the 'page-token' parameter.
 * This seems unnecessary as of today, as the amount of daily PRs merged to develop is not that high.
 *
 * @returns {Promise<WorkflowItem[]>} A promise that resolves to an array of workflow items.
 * @throws Will throw an error if the CircleCI token is not defined or if the HTTP request fails.
 */
async function getCircleCiWorkflowsByBranch(branch: string): Promise<WorkflowItem[]> {
  if (!CIRCLE_TOKEN) {
    throw new Error('CircleCI token is not defined');
  }

  const url = `https://circleci.com/api/v2/project/github/${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}/pipeline?branch=${branch}`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Circle-Token': CIRCLE_TOKEN,
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response}`);
    }
    const body = await response.json();
    return body.items;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

/**
 * Fetches the status of a specific CircleCI workflow.
 *
 * @param {string} workflowId - The ID of the workflow to fetch the status for.
 * @returns {Promise<WorkflowStatusResponse>} A promise that resolves to the workflow status response.
 * @throws Will throw an error if the CircleCI token is not defined or if the HTTP request fails.
 */
async function getWorkflowStatusById(workflowId: string): Promise<WorkflowStatusResponse> {
  if (!CIRCLE_TOKEN) {
    throw new Error('CircleCI token is not defined');
  }

  const url = `https://circleci.com/api/v2/pipeline/${workflowId}/workflow`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Circle-Token': CIRCLE_TOKEN,
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response}`);
    }
    const body = await response.json();
    return body;

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

/**
 * Reruns a CircleCI workflow by its ID.
 *
 * @param {string} workflowId - The ID of the workflow to rerun.
 * @throws Will throw an error if the CircleCI token is not defined or if the HTTP request fails.
 */
async function rerunWorkflowById(workflowId: string) {
  if (!CIRCLE_TOKEN) {
    throw new Error('CircleCI token is not defined');
  }

  const url = `https://circleci.com/api/v2/workflow/${workflowId}/rerun`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Circle-Token': CIRCLE_TOKEN,
    },
    body: JSON.stringify({
      enable_ssh: false,
      from_failed: true,
      sparse_tree: false, // mutually exclusive with the from_failed parameter
    })
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response}`);
    }
    const body = await response.json();
    console.log(body);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Re-runs failed CircleCI workflows from develop branch.
 * The workflow will only be re-runed if:
 *   1. It has the status of 'failed'
 *   2. It has only been run once
 *   3. It is among the most recent 20 workflows
 *   4. It was triggered by the 'github-merge-queue[bot]' user
 *
 * @throws Will throw an error if fetching the workflows or re-running a workflow fails.
 */
async function rerunFailedWorkflowsFromDevelop() {
  const workflows = await getCircleCiWorkflowsByBranch('develop');

  for (const item of workflows) {
    if (item.trigger.actor.login === 'github-merge-queue[bot]') {
      const workflowStatus = await getWorkflowStatusById(item.id);

      if (workflowStatus.items.length === 1 && workflowStatus.items[0].status === 'failed') {
        await rerunWorkflowById(item.id);
        console.log(`Rerun workflow with ID: ${item.id}`);
      }
    }
  }
}

rerunFailedWorkflowsFromDevelop();