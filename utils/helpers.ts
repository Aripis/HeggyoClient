import {
    UserStatus,
    UserRoles,
    InstitutionType,
    EducationStage,
    ContractType,
    AssignmentType,
} from './enums';

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
    role: UserRoles | string | undefined
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
