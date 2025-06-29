import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'Room ID to send message to',
    example: '!roomId123:localhost',
  })
  roomId: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello everyone!',
  })
  message: string;

  @ApiProperty({
    description: 'Access token from login',
    example: 'syt_dXNlcl9hZG1pbg_example_token',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Message type',
    example: 'm.text',
    required: false,
  })
  messageType?: string;
}
