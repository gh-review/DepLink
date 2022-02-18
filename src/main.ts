import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'

import {DirectedGraph, IGraph, Node} from './graph'
import {ICruiseResult, IModule, cruise} from 'dependency-cruiser'

// test modify
const dirPath = process.env.GITHUB_WORKSPACE || '.'
const cruiseOptions = {
  includeOnly: 'src',
  exclude: ['^(coverage|test|node_modules)', '__tests__'],
  tsConfig: {
    fileName: 'tsconfig.json'
  }
}

function buildGraphFromModule(
  graph: IGraph<string, Node>,
  currentModule: IModule
): void {
  const nextNodes = currentModule.dependencies || []
  const curNodeName = currentModule.source
  graph.addNode(curNodeName)

  for (const element of nextNodes) {
    const nextNodeName = element.resolved
    graph.addEdge(curNodeName, nextNodeName)
  }
}

async function run(): Promise<void> {
  try {
    console.log(`Initial: ${dirPath}`, fs.readdirSync(dirPath))
    const cruiseResult = cruise([dirPath], cruiseOptions)
      .output as ICruiseResult
    console.dir(cruiseResult, {depth: 10})

    const graph = new DirectedGraph()

    for (const module of cruiseResult.modules) {
      buildGraphFromModule(graph, module)
    }
    console.log(graph.toString())

    const github_token = core.getInput('GITHUB_TOKEN')
    const context = github.context

    if (
      context.payload.pull_request == null ||
      context.eventName !== 'pull_request'
    ) {
      core.setFailed('No pull request found.')
      return
    }

    const pullRequest = context.payload.pull_request

    const octokit = github.getOctokit(github_token)

    const comparisonDetails = await octokit.rest.repos.compareCommits({
      ...context.repo,
      base: pullRequest.base.sha,
      head: pullRequest.head.sha
    })

    const files = comparisonDetails.data.files || []

    const affectedFiles: string[] = []
    const indexFileRegex = /^.*index\.(ts|js)$/
    for (const file of files.filter(f => f.status !== 'added')) {
      const fileNodeIncomingEdges =
        graph.getNode(file.filename)?.incomingEdges || []

      for (const dependency of fileNodeIncomingEdges) {
        affectedFiles.push(dependency)
        if (indexFileRegex.test(dependency)) {
          const indexFileIncomingEdges =
            graph.getNode(dependency)?.incomingEdges || []
          affectedFiles.push(...indexFileIncomingEdges)
        }
      }
    }

    const baseURL = `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}/`
    const formattedString = `${affectedFiles.reduce(
      (prev, cur) => `${prev}\n - \`${cur}\` (${baseURL} + ${cur})`,
      ''
    )}`

    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pullRequest.number,
      body: `# Affected Files\n**${affectedFiles.length} file(s) affected**\n ${formattedString}\n`
    })

    core.setOutput('graph', graph.toString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
