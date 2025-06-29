import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomWithCodeDto {
  @ApiProperty({
    description: 'Room ID to join',
    example: '!roomId123:localhost',
  })
  roomId: string;

  @ApiProperty({
    description: 'Invite code for the room',
    example: 'ABC12345',
  })
  inviteCode: string;

  @ApiProperty({
    description: 'Access token from login',
    example: 'syt_dXNlcl9hZG1pbg_example_token',
  })
  accessToken: string;
}
