# Listado Consolidado de Inconsistencias

## 🔴 BUGS CRÍTICOS (Requieren corrección inmediata)

### 1. Tabla Incorrecta en Query - emergency_contact.service.ts:140
```typescript
// ACTUAL (INCORRECTO)
const existingDistricts = await this.prisma.districts.findFirst({
  where: { NOT: { local_field_id: id } }
});

// DEBERÍA SER
const existingContact = await this.prisma.emergency_contacts.findFirst({
  where: { NOT: { emergency_id: id } }
});
```
**Impacto**: La validación de duplicados no funciona correctamente

### 2. Mensaje de Error Incorrecto - users.service.ts:294
```typescript
// ACTUAL
throw new BadRequestException('Unable to soft delete Districts');

// DEBERÍA SER
throw new BadRequestException('Unable to soft delete User');
```

### 3. Nombre de Parámetro Incorrecto - users.controller.ts:64
```typescript
// ACTUAL
@Body() updateSongDto: Prisma.usersUpdateInput

// DEBERÍA SER
@Body() updateUserDto: Prisma.usersUpdateInput
```

---

## 🟠 CÓDIGO MUERTO / DESPERDICIO DE RECURSOS

### 4. PrismaClient No Usado (Múltiples archivos)
Archivos afectados:
- `countries.service.ts:23-26`
- `districts.service.ts:23-26`
- `clubs.service.ts:24-27`
- (Probablemente más servicios de catálogos)

```typescript
// Este código crea un cliente que nunca se usa
const prismaLog = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```
**Impacto**: Memoria desperdiciada, conexiones extra a la DB

### 5. Carpeta Vacía - users-clubs/
`src/modules/users/users-clubs/` está vacía. Eliminar o implementar.

---

## 🟡 INCONSISTENCIAS DE DISEÑO

### 6. Formatos de Respuesta Diferentes

| Módulo | Método | Formato |
|--------|--------|---------|
| users | findAll | `{ status, data, total }` |
| users | create | `{ status, message, user }` ← diferente |
| users | update | `{ status, message }` ← sin data |
| countries | create | `{ status, message }` |
| countries | findAll | `{ status, data, total, nextCursor }` |
| countries | update | `{ status, data }` |
| emergency | create | `{ status, message, data }` |
| emergency | findOne | `{ status, message, data }` ← incluye message |
| auth | signUp | `{ user_id, access_token }` ← sin status |
| auth | signIn | `{ access_token, user_context }` ← sin status |

**Recomendación**: Definir un formato estándar:
```typescript
interface ApiResponse<T> {
  status: boolean;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    nextCursor?: any;
  };
}
```

### 7. Decoradores Duplicados
4 archivos casi idénticos:
- `catalog-endpoint.decorator.ts`
- `club-endpoint.decorator.ts`
- `users-endpoint.decorator.ts`
- `classes-endpoint.decorator.ts`

Igual con interceptors:
- `catalog-response.interceptor.ts`
- `classes-response.interceptor.ts`

### 8. Parámetro Mal Nombrado en Decoradores
```typescript
// club-endpoint.decorator.ts
export function ReadClub(catalog: string, roles = ROLES.ALL) {  // ❌ "catalog"
  
// users-endpoint.decorator.ts  
export function ReadDataUser(catalog: string, roles = ROLES.ALL) {  // ❌ "catalog"
```
**Debería ser**: `resource` o `entity`

### 9. Mezcla de Idiomas en Mensajes
```typescript
// Español
'La fecha de bautismo no puede ser anterior a la fecha de nacimiento'
'Sesión cerrada exitosamente'
'No se pudo identificar al usuario desde el token'

// Inglés
'Error creating user with Supabase'
'Email already in use'
'Country created successfully'
```

### 10. DTOs en Ubicaciones Inconsistentes
| Módulo | Ubicación DTOs |
|--------|----------------|
| auth | `/models/` (interfaces) |
| users | `/dtos/` y `/models/` |
| clubs | `/dtos/` (classes) |
| catalogs | Inline o Prisma types |

### 11. Controladores No Usan Decoradores Personalizados
- `users.controller.ts` usa `@Roles()`, `@Permissions()`, `@HttpCode()` manualmente
- `countries.controller.ts` usa `@ReadCatalog()`, `@CreateCatalog()` correctamente

---

## 📊 Resumen por Prioridad

| Prioridad | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔴 Crítica | 3 | Bugs que afectan funcionalidad |
| 🟠 Alta | 2 | Código muerto/recursos desperdiciados |
| 🟡 Media | 6 | Inconsistencias de diseño |
| Total | 11 | Problemas identificados |

---

## Próximos Pasos Sugeridos

1. **Inmediato**: Corregir bugs críticos (1-3)
2. **Corto plazo**: Eliminar código muerto (4-5)
3. **Mediano plazo**: Estandarizar respuestas y decoradores (6-8)
4. **Largo plazo**: Refactorizar hacia servicio genérico y unificar patrones
