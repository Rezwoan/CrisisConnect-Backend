export declare class VolunteerService {
    getProfile(): {
        id: number;
        name: string;
        city: string;
        availability: string;
        skills: string[];
    };
    applyTask(taskId: number, body: any): {
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
