import { useEffect, useState } from 'react';
import { supabase } from "./components/supabase";
import LeadCard from './components/LeadCard';
import './components/index.css';

function App() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    delayed: 0,
    paid: 0,
    pending: 0
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads(activeFilter);
  }, [leads, activeFilter]);

  const filterLeads = (filter) => {
    switch (filter) {
      case 'delayed':
        setFilteredLeads(leads.filter(lead => {
          const submitted = new Date(lead.submitted_date);
          const now = new Date();
          const days = Math.floor((now - submitted) / (1000 * 60 * 60 * 24));
          return days > 7 && lead.status !== 'Paid';
        }));
        break;
      case 'pending':
        setFilteredLeads(leads.filter(lead => lead.status === 'Pending'));
        break;
      default:
        setFilteredLeads(leads);
    }
  };

  async function fetchLeads() {
    const { data, error } = await supabase.from('leads').select('*');
    if (error) console.error('Error fetching leads:', error);
    else {
      setLeads(data);
      setFilteredLeads(data);
      // Calculate stats
      const stats = {
        total: data.length,
        delayed: data.filter(lead => {
          const submitted = new Date(lead.submitted_date);
          const now = new Date();
          const days = Math.floor((now - submitted) / (1000 * 60 * 60 * 24));
          return days > 7 && lead.status !== 'Paid';
        }).length,
        paid: data.filter(lead => lead.status === 'Paid').length,
        pending: data.filter(lead => lead.status !== 'Paid').length
      };
      setStats(stats);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-56 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Payout Tracker</h1>
        </div>
        <nav className="mt-4">
          <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-100">
            <span className="mx-2">Dashboard</span>
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
            <span className="mx-2">Analytics</span>
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
            <span className="mx-2">Settings</span>
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">Dashboard Overview</h2>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
          <div className="bg-white rounded-lg shadow p-4 card stats-card">
            <h3 className="text-xs text-gray-500 font-medium">Total Leads</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 card stats-card">
            <h3 className="text-xs text-gray-500 font-medium">Delayed Payouts</h3>
            <p className="text-2xl font-bold text-red-600">{stats.delayed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 card stats-card">
            <h3 className="text-xs text-gray-500 font-medium">Paid</h3>
            <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 card stats-card">
            <h3 className="text-xs text-gray-500 font-medium">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
        </div>

        {/* Leads Section */}
        <div className="px-6 pb-6 text-gray-900">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base font-medium text-gray-800">Recent Leads</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-150 ease-in-out ${
                    activeFilter === 'all' 
                      ? 'bg-blue-200 text-gray-900 hover:bg-blue-300'
                      : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setActiveFilter('delayed')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-150 ease-in-out ${
                    activeFilter === 'delayed' 
                      ? 'bg-red-200 text-gray-900 hover:bg-red-300'
                      : 'bg-red-100 text-gray-800 hover:bg-red-200'
                  }`}
                >
                  Delayed
                </button>
                <button 
                  onClick={() => setActiveFilter('pending')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-150 ease-in-out ${
                    activeFilter === 'pending' 
                      ? 'bg-yellow-200 text-gray-900 hover:bg-yellow-300'
                      : 'bg-yellow-100 text-gray-800 hover:bg-yellow-200'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="transform transition-all duration-200 hover:scale-102">
                    <LeadCard lead={lead} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
