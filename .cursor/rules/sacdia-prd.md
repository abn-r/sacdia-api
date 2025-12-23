# PRD: SACDIA API

## 1. Product overview
### 1.1 Document title and version
*   PRD: SACDIA API
*   Version: 1.0

### 1.2 Product summary
Esta API RESTful, desarrollada con NestJS y Prisma, proporciona la funcionalidad backend para el Sistema de Administración de Clubes de la División Interamericana (SACDIA). Permite gestionar usuarios, roles, permisos, clubes, clases, honores y diversos catálogos relacionados con la estructura organizacional y datos relevantes de los miembros (como información médica básica).

La API se centra en ofrecer endpoints seguros y bien definidos para operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre las distintas entidades del sistema. Utiliza autenticación basada en JWT (manejada a través de Supabase) y un sistema de autorización basado en roles y permisos para controlar el acceso a los recursos.

Incluye funcionalidades para el registro y autenticación de usuarios, gestión de perfiles, asignación a clubes y clases, registro de honores, carga de archivos (probablemente fotos de perfil o documentos) y administración de catálogos maestros esenciales para el funcionamiento del sistema.

## 2. Goals
### 2.1 Business goals
*   Centralizar la gestión de la información de clubes, miembros, clases y honores.
*   Proporcionar una API robusta y escalable para soportar aplicaciones cliente (web/móvil).
*   Asegurar la integridad y seguridad de los datos mediante autenticación y autorización.
*   Facilitar la administración de roles y permisos dentro del sistema.
*   Optimizar los procesos administrativos relacionados con los clubes.

### 2.2 User goals
*   Los administradores podrán gestionar toda la configuración del sistema, usuarios, roles y catálogos.
*   Los líderes de club podrán gestionar la información de sus clubes y miembros asignados.
*   Los usuarios podrán registrarse, iniciar sesión y gestionar su información personal y de perfil.
*   Los usuarios podrán visualizar la información relevante a sus clubes, clases y honores.

### 2.3 Non-goals
*   No se incluye funcionalidad de frontend o interfaz de usuario.
*   No se gestionan pagos o aspectos financieros.
*   No se incluye comunicación en tiempo real (chat, notificaciones push) en esta versión inicial.
*   No se realiza análisis avanzado de datos o generación de reportes complejos más allá de las consultas básicas.

## 3. User personas
### 3.1 Key user types
*   Super Administrador
*   Administrador (Nivel Unión, Campo Local, etc.)
*   Líder de Club
*   Usuario Regular (Miembro de Club, Padre/Tutor)
*   Usuario No Autenticado (Limitado)

### 3.2 Basic persona details
*   **Super Administrador**: Responsable máximo del sistema, con acceso total a la configuración, usuarios, roles y todos los datos. Gestiona otros administradores.
*   **Administrador**: Gestiona entidades dentro de su ámbito (Unión, Campo Local), como clubes, usuarios y asignación de roles específicos.
*   **Líder de Club**: Gestiona la información específica de su club, incluyendo miembros, clases, honores y actividades del club.
*   **Usuario Regular**: Miembro de un club o padre/tutor que interactúa con el sistema para ver información, actualizar su perfil, etc.
*   **Usuario No Autenticado**: Acceso muy limitado, posiblemente solo a endpoints públicos si existieran (actualmente la mayoría requiere autenticación).

### 3.3 Role-based access
*   **Super Administrador (SUPER_ADMIN)**: Acceso completo a todas las funcionalidades CRUD de todas las entidades. Puede gestionar roles y permisos.
*   **Administrador (ADMIN)**: Acceso CRUD sobre entidades dentro de su jerarquía organizacional (ej. clubes de su campo). Puede gestionar usuarios y roles limitados.
*   **Líder de Club (CLUB_LEADER - Asumido)**: Acceso CRUD sobre la información de su club específico y sus miembros.
*   **Usuario (USER)**: Acceso de lectura a información relevante (su perfil, club, clases). Acceso de escritura limitado a su propio perfil.
*   **No Autenticado/Invitado**: Sin acceso a la mayoría de los endpoints (requieren autenticación).

