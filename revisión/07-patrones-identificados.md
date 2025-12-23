# Patrones Identificados en SACDIA API

## Patrones Actuales en Uso

### 1. Patrón de Respuesta Paginada
```typescript
{
  status: boolean,
  data: T[],
  total: number,
  nextCursor?: number | string
}
```
**Usado en**: Countries, Districts, Clubs, Users (parcialmente)

### 2. Patrón de Respuesta Simple
```typescript
{
  status: boolean,
  data: T
}
```
**Usado en**: findOne de la mayoría de servicios

### 3. Patrón de Respuesta de Acción
```typescript
{
  status: boolean,
  message: string,
  data?: T  // A veces incluido
}
```
**Usado en**: create, update, delete

### 4. Patrón RBAC (Role-Based Access Control)
```
Request → SupabaseGuard (JWT) → PermissionsGuard (Roles+Perms) → Controller
```

### 5. Patrón de Soft Delete
```typescript
async softDelete(id: number) {
  await this.prisma.table.update({
    where: { id },
    data: { active: false, modified_at: new Date() }
  });
}
```

### 6. Patrón de Caché por Entidad
```typescript
const cacheKey = `entity_${id}`;
const listCacheKey = `entity_list_${JSON.stringify(params)}`;
// TTL: 3600000ms (1 hora)
```

---

## Arquitectura de Decoradores

### Decoradores de Controlador
```
@CatalogController(path)
@ClubController(path)
@UsersController(path)
@ClassesController(path)
```
Todos aplican: `@Controller(prefix + path)`, `@UseGuards(SupabaseGuard, PermissionsGuard)`

### Decoradores de Endpoint
```
@ReadXXX(resource, roles?)
@CreateXXX(resource)
@UpdateXXX(resource)
@DeleteXXX(resource)
```
Todos aplican: `@Roles()`, `@Permissions()`, `@HttpCode()`

### Decoradores de Transformación
```
@TransformResponse(options?)
@TransformClassesResponse(options?)
```

---

## Flujo de Autenticación

```
1. Cliente envía JWT en header Authorization: Bearer <token>
2. SupabaseGuard extrae y valida token con Supabase
3. SupabaseGuard obtiene getUserContext() de base local
4. SupabaseGuard calcula effective_permissions
5. SupabaseGuard adjunta AuthenticatedUser a request.user
6. PermissionsGuard verifica roles y permisos requeridos
7. Controller/Service ejecuta lógica de negocio
```

---

## Estructura de Contexto de Usuario

```typescript
interface UserContext {
  user_id: string;
  active: boolean;
  global_roles: {
    role_id: string;
    role_name: string;
    role_category: RoleCategory;
    permissions: string[];
  }[];
  club_assignments: {
    assignment_id: string;
    club_role_id: string;
    club_role_name: string;
    permissions: string[];
    instance_type: 'Adventurer' | 'Pathfinder' | 'MasterGuide';
    instance_id: number;
    main_club_id: number;
    main_club_name: string;
    // ...
  }[];
}
```

---

## Estructura de Módulos

### Módulo Típico de Catálogo
```
catalog-name/
├── catalog-name.controller.ts
├── catalog-name.service.ts
├── catalog-name.module.ts
└── catalog-name.model.ts
```

### Módulo con DTOs
```
module-name/
├── module-name.controller.ts
├── module-name.service.ts
├── module-name.module.ts
├── module-name.model.ts
└── dtos/
    ├── create-xxx.dto.ts
    └── update-xxx.dto.ts
```

---

## Convenciones de Nombrado

### Tablas Prisma (snake_case)
- `users`, `clubs`, `club_adventurers`, `club_role_assignments`

### Servicios (PascalCase + Service)
- `UsersService`, `ClubsService`, `CountriesService`

### Controladores (PascalCase + Controller)
- `UsersController`, `ClubsController`

### DTOs (PascalCase + Dto)
- `CreateClubContainerDto`, `AssignClubRoleDto`

### Permisos (SCREAMING_SNAKE_CASE)
- `READ_USERS`, `CREATE_CLUBS`, `DELETE_COUNTRIES`

### Roles (SCREAMING_SNAKE_CASE)
- `SUPER_ADMIN`, `ADMIN`, `USER`, `DIRECTOR`

---

## Anti-Patrones Encontrados

### 1. Copy-Paste Service
Servicios casi idénticos para cada catálogo sin abstracción

### 2. Código Muerto
Instanciación de objetos que nunca se usan (PrismaClient)

### 3. Inconsistencia en Respuestas
Diferentes formatos de respuesta entre módulos

### 4. Mezcla de Idiomas
Mensajes de error en español e inglés

### 5. DTOs Inline
Definición de tipos directamente en parámetros de métodos

### 6. Validación Manual
Validaciones `if (!field) throw` en lugar de class-validator

---

## Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Módulos en /catalogs | 17 |
| Submódulos en /users | 6 |
| Submódulos en /clubs | 1 (muy grande) |
| Decoradores personalizados | 11 |
| Interceptors | 5 |
| Guards | 2 |
| Líneas en clubs.service.ts | 1246 |
| Bugs críticos encontrados | 3 |
| Inconsistencias de diseño | 6 |
