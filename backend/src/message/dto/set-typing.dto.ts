import { ApiProperty } from '@nestjs/swagger';

export class SetTypingDto {
  @ApiProperty({
    description: 'Room ID where user is typing',
    example: '!roomId123:localhost',
  })
  roomId: string;

  @ApiProperty({
    description: 'User ID who is typing',
    example: '@user:localhost',
  })
  userId: string;

  @ApiProperty({
    description: 'Access token from login',
    example: 'syt_dXNlcl9hZG1pbg_example_token',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Whether user is typing or not',
    example: true,
    required: false,
  })
  typing?: boolean;

  @ApiProperty({
    description: 'Typing timeout in milliseconds',
    example: 20000,
    required: false,
  })
  timeout?: number;
}
