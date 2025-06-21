import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos (reemplazar con tu base de datos real)
const rooms = new Map()
const users = new Map()

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export async function POST(request: NextRequest) {
  try {
    const { accessCode, userName } = await request.json()

    if (!accessCode || !userName) {
      return NextResponse.json({ message: "Código de acceso y nombre son requeridos" }, { status: 400 })
    }

    // Buscar sala por código de acceso
    let targetRoom = null
    for (const [roomId, room] of rooms.entries()) {
      if (room.accessCode === accessCode) {
        targetRoom = { roomId, ...room }
        break
      }
    }

    if (!targetRoom) {
      return NextResponse.json({ message: "Código de acceso inválido" }, { status: 404 })
    }

    const userId = generateId()

    // Crear usuario
    const user = {
      id: userId,
      name: userName,
      roomId: targetRoom.roomId,
      isOnline: true,
    }

    // Agregar usuario a la sala
    targetRoom.participants.push(userId)
    rooms.set(targetRoom.roomId, targetRoom)
    users.set(userId, user)

    // Aquí harías la petición a tu backend real
    /*
    const response = await fetch(`http://tu-backend.com/api/rooms/${targetRoom.roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      },
      body: JSON.stringify({
        accessCode,
        userName,
        matrixUserId: userId
      })
    })
    */

    return NextResponse.json({
      roomId: targetRoom.roomId,
      userId,
      message: "Te has unido a la sala exitosamente",
    })
  } catch (error) {
    console.error("Error joining room:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
