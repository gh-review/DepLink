import * as core from '@actions/core'
import * as github from '@actions/github'

const github_token = core.getInput('GITHUB_TOKEN')
const octokit = github.getOctokit(github_token)

const context = github.context
const pullRequest = context.payload.pull_request

export const repoURL = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}`

export const pullRequestHeadRef = pullRequest?.head.ref

export const isPullRequest = (): boolean => {
  if (
    context.payload.pull_request == null ||
    context.eventName !== 'pull_request'
  ) {
    core.setFailed('No pull request found.')
    return false
  }

  return true
}

export const getAffectedFiles = async () => {
  const comparisonDetails = await octokit.rest.repos.compareCommits({
    ...context.repo,
    base: pullRequest?.base.sha,
    head: pullRequest?.head.sha
  })

  // @ts-ignore
  return (comparisonDetails.data.files || []).status !== 'added'
}

export const createPullRequestComment = async (markdown: string) => {
  await octokit.rest.issues.createComment({
    ...context.repo,
    issue_number: pullRequest?.number,
    body: markdown
  })
}
