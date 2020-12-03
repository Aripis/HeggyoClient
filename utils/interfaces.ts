import {
    InstitutionType,
    EducationStage,
    UserStatus,
    UserRoles,
} from './enums';

export interface Institution {
    id?: string;
    name?: string;
    email?: string;
    type: InstitutionType;
    capacityPerClass?: number;
    educationalStage?: EducationStage;
    alias?: string;
    user?: User[];
}

export interface User {
    id?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    userRole?: UserRoles;
    status?: UserStatus;
    institution?: Institution[];
}
