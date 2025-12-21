
import React, { useState, useMemo } from 'react';
import { 
  Landmark, Calendar, Filter, DollarSign, CreditCard, QrCode, 
  User, Package, Download, CheckCircle2, AlertCircle, TrendingUp,
  ChevronDown, Search, Printer, Lock
} from 'lucide-react';
import { Order, Product, Event } from '../types';

interface TesourariaProps {
  orders: Order[];
  products: Product[];
  currentEvent: Event;
}

const Tesouraria: React.FC<TesourariaProps> = ({ orders, products, currentEvent }) => {
  // Gera lista de dias do evento para o seletor com base em múltiplos intervalos
  const eventDays = useMemo(() => {
    const allDays: string[] = [];
    if (!currentEvent || !currentEvent.dateRanges) return allDays;
    
    currentEvent.dateRanges.forEach(range => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
      
      let current = new Date(start);
      while (current <= end) {
        const dateStr = new Date(current).toISOString().split('T')[0];
        if (!allDays.includes(dateStr)) {
          allDays.push(dateStr);
        }
        current.setDate(current.getDate() + 1);
      }
    });
    return allDays.sort();
  }, [currentEvent]);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date().toISOString().split('T')[0];
    return eventDays.includes(today) ? today : eventDays[0] || today;
  });

  const [filterText, setFilterText] = useState('');

  // Filtra ordens pela data selecionada
  const dailyOrders = useMemo(() => {
    return orders.filter(o => o.timestamp.startsWith(selectedDate));
  }, [orders, selectedDate]);

  // Totais por Método de Pagamento
  const totals = useMemo(() => {
    const res = { total: 0, dinheiro: 0, cartao: 0, pix: 0 };
    dailyOrders.forEach(order => {
      res.total += order.total;
      order.payments.forEach(p => {
        if (p.method === 'Dinheiro') res.dinheiro += p.amount;
        if (p.method === 'Cartão') res.cartao += p.amount;
        if (p.method === 'Pix') res.pix += p.amount;
      });
    });
    return res;
  }, [dailyOrders]);

  // Vendas por Produto
  const salesByProduct = useMemo(() => {
    const map: Record<string, { qty: number, total: number }> = {};
    dailyOrders.forEach(order => {
      order.items.forEach(item => {
        if (!map[item.productId]) map[item.productId] = { qty: 0, total: 0 };
        map[item.productId].qty += item.quantity;
        map[item.productId].total += (item.quantity * item.price);
      });
    });
    return Object.entries(map)
      .map(([id, data]) => ({
        id,
        name: products.find(p => p.id === id)?.nome || 'Desconhecido',
        category: products.find(p => p.id === id)?.categoria || 'Outros',
        ...data
      }))
      .sort((a, b) => b.total - a.total);
  }, [dailyOrders, products]);

  // Vendas por Caixa/Operador
  const salesByCashier = useMemo(() => {
    const map: Record<string, { total: number, orders: number }> = {};
    dailyOrders.forEach(order => {
      const key = order.cashierName || 'Não identificado';
      if (!map[key]) map[key] = { total: 0, orders: 0 };
      map[key].total += order.total;
      map[key].orders += 1;
    });
    return Object.entries(map).map(([name, data]) => ({ name, ...data }));
  }, [dailyOrders]);

  const handlePrintDailyReport = () => {
    window.print();
  };

  const handleFinishDay = () => {
    if (confirm(`Deseja realizar o fechamento financeiro do dia ${new Date(selectedDate).toLocaleDateString('pt-BR')}? Esta ação consolidará os valores para o Balancete Geral.`)) {
      alert('FECHAMENTO REALIZADO COM SUCESSO! O relatório foi enviado para a Tesouraria Central.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header e Seletor de Data */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Fluxo de Caixa Diário</h3>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gestão de entradas e fechamento de terminal</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <Calendar size={18} className="text-red-600 ml-2" />
          <select 
            className="bg-transparent border-none outline-none font-black text-xs uppercase tracking-widest text-gray-700 pr-8 py-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {eventDays.map(day => (
              <option key={day} value={day}>
                Dia {new Date(day + 'T00:00:00').toLocaleDateString('pt-BR')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-gray-200">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Bruto do Dia</p>
          <div className="flex items-center justify-between">
            <h4 className="text-3xl font-black">R$ {totals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
            <div className="p-3 bg-white/10 rounded-2xl"><TrendingUp size={24} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Em Dinheiro</p>
          <div className="flex items-center justify-between">
            <h4 className="text-3xl font-black text-gray-900">R$ {totals.dinheiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><DollarSign size={24} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Cartão (Déb/Créd)</p>
          <div className="flex items-center justify-between">
            <h4 className="text-3xl font-black text-gray-900">R$ {totals.cartao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><CreditCard size={24} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">Pix Recebido</p>
          <div className="flex items-center justify-between">
            <h4 className="text-3xl font-black text-gray-900">R$ {totals.pix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><QrCode size={24} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendas por Produto */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col h-[600px]">
            <div className="p-8 bg-gray-50/50 border-b flex items-center justify-between">
              <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest flex items-center gap-3">
                <Package className="text-red-600" size={20} /> Vendas por Item
              </h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input 
                  className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-red-500/20"
                  placeholder="Buscar item..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="bg-white text-[9px] font-black uppercase text-gray-400 border-b">
                    <th className="px-8 py-4">Produto</th>
                    <th className="px-8 py-4 text-center">Quantidade</th>
                    <th className="px-8 py-4 text-right">Total Arrecadado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {salesByProduct
                    .filter(s => s.name.toLowerCase().includes(filterText.toLowerCase()))
                    .map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-0.5">{item.category}</p>
                        <p className="font-black text-gray-900 uppercase text-xs">{item.name}</p>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="bg-gray-100 px-4 py-1 rounded-full text-xs font-black text-gray-700">{item.qty}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-gray-900 text-sm">
                        R$ {item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {salesByProduct.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center">
                        <Package size={48} className="mx-auto text-gray-200 mb-4 opacity-30" />
                        <p className="text-gray-300 font-black uppercase text-xs tracking-widest">Nenhuma venda neste dia</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Vendas por Operador e Botões de Ação */}
        <div className="space-y-6">
          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 bg-gray-50/50 border-b">
              <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest flex items-center gap-3">
                <User className="text-red-600" size={20} /> Vendas por Operador
              </h4>
            </div>
            <div className="p-6 space-y-3">
              {salesByCashier.map(cashier => (
                <div key={cashier.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-red-600 font-black text-xs border shadow-sm">{cashier.name.charAt(0)}</div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[120px]">{cashier.name}</p>
                      <p className="text-[10px] font-bold text-gray-600 italic">{cashier.orders} Pedidos</p>
                    </div>
                  </div>
                  <p className="font-black text-gray-900 text-xs">R$ {cashier.total.toFixed(2)}</p>
                </div>
              ))}
              {salesByCashier.length === 0 && (
                <p className="text-center py-10 text-gray-300 font-black uppercase text-[10px] tracking-widest">Aguardando movimento...</p>
              )}
            </div>
          </div>

          <div className="bg-red-600 rounded-[3rem] p-8 text-white shadow-2xl shadow-red-200 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Lock size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Ação de Segurança</p>
                <h5 className="font-black text-lg uppercase tracking-tighter italic">Fechamento do Dia</h5>
              </div>
            </div>
            <p className="text-white/80 text-xs leading-relaxed font-medium">
              Realize o fechamento financeiro para consolidar os relatórios e garantir que todos os operadores prestaram contas.
            </p>
            <div className="space-y-3 pt-2">
               <button 
                onClick={handlePrintDailyReport}
                className="w-full bg-white text-gray-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95"
               >
                 <Printer size={18} /> Imprimir Resumo
               </button>
               <button 
                onClick={handleFinishDay}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95"
               >
                 <CheckCircle2 size={18} className="text-green-500" /> Fechamento Diário
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tesouraria;
