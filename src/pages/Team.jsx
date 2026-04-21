import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import data from '../data/data.json';
import { ImagePlus, Mail, MoreVertical, Users } from 'lucide-react';

const Team = () => {
  const { t } = useLanguage();
  const [members, setMembers] = useState(data.team);
  const [form, setForm] = useState({
    name: '',
    role: 'Dasturchi',
    specialization: '',
    photo: '',
  });

  const handleAddMember = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    setMembers((current) => [
      ...current,
      {
        id: current.length + 1,
        name,
        role: form.role.trim() || 'Dasturchi',
        specialization: form.specialization.trim() || 'General Engineering',
        photo: form.photo.trim(),
      },
    ]);

    setForm({
      name: '',
      role: 'Dasturchi',
      specialization: '',
      photo: '',
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{t.team_members}</h1>
          <p className="text-sm text-gray-500">Manage your system operation team</p>
        </div>
        <span className="rounded-full bg-blue-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          {members.length} members
        </span>
      </div>

      <form
        onSubmit={handleAddMember}
        className="mb-8 grid gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-4"
      >
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Name"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <input
          value={form.role}
          onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          placeholder="Role"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <input
          value={form.specialization}
          onChange={(event) =>
            setForm((current) => ({ ...current, specialization: event.target.value }))
          }
          placeholder="Specialization"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <div className="flex gap-3">
          <input
            value={form.photo}
            onChange={(event) => setForm((current) => ({ ...current, photo: event.target.value }))}
            placeholder="Image URL (/team/name.png)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-700"
          >
            <ImagePlus size={14} />
            Add
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  className="h-16 w-16 rounded-2xl border border-slate-200 object-cover shadow-lg shadow-blue-500/10 dark:border-slate-700"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20">
                  {member.name[0]}
                </div>
              )}
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <MoreVertical size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
            <p className="text-blue-600 dark:text-blue-400 text-sm font-bold mb-4">{member.role}</p>
            
            <div className="space-y-3 py-4 border-t border-gray-50 dark:border-slate-800">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="p-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg">
                  <Users size={14} />
                </div>
                <span>{member.specialization}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="p-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg">
                  <Mail size={14} />
                </div>
                <span>{member.name.toLowerCase().replaceAll(' ', '.')}@aes-smart.com</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
