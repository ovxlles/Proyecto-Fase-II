/**
 * app.js - Lógica Principal de la Interfaz y Controladores
 * 
 * Vincula el DOM con las clases del modelo (models.js) y los datos (data.js).
 */

// Objeto principal de la aplicación
const app = {
    usuarios: [],
    productos: [],
    ventas: [],
    usuarioActual: null,
    carritoActivo: new Carrito(),
    pasarelaPago: new PasarelaPago(),
    productoEnCheckout: null, // Para compras inmediatas individuales

    // Inicialización del sistema al cargar la página
    iniciar() {
        this.usuarios = cargarUsuarios();
        this.productos = cargarProductos();
        this.ventas = cargarVentas();

        // Recuperar sesión guardada si existe
        const sesionGuardada = localStorage.getItem(STORAGE_KEY_SESION);
        if (sesionGuardada) {
            try {
                const u = JSON.parse(sesionGuardada);
                const encontrado = this.usuarios.find(user => user.nickname === u.nickname);
                if (encontrado) {
                    this.usuarioActual = encontrado;
                    this.usuarioActual.sesionActiva = true;
                    if (this.usuarioActual.rol === "Comprador" && !this.usuarioActual.carrito) {
                        this.usuarioActual.carrito = new Carrito();
                    }
                }
            } catch (e) {
                console.error("Error al recuperar sesión:", e);
            }
        }

        this.actualizarInterfazUsuario();
        this.actualizarContadorCarrito();

        // Enrutar automáticamente a la vista correspondiente al rol del usuario
        if (this.usuarioActual && this.usuarioActual.rol === "Vendedor") {
            this.cambiarVista("vendedor");
        } else if (this.usuarioActual && this.usuarioActual.rol === "Administrador") {
            this.cambiarVista("admin");
        } else {
            this.cambiarVista("catalogo");
        }
    },

    // Actualiza la barra superior y navegación según el usuario conectado
    actualizarInterfazUsuario() {
        const authContainer = document.getElementById("auth-buttons-container");
        const userContainer = document.getElementById("user-info-container");
        const userBadge = document.getElementById("user-badge");
        const btnHabilitarVenta = document.getElementById("btn-habilitar-venta");
        const tabVendedor = document.getElementById("tab-vendedor");
        const tabAdmin = document.getElementById("tab-admin");
        const tabCatalogo = document.getElementById("tab-catalogo");
        const cartBtn = document.querySelector(".cart-btn");

        if (this.usuarioActual && this.usuarioActual.sesionActiva) {
            authContainer.classList.add("hidden");
            userContainer.classList.remove("hidden");

            userBadge.textContent = `${this.usuarioActual.nombre} ${this.usuarioActual.apellido} (${this.usuarioActual.rol})`;

            if (this.usuarioActual.rol === "Comprador") {
                // Rol Comprador: Carrito visible, opción de habilitar venta, solo ve catálogo
                btnHabilitarVenta.classList.remove("hidden");
                if (cartBtn) cartBtn.classList.remove("hidden");
                tabCatalogo.classList.remove("hidden");
                tabCatalogo.textContent = "Catálogo General";
                tabVendedor.classList.add("hidden");
                tabAdmin.classList.add("hidden");
            } else if (this.usuarioActual.rol === "Vendedor") {
                // Rol Vendedor: Oculta carrito y habilitar venta. Muestra Panel de Vendedor y Ver Catálogo
                btnHabilitarVenta.classList.add("hidden");
                if (cartBtn) cartBtn.classList.add("hidden");
                tabVendedor.classList.remove("hidden");
                tabVendedor.textContent = "Panel de Vendedor";
                tabCatalogo.classList.remove("hidden");
                tabCatalogo.textContent = "Ver Catálogo";
                tabAdmin.classList.add("hidden");
            } else if (this.usuarioActual.rol === "Administrador") {
                // Rol Administrador: Oculta carrito. Muestra Panel de Administración y Ver Catálogo
                btnHabilitarVenta.classList.add("hidden");
                if (cartBtn) cartBtn.classList.add("hidden");
                tabAdmin.classList.remove("hidden");
                tabAdmin.textContent = "Panel de Administración";
                tabCatalogo.classList.remove("hidden");
                tabCatalogo.textContent = "Ver Catálogo";
                tabVendedor.classList.add("hidden");
            }
        } else {
            // Usuario Invitado (Sin sesión activa)
            authContainer.classList.remove("hidden");
            userContainer.classList.add("hidden");
            btnHabilitarVenta.classList.add("hidden");
            if (cartBtn) cartBtn.classList.remove("hidden");
            tabCatalogo.classList.remove("hidden");
            tabCatalogo.textContent = "Catálogo General";
            tabVendedor.classList.add("hidden");
            tabAdmin.classList.add("hidden");
        }
    },

    // Cambia de pestaña / vista principal
    cambiarVista(vista) {
        const vistaCatalogo = document.getElementById("vista-catalogo");
        const vistaVendedor = document.getElementById("vista-vendedor");
        const vistaAdmin = document.getElementById("vista-admin");
        const heroBanner = document.getElementById("hero-banner");

        const tabCatalogo = document.getElementById("tab-catalogo");
        const tabVendedor = document.getElementById("tab-vendedor");
        const tabAdmin = document.getElementById("tab-admin");

        // Ocultar todas las vistas
        vistaCatalogo.classList.add("hidden");
        vistaVendedor.classList.add("hidden");
        vistaAdmin.classList.add("hidden");

        tabCatalogo.classList.remove("active");
        tabVendedor.classList.remove("active");
        tabAdmin.classList.remove("active");

        if (vista === "catalogo") {
            vistaCatalogo.classList.remove("hidden");
            tabCatalogo.classList.add("active");
            heroBanner.classList.remove("hidden");
            this.renderizarCatalogo();
        } else if (vista === "vendedor") {
            vistaVendedor.classList.remove("hidden");
            tabVendedor.classList.add("active");
            heroBanner.classList.add("hidden");
            this.renderizarPanelVendedor();
        } else if (vista === "admin") {
            vistaAdmin.classList.remove("hidden");
            tabAdmin.classList.add("active");
            heroBanner.classList.add("hidden");
            this.renderizarPanelAdmin();
        }
    },

    // Renderiza la lista de productos en el catálogo
    renderizarCatalogo(filtroTexto = "") {
        const contenedor = document.getElementById("contenedor-productos");
        const contador = document.getElementById("total-articulos-mostrados");
        contenedor.innerHTML = "";

        const texto = filtroTexto.toLowerCase().trim();
        const productosFiltrados = this.productos.filter(p => 
            p.descripcion.toLowerCase().includes(texto) || p.id.toLowerCase().includes(texto)
        );

        contador.textContent = productosFiltrados.length;

        if (productosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--color-text-muted);">
                    <h3>No se encontraron productos que coincidan con la búsqueda.</h3>
                    <p>Intenta con otra palabra clave o restablece los filtros.</p>
                </div>
            `;
            return;
        }

        productosFiltrados.forEach(prod => {
            const card = document.createElement("div");
            card.className = "product-card";

            const stockClass = prod.stock > 0 ? "" : "out";
            const stockTexto = prod.stock > 0 ? `Stock: ${prod.stock}` : "Agotado";

            card.innerHTML = `
                <div class="product-img-wrapper">
                    <img src="${prod.imagen}" alt="${prod.descripcion}" onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=60'">
                    <span class="stock-tag ${stockClass}">${stockTexto}</span>
                </div>
                <div class="product-info">
                    <span class="product-id">${prod.id}</span>
                    <h3 class="product-title" title="${prod.descripcion}">${prod.descripcion}</h3>
                    <div class="product-price-row">
                        <span class="product-price">$${prod.precio.toFixed(2)}</span>
                        <span class="product-seller">Por: ${prod.vendedorNickname}</span>
                    </div>
                    <div class="card-actions">
                        <button type="button" class="btn-card btn-card-cart" onclick="app.añadirAlCarrito('${prod.id}')" ${prod.stock <= 0 ? 'disabled' : ''}>
                            + Carrito
                        </button>
                        <button type="button" class="btn-card btn-card-buy" onclick="app.iniciarCompraInmediata('${prod.id}')" ${prod.stock <= 0 ? 'disabled' : ''}>
                            Comprar Ya
                        </button>
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        });
    },

    // Filtra productos al escribir en la barra de búsqueda
    filtrarProductos() {
        const input = document.getElementById("input-busqueda");
        this.renderizarCatalogo(input.value);
    },

    // Agrega un producto al carrito
    añadirAlCarrito(idProducto) {
        if (!this.usuarioActual) {
            this.mostrarNotificacion("Inicia sesión como Comprador para añadir artículos al carrito.", "error");
            this.abrirModalAuth("login");
            return;
        }
        if (this.usuarioActual.rol !== "Comprador") {
            this.mostrarNotificacion(`Tu cuenta tiene rol de ${this.usuarioActual.rol}. Solo los compradores pueden añadir al carrito.`, "error");
            return;
        }

        const prod = this.productos.find(p => p.id === idProducto);
        if (!prod || prod.stock <= 0) {
            this.mostrarNotificacion("Este artículo no tiene stock disponible.", "error");
            return;
        }

        const carrito = this.usuarioActual.carrito || this.carritoActivo;
        carrito.agregarItem(prod, 1);
        this.actualizarContadorCarrito();
        this.mostrarNotificacion(`"${prod.descripcion.slice(0, 25)}..." añadido al carrito.`, "success");
    },

    // Actualiza el número de productos en el badge del carrito
    actualizarContadorCarrito() {
        const badge = document.getElementById("cart-counter");
        const carrito = (this.usuarioActual && this.usuarioActual.rol === "Comprador") 
            ? this.usuarioActual.carrito 
            : this.carritoActivo;

        const totalArticulos = carrito.items.reduce((sum, item) => sum + item.cantidad, 0);
        badge.textContent = totalArticulos;
    },

    // Abre el modal del carrito de compras
    abrirModalCarrito() {
        const carrito = (this.usuarioActual && this.usuarioActual.rol === "Comprador") 
            ? this.usuarioActual.carrito 
            : this.carritoActivo;

        const listaContenedor = document.getElementById("carrito-items-lista");
        const totalSpan = document.getElementById("cart-total-monto");

        listaContenedor.innerHTML = "";

        if (carrito.items.length === 0) {
            listaContenedor.innerHTML = `
                <div style="text-align: center; padding: 30px; color: var(--color-text-muted);">
                    <p style="font-size: 1.1rem; margin-bottom: 8px;">Tu carrito está vacío</p>
                    <p style="font-size: 0.85rem;">Explora los artículos de BinaryShop y añade los que te gusten.</p>
                </div>
            `;
            totalSpan.textContent = "$0.00";
        } else {
            carrito.items.forEach(item => {
                const fila = document.createElement("div");
                fila.className = "cart-item-row";
                fila.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.producto.descripcion}</div>
                        <div class="cart-item-sub">$${item.producto.precio.toFixed(2)} c/u &bull; Subtotal: <strong>$${item.subtotal.toFixed(2)}</strong></div>
                    </div>
                    <div class="cart-qty-controls">
                        <button type="button" class="cart-qty-btn" onclick="app.modificarCantidadCarrito('${item.producto.id}', -1)">-</button>
                        <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.cantidad}</span>
                        <button type="button" class="cart-qty-btn" onclick="app.modificarCantidadCarrito('${item.producto.id}', 1)">+</button>
                        <button type="button" class="action-btn-danger" style="margin-left: 6px;" onclick="app.eliminarDelCarrito('${item.producto.id}')">&times;</button>
                    </div>
                `;
                listaContenedor.appendChild(fila);
            });
            totalSpan.textContent = `$${carrito.calcularTotal().toFixed(2)}`;
        }

        this.abrirModal("modal-carrito");
    },

    // Modifica cantidad de un item en el carrito
    modificarCantidadCarrito(idProducto, cambio) {
        const carrito = (this.usuarioActual && this.usuarioActual.rol === "Comprador") 
            ? this.usuarioActual.carrito 
            : this.carritoActivo;

        const item = carrito.items.find(i => i.producto.id === idProducto);
        if (!item) return;

        const nuevaCantidad = item.cantidad + cambio;
        if (nuevaCantidad <= 0) {
            carrito.eliminarItem(idProducto);
        } else {
            if (nuevaCantidad > item.producto.stock) {
                this.mostrarNotificacion("No puedes superar el stock disponible.", "error");
                return;
            }
            item.cantidad = nuevaCantidad;
            item.calcularSubtotal();
            carrito.calcularTotal();
        }

        this.actualizarContadorCarrito();
        this.abrirModalCarrito(); // Refresca la vista del modal
    },

    // Elimina un item del carrito
    eliminarDelCarrito(idProducto) {
        const carrito = (this.usuarioActual && this.usuarioActual.rol === "Comprador") 
            ? this.usuarioActual.carrito 
            : this.carritoActivo;

        carrito.eliminarItem(idProducto);
        this.actualizarContadorCarrito();
        this.abrirModalCarrito();
        this.mostrarNotificacion("Artículo eliminado del carrito.", "info");
    },

    // Vacía todos los items del carrito
    vaciarCarrito() {
        const carrito = (this.usuarioActual && this.usuarioActual.rol === "Comprador") 
            ? this.usuarioActual.carrito 
            : this.carritoActivo;

        carrito.vaciar();
        this.actualizarContadorCarrito();
        this.abrirModalCarrito();
        this.mostrarNotificacion("Carrito vaciado correctamente.", "info");
    },

    // Inicia el proceso de checkout desde el carrito completo
    iniciarCheckoutCarrito() {
        const carrito = (this.usuarioActual && this.usuarioActual.rol === "Comprador") 
            ? this.usuarioActual.carrito 
            : this.carritoActivo;

        if (carrito.items.length === 0) {
            this.mostrarNotificacion("El carrito está vacío.", "error");
            return;
        }

        this.cerrarModal("modal-carrito");

        // Creamos un producto consolidado temporal para procesar la compra mediante el mismo flujo
        const resumenDesc = carrito.items.map(i => `${i.cantidad}x ${i.producto.descripcion.slice(0, 20)}...`).join(", ");
        this.productoEnCheckout = {
            id: "CARRITO-BUNDLE",
            descripcion: `Compra de Carrito: ${resumenDesc}`,
            precio: carrito.calcularTotal(),
            cantidad: 1,
            esCarrito: true,
            itemsOriginales: [...carrito.items]
        };

        this.mostrarModalCheckout();
    },

    // =========================================================================
    // PROCESAMIENTO DE COMPRAS Y PAGOS
    // =========================================================================

    // Inicia el proceso de compra directa
    iniciarCompraInmediata(idProducto) {
        if (!this.usuarioActual) {
            this.mostrarNotificacion("Inicia sesión como Comprador para realizar una compra inmediata.", "error");
            this.abrirModalAuth("login");
            return;
        }
        if (this.usuarioActual.rol !== "Comprador") {
            this.mostrarNotificacion(`Tu cuenta tiene rol de ${this.usuarioActual.rol}. Solo los compradores pueden comprar artículos.`, "error");
            return;
        }

        const prod = this.productos.find(p => p.id === idProducto);
        if (!prod || prod.stock <= 0) {
            this.mostrarNotificacion("El producto no está disponible.", "error");
            return;
        }

        this.productoEnCheckout = {
            id: prod.id,
            descripcion: prod.descripcion,
            precio: prod.precio,
            cantidad: 1,
            esCarrito: false,
            vendedorNickname: prod.vendedorNickname
        };

        // Muestra el formulario de pago
        this.mostrarModalCheckout();
    },

    // Muestra el modal de confirmación con datos bancarios
    mostrarModalCheckout() {
        const contenedorResumen = document.getElementById("checkout-resumen-producto");
        const inputBancario = document.getElementById("checkout-datos-bancarios");

        const prod = this.productoEnCheckout;
        contenedorResumen.innerHTML = `
            <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 4px;">${prod.descripcion}</div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--color-secondary);">
                <span>Cantidad: <strong>${prod.cantidad}</strong></span>
                <span>Total a Pagar: <strong style="color: var(--color-primary); font-size: 1.1rem;">$${prod.precio.toFixed(2)}</strong></span>
            </div>
        `;

        // Prellenar con los datos bancarios del usuario si ha iniciado sesión
        if (this.usuarioActual && this.usuarioActual.datosBancarios) {
            inputBancario.value = this.usuarioActual.datosBancarios;
        } else {
            inputBancario.value = "";
        }

        this.abrirModal("modal-checkout");
    },

    // Confirma y procesa el pago del pedido
    confirmarPagoInmediato(event) {
        event.preventDefault();
        const inputBancario = document.getElementById("checkout-datos-bancarios");
        const datosBancarios = inputBancario.value.trim();

        if (!datosBancarios) {
            this.mostrarNotificacion("Por favor ingrese los datos bancarios.", "error");
            return;
        }

        const nickComprador = this.usuarioActual ? this.usuarioActual.nickname : "Invitado";

        if (this.productoEnCheckout.esCarrito) {
            this.procesarCompraLoteCarrito(datosBancarios, nickComprador);
        } else {
            const resultado = ControladorCompra.procesarCompra(
                this.productoEnCheckout.id,
                this.productoEnCheckout.cantidad,
                datosBancarios,
                nickComprador
            );

            this.cerrarModal("modal-checkout");

            if (resultado.exito) {
                // Muestra comprobante de compra
                this.mostrarReciboCompra(resultado.compra, resultado.pago, [
                    { descripcion: resultado.producto.descripcion, cantidad: resultado.cantidad, subtotal: resultado.compra.total }
                ]);
                this.renderizarCatalogo();
                this.mostrarNotificacion("¡Compra completada con éxito!", "success");
            } else {
                this.mostrarNotificacion(resultado.mensaje, "error");
            }
        }
    },

    // Procesa la compra de los artículos acumulados en el carrito
    procesarCompraLoteCarrito(datosBancarios, nickComprador) {
        const carrito = (this.usuarioActual && this.usuarioActual.rol === "Comprador") 
            ? this.usuarioActual.carrito 
            : this.carritoActivo;

        const total = carrito.calcularTotal();
        const fecha = new Date().toLocaleString();

        const nuevoPago = new Pago(total, fecha);
        const autorizado = nuevoPago.procesar(datosBancarios, this.pasarelaPago);

        this.cerrarModal("modal-checkout");

        if (autorizado) {
            // Confirmar y descontar stock de cada producto
            const itemsRecibo = [];
            carrito.items.forEach(item => {
                item.producto.stock -= item.cantidad;
                itemsRecibo.push({
                    descripcion: item.producto.descripcion,
                    cantidad: item.cantidad,
                    subtotal: item.subtotal
                });

                // Registrar venta para los vendedores
                const nuevaVenta = new Venta(
                    fecha,
                    item.subtotal,
                    item.producto.id,
                    item.producto.descripcion,
                    nickComprador,
                    item.producto.vendedorNickname
                );
                this.ventas.unshift(nuevaVenta);
            });

            guardarProductos(this.productos);
            guardarVentas(this.ventas);

            const nuevaCompra = new Compra(fecha, total, itemsRecibo);
            nuevaCompra.confirmar();

            carrito.vaciar();
            this.actualizarContadorCarrito();
            this.renderizarCatalogo();

            // Muestra comprobante de compra
            this.mostrarReciboCompra(nuevaCompra, nuevoPago, itemsRecibo);
            this.mostrarNotificacion("¡Compra del carrito exitosa!", "success");
        } else {
            this.mostrarNotificacion("Pago rechazado por la pasarela bancaria. Comprueba tus datos e intenta nuevamente.", "error");
        }
    },

    // Genera y muestra el comprobante formal de compra
    mostrarReciboCompra(compra, pago, items) {
        const contenedor = document.getElementById("recibo-contenido");
        const compradorNombre = this.usuarioActual ? `${this.usuarioActual.nombre} ${this.usuarioActual.apellido}` : "Cliente Invitado";

        let filasItemsHtml = "";
        items.forEach(item => {
            filasItemsHtml += `
                <div class="receipt-row">
                    <span>${item.cantidad}x ${item.descripcion.slice(0, 30)}</span>
                    <span>$${item.subtotal.toFixed(2)}</span>
                </div>
            `;
        });

        contenedor.innerHTML = `
            <div class="receipt-header">
                <span class="receipt-badge">ESTADO: ${compra.estado.toUpperCase()}</span>
                <h4 style="margin: 4px 0; font-size: 1.1rem;">Comprobante de Transacción</h4>
                <div style="font-size: 0.8rem; color: var(--color-text-muted);">BinaryShop S.A. &bull; RIF J-20261022-1</div>
            </div>
            <div class="receipt-row">
                <span style="color: var(--color-text-muted);">Nº de Compra:</span>
                <strong>${compra.id}</strong>
            </div>
            <div class="receipt-row">
                <span style="color: var(--color-text-muted);">Nº de Autorización de Pago:</span>
                <strong>${pago.id}</strong>
            </div>
            <div class="receipt-row">
                <span style="color: var(--color-text-muted);">Fecha y Hora:</span>
                <span>${compra.fecha}</span>
            </div>
            <div class="receipt-row">
                <span style="color: var(--color-text-muted);">Cliente:</span>
                <span>${compradorNombre}</span>
            </div>
            <div style="border-top: 1px dashed var(--color-border); margin: 12px 0; padding-top: 8px;">
                <div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 6px;">Detalle de Artículos:</div>
                ${filasItemsHtml}
            </div>
            <div class="receipt-row bold">
                <span>TOTAL PAGADO:</span>
                <span style="color: var(--color-primary);">$${compra.total.toFixed(2)} USD</span>
            </div>
        `;

        this.abrirModal("modal-recibo");
    },

    // =========================================================================
    // PANEL DE VENDEDOR
    // =========================================================================

    // Renderiza el panel de ventas y productos del vendedor
    renderizarPanelVendedor() {
        // 1. Renderizar los artículos publicados por el vendedor
        const tablaProds = document.getElementById("tabla-vendedor-productos-body");
        if (tablaProds) {
            tablaProds.innerHTML = "";
            const misProductos = (this.usuarioActual && this.usuarioActual.rol === "Vendedor")
                ? this.productos.filter(p => p.vendedorNickname === this.usuarioActual.nickname)
                : this.productos;

            if (misProductos.length === 0) {
                tablaProds.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 18px;">
                            No has publicado ningún producto aún. Usa el formulario superior para añadir artículos.
                        </td>
                    </tr>
                `;
            } else {
                misProductos.forEach(p => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td><strong>${p.id}</strong></td>
                        <td>${p.descripcion}</td>
                        <td>$${p.precio.toFixed(2)}</td>
                        <td>${p.stock}</td>
                        <td><span class="badge-tag" style="background:${p.stock > 0 ? '#dcfce7; color:#166534' : '#fee2e2; color:#991b1b'};">${p.stock > 0 ? 'Disponible' : 'Agotado'}</span></td>
                    `;
                    tablaProds.appendChild(tr);
                });
            }
        }

        // 2. Renderizar historial de ventas
        const tablaBody = document.getElementById("tabla-ventas-body");
        tablaBody.innerHTML = "";

        const misVentas = (this.usuarioActual && this.usuarioActual.rol === "Vendedor")
            ? this.ventas.filter(v => v.vendedorNickname === this.usuarioActual.nickname)
            : this.ventas;

        if (misVentas.length === 0) {
            tablaBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 24px;">
                        No hay ventas registradas aún.
                    </td>
                </tr>
            `;
            return;
        }

        misVentas.forEach(venta => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${venta.id}</strong></td>
                <td>${venta.fecha}</td>
                <td>${venta.descripcionProducto}</td>
                <td>${venta.compradorNickname}</td>
                <td style="color: var(--color-accent); font-weight: 700;">$${venta.monto.toFixed(2)}</td>
            `;
            tablaBody.appendChild(tr);
        });
    },

    // Publicación de un nuevo producto por parte del vendedor
    manejadorPublicarProducto(event) {
        event.preventDefault();
        const desc = document.getElementById("prod-desc").value.trim();
        const precio = parseFloat(document.getElementById("prod-precio").value);
        const stock = parseInt(document.getElementById("prod-stock").value);
        const imagen = document.getElementById("prod-imagen").value.trim();

        if (!desc || isNaN(precio) || isNaN(stock) || !imagen) {
            this.mostrarNotificacion("Por favor completa todos los campos del producto.", "error");
            return;
        }

        const nickVendedor = (this.usuarioActual && this.usuarioActual.rol === "Vendedor")
            ? this.usuarioActual.nickname
            : "vendedor";

        const nuevoId = "PROD-" + (this.productos.length + 1).toString().padStart(3, '0');
        const nuevoProd = new Producto(nuevoId, desc, imagen, precio, stock, nickVendedor);

        this.productos.unshift(nuevoProd);
        guardarProductos(this.productos);

        document.getElementById("form-publicar-producto").reset();
        this.mostrarNotificacion(`Producto "${nuevoProd.id}" publicado exitosamente.`, "success");
        this.renderizarPanelVendedor();
        this.renderizarCatalogo();
    },

    // =========================================================================
    // PANEL DE ADMINISTRADOR
    // =========================================================================

    // Renderiza las tablas de moderación de usuarios y productos
    renderizarPanelAdmin() {
        const tablaUsuarios = document.getElementById("tabla-usuarios-body");
        const tablaProductos = document.getElementById("tabla-admin-productos-body");

        tablaUsuarios.innerHTML = "";
        tablaProductos.innerHTML = "";

        // 1. Lista de Usuarios
        this.usuarios.forEach(u => {
            const tr = document.createElement("tr");
            const esMismoAdmin = this.usuarioActual && this.usuarioActual.nickname === u.nickname;
            
            tr.innerHTML = `
                <td>${u.nombre} ${u.apellido}</td>
                <td><strong>${u.nickname}</strong></td>
                <td>${u.direccion}</td>
                <td><span class="badge-tag" style="background:#e2e8f0; color:#0f172a;">${u.rol}</span></td>
                <td>
                    ${esMismoAdmin ? '<small style="color:var(--color-text-muted);">Sesión Actual</small>' : 
                    `<button type="button" class="action-btn-danger" onclick="app.eliminarUsuarioAdmin('${u.nickname}')">Eliminar Cuenta</button>`}
                </td>
            `;
            tablaUsuarios.appendChild(tr);
        });

        // 2. Lista de Productos para remover
        this.productos.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${p.id}</strong></td>
                <td>${p.descripcion}</td>
                <td>$${p.precio.toFixed(2)}</td>
                <td>${p.stock}</td>
                <td>${p.vendedorNickname}</td>
                <td>
                    <button type="button" class="action-btn-danger" onclick="app.removerProductoAdmin('${p.id}')">Remover</button>
                </td>
            `;
            tablaProductos.appendChild(tr);
        });
    },

    // Administrador elimina cuenta de usuario
    eliminarUsuarioAdmin(nickname) {
        if (confirm(`¿Estás seguro de que deseas eliminar la cuenta de "${nickname}"?`)) {
            const admin = new Administrador("Admin", "General", "Sede", "admin", "admin");
            const res = admin.eliminarCuenta(nickname, this.usuarios);
            if (res.exito) {
                guardarUsuarios(this.usuarios);
                this.renderizarPanelAdmin();
                this.mostrarNotificacion(res.mensaje, "success");
            } else {
                this.mostrarNotificacion(res.mensaje, "error");
            }
        }
    },

    // Administrador remueve producto del catálogo
    removerProductoAdmin(idProducto) {
        if (confirm(`¿Remover el producto ${idProducto} del catálogo?`)) {
            const admin = new Administrador("Admin", "General", "Sede", "admin", "admin");
            const res = admin.removerProducto(idProducto, this.productos);
            if (res.exito) {
                guardarProductos(this.productos);
                this.renderizarPanelAdmin();
                this.renderizarCatalogo();
                this.mostrarNotificacion(res.mensaje, "success");
            } else {
                this.mostrarNotificacion(res.mensaje, "error");
            }
        }
    },

    // =========================================================================
    // AUTENTICACIÓN (LOGIN, REGISTRO Y HABILITAR OPCIONES DE VENTA)
    // =========================================================================

    abrirModalAuth(subtab = "login") {
        this.cambiarSubtabAuth(subtab);
        this.abrirModal("modal-auth");
    },

    cambiarSubtabAuth(subtab) {
        const btnLogin = document.getElementById("auth-subtab-login");
        const btnReg = document.getElementById("auth-subtab-registro");
        const formLogin = document.getElementById("form-login");
        const formReg = document.getElementById("form-registro");
        const title = document.getElementById("modal-auth-title");

        if (subtab === "login") {
            btnLogin.className = "nav-btn nav-btn-primary";
            btnReg.className = "nav-btn";
            formLogin.classList.remove("hidden");
            formReg.classList.add("hidden");
            title.textContent = "Iniciar Sesión";
        } else {
            btnLogin.className = "nav-btn";
            btnReg.className = "nav-btn nav-btn-primary";
            formLogin.classList.add("hidden");
            formReg.classList.remove("hidden");
            title.textContent = "Crear Cuenta Nueva";
        }
    },

    // Acceso rápido con credenciales predefinidas
    autocompletarLogin(nickname, contrasena) {
        this.abrirModalAuth("login");
        document.getElementById("login-nickname").value = nickname;
        document.getElementById("login-password").value = contrasena;

        const rolSelect = document.getElementById("login-rol");
        if (nickname === "comprador") rolSelect.value = "Comprador";
        if (nickname === "vendedor") rolSelect.value = "Vendedor";
        if (nickname === "admin") rolSelect.value = "Administrador";
    },

    // Maneja el envío del formulario de login
    manejadorLogin(event) {
        event.preventDefault();
        const nickname = document.getElementById("login-nickname").value.trim();
        const password = document.getElementById("login-password").value.trim();
        const rolSeleccionado = document.getElementById("login-rol").value;

        const usuario = this.usuarios.find(u => u.nickname === nickname);

        if (!usuario) {
            this.mostrarNotificacion("El usuario no existe.", "error");
            return;
        }

        if (usuario.iniciarSesion(nickname, password)) {
            if (usuario.rol !== rolSeleccionado) {
                this.mostrarNotificacion(`El rol seleccionado no coincide con la cuenta. Tu rol registrado es: ${usuario.rol}`, "error");
                return;
            }

            this.usuarioActual = usuario;
            localStorage.setItem(STORAGE_KEY_SESION, JSON.stringify(usuario));

            this.cerrarModal("modal-auth");
            this.actualizarInterfazUsuario();
            this.mostrarNotificacion(`¡Bienvenido de nuevo, ${usuario.nombre}!`, "success");

            // Redireccionar al panel correspondiente
            if (usuario.rol === "Vendedor") {
                this.cambiarVista("vendedor");
            } else if (usuario.rol === "Administrador") {
                this.cambiarVista("admin");
            } else {
                this.cambiarVista("catalogo");
            }
        } else {
            this.mostrarNotificacion("Contraseña incorrecta.", "error");
        }
    },

    // Maneja el registro de nuevos usuarios
    manejadorRegistro(event) {
        event.preventDefault();
        const nombre = document.getElementById("reg-nombre").value.trim();
        const apellido = document.getElementById("reg-apellido").value.trim();
        const direccion = document.getElementById("reg-direccion").value.trim();
        const nickname = document.getElementById("reg-nickname").value.trim();
        const contrasena = document.getElementById("reg-password").value.trim();
        const datosBancarios = document.getElementById("reg-bancarios").value.trim();
        const rol = document.getElementById("reg-rol").value;

        let nuevoUsuario;
        if (rol === "Comprador") {
            nuevoUsuario = new Comprador(nombre, apellido, direccion, nickname, contrasena, datosBancarios);
        } else {
            nuevoUsuario = new Vendedor(nombre, apellido, direccion, nickname, contrasena, datosBancarios);
        }

        const res = nuevoUsuario.registrarse(this.usuarios);

        if (res.exito) {
            guardarUsuarios(this.usuarios);
            this.mostrarNotificacion("¡Registro completado! Ahora puedes iniciar sesión.", "success");
            this.cambiarSubtabAuth("login");
            document.getElementById("login-nickname").value = nickname;
            document.getElementById("login-password").value = contrasena;
            document.getElementById("login-rol").value = rol;
        } else {
            this.mostrarNotificacion(res.mensaje, "error");
        }
    },

    // Caso de uso: Habilitar opciones de venta para un comprador existente
    abrirModalHabilitarVenta() {
        if (!this.usuarioActual || this.usuarioActual.rol !== "Comprador") return;
        const input = document.getElementById("upgrade-bancarios");
        input.value = this.usuarioActual.datosBancarios || "";
        this.abrirModal("modal-habilitar-venta");
    },

    confirmarHabilitarVenta() {
        if (!this.usuarioActual) return;
        const nuevosBancarios = document.getElementById("upgrade-bancarios").value.trim();
        if (!nuevosBancarios) {
            this.mostrarNotificacion("Debes ingresar datos bancarios para habilitar ventas.", "error");
            return;
        }

        // Transformar al usuario en Vendedor manteniendo sus datos
        const index = this.usuarios.findIndex(u => u.nickname === this.usuarioActual.nickname);
        if (index !== -1) {
            const vendedorNuevo = new Vendedor(
                this.usuarioActual.nombre,
                this.usuarioActual.apellido,
                this.usuarioActual.direccion,
                this.usuarioActual.nickname,
                this.usuarioActual.contrasena,
                nuevosBancarios
            );
            vendedorNuevo.sesionActiva = true;
            this.usuarios[index] = vendedorNuevo;
            this.usuarioActual = vendedorNuevo;

            guardarUsuarios(this.usuarios);
            localStorage.setItem(STORAGE_KEY_SESION, JSON.stringify(vendedorNuevo));

            this.cerrarModal("modal-habilitar-venta");
            this.actualizarInterfazUsuario();
            this.cambiarVista("vendedor");
            this.mostrarNotificacion("¡Opciones de venta habilitadas con éxito! Ahora tienes acceso al Panel de Vendedor.", "success");
        }
    },

    // Cierra la sesión activa
    cerrarSesion() {
        if (this.usuarioActual) {
            this.usuarioActual.cerrarSesion();
        }
        this.usuarioActual = null;
        localStorage.removeItem(STORAGE_KEY_SESION);
        this.actualizarInterfazUsuario();
        this.cambiarVista("catalogo");
        this.mostrarNotificacion("Sesión cerrada correctamente.", "info");
    },

    // =========================================================================
    // UTILIDADES DE INTERFAZ (MODALES Y NOTIFICACIONES)
    // =========================================================================

    abrirModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add("active");
    },

    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove("active");
    },

    mostrarNotificacion(mensaje, tipo = "info") {
        const contenedor = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = `toast ${tipo}`;

        toast.innerHTML = `<span>${mensaje}</span>`;
        contenedor.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(10px)";
            toast.style.transition = "all 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
};

