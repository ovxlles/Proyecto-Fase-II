/**
 * data.js - Datos Iniciales y Persistencia
 * 
 * Contiene los usuarios iniciales y productos precargados del sistema.
 * Utiliza localStorage del navegador para persistencia de datos.
 */

// Clave para guardar en el navegador
const STORAGE_KEY_USUARIOS = "binaryshop_usuarios";
const STORAGE_KEY_PRODUCTOS = "binaryshop_productos";
const STORAGE_KEY_HISTORIAL_VENTAS = "binaryshop_ventas";
const STORAGE_KEY_SESION = "binaryshop_sesion_activa";

// 1. Usuarios predefinidos (Credenciales de prueba)
const USUARIOS_INICIALES = [
    {
        nombre: "Carlos",
        apellido: "Pérez",
        direccion: "Av. Universidad, Edif. A, Apto 4",
        nickname: "comprador",
        contrasena: "123",
        datosBancarios: "4532 8901 2345 6789",
        rol: "Comprador"
    },
    {
        nombre: "María",
        apellido: "Gómez",
        direccion: "Calle Comercio, Local 12",
        nickname: "vendedor",
        contrasena: "123",
        datosBancarios: "0102 4455 6677 8899",
        rol: "Vendedor"
    },
    {
        nombre: "Admin",
        apellido: "Principal",
        direccion: "Oficinas Centrales BinaryShop",
        nickname: "admin",
        contrasena: "admin",
        datosBancarios: "0000 0000 0000 0000",
        rol: "Administrador"
    }
];

// 2. Productos iniciales para el catálogo de computación y tecnología
const PRODUCTOS_INICIALES = [
    {
        id: "PROD-001",
        descripcion: "Laptop Gamer Asus ROG 16GB RAM 512GB SSD RTX 4060",
        imagen: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=60",
        precio: 1199.99,
        stock: 5,
        vendedorNickname: "vendedor"
    },
    {
        id: "PROD-002",
        descripcion: "Teclado Mecánico RGB Switch Red con teclas PBT",
        imagen: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60",
        precio: 59.50,
        stock: 12,
        vendedorNickname: "vendedor"
    },
    {
        id: "PROD-003",
        descripcion: "Mouse Inalámbrico Ergonómico 16000 DPI con Sensor Óptico",
        imagen: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60",
        precio: 34.90,
        stock: 8,
        vendedorNickname: "vendedor"
    },
    {
        id: "PROD-004",
        descripcion: "Monitor UltraWide 29 Pulgadas IPS FHD 75Hz",
        imagen: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60",
        precio: 249.00,
        stock: 4,
        vendedorNickname: "vendedor"
    },
    {
        id: "PROD-005",
        descripcion: "Auriculares Inalámbricos con Cancelación Activa de Ruido",
        imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
        precio: 89.99,
        stock: 10,
        vendedorNickname: "vendedor"
    },
    {
        id: "PROD-006",
        descripcion: "Memoria RAM 16GB DDR4 3200MHz RGB",
        imagen: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&auto=format&fit=crop&q=60",
        precio: 45.00,
        stock: 15,
        vendedorNickname: "vendedor"
    }
];

// 3. Ventas iniciales simuladas para mostrar en el historial del vendedor
const VENTAS_INICIALES = [
    {
        id: "VENT-10001",
        fecha: "20/10/2026, 10:15:00 AM",
        monto: 59.50,
        idProducto: "PROD-002",
        descripcionProducto: "Teclado Mecánico RGB Switch Red con teclas PBT",
        compradorNickname: "carlos_cliente",
        vendedorNickname: "vendedor"
    },
    {
        id: "VENT-10002",
        fecha: "21/10/2026, 03:40:00 PM",
        monto: 34.90,
        idProducto: "PROD-003",
        descripcionProducto: "Mouse Inalámbrico Ergonómico 16000 DPI con Sensor Óptico",
        compradorNickname: "comprador",
        vendedorNickname: "vendedor"
    }
];

