"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

type Props = {
    service: string
    amount: number
}

export default function PaymentForm({ service, amount }: Props) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
    })
    const [loading, setLoading] = useState(false)
    const [termsAccepted, setTermsAccepted] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handlePayment = async () => {
        try {
            setLoading(true)

            const res = await fetch("/api/paystack/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: amount, // You might want to make this dynamic
                    email: formData.email,
                    fullName: formData.fullName,
                    phone: formData.phone,
                    service,
                }),
            })

            const data = await res.json()

            if (res.ok && data.authorization_url) {
                window.location.href = data.authorization_url
            } else {
                alert(data.message || "Failed to initialize payment")
            }
        } catch (err) {
            console.error(err)
            alert("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
            <h3 className="text-xl font-semibold mb-4">Enter Your Details</h3>

            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+234..."
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="flex items-center space-x-2 my-4">
                <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    I agree to the{" "}
                    <Dialog>
                        <DialogTrigger asChild>
                            <button type="button" className="text-primary hover:underline focus:outline-none">
                                Terms and Conditions
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[425px] max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Terms and Conditions</DialogTitle>
                                <DialogDescription>
                                    Please read the following terms carefully before proceeding.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 text-sm space-y-4">
                                <p>
                                    <strong>1. Booking Confirmation:</strong> All bookings are subject to availability and confirmation by our team. A confirmation email will be sent upon successful payment.
                                </p>
                                <p>
                                    <strong>2. Payment Policy:</strong> Full payment or the specified commitment fee is required to secure your booking. Payments are processed securely via Paystack.
                                </p>
                                <p>
                                    <strong>3. Cancellation & Refunds:</strong> Cancellations made less than 48 hours before the scheduled service may incur a fee. Refundable fees are returned subject to meeting the agreed conditions.
                                </p>
                                <p>
                                    <strong>4. Service Delivery:</strong> We strive to deliver high-quality services within the agreed timelines. However, unforeseen circumstances may cause delays, which will be communicated promptly.
                                </p>
                                <p>
                                    <strong>5. Intellectual Property:</strong> Unless otherwise agreed, we retain the right to showcase completed works in our portfolio.
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </label>
            </div>

            <Button
                className="w-full mt-4"
                onClick={handlePayment}
                disabled={loading || !formData.email || !formData.fullName || !formData.phone || !termsAccepted}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    "Proceed to Payment"
                )}
            </Button>
        </div>
    )
}
