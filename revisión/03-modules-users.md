# Análisis: Módulo Users

## Estructura
```
users/
├── users.controller.ts
├── users.module.ts
├── users.service.ts
├── dtos/
├── models/
├── emergency_contact/
├── users-allergies/
├── users-classes/
├── users-clubs/        # ⚠️ CARPETA VACÍA
├── users-diseases/
└── users-honors/
```

---

## 🔴 BUGS CRÍTICOS

### 1. Mensaje de Error Incorrecto (users.service.ts:294)
```typescript
async remove(where: Prisma.usersWhereUniqueInput) {
  // ...
  } catch (error) {
    throw new BadRequestException('Unable to soft delete Districts'); // ❌ Debería ser "Users"
  }
}
```

### 2. Nombre de Parámetro Incorrecto (users.controller.ts:64)
```typescript
@Patch(':id')
update(
  @Param('id') id: string,
  @Body() updateSongDto: Prisma.usersUpdateInput,  // ❌ Debería ser updateUserDto
) {
```

---

## 🔴 INCONSISTENCIAS EN RESPUESTAS

| Método | Formato |
|--------|---------|
| `findAll` | `{ status: true, data: users, total: users.length }` |
| `findOne` | `{ status: true, data: user }` |
| `update` | `{ status: true, message: "..." }` |
| `create` | `{ status: true, message: "...", user: newUser }` |
| `remove` | `{ status: true, message: "..." }` |

**Problemas**:
- `create` devuelve `user` mientras que otros devuelven `data`
- `update` no devuelve el objeto actualizado
- `findAll` usa `users.length` en lugar de una query `count()` real

---

## 🟡 INCONSISTENCIAS EN CONTROLADOR

### No Usa Decoradores Personalizados
El controlador usa decoradores manuales en lugar de los personalizados:
```typescript
// Actual
@Roles(...ROLES.ALL)
@Permissions(PERMISSIONS.READ_USERS)
@HttpCode(HttpStatus.OK)

// Debería usar (según el patrón de otros módulos)
@ReadDataUser('USERS')
```

### Falta ParseUUIDPipe en update/delete
```typescript
@Patch(':id')
update(@Param('id') id: string, ...)  // ❌ Sin validación

@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string)  // ✅ Con validación
```

---

## ✅ Elementos Bien Implementados

### getUserContext()
- Consulta compleja bien estructurada
- Incluye roles globales y asignaciones de club
- Procesa permisos correctamente

### Invalidación de Caché
```typescript
const cacheKey = `user-context-${where.user_id}`;
await this.cacheManager.del(cacheKey);
```

### Validación de Fechas
```typescript
if (baptismDate < birthDate) {
  throw new BadRequestException('La fecha de bautismo no puede ser anterior...');
}
```

---

## 📋 Submódulos

### emergency_contact/
- **BUG CRÍTICO**: En `update()` busca duplicados en tabla `districts` en lugar de `emergency_contacts`
```typescript
// Línea 140-146 de emergency_contact.service.ts
const existingDistricts = await this.prisma.districts.findFirst({  // ❌ WRONG TABLE!
  where: {
    OR: [{ name: updateemergencyContactsDto.name as string }],
    NOT: { local_field_id: id }
  }
});
```

### users-clubs/
- ⚠️ Carpeta vacía - posible módulo incompleto

---

## Recomendaciones
1. Corregir bugs de copy-paste (mensajes de error, tablas incorrectas)
2. Unificar formato de respuestas
3. Usar decoradores personalizados consistentemente
4. Agregar validación `ParseUUIDPipe` en todos los endpoints con UUID
5. Eliminar o implementar `users-clubs/`
