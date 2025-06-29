import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty({
        description: 'The username of the user',
    })
    user: string;

    @ApiProperty({
        description: 'The password of the user',
    })
    password: string;
}