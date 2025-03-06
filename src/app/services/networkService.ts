import { DependencyNetwork, NetworkNode } from '../types';

/**
 * Fetch supply chain network data from the API
 */
export async function getDependencyNetwork(): Promise<DependencyNetwork> {
  try {
    const response = await fetch('/api/network');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch network data');
    }
    
    return data.network;
  } catch (error) {
    console.error('Error fetching dependency network:', error);
    throw error;
  }
}

/**
 * Fetch a single node by ID
 */
export async function getNetworkNode(id: string): Promise<NetworkNode | null> {
  try {
    const response = await fetch(`/api/network/node/${encodeURIComponent(id)}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch network node');
    }
    
    return data.node;
  } catch (error) {
    console.error(`Error fetching network node ${id}:`, error);
    return null;
  }
}

/**
 * Filter the network to show only connections related to a specific node
 * @param network The full network data
 * @param nodeId The ID of the node to filter around
 * @param upstreamLevels Number of levels upstream (who the node provides to)
 * @param downstreamLevels Number of levels downstream (who provides to the node)
 * @returns Filtered network
 */
export function filterNetworkByNode(
  network: DependencyNetwork,
  nodeId: string,
  upstreamLevels: number = 1,
  downstreamLevels: number = 3
): DependencyNetwork {
  console.log(`Filtering network with upstreamLevels=${upstreamLevels}, downstreamLevels=${downstreamLevels}`);
  
  if (!nodeId || !network.nodes.length) {
    return network;
  }

  // Find the node in the network
  const targetNode = network.nodes.find(node => node.id === nodeId);
  if (!targetNode) {
    return network;
  }

  // Create sets to track nodes to include
  const includedNodeIds = new Set<string>();
  includedNodeIds.add(nodeId);

  // Track nodes we've already processed to avoid infinite loops
  const processedNodes = new Set<string>();

  // Recursive function to find upstream connections up to a certain depth
  function findUpstream(currentNodeId: string, currentDepth: number, maxDepth: number) {
    // Stop if we've reached the max depth or if we've already processed this node
    if (currentDepth >= maxDepth || processedNodes.has(currentNodeId)) {
      return;
    }

    // Mark this node as processed to avoid cycles
    processedNodes.add(currentNodeId);
    
    // Find all links where this node is the source
    // These are nodes that our current node provides to
    network.links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;

      // If our current node is providing to someone
      if (sourceId === currentNodeId) {
        // Add the target to our included nodes
        includedNodeIds.add(targetId);
        // Recursively find targets of this target
        findUpstream(targetId, currentDepth + 1, maxDepth);
      }
    });
  }

  // Recursive function to find downstream connections up to a certain depth
  function findDownstream(currentNodeId: string, currentDepth: number, maxDepth: number) {
    // Stop if we've reached the max depth or if we've already processed this node
    if (currentDepth >= maxDepth || processedNodes.has(currentNodeId)) {
      return;
    }

    // Mark this node as processed to avoid cycles
    processedNodes.add(currentNodeId);
    
    // Find all links where this node is the target
    // These are nodes that provide to our current node
    network.links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;

      // If someone is providing to our current node
      if (targetId === currentNodeId) {
        // Add the provider to our included nodes
        includedNodeIds.add(sourceId);
        // Recursively find providers to this provider
        findDownstream(sourceId, currentDepth + 1, maxDepth);
      }
    });
  }

  // Reset processed nodes before each traversal to ensure proper depth calculation
  processedNodes.clear();
  
  // Start the recursive search for upstream connections
  if (upstreamLevels > 0) {
    findUpstream(nodeId, 0, upstreamLevels);
  }
  
  // Reset processed nodes before downstream traversal
  processedNodes.clear();
  
  // Start the recursive search for downstream connections
  if (downstreamLevels > 0) {
    findDownstream(nodeId, 0, downstreamLevels);
  }

  // Filter nodes and links based on our sets of included nodes
  const filteredNodes = network.nodes.filter(node => includedNodeIds.has(node.id));
  
  const filteredLinks = network.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    return includedNodeIds.has(sourceId) && includedNodeIds.has(targetId);
  });

  console.log(`Filtered network: ${filteredNodes.length} nodes, ${filteredLinks.length} links`);
  
  return {
    nodes: filteredNodes,
    links: filteredLinks
  };
}