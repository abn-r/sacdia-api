# Enums y Constantes - SACDIA API

> **Generado automáticamente desde el código base existente**

---

## Enums de Prisma (Base de Datos)

### blood_type
**Ubicación:** `prisma/schema.prisma`

**Descripción:** Tipos de sangre

| Valor en BD | Valor Prisma | Descripción |
|-------------|--------------|-------------|
| `A+` | `A_POSITIVE` | Tipo A positivo |
| `A-` | `A_NEGATIVE` | Tipo A negativo |
| `B+` | `B_POSITIVE` | Tipo B positivo |
| `B-` | `B_NEGATIVE` | Tipo B negativo |
| `AB+` | `AB_POSITIVE` | Tipo AB positivo |
| `AB-` | `AB_NEGATIVE` | Tipo AB negativo |
| `O+` | `O_POSITIVE` | Tipo O positivo |
| `O-` | `O_NEGATIVE` | Tipo O negativo |

**Usado en:** `users.blood`

**Ejemplo en JSON:**
```json
{
  "blood": "O+"
}
```

---

### gender
**Ubicación:** `prisma/schema.prisma`

**Descripción:** Género del usuario

| Valor | Descripción |
|-------|-------------|
| `Masculino` | Género masculino |
| `Femenino` | Género femenino |

**Usado en:** `users.gender`

**Ejemplo en JSON:**
```json
{
  "gender": "Masculino"
}
```

---

### role_category
**Ubicación:** `prisma/schema.prisma`

**Descripción:** Categoría del rol (alcance)

| Valor | Descripción |
|-------|-------------|
| `GLOBAL` | Rol con alcance global (admin, director de unión, etc.) |
| `CLUB` | Rol con alcance de club (director, secretario, consejero, etc.) |

**Usado en:** `roles.role_category`

**Ejemplo en JSON:**
```json
{
  "role_category": "CLUB"
}
```

---

## Constantes de Roles

**Ubicación:** `src/common/constants/roles.ts`

### Roles Individuales

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `SUPER_ADMIN` | `super-admin` | Super administrador con acceso total |
| `ADMIN` | `admin` | Administrador general |
| `DIRECTOR_DIA` | `director-dia` | Director de la División Interamericana |
| `ASSISTANT_DIA` | `assistant-dia` | Asistente del Director de la DIA |
| `DIRECTOR_UNION` | `director-union` | Director de Unión |
| `ASSISTANT_UNION` | `assistant-union` | Asistente del Director de Unión |
| `DIRECTOR_LF` | `director-lf` | Director de Campo Local |
| `ASSISTANT_LF` | `assistant-lf` | Asistente del Director de Campo Local |
| `GENERAL_COORDINATOR` | `general-coordinator` | Coordinador General |
| `ZONE_COORDINATOR` | `zone-coordinator` | Coordinador de Zona |
| `COORDINATOR` | `coordinator` | Coordinador |
| `DIRECTOR` | `director` | Director de Club |
| `DEPUTY_DIRECTOR` | `deputy-director` | Subdirector de Club |
| `SECRETARY` | `secretary` | Secretario de Club |
| `TREASURER` | `treasurer` | Tesorero de Club |
| `SECRETARY_TREASURER` | `secretary-treasurer` | Secretario-Tesorero de Club |
| `COUNSELOR` | `counselor` | Consejero de Club |
| `USER` | `user` | Usuario regular |

### Grupos de Roles

| Grupo | Roles incluidos |
|-------|-----------------|
| `ALL` | Todos los roles |
| `ALL_ADMIN` | `super-admin`, `admin` |
| `ALL_UNION` | `director-union`, `assistant-union` |
| `LF_ADMIN` | `director-lf`, `assistant-lf` |
| `ALL_COORDINATOR` | `general-coordinator`, `zone-coordinator`, `coordinator` |
| `CLUB_ALL` | `director`, `deputy-director`, `secretary`, `treasurer`, `secretary-treasurer`, `counselor`, `user` |
| `CLUB_ADMIN` | `director`, `deputy-director`, `secretary`, `treasurer`, `secretary-treasurer` |
| `CLUB_SECRETARY` | `secretary`, `secretary-treasurer` |

