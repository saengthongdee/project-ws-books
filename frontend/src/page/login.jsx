import React, { useState, useEffect } from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function Login() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    let user = null;
    
    try {
      const storedUser = localStorage.getItem("user");
      
      if (storedUser && storedUser !== "undefined") {
        user = JSON.parse(storedUser);
      }
    } catch (err) {
      localStorage.removeItem("user");
    }

    if (user) {
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    setError('');

    if (!username?.trim() || !password?.trim()) return;
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/login', {
        username,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);

        if (response.data.user) {

          localStorage.setItem('user', JSON.stringify(response.data.user));

          const user = response.data.user;

          if (user?.role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/home');
          }
        }
      }

    } catch (error) {
      console.error('Login error:', error);
      setError('username หรือ password ไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      <div className='w-100 h-[90%]'>
        <div className='h-[30%] flex justify-center items-center'>
          <img
            className='w-auto h-[90%]'
            src="https://tse4.mm.bing.net/th/id/OIP.liEh0SyAT1TG3y-cjlDwcgHaHf?rs=1&pid=ImgDetMain&o=7&rm=3"
            alt="logo"
          />
        </div>

        <h1 className='uppercase text-5xl text-center py-2 text-[#41826e] font-bold'>su-net</h1>
        <h2 className='h-10 flex justify-center text-lg items-center text-black/30 font-semibold'>
          Single Sign On (SSO)
        </h2>

        {error && (
          <div className='bottom-0 text-red-700 px-4 py-3 rounded-lg mx-auto max-w-md mb-4 text-center'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='flex flex-col gap-10 py-10'>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            type="text"
            placeholder='username/ชื่อผู้ใช้'
            className='border-2 text-lg border-[#41826e] p-2 px-6 rounded-[30px] shadow-md shadow-black/30'
            disabled={loading}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            placeholder='password/รหัสผ่าน'
            className='border-2 text-lg border-[#41826e] p-2 px-6 rounded-[30px] shadow-md shadow-black/30'
            disabled={loading}
          />
          <button
            className='border p-4 rounded-[30px] uppercase font-bold text-white bg-[#41826e] shadow-md shadow-black/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
            type='submit'
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ/Login'}
          </button>
        </form>

        <h5 className='text-xs text-black/40 text-center'>สำนักดิจิทัลเทคโนโลยี มหาวิทยาลัยศิลปากร</h5>
        <h5 className='text-xs text-black/40 text-center'>Bureau of Digital Technology, Silpakorn University</h5>
      </div>
    </div>
  )
}

export default Login;
