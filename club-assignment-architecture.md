# Arquitectura de Asignación de Usuarios a Clubes

## Resumen
Este documento describe la implementación unificada para asignar usuarios a clubes en el sistema SACDIA. La solución consolida la funcionalidad en un solo servicio versátil con múltiples interfaces especializadas.

## Estructura de Base de Datos

### Tabla Principal: `club_role_assignments`
```sql
model club_role_assignments {
  assignment_id          String              @id @default(dbgenerated("extensions.uuid_generate_v4()")) @db.Uuid
  user_id                String              @db.Uuid
  role_id                String              @db.Uuid
  club_adv_id            Int?                -- ID del club de aventureros
  club_pathf_id          Int?                -- ID del club de conquistadores  
  club_mg_id             Int?                -- ID del club de guías mayores
  ecclesiastical_year_id Int
  start_date             DateTime            @db.Date
  end_date               DateTime            @db.Date
  active                 Boolean             @default(true)
  created_at             DateTime            @default(now()) @db.Timestamptz(6)
  modified_at            DateTime            @default(now()) @updatedAt @db.Timestamptz(6)
}
```

### Relaciones Clave
- **users**: Relación con tabla de usuarios
- **roles**: Relación con tabla de roles (categoría 'CLUB')
- **club_adventurers**: Relación opcional con club de aventureros
- **club_pathfinders**: Relación opcional con club de conquistadores
- **club_master_guild**: Relación opcional con club de guías mayores
- **ecclesiastical_year**: Relación con año eclesiástico

## Servicio Unificado

### `assignRoleToClubInstance(dto, autoAssignMemberRole)`

**Ubicación**: `/src/modules/clubs/clubs.service.ts`

#### Parámetros
- `dto`: `Prisma.club_role_assignmentsUncheckedCreateInput`
- `autoAssignMemberRole`: `boolean = false`

#### Funcionalidad
```typescript
async assignRoleToClubInstance(
  dto: Prisma.club_role_assignmentsUncheckedCreateInput,
  autoAssignMemberRole: boolean = false
) {
  // 1. Validar que solo un tipo de club esté presente
  // 2. Manejar rol automático (member) o manual
  // 3. Validar usuario existe
  // 4. Validar instancia de club existe
  // 5. Validar año eclesiástico existe
  // 6. Crear asignación
}
```

#### Modos de Operación

**Modo Automático** (`autoAssignMemberRole = true`):
- Busca automáticamente el rol "member"
- Valida que sea de categoría 'CLUB' y esté activo
- Asigna el `role_id` automáticamente

**Modo Manual** (`autoAssignMemberRole = false`):
- Requiere `role_id` en el DTO
- Valida que el rol existe y es de categoría 'CLUB'
- Permite cualquier rol administrativo

#### Validaciones Implementadas
1. **Una sola instancia de club**: Solo uno de `club_adv_id`, `club_pathf_id`, `club_mg_id`
2. **Rol válido**: Existe y es de categoría 'CLUB'
3. **Usuario válido**: Existe en el sistema
4. **Club válido**: La instancia específica existe
5. **Año eclesiástico válido**: Existe en el sistema
6. **Duplicados**: Manejo automático por constraints de BD

## Endpoints Especializados

### 1. Asignación de Miembros
**Endpoint**: `POST /clubs/assign-member`

**DTO**: `AssignMemberToClubDto`
```typescript
{
  userId: string;                    // UUID del usuario
  clubType: 'adventurers' | 'pathfinders' | 'master_guild';
  clubTypeId: number;               // ID del club específico
  ecclesiasticalYearId: number;     // ID del año eclesiástico
  startDate: string;                // Fecha inicio (ISO)
  endDate: string;                  // Fecha fin (ISO)
}
```

