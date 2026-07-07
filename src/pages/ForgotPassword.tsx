import React, { use, useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || 'Check your email for a reset link.');
    } catch (err) {
      setMessage('Something went wrong.');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-center my-7">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="border p-3 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          disabled={loading}
          type="submit"
          className="bg-blue-700 text-white p-3 rounded-lg hover:opacity-90"
        >
          {loading ? 'Sending Password Reset Link...' : 'Send Reset Link'}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
    </div>
  );
}
