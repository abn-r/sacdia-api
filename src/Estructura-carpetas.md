Estructura de carpetas:

    src/
    └── modules/
        ├── **catalogs**/ (Para catálogos generales como countries, roles, permissions, etc.)
        │   ├── countries/
        │   ├── roles/
        │   ├── permissions/
        │   └── ...
        ├── **clubs-management**/ (Todo lo relacionado con la gestión de clubes y sus instancias)
        │   ├── clubs/ (Para el contenedor principal 'clubs')
        │   ├── club-adventurers/
        │   ├── club-pathfinders/
        │   ├── club-master-guild/
        │   ├── club-role-assignments/
        │   ├── units/
        │   ├── unit-members/
        │   ├── club-inventory/
        │   └── club-ideals/
        ├── **academic-progress**/ (Todo sobre clases, módulos, progreso)
        │   ├── classes/
        │   ├── class-modules/
        │   ├── class-sections/
        │   ├── enrollments/
        │   ├── class-module-progress/
        │   ├── class-section-progress/
        │   ├── honors/
        │   ├── users-honors/
        │   └── master-honors/
        ├── **events-activities**/ (Para campamentos, actividades)
        │   ├── activities/
        │   ├── local-camporees/
        │   ├── union-camporees/
        │   ├── attending-clubs-camporees/
        │   └── attending-members-camporees/
        ├── **financials**/
        │   ├── finances/
        │   └── finances-categories/
        ├── **folders-system**/ (Para el sistema de carpetas y sus registros)
        │   ├── folders/
        │   ├── folders-modules/
        │   ├── folders-sections/
        │   ├── folders-modules-records/
        │   ├── folders-section-records/
        │   └── assignments-folders/
        ├── **users-profile**/ (Gestión de usuarios y datos relacionados)
        │   ├── users/
        │   ├── users-roles/
        │   ├── users-permissions/
        │   ├── users-classes/
        │   ├── users-allergies/
        │   ├── users-diseases/
        │   ├── emergency-contacts/
        │   ├── users-pr/
        │   └── weekly-records/
        ├── **generic-catalogs**/ (Catálogos más pequeños o menos cambiantes)
        │   ├── ecclesiastical-year/
        │   ├── inventory-categories/
        │   ├── relationship-types/
        │   ├── medicines/
        │   └── ...
        ├── auth/
        ├── core/
        └── shared/