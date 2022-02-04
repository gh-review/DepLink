import * as core from '@actions/core'
import {DirectedGraph, IGraph, Node} from './graph'
import {ICruiseResult, IModule, cruise} from 'dependency-cruiser'

const currentWorkingDirectory = process.cwd()
console.log("Current Directory", currentWorkingDirectory)

const ARRAY_OF_FILES_AND_DIRS_TO_CRUISE = [currentWorkingDirectory]
const cruiseOptions = {}

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
    const cruiseResult = cruise(
      ARRAY_OF_FILES_AND_DIRS_TO_CRUISE,
      cruiseOptions
    ).output as ICruiseResult
    console.dir(cruiseResult, {depth: 10})

    const graph = new DirectedGraph()

    for (const module of cruiseResult.modules) {
      buildGraphFromModule(graph, module)
    }

    core.debug(graph.toString())

    core.setOutput('graph', graph.toString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
