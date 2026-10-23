# Documentación del Proyecto BinaryShop
**Asignatura:** Introducción a la Informática  
**Semestre:** 1-2026  
**Tecnologías:** HTML5, CSS3, JavaScript Vanilla (Sin librerías ni frameworks)

---

## 1. Descripción General del Proyecto

BinaryShop es una plataforma web de comercio electrónico desarrollada bajo los principios de modelado de software (UML) y arquitectura frontend nativa con JavaScript Vanilla.

El proyecto cumple estrictamente con las especificaciones aprobadas en la **Fase I**:
- **Diagrama de Clases:** Implementación en JavaScript mediante Programación Orientada a Objetos (POO).
- **Diagrama de Casos de Uso:** Implementación de los flujos de Comprador, Vendedor, Administrador y Pasarela de Pagos.
- **Diagrama de Secuencia:** Ejecución paso a paso del proceso de compra inmediata y autorización bancaria.

---

## 2. Estructura de Archivos del Proyecto

El proyecto está organizado de forma modular y ordenada:

```text
ecommerce/
│
├── index.html              # Estructura semántica de la interfaz y ventanas modales
├── README.md               # Resumen del proyecto e instrucciones para GitHub
│
├── css/
│   └── styles.css          # Estilos visuales con CSS3 puro (diseño responsivo y limpio)
│
├── js/
│   ├── models.js           # Definición de las clases UML del sistema
│   ├── data.js             # Datos iniciales del catálogo y persistencia en localStorage
│   └── app.js              # Controlador principal, eventos del DOM y flujo de compras
│
└── docs/
    └── DOCUMENTACION.md    # Explicación técnica y guía para la defensa oral
```

---

## 3. Mapeo del Diagrama de Clases al Código (`js/models.js`)

En `models.js` se codificaron exactamente las clases y métodos que fueron aprobados en el diagrama de clases:

### A. Paquete: Gestión de Usuarios
1. **Clase `Usuario`:**
   - **Atributos:** `nombre`, `apellido`, `direccion`, `nickname`, `contrasena`, `datosBancarios`, `sesionActiva`.
   - **Métodos:**
     - `registrarse(sistemaUsuarios)`: Agrega al nuevo usuario validando que el nickname no esté repetido.
     - `iniciarSesion(nickname, contrasena)`: Valida las credenciales y activa la sesión.
     - `cerrarSesion()`: Desactiva la sesión.
2. **Clase `Comprador` (Hereda de `Usuario` mediante `extends`):**
   - Posee un `Carrito` como atributo (relación de composición).
   - **Métodos:**
     - `explorarCatalogo(catalogo)`: Filtra productos disponibles con stock.
     - `añadiralCarrito(producto, cantidad)`: Valida existencia y agrega al carrito.
     - `comprarInmediatamente(producto, cantidad, datosBancarios, pasarela)`: Dispara la compra directa.
3. **Clase `Vendedor` (Hereda de `Usuario`):**
   - Posee un arreglo `historialVentas`.
   - **Métodos:**
     - `publicarProducto(descripcion, imagen, precio, stock, catalogo)`: Crea un nuevo producto y lo añade a la tienda.
     - `consultarHistorial()`: Devuelve las ventas concretadas del vendedor.
4. **Clase `Administrador` (Hereda de `Usuario`):**
   - **Métodos:**
     - `eliminarCuenta(nickname, listaUsuarios)`: Remueve usuarios del sistema.
     - `removerProducto(idProducto, catalogo)`: Remueve artículos del catálogo.

### B. Paquete: Gestión de Productos
- **Clase `Producto`:**
  - **Atributos:** `id`, `descripcion`, `imagen`, `precio`, `stock`, `vendedorNickname`.
  - **Métodos:**
    - `actualizar(nuevosDatos)`: Modifica precio, stock o descripción.
    - `estaDisponible(cantidad)`: Comprueba si hay existencias suficientes.

### C. Paquete: Gestión de Compras
1. **Clase `ItemCarrito`:**
   - Relaciona un `Producto` con una `cantidad` y calcula el `subtotal`.
2. **Clase `Carrito`:**
   - Contiene la lista de `items` y el `total`.
   - **Métodos:** `agregarItem()`, `eliminarItem()`, `vaciar()`, `calcularTotal()`.
3. **Clase `Compra`:**
   - Registra `id`, `fecha`, `total`, `estado` ("Pendiente", "Confirmada", "Cancelada") y lista de artículos.
   - **Métodos:** `confirmar()`, `cancelar()`.
4. **Clase `Venta`:**
   - Registra fecha, monto, comprador y producto para el historial del vendedor.

### D. Paquete: Gestión de Pagos
1. **Clase `Pago`:**
   - Registra monto, fecha y estado ("Pendiente", "Exitoso", "Rechazado").
   - **Método:** `procesar(datosBancarios, pasarela)`: Solicita autorización a la pasarela.
2. **Clase `PasarelaPago`:**
   - Simula la entidad bancaria externa.
   - **Método:** `autorizar(monto, datosBancarios)`:
     - Retorna `true` si los datos son válidos.
     - Retorna `false` si el número de tarjeta termina en `0000` (diseñado específicamente para demostrar la ruta de rechazo del diagrama de secuencia).

---

## 4. Mapeo del Diagrama de Secuencia (Compra Inmediata)

El diagrama de secuencia describe los pasos exactos que ocurren cuando un comprador presiona **"Comprar Ya"**:

