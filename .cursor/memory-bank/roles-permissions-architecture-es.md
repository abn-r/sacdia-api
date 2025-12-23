# Arquitectura del Sistema de Roles y Permisos

## Propósito General

El sistema de roles y permisos está diseñado para gestionar de manera unificada y flexible el acceso a las funcionalidades y datos de la aplicación. Distingue entre el acceso a nivel de sistema (global) y el acceso específico dentro de las instancias de los clubes (Aventureros, Conquistadores, Guías Mayores).

## Componentes Principales

### 1. Entidades Fundamentales
   - **Usuarios (`users`):** Entidades que interactúan con el sistema.
   - **Roles (`roles`):** Conjuntos de permisos. Se categorizan en:
      - `GLOBAL`: Para acceso a nivel de todo el sistema (ej. SuperAdmin, Auditor General).
      - `CLUB`: Para acceso dentro de un club específico (ej. Director de Club, Secretario).
      La tabla `roles` tiene un campo `role_category` (ENUM: `GLOBAL`, `CLUB`) para esta distinción.
   - **Permisos (`permissions`):** Acciones granulares que se pueden realizar en el sistema (ej. `CREATE_ACTIVITY`, `READ_USER_PROFILE`).
   - **Clubes Contenedores (`clubs`):** Entidad que agrupa las diferentes manifestaciones de un club (Aventureros, Conquistadores, Guías Mayores). Actúa como un paraguas general.
   - **Instancias de Club (`club_adventurers`, `club_pathfinders`, `club_master_guild`):** Tablas separadas para cada tipo de club. Cada registro en estas tablas representa una instancia específica de un club (ej. Club de Aventureros "Orión").
      - Cada una de estas tablas tiene una FK `main_club_id` que la vincula al registro correspondiente en la tabla `clubs`.

### 2. Tablas de Vinculación y Asignación
   - **`role_permissions`:** Tabla intermedia que vincula `roles` con `permissions`. Un rol puede tener muchos permisos y un permiso puede pertenecer a muchos roles.
      - El archivo `insert_role_permissions.sql` (mencionado como context7) es un ejemplo de cómo se pueblan estas asignaciones, donde un rol específico recibe un conjunto de permisos.
   - **`users_roles`:** Asigna roles de categoría `GLOBAL` a los usuarios. Define qué puede hacer un usuario a nivel general del sistema.
   - **`club_role_assignments`:** Asigna roles de categoría `CLUB` a los usuarios dentro de una instancia específica de club.
      - Campos clave: `user_id`, `role_id` (rol de tipo CLUB), `club_adv_id` (Nullable), `club_pathf_id` (Nullable), `club_mg_id` (Nullable).
      - **Restricción Importante:** Solo uno de `club_adv_id`, `club_pathf_id`, o `club_mg_id` debe estar poblado por fila, indicando a qué instancia de club específica se aplica el rol. Esto se refuerza con un `CHECK constraint` a nivel de base de datos.
      - Incluye campos para la temporalidad del rol: `start_date`, `end_date`, `is_active`.
      - **Unicidad:** Se asegura mediante índices únicos filtrados que un usuario no tenga el mismo rol activo simultáneamente en la misma instancia de club.

### 3. Segregación de Datos Específicos del Club
   - Tablas como `activities`, `club_inventory`, `finances`, `units`, `folders_modules_records`, `folders_section_records` almacenan datos que pertenecen a una instancia específica de club (Aventureros, Conquistadores o Guías Mayores), no al club contenedor.
   - Estas tablas tienen FKs opcionales: `club_adv_id`, `club_pathf_id`, `club_mg_id`.
   - **Restricción Importante:** Similar a `club_role_assignments`, solo uno de estos FKs de instancia de club debe estar poblado por registro, reforzado por un `CHECK constraint`.
   - Las restricciones `UNIQUE` en estas tablas (ej. nombre de unidad único) deben considerar el contexto de la instancia específica del club (ej. `UNIQUE(name, club_adv_id) WHERE club_adv_id IS NOT NULL`).

### 4. Generación de UUIDs
   - Para los campos UUID con valores por defecto generados por la base de datos, se utiliza la función `uuid_generate_v4()` (o `gen_random_uuid()` en PostgreSQL más reciente) directamente en la definición del esquema Prisma (`@default(dbgenerated("uuid_generate_v4()"))`). Esto evita problemas con esquemas de extensiones (como `extensions.uuid_generate_v4()`) en entornos como la shadow database de Prisma.

## Lógica de Acceso
   - **Acceso Global:** Determinado por los roles globales asignados a un usuario a través de `users_roles` y los permisos asociados a dichos roles en `role_permissions`.
   - **Acceso a Nivel de Club:** Para realizar acciones específicas dentro de un club (ej. crear una actividad para el Club de Aventureros "Orión"), el usuario debe:
      1. Tener un rol de categoría `CLUB` (ej. "Director") asignado.
      2. Dicha asignación (en `club_role_assignments`) debe estar vinculada a la instancia específica del club (ej. `club_adv_id` para "Orión Aventureros").
      3. La asignación debe estar activa (`is_active = true` y dentro del rango de `start_date`/`end_date`).

## Evolución y Consideraciones
   - Este diseño evolucionó para separar claramente el concepto de "club contenedor" de sus "instancias operativas" (Aventureros, Conquistadores, Guías Mayores).
   - La clave fue mover la lógica de asignación de roles y la pertenencia de datos específicos del club a las tablas de instancia, en lugar de la tabla contenedora `clubs`.
   - La gestión de la unicidad y las relaciones se volvió más granular, utilizando `CHECK constraints` e índices únicos filtrados para manejar la lógica de "solo uno de estos FKs de instancia".
   - La lógica de acceso basada en edad (mencionada en discusiones previas) es una capa adicional que se aplicaría sobre este sistema de roles y permisos. 