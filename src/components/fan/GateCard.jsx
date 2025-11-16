import { Link } from 'react-router-dom';

export const GateCard = ({ gate }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-green-500';
      case 'closed':
        return 'bg-red-500';
      case 'busy':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Link
      to={`/fan/gates/${gate.gateId}`}
      className="block p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">{gate.name || `Gate ${gate.gateId}`}</h3>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(gate.status)}`} />
      </div>
      <p className="text-white/70 text-sm">
        Status: {gate.status || 'Unknown'}
      </p>
      {gate.queueLength !== undefined && (
        <p className="text-white/70 text-sm mt-1">
          Queue: {gate.queueLength} people
        </p>
      )}
    </Link>
  );
};

