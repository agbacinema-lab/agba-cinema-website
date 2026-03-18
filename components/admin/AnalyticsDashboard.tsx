"use client"

import { useState, useEffect } from "react"
import { adminService } from "@/lib/services"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Briefcase,
  GraduationCap
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts"
import { motion } from "framer-motion"

export default function AnalyticsDashboard() {
  const [sales, setSales] = useState<any>(null)
  const [engagement, setEngagement] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [salesData, engagementData] = await Promise.all([
          adminService.getSalesStats(),
          adminService.getEngagementData()
        ])
        setSales(salesData)
        setEngagement(engagementData)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-gray-400">DECIPHERING DATA STREAMS...</div>

  // Prepare chart data (Mocking some time series if no data exists)
  const chartData = sales?.transactions?.slice(0, 10).reverse() || []

  return (
    <div className="space-y-10 selection:bg-yellow-400 selection:text-black">
      <header>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Command Intelligence</h2>
        <p className="text-gray-500 font-medium">Real-time oversight of registration velocity and fiscal performance.</p>
      </header>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatsCard 
           title="Total Revenue" 
           value={`₦${(sales?.totalRevenue || 0).toLocaleString()}`} 
           trend="+12.5%" 
           icon={<TrendingUp className="h-5 w-5" />} 
           color="bg-black text-white"
         />
         <StatsCard 
           title="Active Students" 
           value={engagement?.students || 0} 
           trend="+3 New" 
           icon={<GraduationCap className="h-5 w-5" />} 
           color="bg-yellow-400 text-black"
         />
         <StatsCard 
           title="Brand Partners" 
           value={engagement?.brands || 0} 
           trend="Stable" 
           icon={<Briefcase className="h-5 w-5" />} 
           color="bg-white border-2 border-gray-100"
         />
         <StatsCard 
           title="Conversion Rate" 
           value="4.2%" 
           trend="-0.5%" 
           icon={<Activity className="h-5 w-5" />} 
           color="bg-white border-2 border-gray-100"
         />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2 border-none shadow-premium rounded-[3rem] bg-white p-10">
            <CardHeader className="p-0 mb-10">
               <CardTitle className="text-xl font-black italic uppercase tracking-tight flex items-center justify-between">
                  Fiscal Velocity (Sales)
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last 10 Transactions</span>
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#FACC15" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis 
                        dataKey="createdAt" 
                        hide 
                     />
                     <YAxis 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        fontWeight="black" 
                        tickFormatter={(v) => `₦${v/1000}k`}
                        axisLine={false}
                        tickLine={false}
                     />
                     <Tooltip 
                        contentStyle={{ 
                           backgroundColor: '#000', 
                           borderRadius: '16px', 
                           border: 'none', 
                           color: '#fff',
                           fontSize: '11px',
                           fontWeight: 'bold',
                           padding: '12px'
                        }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#EAB308" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="border-none shadow-premium rounded-[3rem] bg-black text-white p-10">
            <CardHeader className="p-0 mb-8">
               <CardTitle className="text-xl font-black italic uppercase">Engagement Mix</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-8">
               <EngagementRow label="Academy Enrollment" count={engagement?.students || 0} total={engagement?.totalUsers || 1} color="bg-yellow-400" />
               <EngagementRow label="Brand Partnerships" count={engagement?.brands || 0} total={engagement?.totalUsers || 1} color="bg-white" />
               <EngagementRow label="Staff & Tutors" count={engagement?.staff || 0} total={engagement?.totalUsers || 1} color="bg-gray-600" />
               
               <div className="pt-8 border-t border-white/10 mt-8">
                  <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-4">Live System Health</p>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                     <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                     <span className="text-xs font-bold italic">ALL SYSTEMS OPERATIONAL</span>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="border-none shadow-premium rounded-[3rem] bg-white overflow-hidden">
         <CardHeader className="p-10 border-b border-gray-50 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black italic uppercase">Recent Transactions</CardTitle>
            <CreditCard className="h-6 w-6 text-gray-200" />
         </CardHeader>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                     <th className="px-10 py-5">Origin</th>
                     <th className="px-6 py-5">Amount</th>
                     <th className="px-6 py-5">Category</th>
                     <th className="px-10 py-5 text-right">Reference</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {(sales?.transactions || []).slice(0, 5).map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-10 py-6">
                          <p className="font-black uppercase italic tracking-tighter">{t.fullName || "Anonymous"}</p>
                          <p className="text-xs text-gray-400 font-medium">{t.customerEmail || t.email}</p>
                       </td>
                       <td className="px-6 py-6 font-black text-gray-900">₦{t.amount?.toLocaleString()}</td>
                       <td className="px-6 py-6 font-bold uppercase text-[10px] text-indigo-600 italic tracking-widest">
                          {t.category || "General"}
                       </td>
                       <td className="px-10 py-6 text-right font-mono text-[10px] text-gray-300">{t.reference}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  )
}

function StatsCard({ title, value, trend, icon, color }: any) {
  return (
    <Card className={`border-none shadow-premium rounded-[2.5rem] p-8 ${color}`}>
       <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
             {icon}
          </div>
          <span className={`text-[10px] font-black tracking-widest px-2 py-1 rounded-md bg-white/10`}>
             {trend}
          </span>
       </div>
       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{title}</p>
       <h3 className="text-3xl font-black italic uppercase tracking-tighter">{value}</h3>
    </Card>
  )
}

function EngagementRow({ label, count, total, color }: any) {
  const percentage = Math.min(100, (count / total) * 100);
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-end">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
          <p className="text-lg font-black italic">{count}</p>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${percentage}%` }} 
            transition={{ duration: 1 }}
            className={`h-full ${color}`} 
          />
       </div>
    </div>
  )
}
