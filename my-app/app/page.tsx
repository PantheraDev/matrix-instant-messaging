"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageCircle, Plus, Users, Sparkles, Zap, Heart, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// Generador de códigos más atractivos
const generateRoomCode = (): string => {
  const adjectives = ["COOL", "EPIC", "FAST", "BLUE", "FIRE", "STAR", "GOLD", "MEGA", "SUPER", "ULTRA"]
  const numbers = Math.floor(Math.random() * 999) + 100
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  return `${adjective}${numbers}`
}

export default function HomePage() {
  const [roomName, setRoomName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [userName, setUserName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const createRoom = async () => {
    if (!roomName.trim() || !userName.trim()) {
      toast({
        title: "❌ Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const roomId = Math.random().toString(36).substring(2, 15)
      const userId = Math.random().toString(36).substring(2, 15)
      const accessCode = generateRoomCode()

      // Crear sala en el "backend" simulado
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          roomName: roomName.trim(),
          creatorName: userName.trim(),
          accessCode,
        }),
      })

      if (response.ok) {
        // Guardar datos del usuario en localStorage
        localStorage.setItem("userName", userName.trim())
        localStorage.setItem("userId", userId)
        localStorage.setItem("roomId", roomId)
        localStorage.setItem("accessCode", accessCode)
        localStorage.setItem("roomName", roomName.trim())

        toast({
          title: "🎉 ¡Sala creada exitosamente!",
          description: `Código: ${accessCode} - ¡Compártelo con tu equipo!`,
        })

        setCreateDialogOpen(false)

        // Redirigir a la sala
        setTimeout(() => {
          const url = `/room/${roomId}?code=${encodeURIComponent(accessCode)}`
          router.push(url)
        }, 1500)
      } else {
        throw new Error("Error al crear sala")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "❌ Error",
        description: "No se pudo crear la sala. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const joinRoom = async () => {
    if (!joinCode.trim() || !userName.trim()) {
      toast({
        title: "❌ Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    setIsJoining(true)
    try {
      const response = await fetch("/api/rooms/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessCode: joinCode.trim(),
          userName: userName.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Manejo específico de errores
        if (response.status === 404) {
          toast({
            title: "❌ Código no encontrado",
            description: "El código ingresado no existe. Verifica que esté correcto.",
            variant: "destructive",
          })
        } else if (response.status === 403) {
          if (data.error === "ROOM_FULL") {
            toast({
              title: "👥 Sala llena",
              description: "Esta sala ha alcanzado su límite de participantes.",
              variant: "destructive",
            })
          } else if (data.error === "ROOM_EXPIRED") {
            toast({
              title: "⏰ Sala expirada",
              description: "Esta sala ya no está disponible.",
              variant: "destructive",
            })
          } else {
            toast({
              title: "🚫 Acceso denegado",
              description: data.message || "No puedes acceder a esta sala.",
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "❌ Error",
            description: data.message || "Error desconocido",
            variant: "destructive",
          })
        }
        return
      }

      // Guardar datos del usuario en localStorage
      localStorage.setItem("userName", userName.trim())
      localStorage.setItem("userId", data.userId)
      localStorage.setItem("roomId", data.roomId)
      localStorage.setItem("accessCode", joinCode.trim())
      localStorage.setItem("roomName", data.roomName)

      toast({
        title: "🚀 ¡Conectado exitosamente!",
        description: `Bienvenido a ${data.roomName}`,
      })

      setJoinDialogOpen(false)

      // Redirigir a la sala
      setTimeout(() => {
        const url = `/room/${data.roomId}?code=${encodeURIComponent(joinCode.trim())}`
        router.push(url)
      }, 1500)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "❌ Error de conexión",
        description: "No se pudo conectar al servidor. Verifica tu internet.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo estético con ilustraciones de chat */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        {/* Burbujas de chat decorativas */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-purple-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-pink-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute bottom-20 right-32 w-14 h-14 bg-green-200 rounded-full opacity-20 animate-bounce"></div>

        {/* Ilustraciones SVG de chat */}
        <svg
          className="absolute top-16 right-16 w-32 h-32 text-blue-300 opacity-30"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>

        <svg
          className="absolute bottom-16 left-16 w-28 h-28 text-purple-300 opacity-25"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>

        {/* Líneas conectoras */}
        <div className="absolute top-1/4 left-1/4 w-32 h-0.5 bg-gradient-to-r from-blue-200 to-transparent opacity-30 rotate-45"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-0.5 bg-gradient-to-l from-purple-200 to-transparent opacity-30 -rotate-45"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                ChatRooms
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Conecta, chatea y colabora en tiempo real
                <br />
                <span className="text-sm text-gray-500">Con pizarra interactiva incluida ✨</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <Plus className="mr-3 h-6 w-6" />
                  Crear Nueva Sala
                  <Zap className="ml-3 h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    Crear Nueva Sala
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Crea una sala privada con chat y pizarra colaborativa
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="userName" className="text-sm font-medium">
                      Tu Nombre
                    </Label>
                    <Input
                      id="userName"
                      placeholder="Ej: María González"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomName" className="text-sm font-medium">
                      Nombre de la Sala
                    </Label>
                    <Input
                      id="roomName"
                      placeholder="Ej: Reunión de Equipo 🚀"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <Button
                    onClick={createRoom}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-base font-medium"
                    disabled={isCreating || !roomName.trim() || !userName.trim()}
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creando sala...
                      </>
                    ) : (
                      <>
                        <Star className="mr-2 h-5 w-5" />
                        Crear Sala
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-16 text-lg border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <Users className="mr-3 h-6 w-6" />
                  Unirse a Sala
                  <Heart className="ml-3 h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    Unirse a Sala
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Ingresa el código que te compartieron para unirte
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="userNameJoin" className="text-sm font-medium">
                      Tu Nombre
                    </Label>
                    <Input
                      id="userNameJoin"
                      placeholder="Ej: Carlos Ruiz"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinCode" className="text-sm font-medium">
                      Código de Acceso
                    </Label>
                    <Input
                      id="joinCode"
                      placeholder="Ej: COOL123"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="h-12 text-center text-lg font-mono tracking-wider bg-gray-50"
                    />
                  </div>
                  <Button
                    onClick={joinRoom}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-base font-medium"
                    disabled={isJoining || !joinCode.trim() || !userName.trim()}
                  >
                    {isJoining ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-5 w-5" />
                        Unirse Ahora
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                Funcionalidades Incluidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Chat en tiempo real</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">Hasta 10 usuarios</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium">Pizarra colaborativa</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="font-medium">Herramientas útiles</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-center text-xs text-gray-500">
                  🔒 Salas privadas y seguras • ⚡ Sin registro requerido • 🎨 Interfaz moderna
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