---

## Constantes de Permisos

**Ubicación:** `src/common/constants/permissions.ts`

**Formato:** `action:resource`

### Permisos por Recurso

#### Activities
| Constante | Valor |
|-----------|-------|
| `CREATE_ACTIVITIES` | `create:activities` |
| `READ_ACTIVITIES` | `read:activities` |
| `UPDATE_ACTIVITIES` | `update:activities` |
| `DELETE_ACTIVITIES` | `delete:activities` |

#### Users
| Constante | Valor |
|-----------|-------|
| `CREATE_USERS` | `create:users` |
| `READ_USERS` | `read:users` |
| `UPDATE_USERS` | `update:users` |
| `DELETE_USERS` | `delete:users` |

#### Clubs
| Constante | Valor |
|-----------|-------|
| `CREATE_CLUBS` | `create:clubs` |
| `READ_CLUBS` | `read:clubs` |
| `UPDATE_CLUBS` | `update:clubs` |
| `DELETE_CLUBS` | `delete:clubs` |

#### Club Types
| Constante | Valor |
|-----------|-------|
| `CREATE_CLUB_TYPES` | `create:club_types` |
| `READ_CLUB_TYPES` | `read:club_types` |
| `UPDATE_CLUB_TYPES` | `update:club_types` |
| `DELETE_CLUB_TYPES` | `delete:club_types` |

#### Club Instances
| Constante | Valor |
|-----------|-------|
| `CREATE_CLUB_ADVENTURERS` | `create:club_adventurers` |
| `READ_CLUB_ADVENTURERS` | `read:club_adventurers` |
| `UPDATE_CLUB_ADVENTURERS` | `update:club_adventurers` |
| `DELETE_CLUB_ADVENTURERS` | `delete:club_adventurers` |
| `CREATE_CLUB_PATHFINDERS` | `create:club_pathfinders` |
| `READ_CLUB_PATHFINDERS` | `read:club_pathfinders` |
| `UPDATE_CLUB_PATHFINDERS` | `update:club_pathfinders` |
| `DELETE_CLUB_PATHFINDERS` | `delete:club_pathfinders` |
| `CREATE_CLUB_MASTER_GUILD` | `create:club_master_guild` |
| `READ_CLUB_MASTER_GUILD` | `read:club_master_guild` |
| `UPDATE_CLUB_MASTER_GUILD` | `update:club_master_guild` |
| `DELETE_CLUB_MASTER_GUILD` | `delete:club_master_guild` |

#### Club Role Assignments
| Constante | Valor |
|-----------|-------|
| `CREATE_CLUB_ROLE_ASSIGNMENTS` | `create:club_role_assignments` |
| `READ_CLUB_ROLE_ASSIGNMENTS` | `read:club_role_assignments` |
| `UPDATE_CLUB_ROLE_ASSIGNMENTS` | `update:club_role_assignments` |
| `DELETE_CLUB_ROLE_ASSIGNMENTS` | `delete:club_role_assignments` |

#### Classes
| Constante | Valor |
|-----------|-------|
| `CREATE_CLASSES` | `create:classes` |
| `READ_CLASSES` | `read:classes` |
| `UPDATE_CLASSES` | `update:classes` |
| `DELETE_CLASSES` | `delete:classes` |

#### Countries
| Constante | Valor |
|-----------|-------|
| `CREATE_COUNTRIES` | `create:countries` |
| `READ_COUNTRIES` | `read:countries` |
| `UPDATE_COUNTRIES` | `update:countries` |
| `DELETE_COUNTRIES` | `delete:countries` |

