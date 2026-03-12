export const dynamic = 'force-dynamic'
export const revalidate = 0

import { Suspense } from 'react'
import RegisterFormClient from '@/components/auth/RegisterFormClient'
import { UserRole } from '@/lib/auth-service'

function RegisterContent({
  searchParams
}: {
  searchParams: { role?: string; email?: string; name?: string; ref?: string }
}) {
  const initialRole = (searchParams.role as UserRole) || 'brand'
  const paymentRef = searchParams.ref || null
  const email = searchParams.email || ''
  const name = searchParams.name || ''

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex bg-black relative items-center justify-center overflow-hidden p-20">
        <div className="absolute inset-0 z-0 bg-[url('/cinematic-video-setup.png')] bg-cover opacity-30" />
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-yellow-400/20 to-transparent" />
        
        <div className="relative z-20 text-white max-w-lg">
          <h1 className="text-6xl font-black mb-6 leading-tight">Join the <span className="text-yellow-400">Next Cohort</span> of Cinematic Experts.</h1>
          <p className="text-xl text-gray-300">Whether you're a student looking for mentorship, staff joining the team, or a brand looking for premium talent.</p>
        </div>
      </div>

      <RegisterFormClient
        initialRole={initialRole}
        paymentRef={paymentRef}
        email={email}
        name={name}
      />
    </div>
  )
}

export default function RegisterPage({
  searchParams
}: {
  searchParams: { role?: string; email?: string; name?: string; ref?: string }
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterContent searchParams={searchParams} />
    </Suspense>
  )
}

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                    <Input 
                      type="email" placeholder="david@example.com" 
                      className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white" 
                      value={email} onChange={e => setEmail(e.target.value)} required 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                    <Input 
                      type="password" placeholder="••••••••" 
                      className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white" 
                      value={password} onChange={e => setPassword(e.target.value)} required 
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black h-14 rounded-2xl shadow-lg shadow-yellow-400/20 mt-2">
                    {loading ? "Creating Account..." : `Sign up as ${role === 'brand' ? 'Brand' : role === 'staff' ? 'Staff' : 'Student'} →`}
                  </Button>
                  
                  <p className="text-center text-sm text-gray-500 pt-2">
                    Already have an account? <a href="/login" className="text-yellow-600 font-black hover:underline">Log in</a>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
