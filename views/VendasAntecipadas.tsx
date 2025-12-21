
import React, { useState, useMemo } from 'react';
import { Users, Plus, Search, UserPlus, X, Save, Edit3, Trash2, Tag, AlertCircle, ShoppingBag, Receipt, BarChart3, Package, DollarSign } from 'lucide-react';
import { Vendedor, Product, VendaAntecipadaItem } from '../types';

interface VendasAntecipadasProps {
  vendedores: Vendedor[];
  setVendedores: React.Dispatch<React.SetStateAction<Vendedor[]>>;
  products: Product[];
}

const VendasAntecipadas: React.FC<VendasAntecipadasProps> = ({ vendedores, setVendedores, products }) => {
  const [isAddSellerModalOpen, setIsAddSellerModalOpen] = useState(false);
  const [isManageVendasModalOpen, setIsManageVendasModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Vendedor | null>(null);
  const [filter, setFilter] = useState('');

  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerContact, setNewSellerContact] = useState('');

  // Cálculo consolidado de vendas por produto
  const consolidatedSales = useMemo(() => {
    const summary: Record<string, { pego: number, vendido: number, valor: number }> = {};
    
    products.forEach(p => {
      summary[p.id] = { pego: 0, vendido: 0, valor: 0 };
    });

    vendedores.forEach(vendedor => {
      vendedor.vendas.forEach(venda => {
        if (summary[venda.productId]) {
          const prod = products.find(p => p.id === venda.productId);
          summary[venda.productId].pego += venda.quantidadePega;
          summary[venda.productId].vendido += venda.quantidadeVendida;
          summary[venda.productId].valor += (venda.quantidadeVendida * (prod?.preco || 0));
        }
      });
    });

    return summary;
  }, [products, vendedores]);

  const handleAddSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSellerName) return;

    const seller: Vendedor = {
      id: Math.random().toString(36).substr(2, 9),
      nome: newSellerName,
      contato: newSellerContact,
      vendas: []
    };

    setVendedores(prev => [seller, ...prev]);
    setIsAddSellerModalOpen(false);
    setNewSellerName('');
    setNewSellerContact('');
  };

  const handleDeleteSeller = (id: string) => {
    if (window.confirm('Excluir este vendedor? Todo o histórico de vendas dele será removido.')) {
      setVendedores(prev => prev.filter(s => s.id !== id));
    }
  };

  const openManageVendas = (seller: Vendedor) => {
    setSelectedSeller(seller);
    setIsManageVendasModalOpen(true);
  };

  const updateVendaItem = (productId: string, field: keyof VendaAntecipadaItem, value: number) => {
    if (!selectedSeller) return;

    setVendedores(prev => prev.map(s => {
      if (s.id === selectedSeller.id) {
        const existing = s.vendas.find(v => v.productId === productId);
        let newVendas = [...s.vendas];
        
        if (existing) {
          newVendas = s.vendas.map(v => 
            v.productId === productId ? { ...v, [field]: value } : v
          );
        } else {
          newVendas.push({
            productId,
            quantidadePega: field === 'quantidadePega' ? value : 0,
            quantidadeVendida: field === 'quantidadeVendida' ? value : 0
          });
        }
        
        return { ...s, vendas: newVendas };
      }
      return s;
    }));
  };

  const filteredVendedores = vendedores.filter(v => 
    v.nome.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Vendas Externas / Antecipadas</h3>
          <p className="text-sm text-gray-500">Controle de vendedores e distribuição de vales</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSummaryModalOpen(true)}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <BarChart3 size={18} className="text-blue-500" /> Resumo Consolidado
          </button>
          <button 
            onClick={() => setIsAddSellerModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
          >
            <UserPlus size={18} /> Novo Vendedor
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none" 
              placeholder="Buscar vendedor..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-wider border-b">
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Produtos Vinculados</th>
                <th className="px-6 py-4">Total Vendido</th>
                <th className="px-6 py-4">Valor Estimado</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredVendedores.map(seller => {
                const totalVendidos = seller.vendas.reduce((acc, v) => acc + v.quantidadeVendida, 0);
                const valorEstimado = seller.vendas.reduce((acc, v) => {
                  const p = products.find(prod => prod.id === v.productId);
                  return acc + (v.quantidadeVendida * (p?.preco || 0));
                }, 0);

                return (
                  <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
                          {seller.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{seller.nome}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{seller.contato || 'Sem contato'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {seller.vendas.length > 0 ? (
                          seller.vendas.map(v => {
                            const p = products.find(prod => prod.id === v.productId);
                            return (
                              <span key={v.productId} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold">
                                {p?.nome}: {v.quantidadeVendida}/{v.quantidadePega}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-400 italic">Nenhum</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{totalVendidos} vales</td>
                    <td className="px-6 py-4 font-black text-green-600">R$ {valorEstimado.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openManageVendas(seller)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold flex items-center gap-1 text-xs"
                        >
                          <Edit3 size={16} /> Gerenciar
                        </button>
                        <button 
                          onClick={() => handleDeleteSeller(seller.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredVendedores.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Nenhum vendedor cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Resumo Consolidado */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50">
              <div>
                <h4 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                  <BarChart3 size={20} /> Resumo Geral de Vendas Antecipadas
                </h4>
                <p className="text-xs text-blue-600 font-medium tracking-tight">Consolidado de todos os vendedores externos</p>
              </div>
              <button onClick={() => setIsSummaryModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total de Vales Saídos</p>
                     <p className="text-xl font-black text-gray-800">
                        {/* Explicitly casting to number to ensure Type system understands the result of reduce */}
                        {(Object.values(consolidatedSales).reduce((acc: number, cur: { pego: number; vendido: number; valor: number }) => acc + cur.pego, 0) as number)}
                     </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                     <p className="text-[10px] font-black text-green-600 uppercase mb-1">Total Vendido</p>
                     <p className="text-xl font-black text-green-700">
                        {/* Explicitly casting to number to ensure Type system understands the result of reduce */}
                        {(Object.values(consolidatedSales).reduce((acc: number, cur: { pego: number; vendido: number; valor: number }) => acc + cur.vendido, 0) as number)}
                     </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                     <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Faturamento Estimado</p>
                     <p className="text-xl font-black text-blue-700">
                        {/* Fix: Explicitly cast to number before calling toFixed to resolve "Property 'toFixed' does not exist on type 'unknown'" */}
                        R$ {(Object.values(consolidatedSales).reduce((acc: number, cur: { pego: number; vendido: number; valor: number }) => acc + cur.valor, 0) as number).toFixed(2)}
                     </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b">
                        <th className="px-4 py-3">Produto</th>
                        <th className="px-4 py-3 text-center">Entregues</th>
                        <th className="px-4 py-3 text-center">Vendidos</th>
                        <th className="px-4 py-3 text-center">Sobra/Retorno</th>
                        <th className="px-4 py-3 text-right">Faturamento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map(product => {
                        const data = consolidatedSales[product.id];
                        if (!data) return null;
                        const sobra = data.pego - data.vendido;

                        return (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Tag size={14} className="text-gray-400" />
                                <span className="font-bold text-gray-800">{product.nome}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-medium text-gray-600">{data.pego}</td>
                            <td className="px-4 py-3 text-center font-black text-green-600">{data.vendido}</td>
                            <td className={`px-4 py-3 text-center font-bold ${sobra > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                              {sobra}
                            </td>
                            <td className="px-4 py-3 text-right font-black text-gray-900">
                              R$ {data.valor.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end">
              <button 
                onClick={() => setIsSummaryModalOpen(false)}
                className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition-colors"
              >
                Fechar Resumo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Vendedor */}
      {isAddSellerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-red-500" size={20} /> Adicionar Vendedor
              </h4>
              <button onClick={() => setIsAddSellerModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSeller} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                <input 
                  required
                  autoFocus
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                  placeholder="Nome do vendedor"
                  value={newSellerName}
                  onChange={(e) => setNewSellerName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Contato (WhatsApp)</label>
                <input 
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                  placeholder="(00) 00000-0000"
                  value={newSellerContact}
                  onChange={(e) => setNewSellerContact(e.target.value)}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddSellerModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gerenciar Vendas do Vendedor */}
      {isManageVendasModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h4 className="text-lg font-bold text-gray-800">Gerenciar Valinhos: {selectedSeller.nome}</h4>
                <p className="text-xs text-gray-500 font-medium">Controle de saídas e retornos de tickets</p>
              </div>
              <button onClick={() => setIsManageVendasModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4">
                {products.length > 0 ? products.map(product => {
                  const vendaItem = vendedores.find(s => s.id === selectedSeller.id)?.vendas.find(v => v.productId === product.id) || {
                    productId: product.id,
                    quantidadePega: 0,
                    quantidadeVendida: 0
                  };
                  const sobra = vendaItem.quantidadePega - vendaItem.quantidadeVendida;

                  return (
                    <div key={product.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 text-gray-500 rounded-lg">
                            <Tag size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{product.nome}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Preço: R$ {product.preco.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${sobra > 0 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                          Sobra: {sobra}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Vales Entregues</label>
                          <div className="relative">
                            <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                            <input 
                              type="number"
                              className="w-full pl-8 p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold"
                              value={vendaItem.quantidadePega}
                              onChange={(e) => updateVendaItem(product.id, 'quantidadePega', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Vales Vendidos</label>
                          <div className="relative">
                            <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                            <input 
                              type="number"
                              className="w-full pl-8 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-bold text-green-600"
                              value={vendaItem.quantidadeVendida}
                              onChange={(e) => updateVendaItem(product.id, 'quantidadeVendida', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {vendaItem.quantidadeVendida > vendaItem.quantidadePega && (
                        <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold">
                          <AlertCircle size={12} /> ALERTA: Vendidos maior que entregues!
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="text-center py-12 text-gray-400">
                    Cadastre produtos na guia "Produtos/Receitas" primeiro.
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t">
              <button 
                onClick={() => setIsManageVendasModalOpen(false)}
                className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors"
              >
                Concluir Gerenciamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendasAntecipadas;
