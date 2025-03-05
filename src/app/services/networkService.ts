import { DependencyNetwork, NetworkNode, NetworkLink } from '../types';

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