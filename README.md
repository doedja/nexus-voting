# Nexus Voting dApp

A decentralized anonymous voting application built on Nexus using zero-knowledge proofs. This dApp enables community members to participate in governance decisions while maintaining their privacy through zkVM-based anonymous voting.

![Nexus Voting dApp](public/nexus-vote.svg)

## Features

- 🔒 Anonymous voting using Nexus zkVM
- 🌐 Decentralized governance platform
- 👥 Voter registration with privacy preservation
- ⛓️ On-chain vote verification

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Development

- Build: `npm run build`
- Deploy contracts: `npx hardhat run scripts/deploy.ts --network nexus`
- Test: `npm test`

## Contributing

Contributions welcome! Please check out our [Contributing Guide](CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE) for details.
