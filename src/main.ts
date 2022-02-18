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

    let numAffectedFiles = 0
    const indexFileRegex = /^.*index\.(ts|js)$/
    let formattedString = ''
    const baseURL = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/blob/${pullRequest.head.ref}/`

    for (const file of files.filter(f => f.status !== 'added')) {
      const fileNodeIncomingEdges =
        graph.getNode(file.filename)?.incomingEdges || new Set()

      if (fileNodeIncomingEdges.size === 0) continue

      // output file title
      formattedString += `#### Files affected by ${
        file.status === 'modified' ? 'changes in' : 'removal of'
      } \`${file.filename}\`\n**URL:** ${baseURL}${file.filename}\n\n`

      // go through files which list the modified file as a dependency
      for (const dependency of fileNodeIncomingEdges) {
        formattedString += `- \`${dependency}\` (${baseURL + dependency})\n`
        numAffectedFiles += 1

        // check if this file is an index file. If so, search for all files
        // which depend on it and add them to the list
        if (indexFileRegex.test(dependency)) {
          const indexFileIncomingEdges =
            graph.getNode(dependency)?.incomingEdges || new Set()
          formattedString = Array.from(indexFileIncomingEdges).reduce(
            (prev, cur) => `${prev}\n - \`${cur}\` (${baseURL + cur})`,
            formattedString
          )
        }
      }
    }

    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pullRequest.number,
      body: `# Affected Files\n**${numAffectedFiles} file(s) affected**\n ${formattedString}\n`
    })

    core.setOutput('graph', graph.toString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
