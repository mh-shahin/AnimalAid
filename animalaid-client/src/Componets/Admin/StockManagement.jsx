import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Package, DollarSign, ShoppingCart, AlertTriangle, Calendar, Filter, RefreshCw, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StockManagement = () => {
    const [analytics, setAnalytics] = useState(null);
    const [period, setPeriod] = useState('month');
    const [productType, setProductType] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, [period, productType]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ period });
            if (productType) params.append('product_type', productType);
            
            const response = await fetch(`http://localhost:8000/api/stocks/analytics/?${params}`);
            const data = await response.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAnalytics();
        setRefreshing(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `৳${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (loading || !analytics) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    const { metrics, top_selling_products, recent_purchases, recent_sales, active_alerts } = analytics;

    // Calculate profit margin percentage
    const profitMargin = metrics.total_revenue > 0 
        ? ((metrics.profit / metrics.total_revenue) * 100).toFixed(1)
        : 0;

    // Prepare data for charts
    const productTypeData = [
        { name: 'Medicine', value: top_selling_products.filter(p => p.product_type === 'medicine').length || 0, color: '#3B82F6' },
        { name: 'Feed', value: top_selling_products.filter(p => p.product_type === 'feed').length || 0, color: '#10B981' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
                            <p className="text-gray-600 mt-1">Track inventory, sales, and business performance</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                            
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="week">Last Week</option>
                                <option value="month">Last Month</option>
                                <option value="year">Last Year</option>
                            </select>
                            
                            <select
                                value={productType}
                                onChange={(e) => setProductType(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">All Products</option>
                                <option value="medicine">Medicine Only</option>
                                <option value="feed">Feed Only</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Investment */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <ArrowUpRight className="h-5 w-5 opacity-75" />
                        </div>
                        <p className="text-sm opacity-90 mb-1">Total Investment</p>
                        <p className="text-3xl font-bold">{formatCurrency(metrics.total_investment)}</p>
                        <p className="text-xs opacity-75 mt-2">Stock purchase cost</p>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                <ShoppingCart className="h-6 w-6" />
                            </div>
                            <ArrowUpRight className="h-5 w-5 opacity-75" />
                        </div>
                        <p className="text-sm opacity-90 mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold">{formatCurrency(metrics.total_revenue)}</p>
                        <p className="text-xs opacity-75 mt-2">{metrics.total_units_sold} units sold</p>
                    </div>

                    {/* Net Profit */}
                    <div className={`bg-gradient-to-br rounded-xl shadow-lg p-6 text-white ${
                        metrics.profit >= 0 
                            ? 'from-purple-500 to-purple-600' 
                            : 'from-red-500 to-red-600'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                {metrics.profit >= 0 ? (
                                    <TrendingUp className="h-6 w-6" />
                                ) : (
                                    <TrendingDown className="h-6 w-6" />
                                )}
                            </div>
                            {metrics.profit >= 0 ? (
                                <ArrowUpRight className="h-5 w-5 opacity-75" />
                            ) : (
                                <ArrowDownRight className="h-5 w-5 opacity-75" />
                            )}
                        </div>
                        <p className="text-sm opacity-90 mb-1">Net Profit</p>
                        <p className="text-3xl font-bold">{formatCurrency(metrics.profit)}</p>
                        <p className="text-xs opacity-75 mt-2">{profitMargin}% profit margin</p>
                    </div>

                    {/* Active Alerts */}
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-sm opacity-90 mb-1">Low Stock Alerts</p>
                        <p className="text-3xl font-bold">{metrics.active_alerts_count}</p>
                        <p className="text-xs opacity-75 mt-2">Needs restocking</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Product Type Distribution */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package size={20} />
                            Product Type Distribution
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={productTypeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {productTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Stock Movement Overview */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Stock Movement</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <Package className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Units Purchased</p>
                                        <p className="text-2xl font-bold text-gray-900">{metrics.total_units_purchased}</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-8 w-8 text-blue-500" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <ShoppingCart className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Units Sold</p>
                                        <p className="text-2xl font-bold text-gray-900">{metrics.total_units_sold}</p>
                                    </div>
                                </div>
                                <ArrowDownRight className="h-8 w-8 text-green-500" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500 rounded-lg">
                                        <Package className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Stock Remaining</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {metrics.total_units_purchased - metrics.total_units_sold}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white rounded-xl shadow-md mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp size={20} />
                            Top Selling Products
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        {top_selling_products.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {top_selling_products.map((product, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`text-lg font-bold ${
                                                        index === 0 ? 'text-yellow-500' :
                                                        index === 1 ? 'text-gray-400' :
                                                        index === 2 ? 'text-orange-600' :
                                                        'text-gray-400'
                                                    }`}>
                                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                    product.product_type === 'medicine' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {product.product_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">{product.total_sold}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-green-600">
                                                    {formatCurrency(product.total_revenue)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12">
                                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No sales data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity - Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Stock Purchases */}
                    <div className="bg-white rounded-xl shadow-md">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Package size={20} />
                                Recent Stock Purchases
                            </h2>
                        </div>
                        <div className="p-6">
                            {recent_purchases.length > 0 ? (
                                <div className="space-y-4">
                                    {recent_purchases.slice(0, 5).map((purchase) => (
                                        <div key={purchase.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Package className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{purchase.product_name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                                        purchase.product_type === 'medicine' 
                                                            ? 'bg-blue-100 text-blue-700' 
                                                            : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        {purchase.product_type}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {purchase.quantity_added} units @ {formatCurrency(purchase.unit_cost)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-xs text-gray-500">{formatDate(purchase.created_at)}</p>
                                                    {purchase.supplier_name && (
                                                        <p className="text-xs text-gray-500">Supplier: {purchase.supplier_name}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-blue-600">{formatCurrency(purchase.total_cost)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No recent purchases</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white rounded-xl shadow-md">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Low Stock Alerts ({active_alerts.length})
                            </h2>
                        </div>
                        <div className="p-6">
                            {active_alerts.length > 0 ? (
                                <div className="space-y-4">
                                    {active_alerts.map((alert) => (
                                        <div key={alert.id} className="flex items-center gap-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded hover:bg-yellow-100 transition-colors">
                                            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{alert.product_name}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Only <span className="font-bold text-red-600">{alert.current_stock}</span> units remaining
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                                                alert.product_type === 'medicine' 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {alert.product_type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">All products well stocked!</p>
                                    <p className="text-sm text-gray-400 mt-1">No low stock alerts at this time</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockManagement;