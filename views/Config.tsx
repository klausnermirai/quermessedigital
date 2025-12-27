
import React, { useState, useEffect } from 'react';
import { Save, UserPlus, Shield, Mail, Key, Trash2, Smartphone, Monitor, User as UserIcon, Calendar, Landmark, Edit3, Plus, X, ExternalLink, Info } from 'lucide-react';
import { User, UserRole, Event, DateRange } from '../types';

interface ConfigProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentEvent: Event | null;
  onUpdateEvent: (event: Event) => void;
}

const Config: React.FC<ConfigProps> = ({ users, setUsers, currentEvent, onUpdateEvent }) => {
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.USER);
  const [eventName, setEventName] = useState(currentEvent?.name || '');
  const [eventRanges, setEventRanges] = useState<DateRange[]>(currentEvent?.dateRanges || []);

  useEffect(() => {
    if (currentEvent) {
      setEventName(currentEvent.name);
      setEventRanges(currentEvent.dateRanges);
    }
  }, [currentEvent]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    const newUser: User = { id: Math.random().toString(36).substr(2, 4), name: newUserName, email: newUserEmail, role: newUserRole };
    setUsers(prev => [...prev, newUser]);
    setNewUserName(''); setNewUserEmail('');
    alert('Convite para usuário registrado (Note: Ele deve se cadastrar com este e-mail).');
  };

  const handleUpdateEventDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent || !eventName || eventRanges.length === 0) return;
    onUpdateEvent({ ...currentEvent, name: eventName, dateRanges: eventRanges });
    alert('Dados do evento atualizados com sucesso!');
  };

  const addRange = () => setEventRanges([...eventRanges, { start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] }]);
  const removeRange = (index: number) => setEventRanges(eventRanges.filter((_, i) => i !== index));
  const updateRange = (index: number, field: keyof DateRange, value: string) => {
    const updated = [...eventRanges];
    updated[index] = { ...updated[index], [field]: value };
    setEventRanges(updated);
  };

  const removeUser = (id: string) => {
    if (confirm('Deseja remover este acesso?')) setUsers(prev => prev.filter(u => u.id !== id));
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return <Shield size={16} className="text-red-600" />;
      case UserRole.PDV: return <Monitor size={16} className="text-blue-600" />;
      case UserRole.PDV_MOBILE: return <Smartphone size={16} className="text-orange-600" />;
      default: return <UserIcon size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl border-t-4 border-t-red-600">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tighter flex items-center gap-2">
              <Landmark size={20} className="text-red-600" /> Dados da Quermesse
            </h3>
            <form onSubmit={handleUpdateEventDetails} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Nome do Evento</label>
                <div className="relative">
                  <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-800" value={eventName} onChange={(e) => setEventName(e.target.value)} required />
                </div>
              </div>
              <div>
                 <div className="flex justify-between items-center mb-2 px-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Datas da Festa</label>
                    <button type="button" onClick={addRange} className="text-[10px] font-black text-red-600 uppercase flex items-center gap-1 hover:underline"><Plus size={14} /> Adicionar</button>
                 </div>
                 <div className="space-y-3">
                    {eventRanges.map((range, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative group">
                         {eventRanges.length > 1 && <button type="button" onClick={() => removeRange(idx)} className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-600 p-1.5 rounded-full shadow-sm border"><X size={12} /></button>}
                         <div className="grid grid-cols-2 gap-2">
                            <input type="date" className="w-full p-2 bg-white border rounded-lg text-[10px] font-bold" value={range.start} onChange={e => updateRange(idx, 'start', e.target.value)} />
                            <input type="date" className="w-full p-2 bg-white border rounded-lg text-[10px] font-bold" value={range.end} onChange={e => updateRange(idx, 'end', e.target.value)} />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                <Save size={18} /> Salvar Alterações
              </button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Novo Integrante</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-800" placeholder="Nome" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
              <input className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-800" placeholder="E-mail" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
              <select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as UserRole)}>
                <option value={UserRole.ADMIN}>Administrador Geral</option>
                <option value={UserRole.USER}>Usuário de Painéis</option>
                <option value={UserRole.PDV}>Operador PDV (Fixo)</option>
              </select>
              <button className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl shadow-red-100 flex items-center justify-center gap-2"><UserPlus size={18} /> Cadastrar</button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Equipe Cadastrada</h3>
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border shadow-sm group-hover:text-red-600 transition-all">{getRoleIcon(u.role)}</div>
                    <div>
                      <p className="font-black text-gray-900 uppercase text-xs">{u.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full border bg-white">{u.role}</span>
                    <button onClick={() => removeUser(u.id)} className="p-2 text-gray-300 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Config;
