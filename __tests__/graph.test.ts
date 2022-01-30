import DirectedGraph from "../src/graph/directed-graph";
import {expect, test} from '@jest/globals'

test ("Add nodes", () => {
    const graph = new DirectedGraph();
    expect(graph.addNode("A")).toBe(true);
    expect(graph.addNode("A")).toBe(false);
    expect(graph.getNode("A")).toBeTruthy;
    expect(graph.getNode("A")?.name).toBe("A");
})

test ("Remove a node with no incoming edges", () => {
    const graph = new DirectedGraph();
    graph.addNode("A");
    graph.addNode("B");
    graph.addNode("C");
    graph.addEdge("A", "B");

    expect(graph.removeNode("A")).toBe(true);
    expect(graph.getNode("A")).toBe(null);
})

test ("Remove a node with incoming edges", () => {
    const graph = new DirectedGraph();
    graph.addNode("A");
    graph.addNode("B");
    graph.addNode("C");
    graph.addEdge("B", "A");
    graph.addEdge("C", "A");

    expect(graph.removeNode("A")).toBe(true);
    expect(graph.getNode("A")).toBe(null);
    expect(graph.getNode("B")?.hasOutgoingEdge("A")).toBe(false);
    expect(graph.getNode("C")?.hasOutgoingEdge("A")).toBe(false);
})

test ("Remove a node with cycle", () => {
    const graph = new DirectedGraph();
    graph.addNode("A");
    graph.addNode("B");
    graph.addEdge("A", "B");
    graph.addEdge("B", "A");
    
    expect(graph.removeNode("A")).toBe(true);
    expect(graph.getNode("A")).toBe(null);
    expect(graph.getNode("B")?.hasOutgoingEdge("A")).toBe(false);
    expect(graph.getNode("B")?.hasIncomingEdge("A")).toBe(false);
})

test ("Remove a node with a self-cycle", () => {
    const graph = new DirectedGraph();
    graph.addNode("A");
    graph.addEdge("A", "A");
    expect(graph.removeNode("A")).toBe(true);
    expect(graph.getNode("A")).toBe(null);
})

test ("Add an edge between two nodes", () => {
    const graph= new DirectedGraph();
    graph.addNode("A");
    graph.addNode("B");
    expect(graph.addEdge("A", "B")).toBe(true);
    expect(graph.getNode("A")?.outgoingEdges.has("B")).toBe(true);
    expect(graph.getNode("B")?.incomingEdges.has("A")).toBe(true);
})

test ("Adding an edge that already exists", () => {
    const graph= new DirectedGraph();
    graph.addNode("A");
    graph.addNode("B");
    graph.addEdge("A", "B");
    expect(graph.addEdge("A", "B")).toBe(false);
    expect(graph.getNode("A")?.outgoingEdges.has("B")).toBe(true);
    expect(graph.getNode("B")?.incomingEdges.has("A")).toBe(true);
})

test ("Remove an existing edge from the graph", () => {
    const graph = new DirectedGraph();
    graph.addNode("A");
    graph.addNode("B");
    graph.addEdge("A", "B");
    expect(graph.removeEdge("A", "B")).toBe(true);
    expect(graph.getNode("A")?.outgoingEdges.has("B")).toBe(false);
    expect(graph.getNode("B")?.incomingEdges.has("A")).toBe(false);
})

test ("Graph implementation", () => {
    // Graph from https://www.techiedelight.com/eulerian-path-directed-graph/

    const graph = new DirectedGraph();
    graph.addNode("0");
    graph.addNode("1");
    graph.addNode("2");
    graph.addNode("3");
    graph.addNode("4");
    graph.addNode("5");

    graph.addEdge("0", "1");
    graph.addEdge("0", "5");

    graph.addEdge("1", "2");
    graph.addEdge("1", "4");

    graph.addEdge("2", "3");

    graph.addEdge("3", "0");
    graph.addEdge("3", "1");

    graph.addEdge("4", "3");

    graph.addEdge("5", "4");

    expect(graph.getNode("2")).toBeTruthy();
    expect(graph.getNode("3")).toBeTruthy();

    expect(graph.getNode("0")?.outgoingEdges.has("1")).toBe(true);
    expect(graph.getNode("0")?.outgoingEdges.has("5")).toBe(true);
    expect(graph.getNode("0")?.incomingEdges.has("3")).toBe(true);
    expect (graph.getNode("4")?.outgoingEdges.has("3")).toBe(true);

    graph.removeEdge("0", "1");
    expect(graph.getNode("0")?.outgoingEdges.has("1")).toBe(false);
    expect(graph.getNode("1")?.incomingEdges.has("0")).toBe(false);
    expect(graph.getNode("0")?.outgoingEdges.has("5")).toBe(true);

    graph.removeEdge("1", "4");
    expect(graph.getNode("1")?.outgoingEdges.has("4")).toBe(false);
    expect(graph.getNode("4")?.incomingEdges.has("1")).toBe(false);

    graph.removeNode("3");
    expect(graph.getNode("3")).toBe(null);
    expect(graph.getNode("0")?.incomingEdges.has("3")).toBe(false);
    expect(graph.getNode("4")?.outgoingEdges.has("3")).toBe(false);
    expect(graph.getNode("1")?.incomingEdges.has("3")).toBe(false);
    expect(graph.getNode("2")?.outgoingEdges.has("3")).toBe(false);
})

