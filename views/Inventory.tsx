
import React, { useState, useMemo } from 'react';
import { Package, Plus, Search, AlertCircle, ArrowUpCircle, X, Save, Calculator, Tag, TrendingUp, ShoppingBag } from 'lucide-react';
import { Insumo, Product, Vendedor, Order } from '../types';

interface InventoryProps {
  insumos: Insumo[];
  setInsumos: React.Dispatch<React.SetStateAction<Insumo[]>>;
  products: Product[];
  vendedores: Vendedor[];
  orders: Order[];
}

const Inventory: React.FC<InventoryProps> = ({ insumos, setInsumos, products, vendedores, orders }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [newInsumo, setNewInsumo] = useState({
    nome: '',
    unidade: 'kg' as Insumo['unidade'],
    estoqueMinimo: '',
    projetado: ''
  });

  // Cálculo detalhado confrontando Projeção vs Vendas Reais
  const calculatedNeeds = useMemo(() => {
    const summary: Record<string, { projectionNeed: number, realSalesNeed: number }> = {};
    
    insumos.forEach(i => {
      summary[i.id] = { projectionNeed: 0, realSalesNeed: 0 };
    });

    products.forEach(product => {
      // 1. Vendas Antecipadas
      const totalAntecipado = vendedores.reduce((acc, v) => {
        const vendaItem = v.vendas.find(vi => vi.productId === product.id);
        return acc + (vendaItem?.quantidadeVendida || 0);
      }, 0);

      // 2. Vendas PDV (Reais)
      const totalPDV = orders.reduce((acc, order) => {
        const orderItem = order.items.find(item => item.productId === product.id);
        return acc + (orderItem?.quantity || 0);
      }, 0);

      const totalVendasReais = totalAntecipado + totalPDV;
      const baseYield = product.rendimento || 1;

      product.receita.forEach(recipeItem => {
        if (!summary[recipeItem.insumoId]) return;

        const amountPerPortion = recipeItem.quantidade / baseYield;
        
        // Necessidade baseada na Projeção Inicial
        summary[recipeItem.insumoId].projectionNeed += amountPerPortion * (product.vendasProjetadas || 0);
        
        // Necessidade baseada em Vendas Reais
        summary[recipeItem.insumoId].realSalesNeed += amountPerPortion * totalVendasReais;
      });
    });
    
    return summary;
  }, [products, vendedores, orders, insumos]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsumo.nome) return;

    const entry: Insumo = {
      id: Math.random().toString(36).substr(2, 9),
      nome: newInsumo.nome,
      unidade: newInsumo.unidade,
      estoqueMinimo: parseFloat(newInsumo.estoqueMinimo) || 0,
      estoqueAtual: 0,
      totalDoado: 0,
      totalComprado: 0,
      projetado: parseFloat(newInsumo.projetado) || 0,
    };

    setInsumos(prev => [...prev, entry]);
    setIsModalOpen(false);
    setNewInsumo({ nome: '', unidade: 'kg', estoqueMinimo: '', projetado: '' });
  };

  const filteredInsumos = insumos.filter(i => 
    i.nome.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Necessidade de Insumos</h3>
          <p className="text-sm text-gray-500">Confronto entre Projeção Inicial vs Demanda Real (Vendas)</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors"
        >
          <Plus size={20} /> Novo Insumo
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex gap-4 bg-gray-50/50">
           <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none" 
              placeholder="Filtrar estoque..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase border-b">
                <th className="px-6 py-4">Insumo</th>
                <th className="px-6 py-4 text-center">Projeção Inicial</th>
                <th className="px-6 py-4 text-center">Demanda Real (Vendas)</th>
                <th className="px-6 py-4 text-center">Necessidade Atual</th>
                <th className="px-6 py-4 text-center">Arrecadado</th>
                <th className="px-6 py-4">Status / Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredInsumos.map((item) => {
                const needs = calculatedNeeds[item.id] || { projectionNeed: 0, realSalesNeed: 0 };
                
                // A necessidade real é o MAIOR entre a projeção e as vendas de fato
                const totalDemand = Math.max(needs.projectionNeed, needs.realSalesNeed);
                const gathered = item.totalDoado + item.totalComprado;
                const balance = gathered - totalDemand;
                
                const salesOverProjection = needs.realSalesNeed > needs.projectionNeed;
                const isUnderstocked = gathered < totalDemand;

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{item.nome}</div>
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-tight">Estoque: {item.estoqueAtual} {item.unidade}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-500 font-medium">{needs.projectionNeed.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`font-black ${salesOverProjection ? 'text-orange-600' : 'text-gray-700'}`}>
                          {needs.realSalesNeed.toFixed(2)}
                        </span>
                        {salesOverProjection && (
                          <span className="text-[8px] font-black bg-orange-100 text-orange-600 px-1 rounded uppercase">Acima da Projeção</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center bg-gray-50/50">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-blue-600 text-base">{totalDemand.toFixed(2)}</span>
                        <span className="text-[9px] text-gray-400 uppercase font-black">Maior Demanda</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{gathered.toFixed(2)}</span>
                        <span className="text-[8px] text-gray-400 font-black uppercase">D: {item.totalDoado} | C: {item.totalComprado}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isUnderstocked ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all" 
                              style={{ width: `${Math.min(100, (gathered / totalDemand) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-black text-red-600">-{Math.abs(balance).toFixed(1)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600 font-black uppercase text-[10px]">
                          <TrendingUp size={12} /> OK (+{balance.toFixed(1)})
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Package className="text-red-500" size={20} /> Cadastrar Insumo
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome</label>
                <input required autoFocus className="w-full p-2.5 border rounded-lg" value={newInsumo.nome} onChange={(e) => setNewInsumo({...newInsumo, nome: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Unidade</label>
                  <select className="w-full p-2.5 border rounded-lg" value={newInsumo.unidade} onChange={(e) => setNewInsumo({...newInsumo, unidade: e.target.value as any})}>
                    <option value="kg">kg</option>
                    <option value="un">un</option>
                    <option value="litro">litro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mínimo</label>
                  <input type="number" className="w-full p-2.5 border rounded-lg" value={newInsumo.estoqueMinimo} onChange={(e) => setNewInsumo({...newInsumo, estoqueMinimo: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border rounded-lg font-bold">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
