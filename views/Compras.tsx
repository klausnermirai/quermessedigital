
import React, { useState } from 'react';
import { ShoppingCart, Plus, Search, Trash2, Calendar, Package, DollarSign, X, Save, ArrowRight, Layers, Tag, Settings2, Check } from 'lucide-react';
import { Insumo, Compra } from '../types';

interface ComprasProps {
  insumos: Insumo[];
  compras: Compra[];
  onAddCompra: (compra: Compra) => void;
  onDeleteCompra: (id: string) => void;
  categorias: string[];
  setCategorias: React.Dispatch<React.SetStateAction<string[]>>;
}

const Compras: React.FC<ComprasProps> = ({ insumos, compras, onAddCompra, onDeleteCompra, categorias, setCategorias }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [filter, setFilter] = useState('');

  const [form, setForm] = useState({
    tipo: 'insumo' as 'insumo' | 'geral',
    insumoId: '',
    descricaoGeral: '',
    quantidade: '1',
    valorTotal: '',
    fornecedor: '',
    categoria: categorias[0] || 'Geral',
    data: new Date().toISOString().split('T')[0]
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.tipo === 'insumo' && (!form.insumoId || !form.quantidade || !form.valorTotal)) return;
    if (form.tipo === 'geral' && (!form.descricaoGeral || !form.valorTotal)) return;

    const novaCompra: Compra = {
      id: Math.random().toString(36).substr(2, 9),
      tipo: form.tipo,
      insumoId: form.tipo === 'insumo' ? form.insumoId : undefined,
      descricaoGeral: form.tipo === 'geral' ? form.descricaoGeral : undefined,
      quantidade: parseFloat(form.quantidade) || 1,
      valorTotal: parseFloat(form.valorTotal),
      data: new Date(form.data).toISOString(),
      fornecedor: form.fornecedor,
      categoria: form.tipo === 'geral' ? form.categoria : 'Insumos'
    };

    onAddCompra(novaCompra);
    setIsModalOpen(false);
    setForm({ 
      tipo: 'insumo', 
      insumoId: '', 
      descricaoGeral: '', 
      quantidade: '1', 
      valorTotal: '', 
      fornecedor: '', 
      categoria: categorias[0] || 'Geral', 
      data: new Date().toISOString().split('T')[0] 
    });
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categorias.includes(newCategoryName.trim())) {
      setCategorias(prev => [...prev, newCategoryName.trim()]);
      setForm(prev => ({ ...prev, categoria: newCategoryName.trim() }));
      setNewCategoryName('');
      setIsManagingCategories(false);
    }
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (categorias.length <= 1) return;
    setCategorias(prev => prev.filter(c => c !== catToDelete));
    if (form.categoria === catToDelete) {
      setForm(prev => ({ ...prev, categoria: categorias.find(c => c !== catToDelete) || '' }));
    }
  };

  const totalGasto = compras.reduce((acc, c) => acc + c.valorTotal, 0);

  const filteredCompras = compras.filter(c => {
    const insumo = insumos.find(i => i.id === c.insumoId);
    const searchString = (insumo?.nome || c.descricaoGeral || '').toLowerCase();
    const providerString = (c.fornecedor || '').toLowerCase();
    const term = filter.toLowerCase();
    
    return searchString.includes(term) || providerString.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Gestão de Compras e Gastos</h3>
          <p className="text-sm text-gray-500">Insumos de estoque e aquisições diversas da festa</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
        >
          <Plus size={20} /> Lançar Compra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Total Gasto Acumulado</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-gray-900">R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><ShoppingCart size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Registros em Compras</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-gray-900">{compras.length}</span>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Layers size={20} /></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none" 
              placeholder="Buscar por item, descrição ou fornecedor..." 
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
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Item / Descrição</th>
                <th className="px-6 py-4">Qtd / Categoria</th>
                <th className="px-6 py-4">Total Pago</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCompras.map(compra => {
                const insumo = insumos.find(i => i.id === compra.insumoId);
                return (
                  <tr key={compra.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(compra.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${compra.tipo === 'insumo' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                        {compra.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{compra.tipo === 'insumo' ? insumo?.nome : compra.descricaoGeral}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
                        Fornecedor: {compra.fornecedor || 'N/I'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {compra.tipo === 'insumo' ? (
                        <span className="font-black text-gray-700">{compra.quantidade} {insumo?.unidade}</span>
                      ) : (
                        <span className="text-gray-500 font-medium">{compra.categoria}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-black text-red-600">
                      R$ {compra.valorTotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onDeleteCompra(compra.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredCompras.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="text-red-500" size={20} /> Lançar Nova Compra
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex bg-gray-100 p-1 rounded-xl mb-2">
                <button 
                  type="button" 
                  onClick={() => setForm({...form, tipo: 'insumo'})}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.tipo === 'insumo' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}
                >
                  Insumo de Receita
                </button>
                <button 
                  type="button" 
                  onClick={() => setForm({...form, tipo: 'geral'})}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.tipo === 'geral' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                >
                  Gasto Geral
                </button>
              </div>

              {form.tipo === 'insumo' ? (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">Insumo Cadastrado</label>
                  <select 
                    required
                    className="w-full p-3 border rounded-xl outline-none bg-white font-medium"
                    value={form.insumoId}
                    onChange={(e) => setForm({...form, insumoId: e.target.value})}
                  >
                    <option value="">Selecione o item...</option>
                    {insumos.map(ins => (
                      <option key={ins.id} value={ins.id}>{ins.nome} ({ins.unidade})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">O que foi comprado?</label>
                    <input 
                      required
                      className="w-full p-3 border rounded-xl outline-none font-medium"
                      placeholder="Ex: Carvão, Lonas, Brinquedos..."
                      value={form.descricaoGeral}
                      onChange={(e) => setForm({...form, descricaoGeral: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Categoria do Gasto</label>
                      <button 
                        type="button" 
                        onClick={() => setIsManagingCategories(!isManagingCategories)}
                        className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-1"
                      >
                        <Settings2 size={12} /> {isManagingCategories ? 'Voltar ao formulário' : 'Gerenciar Categorias'}
                      </button>
                    </div>

                    {isManagingCategories ? (
                      <div className="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {categorias.map(cat => (
                            <div key={cat} className="bg-white border border-gray-200 px-2 py-1 rounded-lg flex items-center gap-2 text-xs font-bold text-gray-600 shadow-sm">
                              {cat}
                              <button 
                                type="button" 
                                onClick={() => handleDeleteCategory(cat)}
                                className="text-gray-300 hover:text-red-500"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            className="flex-1 p-2 text-xs border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                            placeholder="Nova categoria..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                          />
                          <button 
                            type="button"
                            onClick={handleAddCategory}
                            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <select 
                        className="w-full p-3 border rounded-xl outline-none bg-white font-medium"
                        value={form.categoria}
                        onChange={(e) => setForm({...form, categoria: e.target.value})}
                      >
                        {categorias.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">
                    {form.tipo === 'insumo' ? 'Quantidade' : 'Data do Gasto'}
                  </label>
                  {form.tipo === 'insumo' ? (
                    <input 
                      required
                      type="number"
                      step="0.001"
                      className="w-full p-3 border rounded-xl outline-none font-bold"
                      placeholder="0.00"
                      value={form.quantidade}
                      onChange={(e) => setForm({...form, quantidade: e.target.value})}
                    />
                  ) : (
                    <input 
                      type="date"
                      className="w-full p-3 border rounded-xl outline-none font-medium"
                      value={form.data}
                      onChange={(e) => setForm({...form, data: e.target.value})}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">Valor Total Pago</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      required
                      type="number"
                      step="0.01"
                      className="w-full pl-9 p-3 border rounded-xl outline-none font-black text-red-600"
                      placeholder="0.00"
                      value={form.valorTotal}
                      onChange={(e) => setForm({...form, valorTotal: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">Fornecedor / Local</label>
                <input 
                  className="w-full p-3 border rounded-xl outline-none font-medium"
                  placeholder="Ex: Atacarejo Central"
                  value={form.fornecedor}
                  onChange={(e) => setForm({...form, fornecedor: e.target.value})}
                />
              </div>

              {form.tipo === 'insumo' && (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">Data da Compra</label>
                  <input 
                    type="date"
                    className="w-full p-3 border rounded-xl outline-none font-medium"
                    value={form.data}
                    onChange={(e) => setForm({...form, data: e.target.value})}
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                  <Save size={18} /> Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compras;
