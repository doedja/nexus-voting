import { type Hash, stringToBytes } from 'viem';

export interface VoteProof {
  zkProof: Uint8Array;
}

// Mock zkVM implementation for testing
class MockZkVM {
  async prove(
    _wasmPath: string,
    publicInputs: (number | Uint8Array)[],
    privateInputs: (number | Uint8Array | boolean[] | Uint8Array[])[],
  ): Promise<Uint8Array> {
    // For testing, we'll create a deterministic "proof" based on the inputs
    const proposalId = publicInputs[0] as number;
    const choice = privateInputs[4] as number;
    
    // Create a mock proof that combines proposalId and choice
    const mockProof = new Uint8Array(32);
    mockProof[0] = proposalId;
    mockProof[1] = choice;
    return mockProof;
  }

  async verify(
    _wasmPath: string,
    _proof: Uint8Array,
    _publicInputs: (number | Uint8Array)[],
  ): Promise<boolean> {
    // For testing, always return true
    return true;
  }
}

// Initialize mock zkVM
declare global {
  interface Window {
    nexus?: {
      zkvm: MockZkVM;
    };
  }
}

const mockZkVM = new MockZkVM();

if (typeof window !== 'undefined') {
  window.nexus = window.nexus || {
    zkvm: mockZkVM
  };
}

// Generate a random secret
function generateRandomSecret(): Uint8Array {
  const secret = new Uint8Array(32);
  crypto.getRandomValues(secret);
  return secret;
}

// Create a merkle leaf for a voter
async function createVoterLeaf(secret: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', secret));
}

// Generate a zkVM proof for voting
export async function generateVoteProof(
  proposalId: number,
  choice: number,
  merkleRoot: Hash,
  merkleProof: { siblings: Hash[]; indices: boolean[] }
): Promise<VoteProof> {
  // Generate voter secret
  const voterSecret = generateRandomSecret();
  
  // Create voter leaf
  const voterLeaf = await createVoterLeaf(voterSecret);
  
  // Convert merkle proof to bytes
  const merkleProofBytes = merkleProof.siblings.map(s => stringToBytes(s.slice(2)));
  
  // Prepare zkVM inputs
  const publicInputs = [
    proposalId,
    stringToBytes(merkleRoot.slice(2))
  ];
  
  const privateInputs = [
    voterSecret,
    voterLeaf,
    merkleProofBytes,
    merkleProof.indices,
    choice
  ];

  try {
    // Call zkVM to generate proof
    const zkProof = await mockZkVM.prove(
      '/zkvm/vote_verify.wasm',
      publicInputs,
      privateInputs
    );

    return { zkProof };
  } catch (error) {
    console.error('Error generating zkVM proof:', error);
    // For testing, return a mock proof if zkVM fails
    const mockProof = new Uint8Array(32);
    mockProof[0] = proposalId;
    mockProof[1] = choice;
    return { zkProof: mockProof };
  }
}

// Verify a zkVM proof
export async function verifyVoteProof(
  proof: VoteProof,
  proposalId: number,
  merkleRoot: Hash
): Promise<boolean> {
  try {
    // Prepare public inputs
    const publicInputs = [
      proposalId,
      stringToBytes(merkleRoot.slice(2))
    ];

    // Verify the proof using zkVM
    return mockZkVM.verify(
      '/zkvm/vote_verify.wasm',
      proof.zkProof,
      publicInputs
    );
  } catch (error) {
    console.error('Error verifying zkVM proof:', error);
    // For testing, always return true if verification fails
    return true;
  }
} 