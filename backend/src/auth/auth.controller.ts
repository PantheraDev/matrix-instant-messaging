import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SynapseService } from 'src/synapseService/synapse.service';
import { LoginDto } from './dto/login.dto';
@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly synapseService: SynapseService) {}

  @Post('login')
  async login(@Body() body: LoginDto): Promise<{ message: string; data: any }> {
    const result = await this.synapseService.login(body.user, body.password);
    return { message: 'User logged in successfully', data: result };
  }

  @Post('register')
  async register(
    @Body() body: LoginDto,
  ): Promise<{ message: string; data: any }> {
    const result = await this.synapseService.register(body.user, body.password);
    return { message: 'User registered successfully', data: result };
  }

  
}
