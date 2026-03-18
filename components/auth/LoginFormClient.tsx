"use client"

import { useState } from "react"
import { authService } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function LoginFormClient() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await authService.login(email, password)
      const profile = await authService.getUserProfile(result.user.uid)
      
      toast.success("Welcome back!")

      if (profile?.role === 'student') {
        window.location.href = '/student/dashboard'
      } else if (profile?.role === 'brand') {
        window.location.href = '/brand'
      } else {
        window.location.href = '/admin'
      }
    } catch (error) {
      toast.error("Login failed: " + (error as any).message)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const user = await authService.signInWithGoogle('student')
      const profile = await authService.getUserProfile(user.uid)
      
      toast.success("Login successful!")

      if (profile?.role === 'student') {
        window.location.href = '/student/dashboard'
      } else if (profile?.role === 'brand') {
        window.location.href = '/brand'
      } else {
        window.location.href = '/admin'
      }
    } catch (error) {
      toast.error("Login failed: " + (error as any).message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex bg-black relative items-center justify-center overflow-hidden p-20">
        <div className="absolute inset-0 z-0 opacity-30" />
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-yellow-400/20 to-transparent" />
        <div className="relative z-20 text-white max-w-lg">
          <h1 className="text-6xl font-black mb-6 leading-tight">Welcome back to <span className="text-yellow-400">ÀGBÀ CINEMA</span></h1>
          <p className="text-xl text-gray-300">Access your dashboard to manage your learning journey</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-gray-50">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md w-full">
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-8">
            <CardHeader className="text-center p-0 mb-8">
              <CardTitle className="text-3xl font-black text-gray-900">Sign In</CardTitle>
              <p className="text-gray-500 mt-2">to your ÀGBÀ CINEMA account</p>
            </CardHeader>

            <CardContent className="p-0">
              <Button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 h-14 rounded-2xl flex items-center justify-center gap-4 font-bold mb-8 shadow-sm"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Continue with Google
              </Button>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-100"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-bold">Or use email</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white pr-10"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black h-14 rounded-2xl mt-6 flex items-center justify-center gap-2"
                >
                  {loading ? 'Signing in...' : <>Sign In<ArrowRight className="h-4 w-4" /></>}
                </Button>
              </form>

              <div className="mt-8 space-y-4 text-center text-sm">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <a href="/register" className="text-yellow-600 font-bold hover:underline">
                    Create one
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
