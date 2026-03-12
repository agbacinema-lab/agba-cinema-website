"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type FormData = {
  fullName: string
  email: string
  phone: string
  whyLearn: string
  hasLaptop: string
  hoursPerWeek: string
  program: string
  heard: string
  commitment: string
}

const initialData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  whyLearn: "",
  hasLaptop: "",
  hoursPerWeek: "",
  program: "",
  heard: "",
  commitment: "",
}

const steps = [
  { id: 1, title: "About You", desc: "Basic information" },
  { id: 2, title: "Your Goals", desc: "Why you want to learn" },
  { id: 3, title: "Commitment", desc: "Time & readiness" },
]

export default function ApplyPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(initialData)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (field: keyof FormData, value: string) =>
    setData(prev => ({ ...prev, [field]: value }))

  const isStep1Valid = data.fullName && data.email && data.phone
  const isStep2Valid = data.whyLearn && data.program
  const isStep3Valid = data.hasLaptop && data.hoursPerWeek && data.commitment

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-lg w-full"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">Application Received! 🎬</h1>
          <p className="text-gray-500 text-lg mb-6">
            Thank you, <strong>{data.fullName}</strong>! We've received your application for the <strong>Go Pro Program</strong>.
          </p>
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 text-left mb-8 space-y-2">
            <p className="text-sm font-bold text-yellow-700">What happens next:</p>
            <p className="text-sm text-gray-600">✅ We'll review your application within <strong>48 hours</strong></p>
            <p className="text-sm text-gray-600">📞 We'll schedule a free <strong>15-min consultation call</strong></p>
            <p className="text-sm text-gray-600">📧 Check <strong>{data.email}</strong> for updates</p>
          </div>
          <Button asChild className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-5 px-8 rounded-xl w-full">
            <a href="/">Back to Home</a>
          </Button>
          <p className="text-sm text-gray-400 mt-4">
            Questions? WhatsApp us:{" "}
            <a href="https://wa.me/2349000000000" className="text-green-600 font-semibold">+234 900 000 0000</a>
          </p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-12 text-center px-4">
        <span className="text-yellow-400 text-sm font-bold uppercase tracking-widest block mb-3">Go Pro Program 2026</span>
        <h1 className="text-3xl md:text-4xl font-black mb-2">Apply for the April Cohort</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Takes 3 minutes. We review every application and respond within 48 hours.
        </p>
        {/* Urgency */}
        <div className="inline-flex items-center gap-2 mt-4 bg-red-500/20 border border-red-400/30 text-red-400 text-sm font-bold px-4 py-2 rounded-full">
          ⚡ Only 2 slots remaining — {"{"}147{"}"} applications received this month
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                  ${step > s.id ? "bg-green-500 text-white" : step === s.id ? "bg-yellow-400 text-black" : "bg-gray-200 text-gray-400"}`}
                >
                  {step > s.id ? "✓" : s.id}
                </div>
                <p className={`text-xs mt-1 font-semibold hidden sm:block ${step === s.id ? "text-gray-900" : "text-gray-400"}`}>
                  {s.title}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${step > s.id ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <AnimatePresence mode="wait">
              {/* STEP 1 */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Tell us about yourself</h2>
                  <p className="text-gray-500 mb-6">Basic contact information so we can reach you.</p>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={data.fullName}
                        onChange={e => update("fullName", e.target.value)}
                        placeholder="Your full name"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={data.email}
                        onChange={e => update("email", e.target.value)}
                        placeholder="you@example.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp / Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={data.phone}
                        onChange={e => update("phone", e.target.value)}
                        placeholder="+234 xxx xxx xxxx"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">How did you hear about us?</label>
                      <select
                        value={data.heard}
                        onChange={e => update("heard", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 bg-white"
                      >
                        <option value="">Select one…</option>
                        <option value="instagram">Instagram</option>
                        <option value="twitter">X / Twitter</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="friend">Friend or referral</option>
                        <option value="google">Google Search</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Your goals</h2>
                  <p className="text-gray-500 mb-6">Help us understand what you're looking to achieve.</p>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Which program are you applying for? *
                      </label>
                      <select
                        required
                        value={data.program}
                        onChange={e => update("program", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 bg-white"
                      >
                        <option value="">Select a program…</option>
                        <option value="storytelling">Storytelling — ₦50,000</option>
                        <option value="video-editing">Video Editing Mentorship — ₦70,000</option>
                        <option value="motion-design">Motion Design — ₦150,000</option>
                        <option value="go-pro">Go Pro Program (full pathway)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Why do you want to learn video editing? *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={data.whyLearn}
                        onChange={e => update("whyLearn", e.target.value)}
                        placeholder="Tell us your story — what motivated you to apply, what you want to achieve, and where you see yourself in 6 months…"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 resize-none"
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700">
                          <strong>Tip:</strong> Applicants who share a specific goal (e.g. "I want to edit for fashion brands") are 3x more likely to be accepted. Be specific!
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Your commitment level</h2>
                  <p className="text-gray-500 mb-6">We accept serious students only — this helps us match you correctly.</p>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Do you own a laptop or desktop computer? *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Yes, I have one", "No, but I'm getting one", "I have access to one"].map(opt => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => update("hasLaptop", opt)}
                            className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200
                              ${data.hasLaptop === opt
                                ? "bg-yellow-400 border-yellow-400 text-black"
                                : "bg-gray-50 border-gray-200 text-gray-700 hover:border-yellow-300"
                              }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        How many hours can you practice weekly? *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Less than 5 hours", "5–10 hours", "10–20 hours", "20+ hours"].map(opt => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => update("hoursPerWeek", opt)}
                            className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200
                              ${data.hoursPerWeek === opt
                                ? "bg-yellow-400 border-yellow-400 text-black"
                                : "bg-gray-50 border-gray-200 text-gray-700 hover:border-yellow-300"
                              }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        I understand that this program requires active participation and self-study. I am ready to commit. *
                      </label>
                      <div className="flex gap-3">
                        {["Yes, I'm fully committed", "I need to think about it"].map(opt => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => update("commitment", opt)}
                            className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200
                              ${data.commitment === opt
                                ? "bg-yellow-400 border-yellow-400 text-black"
                                : "bg-gray-50 border-gray-200 text-gray-700 hover:border-yellow-300"
                              }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-5 rounded-xl font-semibold"
                >
                  ← Back
                </Button>
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                  onClick={() => setStep(s => s + 1)}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue →
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isStep3Valid || loading}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-5 rounded-xl disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </span>
                  ) : (
                    <>Submit Application <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Trust bar */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400 flex-wrap">
          <span>🔒 Your info is secure</span>
          <span>📞 We respond in 48hrs</span>
          <span>✅ Free consultation included</span>
        </div>
      </div>
    </main>
  )
}
