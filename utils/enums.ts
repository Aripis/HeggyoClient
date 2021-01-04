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
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BLOCKED = 'blocked',
    UNVERIFIED = 'unverified',
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

export enum WeekDays {
    MONDAY = 'monday',
    TUESDAY = 'tuesday',
    WEDNESDAY = 'wednesday',
    THURSDAY = 'thursday',
    FRIDAY = 'friday',
    SATURDAY = 'saturday',
    SUNDAY = 'sunday',
}

export enum MessageType {
    ASSIGNMENT = 'assignment',
    MESSAGE = 'message',
}

export enum MessageStatus {
    CREATED = 'created',
    PUBLISHED = 'published',
}

export enum AssignmentType {
    HOMEWORK = 'homework',
    CLASSWORK = 'classwork',
    EXAM = 'exam',
}
