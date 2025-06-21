import { type NextRequest, NextResponse } from "next/server"

// Base de datos global que persiste entre requests
const globalRooms = new Map([
  [
    "COOL123",
    {
      id: "room1",
      name: "Sala de Prueba",
      accessCode: "COOL123",
      isActive: true,
      maxParticipants: 10,
      currentParticipants: 2,
      createdAt: new Date(),
    },
  ],
  [
    "FIRE456",
    {
      id: "room2",
      name: "Reunión Creativa",
      accessCode: "FIRE456",
      isActive: true,
      maxParticipants: 8,
      currentParticipants: 3,
      createdAt: new Date(),
    },
  ],
  [
    "FULL999",
    {
      id: "room3",
      name: "Sala Llena",
      accessCode: "FULL999",
      isActive: true,
      maxParticipants: 2,
      currentParticipants: 2, // Sala llena
      createdAt: new Date(),
    },
  ],
  [
    "EXPIRED",
    {
      id: "room4",
      name: "Sala Expirada",
      accessCode: "EXPIRED",
      isActive: false, // Sala inactiva
      maxParticipants: 10,
      currentParticipants: 0,
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 horas atrás
    },
  ],
])

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export async function POST(request: NextRequest) {
  try {
    const { accessCode, userName } = await request.json()

    // Validar datos de entrada
    if (!accessCode || !userName) {
      return NextResponse.json(
        {
          message: "Código de acceso y nombre son requeridos",
          error: "MISSING_FIELDS",
        },
        { status: 400 },
      )
    }

    // Limpiar y validar formato del código
    const cleanCode = accessCode.trim().toUpperCase()
    if (cleanCode.length < 3 || cleanCode.length > 10) {
      return NextResponse.json(
        {
          message: "El código debe tener entre 3 y 10 caracteres",
          error: "INVALID_FORMAT",
        },
        { status: 400 },
      )
    }

    // Buscar sala por código de acceso
    const room = globalRooms.get(cleanCode)

    if (!room) {
      return NextResponse.json(
        {
          message: "El código ingresado no existe. Verifica que esté correcto.",
          error: "ROOM_NOT_FOUND",
        },
        { status: 404 },
      )
    }

    // Verificar si la sala está activa
    if (!room.isActive) {
      return NextResponse.json(
        {
          message: "Esta sala ya no está disponible",
          error: "ROOM_INACTIVE",
        },
        { status: 403 },
      )
    }

    // Verificar si la sala está llena
    if (room.currentParticipants >= room.maxParticipants) {
      return NextResponse.json(
        {
          message: "Esta sala ha alcanzado su límite de participantes. Intenta más tarde.",
          error: "ROOM_FULL",
        },
        { status: 403 },
      )
    }

    // Verificar si la sala no ha expirado (ejemplo: 24 horas)
    const hoursAgo = (Date.now() - room.createdAt.getTime()) / (1000 * 60 * 60)
    if (hoursAgo > 24) {
      return NextResponse.json(
        {
          message: "Esta sala ha expirado",
          error: "ROOM_EXPIRED",
        },
        { status: 403 },
      )
    }

    const userId = generateId()

    // Incrementar contador de participantes
    room.currentParticipants += 1
    globalRooms.set(cleanCode, room)

    return NextResponse.json({
      roomId: room.id,
      roomName: room.name,
      userId,
      accessCode: cleanCode,
      participantsCount: room.currentParticipants,
      maxParticipants: room.maxParticipants,
      message: "Acceso autorizado a la sala",
    })
  } catch (error) {
    console.error("Error validating room:", error)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR",
      },
      { status: 500 },
    )
  }
}
