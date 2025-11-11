import React, { useState } from 'react';
import '../App.css'; // <- ruta corregida

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

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = users.find(u => u.username === username && u.password === password);
    if (found) {
      setLoggedUser(found);
      setAuthMessage(`Bienvenido ${found.role} (${found.username})`);
      // Aquí podrías redirigir o guardar token, según tu lógica
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

  return (
    <div className="app-root">
      <div className="login-card">
        <h2 className="welcome">Bienvenidos a Reparaciones para todo tu Hogar</h2>

        <img src="/logo192.png" alt="Logo" className="logo" />
        <h1 className="title">Iniciar sesión</h1>

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
          <a
            className="pdf-btn"
            href="/carta_presentacion.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver carta de presentación (PDF)
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;