#### Unions
| Constante | Valor |
|-----------|-------|
| `CREATE_UNIONS` | `create:unions` |
| `READ_UNIONS` | `read:unions` |
| `UPDATE_UNIONS` | `update:unions` |
| `DELETE_UNIONS` | `delete:unions` |

#### Local Fields
| Constante | Valor |
|-----------|-------|
| `CREATE_LOCAL_FIELDS` | `create:local_fields` |
| `READ_LOCAL_FIELDS` | `read:local_fields` |
| `UPDATE_LOCAL_FIELDS` | `update:local_fields` |
| `DELETE_LOCAL_FIELDS` | `delete:local_fields` |

#### Districts
| Constante | Valor |
|-----------|-------|
| `CREATE_DISTRICTS` | `create:districts` |
| `READ_DISTRICTS` | `read:districts` |
| `UPDATE_DISTRICTS` | `update:districts` |
| `DELETE_DISTRICTS` | `delete:districts` |

#### Churches
| Constante | Valor |
|-----------|-------|
| `CREATE_CHURCHES` | `create:churches` |
| `READ_CHURCHES` | `read:churches` |
| `UPDATE_CHURCHES` | `update:churches` |
| `DELETE_CHURCHES` | `delete:churches` |

#### Honors
| Constante | Valor |
|-----------|-------|
| `CREATE_HONORS` | `create:honors` |
| `READ_HONORS` | `read:honors` |
| `UPDATE_HONORS` | `update:honors` |
| `DELETE_HONORS` | `delete:honors` |

#### Honors Categories
| Constante | Valor |
|-----------|-------|
| `CREATE_HONORS_CATEGORIES` | `create:honors_categories` |
| `READ_HONORS_CATEGORIES` | `read:honors_categories` |
| `UPDATE_HONORS_CATEGORIES` | `update:honors_categories` |
| `DELETE_HONORS_CATEGORIES` | `delete:honors_categories` |

#### Master Honors
| Constante | Valor |
|-----------|-------|
| `CREATE_MASTER_HONORS` | `create:master_honors` |
| `READ_MASTER_HONORS` | `read:master_honors` |
| `UPDATE_MASTER_HONORS` | `update:master_honors` |
| `DELETE_MASTER_HONORS` | `delete:master_honors` |

#### Allergies
| Constante | Valor |
|-----------|-------|
| `CREATE_ALLERGIES` | `create:allergies` |
| `READ_ALLERGIES` | `read:allergies` |
| `UPDATE_ALLERGIES` | `update:allergies` |
| `DELETE_ALLERGIES` | `delete:allergies` |

#### Diseases
| Constante | Valor |
|-----------|-------|
| `CREATE_DISEASES` | `create:diseases` |
| `READ_DISEASES` | `read:diseases` |
| `UPDATE_DISEASES` | `update:diseases` |
| `DELETE_DISEASES` | `delete:diseases` |

#### Emergency Contacts
| Constante | Valor |
|-----------|-------|
| `CREATE_EMERGENCY_CONTACTS` | `create:emergency_contacts` |
| `READ_EMERGENCY_CONTACTS` | `read:emergency_contacts` |
| `UPDATE_EMERGENCY_CONTACTS` | `update:emergency_contacts` |
| `DELETE_EMERGENCY_CONTACTS` | `delete:emergency_contacts` |

#### Roles
| Constante | Valor |
|-----------|-------|
| `CREATE_ROLES` | `create:roles` |
| `READ_ROLES` | `read:roles` |
| `UPDATE_ROLES` | `update:roles` |
| `DELETE_ROLES` | `delete:roles` |

#### Permissions
| Constante | Valor |
|-----------|-------|
| `CREATE_PERMISSIONS` | `create:permissions` |
| `READ_PERMISSIONS` | `read:permissions` |
| `UPDATE_PERMISSIONS` | `update:permissions` |
| `DELETE_PERMISSIONS` | `delete:permissions` |

