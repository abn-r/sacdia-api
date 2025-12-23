**Visión General**
Se requiere desarrollar una REST API utilizando NestJS para sustentar tanto un panel web como una aplicación móvil. La API gestionará la autenticación, autorización y operaciones CRUD sobre una base de datos PostgreSQL, utilizando Prisma como ORM. Dado que la aplicación contempla más de 40 tablas, se implementará un servicio genérico para las operaciones CRUD, permitiendo, en caso necesario, crear servicios personalizados que incluyan lógica adicional o validaciones específicas.
**Autenticación y Seguridad**
Autenticación con Supabase:
La API validará los tokens JWT proporcionados por Supabase. Se utilizará la librería oficial de Supabase para delegar la administración de la autenticación, de manera que cada solicitud verifique el token de forma centralizada mediante un guard de NestJS.
**RBAC (Role-Based Access Control):**
El control de acceso se basará en roles y permisos, gestionados de forma dinámica a través de la base de datos (ya se cuenta con una tabla definida para ello). Se podrá agregar o modificar permisos desde el panel web, permitiendo flexibilidad en la administración. Para acceder a la información, se deberá validar que el rol asignado posea los permisos correspondientes.
**Protección Contra Vulnerabilidades**
Además de la validación de tokens y el RBAC, se implementarán medidas para prevenir SQL Injection, ataques CSRF, XSS y cualquier forma de inyección de código. Se hará especial énfasis en la sanitización de entradas y en el uso de buenas prácticas de seguridad durante el desarrollo.
**Acceso a Datos y Servicio Genérico CRUD**
Prisma ORM y PostgreSQL:
Las consultas a la base de datos se realizarán mediante Prisma, el cual ya se encuentra configurado y conectado a una base de datos PostgreSQL. Se aprovecharán las capacidades de Prisma para manejar relaciones y realizar consultas complejas, incluyendo la posibilidad de traer datos relacionados de forma anidada.
**Servicio Genérico CRUD**
Dada la cantidad de tablas, se diseñará un servicio genérico que gestione las operaciones CRUD básicas, el cual será lo suficientemente flexible para:
Atender las operaciones básicas en todas las tablas.
Soportar relaciones anidadas, permitiendo incluir datos relacionados en las respuestas.
Permitir, mediante inyección de dependencias o sobreescritura, la incorporación de lógica adicional en aquellas tablas que requieran validaciones o transformaciones específicas.
Servicios Personalizados:
En aquellos casos donde se requiera una lógica de negocio particular o validaciones adicionales, se podrán desarrollar servicios personalizados que extiendan o reemplacen la funcionalidad genérica.
Arquitectura y Principios de Diseño
Adopción de Patrones de Diseño:
Se utilizarán patrones de diseño como el Repository y el Service Layer para lograr una separación clara de responsabilidades y facilitar la escalabilidad y mantenibilidad de la API. Aunque la API se diseñará siguiendo principios SOLID, se buscará un equilibrio para no sobrecomplicar la arquitectura, permitiendo flexibilidad y agilidad en el desarrollo.
**Estructura del Proyecto**
Se optará por una organización modular agrupada por nicho funcional. Por ejemplo, todos los módulos relacionados con la gestión de usuarios se agruparán bajo un módulo principal de usuario, lo que permitirá mantener una estructura coherente y escalable a medida que el proyecto crezca.
**Herramientas Adicionales y Escalabilidad**
**Documentación y Logging**
Swagger: Se utilizará la integración por defecto que ofrece NestJS para documentar la API de manera clara y actualizada.
Winston: Se integrará Winston para el manejo de logs, permitiendo un control detallado de los eventos y errores en producción.
Escalabilidad y Mantenibilidad:
La API se diseñará pensando en un crecimiento significativo del proyecto, lo que implica:
La implementación de una arquitectura modular y el uso de patrones de diseño que faciliten el mantenimiento.
La posibilidad de migrar a un entorno basado en contenedores (por ejemplo, Docker) en el futuro, aunque por el momento no se contemple su uso.
**Listado de Tablas y Agrupación por Módulos**
**Users**
contact_emails
contact_phones
users_allergies
users_diseases
users_honors
users_permissions
users_roles
users_classes
users_pr
users
emergency_contacts
users_clubs
**Clubs**
activities
class_section_progress
assignments_folders
class_module_progress
class_modules
class_sections
classes
club_adventurers
club_ideals
club_inventory
club_master_guild
club_pathfinders
club_role_assignments
club_types
clubs
coordinators
finances
folders_modules
folders
folders_modules_records
folders_section_records
folders_sections
master_honors
unit_members
units
weekly_records
honors
enrollments
**Camporees**
attending_clubs_camporees
attending_members_camporees
local_camporees
union_camporee_local_fields
union_camporees
judges_camporees
**Catalogs**
relationship_type
allergies
churches
countries
diseases
districts
ecclesiastical_year
finances_categories
honors_categories
inventory_categories
local_fields
unions
**Security**
permissions
roles
role_permissions
error_logs
**Validación de Seguridad**
Se implementará un guard para validar el token JWT y otro para verificar que el rol asociado cuente con los permisos requeridos. Además, se deberá especificar en cada solicitud el permiso correspondiente que se requiere para acceder a determinado recurso o ejecutar una acción.