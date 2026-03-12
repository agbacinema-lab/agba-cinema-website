"use client"

import { useAuth } from "@/context/AuthContext"
import StudentAssignmentView from "@/components/academy/StudentAssignmentView"
import { motion } from "framer-motion"

export default function StudentAssignmentsPage() {
  const { user, profile } = useAuth()

  if (!user || !profile) {
    return null
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 p-8"
    >
      <StudentAssignmentView 
        studentId={user.uid}
        programType={profile.programType}
        specialization={profile.specialization}
      />
    </motion.div>
  )
}
