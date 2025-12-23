# Configuración de la API - SACDIA

> **Generado automáticamente desde el código base existente**

## Configuración General

| Propiedad | Valor |
|-----------|-------|
| **Base URL (desarrollo)** | `http://localhost:3000` |
| **Puerto por defecto** | `3000` (configurable via `PORT` env) |
| **Documentación Swagger** | `/docs` |
| **Formato de respuestas** | JSON |
| **Framework** | NestJS |

---

## Autenticación

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | JWT (Bearer Token) via Supabase |
| **Header requerido** | `Authorization: Bearer {token}` |
| **Expiración del token** | 1 día (`1d`) |
| **Proveedor** | Supabase Auth |

### Endpoints Públicos (Sin autenticación)
- `POST /auth/signup` - Registro de usuario
- `POST /auth/signin` - Inicio de sesión
- `POST /auth/request-password-reset` - Solicitar reset de contraseña
- `POST /auth/password-reset` - Restablecer contraseña

### Endpoints Protegidos
Todos los demás endpoints requieren autenticación. Algunos también requieren permisos específicos (RBAC).

---

## Headers

### Request Headers Requeridos

```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

### CORS Configurado

```javascript
{
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}
```

---

## Validación Global

La API utiliza `ValidationPipe` con las siguientes opciones:

```javascript
{
  transform: true,        // Transforma payloads a tipos DTO
  whitelist: true,        // Elimina propiedades no decoradas
  forbidNonWhitelisted: true  // Lanza error si hay propiedades no permitidas
}
```

---

## Manejo de Errores

### Formato de errores estándar

```json
{
  "status": false,
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

### Códigos de Estado Utilizados

| Código | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| **200** | OK | Operación GET/PATCH/DELETE exitosa |
| **201** | Created | Recurso creado exitosamente (POST) |
| **400** | Bad Request | Datos de entrada inválidos, validación fallida |
| **401** | Unauthorized | Token no proporcionado o inválido |
| **403** | Forbidden | Usuario sin permisos para la operación |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Conflicto de datos (ej: email duplicado) |
| **500** | Internal Server Error | Error interno del servidor |

---

## Variables de Entorno

### Requeridas para el Backend

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | URL de conexión a PostgreSQL (pooled) | `postgresql://user:pass@host:port/db?pgbouncer=true` |
| `DIRECT_URL` | URL directa a PostgreSQL | `postgresql://user:pass@host:port/db` |
| `SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Clave de servicio de Supabase | `eyJ...` |
| `JWT_SECRET` | Secreto para firmar JWT | `your-secret-key` |

### Relevantes para el Cliente

| Variable | Descripción |
|----------|-------------|
| `API_URL` | URL base de la API (ej: `http://localhost:3000`) |
| `SUPABASE_URL` | URL de Supabase para autenticación directa |
| `SUPABASE_ANON_KEY` | Clave anónima de Supabase (para cliente) |

---

## Base de Datos

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | PostgreSQL |
| **ORM** | Prisma |
| **Conexión** | Pooled via Supabase (PgBouncer) |

---

## Estructura de Respuestas

### Respuesta Exitosa (Lista)

```json
{
  "status": true,
  "data": [...],
  "total": 100,
  "nextCursor": 101,
  "meta": {
    "page": 1,
    "limit": 10
  }
}
```

### Respuesta Exitosa (Elemento único)

```json
{
  "status": true,
  "data": {...}
}
```

### Respuesta de Creación

```json
{
  "status": true,
  "message": "Resource created successfully",
  "data": {...}
}
```

### Respuesta de Actualización

```json
{
  "status": true,
  "message": "Resource updated successfully",
  "data": {...}
}
```

### Respuesta de Eliminación

```json
{
  "status": true,
  "message": "Resource deleted successfully"
}
```

---

## Paginación

La API utiliza paginación basada en cursor para la mayoría de los endpoints de listado.

### Parámetros de Query

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `skip` | number | Registros a omitir | `0` |
| `take` | number | Registros a tomar | `10` (varía por endpoint) |
| `cursor` | string/number | ID del último registro | - |
| `where` | string (JSON) | Filtros de búsqueda | - |
| `orderBy` | string (JSON) | Criterio de ordenamiento | - |

### Ejemplo de uso

```
GET /users?skip=0&take=20&where={"active":true}&orderBy={"name":"asc"}
```

---

## Sistema de Permisos (RBAC)

La API implementa un sistema de Control de Acceso Basado en Roles (RBAC).

### Jerarquía de Roles

1. **Roles Globales**
   - `super-admin` - Acceso total al sistema
   - `admin` - Administración general

2. **Roles de División (DIA)**
   - `director-dia` - Director de la División
   - `assistant-dia` - Asistente de la División

3. **Roles de Unión**
   - `director-union` - Director de Unión
   - `assistant-union` - Asistente de Unión

4. **Roles de Campo Local**
   - `director-lf` - Director de Campo Local
   - `assistant-lf` - Asistente de Campo Local

5. **Roles de Coordinación**
   - `general-coordinator` - Coordinador General
   - `zone-coordinator` - Coordinador de Zona
   - `coordinator` - Coordinador

6. **Roles de Club**
   - `director` - Director de Club
   - `deputy-director` - Subdirector
   - `secretary` - Secretario
   - `treasurer` - Tesorero
   - `secretary-treasurer` - Secretario-Tesorero
   - `counselor` - Consejero

7. **Rol Base**
   - `user` - Usuario regular

### Formato de Permisos

Los permisos siguen el formato: `action:resource`

Ejemplos:
- `read:users` - Leer usuarios
- `create:clubs` - Crear clubes
- `update:honors` - Actualizar especialidades
- `delete:classes` - Eliminar clases

---

## Documentación Swagger

La documentación interactiva está disponible en `/docs` cuando el servidor está ejecutándose.

### Tags disponibles

| Tag | Descripción |
|-----|-------------|
| Authentication | Autenticación y autorización |
| Users | Gestión de usuarios y datos personales |
| Clubs | Gestión de clubes (Aventureros, Conquistadores, Guías Mayores) |
| Classes | Clases y niveles de los clubes |
| Catalogs | Catálogos del sistema (países, uniones, campos, etc.) |
| Permissions Catalog | Gestión de permisos y roles |
| File Upload | Carga de archivos |

---

## Logging

El servidor tiene habilitados los siguientes niveles de log:

- `error`
- `warn`
- `debug`
- `log`
- `verbose`
