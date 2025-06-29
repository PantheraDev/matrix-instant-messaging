import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { SynapseService } from 'src/synapseService/synapse.service';
import {
  GetUserRoomsDto,
  GetRoomDetailsDto,
  LeaveRoomDto,
} from './dto/room-management.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { InviteToRoomDto } from './dto/invite-to-room.dto';
import { JoinRoomWithCodeDto } from './dto/join-room-with-code.dto';

@ApiTags('Rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomController {
  constructor(private readonly synapseService: SynapseService) {}

  @Post('createRoom')
  async createRoom(
    @Body() body: CreateRoomDto,
  ): Promise<{ message: string; data: any }> {
    const inviteCode = this.synapseService.generateInviteCode();
    const result = await this.synapseService.createRoom(
      body.roomName,
      body.accessToken,
      inviteCode,
    );
    return {
      message: 'Room created successfully',
      data: {
        ...result,
        inviteCode: inviteCode, // El código generado para compartir
      },
    };
  }

  @Post('inviteToRoom')
  async inviteToRoom(
    @Body() body: InviteToRoomDto,
  ): Promise<{ message: string; data: any }> {
    const result = await this.synapseService.inviteToRoom(
      body.roomId,
      body.userId,
      body.accessToken,
    );
    return { message: 'User invited successfully', data: result };
  }

  @Post('joinRoomWithCode')
  async joinRoomWithCode(
    @Body() body: JoinRoomWithCodeDto,
  ): Promise<{ message: string; data: any }> {
    const result = await this.synapseService.joinRoomWithCode(
      body.roomId,
      body.inviteCode,
      body.accessToken,
    );
    return { message: 'Joined room successfully', data: result };
  }

  @Post('generateInviteCode')
  async generateInviteCode(): Promise<{
    message: string;
    data: { inviteCode: string };
  }> {
    const inviteCode = this.synapseService.generateInviteCode();
    return {
      message: 'Invite code generated successfully',
      data: { inviteCode },
    };
  }

  @Post('my-rooms')
  @ApiOperation({ summary: 'Get user joined rooms' })
  async getUserRooms(
    @Body() body: GetUserRoomsDto,
  ): Promise<{ message: string; data: any }> {
    const result = await this.synapseService.getUserRooms(body.accessToken);
    return { message: 'Rooms retrieved successfully', data: result };
  }

  @Post('details')
  @ApiOperation({ summary: 'Get room details and state' })
  async getRoomDetails(
    @Body() body: GetRoomDetailsDto,
  ): Promise<{ message: string; data: any }> {
    const result = await this.synapseService.getRoomDetails(
      body.roomId,
      body.accessToken,
    );
    return { message: 'Room details retrieved successfully', data: result };
  }

  @Post('members')
  @ApiOperation({ summary: 'Get room members' })
  async getRoomMembers(
    @Body() body: GetRoomDetailsDto,
  ): Promise<{ message: string; data: any }> {
    const result = await this.synapseService.getRoomMembers(
      body.roomId,
      body.accessToken,
    );
    return { message: 'Room members retrieved successfully', data: result };
  }

  @Post('leave')
  @ApiOperation({ summary: 'Leave a room' })
  async leaveRoom(
    @Body() body: LeaveRoomDto,
  ): Promise<{ message: string; data: any }> {
    const result = await this.synapseService.leaveRoom(
      body.roomId,
      body.accessToken,
    );
    return { message: 'Left room successfully', data: result };
  }
}
