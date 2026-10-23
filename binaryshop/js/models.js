/**
 * models.js - Clases del Sistema BinaryShop
 * 
 * Definición de clases y modelos de datos para la plataforma BinaryShop.
 * Utiliza programación orientada a objetos (POO) en JavaScript nativo.
 */

// ==========================================
// 1. MODELOS DE USUARIO
// ==========================================

/**
 * Clase base Usuario
 * Representa a cualquier persona registrada en la plataforma.
 */
class Usuario {
    constructor(nombre, apellido, direccion, nickname, contrasena, datosBancarios = "") {
        this.nombre = nombre;
        this.apellido = apellido;
        this.direccion = direccion;
        this.nickname = nickname;
        this.contrasena = contrasena;
        this.datosBancarios = datosBancarios;
        this.sesionActiva = false;
    }

    // Registra al usuario en la lista del sistema
    registrarse(sistemaUsuarios) {
        const existe = sistemaUsuarios.some(u => u.nickname === this.nickname);
        if (existe) {
            return { exito: false, mensaje: "El nickname ya está en uso." };
        }
        sistemaUsuarios.push(this);
        return { exito: true, mensaje: "Usuario registrado con éxito." };
    }

    // Valida credenciales para iniciar sesión
    iniciarSesion(nickname, contrasena) {
        if (this.nickname === nickname && this.contrasena === contrasena) {
            this.sesionActiva = true;
            return true;
        }
        return false;
    }

    // Cierra la sesión activa
    cerrarSesion() {
        this.sesionActiva = false;
        return true;
    }
}

/**
 * Clase Comprador (Hereda de Usuario)
 * Maneja las funciones de explorar, agregar al carrito y comprar.
 */
class Comprador extends Usuario {
    constructor(nombre, apellido, direccion, nickname, contrasena, datosBancarios = "") {
        super(nombre, apellido, direccion, nickname, contrasena, datosBancarios);
        this.rol = "Comprador";
        this.carrito = new Carrito(); // Comprador posee un Carrito (Composición)
    }

    // Retorna la lista de productos disponibles en el catálogo
    explorarCatalogo(catalogo) {
        return catalogo.filter(producto => producto.estaDisponible());
    }

    // Añade un producto al carrito del comprador
    añadiralCarrito(producto, cantidad = 1) {
        if (!producto.estaDisponible(cantidad)) {
            return { exito: false, mensaje: "No hay suficiente stock disponible." };
        }
        this.carrito.agregarItem(producto, cantidad);
        return { exito: true, mensaje: "Producto agregado al carrito." };
    }

    // Realiza una compra directa sin pasar por el carrito completo
    comprarInmediatamente(producto, cantidad, datosBancarios, pasarela) {
        if (!producto.estaDisponible(cantidad)) {
            return { exito: false, mensaje: "Stock insuficiente." };
        }
        const total = producto.precio * cantidad;
        const pago = new Pago(total, new Date().toISOString());
        const autorizado = pago.procesar(datosBancarios, pasarela);

        if (autorizado) {
            producto.stock -= cantidad;
            const compra = new Compra(new Date().toISOString(), total);
            compra.confirmar();
            return { exito: true, mensaje: "Compra realizada con éxito.", compra, pago };
        } else {
            return { exito: false, mensaje: "El pago fue rechazado por la pasarela." };
        }
    }
}

/**
 * Clase Vendedor (Hereda de Usuario)
 * Permite publicar artículos y revisar ventas registradas.
 */
class Vendedor extends Usuario {
    constructor(nombre, apellido, direccion, nickname, contrasena, datosBancarios = "") {
        super(nombre, apellido, direccion, nickname, contrasena, datosBancarios);
        this.rol = "Vendedor";
        this.historialVentas = [];
    }

    // Publica un nuevo producto en el catálogo
    publicarProducto(descripcion, imagen, precio, stock, catalogo) {
        const nuevoId = "PROD-" + (catalogo.length + 1).toString().padStart(3, '0');
        const nuevoProducto = new Producto(nuevoId, descripcion, imagen, Number(precio), Number(stock), this.nickname);
        catalogo.push(nuevoProducto);
        return nuevoProducto;
    }

    // Consulta el historial de ventas del vendedor
    consultarHistorial() {
        return this.historialVentas;
    }
}

/**
 * Clase Administrador (Hereda de Usuario)
 * Gestiona la moderación de cuentas y productos.
 */
class Administrador extends Usuario {
    constructor(nombre, apellido, direccion, nickname, contrasena, datosBancarios = "") {
        super(nombre, apellido, direccion, nickname, contrasena, datosBancarios);
        this.rol = "Administrador";
    }

    // Elimina una cuenta de usuario por su nickname
    eliminarCuenta(nickname, listaUsuarios) {
        const indice = listaUsuarios.findIndex(u => u.nickname === nickname);
        if (indice !== -1) {
            listaUsuarios.splice(indice, 1);
            return { exito: true, mensaje: `Cuenta '${nickname}' eliminada.` };
        }
        return { exito: false, mensaje: "Usuario no encontrado." };
    }

    // Remueve un producto del catálogo del sistema
    removerProducto(idProducto, catalogo) {
        const indice = catalogo.findIndex(p => p.id === idProducto);
        if (indice !== -1) {
            catalogo.splice(indice, 1);
            return { exito: true, mensaje: "Producto removido del catálogo." };
        }
        return { exito: false, mensaje: "Producto no encontrado." };
    }
}


// ==========================================
// 2. MODELO DE PRODUCTO
// ==========================================

