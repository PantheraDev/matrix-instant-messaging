import { type NextRequest, NextResponse } from "next/server"

// Base de datos global que persiste entre requests
const globalRooms = new Map()

export async function POST(request: NextRequest) {
  try {
    const { roomId, roomName, creatorName, accessCode } = await request.json()

    if (!roomName || !creatorName || !accessCode || !roomId) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 })
    }

    // Verificar que el código no exista ya
    if (globalRooms.has(accessCode)) {
      return NextResponse.json({ message: "Código ya existe, intenta de nuevo" }, { status: 409 })
    }

    // Crear sala
    const room = {
      id: roomId,
      name: roomName,
      accessCode,
      creatorName,
      isActive: true,
      maxParticipants: 10,
      currentParticipants: 1,
      createdAt: new Date(),
      participants: [],
    }

    globalRooms.set(accessCode, room)

    return NextResponse.json({
      roomId,
      accessCode,
      message: "Sala creada exitosamente",
    })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
