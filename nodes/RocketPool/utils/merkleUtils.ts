/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers } from 'ethers';

/**
 * Merkle tree utility functions for Rocket Pool rewards
 *
 * Rocket Pool uses Merkle trees to efficiently distribute rewards.
 * Each node operator's rewards are included as a leaf in the tree,
 * and they claim by providing a Merkle proof.
 */

/**
 * Merkle leaf data structure
 */
export interface MerkleLeaf {
  nodeAddress: string;
  network: number;
  trustedNodeRPL: string;
  collateralRPL: string;
  smoothingPoolETH: string;
}

/**
 * Merkle proof structure
 */
export interface MerkleProof {
  leaf: string;
  proof: string[];
  root: string;
}

/**
 * Hash a Merkle leaf
 *
 * @param leaf - Leaf data
 * @returns Leaf hash
 */
export function hashLeaf(leaf: MerkleLeaf): string {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
    [
      leaf.nodeAddress,
      leaf.network,
      leaf.trustedNodeRPL,
      leaf.collateralRPL,
      leaf.smoothingPoolETH,
    ],
  );
  return ethers.keccak256(encoded);
}

/**
 * Hash two sibling nodes
 *
 * @param left - Left hash
 * @param right - Right hash
 * @returns Parent hash
 */
export function hashPair(left: string, right: string): string {
  // Sort to ensure consistent ordering
  const [a, b] = left < right ? [left, right] : [right, left];
  return ethers.keccak256(ethers.concat([a, b]));
}

/**
 * Verify a Merkle proof
 *
 * @param leafHash - Hash of the leaf
 * @param proof - Array of sibling hashes
 * @param root - Merkle root
 * @returns True if proof is valid
 */
export function verifyProof(leafHash: string, proof: string[], root: string): boolean {
  let computedHash = leafHash;

  for (const proofElement of proof) {
    computedHash = hashPair(computedHash, proofElement);
  }

  return computedHash.toLowerCase() === root.toLowerCase();
}

/**
 * Verify a Merkle proof for a leaf
 *
 * @param leaf - Leaf data
 * @param proof - Array of sibling hashes
 * @param root - Merkle root
 * @returns True if proof is valid
 */
export function verifyLeafProof(leaf: MerkleLeaf, proof: string[], root: string): boolean {
  const leafHash = hashLeaf(leaf);
  return verifyProof(leafHash, proof, root);
}

/**
 * Build a Merkle tree from leaves
 *
 * @param leaves - Array of leaf hashes
 * @returns Tree layers and root
 */
export function buildMerkleTree(leaves: string[]): {
  layers: string[][];
  root: string;
} {
  if (leaves.length === 0) {
    throw new Error('Cannot build Merkle tree from empty leaves');
  }

  // Sort leaves for consistent ordering
  const sortedLeaves = [...leaves].sort();

  // Build tree layers
  const layers: string[][] = [sortedLeaves];

  while (layers[layers.length - 1].length > 1) {
    const currentLayer = layers[layers.length - 1];
    const nextLayer: string[] = [];

    for (let i = 0; i < currentLayer.length; i += 2) {
      if (i + 1 < currentLayer.length) {
        nextLayer.push(hashPair(currentLayer[i], currentLayer[i + 1]));
      } else {
        // Odd number of elements - promote to next layer
        nextLayer.push(currentLayer[i]);
      }
    }

    layers.push(nextLayer);
  }

  return {
    layers,
    root: layers[layers.length - 1][0],
  };
}

/**
 * Get Merkle proof for a leaf
 *
 * @param leafHash - Hash of the target leaf
 * @param layers - Tree layers from buildMerkleTree
 * @returns Proof array or null if leaf not found
 */
export function getProofFromLayers(leafHash: string, layers: string[][]): string[] | null {
  if (layers.length === 0) {
    return null;
  }

  let index = layers[0].findIndex((l) => l.toLowerCase() === leafHash.toLowerCase());
  if (index === -1) {
    return null;
  }

  const proof: string[] = [];

  for (let i = 0; i < layers.length - 1; i++) {
    const layer = layers[i];
    const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;

    if (siblingIndex < layer.length) {
      proof.push(layer[siblingIndex]);
    }

    index = Math.floor(index / 2);
  }

  return proof;
}

/**
 * Calculate the depth of a Merkle tree
 *
 * @param leafCount - Number of leaves
 * @returns Tree depth
 */
export function calculateTreeDepth(leafCount: number): number {
  if (leafCount === 0) return 0;
  return Math.ceil(Math.log2(leafCount));
}

/**
 * Validate Merkle root format
 *
 * @param root - Merkle root string
 * @returns True if valid 32-byte hex string
 */
export function isValidMerkleRoot(root: string): boolean {
  if (!root.startsWith('0x')) {
    return false;
  }
  if (root.length !== 66) {
    return false;
  }
  return /^0x[0-9a-fA-F]{64}$/.test(root);
}

/**
 * Format proof for contract call
 *
 * @param proof - Array of proof elements
 * @returns Formatted bytes32 array
 */
export function formatProofForContract(proof: string[]): string[] {
  return proof.map((p) => {
    if (!p.startsWith('0x')) {
      return `0x${p}`;
    }
    return p.toLowerCase();
  });
}

/**
 * Parse proof from JSON string
 *
 * @param proofJson - JSON string of proof array
 * @returns Parsed proof array
 */
export function parseProofFromJson(proofJson: string): string[] {
  try {
    const parsed = JSON.parse(proofJson);
    if (!Array.isArray(parsed)) {
      throw new Error('Proof must be an array');
    }
    return parsed.map((p) => {
      if (typeof p !== 'string') {
        throw new Error('Proof elements must be strings');
      }
      return p;
    });
  } catch (error) {
    throw new Error(`Invalid proof JSON: ${(error as Error).message}`);
  }
}

/**
 * Combine multiple proofs (for batch claiming)
 *
 * @param proofs - Array of proof arrays
 * @returns Combined proof structure
 */
export function combineProofs(proofs: string[][]): {
  flatProofs: string[];
  proofLengths: number[];
} {
  const flatProofs: string[] = [];
  const proofLengths: number[] = [];

  for (const proof of proofs) {
    proofLengths.push(proof.length);
    flatProofs.push(...proof);
  }

  return { flatProofs, proofLengths };
}

/**
 * Split combined proofs back into individual proofs
 *
 * @param flatProofs - Flattened proof array
 * @param proofLengths - Array of individual proof lengths
 * @returns Array of proof arrays
 */
export function splitProofs(flatProofs: string[], proofLengths: number[]): string[][] {
  const proofs: string[][] = [];
  let offset = 0;

  for (const length of proofLengths) {
    proofs.push(flatProofs.slice(offset, offset + length));
    offset += length;
  }

  return proofs;
}

/**
 * Calculate proof size in bytes
 *
 * @param proof - Proof array
 * @returns Size in bytes
 */
export function calculateProofSize(proof: string[]): number {
  // Each element is 32 bytes
  return proof.length * 32;
}
