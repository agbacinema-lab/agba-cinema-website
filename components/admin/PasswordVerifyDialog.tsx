"use client"

import { useState } from "react"
import { authService } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Lock, Loader2, AlertTriangle } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onVerified: () => void
  title?: string
}

export default function PasswordVerifyDialog({ isOpen, onClose, onVerified, title = "Confirm Security Access" }: Props) {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const success = await authService.verifyPassword(password)
    
    if (success) {
      setPassword("")
      onVerified()
      onClose()
    } else {
      setError(true)
    }
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none bg-white">
        <DialogHeader>
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <DialogTitle className="text-2xl font-black text-center mb-2">{title}</DialogTitle>
          <DialogDescription className="text-center text-gray-400 font-medium">
            This is a high-security action. Please verify your administrator password to proceed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerify} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter your password"
              className={`h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all text-center text-lg ${error ? 'border-red-500 ring-4 ring-red-50' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
            {error && (
              <p className="text-red-600 text-[10px] font-black uppercase text-center flex items-center justify-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Invalid password. Please try again.
              </p>
            )}
          </div>

          <DialogFooter className="flex-col gap-3 sm:flex-col mt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white hover:bg-gray-800 h-14 rounded-2xl font-black text-lg shadow-xl shadow-gray-200"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Verify Identity →"}
            </Button>
            <button 
              type="button"
              onClick={onClose}
              className="text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors py-2"
            >
              Cancel Action
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
