# 📋 **Documentación de Endpoints - Sistema de Roles y Permisos**

## 🎯 **1. ROLES** 
**Ubicación**: `/src/modules/catalogs/roles/roles.controller.ts`
**Base URL**: `/catalogs/roles`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `POST` | `/catalogs/roles` | Crear rol | `{ role_name, role_category, active }` |
| `POST` | `/catalogs/roles/many` | Crear múltiples roles | `[{ role_name, role_category, active }]` |
| `GET` | `/catalogs/roles` | Listar roles con paginación | `?skip=0&take=10&cursor=uuid&where={}&orderBy={}` |
| `GET` | `/catalogs/roles/:id` | Obtener rol por ID | `id: UUID` |
| `GET` | `/catalogs/roles/search` | Buscar roles | `?term=texto` |
| `GET` | `/catalogs/roles/user-role` | Obtener ID del rol "user" | - |
| `PATCH` | `/catalogs/roles/:id` | Actualizar rol | `id: UUID, { role_name?, active? }` |
| `DELETE` | `/catalogs/roles/:id` | Eliminar rol (soft delete) | `id: UUID` |

### Ejemplo de Uso - Crear Rol
```http
POST /catalogs/roles
Content-Type: application/json

{
  "role_name": "director_club",
  "role_category": "CLUB",
  "active": true
}
```

### Ejemplo de Respuesta
```json
{
  "status": true,
  "message": "Role created successfully"
}
```

---

## 🔐 **2. PERMISOS**
**Ubicación**: `/src/modules/catalogs/permissions/permissions.controller.ts`
**Base URL**: `/catalogs/permissions`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `POST` | `/catalogs/permissions` | Crear permiso | `{ permission_name, description?, active }` |
| `POST` | `/catalogs/permissions/many` | Crear múltiples permisos | `[{ permission_name, description?, active }]` |
| `GET` | `/catalogs/permissions` | Listar permisos | `?skip=0&take=10&cursor=uuid&filter={}&orderBy={}` |
| `GET` | `/catalogs/permissions/names` | Obtener nombres de permisos | - |
| `GET` | `/catalogs/permissions/:id` | Obtener permiso por ID | `id: UUID` |
| `GET` | `/catalogs/permissions/search` | Buscar permisos | `?term=texto` |
| `PUT` | `/catalogs/permissions/:id` | Actualizar permiso | `id: UUID, { permission_name?, description?, active? }` |
| `DELETE` | `/catalogs/permissions/:id` | Eliminar permiso | `id: UUID` |
| `POST` | `/catalogs/permissions/assign-to-roles` | Asignar permisos a roles | `{ roleIds: [], permissionNames: [] }` |

### Ejemplo de Uso - Asignar Permisos a Roles
```http
POST /catalogs/permissions/assign-to-roles
Content-Type: application/json

{
  "roleIds": ["uuid-super-admin", "uuid-admin"],
  "permissionNames": ["create:users", "read:users", "update:users"]
}
```

---

## 🔗 **3. ROLES-PERMISOS**
**Ubicación**: `/src/modules/catalogs/role-permissions/role-permissions.controller.ts`
**Base URL**: `/catalogs/role-permissions`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `POST` | `/catalogs/role-permissions` | Crear relación rol-permiso | `{ role_id, permission_id }` |
| `POST` | `/catalogs/role-permissions/many` | Crear múltiples relaciones | `[{ role_id, permission_id }]` |
| `POST` | `/catalogs/role-permissions/assign-permissions` | Asignar permisos a rol | `{ roleId, permissionIds: [] }` |
| `GET` | `/catalogs/role-permissions` | Listar relaciones | `?skip=0&take=10&cursor=uuid&where={}&orderBy={}` |
| `GET` | `/catalogs/role-permissions/:id` | Obtener relación por ID | `id: UUID` |
| `GET` | `/catalogs/role-permissions/by-role/:roleId` | Permisos de un rol | `roleId: UUID` |
| `PATCH` | `/catalogs/role-permissions/:id` | Actualizar relación | `id: UUID, { active? }` |
| `DELETE` | `/catalogs/role-permissions/:id` | Eliminar relación | `id: UUID` |
| `DELETE` | `/catalogs/role-permissions/by-role/:roleId` | Eliminar todos los permisos de un rol | `roleId: UUID` |
| `DELETE` | `/catalogs/role-permissions/by-role-permission/:roleId/:permissionId` | Eliminar permiso específico de rol | `roleId: UUID, permissionId: UUID` |

### Ejemplo de Uso - Asignar Permisos a Rol
```http
POST /catalogs/role-permissions/assign-permissions
Content-Type: application/json

{
  "roleId": "uuid-director-club",
  "permissionIds": ["uuid-create-activities", "uuid-read-activities", "uuid-update-activities"]
}
```

