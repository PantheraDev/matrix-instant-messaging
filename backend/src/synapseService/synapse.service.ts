import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

@Injectable()
export class SynapseService {
  synapseUrl: string = 'http://localhost:8008/_matrix/client/v3/';

  constructor(private readonly httpService: HttpService) {}

  // ==================== FUNCIONALIDAD DE AUTENTICACIÓN ====================

  // Login
  async login(user: string, password: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.httpService
        .post(`${this.synapseUrl}login`, {
          type: 'm.login.password',
          user: user,
          password: password,
          refresh_token: true,
        })
        .toPromise();
      return response.data;
    } catch (error) {
      // Manejar errores de la petición
      console.error(error);
      throw error;
    }
  }

  // Registro
  async register(user: string, password: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.httpService
        .post(`${this.synapseUrl}register`, {
          username: user,
          password: password,
          auth: {
            type: 'm.login.dummy',
          },
          refresh_token: true,
        })
        .toPromise();
      return response.data;
    } catch (error) {
      // Manejar errores de la petición
      console.error(error);
      throw error;
    }
  }

  // ==================== GESTIÓN DE SALAS ====================

  async createRoom(
    roomName: string,
    accessToken: string,
    inviteCode?: string,
  ): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.httpService
        .post(
          `${this.synapseUrl}createRoom`,
          {
            name: roomName,
            preset: 'private_chat',
            visibility: 'private',
            join_rule: 'invite',
            // Configuración para sala privada con código
            initial_state: [
              {
                type: 'm.room.join_rules',
                content: {
                  join_rule: 'invite',
                },
              },
              {
                type: 'm.room.guest_access',
                content: {
                  guest_access: 'forbidden',
                },
              },
              // Código de invitación personalizado (opcional)
              ...(inviteCode
                ? [
                    {
                      type: 'm.room.topic',
                      content: {
                        topic: `Código de acceso: ${inviteCode}`,
                      },
                    },
                  ]
                : []),
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Generar código de invitación aleatorio
  generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  // Invitar usuario a sala con código
  async inviteToRoom(
    roomId: string,
    userId: string,
    accessToken: string,
  ): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.httpService
        .post(
          `${this.synapseUrl}rooms/${roomId}/invite`,
          {
            user_id: userId,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Unirse a sala con código de invitación
  async joinRoomWithCode(
    roomId: string,
    inviteCode: string,
    accessToken: string,
  ): Promise<any> {
    try {
      // Primero verificar el código (esto es una implementación básica)
      const roomInfo = await this.getRoomInfo(roomId, accessToken);

      if (!roomInfo.topic?.includes(inviteCode)) {
        throw new Error('Código de invitación inválido');
      }

      const response: AxiosResponse<any> = await this.httpService
        .post(
          `${this.synapseUrl}rooms/${roomId}/join`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Obtener información de la sala
  async getRoomInfo(roomId: string, accessToken: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.httpService
        .get(`${this.synapseUrl}rooms/${roomId}/state/m.room.topic`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Obtener lista de salas del usuario
  async getUserRooms(accessToken: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.httpService
        .get(`${this.synapseUrl}joined_rooms`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Obtener información detallada de una sala
  async getRoomDetails(roomId: string, accessToken: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.httpService
        .get(`${this.synapseUrl}rooms/${roomId}/state`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Obtener miembros de una sala
  async getRoomMembers(roomId: string, accessToken: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.httpService
        .get(`${this.synapseUrl}rooms/${roomId}/members`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Salir de una sala
  async leaveRoom(roomId: string, accessToken: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.httpService
        .post(
          `${this.synapseUrl}rooms/${roomId}/leave`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // ==================== FUNCIONALIDAD DE MENSAJERÍA ====================

  // Enviar mensaje a una sala
  async sendMessage(
    roomId: string,
    message: string,
    accessToken: string,
    messageType: string = 'm.text',
  ): Promise<any> {
    try {
      const txnId = Date.now().toString(); // ID único para la transacción
      const response: AxiosResponse<any> = await this.httpService
        .put(
          `${this.synapseUrl}rooms/${roomId}/send/m.room.message/${txnId}`,
          {
            msgtype: messageType,
            body: message,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Obtener mensajes de una sala (historial)
  async getMessages(
    roomId: string,
    accessToken: string,
    limit: number = 20,
    from?: string,
  ): Promise<any> {
    try {
      let url = `${this.synapseUrl}rooms/${roomId}/messages?limit=${limit}&dir=b`;
      if (from) {
        url += `&from=${from}`;
      }

      const response: AxiosResponse<any> = await this.httpService
        .get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Sync para obtener mensajes en tiempo real
  async syncMessages(accessToken: string, since?: string): Promise<any> {
    try {
      let url = `${this.synapseUrl}sync?timeout=30000`;
      if (since) {
        url += `&since=${since}`;
      }

      const response: AxiosResponse<any> = await this.httpService
        .get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Marcar mensaje como leído
  async markAsRead(
    roomId: string,
    eventId: string,
    accessToken: string,
  ): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.httpService
        .post(
          `${this.synapseUrl}rooms/${roomId}/receipt/m.read/${eventId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Indicar que el usuario está escribiendo
  async setTyping(
    roomId: string,
    userId: string,
    accessToken: string,
    typing: boolean = true,
    timeout: number = 20000,
  ): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.httpService
        .put(
          `${this.synapseUrl}rooms/${roomId}/typing/${userId}`,
          {
            typing: typing,
            timeout: typing ? timeout : 0,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Enviar archivo/imagen
  async sendFile(
    roomId: string,
    accessToken: string,
    fileUrl: string,
    fileName: string,
    mimeType: string,
    fileSize: number,
  ): Promise<any> {
    try {
      const txnId = Date.now().toString();
      const messageType = mimeType.startsWith('image/') ? 'm.image' : 'm.file';

      const response: AxiosResponse<any> = await this.httpService
        .put(
          `${this.synapseUrl}rooms/${roomId}/send/m.room.message/${txnId}`,
          {
            msgtype: messageType,
            body: fileName,
            filename: fileName,
            info: {
              size: fileSize,
              mimetype: mimeType,
            },
            url: fileUrl,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .toPromise();
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
