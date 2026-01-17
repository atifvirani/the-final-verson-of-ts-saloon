
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Invoice, Staff, Service } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<{
    dailySales: any[];
    topServices: any[];
    categorySplit: any[];
    totalRevenue: number;
    totalProfit: number;
    totalCommission: number;
  }>({
    dailySales: [],
    topServices: [],
    categorySplit: [],
    totalRevenue: 0,
    totalProfit: 0,
    totalCommission: 0
  });

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    const invoices = await db.get<Invoice>('INVOICES');
    const services = await db.get<Service>('SERVICES');
    
    // Aggregations
    const dailyMap: Record<string, number> = {};
    const serviceCount: Record<string, number> = {};
    const categoryCount: Record<string, number> = {};
    
    let rev = 0;
    let profit = 0;
    let comm = 0;

    invoices.forEach(inv => {
      rev += inv.total;
      const date = new Date(inv.date).toLocaleDateString();
      dailyMap[date] = (dailyMap[date] || 0) + inv.total;

      inv.services.forEach(s => {
        serviceCount[s.name] = (serviceCount[s.name] || 0) + 1;
        
        const fullService = services.find(srv => srv.id === s.serviceId);
        if (fullService) {
          categoryCount[fullService.category] = (categoryCount[fullService.category] || 0) + 1;
          const svcComm = (fullService.price * fullService.commission) / 100;
          comm += svcComm;
          profit += (fullService.price - fullService.costPrice - svcComm);
        }
      });
    });

    // Formatting for charts
    const dailySales = Object.entries(dailyMap)
      .map(([date, amount]) => ({ date, amount }))
      .slice(-7); // Last 7 active days

    const topServices = Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const categorySplit = Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }));

    setReportData({
      dailySales,
      topServices,
      categorySplit,
      totalRevenue: rev,
      totalProfit: profit,
      totalCommission: comm
    });
  };

  const COLORS = ['#D4AF37', '#059669', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold luxury-font text-white">Financial Reports</h2>
          <p className="text-sm text-gray-500">Deep dive into your salon's performance</p>
        </div>
        <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/10 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <div className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Total Net Profit</div>
          <div className="text-3xl font-bold text-emerald-500 luxury-font">₹{reportData.totalProfit.toLocaleString()}</div>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <div className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Staff Payouts</div>
          <div className="text-3xl font-bold text-blue-500 luxury-font">₹{reportData.totalCommission.toLocaleString()}</div>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <div className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Total Revenue</div>
          <div className="text-3xl font-bold text-gold luxury-font">₹{reportData.totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 h-[400px]">
          <h3 className="text-lg font-bold text-gray-200 mb-6">Sales Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={reportData.dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="date" stroke="#444" fontSize={10} />
              <YAxis stroke="#444" fontSize={10} />
              <Tooltip 
                cursor={{fill: '#222'}}
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
              />
              <Bar dataKey="amount" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 h-[400px]">
          <h3 className="text-lg font-bold text-gray-200 mb-6">Service Categories</h3>
          <div className="flex items-center justify-center h-[80%]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.categorySplit}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reportData.categorySplit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {reportData.categorySplit.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-gray-300">{entry.name}</span>
                  <span className="font-bold text-white">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
        <h3 className="text-lg font-bold text-gray-200 mb-6">Top Performing Services</h3>
        <div className="space-y-4">
          {reportData.topServices.map((svc, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-gold">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-200 font-bold">{svc.name}</span>
                  <span className="text-gray-400">{svc.count} sales</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold rounded-full"
                    style={{ width: `${(svc.count / (reportData.topServices[0]?.count || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
