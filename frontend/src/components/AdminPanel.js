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
  // demo clients (asegúrate no duplicar si ya existen)
  const [clients, setClients] = useState([
    { email: 'juan@example.com', firstName: 'Juan', lastName: 'Pérez', phone: '3411111111', address: { locality: 'Rosario', street: 'Córdoba', number: '123', type: 'casa' } },
    { email: 'maría@example.com', firstName: 'María', lastName: 'Gómez', phone: '3412222222', address: { locality: 'Roldán', street: 'Belgrano', number: '45', type: 'departamento', floor: '2', door: 'B' } },
    { email: 'ana@example.com', firstName: 'Ana', lastName: 'López', phone: '3413333333', address: { locality: 'Funes', street: 'San Martín', number: '88', type: 'casa' } },
  ]);

  // demo orders / notificaciones para la demo — uno por cada tipo de estado
  const [orders, setOrders] = useState([
    { id: 101, clientEmail: 'juan@example.com', phone: '3411111111', description: 'Reparación de pileta', status: 'pendiente', visitSchedule: null, address: clients[0]?.address },
    { id: 102, clientEmail: 'maría@example.com', phone: '3412222222', description: 'Instalación de equipo de refrigeración', status: 'visita_tecnica', visitSchedule: { date: '2025-11-25', time: '10:30' }, address: clients[1]?.address },
    { id: 103, clientEmail: 'ana@example.com', phone: '3413333333', description: 'Cotización pintura living', status: 'presupuestado', visitSchedule: { date: '2025-11-27', time: '15:00' }, address: clients[2]?.address },
    { id: 104, clientEmail: 'juan@example.com', phone: '3411111111', description: 'Revisión gas', status: 'rechazado', visitSchedule: null, address: clients[0]?.address },
    { id: 105, clientEmail: 'ana@example.com', phone: '3413333333', description: 'Urgencia plomería', status: 'urgencia', visitSchedule: null, address: clients[2]?.address },
    { id: 106, clientEmail: 'maría@example.com', phone: '3412222222', description: 'Tarea completada: instalación eléctrica', status: 'completado', visitSchedule: null, address: clients[1]?.address },
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

  // scheduling modal for "visita_tecnica" when status selected
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleOrder, setScheduleOrder] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // budget modal (per-order) — only available from orders with status 'presupuestado'
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetOrder, setBudgetOrder] = useState(null);
  const [budgetItems, setBudgetItems] = useState([]); // items added in the modal
  const [newBudgetItem, setNewBudgetItem] = useState({ desc: '', qty: '', unit: '' });
  const [budgetNote, setBudgetNote] = useState('');
  const [budgetVisitDate, setBudgetVisitDate] = useState('');
  const [budgetVisitTime, setBudgetVisitTime] = useState('');

  // Servicios pre-cargados y CRUD mínimo
  const [services, setServices] = useState([
    'Albañilería',
    'Instalación / Refrigeración',
    'Electricidad',
    'Fontanería y gas',
    'Durlock',
    'Pintura'
  ]);
  const [newService, setNewService] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const openServiceModal = () => { setNewService(''); setShowServiceModal(true); setMessage(''); };
  const closeServiceModal = () => { setShowServiceModal(false); setNewService(''); };

  // Equipo de trabajo (usuarios que pueden asignarse a pedidos)
  const [team, setTeam] = useState([
    { id: 't1', fullName: 'Técnico Uno', role: 'Técnico', phone: '3410001111', email: 'tec1@example.com' },
    { id: 't2', fullName: 'Técnico Dos', role: 'Técnico', phone: '3410002222', email: 'tec2@example.com' },
  ]);
  const [newMember, setNewMember] = useState({ fullName: '', role: '', phone: '', email: '' });

  // modal para agregar miembro del equipo
  const [showTeamModal, setShowTeamModal] = useState(false);
  const openTeamModal = () => { setNewMember({ fullName: '', role: '', phone: '', email: '' }); setShowTeamModal(true); setMessage(''); };
  const closeTeamModal = () => { setShowTeamModal(false); setMessage(''); };

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

  // confirmar y guardar schedule (fecha/hora) para una orden y notificar
  const confirmScheduleForOrder = (orderId, date, time) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'visita_tecnica', visitSchedule: { date, time } } : o));
    const order = orders.find(o => o.id === orderId);
    const client = order ? clients.find(c => c.email === order.clientEmail) : null;
    const phone = client ? client.phone : order?.phone;
    if (phone) {
      sendWhatsApp(phone, `Su visita técnica para pedido #${orderId} fue programada para ${date} ${time}.`);
    }
    setMessage(`Visita técnica programada para el pedido #${orderId}.`);
  };

  // confirmar presupuesto: añade items, fija visitSchedule si viene y cambia estado a 'presupuestado'
  const confirmBudgetForOrder = (orderId, items, note, visitDate, visitTime) => {
    const total = items.reduce((s, it) => s + (it.total || 0), 0);
    const newPresupuestoEntry = { items, total, note: note || '', date: new Date().toISOString() };
    const updated = orders.map(o => {
      if (o.id !== orderId) return o;
      const presupuestos = [...(o.presupuestos || []), newPresupuestoEntry];
      const totalPresupuesto = presupuestos.reduce((s, p) => s + (p.total || 0), 0);
      return { ...o, presupuestos, totalPresupuesto, status: 'presupuestado', visitSchedule: visitDate && visitTime ? { date: visitDate, time: visitTime } : o.visitSchedule };
    });
    setOrders(updated);
    const order = updated.find(o => o.id === orderId);
    const client = order ? clients.find(c => c.email === order.clientEmail) : null;
    const phone = client ? client.phone : order?.phone;
    if (phone) {
      sendWhatsApp(phone, `Se agregó un presupuesto al pedido #${orderId}. Total agregado: $${total.toFixed(2)}. Total presupuestos acumulado: $${order.totalPresupuesto.toFixed(2)}.`);
    }
    setMessage(`Presupuesto agregado a pedido #${orderId} y notificado por WhatsApp.`);
  };

  const handleStatusChange = (orderId, e) => {
    const newStatus = e.target.value;
    const order = orders.find(o => o.id === orderId); // <- asegurar que 'order' esté definido
    // cambiar a visita técnica -> abrir modal para agendar antes de confirmar
    if (newStatus === 'visita_tecnica') {
      setScheduleOrder(order);
      setScheduleDate(order?.visitSchedule?.date || '');
      setScheduleTime(order?.visitSchedule?.time || '');
      setScheduleModalOpen(true);
      return;
    }
    // cambiar de visita_tecnica a presupuestado -> abrir modal presupuesto (fecha/hora + items) antes de confirmar
    if (newStatus === 'presupuestado' && order?.status === 'visita_tecnica') {
      // abrir modal de presupuesto con la orden (pre-cargar visita si existe)
      setBudgetOrder(order);
      setBudgetItems([]);
      setNewBudgetItem({ desc: '', qty: '', unit: '' });
      setBudgetNote('');
      setBudgetVisitDate(order?.visitSchedule?.date || '');
      setBudgetVisitTime(order?.visitSchedule?.time || '');
      setBudgetModalOpen(true);
      return;
    }
    // para otros cambios normales
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
    setBudgetItems([]);
    setNewBudgetItem({ desc: '', qty: '', unit: '' });
    setBudgetNote('');
    setBudgetModalOpen(true);
    setMessage('');
  };

  const closeBudgetModal = () => {
    setBudgetModalOpen(false);
    setBudgetOrder(null);
  };

  const addBudgetItem = () => {
    const desc = (newBudgetItem.desc || '').trim();
    const qty = parseFloat(newBudgetItem.qty);
    const unit = parseFloat(newBudgetItem.unit);
    if (!desc || isNaN(qty) || qty <= 0 || isNaN(unit) || unit <= 0) {
      setMessage('Complete descripción, cantidad y monto unitario válidos para el item.');
      return;
    }
    const item = { desc, qty, unitPrice: unit, total: qty * unit };
    setBudgetItems(prev => [...prev, item]);
    setNewBudgetItem({ desc: '', qty: '', unit: '' });
    setMessage('');
  };

  const removeBudgetItem = (index) => {
    setBudgetItems(prev => prev.filter((_, i) => i !== index));
  };

  const submitBudgetForOrder = (e) => {
    e.preventDefault();
    if (!budgetOrder) return;
    if (!budgetItems.length) {
      setMessage('Agregue al menos un item al presupuesto antes de guardar.');
      return;
    }
    const id = budgetOrder.id;
    const total = budgetItems.reduce((s, it) => s + (it.total || 0), 0);
    const newPresupuestoEntry = { items: budgetItems, total, note: budgetNote || '', date: new Date().toISOString() };

    const updated = orders.map(o => {
      if (o.id !== id) return o;
      const presupuestos = [...(o.presupuestos || []), newPresupuestoEntry];
      const totalPresupuesto = presupuestos.reduce((s, p) => s + (p.total || 0), 0);
      return { ...o, presupuestos, totalPresupuesto };
    });

    setOrders(updated);
    const client = clients.find(c => c.email === budgetOrder.clientEmail);
    const phone = client ? client.phone : budgetOrder.phone;
    const text = `Se agregó un presupuesto al pedido #${id}. Total agregado: $${total.toFixed(2)}. Total presupuestos acumulado: $${updated.find(u => u.id === id).totalPresupuesto.toFixed(2)}.`;
    sendWhatsApp(phone, text);
    setMessage(`Presupuesto agregado a pedido #${id} y notificado por WhatsApp.`);
    closeBudgetModal();
  };

  // Servicios pre-cargados y CRUD mínimo
  const addService = () => {
    const s = (newService || '').trim();
    if (!s) return setMessage('Ingrese nombre de servicio.');
    setServices(prev => [...prev, s]);
    setNewService('');
    setMessage('');
  };
  const removeService = (idx) => setServices(prev => prev.filter((_, i) => i !== idx));

  const addTeamMember = (e) => {
    e?.preventDefault();
    if (!newMember.fullName || !newMember.role) return setMessage('Nombre y rol son obligatorios.');
    const id = `t${Date.now()}`;
    setTeam(prev => [...prev, { id, ...newMember }]);
    setNewMember({ fullName: '', role: '', phone: '', email: '' });
    setMessage('');
    setShowTeamModal(false);
  };
  const removeTeamMember = (id) => setTeam(prev => prev.filter(m => m.id !== id));

  // asignar miembro del equipo a un pedido
  const assignMemberToOrder = (orderId, memberId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, assignedTo: memberId } : o));
    setMessage(memberId ? 'Miembro asignado al pedido.' : 'Asignación removida.');
  };

  // helper para formatear domicilio (reuse)
  const formatAddress = (addr = {}) => {
    if (!addr) return '-';
    const parts = [];
    if (addr.locality) parts.push(addr.locality);
    const streetPart = [addr.street, addr.number].filter(Boolean).join(' ');
    if (streetPart) parts.push(streetPart);
    if (addr.type === 'departamento') {
      parts.push(`Depto · Piso ${addr.floor || '-'} · Puerta ${addr.door || '-'}`);
    } else if (addr.type) {
      parts.push(addr.type);
    }
    return parts.join(' · ');
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
        <button className={`tab ${activeTab === 'services' ? 'tab-active' : ''}`} onClick={() => setActiveTab('services')}>Servicios</button>
        <button className={`tab ${activeTab === 'team' ? 'tab-active' : ''}`} onClick={() => setActiveTab('team')}>Equipo de trabajo</button>
      </div>

      {/* Tab content */}
      {activeTab === 'notifications' && (
        <section style={{ marginTop: 16 }}>
          {/* Barra horizontal de estados */}
          <div className="status-bar" style={{ marginBottom: 12 }}>
            {STATUS_LIST.map(s => {
              const count = orders.filter(o => o.status === s.key).length;
              return (
                <button
                  key={s.key}
                  className={`demo-btn ${activeStatus === s.key ? 'status-active' : ''}`}
                  onClick={() => setActiveStatus(s.key)}
                  title={`${s.label} — ${count} items`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{s.label}</span>
                    <span className="status-count" style={{ fontSize: 13 }}>{count}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Contenido del estado seleccionado: items en columna o mensaje centrado */}
          <div className="status-content" style={{ width: '100%' }}>
            <h3 style={{ color: 'var(--text)', textAlign: 'center', marginTop: 6 }}>
              {STATUS_LIST.find(s => s.key === activeStatus).label} ({ordersByStatus.length})
            </h3>

            {ordersByStatus.length === 0 ? (
              <div className="status-empty" style={{ textAlign: 'center', color: '#cfc6b0', marginTop: 12 }}>
                No tiene elementos
              </div>
            ) : (
              <div className="status-items" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                {ordersByStatus.map(o => {
                  const client = clients.find(c => c.email === o.clientEmail);
                  const clientName = client ? `${client.fullName} ${client.lastName}` : o.clientEmail;
                  const addr = client?.address || o.address || {};
                  const direccion = addr
                    ? `${addr.locality || ''}${addr.locality ? ', ' : ''}${addr.street || ''} ${addr.number || ''}` +
                        (addr.type === 'departamento' ? ` · Piso ${addr.floor || '-'} · Puerta ${addr.door || '-'}` : ` · ${addr.type || 'Casa'}`)
                    : '-';

                  // visit schedule display (if any)
                  const visitInfo = o.visitSchedule
                    ? (o.visitSchedule.date && o.visitSchedule.time
                        ? `${o.visitSchedule.date} ${o.visitSchedule.time}`
                        : (o.visitSchedule.dateIso ? new Date(o.visitSchedule.dateIso).toLocaleString() : ''))
                    : '';

                  return (
                    <div key={o.id} className="status-item" style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ fontWeight: 700, color: 'var(--gold)' }}>#{o.id}</div>
                          <div style={{ flex: '1 1 220px', color: 'var(--text)', textAlign: 'left' }}>{o.description}</div>
                          <div style={{ color: '#dcd4c2', minWidth: 160, textAlign: 'right' }}>{clientName}</div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ color: 'var(--text)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                            {o.status === 'presupuestado' && o.totalPresupuesto > 0 && (
                              <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 14 }}>
                                ${o.totalPresupuesto.toFixed(2)}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <select
                              value={o.status}
                              onChange={(e) => handleStatusChange(o.id, e)}
                              className="input"
                              style={{ padding: '6px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: 'var(--text)', minWidth: 120 }}
                            >
                              {STATUS_LIST.map(s => (
                                <option key={s.key} value={s.key}>{s.label}</option>
                              ))}
                            </select>

                            <button className="btn demo-btn" onClick={() => sendWhatsApp(client ? client.phone : o.phone, `Consulta sobre pedido #${o.id}`)}>Contactar</button>
                            {o.status === 'presupuestado' && <button className="btn submit-btn" onClick={() => openBudgetModal(o)}>Agregar presupuesto</button>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                 })}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'clients' && (
        <section style={{ marginTop: 16 }}>
          <h3 style={{ textAlign: 'center', color: 'var(--text)' }}>Clientes</h3>

          <div className="tab-intro" style={{ marginTop: 8 }}>
            <div className="intro-text">Lista de clientes registrados</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
            <button className="btn submit-btn btn-plus clients-new-btn" onClick={() => openClientModal(null)} aria-label="Nuevo cliente">
              <span className="plus-icon" aria-hidden="true">＋</span>&nbsp;Nuevo cliente
            </button>
          </div>

          <div className="clients-list" style={{ marginTop: 6 }}>
            {clients.map(c => {
              const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.fullName || c.email;
              const address = formatAddress(c.address || {});
              return (
                <div key={c.email} className="client-item">
                  <div className="client-main">
                    <div className="client-row">
                      <div className="client-name">{fullName}</div>
                      <div className="client-contact">{c.phone} · {c.email}</div>
                    </div>
                    <div className="client-address">
                      <strong>Domicilio:</strong> {address}
                    </div>
                  </div>
                  <div className="client-actions">
                    <button className="btn demo-btn" onClick={() => openClientModal(c)}>Editar</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === 'services' && (
        <section style={{ marginTop: 16 }}>
          <h3 style={{ textAlign: 'center', color: 'var(--text)' }}>Servicios</h3>
          <div className="tab-intro" style={{ marginTop: 8 }}>
            <div className="intro-text">Lista de servicios disponibles</div>
          </div>

          {/* botón centrado que abre modal para nuevo servicio */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <button className="btn submit-btn btn-plus" onClick={openServiceModal} aria-label="Nuevo servicio">
              <span className="plus-icon" aria-hidden="true">＋</span>&nbsp;Nuevo servicio
            </button>
          </div>

          <div className="services-list centered-container" style={{ marginTop: 12 }}>
            {services.map((s, i) => (
              <div key={i} className="service-item">
                <div className="service-label">{s}</div>
                <button className="btn register-btn" onClick={() => removeService(i)}>Eliminar</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'team' && (
        <section style={{ marginTop: 16 }}>
          <h3 style={{ textAlign: 'center', color: 'var(--text)' }}>Equipo de trabajo</h3>
          <div className="tab-intro" style={{ marginTop: 8 }}>
            <div className="intro-text">Gestiona el personal disponible para asignaciones</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <button className="btn submit-btn btn-plus" onClick={openTeamModal} aria-label="Nuevo miembro">
              <span className="plus-icon" aria-hidden="true">＋</span>&nbsp;Nuevo miembro
            </button>
          </div>

          <div className="team-list centered-container" style={{ marginTop: 12 }}>
            {team.map(member => (
              <div key={member.id} className="team-member">
                <div className="team-meta">
                  <div className="team-name">{member.fullName} <span className="team-role">· {member.role}</span></div>
                  <div className="team-contact">{member.phone}{member.email ? ` · ${member.email}` : ''}</div>
                </div>
                <div className="team-actions">
                  <button className="btn register-btn" onClick={() => removeTeamMember(member.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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

            <form onSubmit={submitBudgetForOrder} style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              {/* Nuevo item */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  className="input"
                  placeholder="Descripción del item"
                  value={newBudgetItem.desc}
                  onChange={(e) => setNewBudgetItem(prev => ({ ...prev, desc: e.target.value }))}
                  style={{ flex: '1 1 240px' }}
                />
                <input
                  className="input"
                  placeholder="Cantidad"
                  value={newBudgetItem.qty}
                  onChange={(e) => setNewBudgetItem(prev => ({ ...prev, qty: e.target.value }))}
                  style={{ width: 100 }}
                />
                <input
                  className="input"
                  placeholder="Precio unitario"
                  value={newBudgetItem.unit}
                  onChange={(e) => setNewBudgetItem(prev => ({ ...prev, unit: e.target.value }))}
                  style={{ width: 140 }}
                />
                <button type="button" className="btn submit-btn" onClick={addBudgetItem}>Agregar item</button>
              </div>

              {/* Lista de items agregados */}
              {budgetItems.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}>
                  <strong>Items</strong>
                  <ul style={{ margin: '8px 0', padding: 0, listStyle: 'none' }}>
                    {budgetItems.map((it, idx) => (
                      <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>{it.desc}</div>
                          <div style={{ color: '#cfc6b0', fontSize: 13 }}>{it.qty} x ${it.unitPrice.toFixed(2)} = ${it.total.toFixed(2)}</div>
                        </div>
                        <div>
                          <button type="button" className="btn register-btn" onClick={() => removeBudgetItem(idx)}>Eliminar</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div style={{ textAlign: 'right', color: 'var(--text)' }}>
                    Total agregado: ${budgetItems.reduce((s, i) => s + (i.total || 0), 0).toFixed(2)}
                  </div>
                </div>
              )}

              <input
                value={budgetNote}
                onChange={(e) => setBudgetNote(e.target.value)}
                placeholder="Nota (opcional)"
                className="input"
              />

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn register-btn" onClick={closeBudgetModal}>Cancelar</button>
                <button type="submit" className="btn submit-btn" disabled={budgetItems.length === 0}>Guardar y notificar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para agendar visita técnica (solo triggered desde el cambio de estado a "visita_tecnica") */}
      {scheduleModalOpen && scheduleOrder && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--gold)' }}>Agendar visita técnica — Pedido #{scheduleOrder.id}</h3>
              <button className="btn register-btn" onClick={() => setScheduleModalOpen(false)}>Cerrar</button>
            </header>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!scheduleDate || !scheduleTime) {
                setMessage('Seleccione fecha y hora para la visita técnica.');
                return;
              }
              const dateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
              if (isNaN(dateTime)) {
                setMessage('Fecha y hora inválidas. Asegúrese de que el formato sea correcto.');
                return;
              }
              const isoString = dateTime.toISOString();
              updateOrder(scheduleOrder.id, 'visita_tecnica');
              setMessage(`Visita técnica agendada para el pedido #${scheduleOrder.id}.`);
              setScheduleModalOpen(false);
            }} style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              <input
                type="date"
                className="input"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                style={{ maxWidth: 200 }}
              />
              <input
                type="time"
                className="input"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                style={{ maxWidth: 200 }}
              />

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" className="btn register-btn" onClick={() => setScheduleModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn submit-btn">Guardar y notificar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para agregar miembro del equipo */}
      {showTeamModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--gold)' }}>Agregar miembro — Equipo</h3>
              <button className="btn register-btn" onClick={closeTeamModal}>Cerrar</button>
            </header>

            <form onSubmit={addTeamMember} style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              <input className="input" placeholder="Nombre completo" value={newMember.fullName} onChange={(e) => setNewMember(prev => ({ ...prev, fullName: e.target.value }))} />
              <input className="input" placeholder="Rol" value={newMember.role} onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))} />
              <input className="input" placeholder="Teléfono" value={newMember.phone} onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))} />
              <input className="input" placeholder="Email (opcional)" value={newMember.email} onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))} />

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn register-btn" onClick={closeTeamModal}>Cancelar</button>
                <button type="submit" className="btn submit-btn">Agregar miembro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para nuevo servicio */}
      {showServiceModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--gold)' }}>Nuevo servicio</h3>
              <button className="btn register-btn" onClick={closeServiceModal}>Cerrar</button>
            </header>
            <form onSubmit={(e) => { e.preventDefault(); addService(); setShowServiceModal(false); }} style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              <input className="input" placeholder="Nombre del servicio" value={newService} onChange={(e) => setNewService(e.target.value)} autoFocus />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn register-btn" onClick={closeServiceModal}>Cancelar</button>
                <button type="submit" className="btn submit-btn">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}