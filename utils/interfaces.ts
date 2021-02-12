import {
    InstitutionType,
    EducationStage,
    UserStatus,
    UserRole,
    ContractType,
    AssignmentType,
    MessageType,
    MessageStatus,
    WeekDays,
    GradeType,
    GradeWord,
} from './enums';

export interface Institution {
    id?: string;
    name?: string;
    email?: string;
    type: InstitutionType;
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
    role?: UserRole;
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
    subjects?: Subject[];
    institution?: Institution;
    startYear?: number;
    endYear?: number;
    totalStudentCount?: number;
    teacher?: Teacher;
    letter?: string;
    number?: number;
}

export interface UploadFile {
    filename?: string;
    publicUrl?: string;
}

export interface Message {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    assignmentDueDate?: Date;
    fromUser?: User;
    toUsers?: User[];
    toClasses?: Class[];
    data?: string;
    files?: UploadFile[];
    messageType?: MessageType;
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
    student?: Student;
    message?: string;
    files: UploadFile[];
}

export interface Grade {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    message?: string;
    type?: GradeType;
    grade?: number;
    gradeWithWords?: GradeWord;
    fromUser?: User;
    student?: Student;
    subject?: Subject;
}
