import React, { useState } from 'react';
import '../App.css';

const STATUS_LIST = [
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'visita_tecnica', label: 'Visita técnica' },
  { key: 'presupuestado', label: 'Presupuestado' },
  { key: 'rechazado', label: 'Rechazado' },
  { key: 'urgencia', label: 'Urgencia' },
  { key: 'completado', label: 'Completado' },
];

function sendWhatsApp(phone, message) {
  if (!phone) {
    alert('Número de teléfono no disponible para enviar WhatsApp.');
    return;
  }
  const cleaned = phone.replace(/\D/g, '');
  const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export default function AdminPanel({ onLogout }) {
  // clientes precargados: asegúrate de ajustar números reales
  const [clients, setClients] = useState([
    { email: 'cliente1@example.com', password: 'cliente123', phone: '3410001111' },
    { email: 'cliente2@example.com', password: 'cliente123', phone: '3410002222' },
  ]);

  // pedidos de ejemplo
  const [orders, setOrders] = useState([
    { id: 1, clientEmail: 'cliente1@example.com', phone: '3410001111', status: 'pendiente', description: 'Reparación de bomba' },
    { id: 2, clientEmail: 'cliente2@example.com', phone: '3410002222', status: 'visita_tecnica', description: 'Instalación de calefón' },
    { id: 3, clientEmail: 'cliente1@example.com', phone: '3410001111', status: 'urgencia', description: 'Fuga de gas' },
  ]);

  const [activeStatus, setActiveStatus] = useState('pendiente');
  const [message, setMessage] = useState('');

  // agregar cliente y notificar por WhatsApp (usuario = email)
  const addClient = (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const phone = form.phone.value.trim();
    if (!email || !password || !phone) {
      setMessage('Complete todos los campos de cliente.');
      return;
    }
    const exists = clients.find(c => c.email === email);
    if (exists) {
      setMessage('El cliente ya existe.');
      return;
    }
    const newClient = { email, password, phone };
    setClients(prev => [...prev, newClient]);
    setMessage(`Cliente ${email} agregado.`);
    // Notificar por WhatsApp (abre en pestaña)
    const text = `Hola, su cuenta en "Reparaciones para tu Hogar" fue creada.\nUsuario: ${email}\nContraseña: ${password}`;
    sendWhatsApp(phone, text);
    form.reset();
  };

  // cambiar estado de pedido y notificar
  const updateOrder = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const client = clients.find(c => c.email === order.clientEmail);
      const phone = client ? client.phone : order.phone;
      const text = `Estado de su pedido #${orderId} actualizado a: ${STATUS_LIST.find(s=>s.key===newStatus)?.label || newStatus}.`;
      sendWhatsApp(phone, text);
      setMessage(`Pedido ${orderId} actualizado y notificado por WhatsApp.`);
    }
  };

  // editar pedido: aquí solo cambio status en memoria
  const handleStatusChange = (orderId, e) => {
    const newStatus = e.target.value;
    updateOrder(orderId, newStatus);
  };

  // Agregar un nuevo pedido rápido (opcional)
  const addOrder = (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.clientEmail.value.trim();
    const phone = form.phone.value.trim();
    const desc = form.description.value.trim();
    if (!email || !phone || !desc) {
      setMessage('Complete todos los campos de pedido.');
      return;
    }
    const nextId = orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    const newOrder = { id: nextId, clientEmail: email, phone, status: 'pendiente', description: desc };
    setOrders(prev => [newOrder, ...prev]);
    setMessage(`Pedido ${nextId} creado.`);
    form.reset();
    // opcional: notificar creación
    const text = `Se creó un pedido #${nextId}: ${desc}`;
    sendWhatsApp(phone, text);
  };

  const ordersByStatus = orders.filter(o => o.status === activeStatus);

  return (
    <div style={{ padding:20 }}>
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ margin:0, color:'var(--gold)' }}>Panel de control — Admin</h2>
        <div>
          <button className="btn register-btn" onClick={onLogout} style={{ marginRight:8 }}>Cerrar sesión</button>
        </div>
      </header>

      <section style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
        <div style={{ flex:'1 1 320px', maxWidth:760 }}>
          <div style={{ marginBottom:12 }}>
            {STATUS_LIST.map(s => (
              <button
                key={s.key}
                className={`demo-btn`}
                onClick={() => setActiveStatus(s.key)}
                style={{ marginRight:8, borderWidth: activeStatus===s.key ? 2 : 1 }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div>
            <h3 style={{ color:'var(--text)' }}>{STATUS_LIST.find(s=>s.key===activeStatus).label} ({ordersByStatus.length})</h3>
            {ordersByStatus.length === 0 && <div style={{ color:'#cfc6b0' }}>No hay pedidos en esta categoría.</div>}
            <ul style={{ listStyle:'none', padding:0, margin:0 }}>
              {ordersByStatus.map(o => (
                <li key={o.id} style={{ background:'rgba(255,255,255,0.02)', padding:12, marginBottom:10, borderRadius:8, border:'1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                    <div>
                      <div style={{ fontWeight:700, color:'var(--gold)' }}>Pedido #{o.id}</div>
                      <div style={{ color:'#dcd4c2' }}>{o.description}</div>
                      <div style={{ marginTop:6, fontSize:13, color:'#cfc6b0' }}>Cliente: {o.clientEmail} · Tel: {o.phone}</div>
                    </div>

                    <div style={{ minWidth:220 }}>
                      <label style={{ display:'block', fontSize:13, color:'#e6dbc2', marginBottom:6 }}>Estado</label>
                      <select value={o.status} onChange={(e) => handleStatusChange(o.id, e)} style={{ width:'100%', padding:8, borderRadius:8, background:'var(--input-bg)', color:'var(--text)', border:'1px solid rgba(255,255,255,0.04)' }}>
                        {STATUS_LIST.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop:12 }}>
            <h4 style={{ color:'var(--text)' }}>Crear pedido rápido</h4>
            <form onSubmit={addOrder} style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <input name="clientEmail" placeholder="email cliente" className="input" style={{ flex:'1 1 200px' }} />
              <input name="phone" placeholder="teléfono (sin 0 ni +)" className="input" style={{ width:160 }} />
              <input name="description" placeholder="Descripción" className="input" style={{ flex:'1 1 240px' }} />
              <button className="btn submit-btn" type="submit">Crear</button>
            </form>
          </div>
        </div>

        <aside style={{ width:320, minWidth:280 }}>
          <div style={{ marginBottom:14 }}>
            <h3 style={{ marginTop:0, color:'var(--text)' }}>Clientes ({clients.length})</h3>
            <ul style={{ padding:0, listStyle:'none', margin:0 }}>
              {clients.map(c => (
                <li key={c.email} style={{ padding:8, borderRadius:8, marginBottom:8, background:'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontWeight:700, color:'var(--gold)' }}>{c.email}</div>
                  <div style={{ fontSize:13, color:'#cfc6b0' }}>Tel: {c.phone}</div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color:'var(--text)' }}>Agregar cliente</h4>
            <form onSubmit={addClient} style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <input name="email" placeholder="email" className="input" />
              <input name="password" placeholder="contraseña" className="input" />
              <input name="phone" placeholder="teléfono (sin 0 ni +)" className="input" />
              <button className="btn submit-btn" type="submit">Agregar y notificar por WhatsApp</button>
            </form>
          </div>
        </aside>
      </section>

      {message && <div style={{ marginTop:12, color:'#dcd4c2' }}>{message}</div>}
    </div>
  );
}