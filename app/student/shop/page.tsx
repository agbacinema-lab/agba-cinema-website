"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { shopService } from "@/lib/services"
import { ShopProduct, Order } from "@/lib/types"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDirectDriveUrl } from "@/lib/utils"
import { 
  ShoppingBag, ArrowRight, BookOpen, 
  CircleDollarSign, BadgeCheck, CheckCircle2, 
  Loader2, X, Truck, Package, Trash2
} from "lucide-react"

export default function StudentShop() {
  const { profile } = useAuth()
  const { cart, addToCart, removeFromCart, updateQuantity, subtotal, clearCart, itemCount } = useCart()
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<ShopProduct | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({})
  
  // Checkout States
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [delivery, setDelivery] = useState({
    address: profile?.address || "", 
    city: profile?.city || "",
    state: profile?.state || "Lagos",
    country: "Nigeria"
  })
  const [shopSettings, setShopSettings] = useState<any>(null)

  const nigerianStates = [
    "Lagos", "Abuja", "Port Harcourt", "Rivers", "Enugu", "Anambra", "Delta", "Kano", 
    "Kaduna", "Oyo", "Ogun", "Edo", "Abia", "Adamawa", "Akwa Ibom", "Bauchi", 
    "Bayelsa", "Benue", "Borno", "Cross River", "Ebonyi", "Ekiti", "Gombe", "Imo", 
    "Jigawa", "Katsina", "Kebbi", "Kogi", "Kwara", "Nasarawa", "Niger", "Ondo", 
    "Osun", "Plateau", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ]

  useEffect(() => {
    loadProducts()
    loadSettings()
    loadUserOrders()
  }, [])

  const loadSettings = async () => {
    const s = await shopService.getSettings()
    setShopSettings(s)
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await shopService.getProducts()
      setProducts(data)
    } catch (error) {
      toast.error("Failed to sync with the Vault")
    } finally {
      setLoading(false)
    }
  }

  const loadUserOrders = async () => {
    if (!profile?.uid) return
    try {
      const allOrders = await shopService.getOrders()
      setUserOrders(allOrders.filter(o => o.userId === profile.uid))
    } catch (e) {
      console.error("Failed to sync mission board")
    }
  }

  const handleCancelMission = async (id: string) => {
    if (!confirm("Confirm mission termination? This action is irreversible.")) return
    try {
      await shopService.cancelOrder(id)
      toast.success("Mission Terminated")
      loadUserOrders()
    } catch (e) {
      toast.error("Termination protocol failed")
    }
  }

  const deliveryFee = shopService.calculateDeliveryFee(delivery.state, shopSettings)
  const finalTotal = subtotal + deliveryFee

  const handleInitiateOrder = async () => {
    if (!profile || cart.length === 0) return
    if (!delivery.address || !delivery.city) return toast.error("Missing logistical coordinates (Address)")

    setProcessingId("checkout")
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalTotal,
          email: profile.email,
          service: `Multi-Asset Order: ${cart.length} items`,
          metadata: {
            userId: profile.uid,
            userName: profile.name,
            items: cart.map(i => ({ productId: i.id, title: i.title, price: i.price, quantity: i.quantity, variantSelected: i.variantSelected })),
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            total: finalTotal,
            ...delivery,
          }
        })
      })
      const data = await res.json()
      if (!data.authorization_url) throw new Error("Payment protocol failure")

      await shopService.placeOrder({
        userId: profile.uid,
        userName: profile.name,
        userEmail: profile.email,
        items: cart.map(i => ({ productId: i.id, title: i.title, price: i.price, quantity: i.quantity, variantSelected: i.variantSelected })),
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: finalTotal,
        ...delivery,
      })

      window.location.href = data.authorization_url
    } catch (err: any) {
      toast.error(err.message || "Checkout Protocol Failed")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4 relative">
      {/* Header & Cart Access */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.4em]">Integrated Supply Hub</span>
           </div>
           <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-foreground">The Vault</h2>
           <p className="text-muted-foreground font-medium italic mt-2 text-lg">Acquire official AGBA documentation and mission assets.</p>
        </div>

        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative bg-card border border-white/5 h-20 w-20 md:h-24 md:w-24 rounded-[2rem] flex items-center justify-center hover:bg-white/5 transition-all group shadow-2xl"
        >
          <ShoppingBag className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-black h-8 w-8 rounded-full flex items-center justify-center font-black text-xs border-4 border-black animate-in zoom-in">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-card rounded-3xl animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-[3rem] border border-muted italic mx-4">
           <Package className="h-10 w-10 text-gray-800 mx-auto mb-4" />
           <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">The Vault is currently sealed. No active assets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
          {products.map((item) => (
            <motion.div
              key={item.id}
              onClick={() => {
                setSelectedItem(item);
                const initial: any = {};
                item.variants?.forEach(v => {
                   if (v.options.length > 0) initial[v.name] = v.options[0];
                });
                setSelectedVariants(initial);
              }}
              className="group bg-card border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-yellow-400/50 transition-all flex flex-col h-full shadow-lg"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                 <img src={getDirectDriveUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                 <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black text-yellow-500 uppercase tracking-widest border border-white/5">
                    {item.category}
                 </div>
              </div>
              <div className="p-5 flex flex-col flex-1 space-y-2">
                 <h3 className="text-sm font-black italic uppercase text-white truncate group-hover:text-yellow-400 transition-colors">{item.title}</h3>
                 <p className="text-[10px] text-gray-500 font-bold truncate">{item.description}</p>
                 <div className="pt-2 flex items-center justify-between mt-auto">
                    <p className="text-sm font-black text-white italic">#{(item.price || 0).toLocaleString()}</p>
                    <div className="h-8 w-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all">
                       <Plus className="h-4 w-4" />
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 50 }} className="relative w-full max-w-5xl bg-[#0A0A0A] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
                <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 z-30 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all"><X className="h-5 w-5" /></button>
                
                <div className="md:w-1/2 p-6 md:p-12 flex flex-col bg-white/5 items-center justify-center">
                   <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      <img src={getDirectDriveUrl(selectedItem.image)} alt={selectedItem.title} className="w-full h-full object-cover" />
                   </div>
                </div>

                <div className="md:w-1/2 p-8 md:p-14 flex flex-col space-y-8 overflow-y-auto custom-scrollbar">
                   <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-500 italic">Vault Intelligence Registry</span>
                      <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mt-3 leading-tight">{selectedItem.title}</h3>
                      <p className="text-3xl font-black text-white italic mt-4">#{(selectedItem.price || 0).toLocaleString()}</p>
                   </div>

                   <p className="text-gray-400 font-medium italic text-lg leading-relaxed">{selectedItem.description}</p>

                   {selectedItem.variants && selectedItem.variants.length > 0 && (
                      <div className="space-y-8 py-4 border-y border-white/5">
                         {selectedItem.variants.map((v) => (
                           <div key={v.name} className="space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Pick {v.name}</p>
                              <div className="flex flex-wrap gap-3">
                                 {v.options.map(opt => (
                                    <button 
                                      key={opt}
                                      onClick={() => setSelectedVariants(prev => ({ ...prev, [v.name]: opt }))}
                                      className={`px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                        selectedVariants[v.name] === opt 
                                        ? 'bg-white text-black border-white shadow-xl scale-105' 
                                        : 'bg-black text-gray-400 border-white/5 hover:border-white/20'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                 ))}
                              </div>
                           </div>
                         ))}
                      </div>
                   )}

                   <Button 
                    onClick={() => {
                        addToCart({ 
                          ...selectedItem, 
                          id: `${selectedItem.id}-${Object.values(selectedVariants).join('-')}`,
                          variantSelected: selectedVariants 
                        });
                        toast.success("Asset logged to cart protocol");
                        setSelectedItem(null);
                    }}
                    className="w-full h-20 rounded-2xl bg-white text-black hover:bg-yellow-400 font-black uppercase text-xs tracking-[0.3em] transition-all shadow-2xl flex items-center justify-center gap-3 mt-auto"
                   >
                    Add Asset to Cart Protocol
                   </Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer Protocol */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[130] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="relative w-full max-w-lg bg-[#0A0A0A] border-l border-white/10 h-full flex flex-col shadow-2xl">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black">
                 <h3 className="text-3xl font-black italic uppercase tracking-tighter">Your Hub Cart</h3>
                 <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/5 rounded-2xl transition-all"><X className="h-6 w-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8">
                 {cart.length === 0 ? (
                   <div className="text-center py-20 italic">
                      <ShoppingBag className="h-12 w-12 text-gray-800 mx-auto mb-4" />
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Active cart is empty</p>
                   </div>
                 ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex gap-6 items-center p-4 rounded-3xl bg-white/5 border border-white/5 transition-all hover:border-white/10">
                         <div className="h-20 w-20 rounded-2xl overflow-hidden border border-white/5 flex-shrink-0">
                            <img src={getDirectDriveUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="font-black italic uppercase text-white truncate text-sm">{item.title}</h4>
                            {item.variantSelected && (
                               <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest mt-1">
                                  {Object.entries(item.variantSelected).map(([k, v]) => `${k}: ${v}`).join(" // ")}
                               </p>
                            )}
                            <p className="text-yellow-400 font-black text-xs italic mt-1">#{(item.price * item.quantity).toLocaleString()}</p>
                            <div className="flex items-center gap-4 mt-3">
                               <div className="flex bg-black border border-white/5 rounded-lg overflow-hidden">
                                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-white/5 transition-all">-</button>
                                  <span className="px-4 py-1 text-[10px] font-black border-x border-white/5">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-white/5 transition-all">+</button>
                               </div>
                               <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                            </div>
                         </div>
                      </div>
                    ))
                 )}
              </div>

              {cart.length > 0 && (
                <div className="p-10 bg-black border-t border-white/5 space-y-6">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Subtotal Assets</p>
                      <p className="text-3xl font-black italic text-white">#{subtotal.toLocaleString()}</p>
                   </div>
                   <Button 
                    onClick={() => { setIsCartOpen(false); setCheckoutOpen(true); }}
                    className="w-full bg-yellow-400 text-black hover:bg-white h-20 rounded-3xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-2xl shadow-yellow-400/20"
                   >
                    Proceed to Initialisation
                   </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Selection Modal */}
      <AnimatePresence>
        {checkoutOpen && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCheckoutOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} className="relative w-full max-w-2xl bg-black border border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl">
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                 <h3 className="text-3xl font-black italic uppercase tracking-tighter">Logistical Initialisation</h3>
                 <button onClick={() => setCheckoutOpen(false)} className="p-2 hover:bg-white/5 rounded-2xl transition-all"><X className="h-6 w-6" /></button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto max-h-[60vh]">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Asset Target Territory (State)</label>
                       <select 
                        value={delivery.state} 
                        onChange={e => setDelivery({...delivery, state: e.target.value})}
                        className="w-full bg-[#111] border border-white/5 rounded-2xl h-14 px-6 text-white text-[11px] font-black uppercase tracking-widest outline-none focus:border-yellow-400/50 transition-all appearance-none"
                       >
                         {nigerianStates.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">City Coordinate</label>
                       <Input value={delivery.city} onChange={e => setDelivery({...delivery, city: e.target.value})} className="bg-white/5 border-white/5 rounded-2xl h-14 px-6 text-[11px] font-black uppercase tracking-widest" placeholder="e.g. Ikeja" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Deployment Address</label>
                    <Input value={delivery.address} onChange={e => setDelivery({...delivery, address: e.target.value})} className="bg-white/5 border-white/5 rounded-2xl h-14 px-6 text-[11px] font-black uppercase tracking-widest" placeholder="Street Name, House Number" />
                 </div>

                 <div className="p-8 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-500/10 space-y-4">
                    <div className="flex justify-between items-center">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Assets Subtotal</p>
                       <p className="text-lg font-black italic text-white">#{(subtotal || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Logistics (Delivery)</p>
                       <p className="text-lg font-black italic text-indigo-400">#{(deliveryFee || 0).toLocaleString()}</p>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                       <p className="text-xs font-black uppercase tracking-widest text-yellow-500 italic">Total Acquisition Protocol</p>
                       <p className="text-3xl font-black italic text-white">#{(finalTotal || 0).toLocaleString()}</p>
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-white/5">
                 <Button 
                   onClick={handleInitiateOrder}
                   disabled={!!processingId || !delivery.address || !delivery.city}
                   className="w-full bg-white text-black hover:bg-yellow-400 h-20 rounded-3xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {processingId === "checkout" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="animate-pulse">Authorizing...</span>
                      </>
                   ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Execute Acquisition
                      </>
                   )}
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
