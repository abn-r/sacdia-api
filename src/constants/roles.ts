export const SUPER_ADMIN = 'super-admin';
export const ADMIN = 'admin';
export const DIRECTOR_DIA = 'director-dia';
export const ASSISTANT_DIA = 'assistant-dia';
export const DIRECTOR_UNION = 'director-union';
export const ASSISTANT_UNION = 'assistant-union';
export const DIRECTOR_LF = 'director-lf';
export const ASSISTANT_LF = 'assistant-lf';
export const GENERAL_COORDINATOR = 'general-coordinator';
export const ZONE_COORDINATOR = 'zone-coordinator';
export const COORDINATOR = 'coordinator';
export const DIRECTOR = 'director';
export const DEPUTY_DIRECTOR = 'deputy-director';
export const SECRETARY = 'secretary';
export const TREASURER = 'treasurer';
export const SECRETARY_TREASURER = 'secretary-treasurer';
export const COUNSELOR = 'counselor';
export const USER = 'user';

// Groups of roles
export const ALL = [
    SUPER_ADMIN,
    ADMIN,
    DIRECTOR_DIA,
    ASSISTANT_DIA,
    DIRECTOR_UNION,
    ASSISTANT_UNION,
    DIRECTOR_LF,
    ASSISTANT_LF,
    GENERAL_COORDINATOR,
    ZONE_COORDINATOR,
    COORDINATOR,
    DIRECTOR,
    DEPUTY_DIRECTOR,
    SECRETARY,
    TREASURER,
    SECRETARY_TREASURER,
    COUNSELOR,
    USER,
];

export const ALL_ADMIN = [
    SUPER_ADMIN,
    ADMIN,
];

export const LF_ADMIN = [
    DIRECTOR_LF,
    ASSISTANT_LF
];

export const CLUB_ALL = [
    DIRECTOR,
    DEPUTY_DIRECTOR,
    SECRETARY,
    TREASURER,
    SECRETARY_TREASURER,
    COUNSELOR,
    USER,
];

export const CLUB_ADMIN = [
    DIRECTOR,
    DEPUTY_DIRECTOR,
    SECRETARY,
    TREASURER,
    SECRETARY_TREASURER,
];
