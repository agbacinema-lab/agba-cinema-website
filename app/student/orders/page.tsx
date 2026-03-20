"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { shopService } from "@/lib/services"
import { Order } from "@/lib/types"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { ShoppingBag, Truck, Package, X, Clock, CheckCircle2 } from "lucide-react"

export default function StudentOrders() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.uid) {
      loadOrders()
    }
  }, [profile])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const allOrders = await shopService.getOrders()
      setOrders(allOrders.filter(o => o.userId === profile?.uid))
    } catch (e) {
      toast.error("Failed to sync mission registry")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (id: string) => {
    if (!confirm("Confirm mission termination? This action is irreversible.")) return
    try {
      await shopService.cancelOrder(id)
      toast.success("Mission Terminated")
      loadOrders()
    } catch (e) {
      toast.error("Termination protocol failed")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 space-y-12">
      <div className="flex flex-col gap-2">
         <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.4em]">Historical Mission Registry</span>
         </div>
         <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-foreground">Mission Briefs</h2>
         <p className="text-muted-foreground font-medium italic mt-2 text-lg">Track your acquisition history and logistical statuses.</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-card rounded-[2.5rem] animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-32 bg-card rounded-[3rem] border border-white/5 italic">
           <ShoppingBag className="h-12 w-12 text-gray-800 mx-auto mb-4" />
           <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">No missions logged in your history</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds).map((order) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group hover:border-yellow-400/30 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         order.status === 'delivered' ? 'bg-green-500 text-black' :
                         order.status === 'shipped' ? 'bg-blue-600 text-white' :
                         order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                         'bg-yellow-400 text-black'
                       }`}>
                         {order.status}
                       </span>
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                         {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Active Mission'}
                       </span>
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black italic uppercase text-white leading-tight">
                         {order.items.map(i => i.title).join(", ")}
                       </h3>
                       <div className="flex flex-wrap gap-4">
                          {order.items.map(item => (
                             item.variantSelected && Object.entries(item.variantSelected).map(([k, v]) => (
                               <span key={k} className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-white/5 px-3 py-1 rounded-lg">
                                  {k}: {v}
                               </span>
                             ))
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col md:items-end gap-6 border-t md:border-t-0 md:border-l border-white/5 pt-8 md:pt-0 md:pl-12">
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total value</p>
                       <p className="text-3xl font-black italic text-yellow-400">#{(order.total || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-4">
                       {order.status === 'pending' && (
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                             Terminate Mission
                          </button>
                       )}
                       <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                          {order.status === 'shipped' ? <Truck className="h-5 w-5 animate-pulse text-indigo-400" /> : <Package className="h-5 w-5" />}
                       </div>
                    </div>
                 </div>
              </div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-400/5 blur-[80px] rounded-full group-hover:bg-yellow-400/10 transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
