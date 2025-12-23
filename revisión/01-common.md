# Análisis: Carpeta /common

## Estructura
```
common/
├── cache/           # Configuración de caché
├── constants/       # Roles y permisos
├── decorators/      # 11 archivos
├── dtos/            # DTOs compartidos
├── filters/         # Filtros de excepciones
├── guards/          # SupabaseGuard, PermissionsGuard
├── interceptors/    # 5 interceptors
├── interfaces/      # (vacío)
├── supabase/        # Cliente Supabase
└── permissions.json # Definiciones de permisos
```

---

## 🔴 INCONSISTENCIAS ENCONTRADAS

### 1. Decoradores Duplicados (Alta Prioridad)
Existen 4 decoradores de endpoint casi idénticos:
- `catalog-endpoint.decorator.ts`
- `club-endpoint.decorator.ts`
- `users-endpoint.decorator.ts`
- `classes-endpoint.decorator.ts`

**Problema**: Todos tienen la misma estructura base `XXXEndpoint()` con funciones `ReadXXX`, `CreateXXX`, `UpdateXXX`, `DeleteXXX`. La única diferencia real son los roles por defecto y permisos.

**Parámetro mal nombrado**: En `club-endpoint.decorator.ts` y `users-endpoint.decorator.ts` usan `catalog` como nombre de parámetro cuando debería ser `entity` o `resource`.

**Recomendación**: Crear UN solo decorador genérico `ResourceEndpoint` con opciones configurables:
```typescript
export function ResourceEndpoint(resource: string, action: 'read' | 'create' | 'update' | 'delete', options?: EndpointOptions)
```

### 2. Interceptors Duplicados (Alta Prioridad)
- `CatalogResponseInterceptor` y `ClassesResponseInterceptor` son **99% idénticos**
- Solo difiere el `idField` por defecto ('id' vs 'class_id')
- Ambos hacen exactamente lo mismo: transformar respuestas paginadas

**Recomendación**: Unificar en un solo `ResponseInterceptor` configurable.

### 3. TransformInterceptor No Consistente
- Existe `TransformInterceptor` que envuelve respuestas en `{ data, timestamp }`
- Los otros interceptors (`CatalogResponseInterceptor`, etc.) NO siguen este patrón
- **Resultado**: Las respuestas de la API tienen formatos diferentes según el endpoint

---

## ✅ ELEMENTOS BIEN IMPLEMENTADOS

### Guards (Bien estructurados)
- **SupabaseGuard**: Correcto, usa caché para contexto de usuario, manejo de errores apropiado
- **PermissionsGuard**: Implementa detección de duplicados, verifica roles y permisos correctamente

### Constantes de Roles
- Bien organizadas en `/constants/roles.ts`
- Hay grupos: `ALL`, `ALL_ADMIN`, `LF_ADMIN`, `CLUB_ADMIN`

---

## 📋 Patrones Identificados

1. **Patrón de respuesta paginada**: `{ data: [], total: number, page: number, limit: number }`
2. **Patrón RBAC**: Roles + Permisos verificados en guards
3. **Caché de contexto de usuario**: TTL configurable
4. **Decoradores compuestos**: Combinan roles, permisos y HttpCode

---

## 🔗 Dependencias Cruzadas
- `SupabaseGuard` → `UsersService` (para contexto local)
- Decoradores → Constantes de `roles.ts` y `permissions.ts`
- Guards → `AuthenticatedUser` interface

---

## Archivos pendientes de revisar
- [ ] `/common/dtos/` - Verificar DTOs genéricos
- [ ] `/common/filters/` - Filtros de excepciones
- [ ] `/common/supabase/` - Configuración Supabase
