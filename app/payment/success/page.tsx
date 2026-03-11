"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react"

function SuccessContent() {
    const searchParams = useSearchParams()
    const reference = searchParams.get("reference")
    const router = useRouter()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [details, setDetails] = useState<any>(null)
    const [emailSent, setEmailSent] = useState(false)

    useEffect(() => {
        if (!reference) {
            setStatus("error")
            return
        }

        const verifyPayment = async () => {
            try {
                const res = await fetch(`/api/paystack/verify/${reference}`)
                const data = await res.json()

                if (res.ok && data.success) {
                    setStatus("success")
                    setDetails(data.data)
                    setEmailSent(data.emailSent)
                    if (data.emailError) {
                        console.error("ServerEmailError:", data.emailError)
                        // @ts-ignore
                        setDetails(prev => ({ ...prev, emailError: data.emailError }))
                    }
                } else {
                    setStatus("error")
                }
            } catch (error) {
                console.error("Verification error:", error)
                setStatus("error")
            }
        }

        verifyPayment()
    }, [reference])

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                <h2 className="text-xl font-semibold">Verifying your payment...</h2>
                <p className="text-gray-500">Please do not close this window.</p>
            </div>
        )
    }

    if (status === "error") {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-600 mb-8 max-w-md">
                    We couldn't verify your payment. If you have been debited, please contact support with your reference number.
                </p>
                <div className="flex gap-4">
                    <Button asChild variant="outline">
                        <a href="/contact">Contact Support</a>
                    </Button>
                    <Button asChild>
                        <a href="/">Return Home</a>
                    </Button>
                </div>
            </div>
        )
    }

    const isStudentService = details?.metadata?.service?.toLowerCase().includes('academy') || 
                             details?.metadata?.service?.toLowerCase().includes('gopro') ||
                             details?.metadata?.service?.toLowerCase().includes('class');

    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>

            <div className="flex flex-col items-center justify-center gap-2 text-gray-600 mb-8 max-w-md">
                {emailSent ? (
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                        <Mail className="h-4 w-4 text-green-500" />
                        <p className="text-sm font-medium">Confirmation sent to <strong>{details?.customer?.email}</strong></p>
                    </div>
                ) : (
                    <p className="text-gray-500">Your transaction has been verified successfully.</p>
                )}
            </div>

            {isStudentService && (
                <Card className="bg-yellow-400 border-none p-8 rounded-[2rem] mb-10 shadow-xl shadow-yellow-400/20 max-w-md w-full">
                    <h3 className="text-2xl font-black text-black mb-3 text-center">Step 2: Create Account</h3>
                    <p className="text-black/80 font-medium mb-6">You've successfully paid for your class. Now, create your student portal to access your dashboard and portfolio.</p>
                    <Button 
                        onClick={() => router.push(`/register?role=student&ref=${reference}&email=${details?.customer?.email}&name=${details?.metadata?.fullName}`)} 
                        className="w-full bg-black text-white hover:bg-gray-900 h-14 rounded-2xl font-black text-lg"
                    >
                        Claim Your Student Portal →
                    </Button>
                </Card>
            )}

            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 mb-10 w-full max-w-md text-left shadow-sm">
                <div className="flex justify-between mb-4 border-b border-gray-50 pb-4">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Reference</span>
                    <span className="font-mono font-bold text-gray-900">{details?.reference}</span>
                </div>
                <div className="flex justify-between mb-4 border-b border-gray-50 pb-4">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Amount Paid</span>
                    <span className="font-black text-gray-900">
                        {(details?.amount / 100).toLocaleString("en-NG", { style: "currency", currency: "NGN" })}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Service</span>
                    <span className="font-bold text-gray-900">{details?.metadata?.service || "N/A"}</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                {!isStudentService && (
                    <Button onClick={() => router.replace("/admin")} className="flex-1 bg-black text-white h-14 rounded-2xl font-bold">
                        Go to Dashboard
                    </Button>
                )}
                <Button variant="outline" onClick={() => router.replace("/")} className="flex-1 border-gray-200 h-14 rounded-2xl font-bold text-gray-500">
                    Return Home
                </Button>
            </div>
        </div>
    )
}

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-center">Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="text-center">Loading...</div>}>
                        <SuccessContent />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
