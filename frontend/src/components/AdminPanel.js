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
    { id: 3, clientEmail: 'cliente1@example.com', phone: '3410001111', status: 'presupuestado', description: 'Fuga de gas' },
  ]);

  const [activeStatus, setActiveStatus] = useState('pendiente');
  const [message, setMessage] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);

  // tabs & panels
  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' | 'clients'
  const [openClientPanels, setOpenClientPanels] = useState({}); // { [email]: true }

  // modal mode: 'add' | 'edit'
  const [modalMode, setModalMode] = useState('add');
  const [editingClient, setEditingClient] = useState(null); // client object when editing

  // budget modal (per-order) — only available from orders with status 'presupuestado'
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetOrder, setBudgetOrder] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetNote, setBudgetNote] = useState('');

  const ordersByStatus = orders.filter(o => o.status === activeStatus);

  const openClientModal = (client = null) => {
    setMessage('');
    if (client) {
      setModalMode('edit');
      setEditingClient(client);
    } else {
      setModalMode('add');
      setEditingClient(null);
    }
    setShowClientModal(true);
  };
  const closeClientModal = () => {
    setShowClientModal(false);
    setEditingClient(null);
  };

  const addOrEditClientFromModal = (e) => {
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
    const notify = form.notify?.checked ?? false;

    if (!fullName || !lastName || !email || !password || !phone || !locality || !street || !number || !type) {
      setMessage('Complete todos los campos obligatorios.');
      return;
    }

    // Editing
    if (modalMode === 'edit' && editingClient) {
      if (email !== editingClient.email && clients.find(c => c.email === email)) {
        setMessage('El email ya está registrado por otro cliente.');
        return;
      }
      const updatedClient = {
        email, password, phone, fullName, lastName,
        address: { locality, street, number, type, floor: type === 'departamento' ? floor : '', door: type === 'departamento' ? door : '' }
      };
      setClients(prev => prev.map(c => c.email === editingClient.email ? updatedClient : c));
      setMessage(`Cliente ${email} actualizado.`);
      if (notify) {
        const text = `Hola ${fullName}, sus datos en "Reparaciones para tu Hogar" fueron actualizados.`;
        sendWhatsApp(phone, text);
      }
      setShowClientModal(false);
      setEditingClient(null);
      return;
    }

    // Adding
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
    if (notify) {
      const text = `Hola ${fullName}, su cuenta en "Reparaciones para tu Hogar" fue creada.\nUsuario: ${email}\nContraseña: ${password}`;
      sendWhatsApp(phone, text);
    }
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

  const toggleClientPanel = (email) => {
    setOpenClientPanels(prev => ({ ...prev, [email]: !prev[email] }));
  };

  const contactClient = (client) => {
    sendWhatsApp(client.phone, `Hola ${client.fullName}, consulta desde panel admin.`);
  };

  // open budget modal for a specific order (only if order.status === 'presupuestado')
  const openBudgetModal = (order) => {
    if (!order || order.status !== 'presupuestado') {
      setMessage('Solo se pueden agregar presupuestos a pedidos en estado "Presupuestado".');
      return;
    }
    setBudgetOrder(order);
    setBudgetAmount('');
    setBudgetNote('');
    setBudgetModalOpen(true);
    setMessage('');
  };

  const closeBudgetModal = () => {
    setBudgetModalOpen(false);
    setBudgetOrder(null);
  };

  const submitBudgetForOrder = (e) => {
    e.preventDefault();
    if (!budgetOrder) return;
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Ingrese un monto válido mayor a 0.');
      return;
    }
    const id = budgetOrder.id;
    const newItem = { amount, note: budgetNote || '', date: new Date().toISOString() };
    const updated = orders.map(o => {
      if (o.id !== id) return o;
      const presupuestos = [...(o.presupuestos || []), newItem];
      const totalPresupuesto = presupuestos.reduce((s, p) => s + (p.amount || 0), 0);
      return { ...o, presupuestos, totalPresupuesto };
    });
    setOrders(updated);
    const client = clients.find(c => c.email === budgetOrder.clientEmail);
    const phone = client ? client.phone : budgetOrder.phone;
    const text = `Se agregó un presupuesto de $${amount.toFixed(2)} al pedido #${id}. Total presupuestos: $${updated.find(u => u.id === id).totalPresupuesto.toFixed(2)}.`;
    sendWhatsApp(phone, text);
    setMessage(`Presupuesto agregado a pedido #${id} y notificado por WhatsApp.`);
    closeBudgetModal();
  };

  return (
    <div className="admin-root" style={{ padding: 20 }}>
      <header style={{ textAlign: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: 'var(--gold)' }}>Panel de control — Admin</h2>
        <div style={{ marginTop: 8 }}>
          <button className="btn register-btn" onClick={onLogout} style={{ marginRight: 8 }}>Cerrar sesión</button>
        </div>
      </header>

      {/* Tabs (compact on desktop via App.css) */}
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
                    <th>Presupuestos</th>
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
                        {o.totalPresupuesto ? `$${(o.totalPresupuesto).toFixed(2)}` : '-'}
                      </td>
                      <td className="center-cell">
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button className="btn demo-btn" onClick={() => {
                            const client = clients.find(c => c.email === o.clientEmail);
                            sendWhatsApp(client ? client.phone : o.phone, `Consulta sobre pedido #${o.id}`);
                          }}>Contactar</button>

                          {/* Only allow adding presupuesto if order status is 'presupuestado' */}
                          {o.status === 'presupuestado' && (
                            <button className="btn submit-btn" onClick={() => openBudgetModal(o)}>Agregar presupuesto</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {activeTab === 'clients' && (
        <section style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0, color: 'var(--text)', textAlign: 'center' }}>Clientes ({clients.length})</h3>
          </div>

          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <table className="data-table clients-table">
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Email</th>
                  <th>Tel</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(c => {
                  const addr = c.address || {};
                  const direccion = `${addr.locality || ''}${addr.locality ? ', ' : ''}${addr.street || ''} ${addr.number || ''}` +
                    (addr.type === 'departamento' ? ` · Piso ${addr.floor || '-'} · Puerta ${addr.door || '-'}` : ` · ${addr.type || 'Casa'}`);
                  return (
                    <tr key={c.email}>
                      <td className="center-cell">{c.fullName} {c.lastName}</td>
                      <td className="center-cell">{c.email}</td>
                      <td className="center-cell">{c.phone}</td>
                      <td>{direccion}</td>
                      <td className="center-cell">
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button className="btn demo-btn" onClick={() => contactClient(c)}>Contactar</button>
                          <button
                            className="btn submit-btn"
                            onClick={() => openClientModal(c)}
                            title="Editar cliente"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Agregar nuevo cliente: ubicado debajo de la tabla (centrado) */}
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <button className="btn submit-btn" onClick={() => openClientModal(null)}>Agregar nuevo cliente</button>
            </div>
          </div>
        </section>
      )}

      {message && <div style={{ marginTop: 12, color: '#dcd4c2', textAlign: 'center' }}>{message}</div>}

      {/* Modal para agregar/editar cliente */}
      {showClientModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--gold)' }}>{modalMode === 'edit' ? 'Editar cliente' : 'Agregar cliente'}</h3>
              <button className="btn register-btn" onClick={closeClientModal}>Cerrar</button>
            </header>

            <form onSubmit={addOrEditClientFromModal} style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input name="fullName" placeholder="Nombre completo" className="input" style={{ flex: 1 }}
                  defaultValue={editingClient?.fullName || ''} />
                <input name="lastName" placeholder="Apellido" className="input" style={{ flex: 1 }}
                  defaultValue={editingClient?.lastName || ''} />
              </div>

              <input name="email" placeholder="Email (usuario)" className="input"
                defaultValue={editingClient?.email || ''} />
              <input name="password" placeholder="Contraseña" className="input"
                defaultValue={editingClient?.password || ''} />
              <input name="phone" placeholder="Teléfono (sin 0 ni +)" className="input"
                defaultValue={editingClient?.phone || ''} />

              <div style={{ display: 'flex', gap: 8 }}>
                <input name="locality" placeholder="Localidad" className="input" style={{ flex: 1 }}
                  defaultValue={editingClient?.address?.locality || ''} />
                <input name="street" placeholder="Calle" className="input" style={{ flex: 1 }}
                  defaultValue={editingClient?.address?.street || ''} />
                <input name="number" placeholder="Número" className="input" style={{ width: 100 }}
                  defaultValue={editingClient?.address?.number || ''} />
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ color: 'var(--text)', marginRight: 8 }}>Tipo:</label>
                <select name="type" className="input" defaultValue={editingClient?.address?.type || 'casa'} onChange={(ev) => {
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

                <input name="floor" placeholder="Piso (si depto)" className="input" style={{ width: 120 }}
                  defaultValue={editingClient?.address?.floor || ''} disabled={!(editingClient?.address?.type === 'departamento')} />
                <input name="door" placeholder="Puerta (si depto)" className="input" style={{ width: 120 }}
                  defaultValue={editingClient?.address?.door || ''} disabled={!(editingClient?.address?.type === 'departamento')} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <input type="checkbox" name="notify" defaultChecked={modalMode === 'add' ? true : false} />
                <span style={{ color: 'var(--text)' }}>Notificar por WhatsApp al guardar</span>
              </label>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" className="btn register-btn" onClick={closeClientModal}>Cancelar</button>
                <button type="submit" className="btn submit-btn">{modalMode === 'edit' ? 'Guardar cambios' : 'Agregar y notificar por WhatsApp'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para agregar presupuesto (solo triggered desde la fila cuando status === 'presupuestado') */}
      {budgetModalOpen && budgetOrder && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--gold)' }}>Agregar presupuesto — Pedido #{budgetOrder.id}</h3>
              <button className="btn register-btn" onClick={closeBudgetModal}>Cerrar</button>
            </header>

            <form onSubmit={submitBudgetForOrder} style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              <input
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="Monto (ej. 1500.00)"
                className="input"
              />
              <input
                value={budgetNote}
                onChange={(e) => setBudgetNote(e.target.value)}
                placeholder="Nota (opcional)"
                className="input"
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn register-btn" onClick={closeBudgetModal}>Cancelar</button>
                <button type="submit" className="btn submit-btn">Guardar y notificar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}