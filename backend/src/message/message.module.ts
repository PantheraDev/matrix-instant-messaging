import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MessageController } from './message.controller';
import { SynapseService } from 'src/synapseService/synapse.service';

@Module({
  imports: [HttpModule],
  controllers: [MessageController],
  providers: [SynapseService],
})
export class MessageModule {}
