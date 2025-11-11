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
  const [clients, setClients] = useState([
    {
      email: 'cliente1@example.com',
      password: 'cliente123',
      phone: '3410001111',
      fullName: 'Cliente Uno',
      lastName: 'Apellido1',
      address: { locality: 'Rosario', street: 'San Martín', number: '123', type: 'casa', floor: '', door: '' }
    },
    {
      email: 'cliente2@example.com',
      password: 'cliente123',
      phone: '3410002222',
      fullName: 'Cliente Dos',
      lastName: 'Apellido2',
      address: { locality: 'Rosario', street: 'Mitre', number: '456', type: 'departamento', floor: '2', door: 'B' }
    },
  ]);

  const [orders, setOrders] = useState([
    { id: 1, clientEmail: 'cliente1@example.com', phone: '3410001111', status: 'pendiente', description: 'Reparación de bomba' },
    { id: 2, clientEmail: 'cliente2@example.com', phone: '3410002222', status: 'visita_tecnica', description: 'Instalación de calefón' },
    { id: 3, clientEmail: 'cliente1@example.com', phone: '3410001111', status: 'urgencia', description: 'Fuga de gas' },
  ]);

  const [activeStatus, setActiveStatus] = useState('pendiente');
  const [message, setMessage] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);

  // new: tabs & accordion state
  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' | 'clients'
  const [openClientPanels, setOpenClientPanels] = useState({}); // { [email]: true }

  const ordersByStatus = orders.filter(o => o.status === activeStatus);

  const openClientModal = () => {
    setShowClientModal(true);
    setMessage('');
  };
  const closeClientModal = () => setShowClientModal(false);

  const addClientFromModal = (e) => {
    e.preventDefault();
    const form = e.target;
    const fullName = form.fullName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const phone = form.phone.value.trim();
    const locality = form.locality.value.trim();
    const street = form.street.value.trim();
    const number = form.number.value.trim();
    const type = form.type.value;
    const floor = form.floor.value.trim();
    const door = form.door.value.trim();

    if (!fullName || !lastName || !email || !password || !phone || !locality || !street || !number || !type) {
      setMessage('Complete todos los campos obligatorios.');
      return;
    }

    if (clients.find(c => c.email === email)) {
      setMessage('El cliente ya existe.');
      return;
    }

    const newClient = {
      email, password, phone, fullName, lastName,
      address: { locality, street, number, type, floor: type === 'departamento' ? floor : '', door: type === 'departamento' ? door : '' }
    };

    setClients(prev => [...prev, newClient]);
    setMessage(`Cliente ${email} agregado.`);
    const text = `Hola ${fullName}, su cuenta en "Reparaciones para tu Hogar" fue creada.\nUsuario: ${email}\nContraseña: ${password}`;
    sendWhatsApp(phone, text);
    form.reset();
    setShowClientModal(false);
  };

  const updateOrder = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const client = clients.find(c => c.email === order.clientEmail);
      const phone = client ? client.phone : order.phone;
      const text = `Estado de su pedido #${orderId} actualizado a: ${STATUS_LIST.find(s => s.key === newStatus)?.label || newStatus}.`;
      sendWhatsApp(phone, text);
      setMessage(`Pedido ${orderId} actualizado y notificado por WhatsApp.`);
    }
  };

  const handleStatusChange = (orderId, e) => {
    const newStatus = e.target.value;
    updateOrder(orderId, newStatus);
  };

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
    const text = `Se creó un pedido #${nextId}: ${desc}`;
    sendWhatsApp(phone, text);
  };

  const toggleClientPanel = (email) => {
    setOpenClientPanels(prev => ({ ...prev, [email]: !prev[email] }));
  };

  const contactClient = (client) => {
    sendWhatsApp(client.phone, `Hola ${client.fullName}, consulta desde panel admin.`);
  };

  return (
    <div className="admin-root" style={{ padding: 20 }}>
      <header style={{ textAlign: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: 'var(--gold)' }}>Panel de control — Admin</h2>
        <div style={{ marginTop: 8 }}>
          <button className="btn register-btn" onClick={onLogout} style={{ marginRight: 8 }}>Cerrar sesión</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'notifications' ? 'tab-active' : ''}`} onClick={() => setActiveTab('notifications')}>Notificaciones</button>
        <button className={`tab ${activeTab === 'clients' ? 'tab-active' : ''}`} onClick={() => setActiveTab('clients')}>Clientes</button>
      </div>

      {/* Tab content */}
      {activeTab === 'notifications' && (
        <section style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 12, textAlign: 'center' }}>
            {STATUS_LIST.map(s => (
              <button
                key={s.key}
                className={`demo-btn`}
                onClick={() => setActiveStatus(s.key)}
                style={{ marginRight: 8, borderWidth: activeStatus === s.key ? 2 : 1 }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div>
            <h3 style={{ color: 'var(--text)', textAlign: 'center' }}>
              {STATUS_LIST.find(s => s.key === activeStatus).label} ({ordersByStatus.length})
            </h3>

            {ordersByStatus.length === 0 ? (
              <div style={{ color: '#cfc6b0', textAlign: 'center' }}>No hay pedidos en esta categoría.</div>
            ) : (
              <table className="data-table orders-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Cliente (email)</th>
                    <th>Tel</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersByStatus.map(o => (
                    <tr key={o.id}>
                      <td className="center-cell">#{o.id}</td>
                      <td>{o.description}</td>
                      <td className="center-cell">{o.clientEmail}</td>
                      <td className="center-cell">{o.phone}</td>
                      <td className="center-cell">
                        <select value={o.status} onChange={(e) => handleStatusChange(o.id, e)} className="input">
                          {STATUS_LIST.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="center-cell">
                        <button className="btn demo-btn" onClick={() => {
                          const client = clients.find(c => c.email === o.clientEmail);
                          sendWhatsApp(client ? client.phone : o.phone, `Consulta sobre pedido #${o.id}`);
                        }}>Contactar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <h4 style={{ color: 'var(--text)' }}>Crear pedido rápido</h4>
            <form onSubmit={addOrder} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <input name="clientEmail" placeholder="email cliente" className="input" style={{ flex: '1 1 200px' }} />
              <input name="phone" placeholder="teléfono (sin 0 ni +)" className="input" style={{ width: 160 }} />
              <input name="description" placeholder="Descripción" className="input" style={{ flex: '1 1 240px' }} />
              <button className="btn submit-btn" type="submit">Crear</button>
            </form>
          </div>
        </section>
      )}

      {activeTab === 'clients' && (
        <section style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0, color: 'var(--text)', textAlign: 'center' }}>Clientes ({clients.length})</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table clients-table">
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Email</th>
                  <th>Tel</th>
                  <th>Localidad</th>
                  <th>Calle</th>
                  <th>Número</th>
                  <th>Tipo</th>
                  <th>Piso</th>
                  <th>Puerta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.email}>
                    <td className="center-cell">{c.fullName} {c.lastName}</td>
                    <td className="center-cell">{c.email}</td>
                    <td className="center-cell">{c.phone}</td>
                    <td className="center-cell">{c.address.locality}</td>
                    <td className="center-cell">{c.address.street}</td>
                    <td className="center-cell">{c.address.number}</td>
                    <td className="center-cell">{c.address.type}</td>
                    <td className="center-cell">{c.address.type === 'departamento' ? c.address.floor : '-'}</td>
                    <td className="center-cell">{c.address.type === 'departamento' ? c.address.door : '-'}</td>
                    <td className="center-cell">
                      <button className="btn demo-btn" onClick={() => contactClient(c)}>Contactar</button>
                      <button
                        className="btn register-btn"
                        style={{ marginLeft: 8 }}
                        onClick={() => {
                          navigator.clipboard?.writeText(`Usuario: ${c.email}\nContraseña: ${c.password}`);
                          setMessage('Credenciales copiadas al portapapeles.');
                        }}
                      >
                        Copiar credenciales
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <button className="btn submit-btn" onClick={openClientModal}>Agregar nuevo cliente</button>
          </div>
        </section>
      )}

      {message && <div style={{ marginTop: 12, color: '#dcd4c2', textAlign: 'center' }}>{message}</div>}

      {/* Modal para agregar cliente */}
      {showClientModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--gold)' }}>Agregar cliente</h3>
              <button className="btn register-btn" onClick={closeClientModal}>Cerrar</button>
            </header>

            <form onSubmit={addClientFromModal} style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input name="fullName" placeholder="Nombre completo" className="input" style={{ flex: 1 }} />
                <input name="lastName" placeholder="Apellido" className="input" style={{ flex: 1 }} />
              </div>

              <input name="email" placeholder="Email (usuario)" className="input" />
              <input name="password" placeholder="Contraseña" className="input" />
              <input name="phone" placeholder="Teléfono (sin 0 ni +)" className="input" />

              <div style={{ display: 'flex', gap: 8 }}>
                <input name="locality" placeholder="Localidad" className="input" style={{ flex: 1 }} />
                <input name="street" placeholder="Calle" className="input" style={{ flex: 1 }} />
                <input name="number" placeholder="Número" className="input" style={{ width: 100 }} />
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ color: 'var(--text)', marginRight: 8 }}>Tipo:</label>
                <select name="type" className="input" defaultValue="casa" onChange={(ev) => {
                  const modal = ev.target.closest('.modal');
                  if (!modal) return;
                  const floor = modal.querySelector('input[name="floor"]');
                  const door = modal.querySelector('input[name="door"]');
                  if (ev.target.value === 'departamento') {
                    floor && floor.removeAttribute('disabled');
                    door && door.removeAttribute('disabled');
                  } else {
                    floor && floor.setAttribute('disabled', 'true');
                    door && door.setAttribute('disabled', 'true');
                  }
                }}>
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                </select>

                <input name="floor" placeholder="Piso (si depto)" className="input" style={{ width: 120 }} disabled />
                <input name="door" placeholder="Puerta (si depto)" className="input" style={{ width: 120 }} disabled />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" className="btn register-btn" onClick={closeClientModal}>Cancelar</button>
                <button type="submit" className="btn submit-btn">Agregar y notificar por WhatsApp</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}