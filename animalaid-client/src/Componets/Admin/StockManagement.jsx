import React, { useState, useEffect, useCallback } from 'react';
import {
    TrendingUp, TrendingDown, Package, DollarSign, ShoppingCart,
    AlertTriangle, RefreshCw, Download, ArrowUpRight, ArrowDownRight,
    Search, Users, MapPin, List, BarChart2, X
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// ─── constants ──────────────────────────────────────────────────────────────
const BASE = 'http://localhost:8000/api/stocks';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'product-list', label: 'Product List', icon: List },
    { id: 'sales-group', label: 'Sales by Group', icon: Users },
    { id: 'sales-area', label: 'Sales by Area', icon: MapPin },
];

const PERIODS = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'year', label: 'Last Year' },
];

// ─── tiny helpers ────────────────────────────────────────────────────────────
const fmt = (n) =>
    `৳${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (s) =>
    s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '';

// ─── shared UI pieces ────────────────────────────────────────────────────────
function Badge({ type }) {
    const cls = type === 'medicine'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-green-100 text-green-700';
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
            {type}
        </span>
    );
}

function Spinner() {
    return (
        <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
    );
}

function SectionTitle({ icon: Icon, children }) {
    return (
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            {Icon && <Icon size={18} className="text-blue-600" />}
            {children}
        </h2>
    );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ title, value, sub, gradient, icon: Icon, trend }) {
    return (
        <div className={`rounded-2xl shadow-md p-5 text-white ${gradient}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-white bg-opacity-25 rounded-lg">
                    <Icon size={20} />
                </div>
                {trend === 'up' && <ArrowUpRight size={18} className="opacity-75" />}
                {trend === 'down' && <ArrowDownRight size={18} className="opacity-75" />}
            </div>
            <p className="text-sm opacity-90 mb-0.5">{title}</p>
            <p className="text-2xl font-extrabold leading-tight">{value}</p>
            {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
        </div>
    );
}