---

## 👥 **4. USUARIOS-ROLES (Roles Globales)**
**Ubicación**: `/src/modules/catalogs/users-roles/users-roles.controller.ts`
**Base URL**: `/catalogs/users-roles`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `POST` | `/catalogs/users-roles` | Asignar rol a usuario | `{ user_id, role_id }` |
| `POST` | `/catalogs/users-roles/many` | Múltiples asignaciones | `[{ user_id, role_id }]` |
| `POST` | `/catalogs/users-roles/assign-roles` | Asignar roles a usuario | `{ userId, roleIds: [] }` |
| `POST` | `/catalogs/users-roles/assign-users` | Asignar usuarios a rol | `{ roleId, userIds: [] }` |
| `GET` | `/catalogs/users-roles` | Listar asignaciones | `?skip=0&take=10&cursor=uuid&where={}&orderBy={}` |
| `GET` | `/catalogs/users-roles/:id` | Obtener asignación por ID | `id: UUID` |
| `GET` | `/catalogs/users-roles/by-user/:userId` | Roles de un usuario | `userId: UUID` |
| `GET` | `/catalogs/users-roles/by-role/:roleId` | Usuarios con un rol | `roleId: UUID` |
| `PATCH` | `/catalogs/users-roles/:id` | Actualizar asignación | `id: UUID, { active? }` |
| `DELETE` | `/catalogs/users-roles/:id` | Eliminar asignación | `id: UUID` |
| `DELETE` | `/catalogs/users-roles/by-user/:userId` | Eliminar todos los roles de usuario | `userId: UUID` |
| `DELETE` | `/catalogs/users-roles/by-role/:roleId` | Eliminar todos los usuarios de rol | `roleId: UUID` |
| `DELETE` | `/catalogs/users-roles/by-user-role/:userId/:roleId` | Eliminar rol específico de usuario | `userId: UUID, roleId: UUID` |

### Ejemplo de Uso - Asignar Roles a Usuario
```http
POST /catalogs/users-roles/assign-roles
Content-Type: application/json

{
  "userId": "uuid-usuario",
  "roleIds": ["uuid-admin", "uuid-auditor"]
}
```

---

## 🏛️ **5. ASIGNACIONES DE ROLES DE CLUB**
**Ubicación**: `/src/modules/catalogs/club-role-assignments/club-role-assignments.controller.ts`
**Base URL**: `/clubs/club-role-assignments`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `POST` | `/clubs/club-role-assignments` | Asignar rol de club | `{ user_id, role_id, club_adv_id?, club_pathf_id?, club_mg_id?, start_date, end_date? }` |
| `GET` | `/clubs/club-role-assignments` | Listar asignaciones de club | `?user_id=uuid&role_id=uuid&club_type=adventurers` |
| `GET` | `/clubs/club-role-assignments/:assignment_id` | Obtener asignación por ID | `assignment_id: UUID` |
| `PATCH` | `/clubs/club-role-assignments/:assignment_id` | Actualizar asignación | `assignment_id: UUID, { is_active?, end_date? }` |
| `DELETE` | `/clubs/club-role-assignments/:assignment_id` | Eliminar asignación | `assignment_id: UUID` |

### Ejemplo de Uso - Asignar Rol de Club
```http
POST /clubs/club-role-assignments
Content-Type: application/json

{
  "user_id": "uuid-usuario",
  "role_id": "uuid-director-club",
  "club_adv_id": "uuid-club-aventureros",
  "start_date": "2025-01-01",
  "is_active": true
}
```

---

# 🎯 **Escenarios de Uso y Flujos de Endpoints**

## **📋 Escenario 1: Configuración Inicial del Sistema**

### **Paso 1: Crear Roles Base**
```http
POST /catalogs/roles/many
Content-Type: application/json

[
  { "role_name": "super_admin", "role_category": "GLOBAL" },
  { "role_name": "admin", "role_category": "GLOBAL" },
  { "role_name": "user", "role_category": "GLOBAL" },
  { "role_name": "director_club", "role_category": "CLUB" },
  { "role_name": "secretario_club", "role_category": "CLUB" }
]
```

### **Paso 2: Crear Permisos y Asignar a Roles**
```http
POST /catalogs/permissions/assign-to-roles
Content-Type: application/json

{
  "roleIds": ["uuid-super-admin", "uuid-admin"],
  "permissionNames": ["create:users", "read:users", "update:users", "delete:users"]
}
```

---

## **👤 Escenario 2: Gestión de Usuario Nuevo**

