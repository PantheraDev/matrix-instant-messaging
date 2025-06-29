import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { HttpModule } from '@nestjs/axios';
import { SynapseService } from './synapseService/synapse.service';
import { MessageModule } from './message/message.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [HttpModule, MessageModule, RoomModule],
  controllers: [AuthController],
  providers: [SynapseService],
})
export class AppModule {}
