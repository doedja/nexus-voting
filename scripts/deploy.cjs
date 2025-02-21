const hre = require("hardhat");

async function main() {
  console.log("Deploying Voting contract...");

  // Get the zkVM address from environment or use a default test address
  const zkvmAddress = process.env.NEXUS_ZKVM_ADDRESS || "0x1234567890123456789012345678901234567890";
  
  // Initial merkle root (empty tree root)
  const initialMerkleRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
  
  // Deploy with 50% quorum threshold
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(zkvmAddress, initialMerkleRoot, 50);

  // Wait for deployment to complete
  await voting.waitForDeployment();
  
  const address = await voting.getAddress();
  console.log("Voting contract deployed to:", address);

  // Create initial proposals
  console.log("Creating initial proposals...");
  
  await voting.createProposal(
    "Community Development Fund Allocation",
    "Proposal to allocate 10% of treasury funds for community development initiatives"
  );

  await voting.createProposal(
    "Protocol Upgrade Strategy",
    "Proposal to implement automatic protocol upgrades with 7-day timelock"
  );

  console.log("Initial proposals created");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 