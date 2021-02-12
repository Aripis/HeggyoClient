import {
    UserStatus,
    UserRole,
    InstitutionType,
    EducationStage,
    ContractType,
    AssignmentType,
    MessageType,
} from './enums';

export const getGradeType = (gradeType: string): string | undefined => {
    switch (gradeType) {
        case 'TURM_1':
            return '1 срок';
        case 'TURM_2':
            return '2 срок';
        case 'ONGOING':
            return 'текуща';
        case 'YEAR':
            return 'годишна';
        default:
            return undefined;
    }
};

export const getGradeForBackEnd = (grade: number): string | undefined => {
    switch (grade) {
        case 2:
            return 'bad';
        case 3:
            return 'average';
        case 4:
            return 'good';
        case 5:
            return 'very good';
        case 6:
            return 'excellent';
        default:
            return undefined;
    }
};

export const getGradeName = (
    name: string | undefined,
    short = false
): string | undefined => {
    switch (name) {
        case 'BAD':
            return short ? 'сл.' : 'слаб';
        case 'AVERAGE':
            return short ? 'ср.' : 'среден';
        case 'GOOD':
            return short ? 'доб.' : 'добър';
        case 'VERY GOOD':
            return short ? 'мн. доб.' : 'мн. добър';
        case 'EXCELLENT':
            return short ? 'отл.' : 'отличен';
        default:
            return undefined;
    }
};

export const getMessageType = (
    type: MessageType | string | undefined
): string | undefined => {
    switch (type) {
        case 'MESSAGE':
            return 'Съобщениe';
        case 'ASSIGNMENT':
            return 'Заданиe';
        default:
            return undefined;
    }
};

export const getAssignmentType = (
    type: AssignmentType | string | undefined
): string | undefined => {
    switch (type) {
        case 'HOMEWORK':
            return 'Домашно';
        case 'CLASSWORK':
            return 'Работа в клас';
        case 'EXAM':
            return 'Контролно';
        default:
            return undefined;
    }
};

export const getContractType = (
    type: ContractType | string | undefined
): string | undefined => {
    switch (type) {
        case 'PART_TIME':
            return 'Хоноруван';
        case 'FULL_TIME':
            return 'На договор';
        default:
            return undefined;
    }
};

export const getUserStatus = (
    status: UserStatus | string | undefined
): string | undefined => {
    switch (status) {
        case 'UNVERIFIED':
            return 'Непотвърден';
        case 'ACTIVE':
            return 'Активен';
        case 'INACTIVE':
            return 'Неактивен';
        case 'BLOCKED':
            return 'Блокиран';
        default:
            return undefined;
    }
};

export const getInstitutionType = (
    type: InstitutionType | string | undefined
): string | undefined => {
    switch (type) {
        case 'TECHNOLOGICAL':
            return 'Технологично';
        case 'MATHEMATICAL':
            return 'Математичска';
        case 'NATURAL_MATHEMATICAL':
            return 'Природоматематичска';
        case 'HUMANITARIAN':
            return 'Хуманитарна';
        case 'ART':
            return 'Художествена';
        case 'LINGUISTICAL':
            return 'Езикова';
        case 'SU':
            return 'СУ';
        case 'OU':
            return 'ОУ';
        default:
            return undefined;
    }
};

export const getEducationStage = (
    stage: EducationStage | string | undefined
): string | undefined => {
    switch (stage) {
        case 'ELEMENTARY':
            return 'Начално училище';
        case 'PRIMARY':
            return 'Основно училище';
        case 'UNITED':
            return 'Обединено училище';
        case 'HIGH':
            return 'Гимназия';
        case 'SECONDARY':
            return 'Гимназия';
        default:
            return undefined;
    }
};

export const getUserRole = (
    role: UserRole | string | undefined
): string | undefined => {
    switch (role) {
        case 'ADMIN':
            return 'Админ';
        case 'PARENT':
            return 'Родител';
        case 'STUDENT':
            return 'Ученик';
        case 'TEACHER':
            return 'Учител';
        case 'VIEWER':
            return 'Посетител';
        default:
            return undefined;
    }
};
