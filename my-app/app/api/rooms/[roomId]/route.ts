import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos (reemplazar con tu base de datos real)
const rooms = new Map()

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const roomId = params.roomId

    const room = rooms.get(roomId)

    if (!room || room.accessCode !== code) {
      return NextResponse.json({ message: "Sala no encontrada o código inválido" }, { status: 404 })
    }

    // Aquí harías la petición a tu backend real
    /*
    const response = await fetch(`http://tu-backend.com/api/rooms/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      }
    })
    */

    return NextResponse.json({
      id: room.id,
      name: room.name,
      accessCode: room.accessCode,
      createdAt: room.createdAt,
    })
  } catch (error) {
    console.error("Error fetching room:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
