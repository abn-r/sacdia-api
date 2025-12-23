# Análisis: Módulo Auth

## Estructura
```
auth/
├── auth.controller.ts
├── auth.module.ts
├── auth.service.ts
├── models/
│   └── profile-response.dto.ts
└── strategies/
```

## ✅ Elementos Bien Implementados

### Transacciones
- El método `signUp` usa `prisma.$transaction()` correctamente para operaciones atómicas
- Implementa compensación (eliminar usuario de Supabase si falla la DB local)

### Logging
- Usa `Logger` de NestJS consistentemente
- Logs detallados para debugging de Supabase

### Manejo de Errores
- Captura errores específicos de Prisma (P2002, P2025)
- Reelanza excepciones apropiadas

---

## 🔴 INCONSISTENCIAS ENCONTRADAS

### 1. Mensajes de Error Mixtos (Español/Inglés)
```typescript
// Español
throw new InternalServerErrorException('Error al crear token de sesión');
return { message: 'Sesión cerrada exitosamente' };

// Inglés
throw new BadRequestException('Error creating user with Supabase: ' + error.message);
throw new ConflictException('Email already in use');
```
**Recomendación**: Estandarizar todos los mensajes en un solo idioma (preferiblemente inglés para la API)

### 2. DTOs en Carpeta Incorrecta
- `profile-response.dto.ts` está en `/models/` en lugar de `/dto/` o `/dtos/`
- Otros módulos usan `/dtos/` (clubs) o definen interfaces inline

### 3. Interface vs Class para DTOs
- `profile-response.dto.ts` usa `interface` en lugar de `class`
- Las interfaces no pueden usar validadores de `class-validator`

### 4. SignUp DTO Inline
```typescript
@Post('signup')
signUp(@Body() signUpDto: {
  email: string;
  password: string;
  name: string;
  p_lastname: string;
  m_lastname: string;
}) {
```
**Problema**: DTO definido inline, sin validación, sin documentación Swagger

---

## 📋 Respuestas del Servicio

| Método | Formato de Respuesta |
|--------|---------------------|
| `signUp` | `{ user_id, access_token }` |
| `signIn` | `{ access_token, user_context }` |
| `signOut` | `{ message }` |
| `requestPasswordReset` | `{ message }` |
| `resetPassword` | `{ message }` |
| `check_pr` | `{ complete: boolean }` (directo de Prisma) |
| `complete_pr` | Objeto users_pr completo |
| `getProfile` | `UserProfileResponseDto` |

**Problema**: No hay consistencia en el formato de respuestas

---

## 🔗 Dependencias
- `UsersService` → Para `getUserContext()` y `getProfile()`
- `PrismaService` → Operaciones DB
- `@supabase/supabase-js` → Autenticación

---

## Recomendaciones
1. Crear DTOs formales con `class-validator`
2. Estandarizar respuestas: `{ status, data?, message? }`
3. Mover DTOs a carpeta `/dto/`
4. Unificar idioma de mensajes
