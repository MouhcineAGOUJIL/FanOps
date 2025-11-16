export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <h3 className="text-white/70 text-sm mb-2">Total Gates</h3>
          <p className="text-3xl font-bold text-white">-</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <h3 className="text-white/70 text-sm mb-2">Active Visitors</h3>
          <p className="text-3xl font-bold text-white">-</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <h3 className="text-white/70 text-sm mb-2">Queue Length</h3>
          <p className="text-3xl font-bold text-white">-</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <h3 className="text-white/70 text-sm mb-2">Avg Wait Time</h3>
          <p className="text-3xl font-bold text-white">-</p>
        </div>
      </div>
    </div>
  );
}