#### Role Permissions
| Constante | Valor |
|-----------|-------|
| `CREATE_ROLE_PERMISSIONS` | `create:role_permissions` |
| `READ_ROLE_PERMISSIONS` | `read:role_permissions` |
| `UPDATE_ROLE_PERMISSIONS` | `update:role_permissions` |
| `DELETE_ROLE_PERMISSIONS` | `delete:role_permissions` |

#### Users Roles
| Constante | Valor |
|-----------|-------|
| `CREATE_USERS_ROLES` | `create:users_roles` |
| `READ_USERS_ROLES` | `read:users_roles` |
| `UPDATE_USERS_ROLES` | `update:users_roles` |
| `DELETE_USERS_ROLES` | `delete:users_roles` |

#### Users Allergies
| Constante | Valor |
|-----------|-------|
| `CREATE_USERS_ALLERGIES` | `create:users_allergies` |
| `READ_USERS_ALLERGIES` | `read:users_allergies` |
| `UPDATE_USERS_ALLERGIES` | `update:users_allergies` |
| `DELETE_USERS_ALLERGIES` | `delete:users_allergies` |

#### Users Diseases
| Constante | Valor |
|-----------|-------|
| `CREATE_USERS_DISEASES` | `create:users_diseases` |
| `READ_USERS_DISEASES` | `read:users_diseases` |
| `UPDATE_USERS_DISEASES` | `update:users_diseases` |
| `DELETE_USERS_DISEASES` | `delete:users_diseases` |

#### Users Classes
| Constante | Valor |
|-----------|-------|
| `CREATE_USERS_CLASSES` | `create:users_classes` |
| `READ_USERS_CLASSES` | `read:users_classes` |
| `UPDATE_USERS_CLASSES` | `update:users_classes` |
| `DELETE_USERS_CLASSES` | `delete:users_classes` |

#### Users Honors
| Constante | Valor |
|-----------|-------|
| `CREATE_USERS_HONORS` | `create:users_honors` |
| `READ_USERS_HONORS` | `read:users_honors` |
| `UPDATE_USERS_HONORS` | `update:users_honors` |
| `DELETE_USERS_HONORS` | `delete:users_honors` |

#### User Honors (alias)
| Constante | Valor |
|-----------|-------|
| `CREATE_USER_HONORS` | `create:user_honors` |
| `READ_USER_HONORS` | `read:user_honors` |
| `UPDATE_USER_HONORS` | `update:user_honors` |
| `DELETE_USER_HONORS` | `delete:user_honors` |

#### Files
| Constante | Valor |
|-----------|-------|
| `CREATE_FILES` | `create:files` |
| `READ_FILES` | `read:files` |
| `UPDATE_FILES` | `update:files` |
| `DELETE_FILES` | `delete:files` |

#### Finances
| Constante | Valor |
|-----------|-------|
| `CREATE_FINANCES` | `create:finances` |
| `READ_FINANCES` | `read:finances` |
| `UPDATE_FINANCES` | `update:finances` |
| `DELETE_FINANCES` | `delete:finances` |

#### Finances Categories
| Constante | Valor |
|-----------|-------|
| `CREATE_FINANCES_CATEGORIES` | `create:finances_categories` |
| `READ_FINANCES_CATEGORIES` | `read:finances_categories` |
| `UPDATE_FINANCES_CATEGORIES` | `update:finances_categories` |
| `DELETE_FINANCES_CATEGORIES` | `delete:finances_categories` |

#### Enrollments
| Constante | Valor |
|-----------|-------|
| `CREATE_ENROLLMENTS` | `create:enrollments` |
| `READ_ENROLLMENTS` | `read:enrollments` |
| `UPDATE_ENROLLMENTS` | `update:enrollments` |
| `DELETE_ENROLLMENTS` | `delete:enrollments` |

#### Units
| Constante | Valor |
|-----------|-------|
| `CREATE_UNITS` | `create:units` |
| `READ_UNITS` | `read:units` |
| `UPDATE_UNITS` | `update:units` |
| `DELETE_UNITS` | `delete:units` |

