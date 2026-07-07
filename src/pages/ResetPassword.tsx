import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      setMessage(data.message || 'Password reset successful!');
      if (res.ok) {
        setTimeout(() => navigate('/sign-in'), 2000);
      }
    } catch (error) {
      console.log(error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-center my-7">Reset Password</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            className="border p-3 rounded-lg w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer text-gray-600 hover:text-gray-800"
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-green-700 text-white p-3 rounded-lg hover:opacity-90 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Updating Password...' : 'Reset Password'}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
}
