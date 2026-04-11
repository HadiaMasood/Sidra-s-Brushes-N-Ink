import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import toast from 'react-hot-toast';
import { FaDollarSign, FaShoppingCart, FaPaintBrush, FaStar, FaChartLine } from 'react-icons/fa';

export const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getDashboard();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading analytics...</div>;
  if (!data) return <div className="text-center py-12">No data available</div>;

  const stats = [
    {
      title: 'Total Revenue',
      value: `Rs. ${(data.revenue || 0).toFixed(2)}`,
      icon: FaDollarSign,
      color: 'bg-[#C5A059]',
    },
    {
      title: 'Total Orders',
      value: data.orders_count || 0,
      icon: FaShoppingCart,
      color: 'bg-[#1C1C1C]',
    },
    {
      title: 'Artworks',
      value: data.artworks_count || 0,
      icon: FaPaintBrush,
      color: 'bg-[#E8D5C4]',
    },
    {
      title: 'Reviews',
      value: data.reviews_count || 0,
      icon: FaStar,
      color: 'bg-[#C5A059]',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-600">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-600">{stat.title}</h3>
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-2">Last {period}</p>
            </div>
          );
        })}
      </div>

      {/* Order Status Breakdown */}
      {data.order_status && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaChartLine /> Order Status
          </h3>
          <div className="space-y-3">
            {Object.entries(data.order_status).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="capitalize font-medium">{status}</span>
                <div className="flex items-center gap-3">
                  <div className="w-40 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-600 h-2 rounded-full"
                      style={{ width: `${(count / data.orders_count * 100) || 0}%` }}
                    ></div>
                  </div>
                  <span className="font-bold w-12">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {data.recent_orders && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-4">Order ID</th>
                  <th className="text-left py-2 px-4">Customer</th>
                  <th className="text-left py-2 px-4">Amount</th>
                  <th className="text-left py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.slice(0, 5).map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4"># {order.id}</td>
                    <td className="py-2 px-4">{order.customer_name}</td>
                    <td className="py-2 px-4 font-bold">Rs. {order.total.toFixed(2)}</td>
                    <td className="py-2 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
