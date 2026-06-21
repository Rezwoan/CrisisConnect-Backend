import { Controller, Get, Param, Query } from '@nestjs/common';
import { NgoService } from './ngo.service';

@Controller('ngo')
export class NgoController {
    constructor(private readonly ngoService: NgoService) {}

    @Get('crises')
    getAllCrises(
        @Query('status') status?: string,
        @Query('city') city?: string,
    ): object {
        return this.ngoService.getAllCrises(status, city);
    }

    @Get('crises/:id')
    getCrisisById(@Param('id') id: string): object {
        return this.ngoService.getCrisisById(id);
    }

    @Get('crises/:id/tasks')
    getTasksByCrisis(
        @Param('id') id: string,
        @Query('status') status?: string,
    ): object {
        return this.ngoService.getTasksByCrisis(id, status);
    }

    @Get('volunteers')
    getVolunteers(@Query('crisisId') crisisId?: string): object {
        return this.ngoService.getVolunteers(crisisId);
    }
}