### **Paso 1: Obtener ID del rol "user"**
```http
GET /catalogs/roles/user-role
```

### **Paso 2: Asignar rol global al usuario**
```http
POST /catalogs/users-roles
Content-Type: application/json

{
  "user_id": "uuid-usuario",
  "role_id": "uuid-rol-user"
}
```

### **Paso 3: Asignar rol de club (si aplica)**
```http
POST /clubs/club-role-assignments
Content-Type: application/json

{
  "user_id": "uuid-usuario",
  "role_id": "uuid-director-club",
  "club_adv_id": "uuid-club-aventureros",
  "start_date": "2025-01-01",
  "is_active": true
}
```

---

## **🔍 Escenario 3: Consultar Permisos de Usuario**

### **Paso 1: Obtener roles globales del usuario**
```http
GET /catalogs/users-roles/by-user/{userId}
```

### **Paso 2: Obtener roles de club del usuario**
```http
GET /clubs/club-role-assignments?user_id={userId}&is_active=true
```

### **Paso 3: Obtener permisos de cada rol**
```http
GET /catalogs/role-permissions/by-role/{roleId}
```

---

## **⚙️ Escenario 4: Administración de Roles**

### **Paso 1: Buscar roles existentes**
```http
GET /catalogs/roles/search?term=admin
```

### **Paso 2: Ver permisos de un rol**
```http
GET /catalogs/role-permissions/by-role/{roleId}
```

### **Paso 3: Asignar nuevos permisos a rol**
```http
POST /catalogs/role-permissions/assign-permissions
Content-Type: application/json

{
  "roleId": "uuid-rol",
  "permissionIds": ["uuid-permiso1", "uuid-permiso2"]
}
```

### **Paso 4: Remover permiso específico**
```http
DELETE /catalogs/role-permissions/by-role-permission/{roleId}/{permissionId}
```

---

## **🏛️ Escenario 5: Gestión de Club**

### **Paso 1: Listar asignaciones de un club**
```http
GET /clubs/club-role-assignments?club_type=adventurers&club_id={clubId}
```

### **Paso 2: Cambiar director de club**
```http
# Desactivar asignación actual
PATCH /clubs/club-role-assignments/{currentAssignmentId}
Content-Type: application/json
{ "is_active": false, "end_date": "2025-01-31" }

# Crear nueva asignación
POST /clubs/club-role-assignments
Content-Type: application/json
{
  "user_id": "uuid-nuevo-director",
  "role_id": "uuid-director-club",
  "club_adv_id": "uuid-club",
  "start_date": "2025-02-01",
  "is_active": true
}
```

---

## **📊 Escenario 6: Auditoría y Reportes**

### **Paso 1: Listar todos los usuarios con roles globales**
```http
GET /catalogs/users-roles?take=100&orderBy={"created_at":"desc"}
```

### **Paso 2: Obtener usuarios de un rol específico**
```http
GET /catalogs/users-roles/by-role/{roleId}
```

### **Paso 3: Listar permisos disponibles**
```http
GET /catalogs/permissions/names
```

---

# 🔑 **Parámetros Comunes**

## **Paginación**
- `skip`: Número de registros a omitir (default: 0)
- `take`: Número de registros a tomar (default: 10)
- `cursor`: UUID para paginación por cursor

## **Filtros**
- `where`: JSON string con condiciones de filtro
- `orderBy`: JSON string con criterios de ordenamiento
- `filter`: JSON string para filtros (en permisos)

## **Respuestas Estándar**
```json
{
  "status": true,
  "data": [...],
  "total": 100,
  "nextCursor": "uuid-next"
}
```

---

# 📝 **Notas Importantes**

## **Categorías de Roles**
- **`GLOBAL`**: Roles a nivel de todo el sistema (ej. SuperAdmin, Auditor General)
- **`CLUB`**: Roles específicos dentro de instancias de club (ej. Director de Club, Secretario)

## **Tipos de Club**
- `club_adv_id`: Club de Aventureros
- `club_pathf_id`: Club de Conquistadores  
- `club_mg_id`: Club de Guías Mayores

## **Restricciones**
- Solo uno de los `club_*_id` puede estar poblado por registro en `club_role_assignments`
- Las asignaciones de club incluyen temporalidad: `start_date`, `end_date`, `is_active`
- Los roles globales se asignan a través de `users_roles`
- Los roles de club se asignan a través de `club_role_assignments`

## **Autenticación**
Todos los endpoints requieren autenticación Bearer Token:
```http
Authorization: Bearer {token}
```

---

**Fecha de creación**: 2025-01-05  
**Versión**: 1.0  
**Proyecto**: SACDIA API
