interface TransactionModalProps {
  hash: string;
  onClose: () => void;
}

export function TransactionModal({ hash, onClose }: TransactionModalProps) {
  const explorerUrl = `https://explorer.nexus.xyz/tx/${hash}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Transaction Successful!</h3>
          <p className="text-gray-600">Your vote has been recorded on the blockchain</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-gray-600 text-sm mb-2">Transaction Hash:</p>
          <p className="font-mono text-sm break-all">{hash}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg text-center hover:bg-blue-600 transition-colors"
          >
            View on Explorer
          </a>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 