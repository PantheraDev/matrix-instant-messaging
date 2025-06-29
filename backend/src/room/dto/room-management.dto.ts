import { ApiProperty } from '@nestjs/swagger';

export class GetUserRoomsDto {
  @ApiProperty({
    description: 'Access token from login',
    example: 'syt_dXNlcl9hZG1pbg_example_token',
  })
  accessToken: string;
}

export class GetRoomDetailsDto {
  @ApiProperty({
    description: 'Room ID to get details for',
    example: '!roomId123:localhost',
  })
  roomId: string;

  @ApiProperty({
    description: 'Access token from login',
    example: 'syt_dXNlcl9hZG1pbg_example_token',
  })
  accessToken: string;
}

export class LeaveRoomDto {
  @ApiProperty({
    description: 'Room ID to leave',
    example: '!roomId123:localhost',
  })
  roomId: string;

  @ApiProperty({
    description: 'Access token from login',
    example: 'syt_dXNlcl9hZG1pbg_example_token',
  })
  accessToken: string;
}
