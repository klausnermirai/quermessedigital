
import React, { useState } from 'react';
import { Wrench, Plus, User, DollarSign, CheckCircle, Clock, X, Trash2, Edit3, ClipboardList } from 'lucide-react';
import { Servico } from '../types';

interface ServicosProps {
  services: Servico[];
  setServices: React.Dispatch<React.SetStateAction<Servico[]>>;
}

const Servicos: React.FC<ServicosProps> = ({ services, setServices }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Servico | null>(null);

  const [form, setForm] = useState({
    descricao: '',
    prestador: '',
    status: 'previsto' as Servico['status'],
    valorOrcado: '',
    valorFinal: '',
    categoria: 'Serviços'
  });

  const handleOpenCreate = () => {
    setForm({ descricao: '', prestador: '', status: 'previsto', valorOrcado: '', valorFinal: '', categoria: 'Serviços' });
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (s: Servico) => {
    setEditingService(s);
    setForm({
      descricao: s.descricao,
      prestador: s.prestador || '',
      status: s.status,
      valorOrcado: s.valorOrcado?.toString() || '',
      valorFinal: s.valorFinal?.toString() || '',
      categoria: s.categoria
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao) return;

    const data: Servico = {
      id: editingService ? editingService.id : Math.random().toString(36).substr(2, 9),
      descricao: form.descricao,
      prestador: form.prestador,
      status: form.status,
      valorOrcado: form.valorOrcado ? parseFloat(form.valorOrcado) : undefined,
      valorFinal: form.valorFinal ? parseFloat(form.valorFinal) : undefined,
      categoria: form.categoria
    };

    if (editingService) {
      setServices(prev => prev.map(s => s.id === editingService.id ? data : s));
    } else {
      setServices(prev => [data, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir este serviço?')) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const statusColors = {
    previsto: 'bg-gray-100 text-gray-600 border-gray-200',
    orcado: 'bg-blue-100 text-blue-600 border-blue-200',
    confirmado: 'bg-green-100 text-green-600 border-green-200'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Gestão de Serviços</h3>
          <p className="text-sm text-gray-500">Previsão, orçamentos e confirmação de despesas de infraestrutura</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
        >
          <Plus size={20} /> Nova Previsão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${statusColors[s.status]}`}>
                  {s.status}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-500"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>

              <h4 className="text-lg font-black text-gray-900 mb-1">{s.descricao}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-4">
                <ClipboardList size={12} /> {s.categoria}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={14} className="text-gray-400" />
                  <span className="font-medium">{s.prestador || 'A definir prestador'}</span>
                </div>
                
                {s.status === 'orcado' && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={14} className="text-blue-500" />
                    <span className="text-gray-500">Orçamento:</span>
                    <span className="font-black text-blue-600">R$ {s.valorOrcado?.toFixed(2)}</span>
                  </div>
                )}

                {s.status === 'confirmado' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-[10px] text-green-600 font-black uppercase mb-1">Valor Confirmado</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-green-700">R$ {s.valorFinal?.toFixed(2)}</span>
                      <CheckCircle size={20} className="text-green-600" />
                    </div>
                  </div>
                )}

                {s.status === 'previsto' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 text-gray-500 italic text-xs">
                    <Clock size={16} /> Aguardando orçamento/cotação
                  </div>
                )}
              </div>
            </div>
            
            {s.status !== 'confirmado' && (
              <button 
                onClick={() => handleEdit(s)}
                className="w-full bg-gray-50 border-t border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors uppercase tracking-tight"
              >
                Atualizar Status
              </button>
            )}
          </div>
        ))}
        
        {services.length === 0 && (
          <div className="col-span-full py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400">
            <Wrench size={48} className="mb-2 opacity-20" />
            <p className="font-bold">Nenhum serviço lançado ainda.</p>
            <button onClick={handleOpenCreate} className="mt-4 text-red-600 font-bold hover:underline">Adicionar primeira previsão</button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h4 className="text-lg font-bold text-gray-800">
                {editingService ? 'Editar Serviço' : 'Nova Previsão de Serviço'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Descrição do Serviço</label>
                <input required autoFocus className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium" placeholder="Ex: Show Sertanejo" value={form.descricao} onChange={(e) => setForm({...form, descricao: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Status Atual</label>
                <select className="w-full p-3 border rounded-xl outline-none bg-white font-medium" value={form.status} onChange={(e) => setForm({...form, status: e.target.value as Servico['status']})}>
                  <option value="previsto">Previsto (Necessidade)</option>
                  <option value="orcado">Orçado (Cotação feita)</option>
                  <option value="confirmado">Confirmado (Despesa Real)</option>
                </select>
              </div>

              {(form.status === 'orcado' || form.status === 'confirmado') && (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Prestador de Serviço</label>
                  <input className="w-full p-3 border rounded-xl outline-none font-medium" placeholder="Nome da empresa ou profissional" value={form.prestador} onChange={(e) => setForm({...form, prestador: e.target.value})} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Vlr. Orçado (Estimado)</label>
                  <input type="number" step="0.01" className="w-full p-3 border rounded-xl outline-none font-medium" placeholder="0.00" value={form.valorOrcado} onChange={(e) => setForm({...form, valorOrcado: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Vlr. Final (Real)</label>
                  <input type="number" step="0.01" className="w-full p-3 border rounded-xl outline-none font-black text-green-600" placeholder="0.00" disabled={form.status !== 'confirmado'} value={form.valorFinal} onChange={(e) => setForm({...form, valorFinal: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Servicos;
