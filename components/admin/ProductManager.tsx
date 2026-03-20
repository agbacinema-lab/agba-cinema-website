"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { shopService } from "@/lib/services"
import { ShopProduct, Order } from "@/lib/types"
import { 
  Package, Plus, Trash2, Edit3, 
  ShoppingBag, Truck, CheckCircle2, 
  Clock, X, Search, DollarSign,
  AlertCircle, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getDirectDriveUrl } from "@/lib/utils"

export default function ProductManager() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'logistics'>('products')
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [logistics, setLogistics] = useState<any>({ deliveryRates: {} })
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: 0,
    category: "Learning Asset",
    image: "",
    stock: 50,
    specs: [""],
    variants: [] as Array<{ name: string, options: string[] }>
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pData, oData, lData] = await Promise.all([
        shopService.getProducts(),
        shopService.getOrders(),
        shopService.getSettings()
      ])
      setProducts(pData)
      setOrders(oData)
      setLogistics(lData)
    } catch (err) {
      toast.error("Failed to fetch system data")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProduct = async () => {
    if (!newProduct.title || !newProduct.price) return toast.error("Essential data missing")
    try {
      if (isEditing && editingId) {
        await shopService.updateProduct(editingId, {
          ...newProduct,
          specs: newProduct.specs.filter(s => s.trim() !== "")
        })
        toast.success("Asset configuration refined")
      } else {
        await shopService.addProduct({
          ...newProduct,
          specs: newProduct.specs.filter(s => s.trim() !== "")
        })
        toast.success("Asset logged to the Vault")
      }
      setIsAdding(false)
      setIsEditing(false)
      setEditingId(null)
      fetchData()
      setNewProduct({ title: "", description: "", price: 0, category: "Learning Asset", image: "", stock: 50, specs: [""], variants: [] })
    } catch (err) {
      toast.error("Operation failed")
    }
  }

  const startEditing = (product: ShopProduct) => {
    setNewProduct({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image || "",
      stock: product.stock,
      specs: product.specs || [""],
      variants: product.variants || []
    })
    setEditingId(product.id)
    setIsEditing(true)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm asset termination?")) return
    try {
      await shopService.deleteProduct(id)
      toast.success("Asset terminated")
      fetchData()
    } catch (err) {
      toast.error("Operation failed")
    }
  }

  const updateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await shopService.updateOrderStatus(orderId, status)
      toast.success(`Order status updated to ${status}`)
      fetchData()
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  const handleSaveLogistics = async () => {
    try {
      await shopService.updateSettings(logistics)
      toast.success("Logistics protocol updated")
    } catch (err) {
      toast.error("Failed to update logistics")
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Dashboard */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">The Armory</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mt-2">Logistical Inventory & Acquisition Oversight</p>
        </div>
        <div className="flex bg-card p-1 rounded-2xl border border-muted shadow-2xl">
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-gray-500 hover:text-white'}`}
          >
            <Package className="h-4 w-4" /> Inventory
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-white'}`}
          >
            <ShoppingBag className="h-4 w-4" /> Missions (Orders)
          </button>
          <button 
            onClick={() => setActiveTab('logistics')}
            className={`flex items-center gap-2 px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'logistics' ? 'bg-zinc-800 text-yellow-400 shadow-lg shadow-yellow-400/10' : 'text-gray-500 hover:text-white'}`}
          >
            <Truck className="h-4 w-4" /> Logistics Protocol
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'products' ? (
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold text-gray-500 italic uppercase tracking-widest">{products.length} Active Assets in Vault</p>
              <Button 
                onClick={() => setIsAdding(true)}
                className="bg-white text-black hover:bg-yellow-400 rounded-2xl px-8 h-12 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl"
              >
                <Plus className="h-4 w-4 mr-2" /> Log New Asset
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-card border border-muted rounded-[2.5rem] p-8 hover:border-yellow-400/50 transition-all group overflow-hidden relative"
                >
                  <div className="relative z-10 flex justify-between items-start mb-6">
                    <div className="bg-black/50 backdrop-blur px-4 py-1.5 rounded-full border border-white/5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      {p.category}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEditing(p)} className="p-2 text-gray-600 hover:text-indigo-400 transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {p.image && (
                    <div className="w-full h-40 rounded-2xl overflow-hidden mb-6 border border-white/5">
                      <img src={getDirectDriveUrl(p.image)} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">{p.title}</h3>
                  <p className="text-[10px] text-gray-500 font-bold italic leading-relaxed mb-6 line-clamp-2">{p.description}</p>
                  
                  <div className="flex items-end justify-between pt-6 border-t border-white/5 mt-auto">
                    <div>
                      <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Price Point</p>
                      <p className="text-xl font-black text-yellow-400">#{(p.price || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Stock Level</p>
                      <p className={`text-xs font-black ${p.stock < 10 ? 'text-red-500' : 'text-white'}`}>{p.stock} units</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full" />
                </motion.div>
              ))}
            </div>
          </>
        ) : activeTab === 'orders' ? (
          <div className="space-y-6">
             {orders.length === 0 ? (
               <div className="text-center py-20 bg-card rounded-[3rem] border border-muted italic">
                  <ShoppingBag className="h-10 w-10 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">No mission orders protocol active</p>
               </div>
             ) : (
                <div className="overflow-hidden rounded-[2.5rem] border border-muted shadow-2xl">
                   <table className="w-full text-left border-collapse bg-card">
                      <thead>
                         <tr className="bg-black text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                            <th className="px-8 py-6">Mission / Client</th>
                            <th className="px-8 py-6">Logistics (Location)</th>
                            <th className="px-8 py-6">Value</th>
                            <th className="px-8 py-6">Protocol Status</th>
                            <th className="px-8 py-6">Action</th>
                         </tr>
                      </thead>
                      <tbody className="text-white text-[11px] font-bold">
                         {orders.map((o) => (
                            <tr key={o.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                               <td className="px-8 py-6">
                                  <p className="font-black italic uppercase tracking-tight text-white">{o.userName}</p>
                                  <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">{o.userEmail}</p>
                               </td>
                               <td className="px-8 py-6">
                                  <p className="text-gray-300 uppercase tracking-tight line-clamp-1">{o.address}</p>
                                  <p className="text-[9px] text-indigo-400 uppercase tracking-[0.2em] font-black mt-1">{o.city}, {o.state}</p>
                               </td>
                               <td className="px-8 py-6">
                                  <p className="font-black text-yellow-400 italic">#{(o.total || 0).toLocaleString()}</p>
                               </td>
                               <td className="px-8 py-6">
                                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase ${
                                    o.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                                    o.status === 'shipped' ? 'bg-blue-500/10 text-blue-500' :
                                    'bg-yellow-400/10 text-yellow-500'
                                  }`}>
                                    {o.status}
                                  </span>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex gap-2">
                                     {o.status === 'pending' && <Button onClick={() => updateStatus(o.id, 'processing')} className="h-8 bg-indigo-600 text-white rounded-xl text-[8px] font-black uppercase">Start Review</Button>}
                                     {o.status === 'processing' && <Button onClick={() => updateStatus(o.id, 'shipped')} className="h-8 bg-blue-600 text-white rounded-xl text-[8px] font-black uppercase">Initiate Dispatch</Button>}
                                     {o.status === 'shipped' && <Button onClick={() => updateStatus(o.id, 'delivered')} className="h-8 bg-green-600 text-white rounded-xl text-[8px] font-black uppercase">Finalize Mission</Button>}
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
        ) : (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                  <h3 className="text-2xl font-black italic uppercase text-white">Logistical Intelligence</h3>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-yellow-500 mt-1">Configure Delivery Protocols for State Territories</p>
               </div>
               <Button 
                  onClick={handleSaveLogistics}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl h-14 px-8 shadow-2xl shadow-yellow-400/20"
               >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Commit Logistics
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {/* Default Rate */}
               <div className="bg-card p-6 rounded-[30px] border border-muted shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 bg-yellow-400/10 rounded-2xl flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-yellow-400" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Default Mission Rate</p>
                  </div>
                  <Input 
                     type="number" 
                     value={logistics.deliveryRates?.default || 6500}
                     onChange={e => setLogistics({
                        ...logistics,
                        deliveryRates: { ...logistics.deliveryRates, default: parseInt(e.target.value) }
                     })}
                     className="bg-white/5 border-white/10 rounded-2xl h-14 font-black"
                  />
                  <p className="text-[9px] font-bold text-gray-600 italic">Fallback cost for territories without specific data.</p>
               </div>

               {/* State Specific Rates */}
               {Object.entries(logistics.deliveryRates || {})
                 .filter(([key]) => key !== 'default')
                 .map(([state, rate]: any) => (
                  <div key={state} className="bg-card p-6 rounded-[30px] border border-white/5 shadow-xl space-y-4 group transition-all hover:border-indigo-500/30">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                              <Truck className="h-5 w-5 text-indigo-400" />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{state}</p>
                        </div>
                        <button 
                           onClick={() => {
                              const newRates = { ...logistics.deliveryRates };
                              delete newRates[state];
                              setLogistics({ ...logistics, deliveryRates: newRates });
                           }}
                           className="text-red-500/50 hover:text-red-500 transition-colors"
                        >
                           <Trash2 className="h-4 w-4" />
                        </button>
                     </div>
                     <Input 
                        type="number" 
                        value={rate || 0}
                        onChange={e => setLogistics({
                           ...logistics,
                           deliveryRates: { ...logistics.deliveryRates, [state]: parseInt(e.target.value) }
                        })}
                        className="bg-white/5 border-white/10 rounded-2xl h-14 font-black text-indigo-400"
                     />
                  </div>
               ))}

               {/* Add New State Link */}
               <div className="bg-dashed border-2 border-dashed border-white/5 rounded-[30px] p-6 flex items-center justify-center min-h-[160px]">
                  <Button 
                    variant="ghost" 
                    className="hover:bg-white/5 h-full w-full rounded-2xl flex flex-col gap-2 group"
                    onClick={() => {
                        const s = prompt("Asset Territory (State Name):");
                        if (s) {
                           setLogistics({
                              ...logistics,
                              deliveryRates: { ...logistics.deliveryRates, [s]: 5000 }
                           });
                        }
                    }}
                  >
                     <Plus className="h-8 w-8 text-gray-700 group-hover:text-yellow-400 transition-colors" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Log New Territory</span>
                  </Button>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdding(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
               <div className="p-10 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">{isEditing ? 'Refine Asset Protocol' : 'Log Asset Protocol'}</h3>
                  <button onClick={() => { setIsAdding(false); setIsEditing(false); }} className="p-2 hover:bg-white/5 rounded-2xl transition-all"><X className="h-6 w-6" /></button>
               </div>
               <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Asset Image Protocol (URL)</label>
                     <Input value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="https://..." className="bg-white/5 border-white/10 rounded-2xl h-14" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Asset Title</label>
                        <Input value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} className="bg-white/5 border-white/10 rounded-2xl h-14" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Acquisition Cost (#)</label>
                        <Input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="bg-white/5 border-white/10 rounded-2xl h-14" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Asset Description (Cinematic Pitch)</label>
                     <Textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="bg-white/5 border-white/10 rounded-2xl min-h-[120px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Asset Category</label>
                        <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-4 text-white uppercase text-[10px] font-black tracking-widest outline-none">
                           <option value="Learning Asset">Learning Asset</option>
                           <option value="Official Merch">Official Merch</option>
                           <option value="Equipment">Equipment</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Stock Count</label>
                        <Input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="bg-white/5 border-white/10 rounded-2xl h-14" />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Asset Specifications</label>
                     {newProduct.specs.map((s, idx) => (
                        <Input 
                           key={idx} 
                           value={s} 
                           onChange={e => {
                              const news = [...newProduct.specs]
                              news[idx] = e.target.value
                              setNewProduct({...newProduct, specs: news})
                           }} 
                           placeholder={`Spec ${idx + 1}`}
                           className="bg-white/5 border-white/10 rounded-2xl h-12"
                        />
                     ))}
                     <Button onClick={() => setNewProduct({...newProduct, specs: [...newProduct.specs, ""]})} variant="outline" className="w-full border-dashed border-white/10 text-[9px] font-black uppercase tracking-widest rounded-2xl h-12">Add Spec Point</Button>
                  </div>
               </div>
               <div className="p-10 bg-white/5 flex gap-4">
                  <Button onClick={() => { setIsAdding(false); setIsEditing(false); }} variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest border-white/10">Abort Protocol</Button>
                  <Button onClick={handleSaveProduct} className="flex-[2] h-16 rounded-2xl bg-yellow-400 text-black hover:bg-white font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all">{isEditing ? 'Confirm Refinement' : 'Log to Armory'}</Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