## 4. Functional requirements
*   **Autenticación** (Prioridad: Alta)
    *   Registro de nuevos usuarios (signUp).
    *   Inicio de sesión (signIn).
    *   Cierre de sesión (signOut).
    *   Solicitud de restablecimiento de contraseña.
    *   Restablecimiento de contraseña con token.
    *   Verificación y completado de registro post-creación inicial.
*   **Gestión de Usuarios (CRUD)** (Prioridad: Alta)
    *   Listar usuarios con paginación y filtros.
    *   Obtener detalles de un usuario específico.
    *   Actualizar información de un usuario (propio perfil o por administradores).
    *   Eliminar usuarios (solo Super Administrador).
*   **Gestión de Roles y Permisos (CRUD)** (Prioridad: Alta)
    *   Gestionar roles (listar, crear, actualizar, eliminar - probable Admin/Super Admin).
    *   Gestionar permisos (listar - probable Admin/Super Admin).
    *   Asignar permisos a roles (listar, crear, eliminar - probable Admin/Super Admin).
    *   Asignar roles a usuarios (listar, crear, eliminar - probable Admin/Super Admin).
*   **Gestión de Catálogos (CRUD)** (Prioridad: Alta)
    *   Gestionar Países, Uniones, Campos Locales, Distritos, Iglesias.
    *   Gestionar Tipos de Club, Roles de Club.
    *   Gestionar Honores, Categorías de Honores, Maestrías.
    *   Gestionar Enfermedades, Alergias, Tipos de Relación (para contactos de emergencia).
*   **Gestión de Clubes (CRUD)** (Prioridad: Alta)
    *   Listar, crear, obtener, actualizar, eliminar clubes (según permisos).
    *   Gestionar asignación de usuarios a clubes.
*   **Gestión de Clases (CRUD)** (Prioridad: Media)
    *   Listar, crear, obtener, actualizar, eliminar clases (probablemente a nivel catálogo).
    *   Gestionar asignación de usuarios a clases.
*   **Gestión de Honores de Usuario (CRUD)** (Prioridad: Media)
    *   Gestionar asignación de honores a usuarios.
*   **Gestión de Información Médica de Usuario (CRUD)** (Prioridad: Alta)
    *   Gestionar asignación de alergias a usuarios.
    *   Gestionar asignación de enfermedades a usuarios.
*   **Gestión de Contactos de Emergencia (CRUD)** (Prioridad: Alta)
    *   Listar, crear, obtener, actualizar, eliminar contactos de emergencia para un usuario.
*   **Carga de Archivos** (Prioridad: Media)
    *   Subir archivos asociados a entidades (ej. foto de perfil de usuario).

## 5. User experience
### 5.1. Entry points & first-time user flow
*   **Punto de entrada principal**: Endpoint de autenticación (`/auth/signin`).
*   **Flujo de primer usuario**:
    1.  Registro a través de `/auth/signup`.
    2.  Posiblemente verificación/completado de registro (`/auth/pr-check`, `/auth/pr-complete`).
    3.  Inicio de sesión (`/auth/signin`) para obtener un token JWT.
    4.  Uso del token JWT en cabeceras `Authorization: Bearer <token>` para acceder a endpoints protegidos.

### 5.2. Core experience
*   **Autenticación**: El usuario se autentica para obtener acceso.
    *   El proceso debe ser rápido y devolver un token válido.
*   **Acceso a datos**: El usuario (o sistema cliente) realiza llamadas a los endpoints relevantes (ej. `/users/me`, `/clubs/:id`, `/users/:userId/honors`).
    *   Las respuestas deben ser consistentes (formato JSON), rápidas y contener la información solicitada según los permisos del usuario.
*   **Modificación de datos**: El usuario (o sistema cliente) envía datos a endpoints `POST`, `PATCH`, `DELETE` (ej. `/users/:id`, `/clubs`).
    *   Las validaciones de entrada (DTOs) deben ser claras y devolver errores útiles en caso de datos incorrectos. Las respuestas de éxito deben indicar claramente el resultado de la operación.

