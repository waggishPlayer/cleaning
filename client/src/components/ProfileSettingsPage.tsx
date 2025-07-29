import React, { useState, useRef } from 'react';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const ProfileSettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<{
    name: string;
    phone: string;
    email: string;
    profileImage: string;
    dateOfBirth: string;
    gender: User['gender'];
  }>({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    profileImage: user?.profileImage || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: (user?.gender as User['gender']) || '',
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user?.profileImage || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      let profileImageUrl = form.profileImage;
      if (profileImageFile) {
        // For now, convert to base64 and store as string (in production, upload to S3 or server)
        const base64 = await toBase64(profileImageFile);
        profileImageUrl = base64 as string;
      }
      await updateUser({
        name: form.name,
        phone: form.phone,
        email: form.email,
        profileImage: profileImageUrl,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  function toBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10">
      <div className="bg-[#18181b] rounded-xl shadow-lg p-8 border border-gray-800 max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-[#00ddff] text-center">Profile Settings</h1>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <img
                src={previewUrl || '/pp.png'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#00ddff] shadow-lg cursor-pointer hover:opacity-80"
                onClick={handleImageClick}
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
              />
              <span className="absolute bottom-0 right-0 bg-[#00ddff] text-black rounded-full p-1 text-xs font-bold border border-white cursor-pointer group-hover:scale-110 transition-transform" onClick={handleImageClick}>
                ✎
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Click to change profile picture</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#00ddff] mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#00ddff] mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#00ddff] mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#00ddff] mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#00ddff] mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          {error && <div className="text-red-400 text-center">{error}</div>}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#00ddff] text-black px-8 py-2 rounded-lg hover:bg-[#c1ff72] transition-colors font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
        <div className="flex justify-center mt-4">
          <button
            type="button"
            className="bg-[#c1ff72] text-black px-8 py-2 rounded-lg hover:bg-[#00ddff] transition-colors font-semibold"
            onClick={() => navigate('/reset-password')}
          >
            Reset Password
          </button>
        </div>
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-[#00ddff] mb-4">Your Addresses</h2>
          <button
            onClick={() => navigate('/addresses')}
            className="mb-4 bg-gradient-to-r from-[#00ddff] to-[#c1ff72] text-black px-4 py-2 rounded-lg hover:from-[#c1ff72] hover:to-[#00ddff] transition-all font-medium"
          >
            Manage Addresses
          </button>
        </div>
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-[#00ddff] mb-4">Your Cars</h2>
          <button
            onClick={() => navigate('/vehicles')}
            className="mb-4 bg-[#c1ff72] text-black px-4 py-2 rounded-lg hover:bg-[#00ddff] transition-colors font-medium"
          >
            Manage Cars
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage; 