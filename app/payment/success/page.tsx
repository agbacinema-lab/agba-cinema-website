"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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
                        <Link href="/contact">Contact Support</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/">Return Home</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>

            <div className="flex flex-col items-center justify-center gap-2 text-gray-600 mb-8 max-w-md">
                {emailSent ? (
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-green-500" />
                        <p>Confirmation email sent to <strong>{details?.customer?.email}</strong>.</p>
                    </div>
                ) : details?.emailError ? (
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-red-500 text-sm">Email failed: {details.emailError}</p>
                        <p className="text-xs text-gray-500 italic">Check your Vercel Environment Variables</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <p>Payment verified. Finalizing your booking...</p>
                    </div>
                )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 w-full max-w-md text-left">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Reference:</span>
                    <span className="font-mono font-medium">{details?.reference}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium">
                        {(details?.amount / 100).toLocaleString("en-NG", { style: "currency", currency: "NGN" })}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Service:</span>
                    <span className="font-medium">{details?.metadata?.service || "N/A"}</span>
                </div>
            </div>

            <div className="flex gap-4">
                <Button onClick={() => router.replace("/")}>
                    Return Home
                </Button>
                <Button variant="outline" onClick={() => router.replace("/")}>
                    Go to Dashboard
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
