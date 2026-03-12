import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password, role, paymentRef, name } = await req.json()

  // TODO: save to DB, hash password, etc.
  console.log('Registering user:', { email, role, paymentRef, name })

  return NextResponse.json({ success: true })
}
