import * as core from '@actions/core'

import {ICruiseResult, cruise} from 'dependency-cruiser'
import {buildGraphFromModule, getAffectedFilesMarkdown} from './utils'
import {
  createPullRequestComment,
  getAffectedFiles,
  isPullRequest
} from './github'
import {cruiseOptions, dirPath} from './constant'
import {DirectedGraph} from './graph'

async function run(): Promise<void> {
  try {
    const cruiseResult = cruise([dirPath], cruiseOptions)
      .output as ICruiseResult

    const graph = new DirectedGraph()

    for (const module of cruiseResult.modules) {
      buildGraphFromModule(graph, module)
    }

    if (!isPullRequest()) {
      core.setFailed('No pull request found.')
      return
    }

    const files = await getAffectedFiles()

    const markdown = getAffectedFilesMarkdown(files, graph)

    await createPullRequestComment(markdown)

    core.setOutput('graph', graph.toString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
