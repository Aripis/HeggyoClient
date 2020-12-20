export enum InstitutionType {
    TECHNOLOGICAL,
    MATHEMATICAL,
    NATURAL_MATHEMATICAL,
    HUMANITARIAN,
    ART,
    LINGUISTICAL,
    SU,
    OU,
}

export enum EducationStage {
    ELEMENTARY,
    PRIMARY,
    UNITED,
    HIGH,
    SECONDARY,
}

export enum UserStatus {
    ACTIVE,
    INACTIVE,
    BLOCKED,
    UNVERIFIED,
}

export enum UserRoles {
    ADMIN = 'admin',
    PARENT = 'parent',
    STUDENT = 'student',
    TEACHER = 'teacher',
    VIEWER = 'viewer',
}

export enum ContractType {
    PART_TIME = 'part_time',
    FULL_TIME = 'full_time',
}

export enum MessageType {
    ASSIGNMENT = 'assignment',
}

export enum MessageStatus {
    CREATED = 'created',
    PUBLISHED = 'published',
}
