import { ApiProperty } from '@nestjs/swagger';

export class MarkAsReadDto {
  @ApiProperty({
    description: 'Room ID where the message is',
    example: '!roomId123:localhost',
  })
  roomId: string;

  @ApiProperty({
    description: 'Event ID of the message to mark as read',
    example: '$event123:localhost',
  })
  eventId: string;

  @ApiProperty({
    description: 'Access token from login',
    example: 'syt_dXNlcl9hZG1pbg_example_token',
  })
  accessToken: string;
}
