class Node {
  name: string
  outgoingEdges: Set<string>
  incomingEdges: Set<string>
  constructor(name: string) {
    this.name = name
    this.outgoingEdges = new Set<string>()
    this.incomingEdges = new Set<string>()
  }

  /**
   * @param name
   * @returns true if the node has an incoming edge from the given node
   */
  hasIncomingEdge(name: string): boolean {
    return this.incomingEdges.has(name)
  }

  /**
   *
   * @param name
   * @returns true if the node has an outgoing edge from the given node
   */
  hasOutgoingEdge(name: string): boolean {
    return this.outgoingEdges.has(name)
  }

  toString(): string {
    return `name: ${this.name}, outgoingEdges: ${Array.from(
      this.outgoingEdges
    ).join(', ')}, incomingEdges: ${Array.from(this.incomingEdges).join(', ')}`
  }

  toJSON(): Object {
    return {
      name: this.name,
      outgoingEdges: Array.from(this.outgoingEdges),
      incomingEdges: Array.from(this.incomingEdges)
    }
  }
}

export default Node