### 5.3. Advanced features & edge cases
*   Paginación y filtrado en listas (`findAll` endpoints).
*   Autorización granular basada en roles y permisos.
*   Gestión de relaciones complejas (usuario-club, usuario-clase, usuario-rol, rol-permiso).
*   Manejo de errores centralizado y códigos de estado HTTP apropiados.
*   Uso de caché para mejorar el rendimiento en consultas frecuentes (ej. catálogos).

### 5.4. UI/UX highlights
*   (No aplica directamente a la API, pero influye en el cliente) API consistente y predecible.
*   Respuestas de error claras y accionables.
*   Buena performance en las consultas.

## 6. Narrative
Un líder de club necesita registrar a un nuevo miembro y asignarle una clase y algunos honores básicos. Accede a la aplicación cliente (que consume esta API), se autentica usando sus credenciales (`/auth/signin`). Navega a la sección de gestión de miembros de su club, busca al usuario recién registrado (o lo crea si no existe, interactuando con `/users` y posiblemente `/users-clubs`), actualiza el perfil del miembro con información básica (`/users/:id`), lo asigna a una clase específica (`/users-classes`) y registra los honores obtenidos (`/users-honors`). La API valida cada paso, asegurando que el líder tenga los permisos necesarios y que los datos sean correctos, actualizando la base de datos de forma segura y consistente. El líder puede luego consultar la información actualizada del miembro y del club.

## 7. Success metrics
### 7.1. User-centric metrics
*   Tiempo medio de respuesta de la API.
*   Tasa de éxito de las solicitudes API (>99%).
*   Número de usuarios activos registrados.
*   Número de clubes y miembros gestionados a través de la API.

### 7.2. Business metrics
*   Adopción de la API por las diferentes Uniones/Campos.
*   Reducción del tiempo administrativo para la gestión de clubes.
*   Satisfacción de los administradores y líderes con la herramienta backend.

### 7.3. Technical metrics
*   Disponibilidad del servicio (Uptime > 99.9%).
*   Utilización de recursos del servidor (CPU, memoria).
*   Tasa de errores (monitoreo de excepciones).
*   Cobertura de pruebas (unitarias, integración, e2e).

## 8. Technical considerations
### 8.1. Integration points
*   **Base de Datos**: PostgreSQL (gestionada vía Prisma).
*   **Autenticación**: Supabase (para gestión de usuarios y JWT).
*   **Almacenamiento de Archivos**: Probablemente Supabase Storage o un servicio similar (a confirmar según la implementación de `FileUploadModule`).
*   **Aplicaciones Cliente**: Aplicaciones web o móviles que consumirán esta API.

### 8.2. Data storage & privacy
*   Se utiliza Prisma como ORM para interactuar con la base de datos PostgreSQL.
*   Se deben considerar las regulaciones de privacidad de datos (GDPR, etc.) al manejar información personal (nombres, email, fecha de nacimiento, datos médicos como alergias/enfermedades).
*   El acceso a datos sensibles debe estar estrictamente controlado por roles y permisos.

### 8.3. Scalability & performance
*   NestJS proporciona una arquitectura modular y escalable.
*   Prisma ofrece un manejo eficiente de las conexiones a base de datos.
*   El uso de paginación es crucial para endpoints que devuelven listas potencialmente grandes.
*   El uso de caché (`CacheModule`) puede mejorar el rendimiento de lectura de datos estáticos o frecuentemente accedidos.
*   Considerar la optimización de consultas de base de datos complejas.

### 8.4. Potential challenges
*   Manejo de la complejidad de la estructura organizacional (Uniones, Campos, Distritos, Iglesias, Clubes).
*   Garantizar la correcta implementación y granularidad del sistema de roles y permisos.
*   Optimización del rendimiento con un gran volumen de datos (muchos usuarios, clubes, registros históricos).
*   Gestión segura y eficiente de la carga y almacenamiento de archivos.
*   Mantener la consistencia de los datos a través de las múltiples relaciones entre entidades.

## 9. Milestones & sequencing
### 9.1. Project estimate
*   Large: 3-6 meses (considerando la complejidad y número de módulos ya implementados).

