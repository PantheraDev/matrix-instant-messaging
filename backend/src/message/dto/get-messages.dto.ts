import { ApiProperty } from '@nestjs/swagger';

export class GetMessagesDto {
  @ApiProperty({
    description: 'Room ID to get messages from',
    example: '!roomId123:localhost',
  })
  roomId: string;

  @ApiProperty({
    description: 'Access token from login',
    example: 'syt_dXNlcl9hZG1pbg_example_token',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Number of messages to retrieve',
    example: 20,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: 'Pagination token',
    example: 's1234567890_abcdef',
    required: false,
  })
  from?: string;
}
