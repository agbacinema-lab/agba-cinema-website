"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService, UserRole } from "@/lib/auth-service"
import { specializationService } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Zap, Users, CheckCircle2, ArrowRight, ArrowLeft, 
  AlertCircle, CreditCard, ShieldCheck, Loader2, Eye, EyeOff, Mail
} from "lucide-react"
import { toast } from "sonner"

const STEPS = ["Program", "Specialization", "Payment", "Account"]

export default function RegisterFormClient({
  initialRole,
  paymentRef,
  email: initialEmail,
  name: initialName,
  initialProgram,
}: {
  initialRole: UserRole
  paymentRef: string | null
  email: string
  name: string
  initialProgram?: string
}) {
  const router = useRouter()
  const [role, setRole] = useState<UserRole>(initialRole)
  const [email, setEmail] = useState(initialEmail || "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState(initialName || "")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [staffPending, setStaffPending] = useState(false)
  const [countdown, setCountdown] = useState(3)

  // Student multi-step
  const [step, setStep] = useState(1)
  const [programType, setProgramType] = useState<"gopro" | "mentorship">(
    initialProgram === "mentorship" ? "mentorship" : "gopro"
  )
  const [specialization, setSpecialization] = useState("")
  const [specializationLabel, setSpecializationLabel] = useState("")
  const [specializationPrice, setSpecializationPrice] = useState(0)
  const [specializations, setSpecializations] = useState<any[]>([])
  const [loadingSpecs, setLoadingSpecs] = useState(false)

  // Payment state
  const [payEmail, setPayEmail] = useState(initialEmail || "")
  const [payName, setPayName] = useState(initialName || "")
  const [initiatingPayment, setInitiatingPayment] = useState(false)
  const [verifiedRef, setVerifiedRef] = useState<string | null>(paymentRef)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [verifyingRef, setVerifyingRef] = useState(false)
  const [academySettings, setAcademySettings] = useState({ activeCohort: 'Cohort 3', cohortStartDate: 'August' })

  useEffect(() => {
    const loadAcademy = async () => {
      try {
        const { adminService } = await import('@/lib/services')
        const settings = await adminService.getAcademySettings()
        if (settings) {
          setAcademySettings({
            activeCohort: settings.activeCohort || 'Cohort 3',
            cohortStartDate: settings.cohortStartDate || 'August'
          })
        }
      } catch (e) {
        console.error("Failed to load academy settings", e)
      }
    }
    loadAcademy()
  }, [])

  const isStudent = role === "student"

  // If a paymentRef came via URL (Paystack redirect), auto-verify it
  useEffect(() => {
    if (paymentRef && isStudent) {
      verifyPayment(paymentRef)
    }
  }, [])

  // Auto-redirect after success (students & brands only)
  useEffect(() => {
    if (!success) return
    if (countdown <= 0) {
      const target = role === "student" ? "/student/dashboard" : role === "brand" ? "/brand/dashboard" : "/admin"
      router.push(target)
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [success, countdown, role, router])

  useEffect(() => {
    if (isStudent && step === 2) loadSpecializations()
  }, [step, programType, isStudent])

  const loadSpecializations = async () => {
    setLoadingSpecs(true)
    try {
      const data = await specializationService.getSpecializationsByProgram(programType)
      setSpecializations(data)
    } catch { setSpecializations([]) }
    finally { setLoadingSpecs(false) }
  }

  // ── Launch Paystack ──────────────────────────────────────────────────────────
  const handlePayWithPaystack = async () => {
    if (!payEmail) { toast.error("Enter your email to proceed with payment."); return }
    setInitiatingPayment(true)
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: payEmail,
          amount: specializationPrice,
          fullName: payName,
          service: `AGBA Academy — ${programType === "gopro" ? "Go Pro" : "Mentorship"} (${specializationLabel})`,
        })
      })
      const data = await res.json()
      if (data.authorization_url) {
        // Store enrollment context in sessionStorage so we can restore after redirect
        sessionStorage.setItem("agba_enroll", JSON.stringify({
          programType, specialization, specializationLabel, specializationPrice, payEmail, payName
        }))
        window.location.href = data.authorization_url
      } else {
        toast.error(data.message || "Failed to initialize payment. Try again.")
      }
    } catch { toast.error("Network error. Please check your connection.") }
    finally { setInitiatingPayment(false) }
  }

  // ── Verify Paystack transaction ──────────────────────────────────────────────
  const verifyPayment = async (ref: string) => {
    setVerifyingRef(true)
    try {
      const res = await fetch(`/api/paystack/verify/${ref}`)
      const data = await res.json()
      if (data.success && data.data?.status === "success") {
        setPaymentVerified(true)
        setVerifiedRef(ref)
        // Restore enrollment context from sessionStorage
        const stored = sessionStorage.getItem("agba_enroll")
        if (stored) {
          const ctx = JSON.parse(stored)
          setProgramType(ctx.programType)
          setSpecialization(ctx.specialization)
          setSpecializationLabel(ctx.specializationLabel)
          if (ctx.specializationPrice) setSpecializationPrice(ctx.specializationPrice)
          setPayEmail(ctx.payEmail)
          setPayName(ctx.payName)
          setEmail(ctx.payEmail)
          setName(ctx.payName)
          sessionStorage.removeItem("agba_enroll")
        }
        // Jump straight to account creation
        setStep(4)
      } else {
        toast.error("Payment could not be verified. Contact support if you were charged.")
      }
    } catch { toast.error("Verification failed. Please try again.") }
    finally { setVerifyingRef(false) }
  }

  // ── Register handlers ────────────────────────────────────────────────────────
  const handleGoogleRegister = async () => {
    setLoading(true)
    try {
      const activeCohort = programType === "gopro" ? academySettings.activeCohort : undefined
      await authService.signInWithGoogle(role, isStudent ? programType : undefined, isStudent ? specialization : undefined, activeCohort)
      if (role === 'staff') {
        setStaffPending(true)
      } else {
        setSuccess(true)
        toast.success("Account created successfully!")
      }
    } catch { toast.error("Registration failed. Please try again.") }
    finally { setLoading(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }
    setLoading(true)
    try {
      const activeCohort = programType === "gopro" ? academySettings.activeCohort : undefined
      await authService.signUpWithEmail(email, password, name, role, isStudent ? programType : undefined, isStudent ? specialization : undefined, activeCohort)
      if (role === 'staff') {
        setStaffPending(true)
      } else {
        setSuccess(true)
        toast.success("Account created successfully!")
      }
    } catch (error) {
      toast.error("Registration failed: " + (error as any).message)
    } finally { setLoading(false) }
  }

  // ── Verifying payment on page load ──────────────────────────────────────────
  if (verifyingRef) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 text-yellow-400 animate-spin" />
        <p className="text-white font-black uppercase tracking-widest text-sm">Verifying payment with Paystack...</p>
      </div>
    )
  }

  // ── Staff Pending Approval Screen ────────────────────────────────────────────
  if (staffPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center space-y-8"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-36 h-36 bg-yellow-400 rounded-[3rem] flex items-center justify-center mx-auto shadow-[0_40px_80px_rgba(250,204,21,0.4)]"
          >
            <ShieldCheck className="h-20 w-20 text-black" strokeWidth={2.5} />
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              Registration Submitted!
            </h2>
            <p className="text-gray-400 text-base font-medium leading-relaxed">
              Your staff account is <span className="text-yellow-400 font-black">pending admin approval</span>.
              The superadmin has been notified and will review your application.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400/20 rounded-2xl flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">What happens next</p>
                <p className="text-sm text-white font-semibold">Check your email within 24 hours</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm ml-13">
              Once the admin reviews your application, you'll receive an email confirmation to proceed to your dashboard.
            </p>
          </div>

          <a
            href="/login"
            className="inline-block mt-4 px-8 py-3 rounded-2xl border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-all"
          >
            Back to Login
          </a>
        </motion.div>
      </div>
    )
  }

  // ── Success Screen ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center space-y-10"
        >
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-36 h-36 bg-yellow-400 rounded-[3rem] flex items-center justify-center mx-auto shadow-[0_40px_80px_rgba(250,204,21,0.4)]"
          >
            <CheckCircle2 className="h-20 w-20 text-black" strokeWidth={2.5} />
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Account Created!</h2>
            <p className="text-gray-400 font-medium text-lg">
              Welcome to ÀGBÀ Academy. Loading your dashboard...
            </p>
          </div>

          {/* Countdown ring */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#FACC15" strokeWidth="6"
                  strokeDasharray={`${213.6}`}
                  strokeDashoffset={`${213.6 * (countdown / 3)}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-white">{countdown}</span>
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Redirecting in {countdown}s</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Non-student: simple form ─────────────────────────────────────────────────
  if (!isStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md w-full">
          <div className="bg-white shadow-2xl rounded-[2.5rem] p-10 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black italic uppercase tracking-tight">Create Account</h2>
              <p className="text-gray-500 mt-2 text-sm font-medium">Choose your pathway below</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              {(["staff", "brand"] as UserRole[]).map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all capitalize ${role === r ? "bg-white text-black shadow-sm" : "text-gray-500"}`}
                >{r}</button>
              ))}
            </div>
            <Button type="button" onClick={handleGoogleRegister} disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 h-14 rounded-2xl flex items-center justify-center gap-4 font-bold shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" /> Continue with Google
            </Button>
            <form onSubmit={handleRegister} className="space-y-4">
              <Input placeholder="Full Name" className="h-12 rounded-xl border-gray-100 bg-gray-50" value={name} onChange={e => setName(e.target.value)} required />
              <Input type="email" placeholder="Email" className="h-12 rounded-xl border-gray-100 bg-gray-50" value={email} onChange={e => setEmail(e.target.value)} required />
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Password" className="h-12 rounded-xl border-gray-100 bg-gray-50 pr-10" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Input type={showPassword ? "text" : "password"} placeholder="Confirm Password" className="h-12 rounded-xl border-gray-100 bg-gray-50" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              <Button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black font-black h-14 rounded-2xl">
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </form>
            <p className="text-xs text-gray-500 text-center">Already have an account? <a href="/login" className="text-yellow-600 font-bold underline">Sign in</a></p>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Student: 4-Step Registration Flow ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
            ÀGBÀ <span className="text-yellow-400">Academy</span>
          </h1>
          <p className="text-gray-500 font-medium">Complete enrollment to unlock your cinematic future.</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => {
            const s = i + 1
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${step > s ? "bg-yellow-400 text-black" : step === s ? "bg-white text-black" : "bg-white/10 text-white/30"}`}>
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest hidden md:block ${step === s ? "text-white" : "text-white/30"}`}>{label}</span>
                {s < 4 && <div className={`flex-1 h-px ${step > s ? "bg-yellow-400" : "bg-white/10"}`} />}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-[0_60px_120px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Program ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tight">Choose Program</h2>
                  <p className="text-gray-500 text-sm font-medium mt-1">Select your training pathway.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {([
                    { value: "gopro", label: `Go Pro (${academySettings.activeCohort})`, icon: Zap, desc: `Join ${academySettings.activeCohort} (Classes start ${academySettings.cohortStartDate}). 4-week intensive live classes followed by a 6-month internship.` },
                    { value: "mentorship", label: "Mentorship", icon: Users, desc: "1-on-1 guided live classes for 4 weeks. Personalised, fast-tracked, flexible scheduling." }
                  ] as const).map(({ value, label, icon: Icon, desc }) => (
                    <button key={value} onClick={() => setProgramType(value)}
                      className={`group relative p-8 rounded-[2rem] border-2 text-left transition-all duration-300 ${programType === value ? "border-yellow-400 bg-black text-white shadow-2xl shadow-yellow-400/20 scale-[1.02]" : "border-gray-100 bg-white hover:border-yellow-400/50 hover:shadow-lg"}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all ${programType === value ? "bg-yellow-400" : "bg-gray-100 group-hover:bg-yellow-100"}`}>
                        <Icon className={`h-6 w-6 ${programType === value ? "text-black" : "text-gray-600"}`} />
                      </div>
                      <h4 className="text-xl font-black italic uppercase tracking-tight mb-2">{label}</h4>
                      <p className={`text-sm font-medium mb-5 ${programType === value ? "text-gray-400" : "text-gray-500"}`}>{desc}</p>
                      {programType === value && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setSpecialization(""); setStep(2) }}
                  className="w-full bg-black text-white h-16 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-yellow-400 hover:text-black transition-all"
                >
                  Next: Pick Specialization <ArrowRight className="h-5 w-5" />
                </button>
                <p className="text-xs text-gray-400 text-center">Already enrolled? <a href="/login" className="text-yellow-600 font-bold underline">Sign in</a></p>
              </motion.div>
            )}

            {/* ── STEP 2: Specialization ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tight">Pick Your Track</h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                      What will you master in <span className="font-black text-black">{programType === "gopro" ? "Go Pro" : "Mentorship"}</span>?
                    </p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-black">← Change</button>
                </div>
                {loadingSpecs ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)}</div>
                ) : specializations.length === 0 ? (
                  <div className="text-center py-14 border-2 border-dashed border-gray-200 rounded-[2rem] space-y-3">
                    <AlertCircle className="h-10 w-10 text-gray-300 mx-auto" />
                    <p className="text-sm font-black uppercase tracking-widest text-gray-400">No tracks available yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specializations.map((spec) => (
                      <button key={spec.id} onClick={() => { setSpecialization(spec.value); setSpecializationLabel(spec.label || spec.title || spec.value); setSpecializationPrice(spec.price || 0) }}
                        className={`group relative p-6 rounded-[1.5rem] border-2 text-left transition-all ${specialization === spec.value ? "border-yellow-400 bg-black text-white shadow-xl" : "border-gray-100 bg-white hover:border-yellow-400/50 hover:shadow-md"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: spec.color || "#FCD34D" }} />
                          <div className="flex-1">
                            <p className={`font-black text-sm uppercase tracking-tight ${specialization === spec.value ? "text-white" : "text-gray-900"}`}>{spec.label || spec.title}</p>
                            {spec.description && <p className={`text-xs mt-1 font-medium ${specialization === spec.value ? "text-gray-400" : "text-gray-500"}`}>{spec.description}</p>}
                          </div>
                          {specialization === spec.value && <CheckCircle2 className="h-4 w-4 text-yellow-400 shrink-0" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl border-2 border-gray-200 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-gray-50">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={() => setStep(3)} disabled={!specialization || specializations.length === 0}
                    className="flex-1 bg-black text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-yellow-400 hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Paystack Payment ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tight">Secure Payment</h2>
                  <p className="text-gray-500 text-sm font-medium mt-1">Complete payment via Paystack to activate your enrollment.</p>
                </div>

                {/* Order Summary */}
                <div className="bg-black text-white p-8 rounded-[2rem] space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Enrollment Summary</p>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xl font-black uppercase italic tracking-tighter">
                        {programType === "gopro" ? "Go Pro" : "Mentorship"}
                      </p>
                      <p className="text-gray-400 text-sm font-medium">{specializationLabel.replace(/-/g, " ")}</p>
                    </div>
                    <p className="text-4xl font-black text-yellow-400">
                      ₦{specializationPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Contact for Payment */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Your Full Name</label>
                    <Input value={payName} onChange={e => setPayName(e.target.value)} placeholder="David Okon"
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email for Receipt</label>
                    <Input type="email" value={payEmail} onChange={e => setPayEmail(e.target.value)} placeholder="david@example.com"
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white font-bold"
                    />
                  </div>
                </div>

                {/* Paystack CTA */}
                <button
                  onClick={handlePayWithPaystack}
                  disabled={initiatingPayment || !payEmail}
                  className="w-full h-20 bg-[#0BA4DB] hover:bg-[#0992c5] text-white font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl shadow-[#0BA4DB]/30"
                >
                  {initiatingPayment ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Connecting to Paystack...</>
                  ) : (
                    <><CreditCard className="h-5 w-5" /> Pay ₦{specializationPrice.toLocaleString()} via Paystack</>
                  )}
                </button>

                <div className="flex items-center justify-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <p className="text-[11px] font-bold text-gray-400">Secured by Paystack · SSL Encrypted · Card & Bank Transfer</p>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 h-12 rounded-2xl border-2 border-gray-200 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-gray-50">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Account Creation (only reachable after payment) ── */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tight">Create Your Account</h2>
                  <p className="text-gray-500 text-sm font-medium mt-1">Final step — your login credentials.</p>
                </div>

                {/* Verified Payment Badge */}
                {paymentVerified && (
                  <div className="flex items-center gap-4 bg-green-50 border border-green-100 p-5 rounded-2xl">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight text-green-800">Payment Verified by Paystack</p>
                      <p className="text-xs text-green-600 font-medium mt-0.5">Ref: {verifiedRef}</p>
                    </div>
                  </div>
                )}

                {/* Enrollment summary pill */}
                <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-5">
                  <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shrink-0">
                    {programType === "gopro" ? <Zap className="h-5 w-5 text-black" /> : <Users className="h-5 w-5 text-black" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Enrolled in</p>
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                      {programType === "gopro" ? `Go Pro (${academySettings.activeCohort})` : "Mentorship"} — {specializationLabel.replace(/-/g, " ")}
                    </p>
                  </div>
                </div>

                {/* Google */}
                <Button type="button" onClick={handleGoogleRegister} disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 h-14 rounded-2xl flex items-center justify-center gap-4 font-bold shadow-sm"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" /> Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-400 font-bold uppercase">Or email & password</span></div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                    <Input placeholder="David Okon" className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                    <Input type="email" placeholder="david@example.com" className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white pr-10" value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Confirm Password</label>
                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black font-black h-14 rounded-2xl hover:bg-black hover:text-white transition-all">
                    {loading ? "Activating..." : "Activate Enrollment"}
                  </Button>
                </form>
                <p className="text-xs text-gray-400 text-center">Already have an account? <a href="/login" className="text-yellow-600 font-bold underline">Sign in</a></p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
