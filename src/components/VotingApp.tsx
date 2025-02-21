import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { vote, registerVoter, getTotalVoters, getProposals, hasVoted, isRegistered } from '../utils/contract';
import { ProposalCard } from './ProposalCard';
import { TransactionModal } from './TransactionModal';
import { publicClient } from '../utils/contract';
import { formatEther } from 'viem';

interface Choice {
  id: number;
  name: string;
  description: string;
  voteCount: number;
}

interface Proposal {
  id: number;
  title: string;
  description: string;
  voteCount: number;
  reachedQuorum: boolean;
}

const ALLOW_MULTIPLE_VOTES = import.meta.env.VITE_ALLOW_MULTIPLE_VOTES === 'true';

export default function VotingApp() {
  const { isConnected, address } = useAccount();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<Record<number, number>>({});
  const [votedProposals, setVotedProposals] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [activeProposalId, setActiveProposalId] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [totalVoters, setTotalVoters] = useState<number>(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [balance, setBalance] = useState<string>('0');

  // Fetch initial data
  useEffect(() => {
    if (isConnected && address) {
      fetchData();
      checkRegistrationStatus();
    }
  }, [isConnected, address]);

  // Refresh data periodically
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [isConnected]);

  // Fetch balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;
      try {
        const balance = await publicClient.getBalance({ address });
        setBalance(parseFloat(formatEther(balance)).toFixed(2));
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('0.00');
      }
    };

    if (isConnected && address) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, address]);

  const checkRegistrationStatus = async () => {
    if (!address) return;
    try {
      const registered = await isRegistered(address);
      console.log('Registration status:', registered);
      setIsUserRegistered(registered);
    } catch (error) {
      console.error('Error checking registration status:', error);
      setIsUserRegistered(false);
    }
  };

  const fetchData = async () => {
    try {
      const [proposalsData, votersCount] = await Promise.all([
        getProposals(),
        getTotalVoters()
      ]);

      // Create a new Set to track voted proposals
      const voted = new Set<number>();
      
      // Check each proposal if the user has voted
      if (address) {
        await Promise.all(proposalsData.map(async (p) => {
          const hasUserVoted = await hasVoted(p.id, address);
          if (hasUserVoted) {
            voted.add(p.id);
          }
        }));
      }

      setVotedProposals(voted);
      setProposals(proposalsData.map(p => ({
        id: p.id,
        title: p.name,
        description: p.description,
        voteCount: Number(p.voteCount),
        reachedQuorum: p.reachedQuorum
      })));
      setTotalVoters(Number(votersCount));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleRegisterVoter = async () => {
    if (isUserRegistered || isRegistering) return;

    setIsRegistering(true);
    try {
      const hash = await registerVoter();
      setTxHash(hash);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for transaction to be mined
      await checkRegistrationStatus(); // Check registration status again
      await fetchData(); // Refresh data after registration
    } catch (error) {
      console.error('Error registering voter:', error);
    }
    setIsRegistering(false);
  };

  const handleSelectChoice = (proposalId: number, choiceId: number) => {
    if (!isUserRegistered) {
      console.log('Cannot select choice: Not registered');
      return;
    }
    
    setSelectedChoices(prev => ({
      ...prev,
      [proposalId]: choiceId
    }));
  };

  const handleVote = async (proposalId: number) => {
    if (!isUserRegistered) {
      console.log('Cannot vote: Not registered');
      return;
    }

    const choiceId = selectedChoices[proposalId];
    if (choiceId === undefined) {
      console.log('No choice selected');
      return;
    }

    setIsLoading(true);
    setActiveProposalId(proposalId);
    try {
      const hash = await vote(proposalId, choiceId);
      setTxHash(hash);
      
      // Add to voted proposals immediately
      setVotedProposals(prev => new Set([...prev, proposalId]));
      
      // Clear the selected choice
      setSelectedChoices(prev => {
        const newChoices = { ...prev };
        delete newChoices[proposalId];
        return newChoices;
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for transaction to be mined
      await fetchData(); // Refresh data after voting
    } catch (error) {
      console.error('Error voting:', error);
    }
    setIsLoading(false);
    setActiveProposalId(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-start mb-12">
          <div className="w-full flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <img src="/nexus-vote.svg" alt="Nexus Vote" className="w-12 h-12" />
              <h1 className="text-[32px] font-bold text-gray-900">
                Nexus Vote
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {isConnected && (
                <div className="flex items-center gap-2 bg-[#EEF2FF] px-3 py-1.5 rounded-lg">
                  <svg className="w-5 h-5 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM17 16v1a2 2 0 01-2 2H9a2 2 0 01-2-2v-1m2-4h8M9 12h8m-8 0a3 3 0 01-3-3V6a3 3 0 013-3h8a3 3 0 013 3v3a3 3 0 01-3 3" />
                  </svg>
                  <span className="text-[#4F46E5] font-medium">{balance} NEX</span>
                </div>
              )}
              <ConnectButton 
                accountStatus="address"
                chainStatus="none"
                showBalance={false}
              />
            </div>
          </div>
          <p className="text-[18px] text-gray-600">
            Participate in anonymous community governance with zero-knowledge proofs
          </p>
          {isConnected && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-2 text-[#4F46E5]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Total Registered Voters: {totalVoters}</span>
              </div>
              <button
                onClick={handleRegisterVoter}
                disabled={isRegistering || isUserRegistered}
                className="ml-4 px-6 py-2.5 rounded-lg font-medium text-base bg-[#4F46E5] text-white hover:bg-[#4338CA] disabled:bg-gray-200 disabled:text-gray-500 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {isRegistering ? 'Registering...' : isUserRegistered ? 'Already Registered' : 'Register as Voter'}
              </button>
            </div>
          )}
        </div>

        {isConnected ? (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                {...proposal}
                selectedChoice={selectedChoices[proposal.id] ?? null}
                onSelectChoice={handleSelectChoice}
                onVote={() => handleVote(proposal.id)}
                isLoading={isLoading && activeProposalId === proposal.id}
                hasVoted={votedProposals.has(proposal.id)}
                totalVoters={totalVoters}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-[#EEF2FF] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7m-6 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Connect Your Wallet</h2>
            <p className="text-gray-600 max-w-md mx-auto text-lg">
              Connect your wallet to participate in anonymous community voting and make your voice heard
            </p>
          </div>
        )}
      </div>

      {txHash && (
        <TransactionModal
          hash={txHash}
          onClose={() => setTxHash(null)}
        />
      )}
    </div>
  );
} 