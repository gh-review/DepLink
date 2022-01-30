import IGraph from './graph'
import Node from './node'

class DirectedGraph implements IGraph<string, Node> {
  private G: Map<string, Node>

  constructor() {
    this.G = new Map<string, Node>()
  }

  /**
   * Retrieves a node by name.
   * Returns null if the node doesn't exist.
   * @param name
   */
  getNode(name: string): Node | null {
    return this.G.get(name) || null
  }

  /**
   * Adds a node to the graph
   * @param node
   */
  addNode(node: string): Boolean {
    if (this.G.has(node)) {
      return false
    }
    this.G.set(node, new Node(node))
    return true
  }

  /**
   * Removes a node from the graph
   * @param node
   */
  removeNode(node: string): Boolean {
    const nodeNode = this.G.get(node)
    if (!nodeNode) {
      return false
    }

    // remove all edges before deleting the node
    for (const fromNode of nodeNode.incomingEdges) {
      this.removeEdge(fromNode, node)
    }

    for (const toNode of nodeNode.outgoingEdges) {
      this.removeEdge(node, toNode)
    }
    this.G.delete(node)
    return true
  }

  /**
   * Adds an edge to the graph between two nodes
   * @param from
   * @param to
   */
  addEdge(from: string, to: string): Boolean {
    const fromNode = this.G.get(from)
    const toNode = this.G.get(to)

    if (!fromNode || !toNode) {
      return false
    }

    if (fromNode.outgoingEdges.has(to)) {
      return false
    }

    // add edge to from node
    fromNode.outgoingEdges.add(to)

    // add edge to to node
    toNode.incomingEdges.add(from)

    return true
  }

  /**
   * Removes an edge from the graph between two nodes
   * @param from
   * @param to
   */
  removeEdge(from: string, to: string): Boolean {
    const fromNode = this.G.get(from)
    const toNode = this.G.get(to)

    if (!fromNode || !toNode) {
      return false
    }
    const res1 = fromNode.outgoingEdges.delete(to)
    const res2 = toNode.incomingEdges.delete(from)
    return res1 || res2
  }

  /**
   * @returns an array of all nodes in the graph
   */
  getNodes(): Node[] {
    return Array.from(this.G.values())
  }

  /**
   *
   * @returns a string representation of the graph
   */
  toString(): string {
    const object = Object.fromEntries(this.G)
    return JSON.stringify(object)
  }
}

export default DirectedGraph