// ─── DASHBOARD TAB ───────────────────────────────────────────────────────────
function Dashboard({ period, productType }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ period });
            if (productType) params.append('product_type', productType);
            const r = await fetch(`${BASE}/analytics/?${params}`);
            setData(await r.json());
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [period, productType]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <Spinner />;
    if (!data) return <p className="text-red-500 p-4">Failed to load analytics.</p>;

    const { metrics, top_selling_products, recent_purchases, recent_sales, active_alerts } = data;
    const profit = metrics.profit;
    const profitMargin = metrics.total_revenue > 0
        ? ((profit / metrics.total_revenue) * 100).toFixed(1) : 0;

    // pie chart data
    const pieData = [
        { name: 'Medicine', value: top_selling_products.filter(p => p.product_type === 'medicine').length, color: '#3B82F6' },
        { name: 'Feed', value: top_selling_products.filter(p => p.product_type === 'feed').length, color: '#10B981' },
    ];

    return (
        <div className="space-y-8">
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Investment"
                    value={fmt(metrics.total_investment)}
                    sub="Stock purchase cost"
                    gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                    icon={DollarSign} trend="up"
                />
                <MetricCard
                    title="Total Revenue"
                    value={fmt(metrics.total_revenue)}
                    sub={`${metrics.total_units_sold} units sold`}
                    gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                    icon={ShoppingCart} trend="up"
                />
                <MetricCard
                    title="Net Profit"
                    value={fmt(profit)}
                    sub={`${profitMargin}% margin`}
                    gradient={profit >= 0
                        ? 'bg-gradient-to-br from-violet-500 to-violet-700'
                        : 'bg-gradient-to-br from-red-500 to-red-700'}
                    icon={profit >= 0 ? TrendingUp : TrendingDown}
                    trend={profit >= 0 ? 'up' : 'down'}
                />
                <MetricCard
                    title="Low Stock Alerts"
                    value={metrics.active_alerts_count}
                    sub="Needs restocking"
                    gradient="bg-gradient-to-br from-amber-400 to-orange-500"
                    icon={AlertTriangle}
                />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                    <SectionTitle icon={Package}>Product Type Distribution</SectionTitle>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={90}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Stock movement */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                    <SectionTitle>Stock Movement</SectionTitle>
                    <div className="space-y-3">
                        {[
                            { label: 'Units Purchased', value: metrics.total_units_purchased, color: 'bg-blue-500', bg: 'bg-blue-50' },
                            { label: 'Units Sold', value: metrics.total_units_sold, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
                            { label: 'Stock Remaining', value: metrics.total_units_purchased - metrics.total_units_sold, color: 'bg-violet-500', bg: 'bg-violet-50' },
                        ].map(({ label, value, color, bg }) => (
                            <div key={label} className={`flex items-center justify-between p-4 ${bg} rounded-xl`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${color}`} />
                                    <span className="text-sm font-medium text-gray-700">{label}</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">{value?.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top selling products */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <SectionTitle icon={TrendingUp}>Top Selling Products</SectionTitle>
                </div>
                {top_selling_products.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    {['#', 'Product', 'Type', 'Units Sold', 'Revenue'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {top_selling_products.map((p, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 text-lg">
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                        </td>
                                        <td className="px-5 py-3 font-medium text-gray-900">{p.product_name}</td>
                                        <td className="px-5 py-3"><Badge type={p.product_type} /></td>
                                        <td className="px-5 py-3 font-semibold">{p.total_sold}</td>
                                        <td className="px-5 py-3 font-bold text-emerald-600">{fmt(p.total_revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">No sales data available</div>
                )}
            </div>

            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Sales */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-5 border-b border-gray-100">
                        <SectionTitle icon={ShoppingCart}>Recent Sales</SectionTitle>
                    </div>
                    <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                        {recent_sales.length > 0 ? recent_sales.slice(0, 6).map((s) => (
                            <div key={s.id} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                                <div className="p-1.5 bg-emerald-500 rounded-lg">
                                    <ShoppingCart size={14} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 truncate">{s.product_name}</p>
                                    <p className="text-xs text-gray-500">{s.quantity_sold} units • {fmtDate(s.created_at)}</p>
                                    {s.customer_area && <p className="text-xs text-gray-400">📍 {s.customer_area}</p>}
                                </div>
                                <p className="font-bold text-emerald-600 text-sm">{fmt(s.total_revenue)}</p>
                            </div>
                        )) : <p className="text-gray-400 text-center py-8">No recent sales</p>}
                    </div>
                </div>

                {/* Recent Purchases */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-5 border-b border-gray-100">
                        <SectionTitle icon={Package}>Recent Purchases</SectionTitle>
                    </div>
                    <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                        {recent_purchases.length > 0 ? recent_purchases.slice(0, 6).map((p) => (
                            <div key={p.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                                <div className="p-1.5 bg-blue-500 rounded-lg">
                                    <Package size={14} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 truncate">{p.product_name}</p>
                                    <p className="text-xs text-gray-500">{p.quantity_added} units • {fmtDate(p.created_at)}</p>
                                    {p.supplier_name && <p className="text-xs text-gray-400">🏪 {p.supplier_name}</p>}
                                </div>
                                <p className="font-bold text-blue-600 text-sm">{fmt(p.total_cost)}</p>
                            </div>
                        )) : <p className="text-gray-400 text-center py-8">No recent purchases</p>}
                    </div>
                </div>
            </div>

            {/* Low stock alerts */}
            {active_alerts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-5 border-b border-gray-100">
                        <SectionTitle icon={AlertTriangle}>
                            Low Stock Alerts ({active_alerts.length})
                        </SectionTitle>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {active_alerts.map((a) => (
                            <div key={a.id}
                                className="flex items-center gap-3 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl">
                                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 truncate">{a.product_name}</p>
                                    <p className="text-xs text-red-600 font-semibold">{a.current_stock} units left</p>
                                </div>
                                <Badge type={a.product_type} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── PRODUCT LIST TAB ────────────────────────────────────────────────────────
function ProductList({ period, productType }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (productType) params.append('product_type', productType);
            if (search) params.append('search', search);
            const r = await fetch(`${BASE}/product-list/?${params}`);
            const data = await r.json();
            setProducts(data.results || []);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [productType, search]);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-4">
            {/* Search bar */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search products…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {search && (
                    <button onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X size={14} />
                    </button>
                )}
            </div>

            {loading ? <Spinner /> : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <SectionTitle icon={List}>All Products — Current Stock</SectionTitle>
                        <span className="text-sm text-gray-400">{products.length} products</span>
                    </div>
                    {products.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                        {['Product Name', 'Type', 'Current Stock', 'Unit Price', 'Status'].map(h => (
                                            <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {products.map((p, i) => (
                                        <tr key={i} className={`hover:bg-gray-50 transition-colors ${p.low_stock ? 'bg-red-50' : ''}`}>
                                            <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                                            <td className="px-5 py-3"><Badge type={p.product_type} /></td>
                                            <td className="px-5 py-3">
                                                <span className={`font-bold text-lg ${p.current_stock < 5 ? 'text-red-600' : p.current_stock < 10 ? 'text-amber-500' : 'text-gray-900'}`}>
                                                    {p.current_stock}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-gray-700">{fmt(p.unit_price)}</td>
                                            <td className="px-5 py-3">
                                                {p.current_stock === 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                        ❌ Out of Stock
                                                    </span>
                                                ) : p.current_stock < 5 ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                                        ⚠ Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                        ✓ In Stock
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-400">
                            <Package size={40} className="mx-auto mb-3 opacity-30" />
                            <p>No products found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── GENERIC GROUP/AREA REPORT TABLE ─────────────────────────────────────────
function SalesReportTable({ endpoint, groupKey, groupLabel, icon: Icon, headerColor, period, productType }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ period });
            if (productType) params.append('product_type', productType);
            const r = await fetch(`${BASE}/${endpoint}/?${params}`);
            setData(await r.json());
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [endpoint, period, productType]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <Spinner />;
    if (!data) return <p className="text-red-500 p-4">Failed to load data.</p>;

    const rows = data[groupKey] || [];
    const totalRev = data.summary?.total_revenue || 0;

    // bar chart data
    const chartData = rows.slice(0, 8).map(r => ({
        name: r.area || r.group || 'Unknown',
        revenue: r.total_revenue,
        units: r.total_units_sold,
    }));

    return (
        <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-2xl font-extrabold text-emerald-600">{fmt(totalRev)}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <p className="text-sm text-gray-500 mb-1">Total {groupLabel}s</p>
                    <p className="text-2xl font-extrabold text-blue-600">{rows.length}</p>
                </div>
            </div>

            {/* Bar chart */}
            {chartData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <SectionTitle icon={Icon}>Revenue by {groupLabel}</SectionTitle>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip formatter={(v) => [`৳${v.toLocaleString()}`, 'Revenue']} />
                            <Bar dataKey="revenue" fill={headerColor} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <SectionTitle icon={Icon}>Detailed Sales by {groupLabel}</SectionTitle>
                </div>
                {rows.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    {['#', groupLabel, 'Orders', 'Units Sold', 'Revenue', 'Top Product'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rows.map((r, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 text-gray-400 font-mono text-sm">{i + 1}</td>
                                        <td className="px-5 py-3 font-semibold text-gray-900">
                                            {r.area || r.group || 'Unknown'}
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{r.order_count || 0}</td>
                                        <td className="px-5 py-3 font-semibold">{(r.total_units_sold || 0).toLocaleString()}</td>
                                        <td className="px-5 py-3 font-bold text-emerald-600">{fmt(r.total_revenue)}</td>
                                        <td className="px-5 py-3 text-xs text-gray-500 max-w-[150px] truncate">
                                            {r.top_product || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-400">
                        <Icon size={40} className="mx-auto mb-3 opacity-30" />
                        <p>No data available for this period</p>
                        <p className="text-xs mt-1">Make sure sales have customer_{groupLabel.toLowerCase()} filled in</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function StockManagement() {
    const [tab, setTab] = useState('dashboard');
    const [period, setPeriod] = useState('month');
    const [productType, setProductType] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        setRefreshKey(k => k + 1);
        await new Promise(r => setTimeout(r, 600));
        setRefreshing(false);
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const params = new URLSearchParams({ period });
            if (productType) params.append('product_type', productType);
            const r = await fetch(`${BASE}/download-pdf/?${params}`);
            if (r.ok) {
                const blob = await r.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `AnimalAid_Stock_Report_${period}_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to download PDF. Please try again.');
            }
        } catch {
            alert('Error downloading PDF.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Top Header ── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-3 py-4">

                        {/* Title */}
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                Stock Management
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">Animal Aid — Veterinary Supplies</p>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-50 transition"
                            >
                                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                                Refresh
                            </button>

                            <select
                                value={period}
                                onChange={e => setPeriod(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                {PERIODS.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>

                            <select
                                value={productType}
                                onChange={e => setProductType(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">All Products</option>
                                <option value="medicine">Medicine</option>
                                <option value="feed">Feed</option>
                            </select>

                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm flex items-center gap-1.5 transition disabled:opacity-60"
                            >
                                <Download size={14} />
                                {downloading ? 'Downloading…' : 'Download PDF'}
                            </button>
                        </div>
                    </div>

                    {/* ── Tab nav ── */}
                    <nav className="flex gap-1 pb-0 -mb-px">
                        {TABS.map(t => {
                            const Icon = t.icon;
                            const active = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${active
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Icon size={15} />
                                    {t.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* ── Page body ── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {tab === 'dashboard' && <Dashboard key={`dash-${refreshKey}-${period}-${productType}`} period={period} productType={productType} />}
                {tab === 'product-list' && <ProductList key={`pl-${refreshKey}-${productType}`} period={period} productType={productType} />}
                {tab === 'sales-group' && (
                    <SalesReportTable
                        key={`sg-${refreshKey}-${period}-${productType}`}
                        endpoint="sales-by-group"
                        groupKey="groups"
                        groupLabel="Group"
                        icon={Users}
                        headerColor="#7C3AED"
                        period={period}
                        productType={productType}
                    />
                )}
                {tab === 'sales-area' && (
                    <SalesReportTable
                        key={`sa-${refreshKey}-${period}-${productType}`}
                        endpoint="sales-by-area"
                        groupKey="areas"
                        groupLabel="Area"
                        icon={MapPin}
                        headerColor="#F59E0B"
                        period={period}
                        productType={productType}
                    />
                )}
            </main>
        </div>
    );
}