# ClothLink

ClothLink es una plataforma web orientada al impacto social que facilita el proceso de donación e intercambio de prendas de vestir de forma transparente, rápida e intuitiva. La aplicación permite a los donantes publicar prendas en buen estado y a los usuarios u organizaciones explorar, filtrar y solicitar prendas disponibles a través de un catálogo interactivo.

---

## Funcionalidades Principales

* **Autenticación y Gestión de Usuarios:** Registro e inicio de sesión con persistencia de sesión mediante tokens JWT. Identificación dinámica del usuario activo y gestión de cierre de sesión.
* **Catálogo Interactivo:** Carga automática de prendas disponibles con opciones de búsqueda por texto o ID, y filtros por categoría (*Pantalones, Camisas, Suéteres, Calzado*), talla y estado (*Nuevo, Buen Estado, Usado*).
* **Publicación de Prendas (Donar):** Formulario intuitivo para el registro de nuevas prendas con carga de imágenes y descripción detallada.
* **Actualización en Tiempo Real:** Interfaz reactiva que refleja la eliminación de prendas y los cambios de disponibilidad inmediatamente sin necesidad de recargar la página.

---

## Tecnologías Utilizadas

* **Frontend:** Angular, TypeScript, HTML5, CSS3 / SCSS, RxJS.
* **Backend:** Node.js, Express.js, Prisma ORM, Multer.
* **Base de Datos:** MySQL.
* **Autenticación:** JSON Web Tokens (JWT), bcrypt.
