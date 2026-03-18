// app/register/page.tsx
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import RegisterFormClient from '@/components/auth/RegisterFormClient'
import { UserRole } from '@/lib/auth-service'

export default function RegisterPage({
  searchParams
}: {
  searchParams: {
    role?: string
    email?: string
    name?: string
    ref?: string           // manual ref (legacy)
    reference?: string     // Paystack redirect param
    program?: string
    trxref?: string        // Paystack also sends trxref
  }
}) {
  const initialRole = (searchParams.role as UserRole) || 'staff'
  // Paystack sends both 'reference' and 'trxref' on redirect
  const paymentRef = searchParams.reference || searchParams.trxref || searchParams.ref || null
  const email = searchParams.email || ''
  const name = searchParams.name || ''
  const initialProgram = searchParams.program || 'gopro'

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    }>
      <RegisterFormClient
        initialRole={initialRole}
        paymentRef={paymentRef}
        email={email}
        name={name}
        initialProgram={initialProgram}
      />
    </Suspense>
  )
}
