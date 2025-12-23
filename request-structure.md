# Solicitud de Documentación del Proyecto Backend

Necesito que generes documentación completa del proyecto backend para facilitar el desarrollo del cliente Flutter. **IMPORTANTE: NO inventes ninguna información. Solo documenta lo que existe actualmente en el código base.**

## 1. Schema Prisma

**Archivo a generar:** `docs/database/schema.prisma`

**Instrucciones:**
- Copia el contenido EXACTO del archivo `prisma/schema.prisma` del proyecto
- No agregues ni modifiques ningún modelo, campo o relación
- Si el archivo no existe, indícalo claramente

## 2. Ejemplos de Respuestas JSON

**Archivo a generar:** `docs/database/examples/sample_responses.json`

**Instrucciones:**
Para CADA modelo/tabla del schema Prisma, genera ejemplos de respuestas JSON reales basados en:
- Los controladores/routes existentes
- Las respuestas actuales que devuelve la API
- Los campos EXACTOS que se incluyen en las respuestas
- Valores de ejemplo realistas pero ficticios

**Formato esperado:**
{
"nombre_modelo_get_one": {
// respuesta de GET /api/modelo/:id
},
"nombre_modelo_get_list": [
// respuesta de GET /api/modelos (array)
],
"nombre_modelo_create": {
// respuesta de POST /api/modelo
},
"nombre_modelo_with_relations": {
// respuesta cuando se incluyen relaciones
}
}

text

**Reglas:**
- Solo incluye respuestas de endpoints que EXISTEN en el código
- Respeta los nombres de campos exactos (snake_case, camelCase, etc.)
- Si un endpoint incluye/excluye campos, documéntalo fielmente
- No inventes endpoints o respuestas

## 3. Documentación de Endpoints

**Archivo a generar:** `docs/api/endpoints.md`

**Instrucciones:**
Documenta TODOS los endpoints REST existentes en el proyecto, extrayendo información de:
- Archivos de routes
- Controladores
- Middlewares aplicados

**Formato para cada endpoint:**

[METHOD] /api/ruta

Descripción: [Qué hace el endpoint]

Autenticación: [Sí/No - especificar tipo si aplica]

Parámetros de Ruta:

param1: tipo - descripción

Query Params: (si aplica)

param1: tipo - descripción

include: string - relaciones a incluir

Body: (para POST/PUT/PATCH)

json
{
  "campo1": "tipo",
  "campo2": "tipo"
}
Response Success (200/201):

json
{
  // ejemplo real de respuesta
}
Response Error:

json
{
  "error": "mensaje de error",
  "statusCode": 400
}
Notas:

[Información adicional relevante]

text

**Reglas:**
- Solo documenta endpoints que EXISTEN en el código
- Extrae los ejemplos de request/response del código actual
- Indica validaciones reales (required, min, max, etc.)
- Documenta middleware de autenticación si existe
- No inventes funcionalidades

## 4. Configuración de la API

**Archivo a generar:** `docs/api/config.md`

**Instrucciones:**
Documenta la configuración actual de la API:

Configuración General
Base URL: [URL base de la API en desarrollo/producción]

Puerto: [Puerto configurado]

Versión API: [Si existe versionado]

Formato de Respuestas: [JSON, etc.]

Autenticación
Tipo: [JWT, Session, API Key, etc. - solo si existe]

Header requerido: [Ejemplo: Authorization: Bearer {token}]

Endpoints públicos: [Lista de endpoints sin auth]

Endpoints protegidos: [Lista de endpoints con auth]

Headers Comunes
Request Headers:

Content-Type: application/json

[Otros headers requeridos]

Response Headers:

[Headers personalizados si existen]

Manejo de Errores
Formato de errores:

json
{
  // estructura real de errores
}
Códigos de estado utilizados:

200: [Descripción]

201: [Descripción]

400: [Descripción]

401: [Descripción]

etc.

Variables de Entorno Requeridas
Lista las variables de entorno que el cliente debería conocer:

API_URL: [descripción]

[Otras variables relevantes para el cliente]

text

**Reglas:**
- Extrae información de archivos de configuración (.env.example, config files)
- Solo documenta lo que está implementado
- No asumas configuraciones que no existen

## 5. Enums y Constantes

**Archivo a generar:** `docs/api/enums.md`

**Instrucciones:**
Documenta TODOS los enums, constantes y valores permitidos en el backend:

Enums del Sistema
[Nombre del Enum]

Ubicación en código: [path del archivo]

Valores permitidos:

VALOR_1: Descripción

VALOR_2: Descripción

Usado en: [Modelos o endpoints donde se usa]

Ejemplo:

json
{
  "campo": "VALOR_1"
}
text

**Reglas:**
- Extrae enums de Prisma schema y del código TypeScript/JavaScript
- Documenta constantes globales relevantes para el cliente
- No inventes valores o enums

## 6. Relaciones y Estructuras Complejas

**Archivo a generar:** `docs/database/relations.md`

**Instrucciones:**
Documenta las relaciones entre modelos del schema Prisma:

Relaciones entre Modelos
[ModeloA] → [ModeloB]

Tipo de relación: [One-to-Many, Many-to-Many, One-to-One]

Descripción: [Cómo se relacionan]

En la API:

Endpoint para incluir relación: [ruta]

Query param: include=nombreRelacion

Ejemplo de respuesta con relación: [referencia al JSON de ejemplo]

Campos de relación:

En ModeloA: campo_id (foreign key)

En ModeloB: campo (campo relacionado)

text

**Reglas:**
- Basar únicamente en el schema Prisma existente
- Documentar solo relaciones implementadas en los endpoints
- No asumas comportamientos

## Checklist de Validación

Antes de entregar la documentación, verifica:

- [ ] Todo el contenido proviene del código base existente
- [ ] No se inventaron endpoints, campos o funcionalidades
- [ ] Los ejemplos JSON reflejan respuestas reales
- [ ] Los tipos de datos coinciden con el schema Prisma
- [ ] Las rutas de endpoints son exactas
- [ ] Se documentaron todos los modelos del schema
- [ ] Se incluyeron todos los endpoints existentes
- [ ] Los ejemplos usan datos ficticios pero realistas
- [ ] Se indicó claramente qué requiere autenticación

## Formato de Entrega

Genera todos los archivos solicitados en la estructura:

docs/
├── database/
│ ├── schema.prisma
│ ├── relations.md
│ └── examples/
│ └── sample_responses.json
└── api/
├── endpoints.md
├── config.md
└── enums.md

text

## Notas Finales

- Si algún archivo o información no existe en el código, indícalo explícitamente
- Si hay inconsistencias en el código, documéntalas
- Si falta información crítica, señálalo para que se pueda corregir
- Prioriza exactitud sobre completitud