"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

interface BookingFormProps {
  service: string
}

export default function BookingForm({ service }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      service: service,
      projectLocation: formData.get("projectLocation"),
      projectBrief: formData.get("projectBrief"),
      idealDates: formData.get("idealDates"),
      preferredCommunication: formData.get("preferredCommunication"),
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Booking Request Sent!",
          description: "We'll get back to you within 24 hours.",
        })
        e.currentTarget.reset()
      } else {
        throw new Error("Failed to send booking request")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send booking request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Quote</CardTitle>
        <CardDescription>
          Fill out the form below and we'll get back to you with a detailed quote within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" name="fullName" required placeholder="Your full name" />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required placeholder="your@email.com" />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" name="phone" type="tel" required placeholder="+234 (0) 123 456 7890" />
          </div>

          <div>
            <Label htmlFor="projectLocation">Project Location *</Label>
            <Input
              id="projectLocation"
              name="projectLocation"
              required
              placeholder="Where will the project take place?"
            />
          </div>

          <div>
            <Label htmlFor="projectBrief">Project Brief *</Label>
            <Textarea
              id="projectBrief"
              name="projectBrief"
              required
              placeholder="Tell us about your project, vision, and any specific requirements..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="idealDates">Ideal Project Dates</Label>
            <Input id="idealDates" name="idealDates" placeholder="When would you like to schedule this project?" />
          </div>

          <div>
            <Label>Preferred Communication Method *</Label>
            <RadioGroup name="preferredCommunication" defaultValue="email" className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email-comm" />
                <Label htmlFor="email-comm">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone-comm" />
                <Label htmlFor="phone-comm">Phone Call</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whatsapp" id="whatsapp-comm" />
                <Label htmlFor="whatsapp-comm">WhatsApp</Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending Request..." : "Send Booking Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
