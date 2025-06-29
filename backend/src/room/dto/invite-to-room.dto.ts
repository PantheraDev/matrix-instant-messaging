import { ApiProperty } from '@nestjs/swagger';

export class InviteToRoomDto {
  @ApiProperty({
    description: 'Room ID to invite user to',
    example: '!roomId123:localhost',
  })
  roomId: string;

  @ApiProperty({
    description: 'User ID to invite',
    example: '@username:localhost',
  })
  userId: string;

  @ApiProperty({
    description: 'Access token from login',
    example: 'syt_dXNlcl9hZG1pbg_example_token',
  })
  accessToken: string;
}