// =============================================================================
// CONTROLADOR DE COMPRAS
// =============================================================================
const ControladorCompra = {
    // Procesa la transacción y valida la existencia del producto
    procesarCompra(idProducto, cantidad, datosBancarios, compradorNickname) {
        const producto = app.productos.find(p => p.id === idProducto);
        if (!producto || !producto.estaDisponible(cantidad)) {
            return { exito: false, mensaje: "Producto no disponible o sin stock suficiente." };
        }

        const monto = Number((producto.precio * cantidad).toFixed(2));
        const fecha = new Date().toLocaleString();

        const pago = new Pago(monto, fecha);
        const autorizado = pago.procesar(datosBancarios, app.pasarelaPago);

        if (autorizado) {
            producto.stock -= cantidad;
            guardarProductos(app.productos);

            const compra = new Compra(fecha, monto, [{ producto, cantidad, subtotal: monto }]);
            compra.confirmar();

            // Registro de la venta para el vendedor
            const venta = new Venta(
                fecha,
                monto,
                producto.id,
                producto.descripcion,
                compradorNickname,
                producto.vendedorNickname
            );
            app.ventas.unshift(venta);
            guardarVentas(app.ventas);

            return {
                exito: true,
                compra: compra,
                pago: pago,
                producto: producto,
                cantidad: cantidad
            };
        } else {
            return {
                exito: false,
                mensaje: "Transacción rechazada por la pasarela de pagos. Por favor verifica tus datos e intenta nuevamente."
            };
        }
    }
};

// Inicialización automática cuando el documento HTML está listo
document.addEventListener("DOMContentLoaded", () => {
    app.iniciar();
});
