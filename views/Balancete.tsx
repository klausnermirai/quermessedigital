
import React, { useState, useMemo } from 'react';
import { 
  Download, FileText, TrendingUp, TrendingDown, Wallet, Gavel, 
  Users, Tag, Wrench, ShoppingCart, Heart, Monitor, ChevronRight, 
  Printer, ListFilter, Eye, EyeOff, Package, PieChart, BarChart2, CalendarDays
} from 'lucide-react';
import { Lote, Vendedor, Product, Servico, Compra, Insumo, Doacao, Order, Event } from '../types';

interface BalanceteProps {
  lotes: Lote[];
  vendedores: Vendedor[];
  products: Product[];
  services: Servico[];
  compras: Compra[];
  insumos: Insumo[];
  doacoes: Doacao[];
  orders: Order[];
  currentEvent: Event;
}

const Balancete: React.FC<BalanceteProps> = ({ 
  lotes, vendedores, products, services, compras, insumos, doacoes, orders, currentEvent
}) => {
  const [isDetailed, setIsDetailed] = useState(false);

  // 1. CÁLCULO DE VENDAS POR ITEM (CONSOLIDADO PDV + ANTECIPADO)
  const itemSalesSummary = useMemo(() => {
    const summary: Record<string, { pdvQty: number, antQty: number, totalRevenue: number }> = {};
    
    products.forEach(p => {
      summary[p.id] = { pdvQty: 0, antQty: 0, totalRevenue: 0 };
    });

    // Somar PDV
    orders.forEach(order => {
      order.items.forEach(item => {
        if (summary[item.productId]) {
          summary[item.productId].pdvQty += item.quantity;
          summary[item.productId].totalRevenue += (item.quantity * item.price);
        }
      });
    });

    // Somar Antecipados
    vendedores.forEach(vendedor => {
      vendedor.vendas.forEach(venda => {
        if (summary[venda.productId]) {
          const prod = products.find(p => p.id === venda.productId);
          summary[venda.productId].antQty += venda.quantidadeVendida;
          summary[venda.productId].totalRevenue += (venda.quantidadeVendida * (prod?.preco || 0));
        }
      });
    });

    return Object.entries(summary)
      .map(([id, data]) => ({
        id,
        name: products.find(p => p.id === id)?.nome || 'Item Removido',
        category: products.find(p => p.id === id)?.categoria || 'Outros',
        ...data,
        totalQty: data.pdvQty + data.antQty
      }))
      .filter(item => item.totalQty > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [orders, vendedores, products]);

  // 2. DESEMPENHO DIÁRIO (VISÃO POR DATA)
  const dailyPerformance = useMemo(() => {
    const allDays: string[] = [];
    currentEvent.dateRanges.forEach(range => {
      let curr = new Date(range.start);
      const end = new Date(range.end);
      while (curr <= end) {
        allDays.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
    });
    
    const sortedDays = Array.from(new Set(allDays)).sort();
    
    return sortedDays.map(day => {
      const dayOrders = orders.filter(o => o.timestamp.startsWith(day));
      const totalItems = dayOrders.reduce((acc, o) => 
        acc + o.items.reduce((iAcc, item) => iAcc + item.quantity, 0), 0);
      const totalRevenue = dayOrders.reduce((acc, o) => acc + o.total, 0);
      
      return {
        date: day,
        totalItems,
        totalRevenue
      };
    });
  }, [currentEvent, orders]);

  // 3. TOTAIS DE RECEITA POR CATEGORIA
  const revenueStats = useMemo(() => {
    const pdvTotal = orders.reduce((acc, o) => acc + o.total, 0);
    const antTotal = vendedores.reduce((acc, v) => acc + v.vendas.reduce((vAcc, vi) => {
      const p = products.find(prod => prod.id === vi.productId);
      return vAcc + (vi.quantidadeVendida * (p?.preco || 0));
    }, 0), 0);
    const leilaoTotal = lotes.filter(l => l.status === 'arrematado').reduce((acc, l) => acc + (l.valorArremate || 0), 0);
    const doacoesTotal = doacoes.filter(d => d.tipo === 'financeira').reduce((acc, d) => acc + (d.valor || 0), 0);

    return {
      pdv: pdvTotal,
      antecipado: antTotal,
      leilao: leilaoTotal,
      doacoes: doacoesTotal,
      total: pdvTotal + antTotal + leilaoTotal + doacoesTotal
    };
  }, [orders, vendedores, products, lotes, doacoes]);

  // 4. TOTAIS DE DESPESA POR CATEGORIA
  const expenseStats = useMemo(() => {
    const comprasTotal = compras.reduce((acc, c) => acc + c.valorTotal, 0);
    const servicosTotal = services.filter(s => s.status === 'confirmado').reduce((acc, s) => acc + (s.valorFinal || 0), 0);

    return {
      compras: comprasTotal,
      servicos: servicosTotal,
      total: comprasTotal + servicosTotal
    };
  }, [compras, services]);

  const saldoFinal = revenueStats.total - expenseStats.total;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-6xl mx-auto">
      {/* Header Ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic leading-none">Balancete Geral</h3>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Consolidação financeira de todos os canais</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsDetailed(!isDetailed)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
              isDetailed ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-500 hover:border-red-100'
            }`}
          >
            {isDetailed ? <EyeOff size={16} /> : <Eye size={16} />}
            {isDetailed ? 'Ocultar Detalhes' : 'Ver Detalhamento'}
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
          >
            <Printer size={16} /> Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Título Impressão (Visível apenas no print) */}
      <div className="hidden print:block text-center mb-10 border-b-4 border-gray-900 pb-6">
         <h1 className="text-4xl font-black uppercase italic">Relatório Financeiro de Evento</h1>
         <p className="text-xl font-bold text-gray-600 mt-2 tracking-widest uppercase">Quermesse Master - Prestação de Contas</p>
      </div>

      {/* Cards de Saldo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp size={120} /></div>
          <p className="text-[10px] font-black text-green-500 uppercase mb-2 tracking-widest">Receita Bruta Total</p>
          <h4 className="text-4xl font-black text-gray-900">R$ {revenueStats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
          <div className="mt-4 flex gap-4">
             <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
               PDV: <span className="text-gray-900">R$ {revenueStats.pdv.toLocaleString('pt-BR')}</span>
             </div>
             <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
               Antecip.: <span className="text-gray-900">R$ {revenueStats.antecipado.toLocaleString('pt-BR')}</span>
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><TrendingDown size={120} /></div>
          <p className="text-[10px] font-black text-red-500 uppercase mb-2 tracking-widest">Despesas Totais</p>
          <h4 className="text-4xl font-black text-gray-900">R$ {expenseStats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
          <div className="mt-4 flex gap-4">
             <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
               Compras: <span className="text-gray-900">R$ {expenseStats.compras.toLocaleString('pt-BR')}</span>
             </div>
             <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
               Serviços: <span className="text-gray-900">R$ {expenseStats.servicos.toLocaleString('pt-BR')}</span>
             </div>
          </div>
        </div>

        <div className={`p-8 rounded-[3rem] border-4 shadow-2xl relative overflow-hidden group transition-all ${saldoFinal >= 0 ? 'bg-green-600 border-green-500' : 'bg-red-600 border-red-500'}`}>
          <div className="absolute right-0 top-0 p-10 opacity-10 group-hover:scale-110 transition-transform"><Wallet size={120} /></div>
          <p className="text-[10px] font-black text-white/60 uppercase mb-2 tracking-widest">Saldo Final (Lucro)</p>
          <h4 className="text-4xl font-black text-white">R$ {saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
          <p className="mt-4 text-[10px] font-black text-white/80 uppercase tracking-widest bg-white/10 inline-block px-3 py-1 rounded-full">
            Resultado Consolidado
          </p>
        </div>
      </div>

      {/* SEÇÃO: DESEMPENHO DIÁRIO (NOVA) */}
      <section className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-10 border-b flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><CalendarDays size={30} /></div>
            <div>
               <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Evolução Diária da Quermesse</h4>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acompanhamento cronológico de faturamento</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-[10px] font-black uppercase text-gray-400 border-b">
                <th className="px-10 py-6">Dia do Evento</th>
                <th className="px-10 py-6 text-center">Volume de Itens (Fichas PDV)</th>
                <th className="px-10 py-6 text-right">Faturamento Diário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dailyPerformance.map(day => (
                <tr key={day.date} className="hover:bg-gray-50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><Tag size={18} /></div>
                      <div>
                        <p className="font-black text-gray-900 uppercase text-sm">{new Date(day.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{new Date(day.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={`px-5 py-2 rounded-full text-xs font-black ${day.totalItems > 0 ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-300'}`}>
                      {day.totalItems.toLocaleString('pt-BR')} Itens
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <p className={`font-black text-lg ${day.totalRevenue > 0 ? 'text-gray-900' : 'text-gray-200'}`}>
                      R$ {day.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-900 text-white">
              <tr className="font-black uppercase text-[10px] tracking-widest">
                <td className="px-10 py-6">Totais Consolidados</td>
                <td className="px-10 py-6 text-center text-sm">{dailyPerformance.reduce((acc, d) => acc + d.totalItems, 0).toLocaleString('pt-BR')} Itens Vendidos</td>
                <td className="px-10 py-6 text-right text-lg text-red-500">R$ {dailyPerformance.reduce((acc, d) => acc + d.totalRevenue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Seção de Vendas por Produto */}
      <section className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-10 border-b flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><PieChart size={30} /></div>
            <div>
               <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Desempenho por Produto</h4>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Consolidação PDV + Vendas Antecipadas</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-[10px] font-black uppercase text-gray-400 border-b">
                <th className="px-10 py-6">Item do Cardápio</th>
                <th className="px-10 py-6 text-center">Vendas Antecipadas</th>
                <th className="px-10 py-6 text-center">Vendas PDV</th>
                <th className="px-10 py-6 text-center">Total Unidades</th>
                <th className="px-10 py-6 text-right">Faturamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {itemSalesSummary.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-10 py-6">
                    <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">{item.category}</p>
                    <p className="font-black text-gray-900 uppercase text-sm">{item.name}</p>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-black">{item.antQty}</span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-orange-50 text-orange-600 px-4 py-1 rounded-full text-xs font-black">{item.pdvQty}</span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-xs font-black">{item.totalQty}</span>
                  </td>
                  <td className="px-10 py-6 text-right font-black text-gray-900 text-sm">
                    R$ {item.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detalhamento (Opcional - Ativado via Botão) */}
      {isDetailed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-10 duration-500">
          
          {/* Entradas Detalhadas */}
          <div className="space-y-6">
             <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b bg-green-50/30">
                   <h5 className="font-black text-green-700 uppercase text-xs tracking-widest flex items-center gap-2"><TrendingUp size={16} /> Detalhe de Receitas Externas</h5>
                </div>
                <div className="p-8 space-y-4">
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Leilão (Arremates)</p>
                      {lotes.filter(l => l.status === 'arrematado').map(l => (
                        <div key={l.id} className="flex justify-between items-center text-xs">
                           <span className="text-gray-600 font-bold uppercase">{l.item} <span className="text-[10px] text-gray-400 lowercase">({l.arrematador})</span></span>
                           <span className="font-black text-gray-900">R$ {l.valorArremate?.toFixed(2)}</span>
                        </div>
                      ))}
                   </div>
                   <div className="pt-4 border-t space-y-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Doações Financeiras</p>
                      {doacoes.filter(d => d.tipo === 'financeira').map(d => (
                        <div key={d.id} className="flex justify-between items-center text-xs">
                           <span className="text-gray-600 font-bold uppercase">{d.descricao || 'Doação Espontânea'}</span>
                           <span className="font-black text-gray-900">R$ {d.valor?.toFixed(2)}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          {/* Saídas Detalhadas */}
          <div className="space-y-6">
             <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b bg-red-50/30">
                   <h5 className="font-black text-red-700 uppercase text-xs tracking-widest flex items-center gap-2"><TrendingDown size={16} /> Detalhe de Despesas Realizadas</h5>
                </div>
                <div className="p-8 space-y-6">
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compras e Insumos</p>
                      {compras.map(c => {
                        const insumo = insumos.find(i => i.id === c.insumoId);
                        return (
                          <div key={c.id} className="flex justify-between items-center text-xs">
                             <div className="flex flex-col">
                                <span className="text-gray-600 font-bold uppercase">{insumo?.nome || c.descricaoGeral}</span>
                                <span className="text-[9px] text-gray-400 uppercase tracking-tight">{c.categoria}</span>
                             </div>
                             <span className="font-black text-red-600">R$ {c.valorTotal.toFixed(2)}</span>
                          </div>
                        );
                      })}
                   </div>
                   <div className="pt-4 border-t space-y-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Serviços e Infraestrutura</p>
                      {services.filter(s => s.status === 'confirmado').map(s => (
                        <div key={s.id} className="flex justify-between items-center text-xs">
                           <div className="flex flex-col">
                              <span className="text-gray-600 font-bold uppercase">{s.descricao}</span>
                              <span className="text-[9px] text-gray-400 uppercase tracking-tight">{s.prestador}</span>
                           </div>
                           <span className="font-black text-red-600">R$ {s.valorFinal?.toFixed(2)}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Footer Assinaturas (Apenas para Impressão) */}
      <div className="hidden print:grid grid-cols-2 gap-20 mt-32 text-center">
         <div className="border-t-2 border-gray-900 pt-4">
            <p className="font-black uppercase text-xs">Assinatura Tesouraria</p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Responsável Financeiro</p>
         </div>
         <div className="border-t-2 border-gray-900 pt-4">
            <p className="font-black uppercase text-xs">Pároco Responsável</p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Conselho Administrativo</p>
         </div>
      </div>
      
      <div className="no-print mt-10 p-8 bg-gray-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-red-500"><Download size={24} /></div>
            <div>
               <h5 className="font-black uppercase tracking-tight italic">Dados Seguros</h5>
               <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">O balancete é recalculado em tempo real conforme as vendas ocorrem.</p>
            </div>
         </div>
         <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Quermesse Master v2.5.0</p>
      </div>
    </div>
  );
};

export default Balancete;
