
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Invoice, PaymentMode } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    profit: 0,
    expenses: 0,
    commission: 0,
    cashSplit: 0,
    upiSplit: 0,
    count: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const invoices = await db.get<Invoice>('INVOICES');
      const services = await db.get<any>('SERVICES');
      
      let rev = 0, prof = 0, comm = 0, cash = 0, upi = 0;

      const dailyMap: Record<string, number> = {};

      invoices.forEach(inv => {
        rev += inv.total;
        if (inv.paymentMode === PaymentMode.CASH) cash += inv.total;
        else upi += inv.total;

        const dateKey = new Date(inv.date).toLocaleDateString();
        dailyMap[dateKey] = (dailyMap[dateKey] || 0) + inv.total;

        // Simplified profit calculation
        inv.services.forEach(s => {
          const svc = services.find((srv: any) => srv.id === s.serviceId);
          if (svc) {
            comm += (svc.price * svc.commission) / 100;
            prof += (svc.price - svc.costPrice - (svc.price * svc.commission / 100));
          }
        });
      });

      setStats({
        revenue: rev,
        profit: prof,
        expenses: rev - prof,
        commission: comm,
        cashSplit: cash,
        upiSplit: upi,
        count: invoices.length
      });

      setChartData(Object.entries(dailyMap).map(([date, val]) => ({ date, amount: val })));
    };
    fetchData();
  }, []);

  const formatCurr = (val: number) => `$${val.toLocaleString()}`;

  const cards = [
    { label: 'Gross Revenue', value: formatCurr(stats.revenue), trend: '+12%', color: 'text-amber-500' },
    { label: 'Net Profit', value: formatCurr(stats.profit), trend: '+8.5%', color: 'text-emerald-500' },
    { label: 'Staff Commission', value: formatCurr(stats.commission), trend: '-2.1%', color: 'text-blue-500' },
    { label: 'Total Visits', value: stats.count, trend: '+45', color: 'text-purple-500' }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-sm">
            <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">{card.label}</div>
            <div className={`text-3xl font-bold ${card.color} luxury-font`}>{card.value}</div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded mr-2 font-bold">{card.trend}</span>
              <span className="text-gray-600">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-200">Revenue Forecast</h3>
            <select className="bg-black border border-white/10 rounded px-3 py-1 text-xs text-gray-400 focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" stroke="#444" fontSize={10} />
                <YAxis stroke="#444" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#d97706' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#d97706" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-200 mb-8">Payment Mix</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Cash Payments</span>
                <span className="text-white font-bold">{formatCurr(stats.cashSplit)}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${(stats.cashSplit / stats.revenue) * 100 || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Digital / UPI</span>
                <span className="text-white font-bold">{formatCurr(stats.upiSplit)}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${(stats.upiSplit / stats.revenue) * 100 || 0}%` }}
                />
              </div>
            </div>
            
            <div className="pt-6 mt-6 border-t border-white/5">
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">Quick Insights</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  UPI usage up 22% this week
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  Peak hours: 4 PM - 8 PM
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  Return rate is 68%
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