**Uso**:
```json
POST /clubs/assign-member
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "clubType": "adventurers",
  "clubTypeId": 1,
  "ecclesiasticalYearId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Características**:
- Asigna automáticamente rol "member"
- Interfaz simplificada para frontend
- Ideal para proceso de alta de usuarios

### 2. Asignación de Roles Administrativos
**Endpoint**: `POST /clubs/assign-role`

**DTO**: `AssignClubRoleDto`
```typescript
{
  userId: string;                    // UUID del usuario
  roleId: string;                   // UUID del rol específico
  clubAdventurerId?: number;        // ID club aventureros (opcional)
  clubPathfinderId?: number;        // ID club conquistadores (opcional)
  clubMasterGuideId?: number;       // ID club guías mayores (opcional)
  ecclesiasticalYearId: number;     // ID del año eclesiástico
  startDate: string;                // Fecha inicio (ISO)
  endDate: string;                  // Fecha fin (ISO)
  active?: boolean;                 // Estado activo (default: true)
}
```

**Uso**:
```json
POST /clubs/assign-role
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "roleId": "director-role-uuid",
  "clubAdventurerId": 1,
  "ecclesiasticalYearId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Características**:
- Requiere especificar rol manualmente
- Interfaz completa para administradores
- Ideal para asignar roles de liderazgo

## Consulta de Tipos de Clubes

### `getClubTypes(clubId)`
**Endpoint**: `GET /clubs/:id/types`

**Funcionalidad**:
- Consulta clubes asociados a un club principal
- Verifica `main_club_id` en las tres tablas de tipos
- Retorna solo clubes activos

**Respuesta**:
```json
{
  "status": true,
  "data": {
    "main_club": {
      "id": 1,
      "name": "Orión"
    },
    "club_types": [
      {
        "id": 1,
        "type": "adventurers",
        "type_name": "Aventureros",
        "active": true,
        "souls_target": 10,
        "fee": 50,
        "meeting_day": [...],
        "meeting_time": [...]
      }
    ]
  }
}
```

## Archivos Creados/Modificados

### Servicios
- `/src/modules/clubs/clubs.service.ts`
  - Método `assignRoleToClubInstance` mejorado
  - Método `getClubTypes` agregado

### Controladores
- `/src/modules/clubs/clubs.controller.ts`
  - Endpoint `GET /:id/types`
  - Endpoint `POST /assign-member`
  - Endpoint `POST /assign-role` (existente)

### DTOs
- `/src/modules/clubs/dtos/assign-member-to-club.dto.ts`
- `/src/modules/clubs/dtos/club-types-response.dto.ts`
- `/src/modules/clubs/dtos/assign-club-role.dto.ts` (existente)

## Ventajas de la Arquitectura

### ✅ Código Limpio
- Sin duplicación de lógica
- Un solo punto de validación
- Mantenimiento simplificado

### ✅ Flexibilidad
- Cubre todos los casos de uso
- Interfaces especializadas según necesidad
- Extensible para futuros roles

### ✅ Consistencia
- Mismas validaciones en todos los flujos
- Manejo uniforme de errores
- Respuestas estandarizadas

### ✅ Usabilidad
- Interfaz simple para casos comunes
- Interfaz completa para casos avanzados
- Documentación clara con Swagger

## Casos de Uso

### Alta de Nuevos Miembros
1. Usuario se registra en la aplicación
2. Selecciona club y tipo de club
3. Sistema llama `POST /clubs/assign-member`
4. Se asigna automáticamente rol "member"
5. Usuario puede continuar con información adicional

### Asignación de Roles Administrativos
1. Administrador accede al panel
2. Selecciona usuario y rol específico
3. Sistema llama `POST /clubs/assign-role`
4. Se asigna el rol seleccionado
5. Usuario obtiene permisos correspondientes

### Consulta de Estructura de Clubes
1. Sistema necesita mostrar tipos de clubes disponibles
2. Llama `GET /clubs/:id/types`
3. Obtiene lista de tipos activos
4. Presenta opciones al usuario

## Consideraciones Futuras

### Extensibilidad
- Fácil agregar nuevos tipos de clubes
- Soporte para roles personalizados
- Integración con sistema de permisos

### Performance
- Índices en campos de consulta frecuente
- Cache para consultas de tipos de clubes
- Paginación para listas grandes

### Seguridad
- Validación de permisos por endpoint
- Auditoría de asignaciones
- Prevención de escalación de privilegios
