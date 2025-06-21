import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos (reemplazar con tu base de datos real)
const rooms = new Map([
  [
    "room1",
    {
      id: "room1",
      name: "Sala de Prueba",
      accessCode: "ABC123",
      isActive: true,
      participants: [
        { id: "user1", name: "Usuario 1", isOnline: true },
        { id: "user2", name: "Usuario 2", isOnline: false },
      ],
      recentMessages: [
        {
          id: "msg1",
          userId: "user1",
          userName: "Usuario 1",
          content: "¡Bienvenido a la sala!",
          timestamp: new Date(Date.now() - 300000),
        },
      ],
      createdAt: new Date(),
    },
  ],
])

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { accessCode, userId, userName } = await request.json()
    const roomId = params.roomId

    if (!accessCode || !userId || !userName) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 })
    }

    const room = rooms.get(roomId)

    if (!room) {
      return NextResponse.json({ message: "Sala no encontrada" }, { status: 404 })
    }

    // Verificar código de acceso
    if (room.accessCode !== accessCode.toUpperCase()) {
      return NextResponse.json({ message: "Código de acceso inválido" }, { status: 403 })
    }

    // Verificar si la sala está activa
    if (!room.isActive) {
      return NextResponse.json({ message: "Sala inactiva" }, { status: 403 })
    }

    // Agregar usuario a participantes si no existe
    const existingUser = room.participants.find((p) => p.id === userId)
    if (!existingUser) {
      room.participants.push({
        id: userId,
        name: userName,
        isOnline: true,
      })
    } else {
      existingUser.isOnline = true
    }

    return NextResponse.json({
      roomName: room.name,
      participants: room.participants,
      recentMessages: room.recentMessages,
      createdAt: room.createdAt,
      message: "Acceso autorizado",
    })
  } catch (error) {
    console.error("Error checking access:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
