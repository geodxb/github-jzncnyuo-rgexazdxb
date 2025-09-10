import { useState, useEffect } from 'react';
import { WithdrawalFlagService } from '../../services/withdrawalFlagService';
import { WithdrawalFlag } from '../../types/withdrawal';
import { 
  Flag, 
  AlertTriangle, 
  Eye, 
  FileText, 
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';

interface FlagRequestsSectionProps {
  onApprove: (flagId: string, comment?: string) => void;
  onReject: (flagId: string, comment: string) => void;
  isLoading: string;
}

const FlagRequestsSection = ({ onApprove, onReject, isLoading }: FlagRequestsSectionProps) => {
  const [pendingFlags, setPendingFlags] = useState<WithdrawalFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingFlags();
  }, []);

  const loadPendingFlags = async () => {
    try {
      const flags = await WithdrawalFlagService.getPendingFlagRequests();
      setPendingFlags(flags);
    } catch (error) {
      console.error('Error loading pending flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFlagTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle size={16} className="text-red-600" />;
      case 'suspicious': return <Eye size={16} className="text-amber-600" />;
      case 'high_amount': return <FileText size={16} className="text-purple-600" />;
      case 'documentation_required': return <FileText size={16} className="text-blue-600" />;
      case 'compliance_review': return <Shield size={16} className="text-indigo-600" />;
      default: return <Flag size={16} className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-300 mb-8">
        <div className="px-6 py-4 border-b border-gray-300 bg-yellow-50">
          <h3 className="text-lg font-bold text-yellow-900 uppercase tracking-wide">
            PENDING FLAG REQUESTS
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold uppercase tracking-wide">LOADING FLAG REQUESTS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 mb-8">
      <div className="px-6 py-4 border-b border-gray-300 bg-yellow-50">
        <h3 className="text-lg font-bold text-yellow-900 uppercase tracking-wide">
          PENDING FLAG REQUESTS ({pendingFlags.length} AWAITING REVIEW)
        </h3>
      </div>
      
      {pendingFlags.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">REQUEST</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">WITHDRAWAL</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">FLAG TYPE</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wide">PRIORITY</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">REASON</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">REQUESTED BY</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wide">GOVERNOR DECISION</th>
              </tr>
            </thead>
            <tbody>
              {pendingFlags.map((flag) => (
                <tr key={flag.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900 uppercase tracking-wide">#{flag.id.slice(-8)}</p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">
                        REQUESTED: {flag.requestedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900 uppercase tracking-wide">#{flag.withdrawalId.slice(-8)}</p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">WITHDRAWAL REQUEST</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getFlagTypeIcon(flag.flagType)}
                      <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        {flag.flagType.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-xs font-bold border uppercase tracking-wide ${getPriorityColor(flag.priority)}`}>
                      {flag.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 max-w-xs">{flag.comment}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900 uppercase tracking-wide">{flag.requestedByName}</p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">{flag.requestedByRole}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => {
                          const comment = prompt(`APPROVE FLAG REQUEST?\n\nFlag Type: ${flag.flagType.replace('_', ' ').toUpperCase()}\nPriority: ${flag.priority.toUpperCase()}\nReason: ${flag.comment}\n\nEnter approval comment (optional):`);
                          if (comment !== null) { // null means cancelled, empty string is valid
                            onApprove(flag.id, comment || undefined);
                          }
                        }}
                        disabled={isLoading === flag.id}
                        className="px-2 py-1 bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors disabled:opacity-50 uppercase tracking-wide border border-green-700"
                      >
                        {isLoading === flag.id ? 'APPROVING...' : 'APPROVE FLAG'}
                      </button>
                      <button
                        onClick={() => {
                          const comment = prompt(`REJECT FLAG REQUEST?\n\nFlag Type: ${flag.flagType.replace('_', ' ').toUpperCase()}\nPriority: ${flag.priority.toUpperCase()}\nReason: ${flag.comment}\n\nEnter rejection reason:`);
                          if (comment) {
                            onReject(flag.id, comment);
                          }
                        }}
                        disabled={isLoading === flag.id}
                        className="px-2 py-1 bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50 uppercase tracking-wide border border-red-700"
                      >
                        {isLoading === flag.id ? 'REJECTING...' : 'REJECT REQUEST'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-100 border border-yellow-300 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Flag size={32} className="text-yellow-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">NO PENDING FLAG REQUESTS</h3>
          <p className="text-gray-500 uppercase tracking-wide text-sm">All flag requests have been reviewed</p>
        </div>
      )}
    </div>
  );
};

export default FlagRequestsSection;