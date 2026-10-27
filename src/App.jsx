import { useEffect, useMemo, useState } from 'react';
import {
  Wrench, Gauge, ShieldCheck, Clock3, ShoppingCart, Menu, X, Search,
  Plus, Minus, Trash2, ArrowUpRight, PlayCircle, Phone, MapPin, CheckCircle2,
  Package, ClipboardList, Pencil, Save, AlertCircle, CarFront, Settings2
} from 'lucide-react';

const money = (n) => new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(Number(n || 0));
const fallbackImage = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80';

const videos = [
  { title: 'Cuidado y mantenimiento del motor', tag: 'CONSEJO DEL TALLER', search: 'anuncio mantenimiento automotriz taller mecánico' },
  { title: 'Frenos: seguridad en cada viaje', tag: 'SEGURIDAD', search: 'video promocional servicio de frenos automotriz' },
  { title: 'Conoce nuestro taller', tag: 'AUTOFORCE GARAGE', search: 'tour taller mecánico automotriz profesional' }
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('autoforce-orders') || '[]'); } catch { return []; }
  });
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('autoforce-cart') || '[]'); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [notice, setNotice] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');
  const [activeTab, setActiveTab] = useState('productos');
  const [showAdmin, setShowAdmin] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState({ nombre:'', categoria:'Repuestos', descripcion:'', precio:'', stock:'', imagen:'', destacado:false });
  const [checkout, setCheckout] = useState({ cliente:'', telefono:'', correo:'' });
  const [submitting, setSubmitting] = useState(false);

  const defaultProducts = [
    { id: 1, nombre: 'Aceite sintético 5W-30', categoria: 'Lubricantes', descripcion: 'Protección avanzada para el motor.', precio: 28.50, stock: 12, imagen: 'https://images.unsplash.com/photo-1635784063385-3b4a4f5c4a25?auto=format&fit=crop&w=900&q=80', destacado: 1 },
    { id: 2, nombre: 'Pastillas de freno', categoria: 'Frenos', descripcion: 'Juego de pastillas para frenado confiable.', precio: 32.00, stock: 8, imagen: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80', destacado: 1 },
    { id: 3, nombre: 'Filtro de aceite', categoria: 'Filtros', descripcion: 'Filtración eficiente para tu vehículo.', precio: 9.75, stock: 20, imagen: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80', destacado: 0 },
    { id: 4, nombre: 'Batería automotriz', categoria: 'Electricidad', descripcion: 'Energía confiable para el arranque.', precio: 85.00, stock: 5, imagen: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80', destacado: 1 },
    { id: 5, nombre: 'Bujías de encendido', categoria: 'Motor', descripcion: 'Rendimiento estable y eficiente.', precio: 18.00, stock: 15, imagen: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80', destacado: 0 },
    { id: 6, nombre: 'Refrigerante', categoria: 'Lubricantes', descripcion: 'Ayuda a mantener la temperatura adecuada.', precio: 12.50, stock: 10, imagen: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80', destacado: 0 }
  ];
  const defaultServices = [
    { id: 1, nombre: 'Diagnóstico computarizado', descripcion: 'Detectamos fallas electrónicas con precisión.', precio_desde: 25, duracion: '45–60 min' },
    { id: 2, nombre: 'Cambio de aceite', descripcion: 'Protección para el motor y revisión de niveles.', precio_desde: 20, duracion: '30 min' },
    { id: 3, nombre: 'Sistema de frenos', descripcion: 'Inspección de frenos para viajes más seguros.', precio_desde: 35, duracion: '60–90 min' },
    { id: 4, nombre: 'Mantenimiento preventivo', descripcion: 'Revisión de puntos esenciales de tu vehículo.', precio_desde: 45, duracion: '90 min' }
  ];

  const loadData = () => {
    try {
      const savedProducts = localStorage.getItem('autoforce-products');
      const savedServices = localStorage.getItem('autoforce-services');
      const nextProducts = savedProducts ? JSON.parse(savedProducts) : defaultProducts;
      const nextServices = savedServices ? JSON.parse(savedServices) : defaultServices;
      setProducts(Array.isArray(nextProducts) ? nextProducts : defaultProducts);
      setServices(Array.isArray(nextServices) ? nextServices : defaultServices);
      if (!savedProducts) localStorage.setItem('autoforce-products', JSON.stringify(defaultProducts));
      if (!savedServices) localStorage.setItem('autoforce-services', JSON.stringify(defaultServices));
      setApiStatus('ok');
    } catch {
      setProducts(defaultProducts);
      setServices(defaultServices);
      setApiStatus('error');
      setNotice('No se pudo acceder al almacenamiento local del navegador.');
    }
  };

  const loadOrders = () => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('autoforce-orders') || '[]');
      setOrders(Array.isArray(savedOrders) ? savedOrders : []);
    } catch {
      setOrders([]);
      setNotice('No se pudieron leer los pedidos guardados en este navegador.');
    }
  };
  useEffect(() => { loadData(); }, []);
  useEffect(() => { localStorage.setItem('autoforce-cart', JSON.stringify(cart)); }, [cart]);

  const categories = useMemo(() => ['Todos', ...new Set(products.map(p => p.categoria))], [products]);
  const filteredProducts = products.filter(p =>
    (category === 'Todos' || p.categoria === category) &&
    `${p.nombre} ${p.descripcion || ''} ${p.categoria}`.toLowerCase().includes(search.toLowerCase())
  );
  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const total = cart.reduce((sum, item) => sum + Number(item.precio) * item.cantidad, 0);

  const addToCart = (product) => {
    if (Number(product.stock) <= 0) return setNotice('Este producto está agotado por el momento.');
    setCart(old => {
      const found = old.find(i => i.id === product.id);
      if (found) return old.map(i => i.id === product.id ? { ...i, cantidad: Math.min(i.cantidad + 1, Number(product.stock)) } : i);
      return [...old, { ...product, cantidad: 1 }];
    });
    setNotice(`${product.nombre} se agregó al carrito.`);
  };
  const changeQty = (id, delta) => setCart(old => old.map(i => i.id === id ? { ...i, cantidad: Math.max(1, Math.min(Number(i.stock), i.cantidad + delta)) } : i));
  const removeFromCart = (id) => setCart(old => old.filter(i => i.id !== id));

  const submitOrder = (e) => {
    e.preventDefault();
    if (!cart.length) return;
    setSubmitting(true);
    try {
      const currentProducts = JSON.parse(localStorage.getItem('autoforce-products') || '[]');
      const totalPedido = cart.reduce((sum, item) => sum + Number(item.precio) * item.cantidad, 0);
      const pedidoId = Date.now();
      const pedido = {
        id: pedidoId,
        pedido_id: pedidoId,
        ...checkout,
        items: cart.map(i => ({ producto_id: i.id, nombre: i.nombre, cantidad: i.cantidad, precio: Number(i.precio) })),
        total: totalPedido,
        fecha: new Date().toISOString(),
        estado: 'Pendiente'
      };
      const nuevosPedidos = [pedido, ...orders];
      localStorage.setItem('autoforce-orders', JSON.stringify(nuevosPedidos));
      const actualizados = currentProducts.map(p => {
        const comprado = cart.find(i => i.id === p.id);
        return comprado ? { ...p, stock: Math.max(0, Number(p.stock) - comprado.cantidad) } : p;
      });
      localStorage.setItem('autoforce-products', JSON.stringify(actualizados));
      setOrders(nuevosPedidos);
      setProducts(actualizados);
      setNotice(`¡Pedido #${pedidoId} guardado en esta computadora! Total: ${money(totalPedido)}.`);
      setCart([]);
      setCheckout({ cliente:'', telefono:'', correo:'' });
      setCartOpen(false);
    } catch {
      setNotice('No se pudo guardar el pedido. Comprueba el almacenamiento de este navegador.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetProductForm = () => {
    setEditingId(null);
    setProductForm({ nombre:'', categoria:'Repuestos', descripcion:'', precio:'', stock:'', imagen:'', destacado:false });
  };
  const saveProduct = (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        id: editingId || Date.now(),
        precio: Number(productForm.precio),
        stock: Number(productForm.stock),
        destacado: productForm.destacado ? 1 : 0
      };
      const updated = editingId
        ? products.map(p => p.id === editingId ? { ...payload, id: editingId } : p)
        : [...products, payload];
      localStorage.setItem('autoforce-products', JSON.stringify(updated));
      setProducts(updated);
      setNotice(editingId ? 'Producto actualizado y guardado en esta computadora.' : 'Producto creado y guardado en esta computadora.');
      resetProductForm();
    } catch {
      setNotice('No se pudo guardar el producto en el navegador.');
    }
  };
  const editProduct = (p) => {
    setEditingId(p.id);
    setProductForm({ nombre:p.nombre, categoria:p.categoria, descripcion:p.descripcion || '', precio:p.precio, stock:p.stock, imagen:p.imagen || '', destacado:Boolean(p.destacado) });
    document.getElementById('admin')?.scrollIntoView({ behavior:'smooth' });
  };
  const deleteProduct = (id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      const updated = products.filter(p => p.id !== id);
      localStorage.setItem('autoforce-products', JSON.stringify(updated));
      setProducts(updated);
      setNotice('Producto eliminado del almacenamiento local.');
    } catch {
      setNotice('No se pudo eliminar el producto.');
    }
  };

  const navClick = (id) => { setMobileMenu(false); document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }); };

  return <div className="site-shell">
    <div className="topline"><span><Clock3 size={14}/> Lun–Sáb: 8:00 a. m. – 6:00 p. m.</span><span><Phone size={14}/> Atención especializada · Citas por teléfono</span></div>
    <header className="navbar">
      <a href="#inicio" className="brand" onClick={e=>{e.preventDefault();navClick('inicio')}}>
        <span className="brand-mark"><Wrench size={23}/></span><span>AUTO<span className="red">FORCE</span><small>GARAGE & PARTS</small></span>
      </a>
      <nav className={mobileMenu ? 'nav-links open' : 'nav-links'}>
        <button onClick={()=>navClick('inicio')}>Inicio</button><button onClick={()=>navClick('servicios')}>Servicios</button>
        <button onClick={()=>navClick('productos')}>Repuestos</button><button onClick={()=>navClick('videos')}>Videos</button>
        <button onClick={()=>{setShowAdmin(v=>!v);setMobileMenu(false);setTimeout(()=>document.getElementById('admin')?.scrollIntoView({behavior:'smooth'}),100)}}>Administración</button>
      </nav>
      <div className="nav-actions"><button className="cart-trigger" onClick={()=>setCartOpen(true)} aria-label="Abrir carrito"><ShoppingCart size={20}/><span>Carrito</span><b>{cartCount}</b></button>
        <button className="mobile-toggle" onClick={()=>setMobileMenu(v=>!v)} aria-label="Menú">{mobileMenu?<X/>:<Menu/>}</button></div>
    </header>

    {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Cerrar aviso"><X size={16}/></button></div>}

    <main>
      <section className="hero" id="inicio">
        <div className="hero-image"></div><div className="hero-shade"></div>
        <div className="hero-content">
          <div className="eyebrow"><span></span> TALLER AUTOMOTRIZ · REPUESTOS</div>
          <h1>Tu vehículo.<br/><em>Nuestra pasión.</em></h1>
          <p>Servicio experto, diagnóstico preciso y repuestos de calidad para que sigas avanzando con confianza.</p>
          <div className="hero-buttons"><button className="btn btn-red" onClick={()=>navClick('servicios')}>Explorar servicios <ArrowUpRight size={17}/></button><button className="btn btn-outline" onClick={()=>navClick('productos')}>Ver repuestos <ShoppingCart size={17}/></button></div>
          <div className="hero-proof"><div className="proof-icon"><ShieldCheck/></div><div><strong>Calidad en cada detalle</strong><small>Atención responsable y transparente</small></div></div>
        </div>
        <div className="hero-stamp"><span>AF</span><small>DRIVE<br/>WITH TRUST</small></div>
        <div className="hero-bottom"><span>01 / RENDIMIENTO</span><span>PRECISIÓN · POTENCIA · CONFIANZA</span></div>
      </section>

      <section className="floating-stats">
        <article className="float-card"><div className="float-icon"><Gauge/></div><div><strong>Diagnóstico</strong><span>Computarizado</span></div><b>01</b></article>
        <article className="float-card"><div className="float-icon"><Wrench/></div><div><strong>Mecánica</strong><span>Especializada</span></div><b>02</b></article>
        <article className="float-card"><div className="float-icon"><ShieldCheck/></div><div><strong>Repuestos</strong><span>Seleccionados</span></div><b>03</b></article>
        <article className="float-card"><div className="float-icon"><Clock3/></div><div><strong>Servicio</strong><span>Confiable</span></div><b>04</b></article>
      </section>

      <section className="section services-section" id="servicios">
        <div className="section-heading"><div><div className="eyebrow dark"><span></span> LO QUE HACEMOS</div><h2>Servicio que mueve<br/><em>tu mundo.</em></h2></div><p>Soluciones automotrices pensadas para el rendimiento, la seguridad y la vida útil de tu vehículo.</p></div>
        <div className="service-grid">
          {(services.length ? services : [
            {id:1,nombre:'Diagnóstico computarizado',descripcion:'Detectamos fallas electrónicas con precisión.',precio_desde:25,duracion:'45–60 min'},
            {id:2,nombre:'Cambio de aceite',descripcion:'Protección para el motor y revisión de niveles.',precio_desde:20,duracion:'30 min'},
            {id:3,nombre:'Sistema de frenos',descripcion:'Inspección de frenos para viajes más seguros.',precio_desde:35,duracion:'60–90 min'},
            {id:4,nombre:'Mantenimiento preventivo',descripcion:'Revisión de puntos esenciales de tu vehículo.',precio_desde:45,duracion:'90 min'}
          ]).map((s,i)=><article className="service-card" key={s.id}><div className="service-number">0{i+1}</div><div className="service-icon">{[<Gauge/>,<Wrench/>,<ShieldCheck/>,<Settings2/>][i%4]}</div><h3>{s.nombre}</h3><p>{s.descripcion}</p><div className="service-meta"><span>Desde {money(s.precio_desde)}</span><span><Clock3 size={14}/> {s.duracion}</span></div><button className="text-link" onClick={()=>setNotice(`Para agendar “${s.nombre}”, comunícate con AutoForce Garage.`)}>Consultar servicio <ArrowUpRight size={16}/></button></article>)}
        </div>
      </section>

      <section className="product-section" id="productos">
        <div className="section section-inner">
          <div className="section-heading"><div><div className="eyebrow"><span></span> TIENDA AUTOFORCE</div><h2>Repuestos para<br/><em>seguir adelante.</em></h2></div><div className="product-heading-right"><p>Productos guardados localmente en este navegador.</p><button className="btn btn-outline light" onClick={()=>setCartOpen(true)}>Ver carrito <ShoppingCart size={17}/></button></div></div>
          <div className="product-tools"><label className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar repuestos..."/></label><div className="category-tabs">{categories.map(c=><button key={c} className={category===c?'selected':''} onClick={()=>setCategory(c)}>{c}</button>)}</div></div>
          {apiStatus==='error' && <div className="api-warning"><AlertCircle size={18}/> Modo local activo: los productos y pedidos se guardan en este navegador, sin servidor.</div>}
          <div className="products-grid">
            {filteredProducts.map(p=><article className="product-card" key={p.id}><div className="product-image"><img src={p.imagen || fallbackImage} onError={e=>{e.currentTarget.src=fallbackImage}} alt={p.nombre}/>{p.destacado ? <span className="product-badge">DESTACADO</span>:null}<button className="quick-add" onClick={()=>addToCart(p)} aria-label={`Agregar ${p.nombre}`}><Plus/></button></div><div className="product-info"><span className="product-category">{p.categoria}</span><h3>{p.nombre}</h3><p>{p.descripcion}</p><div className="product-bottom"><strong>{money(p.precio)}</strong><span className={Number(p.stock)>0?'stock':'stock out'}>{Number(p.stock)>0?`${p.stock} disponibles`:'Agotado'}</span></div><button className="add-button" disabled={Number(p.stock)<=0} onClick={()=>addToCart(p)}><ShoppingCart size={16}/> Agregar al carrito</button></div></article>)}
          </div>
          {!filteredProducts.length && <div className="empty-state"><Package size={34}/><h3>No encontramos productos</h3><p>Prueba otra búsqueda o categoría.</p></div>}
        </div>
      </section>

      <section className="video-section section" id="videos">
        <div className="section-heading"><div><div className="eyebrow dark"><span></span> AUTOFORCE MEDIA</div><h2>Conoce más.<br/><em>Cuida tu auto.</em></h2></div><p>Videos promocionales y consejos automotrices. Abre cada tarjeta para ver videos disponibles en YouTube.</p></div>
        <div className="video-grid">{videos.map((v,i)=><a className={`video-card video-${i+1}`} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.search)}`} target="_blank" rel="noreferrer" key={v.title}><div className="video-art"><span className="video-tag">{v.tag}</span><span className="play-button"><PlayCircle size={48}/></span><span className="video-duration">VER VIDEO ↗</span></div><div className="video-caption"><div><small>AF / VIDEO {String(i+1).padStart(2,'0')}</small><h3>{v.title}</h3></div><ArrowUpRight/></div></a>)}</div>
        <div className="video-note"><PlayCircle size={17}/> Los enlaces muestran resultados de video disponibles; el contenido puede variar según YouTube.</div>
      </section>

      <section className="cta-band"><div className="cta-mark"><CarFront size={42}/></div><div><span>LISTO PARA EL SIGUIENTE VIAJE</span><h2>Tu auto merece estar en buenas manos.</h2></div><button className="btn btn-red" onClick={()=>navClick('servicios')}>Conoce los servicios <ArrowUpRight size={17}/></button></section>

      {showAdmin && <section className="admin-section section" id="admin"><div className="section-heading"><div><div className="eyebrow dark"><span></span> PANEL DE GESTIÓN</div><h2>Administración<br/><em>del taller.</em></h2></div><p>Los productos y pedidos se guardan en el almacenamiento local de este navegador.</p></div>
        <div className="admin-tabs"><button className={activeTab==='productos'?'active':''} onClick={()=>setActiveTab('productos')}><Package size={16}/> Productos</button><button className={activeTab==='pedidos'?'active':''} onClick={()=>{setActiveTab('pedidos');loadOrders()}}><ClipboardList size={16}/> Pedidos</button></div>
        {activeTab==='productos' ? <div className="admin-layout"><form className="admin-form" onSubmit={saveProduct}><h3>{editingId?'Editar producto':'Agregar producto'}</h3><label>Nombre<input required value={productForm.nombre} onChange={e=>setProductForm({...productForm,nombre:e.target.value})}/></label><label>Categoría<input required value={productForm.categoria} onChange={e=>setProductForm({...productForm,categoria:e.target.value})}/></label><label>Descripción<textarea value={productForm.descripcion} onChange={e=>setProductForm({...productForm,descripcion:e.target.value})}/></label><div className="form-row"><label>Precio ($)<input required type="number" min="0" step="0.01" value={productForm.precio} onChange={e=>setProductForm({...productForm,precio:e.target.value})}/></label><label>Stock<input required type="number" min="0" value={productForm.stock} onChange={e=>setProductForm({...productForm,stock:e.target.value})}/></label></div><label>URL de imagen<input value={productForm.imagen} onChange={e=>setProductForm({...productForm,imagen:e.target.value})} placeholder="https://..."/></label><label className="check-label"><input type="checkbox" checked={productForm.destacado} onChange={e=>setProductForm({...productForm,destacado:e.target.checked})}/> Producto destacado</label><div className="form-actions"><button className="btn btn-red" type="submit"><Save size={16}/>{editingId?'Guardar cambios':'Crear producto'}</button>{editingId&&<button className="btn btn-muted" type="button" onClick={resetProductForm}>Cancelar</button>}</div></form>
          <div className="table-wrap"><h3>Tabla de productos <span>{products.length} registros</span></h3><table><thead><tr><th>ID</th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td>#{p.id}</td><td>{p.nombre}</td><td>{p.categoria}</td><td>{money(p.precio)}</td><td>{p.stock}</td><td className="table-actions"><button onClick={()=>editProduct(p)} title="Editar"><Pencil size={15}/></button><button onClick={()=>deleteProduct(p.id)} title="Eliminar"><Trash2 size={15}/></button></td></tr>)}</tbody></table></div></div> :
          <div className="table-wrap"><h3>Tabla de pedidos <span>{orders.length} registros</span></h3><table><thead><tr><th>Pedido</th><th>Cliente</th><th>Teléfono</th><th>Fecha</th><th>Estado</th><th>Total</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>#{o.id}</td><td>{o.cliente}</td><td>{o.telefono || '—'}</td><td>{new Date(o.fecha).toLocaleString('es-SV')}</td><td><span className="status-pill">{o.estado}</span></td><td>{money(o.total)}</td></tr>)}</tbody></table>{!orders.length&&<p className="table-empty">Todavía no hay pedidos registrados.</p>}</div>}
      </section>}
    </main>

    <footer className="footer"><div className="brand footer-brand"><span className="brand-mark"><Wrench size={22}/></span><span>AUTO<span className="red">FORCE</span><small>GARAGE & PARTS</small></span></div><p>Potencia, precisión y confianza. Proyecto académico Full Stack.</p><div className="footer-bottom"><span>© {new Date().getFullYear()} AutoForce Garage</span><span><MapPin size={14}/> El Salvador</span><span>React · Express · Node.js · MySQL</span></div></footer>

    {cartOpen && <div className="drawer-backdrop" onClick={()=>setCartOpen(false)}><aside className="cart-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-header"><div><span className="eyebrow dark"><span></span> TU SELECCIÓN</span><h2>Mi carrito <em>({cartCount})</em></h2></div><button className="icon-button" onClick={()=>setCartOpen(false)}><X/></button></div>
      <div className="cart-items">{cart.map(i=><article className="cart-item" key={i.id}><img src={i.imagen || fallbackImage} onError={e=>e.currentTarget.src=fallbackImage} alt=""/><div className="cart-item-main"><h3>{i.nombre}</h3><strong>{money(i.precio)}</strong><div className="quantity-control"><button onClick={()=>changeQty(i.id,-1)}><Minus size={13}/></button><span>{i.cantidad}</span><button onClick={()=>changeQty(i.id,1)}><Plus size={13}/></button></div></div><button className="remove-item" onClick={()=>removeFromCart(i.id)} aria-label="Quitar producto"><Trash2 size={17}/></button></article>)}
      {!cart.length&&<div className="empty-cart"><ShoppingCart size={44}/><h3>Tu carrito está vacío</h3><p>Agrega repuestos y aparecerán aquí.</p><button className="btn btn-red" onClick={()=>{setCartOpen(false);navClick('productos')}}>Explorar productos</button></div>}</div>
      {!!cart.length&&<><div className="cart-summary"><div><span>Subtotal</span><strong>{money(total)}</strong></div><small>El pedido se guardará en este navegador al confirmar.</small></div><form className="checkout-form" onSubmit={submitOrder}><h3>Datos para el pedido</h3><label>Nombre completo<input required value={checkout.cliente} onChange={e=>setCheckout({...checkout,cliente:e.target.value})} placeholder="Tu nombre"/></label><label>Teléfono<input value={checkout.telefono} onChange={e=>setCheckout({...checkout,telefono:e.target.value})} placeholder="0000-0000"/></label><label>Correo electrónico<input type="email" value={checkout.correo} onChange={e=>setCheckout({...checkout,correo:e.target.value})} placeholder="correo@ejemplo.com"/></label><button className="btn btn-red checkout-button" disabled={submitting}>{submitting?'Registrando pedido...':`Confirmar pedido · ${money(total)}`}</button></form></>}
    </aside></div>}
    <div className={`api-pill ${apiStatus}`}><span></span>{apiStatus==='ok'?'Guardado local activo':apiStatus==='checking'?'Preparando almacenamiento':'Almacenamiento local limitado'}</div>
  </div>;
}
