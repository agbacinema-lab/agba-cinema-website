"use client";

import type React from "react";
import { useState, useRef } from "react";
import PaymentButtons from "@/components/services/PaymentButtons"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";


interface BookingFormProps {
  service: string;
}

export default function BookingForm({ service }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const data = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      projectLocation: formData.get("projectLocation"),
      projectBrief: formData.get("projectBrief"),
      idealDates: formData.get("idealDates"),
      preferredCommunication: formData.get("preferredCommunication"),
      service: formData.get("service"),
    };

    try {
      const response = await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_email: "agbacinema@gmail.com", // Admin notification
          to_name: "Admin",
          subject: `BOOKING REQUEST: ${data.service}`,
          message: `A new booking request has been received for ${data.service}.`,
          template_params: {
            client_name: data.fullName,
            client_email: data.email,
            client_phone: data.phone,
            service: data.service,
            location: data.projectLocation,
            brief: data.projectBrief,
            dates: data.idealDates,
            comms: data.preferredCommunication,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to send booking request");

      toast.success("Booking Request Sent!", {
        description: "We'll get back to you within 24 hours.",
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("Error", {
        description: "Failed to send booking request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{submitted ? "Request Received" : "Request a Quote"}</CardTitle>
        <CardDescription>
          {submitted ? "Your operational brief has been logged." : "Fill out the form below and we'll get back to you with a detailed quote within 24 hours."}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[400px] flex flex-col justify-center">
        {submitted ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto text-green-600">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <p className="text-gray-500 font-medium">Thank you for your interest. Our production unit will review your project brief and contact you via your preferred channel.</p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="w-full h-12 rounded-xl font-bold">
              Send Another Request
            </Button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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

            {/* Hidden field to include the selected service */}
            <input type="hidden" name="service" value={service} />

            <Button type="submit" className="w-full h-14 rounded-xl font-black uppercase tracking-widest bg-black hover:bg-yellow-400 hover:text-black transition-all" disabled={isSubmitting}>
              {isSubmitting ? "Sending Request..." : "Send Booking Request"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

