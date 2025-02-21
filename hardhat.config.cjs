require("@nomicfoundation/hardhat-ethers");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    nexus: {
      url: process.env.NEXUS_RPC_URL || "https://rpc.nexus.xyz/http",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 392
    }
  }
};
