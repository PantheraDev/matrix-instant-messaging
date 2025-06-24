"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface RoomValidatorProps {
  roomId: string
  accessCode: string
  children: React.ReactNode
}

export function RoomValidator({ roomId, accessCode, children }: RoomValidatorProps) {
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const router = useRouter()

  useEffect(() => {
    validateRoom()
  }, [roomId, accessCode])

  const validateRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessCode }),
      })

      if (response.ok) {
        setIsValid(true)
      } else {
        router.push("/?error=invalid_room")
      }
    } catch (error) {
      console.error("Error validating room:", error)
      router.push("/?error=connection_error")
    } finally {
      setIsValidating(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Validando acceso a la sala...</p>
        </div>
      </div>
    )
  }

  return isValid ? <>{children}</> : null
}
