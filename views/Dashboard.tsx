
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { DollarSign, Package, Users, Heart, Gavel } from 'lucide-react';
import { Lote, Vendedor, Product } from '../types';

interface DashboardProps {
  lotes: Lote[];
  vendedores: Vendedor[];
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ lotes, vendedores, products }) => {
  // Cálculos dinâmicos para os cards de estatísticas
  const statsReal = useMemo(() => {
    const basePdv = 35400; // Simulação de caixas fixos
    const doacoes = 12450;
    
    const totalLeilao = lotes
      .filter(l => l.status === 'arrematado')
      .reduce((acc, l) => acc + (l.valorArremate || 0), 0);
    
    const totalVendedores = vendedores.reduce((acc, v) => {
      return acc + v.vendas.reduce((vAcc, vi) => {
        const prod = products.find(p => p.id === vi.productId);
        return vAcc + (vi.quantidadeVendida * (prod?.preco || 0));
      }, 0);
    }, 0);

    const ticketsAntecipados = vendedores.reduce((acc, v) => {
      return acc + v.vendas.reduce((vAcc, vi) => vAcc + vi.quantidadeVendida, 0);
    }, 0);

    return {
      receitaTotal: basePdv + doacoes + totalLeilao + totalVendedores,
      doacoesFinanceiras: doacoes,
      ticketsAntecipados,
      totalLeilao
    };
  }, [lotes, vendedores, products]);

  const data = [
    { name: 'Seg', v: 4000, d: 2400 },
    { name: 'Ter', v: 3000, d: 1398 },
    { name: 'Qua', v: 2000, d: 9800 },
    { name: 'Qui', v: 2780, d: 3908 },
    { name: 'Sex', v: 1890, d: 4800 },
    { name: 'Sab', v: 2390, d: 3800 },
    { name: 'Dom', v: 3490, d: 4300 },
  ];

  const pieData = [
    { name: 'Galinhada', value: 400 },
    { name: 'Churrasco', value: 300 },
    { name: 'Pastel', value: 300 },
    { name: 'Bebidas', value: 200 },
  ];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];

  const stats = [
    { label: 'Receita Total Bruta', value: `R$ ${statsReal.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Arremates Leilão', value: `R$ ${statsReal.totalLeilao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Gavel, color: 'bg-orange-100 text-orange-600' },
    { label: 'Insumos / Estoque', value: 'Monitorando', icon: Package, color: 'bg-red-100 text-red-600' },
    { label: 'Vendas Antecipadas', value: `${statsReal.ticketsAntecipados} tickets`, icon: Users, color: 'bg-blue-100 text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase text-xs tracking-widest">Fluxo Financeiro Estimado</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="v" fill="#ef4444" radius={[4, 4, 0, 0]} name="Receita" />
                <Bar dataKey="d" fill="#9ca3af" radius={[4, 4, 0, 0]} name="Despesa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase text-xs tracking-widest">Previsão de Saída por Produto</h3>
          <div className="h-80 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
               {pieData.map((item, i) => (
                 <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                    <span className="text-xs text-gray-600 font-bold uppercase tracking-tighter">{item.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
