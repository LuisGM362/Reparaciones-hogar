import React, { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Aquí puedes agregar la lógica para autenticar al usuario
    console.log('Usuario:', username);
    console.log('Contraseña:', password);
  };

  const handleRegister = () => {
    // Cambia la ruta si tienes una página de registro
    window.location.href = '/register';
  };

  return (
    <div className="app-root">
      <div className="login-card">
        <h2 className="welcome">Bienvenidos a Reparaciones para todo tu Hogar</h2>

        <img src="/logo192.png" alt="Logo" className="logo" />
        <h1 className="title">Iniciar sesión</h1>

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

export default App;