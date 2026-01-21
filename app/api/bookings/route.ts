import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, phone, service, projectLocation, projectBrief, idealDates, preferredCommunication } = body

    // Email integration removed as per request
    console.log("Booking request received:", {
      service,
      fullName,
      email,
      phone,
      projectLocation,
      projectBrief
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Booking API error:", error)
    return NextResponse.json({ error: "Failed to process booking request" }, { status: 500 })
  }
}