#### Unit Members
| Constante | Valor |
|-----------|-------|
| `CREATE_UNIT_MEMBERS` | `create:unit_members` |
| `READ_UNIT_MEMBERS` | `read:unit_members` |
| `UPDATE_UNIT_MEMBERS` | `update:unit_members` |
| `DELETE_UNIT_MEMBERS` | `delete:unit_members` |

#### Folders
| Constante | Valor |
|-----------|-------|
| `CREATE_FOLDERS` | `create:folders` |
| `READ_FOLDERS` | `read:folders` |
| `UPDATE_FOLDERS` | `update:folders` |
| `DELETE_FOLDERS` | `delete:folders` |

#### Weekly Records
| Constante | Valor |
|-----------|-------|
| `CREATE_WEEKLY_RECORDS` | `create:weekly_records` |
| `READ_WEEKLY_RECORDS` | `read:weekly_records` |
| `UPDATE_WEEKLY_RECORDS` | `update:weekly_records` |
| `DELETE_WEEKLY_RECORDS` | `delete:weekly_records` |

#### Camporees
| Constante | Valor |
|-----------|-------|
| `CREATE_LOCAL_CAMPOREES` | `create:local_camporees` |
| `READ_LOCAL_CAMPOREES` | `read:local_camporees` |
| `UPDATE_LOCAL_CAMPOREES` | `update:local_camporees` |
| `DELETE_LOCAL_CAMPOREES` | `delete:local_camporees` |
| `CREATE_UNION_CAMPOREES` | `create:union_camporees` |
| `READ_UNION_CAMPOREES` | `read:union_camporees` |
| `UPDATE_UNION_CAMPOREES` | `update:union_camporees` |
| `DELETE_UNION_CAMPOREES` | `delete:union_camporees` |

### Permisos Especiales

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `ASSIGN_PERMISSIONS_TO_ROLES` | `assign:permissions_to_roles` | Asignar permisos a roles |
| `CREATE_CLUB_INSTANCES` | `create.club.instances` | Crear instancias de club |
| `ASSIGN_CLUB_ROLE` | `assign.club.role` | Asignar roles en clubes |

---

## Tipos de Club (club_types)

| ct_id | Nombre | Descripción |
|-------|--------|-------------|
| 1 | Aventureros | Club de Aventureros (6-9 años) |
| 2 | Conquistadores | Club de Conquistadores (10-15 años) |
| 3 | Guías Mayores | Club de Guías Mayores (16+ años) |

**Ejemplo en JSON:**
```json
{
  "club_type_id": 2,
  "name": "Conquistadores"
}
```

---

## Valores por Defecto en Modelos

### activities
| Campo | Valor por defecto |
|-------|-------------------|
| `active` | `false` |
| `activity_time` | `"09:00"` |
| `activity_place` | `"place"` |
| `platform` | `0` |
| `activity_type` | `0` |

### club_adventurers / club_pathfinders / club_master_guild
| Campo | Valor por defecto |
|-------|-------------------|
| `active` | `false` |
| `souls_target` | `1` |
| `fee` | `1` |

### users
| Campo | Valor por defecto |
|-------|-------------------|
| `active` | `true` |
| `baptism` | `false` |
| `apple_connected` | `false` |
| `fb_connected` | `false` |
| `google_connected` | `false` |
| `access_app` | `true` |
| `access_panel` | `false` |

### folders
| Campo | Valor por defecto |
|-------|-------------------|
| `status` | `"incompleto"` |
| `total_points` | `0` |
| `max_points` | `0` |
| `minimum_points` | `0` |

### honors
| Campo | Valor por defecto |
|-------|-------------------|
| `active` | `true` |
| `approval` | `1` |
| `skill_level` | `1` |

### users_honors
| Campo | Valor por defecto |
|-------|-------------------|
| `active` | `true` |
| `validate` | `false` |
| `images` | `[]` |
