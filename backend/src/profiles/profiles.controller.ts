import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/v1/profiles')
@UseGuards(AuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File, @Request() req: { user: { id: string } }) {
    return this.profilesService.uploadAndExtract(req.user.id, file);
  }

  @Get('queue')
  @Roles('hr')
  getQueue() {
    return this.profilesService.getPendingQueue();
  }

  @Get('my')
  getMyProfile(@Request() req: { user: { id: string } }) {
    return this.profilesService.getProfileByUserId(req.user.id);
  }

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.profilesService.getProfile(id);
  }

  @Patch(':id/approve')
  @Roles('hr')
  approve(@Param('id') id: string) {
    return this.profilesService.updateStatus(id, 'approved');
  }

  @Patch(':id/reject')
  @Roles('hr')
  reject(@Param('id') id: string) {
    return this.profilesService.updateStatus(id, 'rejected');
  }
}
