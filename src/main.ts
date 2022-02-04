import * as core from '@actions/core'
import { DirectedGraph, IGraph, Node } from './graph'
import { ICruiseResult, IModule, cruise } from 'dependency-cruiser'


const currentWorkingDirectory = process.cwd()
console.log("Current Directory Testt", currentWorkingDirectory)

const ARRAY_OF_FILES_AND_DIRS_TO_CRUISE = [currentWorkingDirectory]


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

console.log("Testtinggg logs")

async function run(): Promise<void> {
  console.log("Loggingg heree")

  try {
    const cruiseResult = cruise(
      ARRAY_OF_FILES_AND_DIRS_TO_CRUISE,
      {
        includeOnly: "src",
        exclude: "node_modules"
      },
      {},
      {
        "compilerOptions": {
          "target": "es6",                          /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019' or 'ESNEXT'. */
          "module": "commonjs",                     /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */
          "outDir": "./lib",                        /* Redirect output structure to the directory. */
          "rootDir": "./src",                       /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
          "strict": true,                           /* Enable all strict type-checking options. */
          "noImplicitAny": true,                    /* Raise error on expressions and declarations with an implied 'any' type. */
          "esModuleInterop": true                   /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */
        },
        "exclude": ["node_modules", "**/*.test.ts"]
      }
    ).output as ICruiseResult
    console.dir(cruiseResult, { depth: 10 })

    const graph = new DirectedGraph()

    for (const module of cruiseResult.modules) {
      buildGraphFromModule(graph, module)
    }

    core.debug(graph.toString())

    core.setOutput('graph', graph.toString())
  } catch (error) {
    console.log("Errt", error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
