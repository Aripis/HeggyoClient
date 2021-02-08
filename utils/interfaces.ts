import {
    InstitutionType,
    EducationStage,
    UserStatus,
    UserRoles,
    ContractType,
    AssignmentType,
    MessageType,
    MessageStatus,
    WeekDays,
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

export interface Subject {
    id?: string;
    startYear?: number;
    endYear?: number;
    name?: string;
    description?: string;
    institution?: Institution;
    teachers?: Teacher[];
    class?: Class;
    messages?: Message[];
}

export interface Teacher {
    id?: string;
    user?: User;
    education?: string;
    yearsExperience?: number;
    contractType?: ContractType;
    subjects?: Subject[];
}

export interface Student {
    id?: string;
    user?: User;
    class?: Class;
    prevEducation?: string;
    recordMessage?: string;
    dossier?: StudentDossier;
}

export interface Class {
    id?: string;
    institution?: Institution;
    startYear?: number;
    endYear?: number;
    totalStudentCount?: number;
    classTeacher?: Teacher;
    classLetter?: string;
    classNumber?: number;
}

export interface Message {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    assignmentDueDate?: Date;
    from?: User;
    toUser?: User[];
    toClasses?: Class[];
    data?: string;
    filePath?: string;
    type?: MessageType;
    assignmentType?: AssignmentType;
    status?: MessageStatus;
    subject?: Subject;
}

export interface Schedule {
    id?: string;
    startTime?: Date;
    endTime?: Date;
    day?: WeekDays;
    subject?: Subject;
    class?: Class;
    teachers?: Teacher[];
    institution?: Institution;
    room?: string;
}

export interface StudentDossier {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    fromUser?: User;
    subject?: Subject;
    dossierMessage?: string;
}
