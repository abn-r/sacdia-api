# Documentación de Endpoints - SACDIA API

> **Generado automáticamente desde el código base existente**

## Información General

- **Framework:** NestJS
- **Base URL:** `http://localhost:3000`
- **Documentación Swagger:** `/docs`
- **Formato de respuestas:** JSON

---

## Autenticación

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer {token}
```

---

# Authentication (`/auth`)

## POST /auth/signup
**Descripción:** Registrar un nuevo usuario

**Autenticación:** No

**Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)",
  "name": "string (required)",
  "p_lastname": "string (required)",
  "m_lastname": "string (required)"
}
```

**Response Success (201):**
```json
{
  "status": true,
  "message": "User registered successfully",
  "data": {
    "user_id": "uuid",
    "email": "user@example.com"
  }
}
```

---

## POST /auth/signin
**Descripción:** Iniciar sesión con email y contraseña

**Autenticación:** No

**Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "data": {
    "access_token": "jwt_token",
    "user": {
      "user_id": "uuid",
      "email": "user@example.com"
    }
  }
}
```

---

## POST /auth/signout
**Descripción:** Cerrar sesión del usuario actual

**Autenticación:** Sí (Bearer Token)

**Response Success (200):**
```json
{
  "status": true,
  "message": "User signed out successfully"
}
```

---

## POST /auth/request-password-reset
**Descripción:** Solicitar email de restablecimiento de contraseña

**Autenticación:** No

**Body:**
```json
{
  "email": "string (required)"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Reset email sent if user exists"
}
```

---

## POST /auth/password-reset
**Descripción:** Restablecer contraseña con token

**Autenticación:** No

**Body:**
```json
{
  "newPassword": "string (required)"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Password updated successfully"
}
```

---

## POST /auth/pr-check
**Descripción:** Verificar si el registro de perfil del usuario está completo

**Autenticación:** Sí (Bearer Token)

**Response Success (200):**
```json
{
  "status": true,
  "data": {
    "complete": true
  }
}
```

---

## POST /auth/pr-complete
**Descripción:** Marcar registro de perfil como completo

**Autenticación:** Sí (Bearer Token)

**Response Success (200):**
```json
{
  "status": true,
  "message": "Registration completed"
}
```

---

## GET /auth/profile
**Descripción:** Obtener perfil del usuario actual con roles y permisos

**Autenticación:** Sí (Bearer Token)

**Response Success (200):**
```json
{
  "status": true,
  "data": {
    "user_id": "uuid",
    "name": "string",
    "email": "string",
    "roles": ["role_name"],
    "permissions": ["permission_name"]
  }
}
```

---

# Users (`/users`)

**Nota:** Todos los endpoints de usuarios requieren autenticación y permisos específicos.

## GET /users
**Descripción:** Obtener lista de usuarios

**Autenticación:** Sí

**Permisos:** `read:users`

**Query Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| skip | number | Registros a omitir |
| take | number | Registros a tomar (default: 10) |
| cursor | string (uuid) | Cursor para paginación |
| where | string (JSON) | Filtros |
| orderBy | string (JSON) | Ordenamiento |

**Response Success (200):**
```json
{
  "status": true,
  "data": [
    {
      "user_id": "uuid",
      "name": "string",
      "paternal_last_name": "string",
      "mother_last_name": "string",
      "email": "string",
      "active": true,
      "gender": "string",
      "birthday": "date",
      "blood": "A+",
      "baptism": true,
      "user_image": "string"
    }
  ],
  "total": 100
}
```

---

## GET /users/:id
**Descripción:** Obtener un usuario por ID

**Autenticación:** Sí

**Permisos:** `read:users`

**Parámetros de Ruta:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | ID del usuario |

**Response Success (200):**
```json
{
  "status": true,
  "data": {
    "user_id": "uuid",
    "name": "string",
    "paternal_last_name": "string",
    "mother_last_name": "string",
    "email": "string",
    "active": true,
    "gender": "string",
    "birthday": "2000-01-15",
    "blood": "O+",
    "baptism": true,
    "baptism_date": "2015-06-20",
    "user_image": "url",
    "country_id": 1,
    "union_id": 1,
    "local_field_id": 1
  }
}
```

---

## PATCH /users/:id
**Descripción:** Actualizar un usuario

**Autenticación:** Sí

**Permisos:** `update:users`

**Parámetros de Ruta:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | ID del usuario |

**Body:** Campos a actualizar (parcial de users)

**Response Success (200):**
```json
{
  "status": true,
  "message": "User updated successfully",
  "data": { ... }
}
```

---

## DELETE /users/:id
**Descripción:** Eliminar un usuario

**Autenticación:** Sí

**Permisos:** `delete:users`

**Roles permitidos:** `super-admin`

**Response Success (200):**
```json
{
  "status": true,
  "message": "User deleted successfully"
}
```

---

# Users - Emergency Contacts (`/users/emergency-contacts`)

## POST /users/emergency-contacts
**Descripción:** Crear contacto de emergencia

**Autenticación:** Sí

**Permisos:** `create:emergency_contacts`

**Body:**
```json
{
  "name": "string",
  "relationship_type": 1,
  "primary": true,
  "phone": "string",
  "owner_id": "uuid",
  "contact_user_id": "uuid (optional)"
}
```

---

## GET /users/emergency-contacts
**Descripción:** Obtener lista de contactos de emergencia

**Autenticación:** Sí

**Permisos:** `read:emergency_contacts`

**Query Params:** skip, take, cursor, where, orderBy

---

## GET /users/emergency-contacts/all?userId={uuid}
**Descripción:** Obtener todos los contactos de emergencia de un usuario

**Autenticación:** Sí

**Query Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| userId | uuid | ID del usuario |

---

## GET /users/emergency-contacts/:id
**Descripción:** Obtener contacto de emergencia por ID

## PATCH /users/emergency-contacts/:id
**Descripción:** Actualizar contacto de emergencia

## DELETE /users/emergency-contacts/:id
**Descripción:** Eliminar contacto de emergencia (soft delete)

---

# Users - Allergies (`/users/allergies`)

## POST /users/allergies
**Descripción:** Crear relación usuario-alergia

## POST /users/allergies/many
**Descripción:** Crear múltiples relaciones usuario-alergia

## POST /users/allergies/assign-allergies
**Descripción:** Asignar múltiples alergias a un usuario

**Body:**
```json
{
  "userId": "uuid",
  "allergyIds": [1, 2, 3]
}
```

## GET /users/allergies
**Descripción:** Obtener todas las relaciones usuario-alergia

## GET /users/allergies/:id
**Descripción:** Obtener relación por ID

## GET /users/allergies/by-user/:userId
**Descripción:** Obtener alergias de un usuario

## GET /users/allergies/by-allergy/:allergyId
**Descripción:** Obtener usuarios con una alergia específica

## PATCH /users/allergies/:id
**Descripción:** Actualizar relación

## DELETE /users/allergies/:id
**Descripción:** Eliminar relación (soft delete)

## DELETE /users/allergies/by-user/:userId
**Descripción:** Eliminar todas las alergias de un usuario

## DELETE /users/allergies/by-user-allergy/:userId/:allergyId
**Descripción:** Eliminar una alergia específica de un usuario

---

# Users - Diseases (`/users/diseases`)

## POST /users/diseases
**Descripción:** Crear relación usuario-enfermedad

## POST /users/diseases/many
**Descripción:** Crear múltiples relaciones

## POST /users/diseases/assign-diseases
**Descripción:** Asignar múltiples enfermedades a un usuario

**Body:**
```json
{
  "userId": "uuid",
  "diseaseIds": [1, 2, 3]
}
```

## GET /users/diseases
**Descripción:** Obtener todas las relaciones

## GET /users/diseases/:id
**Descripción:** Obtener relación por ID

## GET /users/diseases/by-user/:userId
**Descripción:** Obtener enfermedades de un usuario

## GET /users/diseases/by-disease/:diseaseId
**Descripción:** Obtener usuarios con una enfermedad específica

## PATCH /users/diseases/:id
**Descripción:** Actualizar relación

## DELETE /users/diseases/:id
**Descripción:** Eliminar relación (soft delete)

## DELETE /users/diseases/by-user/:userId
**Descripción:** Eliminar todas las enfermedades de un usuario

## DELETE /users/diseases/by-user-disease/:userId/:diseaseId
**Descripción:** Eliminar una enfermedad específica de un usuario

---

# Users - Honors (`/users/users-honors`)

## POST /users/users-honors
**Descripción:** Crear relación usuario-especialidad

**Body:**
```json
{
  "user_id": "uuid",
  "honor_id": 1,
  "certificate": "url",
  "images": [],
  "document": "url (optional)",
  "date": "2024-01-15"
}
```

## GET /users/users-honors
**Descripción:** Obtener todas las relaciones

**Query Params:** skip, take, cursor, where, orderBy

## GET /users/users-honors/:userId/by-category
**Descripción:** Obtener especialidades de un usuario agrupadas por categoría

## GET /users/users-honors/:id
**Descripción:** Obtener relación por ID

## PATCH /users/users-honors/:id
**Descripción:** Actualizar relación

## DELETE /users/users-honors/:id
**Descripción:** Eliminar relación

---

# Users - Classes (`/users/users-classes`)

## POST /users/users-classes/add
**Descripción:** Agregar clase a usuario

**Body:**
```json
{
  "user_id": "uuid",
  "class_id": 1,
  "investiture": false,
  "advanced": false,
  "current_class": true
}
```

## GET /users/users-classes
**Descripción:** Obtener todas las relaciones usuario-clase

## GET /users/users-classes/:id
**Descripción:** Obtener relación por ID

## GET /users/users-classes/by-user/:userId
**Descripción:** Obtener clases de un usuario

## GET /users/users-classes/by-class/:classId
**Descripción:** Obtener usuarios en una clase específica

## PATCH /users/users-classes/:id
**Descripción:** Actualizar relación

## DELETE /users/users-classes/:id
**Descripción:** Eliminar relación (soft delete)

---

# Clubs (`/clubs`)

## POST /clubs
**Descripción:** Crear un club contenedor con instancias

**Body:**
```json
{
  "name": "string",
  "description": "string",
  "active": true,
  "address": "string",
  "coordinates": {"lat": 0, "lng": 0},
  "localFieldId": 1,
  "districtId": 1,
  "churchId": 1,
  "createAdventurerInstance": true,
  "adventurerInstanceData": {
    "clubTypeId": 1,
    "soulsTarget": 5,
    "fee": 100,
    "meetingDay": [],
    "meetingTime": []
  },
  "createPathfinderInstance": false,
  "createMasterGuideInstance": false
}
```

## POST /clubs/many
**Descripción:** Crear múltiples clubs

## GET /clubs
**Descripción:** Obtener lista de clubs

**Query Params:** skip, take, cursor, where, orderBy

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "club_id": 1,
      "name": "Club Alfa",
      "description": "Descripción",
      "active": true,
      "local_field_id": 1,
      "district_id": 1,
      "church_id": 1,
      "coordinates": {"lat": 0, "lng": 0}
    }
  ],
  "total": 50
}
```

