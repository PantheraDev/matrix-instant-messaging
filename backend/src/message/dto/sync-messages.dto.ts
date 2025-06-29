import { ApiProperty } from '@nestjs/swagger';

export class SyncMessagesDto {
  @ApiProperty({
    description: 'Access token from login',
    example: 'syt_dXNlcl9hZG1pbg_example_token',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Sync token from previous sync',
    example: 's1234567890_abcdef',
    required: false,
  })
  since?: string;
}