| Paso UML | Acción en el Código | Ubicación |
|---|---|---|
| **1. Click "Comprar inmediatamente"** | El usuario presiona el botón en la tarjeta del producto. Invoca `app.iniciarCompraInmediata(id)`. | `index.html` / `app.js` |
| **2. Solicitar datos bancarios y confirmación** | La interfaz abre la ventana modal con los campos de pago y resumen. | `mostrarModalCheckout()` |
| **3. Ingresar datos bancarios y confirmar** | El comprador verifica sus datos bancarios y hace click en "Confirmar y Procesar Pago". | Formulario `#form-pago-inmediato` |
| **4. procesarCompra(idProducto, datosBancarios)** | Se llama al objeto `ControladorCompra.procesarCompra(...)`. | `ControladorCompra` en `app.js` |
| **5 y 6. crearPago(monto, fecha) -> idPago** | El controlador instancia `new Pago(monto, fecha)`, generando un identificador único de pago. | `ControladorCompra` en `app.js` |
| **7 y 8. procesar() -> autorizar(monto, datosBancarios)** | `pago.procesar()` invoca `app.pasarelaPago.autorizar()`. | `models.js` (`Pago` y `PasarelaPago`) |
| **Alt 1: Transacción Exitosa (true)** | - **9:** Transacción autorizada.<br>- **10:** Confirmación de pago exitoso.<br>- **11:** Se descuenta el stock y se registra la compra y la venta.<br>- **12:** Se ejecuta `app.mostrarReciboCompra(...)` mostrando el comprobante digital. | `app.js` |
| **Alt 2: Transacción Rechazada (false)** | - **13:** Transacción rechazada.<br>- **14:** Error en el pago.<br>- **15:** Se notifica el rechazo al usuario mediante toast.<br>- **16:** Se mantiene abierta la opción para reintentar. | `app.js` (al ingresar tarjeta con terminación `0000`) |

---

## 5. Mapeo de Casos de Uso Implementados

1. **Registrarse e Iniciar Sesión:**
   - Formulario que solicita nombre, apellido, dirección, nickname, contraseña, datos bancarios y rol.
   - Validación de credenciales predefinidas o creadas dinámicamente.
2. **Explorar Catálogo:**
   - Vista de productos con precio, foto, stock y buscador interactivo.
3. **Añadir al Carrito:**
   - Suma items, recalcula subtotales y muestra el contador dinámico en la barra superior.
4. **Comprar Inmediatamente / Procesar Pago:**
   - Conexión con la pasarela simulada y emisión del recibo.
5. **Habilitar Opciones de Venta:**
   - Requisito del enunciado: Si un usuario comprador desea convertirse en vendedor, pulsa el botón **"Habilitar Venta"** y actualiza sus datos para acceder al Panel de Vendedor.
6. **Publicar Producto y Consultar Historial:**
   - Panel exclusivo de vendedor con formulario de publicación y tabla de ventas históricas.
7. **Eliminar Cuenta y Remover Producto:**
   - Panel de Administrador con tablas interactivas para moderar usuarios y publicaciones.

---

## 6. Cuentas Preconfiguradas en el Sistema

El sistema cuenta con usuarios preexistentes para cada uno de los roles modelados:

- **Comprador:**
  - Nickname: `comprador`
  - Contraseña: `123`
  - Rol: Comprador

- **Vendedor:**
  - Nickname: `vendedor`
  - Contraseña: `123`
  - Rol: Vendedor

- **Administrador:**
  - Nickname: `admin`
  - Contraseña: `admin`
  - Rol: Administrador

> **Nota:** La plataforma también permite registrar nuevos usuarios desde el formulario de registro. Toda la información se mantiene sincronizada localmente en el almacenamiento del navegador (`localStorage`).

---

## 7. Preguntas Frecuentes y Justificación Técnica

### Aspectos Clave de la Arquitectura

1. **"¿Por qué se desarrolló en JavaScript Vanilla sin librerías externas?"**
   - *Respuesta:* Para garantizar máxima eficiencia, cero dependencias y total control sobre el DOM y el ciclo de vida de los componentes, demostrando que los estándares nativos de la web moderna permiten construir aplicaciones completas y fluidas.

2. **"¿Dónde se aplica la Programación Orientada a Objetos?"**
   - *Respuesta:* En el archivo `js/models.js`. Se emplean clases estándar ES6 (`class`). Se implementa **herencia** (`Comprador`, `Vendedor` y `Administrador` extienden de `Usuario` mediante `super()`), **encapsulamiento** de lógica y estado, y relaciones de **composición** (`Comprador` posee `Carrito`, y este contiene instancias de `ItemCarrito`).

3. **"¿Dónde se ubica el controlador del flujo de compras?"**
   - *Respuesta:* En `js/app.js`, mediante el objeto `ControladorCompra`. El método `procesarCompra()` ejecuta la verificación de existencias, genera el registro de `Pago`, solicita validación a la `PasarelaPago`, descuenta stock y emite el comprobante de compra.

4. **"¿Cómo se gestiona el control de errores en las transacciones bancarias?"**
   - *Respuesta:* La clase `PasarelaPago` valida el formato y monto de la transacción. Para evaluar la ruta de rechazo de pago, las tarjetas que terminen en `0000` son denegadas automáticamente por fondos insuficientes, notificando el error y permitiendo al usuario reintentar.

5. **"¿Cómo se gestiona la persistencia de datos en el cliente?"**
   - *Respuesta:* Se utilizó el API nativo `localStorage` del navegador. Cuando se publica un producto, se elimina un usuario o se concreta una venta, los datos se sincronizan automáticamente para que la información persista entre sesiones y recargas de página.

---
*BinaryShop - Proyecto Académico de Introducción a la Informática - 2026*
