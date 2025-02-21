// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IZkVM {
    function verify(bytes calldata proof) external view returns (bytes32[] memory);
}

contract Voting {
    struct Proposal {
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        mapping(bytes32 => bool) usedNullifiers;
    }

    struct ProposalView {
        string name;
        string description;
        uint256 voteCount;
        bool reachedQuorum;
    }

    address public owner;
    uint256 public quorumThreshold;
    uint256 public totalVoters;
    bytes32 public voterMerkleRoot;
    IZkVM public zkvm;

    mapping(address => bool) public isVoterRegistered;
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    event VoterRegistered(address indexed voter);
    event VoteCast(uint256 indexed proposalId, bytes32 nullifier);
    event MerkleRootUpdated(bytes32 newRoot);
    event ProposalCreated(uint256 proposalId, string name, string description);
    event QuorumReached(uint256 proposalId);

    constructor(
        address _zkvm,
        bytes32 _initialMerkleRoot,
        uint256 _quorumThreshold
    ) {
        owner = msg.sender;
        zkvm = IZkVM(_zkvm);
        voterMerkleRoot = _initialMerkleRoot;
        quorumThreshold = _quorumThreshold;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function updateVoterMerkleRoot(bytes32 newRoot) external onlyOwner {
        voterMerkleRoot = newRoot;
        emit MerkleRootUpdated(newRoot);
    }

    function registerVoter() external {
        require(!isVoterRegistered[msg.sender], "Already registered");
        isVoterRegistered[msg.sender] = true;
        totalVoters++;
        emit VoterRegistered(msg.sender);
    }

    function createProposal(string memory title, string memory description) external onlyOwner {
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.title = title;
        proposal.description = description;
        
        emit ProposalCreated(proposalId, title, description);
    }

    function vote(uint256 proposalId, bytes calldata zkProof) external {
        require(proposalId < proposalCount, "Invalid proposal ID");
        require(isVoterRegistered[msg.sender], "Not registered");

        // Verify zkVM proof and get outputs
        bytes32[] memory outputs = zkvm.verify(zkProof);
        require(outputs.length == 3, "Invalid proof outputs");

        // Extract outputs
        bytes32 merkleRoot = outputs[0];
        bytes32 nullifier = outputs[1];
        uint8 choice = uint8(uint256(outputs[2]));

        // Verify merkle root matches
        require(merkleRoot == voterMerkleRoot, "Invalid merkle root");

        // Verify nullifier not used
        require(!proposals[proposalId].usedNullifiers[nullifier], "Already voted");
        proposals[proposalId].usedNullifiers[nullifier] = true;

        // Record vote
        if (choice == 1) {
            proposals[proposalId].forVotes++;
        } else if (choice == 2) {
            proposals[proposalId].againstVotes++;
        } else {
            revert("Invalid choice");
        }

        emit VoteCast(proposalId, nullifier);

        // Check if quorum is reached
        if (checkQuorum(proposalId)) {
            emit QuorumReached(proposalId);
        }
    }

    function getProposal(uint256 proposalId) external view returns (
        string memory title,
        string memory description,
        uint256 totalVotes,
        bool quorumReached
    ) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[proposalId];
        
        title = proposal.title;
        description = proposal.description;
        totalVotes = proposal.forVotes + proposal.againstVotes;
        quorumReached = checkQuorum(totalVotes);
    }

    function checkQuorum(uint256 totalVotes) public view returns (bool) {
        if (totalVoters == 0) return false;
        return (totalVotes * 100) / totalVoters >= quorumThreshold;
    }

    function getProposalCount() public view returns (uint256) {
        return proposalCount;
    }

    function getProposals() public view returns (ProposalView[] memory) {
        ProposalView[] memory views = new ProposalView[](proposalCount);
        for (uint i = 0; i < proposalCount; i++) {
            views[i] = ProposalView({
                name: proposals[i].title,
                description: proposals[i].description,
                voteCount: proposals[i].forVotes + proposals[i].againstVotes,
                reachedQuorum: checkQuorum(proposals[i].forVotes + proposals[i].againstVotes)
            });
        }
        return views;
    }
} 