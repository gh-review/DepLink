import * as core from '@actions/core'
import * as github from '@actions/github'

const github_token = core.getInput('GITHUB_TOKEN')
const octokit = github.getOctokit(github_token)

const context = github.context
const pullRequest = context.payload.pull_request

export const repoURL = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}`

export const pullRequestHeadRef = pullRequest?.head.ref

export interface AffectedFile {
  sha: string
  filename: string
  status:
    | 'added'
    | 'removed'
    | 'modified'
    | 'renamed'
    | 'copied'
    | 'changed'
    | 'unchanged'
  additions: number
  deletions: number
  changes: number
  blob_url: string
  raw_url: string
  contents_url: string
  patch?: string
  previous_filename?: string
}

export const isPullRequest = (): boolean => {
  if (
    context.payload.pull_request == null ||
    context.eventName !== 'pull_request'
  ) {
    return false
  }

  return true
}

export const getAffectedFiles = async (): Promise<AffectedFile[]> => {
  const comparisonDetails = await octokit.rest.repos.compareCommits({
    ...context.repo,
    base: pullRequest?.base.sha,
    head: pullRequest?.head.sha
  })

  return (comparisonDetails.data.files || []).filter(f => f.status !== 'added')
}

export const createPullRequestComment = async (
  markdown: string
): Promise<void> => {
  await octokit.rest.issues.createComment({
    ...context.repo,
    issue_number: pullRequest?.number,
    body: markdown
  })
}
