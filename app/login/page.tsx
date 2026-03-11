"use client"

import { useState } from "react"
import { authService } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ShieldCheck, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.login(email, password)
      window.location.href = "/admin"
    } catch (error) {
      alert("Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background visual */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-400 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-10">
          <CardHeader className="text-center p-0 mb-8">
            <CardTitle className="text-4xl font-black text-gray-900">Welcome Back</CardTitle>
            <p className="text-gray-500 mt-2">Log in to your talent account</p>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    type="email"
                    placeholder="you@example.com" 
                    className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all shadow-sm" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    type="password"
                    placeholder="••••••••" 
                    className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all shadow-sm" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black h-14 rounded-2xl shadow-xl shadow-yellow-400/20 group"
              >
                {loading ? "Authenticating..." : (
                  <span className="flex items-center gap-2">
                    Enter Portal <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
              
              <div className="text-center space-y-4 pt-4">
                <p className="text-sm text-gray-500">
                  New here? <a href="/register" className="text-yellow-600 font-black hover:underline">Create account</a>
                </p>
                <p className="text-xs text-gray-400 italic">
                  Brand? Log in using the registration page.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
