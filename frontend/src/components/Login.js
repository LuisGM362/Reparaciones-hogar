import React, { useState } from 'react';
import '../App.css';
import AdminPanel from './AdminPanel';

function Login() {
  // Usuarios precargados (solo para demo / desarrollo)
  const users = [
    { username: 'admin', password: 'admin123', role: 'Administrador' },
    { username: 'cliente1', password: 'cliente123', role: 'Cliente 1' },
    { username: 'cliente2', password: 'cliente123', role: 'Cliente 2' },
  ];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [loggedUser, setLoggedUser] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = users.find(u => u.username === username && u.password === password);
    if (found) {
      setLoggedUser(found);
      setAuthMessage(`Bienvenido ${found.role} (${found.username})`);
      if (found.username === 'admin') {
        setShowAdmin(true); // abrir panel admin
      }
      console.log('Login OK:', found);
    } else {
      setAuthMessage('Credenciales inválidas');
      setLoggedUser(null);
    }
  };

  const handleRegister = () => {
    window.location.href = '/register';
  };

  const autofill = (user) => {
    setUsername(user.username);
    setPassword(user.password);
    setAuthMessage(`Autocompletado: ${user.username}`);
  };

  const openPdf = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowPdf(true);
  };

  const closePdf = () => {
    setShowPdf(false);
  };

  // Si se abrió panel admin, mostrarlo
  if (showAdmin) {
    return <AdminPanel onLogout={() => { setShowAdmin(false); setLoggedUser(null); setUsername(''); setPassword(''); setAuthMessage(''); }} />;
  }

  return (
    <div className="app-root">
      <div className="login-card">
        {/* Texto de bienvenida con estilo diferenciado */}
        <h2 className="welcome-special">Bienvenidos a Reparaciones — Todo para tu Hogar</h2>

        <img src="/logo192.png" alt="Logo" className="logo" />
        {/* Título de login simple */}
        <h1 className="title-simple">Iniciar sesión</h1>

        <div className="demo-info">
          <div className="demo-label">Usuarios pre-cargados (demo):</div>
          <div className="demo-list">
            {users.map(u => (
              <button
                key={u.username}
                type="button"
                className="demo-btn"
                onClick={() => autofill(u)}
                title={`Autocompletar ${u.username}`}
              >
                {u.username}
              </button>
            ))}
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="label">
            Usuario
            <input
              className="input"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label className="label">
            Contraseña
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button className="btn submit-btn" type="submit">Iniciar sesión</button>
        </form>

        {authMessage && <div className="auth-message">{authMessage}</div>}

        <button className="btn register-btn" type="button" onClick={handleRegister}>
          Registrarse como cliente
        </button>

        <div className="footer">
          <button className="pdf-btn" onClick={openPdf}>
            Ver carta de presentación (PDF)
          </button>
        </div>
      </div>

      {showPdf && (
        <div className="pdf-overlay" role="dialog" aria-modal="true">
          <div className="pdf-container">
            <iframe
              src="/Reparaciones-para-tu-Hogar.pdf"
              title="Carta de presentación"
              className="pdf-iframe"
            />
            <div className="pdf-actions">
              <button className="btn submit-btn" onClick={closePdf}>Volver al inicio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;