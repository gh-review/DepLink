import * as core from '@actions/core'
import * as github from '@actions/github'

import {DirectedGraph, IGraph, Node} from './graph'
import {ICruiseResult, IModule, cruise} from 'dependency-cruiser'
import * as fs from 'fs'

const dirPath = process.env.GITHUB_WORKSPACE || '.'
const cruiseOptions = {
  includeOnly: '^src',
  exclude: ['^(coverage|test|node_modules)', '__tests__']
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
    // backwards because from the next edge back to the current node
    // to discover what files are affected with a dependency change
    graph.addEdge(nextNodeName, curNodeName)
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
    console.log(process.env.GITHUB_WORKSPACE, dirPath, __dirname)

    const github_token = core.getInput('GITHUB_TOKEN')

    const context = github.context
    if (context.payload.pull_request == null) {
      core.setFailed('No pull request found.')
      return
    }
    const pull_request_number = context.payload.pull_request.number

    const octokit = github.getOctokit(github_token)

    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pull_request_number,
      body: ` \`\`\` \n${graph.toString()}\n \`\`\``
    })

    core.setOutput('graph', graph.toString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
