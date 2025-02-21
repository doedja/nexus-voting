# Nexus Voting dApp

A decentralized anonymous voting application built on Nexus using zero-knowledge proofs. This dApp enables community members to participate in governance decisions while maintaining their privacy through zkVM-based anonymous voting.

![Nexus Voting dApp](public/nexus-vote.svg)

## Features

- 🔒 Anonymous voting using Nexus zkVM
- 🌐 Decentralized governance platform
- 👥 Voter registration with privacy preservation
- ⛓️ On-chain vote verification
- 🔐 Zero-knowledge proof generation and verification
- 💫 Modern, responsive UI built with React and TailwindCSS
- 🌈 RainbowKit wallet integration

## Tech Stack

- Frontend: React + Vite + TypeScript
- Styling: TailwindCSS
- Blockchain Integration: Wagmi + Viem
- Wallet Connection: RainbowKit
- Smart Contracts: Solidity
- Zero-Knowledge Proofs: Nexus zkVM
- Development Environment: Hardhat

## Prerequisites

- Node.js 16+
- npm or yarn
- A web3 wallet (e.g., MetaMask)
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nexus-voting-dapp.git
   cd nexus-voting-dapp
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and add the following variables:
   ```env
   VITE_NEXUS_RPC_URL=your_nexus_rpc_url
   VITE_PRIVATE_KEY=your_private_key_for_deployment
   VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
   VITE_CONTRACT_ADDRESS=your_deployed_contract_address
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Smart Contract Deployment

1. Compile the contracts:
   ```bash
   npx hardhat compile
   ```

2. Deploy to Nexus network:
   ```bash
   npx hardhat run scripts/deploy.ts --network nexus
   ```

3. Update the `VITE_CONTRACT_ADDRESS` in your `.env` file with the deployed contract address.

## Project Structure

```
├── contracts/          # Smart contracts
├── scripts/           # Deployment and test scripts
├── src/
│   ├── components/    # React components
│   ├── config/        # Configuration files
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── test/             # Contract test files
└── zkvm/             # Zero-knowledge proof circuits
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

- Never commit your private keys or API keys to GitHub
- Always use environment variables for sensitive data
- The `.env.example` file should never contain real values

## Acknowledgments

- [Nexus](https://nexus.xyz) - For the zkVM implementation
- [RainbowKit](https://www.rainbowkit.com/) - For the wallet connection UI
- [Wagmi](https://wagmi.sh/) - For the React Hooks
- [Viem](https://viem.sh/) - For the Ethereum library
