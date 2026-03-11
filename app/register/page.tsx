"use client"

import { useState } from "react"
import { authService, UserRole } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, User, ShieldCheck, Briefcase, Lock } from "lucide-react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get('role') as UserRole) || 'brand'
  const paymentRef = searchParams.get('ref')
  
  const [role, setRole] = useState<UserRole>(initialRole)
  const [email, setEmail] = useState(searchParams.get('email') || "")
  const [password, setPassword] = useState("")
  const [name, setName] = useState(searchParams.get('name') || "")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleGoogleRegister = async () => {
    setLoading(true)
    try {
      await authService.signInWithGoogle(role)
      setSuccess(true)
    } catch (error) {
      alert("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.signUpWithEmail(email, password, name, role)
      setSuccess(true)
    } catch (error) {
      alert("Registration failed: " + (error as any).message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full p-8 text-center rounded-[2rem] border-none shadow-premium">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎉</div>
          <h2 className="text-3xl font-black mb-4">Welcome to ÀGBÀ CINEMA!</h2>
          <p className="text-gray-500 mb-8">Your account has been created successfully. You can now access your dashboard.</p>
          <Button asChild className="w-full bg-yellow-400 text-black font-bold h-14 rounded-2xl">
            <a href="/admin">Go to Dashboard</a>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex bg-black relative items-center justify-center overflow-hidden p-20">
        <div className="absolute inset-0 z-0 bg-[url('/cinematic-video-setup.png')] bg-cover opacity-30" />
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-yellow-400/20 to-transparent" />
        
        <div className="relative z-20 text-white max-w-lg">
          <h1 className="text-6xl font-black mb-6 leading-tight">Join the <span className="text-yellow-400">Next Cohort</span> of Cinematic Experts.</h1>
          <p className="text-xl text-gray-300">Whether you're a student looking for mentorship, staff joining the team, or a brand looking for premium talent.</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-gray-50">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md w-full">
          <Card className="border-none shadow-premium rounded-[2.5rem] bg-white p-8">
            <CardHeader className="text-center p-0 mb-6">
              <CardTitle className="text-3xl font-black text-gray-900">Create Account</CardTitle>
              <p className="text-gray-500 mt-2">Choose your pathway below</p>
            </CardHeader>

            <CardContent className="p-0">
              <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
                {paymentRef && (
                  <button 
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${role === 'student' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                  >
                    Student
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => setRole('staff')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${role === 'staff' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                >
                  Staff
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('brand')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${role === 'brand' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                >
                  Brand
                </button>
              </div>

              {!paymentRef && role === 'student' ? (
                <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-2xl mb-6 text-center">
                  <Lock className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-1">Payment Required</h4>
                  <p className="text-xs text-gray-500">To create a student account, you must first pay for a class or program.</p>
                  <Button asChild variant="link" className="text-yellow-600 font-bold text-xs mt-2 underline">
                    <a href="/academy">View Programs →</a>
                  </Button>
                </div>
              ) : (
                <Button 
                  type="button"
                  onClick={handleGoogleRegister}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 h-14 rounded-2xl flex items-center justify-center gap-4 font-bold mb-6 shadow-sm"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </Button>
              )}

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">Or use email</span></div>
              </div>

              {(paymentRef || role !== 'student') && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                    <Input 
                      placeholder="David Okon" 
                      className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white" 
                      value={name} onChange={e => setName(e.target.value)} required={role !== 'brand'} 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                    <Input 
                      type="email" placeholder="david@example.com" 
                      className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white" 
                      value={email} onChange={e => setEmail(e.target.value)} required 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                    <Input 
                      type="password" placeholder="••••••••" 
                      className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white" 
                      value={password} onChange={e => setPassword(e.target.value)} required 
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black h-14 rounded-2xl shadow-lg shadow-yellow-400/20 mt-2">
                    {loading ? "Creating Account..." : `Sign up as ${role === 'brand' ? 'Brand' : role === 'staff' ? 'Staff' : 'Student'} →`}
                  </Button>
                  
                  <p className="text-center text-sm text-gray-500 pt-2">
                    Already have an account? <a href="/login" className="text-yellow-600 font-black hover:underline">Log in</a>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
