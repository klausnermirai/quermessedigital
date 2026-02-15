
import React from 'react';
import { 
  LayoutDashboard, Settings, FileText, Heart, Package, ShoppingCart, 
  Wrench, Wallet, Gavel, Users, Utensils, Monitor, Landmark, FileBarChart, X, Landmark as Bank
} from 'lucide-react';
import { View, User, UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  currentView: View;
  setView: (view: View) => void;
  user: User;
  eventName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setOpen, currentView, setView, user, eventName }) => {
  if (user.role === UserRole.PDV || user.role === UserRole.PDV_MOBILE) {
    return null;
  }

  const menuItems = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'OFICIOS', icon: FileText, label: 'Ofícios' },
    { id: 'DOACOES', icon: Heart, label: 'Doações' },
    { id: 'ESTOQUE', icon: Package, label: 'Estoque' },
    { id: 'COMPRAS', icon: ShoppingCart, label: 'Compras' },
    { id: 'SERVICOS', icon: Wrench, label: 'Serviços' },
    { id: 'LEILAO', icon: Gavel, label: 'Leilão' },
    { id: 'VENDAS_ANTECIPADAS', icon: Users, label: 'Vendas Ant.' },
    { id: 'PRODUTOS', icon: Utensils, label: 'Produtos/Receitas' },
    { id: 'PDV', icon: Monitor, label: 'PDV / Caixa' },
    { id: 'TESOURARIA', icon: Bank, label: 'Tesouraria' },
    { id: 'BALANCETE', icon: FileBarChart, label: 'Balancete' },
    { id: 'CONFIG', icon: Settings, label: 'Configurações', roles: [UserRole.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => !item.roles || item.roles.includes(user.role));

  return (
    <>
      <div 
        className={`fixed inset-0 bg-gray-900/50 z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />
      
      <aside className={`
        fixed lg:static z-50 h-full w-72 bg-white border-r border-gray-200 shadow-xl lg:shadow-none transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-100">Q</div>
              <div>
                <h1 className="text-sm font-black text-gray-900 leading-none uppercase tracking-tighter italic">Quermesse<span className="text-red-600">Digital</span></h1>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{eventName}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="lg:hidden p-2 text-gray-400"><X size={20} /></button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id as View);
                  if (window.innerWidth < 1024) setOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2
                  ${currentView === item.id 
                    ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-100 scale-105' 
                    : 'bg-white border-white text-gray-400 hover:border-red-50 hover:text-red-600'}
                `}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Painel Administrativo</p>
              <p className="text-[10px] text-gray-600 font-medium leading-tight">Você está operando em modo de acesso direto.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