### 9.2. Team size & composition
*   Medium Team: 2-4 personas
    *   1-2 Backend Engineers (NestJS, Prisma)
    *   1 Frontend Engineer (para cliente consumidor)
    *   1 Product Manager / QA

### 9.3. Suggested phases
*   **Fase 1 (Completada)**: Core de Autenticación, Gestión de Usuarios, Roles/Permisos básicos, Estructura de Catálogos inicial, Módulos base (Clubes, Clases, Honores), Configuración inicial (Prisma, Supabase).
    *   Key deliverables: Endpoints funcionales para auth, users, roles, permisos, catálogos principales, clubes, clases, honores.
*   **Fase 2 (Actual/Próxima)**: Refinamiento de permisos, Implementación completa de todos los catálogos, Gestión de relaciones (Usuario-Club, Usuario-Clase, etc.), Funcionalidad de carga de archivos, Implementación de caché, Pruebas exhaustivas.
    *   Key deliverables: Endpoints CRUD completos y probados para todas las entidades, sistema de permisos robusto, carga de archivos funcional, caché implementado.
*   **Fase 3 (Futura)**: Optimización de rendimiento, Funcionalidades avanzadas (reportes, notificaciones si se añaden), Mantenimiento y evolución.
    *   Key deliverables: API optimizada, posibles nuevas funcionalidades, documentación completa.

## 10. User stories

### 10.1. Registro de Usuario
*   **ID**: US-AUTH-001
*   **Título**: Registro de un nuevo usuario
*   **Descripción**: Como usuario nuevo, quiero poder registrarme en el sistema proporcionando mi email, contraseña y nombre completo, para poder acceder a la plataforma.
*   **Acceptance criteria**:
    *   Existe un endpoint `POST /auth/signup`.
    *   El endpoint acepta email, contraseña, nombre, apellido paterno y apellido materno.
    *   Se valida que el email no esté ya registrado.
    *   La contraseña se almacena de forma segura (hashed).
    *   Se crea un nuevo registro de usuario en la base de datos (probablemente en Supabase Auth y sincronizado con la tabla `users`).
    *   Se devuelve una respuesta exitosa indicando la creación del usuario o un token inicial.
    *   Se devuelve un error claro si el email ya existe o los datos son inválidos.

### 10.2. Inicio de Sesión
*   **ID**: US-AUTH-002
*   **Título**: Inicio de sesión de usuario
*   **Descripción**: Como usuario registrado, quiero poder iniciar sesión con mi email y contraseña para obtener un token de acceso y utilizar las funcionalidades protegidas.
*   **Acceptance criteria**:
    *   Existe un endpoint `POST /auth/signin`.
    *   El endpoint acepta email y contraseña.
    *   Se valida las credenciales contra los datos almacenados (Supabase Auth).
    *   Si las credenciales son válidas, se devuelve un token JWT válido.
    *   Si las credenciales son inválidas, se devuelve un error de autenticación (ej. 401 Unauthorized).

### 10.3. Cierre de Sesión
*   **ID**: US-AUTH-003
*   **Título**: Cierre de sesión de usuario
*   **Descripción**: Como usuario autenticado, quiero poder cerrar mi sesión actual para invalidar mi token de acceso.
*   **Acceptance criteria**:
    *   Existe un endpoint `POST /auth/signout`.
    *   El endpoint requiere un token JWT válido en la cabecera `Authorization`.
    *   El token actual del usuario se invalida (puede implicar una lista negra de tokens o depender de la gestión de sesiones de Supabase).
    *   Se devuelve una respuesta exitosa indicando el cierre de sesión.

### 10.4. Solicitar Restablecimiento de Contraseña
*   **ID**: US-AUTH-004
*   **Título**: Solicitar restablecimiento de contraseña
*   **Descripción**: Como usuario registrado que olvidó su contraseña, quiero poder solicitar un restablecimiento de contraseña proporcionando mi email, para recibir instrucciones (probablemente un enlace o token por email) para establecer una nueva contraseña.
*   **Acceptance criteria**:
    *   Existe un endpoint `POST /auth/request-password-reset`.
    *   El endpoint acepta una dirección de email.
    *   Si el email corresponde a un usuario registrado, se inicia el flujo de restablecimiento (ej. generar token, enviar email vía Supabase).
    *   Se devuelve una respuesta genérica exitosa (para no revelar si un email existe o no).

