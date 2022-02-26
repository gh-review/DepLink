import {IGraph, Node} from './graph'
import {IModule} from 'dependency-cruiser'
import {pullRequestHeadRef, repoURL} from './github'
import {indexFileRegex} from './constant'

export function buildGraphFromModule(
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
// @ts-ignore
export const getAffectedFilesMarkdown = ({files, graph}): any => {
  let numAffectedFiles = 0
  let formattedString = ''
  const baseURL = `${repoURL}/blob/${pullRequestHeadRef}/`

  const getFormattedName = (fileName: String): String => {
    return `[${fileName}](${baseURL}${fileName})`
  }

  for (const file of files) {
    const fileNodeIncomingEdges =
      graph.getNode(file.filename)?.incomingEdges || new Set()

    if (fileNodeIncomingEdges.size === 0) continue

    // output file title
    formattedString += `### ${
      file.status === 'modified' ? 'Changes in' : 'Removal of'
    } ${getFormattedName(file.filename)} may affect:\n`

    // go through files which list the modified file as a dependency
    for (const dependency of fileNodeIncomingEdges) {
      formattedString += `- ${getFormattedName(dependency)}\n`
      numAffectedFiles += 1

      // check if this file is an index file. If so, search for all files
      // which depend on it and add them to the list
      if (indexFileRegex.test(dependency)) {
        const indexFileIncomingEdges =
          graph.getNode(dependency)?.incomingEdges || new Set()
        numAffectedFiles += indexFileIncomingEdges.size
        // @ts-ignore
        formattedString = Array.from(indexFileIncomingEdges).reduce(
          // @ts-ignore
          (prev, cur) => `${prev}- ${getFormattedName(cur)}\n`,
          formattedString
        )
      }
    }
  }

  return `# Affected Files\n- Total Affected File(s): ${numAffectedFiles}\n---\n${formattedString}\n`
}
