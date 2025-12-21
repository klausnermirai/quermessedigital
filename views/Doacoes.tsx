
import React, { useState } from 'react';
import { Heart, Plus, Search, Trash2, Calendar, User, Package, DollarSign, X, Save, Building2, UserCircle2, Tag } from 'lucide-react';
import { Doador, Doacao, Insumo } from '../types';

interface DoacoesProps {
  doadores: Doador[];
  setDoadores: React.Dispatch<React.SetStateAction<Doador[]>>;
  doacoes: Doacao[];
  onAddDoacao: (doacao: Doacao) => void;
  onDeleteDoacao: (id: string) => void;
  insumos: Insumo[];
}

const Doacoes: React.FC<DoacoesProps> = ({ doadores, setDoadores, doacoes, onAddDoacao, onDeleteDoacao, insumos }) => {
  const [isDoacaoModalOpen, setIsDoacaoModalOpen] = useState(false);
  const [isDoadorModalOpen, setIsDoadorModalOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const [doacaoForm, setDoacaoForm] = useState({
    doadorId: '',
    tipo: 'insumo' as Doacao['tipo'],
    insumoId: '',
    quantidade: '',
    valor: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0]
  });

  const [doadorForm, setDoadorForm] = useState({
    nome: '',
    tipo: 'pessoa' as Doador['tipo'],
    contato: ''
  });

  const handleAddDoador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doadorForm.nome) return;

    const novoDoador: Doador = {
      id: Math.random().toString(36).substr(2, 9),
      ...doadorForm
    };

    setDoadores(prev => [...prev, novoDoador]);
    setIsDoadorModalOpen(false);
    setDoadorForm({ nome: '', tipo: 'pessoa', contato: '' });
  };

  const handleAddDoacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doacaoForm.doadorId) return;

    const novaDoacao: Doacao = {
      id: Math.random().toString(36).substr(2, 9),
      doadorId: doacaoForm.doadorId,
      tipo: doacaoForm.tipo,
      insumoId: doacaoForm.tipo === 'insumo' ? doacaoForm.insumoId : undefined,
      quantidade: doacaoForm.tipo === 'insumo' ? parseFloat(doacaoForm.quantidade) : undefined,
      valor: doacaoForm.tipo === 'financeira' ? parseFloat(doacaoForm.valor) : undefined,
      descricao: doacaoForm.descricao,
      data: new Date(doacaoForm.data).toISOString()
    };

    onAddDoacao(novaDoacao);
    setIsDoacaoModalOpen(false);
    setDoacaoForm({ 
      doadorId: '', tipo: 'insumo', insumoId: '', 
      quantidade: '', valor: '', descricao: '', 
      data: new Date().toISOString().split('T')[0] 
    });
  };

  const totalFinanceiro = doacoes.filter(d => d.tipo === 'financeira').reduce((acc, d) => acc + (d.valor || 0), 0);
  const totalItens = doacoes.filter(d => d.tipo !== 'financeira').length;

  const filteredDoacoes = doacoes.filter(d => {
    const doador = doadores.find(dr => dr.id === d.doadorId);
    const searchStr = (doador?.nome || d.descricao || '').toLowerCase();
    return searchStr.includes(filter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Central de Doações</h3>
          <p className="text-sm text-gray-500">Gestão de benfeitores e arrecadações (Financeiras e Insumos)</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsDoadorModalOpen(true)}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <UserCircle2 size={18} /> Cadastrar Doador
          </button>
          <button 
            onClick={() => setIsDoacaoModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
          >
            <Plus size={20} /> Lançar Doação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Doações Financeiras</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-green-600">R$ {totalFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Itens Arrecadados</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-gray-900">{totalItens} registros</span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Package size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Base de Doadores</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-gray-900">{doadores.length}</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><UserCircle2 size={20} /></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none" 
              placeholder="Buscar doação por nome ou item..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Doador</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Descrição / Item</th>
                <th className="px-6 py-4">Valor/Qtd</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDoacoes.map(doacao => {
                const doador = doadores.find(dr => dr.id === doacao.doadorId);
                const insumo = insumos.find(i => i.id === doacao.insumoId);
                return (
                  <tr key={doacao.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(doacao.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{doador?.nome}</div>
                      <div className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">{doador?.tipo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        doacao.tipo === 'insumo' ? 'bg-orange-100 text-orange-600' : 
                        doacao.tipo === 'financeira' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {doacao.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800 font-medium">
                        {doacao.tipo === 'insumo' ? insumo?.nome : doacao.descricao || '-'}
                      </div>
                      {doacao.tipo === 'insumo' && <span className="text-[10px] text-gray-400 uppercase font-black">Estoque Atualizado</span>}
                    </td>
                    <td className="px-6 py-4 font-black">
                      {doacao.tipo === 'financeira' ? (
                        <span className="text-green-600">R$ {doacao.valor?.toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-700">{doacao.quantidade} {insumo?.unidade || 'un'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onDeleteDoacao(doacao.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredDoacoes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Nenhuma doação registrada com este filtro.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lançar Doação */}
      {isDoacaoModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Heart className="text-red-500" size={20} /> Lançar Doação
              </h4>
              <button onClick={() => setIsDoacaoModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddDoacao} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">Benfeitor / Doador</label>
                <select 
                  required
                  className="w-full p-3 border rounded-xl outline-none bg-white font-medium"
                  value={doacaoForm.doadorId}
                  onChange={(e) => setDoacaoForm({...doacaoForm, doadorId: e.target.value})}
                >
                  <option value="">Selecione quem está doando...</option>
                  {doadores.map(dr => (
                    <option key={dr.id} value={dr.id}>{dr.nome} ({dr.tipo})</option>
                  ))}
                </select>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-xl mb-2">
                {['insumo', 'financeira', 'prenda'].map((t) => (
                  <button 
                    key={t}
                    type="button" 
                    onClick={() => setDoacaoForm({...doacaoForm, tipo: t as Doacao['tipo']})}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${doacaoForm.tipo === t ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {doacaoForm.tipo === 'insumo' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">Insumo</label>
                    <select 
                      required
                      className="w-full p-3 border rounded-xl outline-none bg-white font-medium"
                      value={doacaoForm.insumoId}
                      onChange={(e) => setDoacaoForm({...doacaoForm, insumoId: e.target.value})}
                    >
                      <option value="">Item...</option>
                      {insumos.map(ins => (
                        <option key={ins.id} value={ins.id}>{ins.nome} ({ins.unidade})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">Qtd</label>
                    <input 
                      required
                      type="number"
                      step="0.001"
                      className="w-full p-3 border rounded-xl outline-none font-bold"
                      placeholder="0.00"
                      value={doacaoForm.quantidade}
                      onChange={(e) => setDoacaoForm({...doacaoForm, quantidade: e.target.value})}
                    />
                  </div>
                </div>
              ) : doacaoForm.tipo === 'financeira' ? (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">Valor da Doação</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      required
                      type="number"
                      step="0.01"
                      className="w-full pl-9 p-3 border rounded-xl outline-none font-black text-green-600 text-lg"
                      placeholder="0.00"
                      value={doacaoForm.valor}
                      onChange={(e) => setDoacaoForm({...doacaoForm, valor: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">Descrição da Prenda/Item</label>
                  <input 
                    required
                    className="w-full p-3 border rounded-xl outline-none font-medium"
                    placeholder="Ex: Cesta de Café da Manhã, Bicicleta..."
                    value={doacaoForm.descricao}
                    onChange={(e) => setDoacaoForm({...doacaoForm, descricao: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">Data do Recebimento</label>
                <input 
                  type="date"
                  className="w-full p-3 border rounded-xl outline-none font-medium"
                  value={doacaoForm.data}
                  onChange={(e) => setDoacaoForm({...doacaoForm, data: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsDoacaoModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                  <Save size={18} /> Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cadastrar Doador */}
      {isDoadorModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UserCircle2 className="text-red-500" size={20} /> Novo Doador
              </h4>
              <button onClick={() => setIsDoadorModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddDoador} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">Nome ou Razão Social</label>
                <input 
                  required
                  autoFocus
                  className="w-full p-3 border rounded-xl outline-none font-medium" 
                  placeholder="Nome do doador"
                  value={doadorForm.nome}
                  onChange={(e) => setDoadorForm({...doadorForm, nome: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">Tipo de Benfeitor</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setDoadorForm({...doadorForm, tipo: 'pessoa'})}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${doadorForm.tipo === 'pessoa' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    <User size={14} /> Pessoa
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setDoadorForm({...doadorForm, tipo: 'empresa'})}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${doadorForm.tipo === 'empresa' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    <Building2 size={14} /> Empresa
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">Contato (Opcional)</label>
                <input 
                  className="w-full p-3 border rounded-xl outline-none font-medium"
                  placeholder="(00) 00000-0000"
                  value={doadorForm.contato}
                  onChange={(e) => setDoadorForm({...doadorForm, contato: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsDoadorModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Salvar Doador</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doacoes;
