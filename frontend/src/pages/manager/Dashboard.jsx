import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../store/slices/managerSlice';
import { 
  Hotel, 
  Bed, 
  ClipboardList, 
  IndianRupee,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.manager);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const statsCards = [
    { title: 'Total Hotels', value: stats?.totalHotels || 0, icon: Hotel, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Rooms', value: stats?.totalRooms || 0, icon: Bed, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  const chartData = {
    labels: stats?.monthlyStats?.map(s => s.month) || [],
    datasets: [
      {
        label: 'Monthly Bookings',
        data: stats?.monthlyStats?.map(s => s.bookings) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const revenueData = {
    labels: stats?.monthlyStats?.map(s => s.month) || [],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: stats?.monthlyStats?.map(s => s.revenue) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderRadius: 4,
      },
    ],
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-black text-white tracking-tighter uppercase italic">Overview</h1>
        <div className="h-1.5 w-24 bg-gold-500 mt-4 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"></div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-6">Protocol established: Tracking property performance and customer telemetry.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statsCards.map((card, i) => (
          <div key={card.title} className="bg-[#111114] border border-gray-800/50 p-8 rounded-[2rem] hover:border-gold-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-bl-[100%] transition-all group-hover:bg-gold-500/10"></div>
            <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <card.icon className={`w-8 h-8 ${card.color.replace('text-', 'text-gold-500')}`} />
            </div>
            <div className="text-3xl font-serif font-black text-white mb-1">{card.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{card.title}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-[#111114] p-10 rounded-[2.5rem] border border-gray-800/50 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <h3 className="text-lg font-serif font-black text-white mb-8 uppercase italic border-b border-gray-800 pb-4">Booking Analytics</h3>
          <div className="h-[300px]">
            <Line 
              data={{
                ...chartData,
                datasets: chartData.datasets.map(ds => ({
                  ...ds,
                  borderColor: '#d4af37',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  pointBackgroundColor: '#d4af37',
                  pointBorderColor: '#000',
                  pointHoverBackgroundColor: '#fff',
                  borderWidth: 3,
                }))
              }} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#111114',
                      titleColor: '#d4af37',
                      bodyColor: '#fff',
                      borderColor: '#gray-800',
                      borderWidth: 1,
                      padding: 12,
                      cornerRadius: 12,
                      titleFont: { family: 'serif', weight: 'bold' }
                    }
                },
                scales: { 
                    y: { 
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#666', font: { weight: 'bold', size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#666', font: { weight: 'bold', size: 10 } }
                    }
                }
              }} 
            />
          </div>
        </div>

        <div className="bg-[#111114] p-10 rounded-[2.5rem] border border-gray-800/50 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <h3 className="text-lg font-serif font-black text-white mb-8 uppercase italic border-b border-gray-800 pb-4">Revenue Growth</h3>
          <div className="h-[300px]">
            <Bar 
              data={{
                ...revenueData,
                datasets: revenueData.datasets.map(ds => ({
                  ...ds,
                  backgroundColor: 'rgba(16, 185, 129, 0.6)',
                  hoverBackgroundColor: '#10b981',
                  borderRadius: 12,
                }))
              }} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#111114',
                      titleColor: '#10b981',
                      bodyColor: '#fff',
                      borderColor: '#gray-800',
                      borderWidth: 1,
                      padding: 12,
                      cornerRadius: 12,
                      titleFont: { family: 'serif', weight: 'bold' }
                    }
                },
                scales: { 
                    y: { 
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#666', font: { weight: 'bold', size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#666', font: { weight: 'bold', size: 10 } }
                    }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