## GET /clubs/:id
**Descripción:** Obtener club por ID

## GET /clubs/by-district/:districtId
**Descripción:** Obtener clubs por distrito

## GET /clubs/by-local-field/:localFieldId
**Descripción:** Obtener clubs por campo local

## GET /clubs/by-church/:churchId
**Descripción:** Obtener clubs por iglesia

## GET /clubs/search?term={term}
**Descripción:** Buscar clubs

## GET /clubs/:id/types
**Descripción:** Obtener tipos de club (instancias) de un club

## PATCH /clubs/:id
**Descripción:** Actualizar club

## DELETE /clubs/:id
**Descripción:** Eliminar club (soft delete)

---

## Club Instances

### POST /clubs/:mainClubId/adventurers
**Descripción:** Crear instancia de Aventureros

### POST /clubs/:mainClubId/pathfinders
**Descripción:** Crear instancia de Conquistadores

### POST /clubs/:mainClubId/master-guides
**Descripción:** Crear instancia de Guías Mayores

---

## Club Assignments

### POST /clubs/assign-member
**Descripción:** Asignar miembro a un club

**Body:**
```json
{
  "userId": "uuid",
  "clubType": "adventurers|pathfinders|master_guild",
  "clubTypeId": 1,
  "ecclesiasticalYearId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### POST /clubs/assign-role
**Descripción:** Asignar rol a un miembro en una instancia de club

**Body:**
```json
{
  "userId": "uuid",
  "roleId": "uuid",
  "clubAdventurerId": 1,
  "clubPathfinderId": null,
  "clubMasterGuideId": null,
  "ecclesiasticalYearId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "active": true
}
```

---

# Classes (`/classes`)

## POST /classes
**Descripción:** Crear clase

**Body:**
```json
{
  "name": "string",
  "description": "string",
  "active": true,
  "club_type_id": 1,
  "minimum_age": 10,
  "material_url": "url"
}
```

## GET /classes
**Descripción:** Obtener lista de clases

**Query Params:** skip, take (default: 100), cursor, where, orderBy

## GET /classes/:id
**Descripción:** Obtener clase por ID

## PATCH /classes/:id
**Descripción:** Actualizar clase

## DELETE /classes/:id
**Descripción:** Eliminar clase (soft delete)

---

# File Upload (`/fu`)

## POST /fu/pp/:userId
**Descripción:** Subir foto de perfil

**Autenticación:** Sí

**Content-Type:** multipart/form-data

**Body:**
| Field | Tipo | Descripción |
|-------|------|-------------|
| file | File | Imagen a subir |

**Parámetros de Ruta:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| userId | uuid | ID del usuario |

**Response Success:**
```json
{
  "status": true,
  "data": {
    "url": "https://storage.example.com/profile/user_id.jpg"
  }
}
```

---

# Catalogs

Todos los catálogos siguen una estructura CRUD estándar.

## Countries (`/c/countries`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/countries | Crear país |
| POST | /c/countries/many | Crear múltiples países |
| GET | /c/countries | Listar países |
| GET | /c/countries/:id | Obtener país por ID |
| GET | /c/countries/search?term={term} | Buscar países |
| PATCH | /c/countries/:id | Actualizar país |
| DELETE | /c/countries/:id | Eliminar país (soft delete) |

**Estructura de país:**
```json
{
  "country_id": 1,
  "name": "México",
  "abbreviation": "MX",
  "active": true
}
```

---

## Unions (`/c/unions`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/unions | Crear unión |
| POST | /c/unions/many | Crear múltiples uniones |
| GET | /c/unions | Listar uniones |
| GET | /c/unions/:id | Obtener unión por ID |
| GET | /c/unions/by-country/:countryId | Obtener uniones por país |
| GET | /c/unions/search?term={term} | Buscar uniones |
| PATCH | /c/unions/:id | Actualizar unión |
| DELETE | /c/unions/:id | Eliminar unión (soft delete) |

**Estructura de unión:**
```json
{
  "union_id": 1,
  "name": "Unión Mexicana del Norte",
  "abbreviation": "UMN",
  "country_id": 1,
  "active": true
}
```

---

## Local Fields (`/c/lf`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/lf | Crear campo local |
| GET | /c/lf | Listar campos locales |
| GET | /c/lf/:id | Obtener campo local por ID |
| PATCH | /c/lf/:id | Actualizar campo local |
| DELETE | /c/lf/:id | Eliminar campo local |

**Estructura de campo local:**
```json
{
  "local_field_id": 1,
  "name": "Asociación del Noreste",
  "abbreviation": "ANE",
  "union_id": 1,
  "active": true
}
```

---

## Districts (`/c/districts`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/districts | Crear distrito |
| POST | /c/districts/many | Crear múltiples distritos |
| GET | /c/districts | Listar distritos |
| GET | /c/districts/:id | Obtener distrito por ID |
| GET | /c/districts/by-local-field/:localFieldId | Obtener distritos por campo local |
| GET | /c/districts/search?term={term} | Buscar distritos |
| PATCH | /c/districts/:id | Actualizar distrito |
| DELETE | /c/districts/:id | Eliminar distrito (soft delete) |

**Estructura de distrito:**
```json
{
  "district_id": 1,
  "name": "Distrito Central",
  "local_field_id": 1,
  "active": true
}
```

---

## Churches (`/c/churches`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/churches | Crear iglesia |
| GET | /c/churches | Listar iglesias |
| GET | /c/churches/:id | Obtener iglesia por ID |
| PATCH | /c/churches/:id | Actualizar iglesia |
| DELETE | /c/churches/:id | Eliminar iglesia |

**Estructura de iglesia:**
```json
{
  "church_id": 1,
  "name": "Iglesia Central",
  "district_id": 1,
  "active": true
}
```

---

## Club Types (`/c/club-types`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/club-types | Crear tipo de club |
| POST | /c/club-types/many | Crear múltiples tipos |
| GET | /c/club-types | Listar tipos de club |
| GET | /c/club-types/:id | Obtener tipo por ID |
| GET | /c/club-types/search?term={term} | Buscar tipos |
| PATCH | /c/club-types/:id | Actualizar tipo |
| DELETE | /c/club-types/:id | Eliminar tipo (soft delete) |

**Estructura de tipo de club:**
```json
{
  "ct_id": 1,
  "name": "Conquistadores",
  "active": true
}
```

---

## Honors (`/c/honors`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/honors | Crear especialidad |
| POST | /c/honors/many | Crear múltiples especialidades |
| GET | /c/honors | Listar especialidades |
| GET | /c/honors/:id | Obtener especialidad por ID |
| GET | /c/honors/by-category | Obtener especialidades agrupadas por categoría |
| GET | /c/honors/search?term={term} | Buscar especialidades |
| PATCH | /c/honors/:id | Actualizar especialidad |
| DELETE | /c/honors/:id | Eliminar especialidad (soft delete) |

**Estructura de especialidad:**
```json
{
  "honor_id": 1,
  "name": "Campismo",
  "description": "Descripción de la especialidad",
  "honor_image": "url",
  "honors_category_id": 1,
  "master_honors_id": null,
  "material_url": "url",
  "club_type_id": 2,
  "active": true,
  "approval": 1,
  "skill_level": 1,
  "year": "2020"
}
```

---

## Honors Categories (`/c/honors-categories`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/honors-categories | Crear categoría |
| POST | /c/honors-categories/many | Crear múltiples categorías |
| GET | /c/honors-categories | Listar categorías |
| GET | /c/honors-categories/:id | Obtener categoría por ID |
| GET | /c/honors-categories/search?term={term} | Buscar categorías |
| PATCH | /c/honors-categories/:id | Actualizar categoría |
| DELETE | /c/honors-categories/:id | Eliminar categoría (soft delete) |

**Estructura de categoría:**
```json
{
  "honor_category_id": 1,
  "name": "Actividades al aire libre",
  "description": "Especialidades relacionadas con la naturaleza",
  "icon": 1,
  "active": true
}
```

---

## Master Honors (`/c/master-honors`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/master-honors | Crear maestría |
| POST | /c/master-honors/many | Crear múltiples maestrías |
| GET | /c/master-honors | Listar maestrías |
| GET | /c/master-honors/:id | Obtener maestría por ID |
| GET | /c/master-honors/search?term={term} | Buscar maestrías |
| PATCH | /c/master-honors/:id | Actualizar maestría |
| DELETE | /c/master-honors/:id | Eliminar maestría (soft delete) |

**Estructura de maestría:**
```json
{
  "master_honor_id": 1,
  "name": "Maestro en Naturaleza",
  "master_image": "url",
  "active": true
}
```

---

## Allergies (`/c/allergies`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/allergies | Crear alergia |
| GET | /c/allergies | Listar alergias |
| GET | /c/allergies/:id | Obtener alergia por ID |
| PATCH | /c/allergies/:id | Actualizar alergia |
| DELETE | /c/allergies/:id | Eliminar alergia |

**Estructura de alergia:**
```json
{
  "allergy_id": 1,
  "name": "Penicilina",
  "description": "Alergia a antibióticos derivados de penicilina",
  "active": true
}
```

---

## Diseases (`/c/diseases`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/diseases | Crear enfermedad |
| POST | /c/diseases/many | Crear múltiples enfermedades |
| GET | /c/diseases | Listar enfermedades |
| GET | /c/diseases/:id | Obtener enfermedad por ID |
| GET | /c/diseases/search?term={term} | Buscar enfermedades |
| PATCH | /c/diseases/:id | Actualizar enfermedad |
| DELETE | /c/diseases/:id | Eliminar enfermedad (soft delete) |

**Estructura de enfermedad:**
```json
{
  "disease_id": 1,
  "name": "Diabetes",
  "description": "Diabetes mellitus tipo 1 o 2",
  "active": true
}
```

---

## Relationship Types (`/c/relationship_types`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/relationship_types | Crear tipo de relación |
| POST | /c/relationship_types/many | Crear múltiples tipos |
| GET | /c/relationship_types | Listar tipos de relación |
| GET | /c/relationship_types/:id | Obtener tipo por ID |
| GET | /c/relationship_types/search?term={term} | Buscar tipos |
| PATCH | /c/relationship_types/:id | Actualizar tipo |
| DELETE | /c/relationship_types/:id | Eliminar tipo (soft delete) |

**Estructura de tipo de relación:**
```json
{
  "relationship_type_id": 1,
  "name": "Padre",
  "active": true
}
```

---

# Roles y Permisos

## Roles (`/c/roles`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/roles | Crear rol |
| POST | /c/roles/many | Crear múltiples roles |
| GET | /c/roles | Listar roles |
| GET | /c/roles/:id | Obtener rol por ID |
| GET | /c/roles/search?term={term} | Buscar roles |
| GET | /c/roles/user-role | Obtener ID del rol "user" |
| PATCH | /c/roles/:id | Actualizar rol |
| DELETE | /c/roles/:id | Eliminar rol (soft delete) |

**Estructura de rol:**
```json
{
  "role_id": "uuid",
  "role_name": "director",
  "role_category": "CLUB",
  "active": true
}
```

---

## Permissions (`/catalogs/permissions`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /catalogs/permissions | Crear permiso |
| POST | /catalogs/permissions/many | Crear múltiples permisos |
| GET | /catalogs/permissions | Listar permisos |
| GET | /catalogs/permissions/names | Obtener nombres de permisos activos |
| GET | /catalogs/permissions/:id | Obtener permiso por ID |
| GET | /catalogs/permissions/search?term={term} | Buscar permisos |
| PUT | /catalogs/permissions/:id | Actualizar permiso |
| DELETE | /catalogs/permissions/:id | Eliminar permiso (soft delete) |
| POST | /catalogs/permissions/assign-to-roles | Asignar permisos a roles |

**Estructura de permiso:**
```json
{
  "permission_id": "uuid",
  "permission_name": "read:users",
  "description": "Permite leer usuarios",
  "active": true
}
```

---

## Role Permissions (`/c/role-permissions`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/role-permissions | Crear relación rol-permiso |
| POST | /c/role-permissions/many | Crear múltiples relaciones |
| POST | /c/role-permissions/assign-permissions | Asignar permisos a un rol |
| GET | /c/role-permissions | Listar relaciones |
| GET | /c/role-permissions/:id | Obtener relación por ID |
| GET | /c/role-permissions/by-role/:roleId | Obtener permisos de un rol |
| PATCH | /c/role-permissions/:id | Actualizar relación |
| DELETE | /c/role-permissions/:id | Eliminar relación (soft delete) |
| DELETE | /c/role-permissions/by-role/:roleId | Eliminar permisos de un rol |
| DELETE | /c/role-permissions/by-role-permission/:roleId/:permissionId | Eliminar permiso específico de un rol |

---

## Users Roles (`/c/users-roles`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /c/users-roles | Crear relación usuario-rol |
| POST | /c/users-roles/many | Crear múltiples relaciones |
| POST | /c/users-roles/assign-roles | Asignar roles a un usuario |
| POST | /c/users-roles/assign-users | Asignar usuarios a un rol |
| GET | /c/users-roles | Listar relaciones |
| GET | /c/users-roles/:id | Obtener relación por ID |
| GET | /c/users-roles/by-user/:userId | Obtener roles de un usuario |
| GET | /c/users-roles/by-role/:roleId | Obtener usuarios con un rol |
| PATCH | /c/users-roles/:id | Actualizar relación |
| DELETE | /c/users-roles/:id | Eliminar relación (soft delete) |
| DELETE | /c/users-roles/by-user/:userId | Eliminar roles de un usuario |
| DELETE | /c/users-roles/by-role/:roleId | Eliminar usuarios de un rol |
| DELETE | /c/users-roles/by-user-role/:userId/:roleId | Eliminar rol específico de un usuario |

---

## Club Role Assignments (`/clubs/club-role-assignments`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /clubs/club-role-assignments | Crear asignación de rol en club |
| GET | /clubs/club-role-assignments | Listar asignaciones |
| GET | /clubs/club-role-assignments/:assignment_id | Obtener asignación por ID |
| PATCH | /clubs/club-role-assignments/:assignment_id | Actualizar asignación |
| DELETE | /clubs/club-role-assignments/:assignment_id | Eliminar asignación |

**Estructura de asignación:**
```json
{
  "assignment_id": "uuid",
  "user_id": "uuid",
  "role_id": "uuid",
  "club_adv_id": 1,
  "club_pathf_id": null,
  "club_mg_id": null,
  "ecclesiastical_year_id": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "active": true
}
```

---

# Formato Estándar de Respuestas

## Respuesta Exitosa (Lista)
```json
{
  "status": true,
  "data": [...],
  "total": 100,
  "nextCursor": 101
}
```

## Respuesta Exitosa (Elemento Único)
```json
{
  "status": true,
  "data": {...}
}
```

## Respuesta de Creación
```json
{
  "status": true,
  "message": "Resource created successfully",
  "data": {...}
}
```

## Respuesta de Actualización
```json
{
  "status": true,
  "message": "Resource updated successfully",
  "data": {...}
}
```

## Respuesta de Eliminación
```json
{
  "status": true,
  "message": "Resource deleted successfully"
}
```

## Respuesta de Error
```json
{
  "status": false,
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

# Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (duplicado, etc.) |
| 500 | Internal Server Error - Error del servidor |

---

# Query Params Comunes

La mayoría de los endpoints GET de listado soportan los siguientes parámetros:

| Param | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| skip | number | Registros a omitir | `?skip=10` |
| take | number | Registros a tomar | `?take=20` |
| cursor | string/number | Cursor para paginación | `?cursor=100` |
| where | string (JSON) | Filtros | `?where={"active":true}` |
| orderBy | string (JSON) | Ordenamiento | `?orderBy={"name":"asc"}` |
