import React, { useState, useMemo } from 'react';
import { Users, Plus, Search, UserPlus, X, Save, Edit3, Trash2, Tag, AlertCircle, ShoppingBag, Receipt, BarChart3, Package, DollarSign, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
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
    const summary: Record<string, { pego: number, vendido: number, devolvido: number, valor: number }> = {};
    
    products.forEach(p => {
      summary[p.id] = { pego: 0, vendido: 0, devolvido: 0, valor: 0 };
    });

    vendedores.forEach(vendedor => {
      vendedor.vendas.forEach(venda => {
        if (summary[venda.productId]) {
          const prod = products.find(p => p.id === venda.productId);
          summary[venda.productId].pego += venda.quantidadePega;
          summary[venda.productId].vendido += venda.quantidadeVendida;
          summary[venda.productId].devolvido += (venda.quantidadeDevolvida || 0);
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
            quantidadeVendida: field === 'quantidadeVendida' ? value : 0,
            quantidadeDevolvida: field === 'quantidadeDevolvida' ? value : 0
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
          <p className="text-sm text-gray-500">Distribuição de vales e prestação de contas dos vendedores</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSummaryModalOpen(true)}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <BarChart3 size={18} className="text-blue-500" /> Resumo Geral
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
                <th className="px-6 py-4">Status da Carga</th>
                <th className="px-6 py-4 text-center">Vendas</th>
                <th className="px-6 py-4 text-center">Saldo a Receber</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredVendedores.map(seller => {
                const totalPegos = seller.vendas.reduce((acc, v) => acc + v.quantidadePega, 0);
                const totalVendidos = seller.vendas.reduce((acc, v) => acc + v.quantidadeVendida, 0);
                const totalDevolvidos = seller.vendas.reduce((acc, v) => acc + (v.quantidadeDevolvida || 0), 0);
                const discrepancia = totalPegos - (totalVendidos + totalDevolvidos);

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
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black uppercase text-gray-400">Total: {totalPegos}</span>
                           <span className="text-[10px] font-black uppercase text-green-600">Vend: {totalVendidos}</span>
                           <span className="text-[10px] font-black uppercase text-orange-600">Dev: {totalDevolvidos}</span>
                        </div>
                        {discrepancia !== 0 && (
                          <div className="flex items-center gap-1 text-red-600 text-[9px] font-black uppercase">
                            <AlertTriangle size={12} /> {discrepancia > 0 ? `Faltam ${discrepancia} vales` : `Sobra de ${Math.abs(discrepancia)} vales`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-gray-900">{totalVendidos}</td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-black text-green-600 text-base leading-none">R$ {valorEstimado.toFixed(2)}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">Acerto Financeiro</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openManageVendas(seller)}
                          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                        >
                          <RotateCcw size={14} /> Prestação de Contas
                        </button>
                        <button 
                          onClick={() => handleDeleteSeller(seller.id)}
                          className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-blue-50">
              <div>
                <h4 className="text-xl font-black text-blue-900 uppercase italic tracking-tighter">Resumo Geral de Vendas Externas</h4>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Consolidado de vales distribuídos e retornados</p>
              </div>
              <button onClick={() => setIsSummaryModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-xl shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Saída Total</p>
                     <p className="text-2xl font-black text-gray-800">
                        {/* Fix: Explicitly type the reduce callback parameters and return type to avoid 'unknown' type errors */}
                        {(Object.values(consolidatedSales).reduce<number>((acc, cur: any) => acc + cur.pego, 0))}
                     </p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                     <p className="text-[10px] font-black text-green-600 uppercase mb-1 tracking-widest">Retorno Vendido</p>
                     <p className="text-2xl font-black text-green-700">
                        {/* Fix: Explicitly type the reduce callback parameters and return type to avoid 'unknown' type errors */}
                        {(Object.values(consolidatedSales).reduce<number>((acc, cur: any) => acc + cur.vendido, 0))}
                     </p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                     <p className="text-[10px] font-black text-orange-600 uppercase mb-1 tracking-widest">Faturamento Externo</p>
                     <p className="text-2xl font-black text-orange-700">
                        {/* Fix: Explicitly type the reduce callback parameters and return type to avoid 'unknown' type errors */}
                        R$ {(Object.values(consolidatedSales).reduce<number>((acc, cur: any) => acc + cur.valor, 0)).toFixed(2)}
                     </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-[9px] font-black uppercase text-gray-400 border-b">
                        <th className="px-6 py-4">Produto</th>
                        <th className="px-6 py-4 text-center">Saíram</th>
                        <th className="px-6 py-4 text-center">Vendidos</th>
                        <th className="px-6 py-4 text-center">Devolvidos</th>
                        <th className="px-6 py-4 text-right">A Receber</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map(product => {
                        const data = consolidatedSales[product.id];
                        if (!data || data.pego === 0) return null;

                        return (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-black text-gray-800 uppercase italic text-xs">{product.nome}</span>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-gray-500">{data.pego}</td>
                            <td className="px-6 py-4 text-center font-black text-green-600">{data.vendido}</td>
                            <td className="px-6 py-4 text-center font-bold text-orange-500">{data.devolvido}</td>
                            <td className="px-6 py-4 text-right font-black text-gray-900">
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

            <div className="p-8 bg-gray-50 border-t flex justify-end">
              <button 
                onClick={() => setIsSummaryModalOpen(false)}
                className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all"
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
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h4 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Adicionar Vendedor</h4>
              <button onClick={() => setIsAddSellerModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSeller} className="p-8 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Nome Completo</label>
                <input 
                  required
                  autoFocus
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-800" 
                  placeholder="Ex: João da Silva"
                  value={newSellerName}
                  onChange={(e) => setNewSellerName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Contato (WhatsApp)</label>
                <input 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-800" 
                  placeholder="(00) 00000-0000"
                  value={newSellerContact}
                  onChange={(e) => setNewSellerContact(e.target.value)}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddSellerModalOpen(false)}
                  className="flex-1 px-4 py-4 rounded-2xl font-black uppercase text-xs text-gray-400 tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-100 active:scale-95 transition-all"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gerenciar Vendas (PRESTAÇÃO DE CONTAS COMPLETA) */}
      {isManageVendasModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg font-black text-xl italic">{selectedSeller.nome.charAt(0)}</div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Prestação de Contas</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedSeller.nome} • {selectedSeller.contato || 'Sem contato'}</p>
                </div>
              </div>
              <button onClick={() => setIsManageVendasModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-white p-3 rounded-2xl border">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
              <div className="grid grid-cols-1 gap-6">
                {products.length > 0 ? products.map(product => {
                  const vendaItem = vendedores.find(s => s.id === selectedSeller.id)?.vendas.find(v => v.productId === product.id) || {
                    productId: product.id,
                    quantidadePega: 0,
                    quantidadeVendida: 0,
                    quantidadeDevolvida: 0
                  };
                  const discrepancia = (vendaItem.quantidadePega || 0) - ((vendaItem.quantidadeVendida || 0) + (vendaItem.quantidadeDevolvida || 0));
                  const valorVendido = (vendaItem.quantidadeVendida || 0) * product.preco;

                  return (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-red-50 text-red-600 rounded-2xl shadow-sm">
                            <Tag size={20} />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 uppercase italic text-sm">{product.nome}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preço Unitário: R$ {product.preco.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Total a Pagar</p>
                           <p className="text-2xl font-black text-gray-900">R$ {valorVendido.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-black text-gray-400 uppercase ml-1 tracking-widest">1. Saída (Distribuído)</label>
                          <div className="relative">
                            <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                            <input 
                              type="number"
                              className="w-full pl-10 p-3 bg-gray-50 border-none rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-red-500/20"
                              value={vendaItem.quantidadePega || 0}
                              onChange={(e) => updateVendaItem(product.id, 'quantidadePega', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-black text-green-600 uppercase ml-1 tracking-widest">2. Retorno Vendido</label>
                          <div className="relative">
                            <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300" size={14} />
                            <input 
                              type="number"
                              className="w-full pl-10 p-3 bg-green-50 border-none rounded-xl font-black text-green-700 outline-none focus:ring-2 focus:ring-green-500/20"
                              value={vendaItem.quantidadeVendida || 0}
                              onChange={(e) => updateVendaItem(product.id, 'quantidadeVendida', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-black text-orange-600 uppercase ml-1 tracking-widest">3. Retorno Físico (Dev.)</label>
                          <div className="relative">
                            <RotateCcw className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300" size={14} />
                            <input 
                              type="number"
                              className="w-full pl-10 p-3 bg-orange-50 border-none rounded-xl font-black text-orange-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                              value={vendaItem.quantidadeDevolvida || 0}
                              onChange={(e) => updateVendaItem(product.id, 'quantidadeDevolvida', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {discrepancia !== 0 ? (
                        <div className={`mt-4 p-3 rounded-xl flex items-center gap-3 animate-pulse border ${discrepancia > 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                          <AlertCircle size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {discrepancia > 0 
                              ? `CONFERÊNCIA PENDENTE: Faltam ${discrepancia} vales/pagamentos!` 
                              : `CONFERÊNCIA PENDENTE: Foram entregues ${Math.abs(discrepancia)} vales a mais!`}
                          </span>
                        </div>
                      ) : (
                        vendaItem.quantidadePega > 0 && (
                          <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-100 text-green-600 flex items-center gap-3">
                            <CheckCircle2 size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Conferência OK: Vales e vendas batem com a saída!</span>
                          </div>
                        )
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

            <div className="p-8 bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-green-400 shadow-inner">
                  <DollarSign size={32} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total a Receber do Vendedor</p>
                   <p className="text-4xl font-black tracking-tighter">
                     R$ {(vendedores.find(s => s.id === selectedSeller.id)?.vendas.reduce((acc, v) => {
                       const p = products.find(prod => prod.id === v.productId);
                       return acc + (v.quantidadeVendida * (p?.preco || 0));
                     }, 0) || 0).toFixed(2)}
                   </p>
                </div>
              </div>
              <button 
                onClick={() => setIsManageVendasModalOpen(false)}
                className="w-full md:w-auto bg-red-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-95 flex items-center justify-center gap-3"
              >
                <Save size={18} /> Salvar e Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendasAntecipadas;