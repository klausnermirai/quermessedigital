
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, FileText, CheckCircle2, Clock, XCircle, X, 
  Save, FileDown, Printer, Filter, ChevronRight, Hash, User, 
  Send, AlertCircle, Building, ClipboardCheck
} from 'lucide-react';
import { Oficio } from '../types';

const Oficios: React.FC = () => {
  const [oficios, setOficios] = useState<Oficio[]>([
    { 
      id: '1', 
      protocolo: '2024-001', 
      destino: 'Supermercado Central S.A', 
      responsavel: 'Gerente Ricardo', 
      tipo: 'Insumos', 
      status: 'Entregue', 
      dataEnvio: '2024-05-12',
      descricao: 'Solicitação de 50 fardos de arroz e 20kg de feijão para a Galinhada.'
    },
    { 
      id: '2', 
      protocolo: '2024-002', 
      destino: 'Prefeitura Municipal - Sec. Cultura', 
      responsavel: 'Secretário André', 
      tipo: 'Serviços', 
      status: 'Pendente', 
      dataEnvio: '2024-05-15',
      descricao: 'Ofício solicitando tendas e som para o palco principal da Quermesse.'
    },
    { 
      id: '3', 
      protocolo: '2024-003', 
      destino: 'Loja de Móveis Estrela', 
      responsavel: 'Dona Maria', 
      tipo: 'Prendas', 
      status: 'Aprovado', 
      dataEnvio: '2024-05-10',
      descricao: 'Doação de uma geladeira para o Leilão Principal.'
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [newOficio, setNewOficio] = useState<Partial<Oficio>>({
    tipo: 'Insumos',
    status: 'Pendente',
    dataEnvio: new Date().toISOString().split('T')[0],
  });

  const filteredOficios = useMemo(() => {
    return oficios.filter(o => {
      const matchesSearch = o.destino.toLowerCase().includes(filter.toLowerCase()) || 
                           o.protocolo.includes(filter);
      const matchesType = selectedType === 'Todos' || o.tipo === selectedType;
      return matchesSearch && matchesType;
    });
  }, [oficios, filter, selectedType]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOficio.destino || !newOficio.responsavel) return;

    const entry: Oficio = {
      id: Math.random().toString(36).substr(2, 9),
      protocolo: `2024-00${oficios.length + 1}`,
      destino: newOficio.destino!,
      responsavel: newOficio.responsavel!,
      tipo: newOficio.tipo as any,
      status: newOficio.status as any,
      dataEnvio: newOficio.dataEnvio!,
      descricao: newOficio.descricao || '',
    };

    setOficios([entry, ...oficios]);
    setIsModalOpen(false);
    setNewOficio({
      tipo: 'Insumos',
      status: 'Pendente',
      dataEnvio: new Date().toISOString().split('T')[0],
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado': return <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100"><CheckCircle2 size={12} /> {status}</span>;
      case 'Entregue': return <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100"><Send size={12} /> {status}</span>;
      case 'Pendente': return <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100"><Clock size={12} /> {status}</span>;
      default: return <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100"><XCircle size={12} /> {status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Centralizado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic leading-none">Gestão de Ofícios</h3>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Controle de solicitações formais e protocolos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white px-8 py-4 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95 flex items-center gap-3"
        >
          <Plus size={20} /> Emitir Novo Ofício
        </button>
      </div>

      {/* Seção de Filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input 
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-red-500/10 font-bold text-gray-700 transition-all" 
            placeholder="Buscar por protocolo ou destino..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="flex bg-white p-1.5 rounded-[2rem] border border-gray-100 shadow-sm overflow-x-auto no-scrollbar lg:col-span-2">
          {['Todos', 'Insumos', 'Prendas', 'Financeiro', 'Serviços'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex-1 px-4 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedType === type ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Cards de Ofícios */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredOficios.length > 0 ? filteredOficios.map((o) => (
          <div key={o.id} className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden group hover:scale-[1.01] transition-all">
            <div className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><FileText size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] leading-none mb-1">{o.tipo}</p>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Protocolo: {o.protocolo}</p>
                  </div>
                </div>
                {getStatusBadge(o.status)}
              </div>

              <div className="space-y-4 flex-1">
                <div>
                   <h4 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight">{o.destino}</h4>
                   <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase"><User size={12} className="text-red-500" /> {o.responsavel}</div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase"><Hash size={12} className="text-red-500" /> {o.dataEnvio}</div>
                   </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                  <p className="text-xs text-gray-600 font-medium leading-relaxed italic line-clamp-2">"{o.descricao}"</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all" title="Ver Detalhes"><ClipboardCheck size={18} /></button>
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-gray-900 transition-all" title="Baixar PDF"><FileDown size={18} /></button>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase tracking-widest group-hover:text-red-600 transition-colors">
                  Editar Ofício <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-24 bg-gray-50 border-4 border-dashed border-gray-100 rounded-[4rem] flex flex-col items-center justify-center text-gray-300">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 opacity-50"><FileText size={48} /></div>
            <p className="font-black uppercase text-sm tracking-widest">Nenhum ofício encontrado</p>
            <p className="text-[10px] font-bold uppercase mt-2">Ajuste os filtros ou emita um novo documento</p>
          </div>
        )}
      </div>

      {/* Modal Novo Ofício */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-xl"><Send size={28} /></div>
                <div>
                   <h4 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Emissão de Ofício</h4>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preencha os dados do destinatário</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-3 rounded-2xl border border-gray-100 text-gray-400 hover:text-red-600 shadow-sm transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-2">Destino (Empresa ou Órgão)</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      required
                      autoFocus
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 outline-none focus:ring-4 focus:ring-red-500/10 transition-all" 
                      placeholder="Ex: Supermercado do Zé"
                      value={newOficio.destino || ''}
                      onChange={(e) => setNewOficio({...newOficio, destino: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-2">Pessoa de Contato / Cargo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 outline-none focus:ring-4 focus:ring-red-500/10 transition-all" 
                      placeholder="Ex: João da Silva (Gerente)"
                      value={newOficio.responsavel || ''}
                      onChange={(e) => setNewOficio({...newOficio, responsavel: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-2">Tipo de Ofício</label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 outline-none focus:ring-4 focus:ring-red-500/10 transition-all appearance-none cursor-pointer"
                    value={newOficio.tipo}
                    onChange={(e) => setNewOficio({...newOficio, tipo: e.target.value as any})}
                  >
                    <option value="Insumos">Doação de Insumos</option>
                    <option value="Prendas">Doação de Prendas</option>
                    <option value="Financeiro">Auxílio Financeiro</option>
                    <option value="Serviços">Prestação de Serviço</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-2">Descrição da Solicitação</label>
                <textarea 
                  rows={4}
                  className="w-full p-6 bg-gray-50 border-none rounded-[2rem] font-bold text-gray-700 outline-none focus:ring-4 focus:ring-red-500/10 transition-all resize-none italic"
                  placeholder="Escreva detalhadamente o que está sendo solicitado..."
                  value={newOficio.descricao || ''}
                  onChange={(e) => setNewOficio({...newOficio, descricao: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-5 rounded-3xl font-black uppercase text-xs text-gray-400 tracking-widest hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-8 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-red-100 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Save size={18} /> Registrar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Oficios;
