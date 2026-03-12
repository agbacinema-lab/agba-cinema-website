// app/register/page.tsx
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import RegisterFormClient from '@/components/auth/RegisterFormClient'
import { UserRole } from '@/lib/auth-service'

export default function RegisterPage({
  searchParams
}: {
  searchParams: { role?: string; email?: string; name?: string; ref?: string }
}) {
  const initialRole = (searchParams.role as UserRole) || 'brand'
  const paymentRef = searchParams.ref || null
  const email = searchParams.email || ''
  const name = searchParams.name || ''

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterFormClient
        initialRole={initialRole}
        paymentRef={paymentRef}
        email={email}
        name={name}
      />
    </Suspense>
  )
}
