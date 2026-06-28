"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerService = void 0;
const common_1 = require("@nestjs/common");
let VolunteerService = class VolunteerService {
    getProfile() {
        return {
            id: 1,
            name: 'Nirzor Das',
            city: 'Dhaka',
            availability: 'WEEKENDS',
            skills: ['IT', 'Logistics'],
        };
    }
    applyTask(taskId, body) {
        return {
            message: `Successfully applied for task ${taskId}`,
            applicationMessage: body.message,
        };
    }
    getAssignments() {
        return [
            {
                taskId: 1,
                title: 'Food Distribution',
                status: 'IN_PROGRESS',
            },
            {
                taskId: 2,
                title: 'Medical Camp',
                status: 'PENDING',
            },
        ];
    }
    getBadges() {
        return [
            {
                name: 'First Deployment',
                earnedAt: '2026-06-22',
            },
            {
                name: '10 Hours Served',
                earnedAt: '2026-06-25',
            },
        ];
    }
    searchVolunteer(city, skill) {
        return {
            city,
            skill,
            message: `Searching volunteers from ${city} with ${skill} skill`,
        };
    }
};
exports.VolunteerService = VolunteerService;
exports.VolunteerService = VolunteerService = __decorate([
    (0, common_1.Injectable)()
], VolunteerService);
//# sourceMappingURL=volunteer.service.js.map