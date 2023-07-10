import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateReportDto } from './dtos/create-report.dto';
import { CurrentUser, SerializeResponse } from '../decorators/app';
import { User } from '../users/user.entity';
import { ReportsService } from './reports.service';
import { ReportDto } from './dtos/report.dto';
import { AdminGuard } from '../guards/admin.guard';

@Controller('reports')
@SerializeResponse(ReportDto)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @UseGuards(AdminGuard)
  @Post()
  async postReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return await this.reportsService.createReport(body, user);
  }
}
