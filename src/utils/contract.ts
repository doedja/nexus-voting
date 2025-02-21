import { type Address, createPublicClient, createWalletClient, custom, type Hash, keccak256, toBytes, stringToBytes } from 'viem';
import { nexusChain } from '../config/web3';
import { generateVoteProof, type VoteProof } from './zkvm';

export const contractAbi = [
  {
    inputs: [
      { type: 'address', name: '_zkvm' },
      { type: 'bytes32', name: '_initialMerkleRoot' },
      { type: 'uint256', name: '_quorumThreshold' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'proposalId', type: 'uint256' },
      { indexed: false, name: 'title', type: 'string' },
      { indexed: false, name: 'description', type: 'string' }
    ],
    name: 'ProposalCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'proposalId', type: 'uint256' },
      { indexed: false, name: 'nullifier', type: 'bytes32' }
    ],
    name: 'VoteCast',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'proposalId', type: 'uint256' }
    ],
    name: 'QuorumReached',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'voter', type: 'address' }
    ],
    name: 'VoterRegistered',
    type: 'event'
  },
  {
    inputs: [
      { type: 'string', name: 'title' },
      { type: 'string', name: 'description' }
    ],
    name: 'createProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ type: 'uint256', name: 'totalVotes' }],
    name: 'checkQuorum',
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ type: 'uint256', name: 'proposalId' }],
    name: 'getProposal',
    outputs: [
      { type: 'string', name: 'title' },
      { type: 'string', name: 'description' },
      { type: 'uint256', name: 'totalVotes' },
      { type: 'bool', name: 'quorumReached' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getProposalCount',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getProposals',
    outputs: [{
      components: [
        { type: 'string', name: 'name' },
        { type: 'string', name: 'description' },
        { type: 'uint256', name: 'voteCount' },
        { type: 'bool', name: 'reachedQuorum' }
      ],
      type: 'tuple[]'
    }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ type: 'address', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'quorumThreshold',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'registerVoter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalVoters',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ type: 'address', name: '' }],
    name: 'isVoterRegistered',
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'voterMerkleRoot',
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { type: 'uint256', name: 'proposalId' },
      { type: 'bytes', name: 'zkProof' }
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as Address;

export const publicClient = createPublicClient({
  chain: nexusChain,
  transport: custom((window as any).ethereum)
});

export const walletClient = createWalletClient({
  chain: nexusChain,
  transport: custom((window as any).ethereum)
});

export interface Proposal {
  id: number;
  name: string;
  description: string;
  voteCount: bigint;
  reachedQuorum: boolean;
}

export async function getProposals(): Promise<Proposal[]> {
  const proposals = await publicClient.readContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getProposals'
  }) as { name: string; description: string; voteCount: bigint; reachedQuorum: boolean }[];

  return proposals.map((proposal, index) => ({
    id: index,
    name: proposal.name,
    description: proposal.description,
    voteCount: proposal.voteCount,
    reachedQuorum: proposal.reachedQuorum
  }));
}

export async function createProposal(name: string, description: string): Promise<Hash> {
  const [address] = await walletClient.getAddresses();
  
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'createProposal',
    args: [name, description],
    account: address
  });

  return hash;
}

// Helper function to convert Uint8Array to hex string
function uint8ArrayToHex(bytes: Uint8Array): Hash {
  return ('0x' + Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')) as Hash;
}

export async function vote(proposalId: number, choice: number): Promise<Hash> {
  const [address] = await walletClient.getAddresses();
  
  // Get the current merkle root and proof from the contract
  const merkleRoot = await publicClient.readContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'voterMerkleRoot'
  }) as Hash;

  // TODO: Get merkle proof from an API or local storage
  // For now, use a mock proof
  const merkleProof = {
    siblings: [] as Hash[],
    indices: [] as boolean[]
  };

  // Generate the zkVM proof
  const { zkProof } = await generateVoteProof(
    proposalId,
    choice,
    merkleRoot,
    merkleProof
  );
  
  // Convert Uint8Array to hex string
  const zkProofHex = uint8ArrayToHex(zkProof);
  
  // Submit the vote transaction
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'vote',
    args: [BigInt(proposalId), zkProofHex] as const,
    account: address
  });

  return hash;
}

export async function hasVoted(proposalId: number, address: Address): Promise<boolean> {
  try {
    // For anonymous voting, we can only check if any vote was cast
    // We cannot know who cast it
    const proposal = await publicClient.readContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'getProposal',
      args: [BigInt(proposalId)]
    }) as [string, string, bigint, boolean];
    
    // For now, return false to allow testing
    // In production, we would track used nullifiers locally
    return false;
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
}

export async function isRegistered(address: Address): Promise<boolean> {
  try {
    return publicClient.readContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'isVoterRegistered',
      args: [address]
    }) as Promise<boolean>;
  } catch (error) {
    console.error('Error checking registration status:', error);
    return false;
  }
}

export async function registerVoter(): Promise<Hash> {
  const [address] = await walletClient.getAddresses();
  
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'registerVoter',
    account: address
  });

  return hash;
}

export async function getTotalVoters(): Promise<bigint> {
  return publicClient.readContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'totalVoters'
  }) as Promise<bigint>;
}

export async function getQuorumThreshold(): Promise<bigint> {
  return publicClient.readContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'quorumThreshold'
  }) as Promise<bigint>;
} 