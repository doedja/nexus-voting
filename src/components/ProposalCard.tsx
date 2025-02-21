interface ProposalCardProps {
  id: number;
  title: string;
  description: string;
  voteCount: number;
  reachedQuorum: boolean;
  selectedChoice: number | null;
  onSelectChoice: (proposalId: number, choiceId: number) => void;
  onVote: () => Promise<void>;
  isLoading: boolean;
  hasVoted: boolean;
  totalVoters: number;
}

export function ProposalCard({
  id,
  title,
  description,
  voteCount,
  reachedQuorum,
  selectedChoice,
  onSelectChoice,
  onVote,
  isLoading,
  hasVoted,
  totalVoters
}: ProposalCardProps) {
  const participationRate = totalVoters > 0 ? (voteCount / totalVoters) * 100 : 0;
  const canVote = selectedChoice !== null && !isLoading && !hasVoted;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
        {reachedQuorum && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Quorum Reached
          </span>
        )}
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Participation Rate</span>
          <span className="text-sm font-medium text-gray-900">{participationRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#4F46E5] h-2 rounded-full"
            style={{ width: `${Math.min(participationRate, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {!hasVoted ? (
          <>
            <div 
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedChoice === 0 
                  ? 'bg-[#EEF2FF] border-2 border-[#4F46E5]' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => onSelectChoice(id, 0)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">For</h4>
                  <p className="text-sm text-gray-600">Vote in favor of this proposal</p>
                </div>
                <div className="h-5 w-5 rounded-full border-2 border-[#4F46E5] flex items-center justify-center">
                  {selectedChoice === 0 && (
                    <div className="h-3 w-3 rounded-full bg-[#4F46E5]" />
                  )}
                </div>
              </div>
            </div>

            <div 
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedChoice === 1 
                  ? 'bg-[#EEF2FF] border-2 border-[#4F46E5]' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => onSelectChoice(id, 1)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Against</h4>
                  <p className="text-sm text-gray-600">Vote against this proposal</p>
                </div>
                <div className="h-5 w-5 rounded-full border-2 border-[#4F46E5] flex items-center justify-center">
                  {selectedChoice === 1 && (
                    <div className="h-3 w-3 rounded-full bg-[#4F46E5]" />
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onVote}
              disabled={!canVote}
              className={`w-full px-6 py-3 rounded-lg font-medium text-base ${
                canVote 
                  ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              } transition-colors`}
            >
              {isLoading ? 'Casting Vote...' : 'Cast Vote'}
            </button>
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>You have already voted on this proposal</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 