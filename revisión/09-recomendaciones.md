# Recomendaciones de Mejora

## 📋 Plan de Acción por Prioridad

---

## 🔴 FASE 1: Correcciones Críticas (Inmediato)

### 1.1 Corregir Bugs de Copy-Paste

**Archivo**: `src/modules/users/emergency_contact/emergency_contact.service.ts`
```typescript
// Línea 140: Cambiar prisma.districts → prisma.emergency_contacts
// Línea 145: Cambiar local_field_id → emergency_id
```

**Archivo**: `src/modules/users/users.service.ts`
```typescript
// Línea 294: Cambiar 'Districts' → 'Users'
```

**Archivo**: `src/modules/users/users.controller.ts`
```typescript
// Línea 64: Cambiar updateSongDto → updateUserDto
```

**Archivo**: `src/modules/classes/classes.service.ts`
```typescript
// Línea 38: Cambiar clubDto → classDto
// Línea 20: Cambiar 'Name are required' → 'Name is required'
```

### 1.2 Eliminar Código Muerto

**Múltiples archivos** - Eliminar PrismaClient no usado:
```typescript
// Eliminar estas líneas del constructor:
const prismaLog = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

Archivos afectados:
- `src/modules/catalogs/countries/countries.service.ts`
- `src/modules/catalogs/districts/districts.service.ts`
- `src/modules/clubs/clubs.service.ts`
- Revisar todos los servicios de catálogos

### 1.3 Eliminar Carpeta Vacía
```bash
rm -rf src/modules/users/users-clubs/
```

---

## 🟠 FASE 2: Estandarización (Corto Plazo - 1-2 semanas)

### 2.1 Definir Interface de Respuesta Estándar

**Crear**: `src/common/interfaces/api-response.interface.ts`
```typescript
export interface ApiResponse<T = any> {
  status: boolean;
  data?: T;
  message?: string;
  meta?: ApiResponseMeta;
}

export interface ApiResponseMeta {
  total?: number;
  page?: number;
  limit?: number;
  nextCursor?: string | number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiResponseMeta;
}
```

### 2.2 Unificar Decoradores de Endpoint

**Crear**: `src/common/decorators/resource-endpoint.decorator.ts`
```typescript
export type ResourceAction = 'read' | 'create' | 'update' | 'delete';

export interface ResourceEndpointOptions {
  roles?: string[];
  status?: HttpStatus;
}

export function ResourceEndpoint(
  resource: string,
  action: ResourceAction,
  options?: ResourceEndpointOptions
) {
  const permission = `${action.toUpperCase()}_${resource.toUpperCase()}`;
  const defaultRoles = getDefaultRolesForAction(action);
  
  return applyDecorators(
    Roles(...(options?.roles || defaultRoles)),
    Permissions(permission),
    HttpCode(options?.status || HttpStatus.OK)
  );
}

// Helpers para cada acción
export const ReadResource = (resource: string, roles?: string[]) => 
  ResourceEndpoint(resource, 'read', { roles });

export const CreateResource = (resource: string, roles?: string[]) => 
  ResourceEndpoint(resource, 'create', { roles });

export const UpdateResource = (resource: string, roles?: string[]) => 
  ResourceEndpoint(resource, 'update', { roles });

export const DeleteResource = (resource: string, roles?: string[]) => 
  ResourceEndpoint(resource, 'delete', { roles });
```

### 2.3 Unificar Interceptors de Respuesta

**Crear**: `src/common/interceptors/response.interceptor.ts`
```typescript
export interface ResponseInterceptorOptions {
  idField?: string;
  excludeFields?: string[];
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private options: ResponseInterceptorOptions = {}) {}
  // ... unificar lógica de CatalogResponseInterceptor y ClassesResponseInterceptor
}
```

### 2.4 Estandarizar Idioma de Mensajes

Decisión: **Todos los mensajes en inglés**

Buscar y reemplazar mensajes en español en:
- `auth.service.ts`
- `users.service.ts`
- Otros archivos

---

## 🟡 FASE 3: Refactorización (Mediano Plazo - 1 mes)

### 3.1 Crear Servicio Genérico CRUD

**Crear**: `src/common/services/generic-crud.service.ts`
```typescript
export abstract class GenericCrudService<
  TModel,
  TCreateDto,
  TUpdateDto,
  TWhereUniqueInput
> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly cacheManager: Cache,
    protected readonly modelName: string,
    protected readonly idField: string
  ) {}

  abstract getSelectFields(): object;
  
  async findAll(params: PaginationParams): Promise<PaginatedResponse<TModel>> {
    // Implementación genérica con caché
  }

  async findOne(id: number | string): Promise<ApiResponse<TModel>> {
    // Implementación genérica con caché
  }

  async create(dto: TCreateDto): Promise<ApiResponse<TModel>> {
    // Implementación genérica
  }

  async update(id: number | string, dto: TUpdateDto): Promise<ApiResponse<TModel>> {
    // Implementación genérica + invalidar caché
  }

  async softDelete(id: number | string): Promise<ApiResponse<void>> {
    // Implementación genérica + invalidar caché
  }
}
```

### 3.2 Refactorizar Servicios de Catálogos

Ejemplo para Countries:
```typescript
@Injectable()
export class CountriesService extends GenericCrudService<
  Country,
  CreateCountryDto,
  UpdateCountryDto,
  Prisma.countriesWhereUniqueInput
> {
  constructor(prisma: PrismaService, @Inject(CACHE_MANAGER) cache: Cache) {
    super(prisma, cache, 'countries', 'country_id');
  }

  getSelectFields() {
    return { country_id: true, name: true, abbreviation: true };
  }

  // Solo métodos específicos adicionales
  async search(term: string) { ... }
}
```

### 3.3 Dividir ClubsService

Crear servicios separados:
- `ClubsService` - CRUD básico de clubs
- `ClubInstancesService` - Adventurers, Pathfinders, Master Guides
- `ClubAssignmentsService` - Asignación de roles y miembros

### 3.4 Crear DTOs Formales

Para módulo auth:
```typescript
// src/modules/auth/dto/sign-up.dto.ts
export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsString()
  p_lastname: string;

  @IsOptional()
  @IsString()
  m_lastname?: string;
}
```

---

## 🔵 FASE 4: Mejoras Adicionales (Largo Plazo)

### 4.1 Agregar Validación Global
```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

### 4.2 Documentación Swagger
Agregar decoradores `@ApiResponse`, `@ApiProperty` en todos los DTOs

### 4.3 Tests Unitarios
Agregar tests para servicios críticos:
- AuthService
- UsersService
- ClubsService

### 4.4 Middleware de Soft Delete Automático
```typescript
// Prisma middleware para aplicar soft-delete automáticamente
prisma.$use(async (params, next) => {
  if (params.action === 'findMany' || params.action === 'findFirst') {
    params.args.where = { ...params.args.where, active: true };
  }
  return next(params);
});
```

---

## 📊 Estimación de Esfuerzo

| Fase | Esfuerzo | Impacto |
|------|----------|---------|
| Fase 1 | 2-4 horas | Alto (corrige bugs) |
| Fase 2 | 1-2 días | Alto (estandariza) |
| Fase 3 | 1-2 semanas | Medio (refactoriza) |
| Fase 4 | 2-4 semanas | Bajo (mejora calidad) |

---

## Checklist de Implementación

### Fase 1
- [ ] Corregir emergency_contact.service.ts
- [ ] Corregir users.service.ts
- [ ] Corregir users.controller.ts
- [ ] Corregir classes.service.ts
- [ ] Eliminar PrismaClient no usado
- [ ] Eliminar carpeta users-clubs vacía

### Fase 2
- [ ] Crear ApiResponse interface
- [ ] Unificar decoradores de endpoint
- [ ] Unificar interceptors
- [ ] Estandarizar mensajes en inglés

### Fase 3
- [ ] Crear GenericCrudService
- [ ] Refactorizar servicios de catálogos
- [ ] Dividir ClubsService
- [ ] Crear DTOs formales para auth

### Fase 4
- [ ] Agregar ValidationPipe global
- [ ] Documentar con Swagger
- [ ] Escribir tests unitarios
- [ ] Implementar middleware soft-delete
