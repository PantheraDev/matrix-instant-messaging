import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { SynapseService } from 'src/synapseService/synapse.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { SyncMessagesDto } from './dto/sync-messages.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { SetTypingDto } from './dto/set-typing.dto';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessageController {
  constructor(private readonly synapseService: SynapseService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a message to a room' })
  async sendMessage(
    @Body() body: SendMessageDto,
  ): Promise<{ message: string; data: any }> {
    const result = await this.synapseService.sendMessage(
      body.roomId,
      body.message,
      body.accessToken,
      body.messageType,
    );
    return { message: 'Message sent successfully', data: result };
  }

  @Post('history')
  @ApiOperation({ summary: 'Get message history from a room' })
  async getMessages(
    @Body() body: GetMessagesDto,
  ): Promise<{ message: string; data: any }> {
    const result = await this.synapseService.getMessages(
      body.roomId,
      body.accessToken,
      body.limit,
      body.from,
    );
    return { message: 'Messages retrieved successfully', data: result };
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync messages in real-time' })
  async syncMessages(
    @Body() body: SyncMessagesDto,
  ): Promise<{ message: string; data: any }> {
    const result = await this.synapseService.syncMessages(
      body.accessToken,
      body.since,
    );
    return { message: 'Sync completed successfully', data: result };
  }

  @Post('markAsRead')
  @ApiOperation({ summary: 'Mark a message as read' })
  async markAsRead(
    @Body() body: MarkAsReadDto,
  ): Promise<{ message: string; data: any }> {
    const result = await this.synapseService.markAsRead(
      body.roomId,
      body.eventId,
      body.accessToken,
    );
    return { message: 'Message marked as read successfully', data: result };
  }

  @Post('typing')
  @ApiOperation({ summary: 'Set typing indicator' })
  async setTyping(
    @Body() body: SetTypingDto,
  ): Promise<{ message: string; data: any }> {
    const result = await this.synapseService.setTyping(
      body.roomId,
      body.userId,
      body.accessToken,
      body.typing,
      body.timeout,
    );
    return { message: 'Typing indicator set successfully', data: result };
  }
}
