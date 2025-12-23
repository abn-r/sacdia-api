# Análisis: Módulo Catalogs

## Estructura
```
catalogs/
├── allergies/
├── churches/
├── club-role-assignments/
├── club_types/
├── countries/
├── diseases/
├── districts/
├── honors/
├── honors-categories/
├── local-fields/
├── master-honors/
├── permissions/
├── relationship_types/
├── role-permissions/
├── roles/
├── unions/
└── users-roles/
```

Total: **17 subcatálogos**

---

## 🔴 CÓDIGO DUPLICADO MASIVO

### Servicios Idénticos
`countries.service.ts` y `districts.service.ts` (y probablemente todos los demás) tienen:
- Misma estructura de métodos CRUD
- Misma lógica de caché
- Misma lógica de paginación
- Mismas validaciones

**Diferencias mínimas**: Nombre de tabla, campos específicos

### PrismaClient No Usado (BUG)
En múltiples servicios:
```typescript
constructor(
  private readonly prisma: PrismaService,
  @Inject(CACHE_MANAGER) private cacheManager: Cache
) {
  const prismaLog = new PrismaClient({  // ❌ Se crea pero NUNCA se usa
    log: ['query', 'info', 'warn', 'error'],
  });
}
```
**Problema**: Memoria desperdiciada, cliente Prisma extra instanciado sin propósito

---

## 🔴 INCONSISTENCIAS EN RESPUESTAS

### countries.service.ts
```typescript
create()      → { status: true, message: 'Country created successfully' }
findAll()     → { status: true, data: [], total, nextCursor }
findOne()     → { status: true, data: country }
search()      → { status: true, data: [] }
update()      → { status: true, data: updatedCountry }
softDelete()  → { status: true, message: 'Country deleted successfully' }
```

### emergency_contact.service.ts
```typescript
create()      → { status: true, message: '...', data: dto }  // Diferente!
findOne()     → { status: true, message: '...', data }       // Incluye message!
```

---

## ✅ Elementos Bien Implementados

### Uso de Caché
```typescript
const cacheKey = `countries_list_${JSON.stringify(params)}`;
let cachedResult = await this.cacheManager.get(cacheKey);
if (cachedResult) return cachedResult;
// ...
await this.cacheManager.set(cacheKey, response, 3600000);
```

### Paginación con Cursor
```typescript
const [result, total] = await Promise.all([
  this.prisma.countries.findMany({
    take: take ? take + 1 : undefined,  // Para determinar si hay más
    // ...
  }),
  this.prisma.countries.count({ where })
]);

let nextCursor = undefined;
if (take && result.length > take) {
  const nextItem = result.pop();
  nextCursor = nextItem.country_id;
}
```

### Controladores Consistentes
Los controladores de catálogos SÍ usan los decoradores personalizados:
```typescript
@CatalogController('countries')
export class CountriesController {
  @Get()
  @ReadCatalog('COUNTRIES')
  @TransformResponse({ idField: 'country_id' })
  findAll() { ... }
}
```

---

## 📋 Patrón Recomendado: Servicio Genérico

La "Visión General" del proyecto menciona:
> "Se diseñará un servicio genérico que gestione las operaciones CRUD básicas"

**Estado actual**: NO existe servicio genérico. Cada catálogo tiene su propio servicio copy-paste.

### Propuesta
```typescript
// generic-catalog.service.ts
@Injectable()
export abstract class GenericCatalogService<T, CreateDto, UpdateDto> {
  constructor(
    protected prisma: PrismaService,
    protected cacheManager: Cache,
    protected tableName: string,
    protected idField: string
  ) {}

  async findAll(params: PaginationParams): Promise<PaginatedResponse<T>> { ... }
  async findOne(id: number): Promise<SingleResponse<T>> { ... }
  async create(dto: CreateDto): Promise<CreateResponse> { ... }
  async update(id: number, dto: UpdateDto): Promise<UpdateResponse<T>> { ... }
  async softDelete(id: number): Promise<DeleteResponse> { ... }
}

// countries.service.ts
@Injectable()
export class CountriesService extends GenericCatalogService<Country, CreateCountryDto, UpdateCountryDto> {
  constructor(prisma: PrismaService, cacheManager: Cache) {
    super(prisma, cacheManager, 'countries', 'country_id');
  }
  
  // Solo métodos específicos adicionales
  async search(term: string) { ... }
}
```

---

## Recomendaciones
1. **Crear servicio genérico CRUD** para eliminar duplicación
2. **Eliminar `new PrismaClient()`** no usado en constructores
3. **Estandarizar formato de respuestas**
4. **Considerar usar Prisma middleware** para soft-delete automático