/**
 * Clase Producto
 * Representa los artículos que se venden en BinaryShop.
 */
class Producto {
    constructor(id, descripcion, imagen, precio, stock, vendedorNickname = "tienda") {
        this.id = id;
        this.descripcion = descripcion;
        this.imagen = imagen;
        this.precio = Number(precio);
        this.stock = Number(stock);
        this.vendedorNickname = vendedorNickname;
    }

    // Actualiza los valores del producto
    actualizar(nuevosDatos) {
        if (nuevosDatos.descripcion !== undefined) this.descripcion = nuevosDatos.descripcion;
        if (nuevosDatos.imagen !== undefined) this.imagen = nuevosDatos.imagen;
        if (nuevosDatos.precio !== undefined) this.precio = Number(nuevosDatos.precio);
        if (nuevosDatos.stock !== undefined) this.stock = Number(nuevosDatos.stock);
    }

    // Verifica si hay stock disponible para la cantidad solicitada
    estaDisponible(cantidad = 1) {
        return this.stock >= cantidad;
    }
}


// ==========================================
// 3. MODELOS DE COMPRA Y CARRITO
// ==========================================

/**
 * Clase ItemCarrito
 * Representa la línea de un producto dentro del carrito de compras.
 */
class ItemCarrito {
    constructor(producto, cantidad = 1) {
        this.producto = producto; // Referencia a la clase Producto
        this.cantidad = cantidad;
        this.subtotal = this.calcularSubtotal();
    }

    // Calcula el subtotal multiplicando precio por cantidad
    calcularSubtotal() {
        this.subtotal = Number((this.producto.precio * this.cantidad).toFixed(2));
        return this.subtotal;
    }
}

/**
 * Clase Carrito
 * Contiene los items seleccionados por el comprador y calcula el total.
 */
class Carrito {
    constructor() {
        this.items = []; // Lista de instancias de ItemCarrito
        this.total = 0;
    }

    // Agrega un producto o incrementa su cantidad si ya existe
    agregarItem(producto, cantidad = 1) {
        const itemExistente = this.items.find(i => i.producto.id === producto.id);
        if (itemExistente) {
            itemExistente.cantidad += cantidad;
            itemExistente.calcularSubtotal();
        } else {
            this.items.push(new ItemCarrito(producto, cantidad));
        }
        this.calcularTotal();
    }

    // Elimina un producto por su id del carrito
    eliminarItem(idProducto) {
        this.items = this.items.filter(i => i.producto.id !== idProducto);
        this.calcularTotal();
    }

    // Limpia todo el carrito
    vaciar() {
        this.items = [];
        this.total = 0;
    }

    // Suma los subtotales de todos los items
    calcularTotal() {
        this.total = Number(this.items.reduce((acc, item) => acc + item.calcularSubtotal(), 0).toFixed(2));
        return this.total;
    }
}

/**
 * Clase Compra
 * Registra una orden de compra generada por un comprador.
 */
class Compra {
    constructor(fecha, total, items = []) {
        this.id = "COMP-" + Date.now().toString().slice(-6);
        this.fecha = fecha || new Date().toLocaleString();
        this.total = Number(total);
        this.estado = "Pendiente"; // Pendiente, Confirmada, Cancelada
        this.items = items;
    }

    // Confirma la compra tras validación de pago
    confirmar() {
        this.estado = "Confirmada";
    }

    // Cancela la compra
    cancelar() {
        this.estado = "Cancelada";
    }
}

/**
 * Clase Venta
 * Registra la venta desde la perspectiva del vendedor.
 */
class Venta {
    constructor(fecha, monto, idProducto, descripcionProducto, compradorNickname, vendedorNickname) {
        this.id = "VENT-" + Date.now().toString().slice(-6);
        this.fecha = fecha || new Date().toLocaleString();
        this.monto = Number(monto);
        this.idProducto = idProducto;
        this.descripcionProducto = descripcionProducto;
        this.compradorNickname = compradorNickname;
        this.vendedorNickname = vendedorNickname;
    }
}


// ==========================================
// 4. MODELOS DE PAGO Y PASARELA
// ==========================================

/**
 * Clase PasarelaPago
 * Simula el servicio externo bancario de validación y autorización.
 */
class PasarelaPago {
    // Autoriza la transacción según datos bancarios y monto
    autorizar(monto, datosBancarios) {
        // Validación básica: los datos bancarios no deben estar vacíos
        // y simulamos que números de tarjeta que terminen en "0000" son rechazados para pruebas
        if (!datosBancarios || datosBancarios.trim() === "") {
            return false;
        }
        const limpio = datosBancarios.replace(/\s+/g, '');
        if (limpio.endsWith("0000")) {
            return false; // Permite probar el caso alternativo de Transacción Rechazada
        }
        return monto > 0;
    }
}

/**
 * Clase Pago
 * Modela el proceso de pago asociado a una compra.
 */
class Pago {
    constructor(monto, fecha) {
        this.id = "PAG-" + Date.now().toString().slice(-6);
        this.monto = Number(monto);
        this.fecha = fecha || new Date().toLocaleString();
        this.estado = "Pendiente"; // Pendiente, Exitoso, Rechazado
    }

    // Ejecuta la autorización mediante la pasarela de pagos
    procesar(datosBancarios, pasarela) {
        const autorizada = pasarela.autorizar(this.monto, datosBancarios);
        if (autorizada) {
            this.estado = "Exitoso";
            return true;
        } else {
            this.estado = "Rechazado";
            return false;
        }
    }
}
