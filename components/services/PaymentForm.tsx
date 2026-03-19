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
import { toast } from "sonner"

type Props = {
    service: string
    amount: number
    category?: "service" | "academy" | "gopro" | "event"
}

export default function PaymentForm({ service, amount, category = "service" }: Props) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
    })
    const [loading, setLoading] = useState(false)
    const [termsAccepted, setTermsAccepted] = useState(false)

    // Promo Code State
    const [promoCode, setPromoCode] = useState("")
    const [discount, setDiscount] = useState(0)
    const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleApplyPromo = () => {
        const code = promoCode.trim().toUpperCase()

        if (!code) return

        let discountPercent = 0

        if (code === "AGBA10") discountPercent = 0.10
        else if (code === "STUDENT") discountPercent = 0.20
        else if (code === "PROMO50") discountPercent = 0.50

        if (discountPercent > 0) {
            const discountValue = amount * discountPercent
            setDiscount(discountValue)
            setPromoMessage({ type: 'success', text: `Promo applied! You saved #${discountValue.toLocaleString()}` })
        } else {
            setDiscount(0)
            setPromoMessage({ type: 'error', text: "Invalid promo code" })
        }
    }

    const finalAmount = amount - discount

    const handlePayment = async () => {
        try {
            setLoading(true)

            const res = await fetch("/api/paystack/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: finalAmount, // Use discounted amount
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
                toast.error(data.message || "Failed to initialize payment")
            }
        } catch (err) {
            console.error(err)
            toast.error("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const getTitle = () => {
        if (category === "gopro") return "Go PRO WITH ÀGBÀ CINEMA Terms and Conditions"
        if (category === "academy") return "Academy Terms and Conditions"
        if (category === "event") return "Event Ticket Terms and Conditions"
        return "Service Terms and Conditions"
    }

    return (
        <div className="bg-card p-8 rounded-[2.5rem] shadow-premium border border-muted space-y-8 transition-colors">
            <header>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Initiate Transaction</h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Operational details required for deployment</p>
            </header>
 
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Operator Name</Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        placeholder="e.g. AGBA CINEMA"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="h-14 rounded-2xl border-muted bg-muted/30 text-foreground font-bold"
                        required
                    />
                </div>
 
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Secure Email Signal</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="agbacinema@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-14 rounded-2xl border-muted bg-muted/30 text-foreground font-bold"
                        required
                    />
                </div>
 
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Direct Comms (Phone)</Label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+234..."
                        value={formData.phone}
                        onChange={handleChange}
                        className="h-14 rounded-2xl border-muted bg-muted/30 text-foreground font-bold"
                        required
                    />
                </div>
            </div>

            {/* Promo Code Section */}
            <div className="space-y-3 pt-6 border-t border-muted transition-colors">
                <Label htmlFor="promoCode" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Strategic Promo Code</Label>
                <div className="flex gap-2">
                    <Input
                        id="promoCode"
                        placeholder="CODE"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="h-12 rounded-xl border-muted bg-muted/30 uppercase font-black tracking-widest"
                    />
                    <Button type="button" variant="outline" onClick={handleApplyPromo} className="rounded-xl h-12 px-6 font-black text-[10px] uppercase tracking-widest border-2 hover:bg-foreground hover:text-background transition-all">
                        Apply
                    </Button>
                </div>
                {promoMessage && (
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${promoMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                        {promoMessage.text}
                    </p>
                )}
            </div>

            {/* Price Summary */}
            <div className="bg-muted/50 p-6 rounded-2xl space-y-3 border border-muted transition-colors">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Operational Fee:</span>
                    <span className="text-foreground">#{amount.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-green-500">
                        <span>Rebate Applied:</span>
                        <span>-#{discount.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between items-center border-t border-muted/50 pt-4 mt-2">
                    <span className="text-sm font-black italic uppercase tracking-tighter text-foreground">Total Commitment:</span>
                    <span className="text-2xl font-black italic text-foreground">#{finalAmount.toLocaleString()}</span>
                </div>
            </div>

            <div className="flex items-start space-x-3 my-4">
                <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    className="mt-1 border-muted data-[state=checked]:bg-yellow-400"
                />
                <label
                    htmlFor="terms"
                    className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-widest cursor-pointer select-none"
                >
                    I acknowledge and accept the full administrative{" "}
                    <Dialog>
                        <DialogTrigger asChild>
                            <button type="button" className="text-foreground font-black underline hover:text-yellow-400 focus:outline-none transition-colors">
                                Protocols & Terms
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-[2.5rem] border-muted bg-card">
                            <DialogHeader className="p-8 bg-black text-white border-b border-white/10">
                                <p className="text-[9px] text-yellow-500 font-black uppercase tracking-[0.3em] mb-1">Authorization Protocol</p>
                                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">{getTitle()}</DialogTitle>
                                <DialogDescription className="text-gray-400 font-medium">
                                    Review these mandates before initiating secure synchronization.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto p-8 text-sm space-y-6 text-foreground">                                {category === "event" && (
                                    <>
                                        <p><strong>1. Ticket Validity:</strong> Tickets are valid only for the specific event, date, and time indicated. Please present your ticket at the entrance.</p>
                                        <p><strong>2. Refunds & Transfers:</strong> Tickets are non-refundable but may be transferable up to 48 hours before the event, subject to approval.</p>
                                        <p><strong>3. Event Changes:</strong> The organizers reserve the right to make changes to the event schedule, speakers, or venue if necessary. Attendees will be notified of significant changes.</p>
                                        <p><strong>4. Photography & Recording:</strong> By attending, you consent to being photographed or filmed for promotional purposes.</p>
                                        <p><strong>5. Conduct:</strong> We are committed to providing a safe and respectful environment. Harassment or disruptive behavior will not be tolerated.</p>
                                    </>
                                )}

                                {category === "gopro" && (
                                    <>
                                        <h4 className="font-bold">1. PROGRAM OVERVIEW</h4>
                                        <p>The Talent is enrolling in the "Go PRO WITH ÀGBÀ CINEMA" program, a Four-week intensive training followed by a six-month internship. During the internship, the Talent will work on real-life projects from ÀGBÀ CINEMA and partnered brands.</p>

                                        <h4 className="font-bold">2. RULES & REGULATIONS</h4>
                                        <p><strong>2.1 Attendance & Participation</strong></p>
                                        <ul className="list-disc pl-5">
                                            <li>Missing training sessions for five (5) days (consecutively or cumulatively) without aproval  will result in a fine of ₦5,000.</li>
                                            <li>The Talent must actively engage in the program, including discussions, assignments, and practical projects to qualify for every stage.</li>
                                        </ul>

                                        <p><strong>2.2 Certification & Representation</strong></p>
                                        <ul className="list-disc pl-5">
                                            <li>The Talent must not include any reference to this program on their CV, portfolio, or professional platforms until they have been officially certified by ÀGBÀ CINEMA.</li>
                                        </ul>

                                        <p><strong>2.3 Performance Grading & Refund</strong></p>
                                        <ul className="list-disc pl-5">
                                            <li>A commitment fee is required to join the program.</li>
                                            <li>The commitment fee will be fully refunded if the Talent achieves a minimum performance grading score of 75% at the end of the program.</li>
                                        </ul>

                                        <p><strong>2.4 Conduct & Termination</strong></p>
                                        <ul className="list-disc pl-5">
                                            <li><strong>Professionalism & Respect:</strong> The Talent is expected to maintain a respectful attitude towards trainers, team members, and clients. If the Talent receives three (3) formal queries from partnered brands, the contract will be terminated immediately.</li>
                                            <li><strong>Social Media & Engagement:</strong> The Talent must participate in the daily challenge, which requires daily posts through out the program.</li>
                                            <li><strong>Defamation & Reputation:</strong> Any act of defamation or spreading false information that damages the reputation of ÀGBÀ CINEMA will result in immediate termination of the contract.</li>
                                        </ul>

                                        <h4 className="font-bold">3. INTERNSHIP TERMS</h4>
                                        <ul className="list-disc pl-5">
                                            <li>The internship is for six (6) months after the training.</li>
                                            <li>The Talent will work on real-world projects assigned by ÀGBÀ CINEMA and partnered brands.</li>
                                            <li>The internship does not guarantee employment but serves as an opportunity to gain experience and build a portfolio.</li>
                                        </ul>

                                        <h4 className="font-bold">4. AGREEMENT ACCEPTANCE</h4>
                                        <p>By accepting this contract, the Talent agrees to abide by all the terms and conditions stated above.</p>
                                    </>
                                )}

                                {category === "academy" && (
                                    <>
                                        <p><strong>1. Enrollment & Fees:</strong> Academy enrollment is confirmed upon payment of the required fees. Fees are non-refundable unless otherwise stated in specific course policies.</p>
                                        <p><strong>2. Course Materials:</strong> All course materials provided are for personal use only and may not be reproduced or distributed without permission.</p>
                                        <p><strong>3. Attendance & Conduct:</strong> Students are expected to attend classes regularly and conduct themselves professionally. Disruptive behavior may result in dismissal.</p>
                                        <p><strong>4. Certification:</strong> Certificates of completion are awarded to students who meet the attendance and assessment requirements.</p>
                                        <p><strong>5. Schedule Changes:</strong> We reserve the right to modify class schedules or instructors if necessary, with reasonable notice provided to students.</p>
                                    </>
                                )}

                                {category === "service" && (
                                    <>
                                        <p><strong>1. Booking Confirmation:</strong> All bookings are subject to availability and confirmation by our team. A confirmation email will be sent upon successful payment.</p>
                                        <p><strong>2. Payment Policy:</strong> Full payment or the specified commitment fee is required to secure your booking. Payments are processed securely via Paystack.</p>
                                        <p><strong>3. Cancellation & Refunds:</strong> Cancellations made less than 48 hours before the scheduled service may incur a fee. Refundable fees are returned subject to meeting the agreed conditions.</p>
                                        <p><strong>4. Service Delivery:</strong> We strive to deliver high-quality services within the agreed timelines. However, unforeseen circumstances may cause delays, which will be communicated promptly.</p>
                                        <p><strong>5. Intellectual Property:</strong> Unless otherwise agreed, we retain the right to showcase completed works in our portfolio.</p>
                                    </>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </label>
            </div>

            <Button
                className="w-full h-16 rounded-[1.5rem] bg-foreground text-background font-black italic uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-foreground/10 disabled:grayscale"
                onClick={handlePayment}
                disabled={loading || !formData.email || !formData.fullName || !formData.phone || !termsAccepted}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Initializing Sync...
                    </>
                ) : (
                    `Authorize #${finalAmount.toLocaleString()}`
                )}
            </Button>
        </div>
    )
}
