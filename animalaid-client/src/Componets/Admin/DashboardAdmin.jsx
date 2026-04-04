import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

import {
  Users, Pill, Package, AlertTriangle, TrendingUp, Layers, Calendar, ShoppingCart, Activity, Truck, Thermometer,
  ArrowUp, ArrowDown, Info, ExternalLink, ChevronRight
} from 'lucide-react';
import { use } from 'react';

const DashboardAdmin = () => {
  // Demo data - would normally be fetched from API
  const [stats, setStats] = useState({
    totalAnimals: 0,
    feedStock: 0,
    activeDiseases: 0,
    monthlyDemand: 0
  });

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setStats({
        totalAnimals: 1247,
        feedStock: 8560,
        activeDiseases: 6,
        monthlyDemand: 2100
      });
      setLoading(false);
    }, 1000);
  }, []);



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          console.warn("No token found in localStorage");
          return;
        }

        const response = await fetch('http://localhost:8000/api/accounts/users/', {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          const err = await response.json();
          console.error("API error:", response.status, err);
          return;
        }

        const data = await response.json();
        setUsers(data);

      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers(); // ← this line was missing before
  }, []);




  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch('http://localhost:8000/medicines/');
        if (!response.ok) {
          throw new Error('Failed to fetch medicines');
        }
        const data = await response.json();
        setMedicines(data);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      }
    };
    fetchMedicines();
  }, []);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const response = await fetch('http://localhost:8000/feeds/');
        if (!response.ok) throw new Error('Failed to fetch feeds');
        const data = await response.json();
        setFeeds(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch feeds');
      }
    };
    fetchFeeds();
  }, []);

  // console.log('Medicines:', medicines.length);
  // console.log('Feeds:', feeds.length);

  // Demo data for charts
  const animalDistribution = [
    { name: 'Dogs', value: 425, color: '#8884d8' },
    { name: 'Cats', value: 310, color: '#82ca9d' },
    { name: 'Cows', value: 185, color: '#ffc658' },
    { name: 'Goats', value: 145, color: '#ff8042' },
    { name: 'Sheep', value: 95, color: '#0088fe' },
    { name: 'Hens', value: 70, color: '#00C49F' },
    { name: 'Others', value: 17, color: '#FFBB28' }
  ];

  const feedStockData = [
    { name: 'Dog Food', current: 1200, threshold: 800 },
    { name: 'Cat Food', current: 950, threshold: 700 },
    { name: 'Cow Feed', current: 2300, threshold: 1500 },
    { name: 'Poultry', current: 1800, threshold: 1000 },
    { name: 'Goat Feed', current: 1350, threshold: 900 },
    { name: 'Sheep Feed', current: 960, threshold: 650 }
  ];

  const diseasePrevalenceData = [
    { month: 'Jan', 'Foot & Mouth': 12, 'Rabies': 8, 'Bird Flu': 5, 'Tick Fever': 15 },
    { month: 'Feb', 'Foot & Mouth': 15, 'Rabies': 10, 'Bird Flu': 6, 'Tick Fever': 13 },
    { month: 'Mar', 'Foot & Mouth': 18, 'Rabies': 12, 'Bird Flu': 9, 'Tick Fever': 11 },
    { month: 'Apr', 'Foot & Mouth': 14, 'Rabies': 9, 'Bird Flu': 15, 'Tick Fever': 10 },
    { month: 'May', 'Foot & Mouth': 10, 'Rabies': 7, 'Bird Flu': 20, 'Tick Fever': 9 },
    { month: 'Jun', 'Foot & Mouth': 8, 'Rabies': 5, 'Bird Flu': 17, 'Tick Fever': 8 },
    { month: 'Jul', 'Foot & Mouth': 5, 'Rabies': 4, 'Bird Flu': 12, 'Tick Fever': 12 },
    { month: 'Aug', 'Foot & Mouth': 7, 'Rabies': 6, 'Bird Flu': 8, 'Tick Fever': 16 },
    { month: 'Sep', 'Foot & Mouth': 10, 'Rabies': 8, 'Bird Flu': 7, 'Tick Fever': 18 },
    { month: 'Oct', 'Foot & Mouth': 12, 'Rabies': 10, 'Bird Flu': 5, 'Tick Fever': 14 },
    { month: 'Nov', 'Foot & Mouth': 16, 'Rabies': 13, 'Bird Flu': 4, 'Tick Fever': 10 },
    { month: 'Dec', 'Foot & Mouth': 18, 'Rabies': 15, 'Bird Flu': 3, 'Tick Fever': 8 }
  ];

  const monthlyDemandData = [
    { month: 'Jan', demand: 1800 },
    { month: 'Feb', demand: 1900 },
    { month: 'Mar', demand: 2100 },
    { month: 'Apr', demand: 2300 },
    { month: 'May', demand: 2450 },
    { month: 'Jun', demand: 2600 },
    { month: 'Jul', demand: 2400 },
    { month: 'Aug', demand: 2300 },
    { month: 'Sep', demand: 2100 },
    { month: 'Oct', demand: 2000 },
    { month: 'Nov', demand: 1950 },
    { month: 'Dec', demand: 2100 }
  ];

  const upcomingDeliveriesData = [
    { id: 1, supplier: 'PetGrow Inc.', feed: 'Dog Booster Feed', quantity: '500kg', eta: '2025-05-14' },
    { id: 2, supplier: 'FarmFresh', feed: 'Hen Layer Feed', quantity: '800kg', eta: '2025-05-16' },
    { id: 3, supplier: 'CattleMax', feed: 'Dairy Cow Nutrition', quantity: '1200kg', eta: '2025-05-19' },
    { id: 4, supplier: 'AnimalCare', feed: 'Cat Premium Mix', quantity: '300kg', eta: '2025-05-21' }
  ];

  const treatmentScheduleData = [
    { id: 1, animal: 'Dogs (Regional)', treatment: 'Rabies Vaccination', date: '2025-05-15', status: 'Scheduled' },
    { id: 2, animal: 'Cattle', treatment: 'Parasite Treatment', date: '2025-05-18', status: 'Preparing' },
    { id: 3, animal: 'Poultry', treatment: 'Bird Flu Vaccination', date: '2025-05-22', status: 'Awaiting Supply' },
    { id: 4, animal: 'All Livestock', treatment: 'Routine Health Check', date: '2025-05-25', status: 'Planning' }
  ];

  const seasonalDiseaseData = [
    { name: 'Spring', 'Foot & Mouth': 15, 'Tick Fever': 40, 'Bird Flu': 12, 'Rabies': 9 },
    { name: 'Summer', 'Foot & Mouth': 8, 'Tick Fever': 30, 'Bird Flu': 17, 'Rabies': 5 },
    { name: 'Fall', 'Foot & Mouth': 12, 'Tick Fever': 12, 'Bird Flu': 5, 'Rabies': 12 },
    { name: 'Winter', 'Foot & Mouth': 18, 'Tick Fever': 8, 'Bird Flu': 3, 'Rabies': 15 }
  ];

  const alerts = [
    { id: 1, type: 'warning', message: 'Low stock alert: Cat Food (15% below threshold)', date: '2025-05-11' },
    { id: 2, type: 'danger', message: 'Disease outbreak: Increased Foot & Mouth cases in Northern districts', date: '2025-05-10' },
    { id: 3, type: 'info', message: 'New feed supplier onboarded: GreenFarm Organics', date: '2025-05-09' },
    { id: 4, type: 'success', message: 'Treatment campaign completed: 95% coverage for Rabies vaccination', date: '2025-05-08' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">AnimalAid Dashboard</h1>
            <div className="flex items-center gap-4">
              <select
                className="bg-white border border-gray-300 rounded-md py-1 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              >
                <option value="daily">Daily View</option>
                <option value="weekly">Weekly View</option>
                <option value="monthly">Monthly View</option>
                <option value="yearly">Yearly View</option>
              </select>
              <button className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-sm flex items-center gap-1">
                <Calendar size={16} />
                <span>May 2025</span>
              </button>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className="mr-4 bg-indigo-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              {loading ? (
                <div className="h-6 bg-gray-200 animate-pulse rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              )}
              {/* <div className="flex items-center mt-1">
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-500 font-medium">+3.2% this month</span>
              </div> */}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className="mr-4 bg-green-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Types of Feeds </p>
              {loading ? (
                <div className="h-6 bg-gray-200 animate-pulse rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{feeds.length} </p>
              )}
              {/* <div className="flex items-center mt-1">
                <ArrowDown className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-500 font-medium">-1.8% this month</span>
              </div> */}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className="mr-4 bg-red-100 p-3 rounded-full">
              <Pill className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Types of Medicines </p>
              {loading ? (
                <div className="h-6 bg-gray-200 animate-pulse rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{medicines.length}</p>
              )}
              {/* <div className="flex items-center mt-1">
                <ArrowUp className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-500 font-medium">+2 since last month</span>
              </div> */}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className="mr-4 bg-blue-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Demand (kg)</p>
              {loading ? (
                <div className="h-6 bg-gray-200 animate-pulse rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyDemand.toLocaleString()}</p>
              )}
              <div className="flex items-center mt-1">
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-500 font-medium">+5.7% this month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Seasonal Disease Prevalence */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Seasonal Disease Prevalence</h2>
                <div className="flex items-center text-sm text-indigo-600">
                  <a href="#" className="flex items-center hover:text-indigo-800">
                    View Details <ChevronRight size={16} />
                  </a>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={seasonalDiseaseData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Foot & Mouth" stackId="a" fill="#8884d8" />
                  <Bar dataKey="Tick Fever" stackId="a" fill="#82ca9d" />
                  <Bar dataKey="Bird Flu" stackId="a" fill="#ffc658" />
                  <Bar dataKey="Rabies" stackId="a" fill="#ff8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="px-6 pb-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Foot & Mouth disease typically peaks during winter months. Consider scheduling preventive vaccinations in fall.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Demand Trend */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Feed Demand Trend</h2>
                <div className="flex items-center text-sm text-indigo-600">
                  <a href="#" className="flex items-center hover:text-indigo-800">
                    View Details <ChevronRight size={16} />
                  </a>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyDemandData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="demand" stroke="#8884d8" fillOpacity={1} fill="url(#colorDemand)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="px-6 pb-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Peak demand occurs during summer months. Consider increasing stock levels by April to prepare for the seasonal surge.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Charts & Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Animal Distribution */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Animal Distribution</h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={animalDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {animalDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} animals`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {animalDistribution.map((animal) => (
                  <div key={animal.name} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: animal.color }}></div>
                    <span className="text-xs text-gray-600">{animal.name}: {animal.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feed Stock Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Feed Stock Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {feedStockData.map((item) => {
                  const percentage = Math.round((item.current / item.threshold) * 100);
                  let barColor = 'bg-green-500';
                  if (percentage < 120) barColor = 'bg-yellow-500';
                  if (percentage < 100) barColor = 'bg-red-500';

                  return (
                    <div key={item.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        <span className="text-sm text-gray-500">{item.current} / {item.threshold} kg</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Alerts & Notifications</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {alerts.map((alert) => {
                let alertColor = 'border-gray-200 bg-gray-50';
                let iconColor = 'text-gray-400';

                if (alert.type === 'warning') {
                  alertColor = 'border-yellow-200 bg-yellow-50';
                  iconColor = 'text-yellow-400';
                } else if (alert.type === 'danger') {
                  alertColor = 'border-red-200 bg-red-50';
                  iconColor = 'text-red-400';
                } else if (alert.type === 'success') {
                  alertColor = 'border-green-200 bg-green-50';
                  iconColor = 'text-green-400';
                } else if (alert.type === 'info') {
                  alertColor = 'border-blue-200 bg-blue-50';
                  iconColor = 'text-blue-400';
                }

                return (
                  <div key={alert.id} className={`p-4 ${alertColor}`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm text-gray-700">{alert.message}</p>
                        <p className="mt-1 text-xs text-gray-500">{alert.date}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-200">
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center">
                View All Alerts <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Disease Prevalence Trends */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Disease Prevalence Trends</h2>
              <div className="flex gap-4">
                <button className="text-sm text-gray-500 px-2 py-1 rounded bg-gray-100">Monthly</button>
                <button className="text-sm text-gray-500 px-2 py-1 rounded">Quarterly</button>
                <button className="text-sm text-gray-500 px-2 py-1 rounded">Yearly</button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={diseasePrevalenceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Foot & Mouth" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Rabies" stroke="#82ca9d" />
                <Line type="monotone" dataKey="Bird Flu" stroke="#ffc658" />
                <Line type="monotone" dataKey="Tick Fever" stroke="#ff8042" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deliveries */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Upcoming Feed Deliveries</h2>
                <button className="text-sm text-indigo-600 flex items-center hover:text-indigo-800">
                  Schedule Delivery <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="p-2">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feed Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingDeliveriesData.map((delivery) => (
                      <tr key={delivery.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{delivery.supplier}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.feed}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(delivery.eta).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center">
                View All Deliveries <ChevronRight size={16} />
              </a>
            </div>
          </div>

          {/* Treatment Schedule */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Upcoming Treatment Schedule</h2>
                <button className="text-sm text-indigo-600 flex items-center hover:text-indigo-800">
                  Plan Treatment <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="p-2">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Animal Group</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {treatmentScheduleData.map((treatment) => {
                      let statusColor = 'bg-gray-100 text-gray-800';
                      if (treatment.status === 'Scheduled') statusColor = 'bg-blue-100 text-blue-800';
                      else if (treatment.status === 'Preparing') statusColor = 'bg-yellow-100 text-yellow-800';
                      else if (treatment.status === 'Awaiting Supply') statusColor = 'bg-orange-100 text-orange-800';

                      return (
                        <tr key={treatment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{treatment.animal}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{treatment.treatment}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(treatment.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                              {treatment.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center">
                View Full Schedule <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;