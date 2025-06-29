"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Send,
  Copy,
  Users,
  LogOut,
  Share2,
  Smile,
  Paperclip,
  MoreVertical,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Palette,
  Timer,
  CheckSquare,
  BarChart3,
} from "lucide-react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: Date
  type?: "text" | "system" | "emoji"
}

interface User {
  id: string
  name: string
  isOnline: boolean
  avatar?: string
  isTyping?: boolean
}

interface RoomInfo {
  id: string
  name: string
  accessCode: string
  createdAt: Date
}

interface DrawingPoint {
  x: number
  y: number
  color: string
  size: number
}

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  question: string
  options: PollOption[]
  createdBy: string
}

const emojis = ["😀", "😂", "❤️", "👍", "👎", "😢", "😮", "😡", "🎉", "🔥"]

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("chat")

  // Pizarra
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingColor, setDrawingColor] = useState("#000000")
  const [drawingSize, setDrawingSize] = useState(3)
  const [drawingPoints, setDrawingPoints] = useState<DrawingPoint[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Timer
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Polls
  const [polls, setPolls] = useState<Poll[]>([])
  const [newPollQuestion, setNewPollQuestion] = useState("")
  const [newPollOptions, setNewPollOptions] = useState(["", ""])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId
  const accessCode = searchParams?.get("code") || ""

  useEffect(() => {
    const userName = localStorage.getItem("userName")
    const userId = localStorage.getItem("userId")
    const storedRoomName = localStorage.getItem("roomName") || "Sala de Chat"
    const storedAccessCode = localStorage.getItem("accessCode") || accessCode

    if (!userName || !userId) {
      router.push("/")
      return
    }

    setCurrentUser({ id: userId, name: userName })
    setRoomInfo({
      id: roomId,
      name: storedRoomName,
      accessCode: storedAccessCode,
      createdAt: new Date(),
    })

    setIsConnected(true)
    setUsers([
      { id: userId, name: userName, isOnline: true },
      { id: "demo1", name: "Ana García", isOnline: true },
      { id: "demo2", name: "Luis Martín", isOnline: true },
      { id: "demo3", name: "Sofia Chen", isOnline: false },
    ])

    setMessages([
      {
        id: "1",
        userId: "system",
        userName: "Sistema",
        content: `¡Bienvenido a ${storedRoomName}! 🎉 Explora las pestañas para usar la pizarra y herramientas.`,
        timestamp: new Date(Date.now() - 120000),
        type: "system",
      },
      {
        id: "2",
        userId: "demo1",
        userName: "Ana García",
        content: "¡Hola! ¿Listos para la reunión? 🚀",
        timestamp: new Date(Date.now() - 60000),
      },
      {
        id: "3",
        userId: "demo2",
        userName: "Luis Martín",
        content: "¡Perfecto! Me encanta la nueva pizarra colaborativa 🎨",
        timestamp: new Date(Date.now() - 30000),
      },
    ])

    // Simular usuarios escribiendo ocasionalmente
    const typingInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setTypingUsers(["Ana García"])
        setTimeout(() => setTypingUsers([]), 2000)
      }
    }, 15000)

    return () => {
      clearInterval(typingInterval)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [roomId, accessCode, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev > 0) return prev - 1
          if (timerMinutes > 0) {
            setTimerMinutes((m) => m - 1)
            return 59
          }
          setIsTimerRunning(false)
          toast({
            title: "⏰ ¡Tiempo terminado!",
            description: "El temporizador ha llegado a cero",
          })
          return 0
        })
      }, 1000)
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [isTimerRunning, timerMinutes])

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return

    const message: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      content: newMessage.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    if (soundEnabled) {
      playNotificationSound()
    }

    // Simular respuesta automática ocasionalmente
    if (Math.random() > 0.7) {
      setTimeout(
        () => {
          const responses = [
            "¡Excelente punto! 👍",
            "Totalmente de acuerdo",
            "Interesante perspectiva 🤔",
            "¿Podrías explicar más sobre eso?",
            "¡Genial! 🎉",
            "Vamos a probarlo en la pizarra 🎨",
          ]
          const randomResponse = responses[Math.floor(Math.random() * responses.length)]

          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              userId: "demo1",
              userName: "Ana García",
              content: randomResponse,
              timestamp: new Date(),
            },
          ])
        },
        1000 + Math.random() * 3000,
      )
    }
  }

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.log("Audio not supported")
    }
  }

  const copyAccessCode = async () => {
    if (roomInfo) {
      try {
        await navigator.clipboard.writeText(roomInfo.accessCode)
        toast({
          title: "📋 ¡Copiado!",
          description: "Código copiado al portapapeles",
        })
      } catch (error) {
        toast({
          title: "❌ Error",
          description: "No se pudo copiar el código",
          variant: "destructive",
        })
      }
    }
  }

  const shareRoom = async () => {
    if (roomInfo) {
      const shareText = `🚀 ¡Únete a mi sala de chat colaborativa!\n\n📝 Sala: ${roomInfo.name}\n🔑 Código: ${roomInfo.accessCode}\n\n✨ Incluye chat, pizarra y herramientas útiles\n¡Te espero! 😊`

      if (navigator.share) {
        try {
          await navigator.share({
            title: `Sala: ${roomInfo.name}`,
            text: shareText,
          })
        } catch (error) {
          await navigator.clipboard.writeText(shareText)
          toast({
            title: "📱 ¡Compartido!",
            description: "Información copiada para compartir",
          })
        }
      } else {
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "📱 ¡Listo para compartir!",
          description: "Información copiada al portapapeles",
        })
      }
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      // Lógica para dejar de mostrar "escribiendo"
    }, 1000)
  }

  const leaveRoom = () => {
    toast({
      title: "👋 ¡Hasta pronto!",
      description: "Has salido de la sala",
    })
    router.push("/")
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    } else {
      handleTyping()
    }
  }

  // Pizarra functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newPoint: DrawingPoint = {
      x,
      y,
      color: drawingColor,
      size: drawingSize,
    }

    setDrawingPoints((prev) => [...prev, newPoint])
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newPoint: DrawingPoint = {
      x,
      y,
      color: drawingColor,
      size: drawingSize,
    }

    setDrawingPoints((prev) => [...prev, newPoint])
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    setDrawingPoints([])
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  // Redraw canvas when points change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    drawingPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.beginPath()
        ctx.moveTo(point.x, point.y)
      } else {
        const prevPoint = drawingPoints[index - 1]
        if (prevPoint.color === point.color && prevPoint.size === point.size) {
          ctx.lineTo(point.x, point.y)
        } else {
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(point.x, point.y)
        }
      }

      ctx.strokeStyle = point.color
      ctx.lineWidth = point.size
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
    })

    ctx.stroke()
  }, [drawingPoints])

  // Timer functions
  const startTimer = () => {
    setIsTimerRunning(true)
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimerMinutes(25)
    setTimerSeconds(0)
  }

  // Poll functions
  const createPoll = () => {
    if (!newPollQuestion.trim() || !currentUser) return

    const validOptions = newPollOptions.filter((opt) => opt.trim())
    if (validOptions.length < 2) {
      toast({
        title: "❌ Error",
        description: "La encuesta necesita al menos 2 opciones",
        variant: "destructive",
      })
      return
    }

    const newPoll: Poll = {
      id: Date.now().toString(),
      question: newPollQuestion.trim(),
      options: validOptions.map((opt, index) => ({
        id: `${Date.now()}-${index}`,
        text: opt.trim(),
        votes: 0,
      })),
      createdBy: currentUser.id,
    }

    setPolls((prev) => [...prev, newPoll])
    setNewPollQuestion("")
    setNewPollOptions(["", ""])

    toast({
      title: "📊 ¡Encuesta creada!",
      description: "Los participantes ya pueden votar",
    })
  }

  const votePoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              options: poll.options.map((opt) => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt)),
            }
          : poll,
      ),
    )

    toast({
      title: "✅ ¡Voto registrado!",
      description: "Tu voto ha sido contabilizado",
    })
  }

  if (!roomInfo || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Conectando a la sala...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`h-screen flex flex-col ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-200`}
    >
      {/* Header */}
      <div
        className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-4 py-3 flex items-center justify-between transition-colors duration-200`}
      >
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={`${getAvatarColor(roomInfo.name)} text-white font-bold`}>
              {roomInfo.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>{roomInfo.name}</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
              </Badge>
              <span>•</span>
              <span>{users.filter((u) => u.isOnline).length} en línea</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={shareRoom} className="hidden sm:flex">
            <Share2 className="h-4 w-4 mr-1" />
            Compartir
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyAccessCode}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar código: {roomInfo.accessCode}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareRoom} className="sm:hidden">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir sala
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {isDarkMode ? "Modo claro" : "Modo oscuro"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                {soundEnabled ? "Silenciar" : "Activar sonido"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={leaveRoom} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Salir de la sala
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="whiteboard" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Pizarra
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Herramientas
              </TabsTrigger>
              <TabsTrigger value="polls" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Encuestas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.userId === currentUser.id ? "justify-end" : "justify-start"} ${
                        message.type === "system" ? "justify-center" : ""
                      }`}
                    >
                      {message.type === "system" ? (
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {message.content}
                        </div>
                      ) : (
                        <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                          {message.userId !== currentUser.id && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={`${getAvatarColor(message.userName)} text-white text-xs`}>
                                {message.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              message.userId === currentUser.id
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md"
                                : isDarkMode
                                  ? "bg-gray-700 text-white border border-gray-600 rounded-bl-md"
                                  : "bg-white border border-gray-200 rounded-bl-md"
                            } shadow-sm`}
                          >
                            {message.userId !== currentUser.id && (
                              <p className="text-xs font-medium text-gray-500 mb-1">{message.userName}</p>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.userId === currentUser.id ? "text-blue-100" : "text-gray-400"
                              }`}
                            >
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{typingUsers[0]} está escribiendo...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div
                className={`border-t ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-4 transition-colors duration-200`}
              >
                <div className="flex space-x-2 items-end">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Escribe tu mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!isConnected}
                      className={`pr-20 h-12 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="h-8 w-8 p-0"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div
                        className={`absolute bottom-full right-0 mb-2 p-2 ${isDarkMode ? "bg-gray-700" : "bg-white"} border rounded-lg shadow-lg grid grid-cols-5 gap-1`}
                      >
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addEmoji(emoji)}
                            className="p-2 hover:bg-gray-100 rounded text-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!isConnected || !newMessage.trim()}
                    className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="whiteboard" className="flex-1 flex flex-col">
              <div className="flex-1 p-4">
                <div className="h-full bg-white rounded-lg border-2 border-gray-200 relative">
                  {/* Drawing Tools */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-white rounded-lg shadow-lg p-2 border">
                    <input
                      type="color"
                      value={drawingColor}
                      onChange={(e) => setDrawingColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={drawingSize}
                      onChange={(e) => setDrawingSize(Number(e.target.value))}
                      className="w-20"
                    />
                    <Button size="sm" onClick={clearCanvas} variant="outline">
                      Limpiar
                    </Button>
                  </div>

                  {/* Canvas */}
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="flex-1 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timer */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="h-5 w-5" />
                      Temporizador Pomodoro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-mono font-bold">
                        {String(timerMinutes).padStart(2, "0")}:{String(timerSeconds).padStart(2, "0")}
                      </div>
                    </div>
                    <div className="flex justify-center space-x-2">
                      <Button onClick={startTimer} disabled={isTimerRunning} size="sm">
                        Iniciar
                      </Button>
                      <Button onClick={pauseTimer} disabled={!isTimerRunning} size="sm" variant="outline">
                        Pausar
                      </Button>
                      <Button onClick={resetTimer} size="sm" variant="outline">
                        Reiniciar
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm">Minutos:</label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(Number(e.target.value))}
                        disabled={isTimerRunning}
                        className="w-20"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      Notas Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      placeholder="Escribe notas colaborativas aquí..."
                      className="w-full h-32 p-3 border rounded-lg resize-none"
                      defaultValue="• Revisar propuesta de diseño
• Definir próximos pasos
• Agendar seguimiento para viernes"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="polls" className="flex-1 p-4">
              <div className="space-y-6">
                {/* Create Poll */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Crear Encuesta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="¿Cuál es tu pregunta?"
                      value={newPollQuestion}
                      onChange={(e) => setNewPollQuestion(e.target.value)}
                    />
                    {newPollOptions.map((option, index) => (
                      <Input
                        key={index}
                        placeholder={`Opción ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newPollOptions]
                          newOptions[index] = e.target.value
                          setNewPollOptions(newOptions)
                        }}
                      />
                    ))}
                    <div className="flex space-x-2">
                      <Button onClick={() => setNewPollOptions([...newPollOptions, ""])} variant="outline" size="sm">
                        + Opción
                      </Button>
                      <Button onClick={createPoll} size="sm">
                        Crear Encuesta
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Polls */}
                {polls.map((poll) => (
                  <Card key={poll.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{poll.question}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {poll.options.map((option) => (
                        <div key={option.id} className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            onClick={() => votePoll(poll.id, option.id)}
                            className="flex-1 justify-start"
                          >
                            {option.text}
                          </Button>
                          <Badge variant="secondary" className="ml-2">
                            {option.votes}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Participants */}
        <div
          className={`w-64 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-l transition-colors duration-200`}
        >
          <Card className="h-full rounded-none border-0 bg-transparent">
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm flex items-center ${isDarkMode ? "text-white" : ""}`}>
                <Users className="h-4 w-4 mr-2" />
                Participantes ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors duration-150`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${getAvatarColor(user.name)} text-white text-xs`}>
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : ""}`}>
                            {user.name}
                          </span>
                          {user.id === currentUser.id && (
                            <Badge variant="secondary" className="text-xs">
                              Tú
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${user.isOnline ? "bg-green-500" : "bg-gray-300"}`} />
                          <span className="text-xs text-gray-500">{user.isOnline ? "En línea" : "Desconectado"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