// Funciones auxiliares para cargar y guardar en localStorage

function cargarUsuarios() {
    const data = localStorage.getItem(STORAGE_KEY_USUARIOS);
    if (!data) {
        guardarUsuarios(USUARIOS_INICIALES);
        return USUARIOS_INICIALES.map(instanciarUsuario);
    }
    try {
        const parsed = JSON.parse(data);
        return parsed.map(instanciarUsuario);
    } catch (e) {
        return USUARIOS_INICIALES.map(instanciarUsuario);
    }
}

function guardarUsuarios(usuarios) {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(usuarios));
}

function cargarProductos() {
    const data = localStorage.getItem(STORAGE_KEY_PRODUCTOS);
    if (!data) {
        guardarProductos(PRODUCTOS_INICIALES);
        return PRODUCTOS_INICIALES.map(p => new Producto(p.id, p.descripcion, p.imagen, p.precio, p.stock, p.vendedorNickname));
    }
    try {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            guardarProductos(PRODUCTOS_INICIALES);
            return PRODUCTOS_INICIALES.map(p => new Producto(p.id, p.descripcion, p.imagen, p.precio, p.stock, p.vendedorNickname));
        }
        return parsed.map(p => new Producto(p.id, p.descripcion, p.imagen, p.precio, p.stock, p.vendedorNickname));
    } catch (e) {
        return PRODUCTOS_INICIALES.map(p => new Producto(p.id, p.descripcion, p.imagen, p.precio, p.stock, p.vendedorNickname));
    }
}

function guardarProductos(productos) {
    localStorage.setItem(STORAGE_KEY_PRODUCTOS, JSON.stringify(productos));
}

function cargarVentas() {
    const data = localStorage.getItem(STORAGE_KEY_HISTORIAL_VENTAS);
    if (!data) {
        guardarVentas(VENTAS_INICIALES);
        return VENTAS_INICIALES.map(v => new Venta(v.fecha, v.monto, v.idProducto, v.descripcionProducto, v.compradorNickname, v.vendedorNickname));
    }
    try {
        const parsed = JSON.parse(data);
        return parsed.map(v => new Venta(v.fecha, v.monto, v.idProducto, v.descripcionProducto, v.compradorNickname, v.vendedorNickname));
    } catch (e) {
        return VENTAS_INICIALES.map(v => new Venta(v.fecha, v.monto, v.idProducto, v.descripcionProducto, v.compradorNickname, v.vendedorNickname));
    }
}

function guardarVentas(ventas) {
    localStorage.setItem(STORAGE_KEY_HISTORIAL_VENTAS, JSON.stringify(ventas));
}

// Convierte un objeto plano guardado en una instancia de la clase correspondiente
function instanciarUsuario(u) {
    let obj;
    if (u.rol === "Comprador") {
        obj = new Comprador(u.nombre, u.apellido, u.direccion, u.nickname, u.contrasena, u.datosBancarios);
    } else if (u.rol === "Vendedor") {
        obj = new Vendedor(u.nombre, u.apellido, u.direccion, u.nickname, u.contrasena, u.datosBancarios);
    } else if (u.rol === "Administrador") {
        obj = new Administrador(u.nombre, u.apellido, u.direccion, u.nickname, u.contrasena, u.datosBancarios);
    } else {
        obj = new Usuario(u.nombre, u.apellido, u.direccion, u.nickname, u.contrasena, u.datosBancarios);
    }
    return obj;
}

// Restablece el catálogo y usuarios al estado por defecto
function restablecerDatos() {
    localStorage.removeItem(STORAGE_KEY_USUARIOS);
    localStorage.removeItem(STORAGE_KEY_PRODUCTOS);
    localStorage.removeItem(STORAGE_KEY_HISTORIAL_VENTAS);
    localStorage.removeItem(STORAGE_KEY_SESION);
    window.location.reload();
}
