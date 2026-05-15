import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AiModule } from '../ai/ai.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [AiModule, ProfilesModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
