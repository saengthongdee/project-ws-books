import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div>
      <h1>Welcome to home page user</h1>
      <button onClick={handleLogout} className='border p-4 bg-red-500 text-white rounded-lg'>
        Logout
      </button>
    </div>
  );
}

export default Home;
