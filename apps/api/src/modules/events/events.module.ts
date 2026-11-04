import { Module } from '@nestjs/common';
import { TaskEventsPublisher } from './task-events.publisher';

@Module({
  providers: [TaskEventsPublisher],
  exports: [TaskEventsPublisher],
})
export class EventsModule {}
