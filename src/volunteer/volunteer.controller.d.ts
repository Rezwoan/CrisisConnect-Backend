import { VolunteerService } from '../volunteer/volunteer.service';
export declare class VolunteerController {
    private readonly volunteerService;
    constructor(volunteerService: VolunteerService);
    getProfile(): {
        id: number;
        name: string;
        city: string;
        availability: string;
        skills: string[];
    };
    applyTask(taskId: string, body: any): {
        message: string;
        applicationMessage: any;
    };
    getAssignments(): {
        taskId: number;
        title: string;
        status: string;
    }[];
    getBadges(): {
        name: string;
        earnedAt: string;
    }[];
    searchVolunteer(city: string, skill: string): {
        city: string;
        skill: string;
        message: string;
    };
}
