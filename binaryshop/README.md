# BinaryShop - Sistema de Comercio Electrónico

BinaryShop es una plataforma web de comercio electrónico desarrollada con **HTML5, CSS3 y JavaScript Vanilla** (sin dependencias ni librerías externas), estructurada bajo el estándar UML 2.5 (Diagrama de Clases, Casos de Uso y Diagrama de Secuencia).

---

## 1. ¿Cómo ejecutar el proyecto?

1. Clona o descarga este repositorio en tu computadora.
2. Abre directamente el archivo `index.html` en cualquier navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge, etc.) haciendo doble clic sobre él.
3. No se requiere instalar Node.js, npm ni ningún servidor web externo.

---

## 2. Cuentas de Acceso al Sistema

Puedes ingresar a la plataforma con cualquiera de las cuentas preconfiguradas:

| Rol | Nickname | Contraseña | Funciones Destacadas |
|---|---|---|---|
| **Comprador** | `comprador` | `123` | Explorar catálogo, buscador en tiempo real, carrito de compras, compra inmediata y opción de convertirse en vendedor. |
| **Vendedor** | `vendedor` | `123` | Formulario para publicar nuevos artículos con precio y foto, y consulta de historial de ventas. |
| **Administrador** | `admin` | `admin` | Moderación de cuentas de usuario (eliminar cuentas) y remoción de productos del catálogo. |

---

## 3. Estructura del Código

- **`index.html`**: Estructura de la tienda, barra de navegación, paneles y ventanas modales de autenticación, carrito, pago y recibo.
- **`css/styles.css`**: Hoja de estilos en CSS3 puro utilizando variables CSS, diseño adaptable (Flexbox y Grid) y transiciones suaves.
- **`js/models.js`**: Implementación de las clases UML aprobadas (`Usuario`, `Comprador`, `Vendedor`, `Administrador`, `Producto`, `Carrito`, `ItemCarrito`, `Compra`, `Venta`, `Pago`, `PasarelaPago`).
- **`js/data.js`**: Catálogo de productos iniciales y persistencia local con `localStorage`.
- **`js/app.js`**: Lógica de eventos, renderizado dinámico, cambio de vistas y ejecución del **Diagrama de Secuencia** a través de `ControladorCompra`.
- **`docs/DOCUMENTACION.md`**: Explicación detallada del código, correspondencia con los diagramas y guía con preguntas frecuentes para la defensa oral del proyecto.

---

## 4. Funcionalidades Destacadas (Puntos Extras)

- **Buscador interactivo en tiempo real:** Filtra artículos mientras escribes.
- **Flujo de pago estructurado:** Procesamiento seguro a través de pasarela de pagos con control de transacciones aprobadas y rechazadas.
- **Generación de Recibo Digital:** Comprobante formal con número de autorización, fecha, detalle y botón de impresión.
- **Transición de rol:** Un comprador puede habilitar opciones de venta sin perder su cuenta.
- **Persistencia local:** Los datos de catálogo, ventas y usuarios se mantienen sincronizados en `localStorage`.
