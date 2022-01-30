/**
 * A graph interface.
 * K - the key type
 * V - the value type
 */
interface IGraph<K, V> {
  /**
   * Retrieves a node by name.
   * Returns null if the node doesn't exist.
   * @param name
   */
  getNode(name: K): V | null

  /**
   * Adds a node to the graph
   * @param node
   */
  addNode(node: K): Boolean

  /**
   * Removes a node from the graph
   * @param node
   */
  removeNode(node: K): Boolean

  /**
   * Adds an edge to the graph between two nodes
   * @param from
   * @param to
   */
  addEdge(from: K, to: K): Boolean

  /**
   * Removes an edge from the graph between two nodes
   * @param from
   * @param to
   */
  removeEdge(from: K, to: K): Boolean

  /**
   * @returns an array of all nodes in the graph
   */
  getNodes(): V[]

  /**
   *
   * @returns a string representation of the graph
   */
  toString(): string
}

export default IGraph
