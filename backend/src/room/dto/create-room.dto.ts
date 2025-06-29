import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Name of the room to create',
    example: 'My Private Room',
  })
  roomName: string;

  @ApiProperty({
    description: 'Access token from login',
    example: 'syt_dXNlcl9hZG1pbg_example_token',
  })
  accessToken: string;
}
