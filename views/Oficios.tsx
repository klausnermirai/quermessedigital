
import React, { useState } from 'react';
import { Plus, Search, FileText, CheckCircle2, Clock, XCircle, X, Save } from 'lucide-react';

interface OficioData {
  id: string;
  destino: string;
  tipo: string;
  status: string;
  data: string;
}

const Oficios: React.FC = () => {
  const [oficios, setOficios] = useState<OficioData[]>([
    { id: '1', destino: 'Supermercado Central', tipo: 'Doação de Insumos', status: 'entregue', data: '2024-05-12' },
    { id: '2', destino: 'Comunidade Rural', tipo: 'Doações Financeiras', status: 'aguardando', data: '2024-05-15' },
    { id: '3', destino: 'Prefeitura Municipal', tipo: 'Solicitação de Prendas', status: 'devolutiva', data: '2024-05-10' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [newOficio, setNewOficio] = useState({
    destino: '',
    tipo: 'Vendas Antecipadas',
    data: new Date().toISOString().split('T')[0],
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOficio.destino) return;

    const entry: OficioData = {
      id: Math.random().toString(36).substr(2, 9),
      destino: newOficio.destino,
      tipo: newOficio.tipo,
      status: 'aguardando',
      data: newOficio.data,
    };

    setOficios([entry, ...oficios]);
    setIsModalOpen(false);
    setNewOficio({
      destino: '',
      tipo: 'Vendas Antecipadas',
      data: new Date().toISOString().split('T')[0],
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'entregue': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'aguardando': return <Clock size={16} className="text-orange-500" />;
      case 'devolutiva': return <CheckCircle2 size={16} className="text-blue-500" />;
      default: return <XCircle size={16} className="text-gray-400" />;
    }
  };

  const filteredOficios = oficios.filter(o => 
    o.destino.toLowerCase().includes(filter.toLowerCase()) || 
    o.tipo.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Gestão de Ofícios Enviados</h3>
          <p className="text-sm text-gray-500">Acompanhe as solicitações e devolutivas do evento</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
        >
          <Plus size={20} /> Novo Ofício
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex gap-4">
           <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500/20" 
              placeholder="Filtrar destinos ou tipos..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b">
                <th className="px-6 py-4">Destino</th>
                <th className="px-6 py-4">Tipo de Solicitação</th>
                <th className="px-6 py-4">Data Envio</th>
                <th className="px-6 py-4">Situação</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOficios.length > 0 ? filteredOficios.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{o.destino}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-bold text-gray-600">{o.tipo}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(o.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 capitalize text-sm font-medium">
                      {getStatusIcon(o.status)}
                      {o.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-red-600 text-sm font-bold hover:underline">Ver Detalhes</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Nenhum ofício encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Ofício */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-red-500" size={20} /> Cadastrar Novo Ofício
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Destino (Empresa/Pessoa)</label>
                <input 
                  required
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                  placeholder="Ex: Supermercado do Zé"
                  value={newOficio.destino}
                  onChange={(e) => setNewOficio({...newOficio, destino: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Ofício</label>
                <select 
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  value={newOficio.tipo}
                  onChange={(e) => setNewOficio({...newOficio, tipo: e.target.value})}
                >
                  <option>Vendas Antecipadas</option>
                  <option>Doações Financeiras</option>
                  <option>Solicitação de Prendas</option>
                  <option>Doação de Insumos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Data de Envio</label>
                <input 
                  type="date"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={newOficio.data}
                  onChange={(e) => setNewOficio({...newOficio, data: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                >
                  <Save size={18} /> Salvar Ofício
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
