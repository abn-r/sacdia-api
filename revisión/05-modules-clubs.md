# Análisis: Módulo Clubs

## Estructura
```
clubs/
├── clubs.controller.ts (279 líneas)
├── clubs.model.ts
├── clubs.module.ts
├── clubs.service.ts (1246 líneas) ⚠️ MUY GRANDE
└── dtos/
    ├── assign-club-role.dto.ts
    ├── assign-member-to-club.dto.ts
    ├── create-adventurer-instance.dto.ts
    ├── create-club-container.dto.ts
    ├── create-master-guide-instance.dto.ts
    ├── create-pathfinder-instance.dto.ts
    └── ... (11 DTOs)
```

---

## 🟡 OBSERVACIONES

### Servicio Muy Grande
`clubs.service.ts` tiene **1246 líneas** y maneja:
- CRUD de clubs principales
- Instancias de Adventurers
- Instancias de Pathfinders
- Instancias de Master Guides
- Asignación de roles
- Asignación de miembros

**Recomendación**: Dividir en servicios más pequeños:
- `ClubsService` - CRUD básico
- `ClubInstancesService` - Manejo de instancias
- `ClubAssignmentsService` - Asignaciones de roles/miembros

### PrismaClient No Usado (Mismo bug)
```typescript
constructor(...) {
  const prismaLog = new PrismaClient({  // ❌ No se usa
    log: ['query', 'info', 'warn', 'error'],
  });
}
```

---

## ✅ Elementos Bien Implementados

### Uso de Decoradores Personalizados
```typescript
@ClubController('')
export class ClubsController {
  @Post()
  @CreateClub('CLUBS')
  @TransformResponse()
  async create(@Body() dto: CreateClubContainerDto) { ... }
}
```

### DTOs Formales
El módulo clubs tiene DTOs bien definidos en carpeta `/dtos/`

### Validación de Entidades Relacionadas
```typescript
const [localField, district, church] = await Promise.all([
  this.prisma.local_fields.findUnique({ where: { local_field_id: localFieldId } }),
  this.prisma.districts.findUnique({ where: { district_id: districtId } }),
  this.prisma.churches.findUnique({ where: { church_id: churchId } })
]);

if (!localField) throw new NotFoundException(...);
if (!district) throw new NotFoundException(...);
if (!church) throw new NotFoundException(...);
```

### Manejo de Errores Prisma
```typescript
if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
  throw new ConflictException('...');
}
if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
  throw new BadRequestException('...');
}
```

---

## 🔴 INCONSISTENCIAS

### Formato de Respuestas
```typescript
create()                    → { status: true, message: '...', data: newClub }
createAdventurerInstance()  → { status: true, message: '...', data: newInstance }
findAll()                   → { status: true, data: [], total, nextCursor }
findOne()                   → { status: true, data: club }
```
**Observación**: El formato es relativamente consistente dentro del módulo, pero difiere del patrón de `users`

### Mezcla de Guards
```typescript
// Algunos endpoints usan decoradores personalizados
@CreateClub('CLUBS')  // Incluye roles/permisos implícitos

// Otros usan guards explícitos
@Permissions(PERMISSIONS.ASSIGN_CLUB_ROLE)
@UseGuards(SupabaseGuard, PermissionsGuard)
```

---

## 📋 Endpoints

| Método | Ruta | Decorador |
|--------|------|-----------|
| POST | `/clubs` | `@CreateClub('CLUBS')` |
| POST | `/clubs/many` | `@CreateClub('CLUBS')` |
| GET | `/clubs` | `@ReadClub('CLUBS')` |
| GET | `/clubs/:id` | `@ReadClub('CLUBS')` |
| GET | `/clubs/by-district/:id` | `@ReadClub('CLUBS')` |
| GET | `/clubs/by-local-field/:id` | `@ReadClub('CLUBS')` |
| GET | `/clubs/by-church/:id` | `@ReadClub('CLUBS')` |
| GET | `/clubs/search` | `@ReadClub('CLUBS')` |
| PATCH | `/clubs/:id` | `@UpdateClub('CLUBS')` |
| DELETE | `/clubs/:id` | `@DeleteClub('CLUBS')` |
| POST | `/clubs/:id/adventurers` | `@CreateClub('CLUB_INSTANCES')` |
| POST | `/clubs/:id/pathfinders` | `@CreateClub('CLUB_INSTANCES')` |
| POST | `/clubs/:id/master-guides` | `@CreateClub('CLUB_INSTANCES')` |
| POST | `/clubs/assign-member` | `@AssignClub('CLUB_MEMBERS')` |
| POST | `/clubs/assign-role` | Guards explícitos |

---

## Recomendaciones
1. Dividir `clubs.service.ts` en servicios más pequeños
2. Usar decoradores personalizados consistentemente (no mezclar con guards explícitos)
3. Eliminar `PrismaClient` no usado
