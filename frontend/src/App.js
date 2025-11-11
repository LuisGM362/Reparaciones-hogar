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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Iniciar sesión</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Usuario:
            <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <br />
          <label>
            Contraseña:
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <br />
          <button type="submit">Iniciar sesión</button>
        </form>
      </header>
    </div>
  );
}

export default App;