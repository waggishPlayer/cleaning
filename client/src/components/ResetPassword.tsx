import React, { useState } from 'react';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await apiService.changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/profile-settings'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10">
      <div className="bg-[#18181b] rounded-xl shadow-lg p-8 border border-gray-800 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-[#00ddff] text-center">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#00ddff] mb-1">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#00ddff] mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#00ddff] mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
            />
          </div>
          {error && <div className="text-red-400 text-center">{error}</div>}
          {success && <div className="text-green-400 text-center">{success}</div>}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#00ddff] text-black px-8 py-2 rounded-lg hover:bg-[#c1ff72] transition-colors font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 