### 10.5. Restablecer Contraseña
*   **ID**: US-AUTH-005
*   **Título**: Restablecer contraseña con token
*   **Descripción**: Como usuario que solicitó un restablecimiento, quiero poder establecer una nueva contraseña utilizando el token recibido, para poder volver a acceder a mi cuenta.
*   **Acceptance criteria**:
    *   Existe un endpoint `POST /auth/password-reset`.
    *   El endpoint acepta el token de restablecimiento y la nueva contraseña.
    *   Se valida el token.
    *   Si el token es válido, se actualiza la contraseña del usuario de forma segura.
    *   Se invalida el token de restablecimiento.
    *   Se devuelve una respuesta exitosa.
    *   Se devuelve un error si el token es inválido o expiró.

### 10.6. Listar Usuarios
*   **ID**: US-USER-001
*   **Título**: Listar usuarios del sistema
*   **Descripción**: Como administrador (o usuario con permisos), quiero poder listar los usuarios registrados en el sistema, con opciones de paginación y filtrado, para poder gestionarlos o consultarlos.
*   **Acceptance criteria**:
    *   Existe un endpoint `GET /users`.
    *   El endpoint requiere autenticación y el permiso `READ_USERS`.
    *   Acepta parámetros opcionales de query para paginación (`skip`, `take`, `cursor`) y filtrado/orden (`where`, `orderBy`).
    *   Devuelve una lista paginada de usuarios según los parámetros y permisos del solicitante.
    *   La información sensible (como contraseñas) no se incluye en la respuesta.

### 10.7. Ver Detalles de Usuario
*   **ID**: US-USER-002
*   **Título**: Ver detalles de un usuario específico
*   **Descripción**: Como administrador o usuario (para ver mi propio perfil), quiero poder obtener los detalles completos de un usuario específico por su ID.
*   **Acceptance criteria**:
    *   Existe un endpoint `GET /users/:id`.
    *   El endpoint requiere autenticación y el permiso `READ_USERS`.
    *   Acepta el ID del usuario como parámetro de ruta.
    *   Devuelve los detalles del usuario correspondiente al ID.
    *   Devuelve un error 404 si el usuario no existe.
    *   Devuelve un error 403 si el solicitante no tiene permisos para ver ese usuario (si aplica lógica adicional más allá de `READ_USERS` general).

### 10.8. Actualizar Usuario
*   **ID**: US-USER-003
*   **Título**: Actualizar información de usuario
*   **Descripción**: Como administrador o usuario (actualizando mi propio perfil), quiero poder modificar la información de un usuario existente.
*   **Acceptance criteria**:
    *   Existe un endpoint `PATCH /users/:id`.
    *   El endpoint requiere autenticación y el permiso `UPDATE_USERS`.
    *   Acepta el ID del usuario como parámetro de ruta y los datos a actualizar en el body.
    *   Se validan los datos de entrada.
    *   Se actualiza la información del usuario en la base de datos.
    *   Un usuario regular solo puede actualizar su propio perfil (requiere verificación adicional en el servicio).
    *   Un administrador puede actualizar otros perfiles según sus permisos.
    *   Devuelve los datos del usuario actualizado o una confirmación de éxito.

### 10.9. Eliminar Usuario
*   **ID**: US-USER-004
*   **Título**: Eliminar un usuario
*   **Descripción**: Como Super Administrador, quiero poder eliminar un usuario del sistema.
*   **Acceptance criteria**:
    *   Existe un endpoint `DELETE /users/:id`.
    *   El endpoint requiere autenticación, el rol `SUPER_ADMIN` y el permiso `DELETE_USERS`.
    *   Acepta el ID del usuario como parámetro de ruta.
    *   Se elimina el usuario de la base de datos (y posiblemente de Supabase Auth).
    *   Se manejan las relaciones dependientes (ej. desasignar de clubes, etc.) o se produce un error si hay restricciones.
    *   Devuelve una confirmación de éxito.

