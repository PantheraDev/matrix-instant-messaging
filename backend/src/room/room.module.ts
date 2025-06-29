import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RoomController } from './room.controller';
import { SynapseService } from 'src/synapseService/synapse.service';

@Module({
  imports: [HttpModule],
  controllers: [RoomController],
  providers: [SynapseService],
})
export class RoomModule {}