### 10.10. Gestionar Catálogos (Genérico)
*   **ID**: US-CAT-001
*   **Título**: Gestionar un catálogo específico (ej. Países)
*   **Descripción**: Como administrador, quiero poder realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre los elementos de un catálogo específico (ej. Países, Tipos de Club, Honores), para mantener la información maestra del sistema actualizada.
*   **Acceptance criteria**:
    *   Existen endpoints CRUD (ej. `GET /countries`, `POST /countries`, `GET /countries/:id`, `PATCH /countries/:id`, `DELETE /countries/:id`) para cada catálogo.
    *   Los endpoints están protegidos por autenticación y permisos adecuados (ej. `MANAGE_CATALOGS` o permisos específicos por catálogo).
    *   Los endpoints de creación/actualización validan los datos de entrada.
    *   Las operaciones se reflejan correctamente en la base de datos.
    *   Se devuelven respuestas y códigos de estado HTTP apropiados.

### 10.11. Gestionar Clubes (CRUD)
*   **ID**: US-CLUB-001
*   **Título**: Gestionar clubes
*   **Descripción**: Como administrador o líder con permisos, quiero poder realizar operaciones CRUD sobre los clubes para mantener la información de los clubes actualizada.
*   **Acceptance criteria**:
    *   Existen endpoints CRUD para clubes (ej. `/clubs`, `/clubs/:id`).
    *   Los endpoints están protegidos por autenticación y permisos adecuados (diferentes niveles de acceso según rol).
    *   Se permite listar, crear, ver detalles, actualizar y eliminar clubes según los permisos.
    *   Las operaciones se reflejan en la base de datos.

### 10.12. Asignar Usuario a Club
*   **ID**: US-CLUB-002
*   **Título**: Asignar/Desasignar usuario a un club
*   **Descripción**: Como administrador o líder de club, quiero poder asignar un usuario a un club o removerlo, para gestionar la membresía del club.
*   **Acceptance criteria**:
    *   Existe un endpoint para gestionar la relación usuario-club (ej. `POST /users-clubs`, `DELETE /users-clubs/:assignmentId` o similar).
    *   Requiere autenticación y permisos adecuados.
    *   Permite crear y eliminar la relación entre un usuario y un club.
    *   Se valida que el usuario y el club existan.

### 10.13. Gestionar Clases/Honores/Info Médica/Contactos (Similar a Clubes/Catálogos)
*   **ID**: US-OTHER-001
*   **Título**: Gestionar Clases/Honores/Info Médica/Contactos de Emergencia
*   **Descripción**: Como usuario con permisos (Admin, Líder, Usuario para su propia info), quiero poder gestionar (CRUD) las clases, honores asignados, información de alergias/enfermedades y contactos de emergencia asociados a los usuarios.
*   **Acceptance criteria**:
    *   Existen endpoints CRUD específicos para cada una de estas entidades y sus relaciones con los usuarios (ej. `/classes`, `/users/:id/honors`, `/users/:id/allergies`, `/emergency-contacts`).
    *   Los endpoints están protegidos por autenticación y permisos adecuados según la entidad y la acción.
    *   Las operaciones CRUD funcionan correctamente y validan los datos.

### 10.14. Cargar Archivo
*   **ID**: US-FILE-001
*   **Título**: Cargar un archivo
*   **Descripción**: Como usuario autenticado, quiero poder cargar un archivo (ej. foto de perfil) asociado a una entidad específica (ej. mi perfil de usuario).
*   **Acceptance criteria**:
    *   Existe un endpoint para la carga de archivos (ej. `POST /file-upload`).
    *   Requiere autenticación.
    *   Acepta un archivo (multipart/form-data).
    *   Puede aceptar parámetros adicionales para indicar a qué entidad asociar el archivo.
    *   El archivo se almacena de forma segura (ej. Supabase Storage).
    *   Se devuelve una URL o identificador del archivo subido.
    *   Se aplican límites de tamaño y tipo de archivo. 