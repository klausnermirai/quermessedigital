
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Landmark, LogOut, Mail, Lock, CloudSync, Wifi, WifiOff, AlertCircle, Plus
} from 'lucide-react';
import { supabase } from './lib/supabase';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import PDV from './views/PDV';
import Inventory from './views/Inventory';
import Products from './views/Products';
import Balancete from './views/Balancete';
import Config from './views/Config';
import Oficios from './views/Oficios';
import Leilao from './views/Leilao';
import VendasAntecipadas from './views/VendasAntecipadas';
import Servicos from './views/Servicos';
import Compras from './views/Compras';
import Doacoes from './views/Doacoes';
import Tesouraria from './views/Tesouraria';
import { User, Event, View, UserRole, Insumo, Product, Lote, Vendedor, Servico, Compra, Doador, Doacao, Order, DateRange } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cashierName, setCashierName] = useState<string | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Estados principais
  const [events, setEvents] = useState<Event[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [doadores, setDoadores] = useState<Doador[]>([]);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [services, setServices] = useState<Servico[]>([]);

  // Escutar mudança de autenticação no Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // Mapear usuário do Auth para nosso objeto User
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'Administrador',
          role: session.user.user_metadata?.role || UserRole.ADMIN
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'Administrador',
          role: session.user.user_metadata?.role || UserRole.ADMIN
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const fetchs = [
        supabase.from('events').select('*'),
        supabase.from('users').select('*'),
        supabase.from('insumos').select('*'),
        supabase.from('orders').select('*').order('timestamp', { ascending: false }),
        supabase.from('doadores').select('*'),
        supabase.from('doacoes').select('*'),
        supabase.from('compras').select('*'),
        supabase.from('products').select('*'),
        supabase.from('lotes').select('*'),
        supabase.from('vendedores').select('*'),
        supabase.from('services').select('*'),
      ];

      const results = await Promise.all(fetchs);
      
      if (results[0].data) setEvents(results[0].data);
      if (results[1].data) setRegisteredUsers(results[1].data);
      if (results[2].data) setInsumos(results[2].data);
      if (results[3].data) setOrders(results[3].data);
      if (results[4].data) setDoadores(results[4].data);
      if (results[5].data) setDoacoes(results[5].data);
      if (results[6].data) setCompras(results[6].data);
      if (results[7].data) setProducts(results[7].data);
      if (results[8].data) setLotes(results[8].data);
      if (results[9].data) setVendedores(results[9].data);
      if (results[10].data) setServices(results[10].data);

    } catch (error) {
      console.error('Falha ao carregar dados:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
      
      const mainChannel = supabase
        .channel('db-all-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'lotes' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'doacoes' }, () => fetchData())
        .subscribe();

      return () => { supabase.removeChannel(mainChannel); };
    }
  }, [user, fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const email = (e.target as any).email.value;
    const password = (e.target as any).password.value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Caso não exista no Auth, tentamos login de emergência (modo demo)
      if (email === 'admin@master.com') {
         setUser({ id: '1', email, name: 'Admin Master', role: UserRole.ADMIN });
      } else {
         setLoginError('Credenciais inválidas no Supabase.');
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentEvent(null);
    setCashierName(null);
  };

  const syncToCloud = async (table: string, data: any) => {
    if (!isOnline) return;
    setIsSyncing(true);
    await supabase.from(table).upsert(data);
    setIsSyncing(false);
  };

  const removeFromCloud = async (table: string, id: string) => {
    setIsSyncing(true);
    await supabase.from(table).delete().eq('id', id);
    setIsSyncing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-[3.5rem] shadow-2xl p-10 w-full max-w-md animate-in fade-in zoom-in">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Landmark size={40} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Quermesse<span className="text-red-600">Digital</span></h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Conectado ao seu Supabase</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input name="email" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="E-mail" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input name="password" type="password" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Senha" />
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-red-700 active:scale-95 transition-all">
              Acessar Painel
            </button>
          </form>
          <div className="mt-8 text-center text-gray-300 text-[10px] font-black uppercase tracking-widest">
            {navigator.onLine ? <Wifi size={12} className="inline text-green-400 mr-1" /> : <WifiOff size={12} className="inline text-red-400 mr-1" />} Cloud Sync v2.5
          </div>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic mb-10">Selecione o Evento Ativo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {events.map(event => (
            <div key={event.id} onClick={() => setCurrentEvent(event)} className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 hover:scale-105 transition-all cursor-pointer text-center group">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-600 group-hover:text-white transition-all">
                <Landmark size={32} />
              </div>
              <p className="font-black text-xl text-gray-800 uppercase truncate">{event.name}</p>
            </div>
          ))}
          <div onClick={() => setIsEventModalOpen(true)} className="bg-gray-50 border-4 border-dashed border-gray-200 p-8 rounded-[3rem] hover:border-red-200 cursor-pointer flex flex-col items-center justify-center group">
             {/* Fix: Added Plus to lucide-react imports */}
             <Plus className="text-gray-300 group-hover:text-red-600" size={32} />
             <p className="font-black text-gray-300 group-hover:text-red-600 uppercase">Novo Evento</p>
          </div>
        </div>
        <button onClick={handleLogout} className="mt-12 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-red-600">Sair da Conta</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {(user.role === UserRole.ADMIN || user.role === UserRole.USER) && !isFullScreen && (
        <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} currentView={currentView} setView={setCurrentView} user={user} eventName={currentEvent.name} />
      )}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">{currentView}</h2>
            {isSyncing && <CloudSync className="animate-spin text-red-600" size={20} />}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-black uppercase text-gray-400">{user.name} | {user.role}</p>
            <button onClick={handleLogout} className="p-2 text-gray-300 hover:text-red-600"><LogOut size={20} /></button>
          </div>
        </header>

        <div className="p-6">
          {currentView === 'DASHBOARD' && <Dashboard lotes={lotes} vendedores={vendedores} products={products} />}
          {currentView === 'PDV' && <PDV products={products} onAddOrder={async (o) => { setOrders([o, ...orders]); await syncToCloud('orders', o); }} cashierName={cashierName} setCashierName={setCashierName} userRole={user.role} onLogout={handleLogout} />}
          {currentView === 'LEILAO' && <Leilao lotes={lotes} setLotes={setLotes} />}
          {currentView === 'PRODUTOS' && <Products products={products} setProducts={async (p) => { setProducts(p); await syncToCloud('products', p); }} insumos={insumos} />}
          {currentView === 'BALANCETE' && <Balancete lotes={lotes} vendedores={vendedores} products={products} services={services} compras={compras} orders={orders} doacoes={doacoes} insumos={insumos} currentEvent={currentEvent} />}
          {currentView === 'DOACOES' && <Doacoes doadores={doadores} setDoadores={setDoadores} doacoes={doacoes} onAddDoacao={async (d) => { setDoacoes([...doacoes, d]); await syncToCloud('doacoes', d); }} onDeleteDoacao={async (id) => { setDoacoes(doacoes.filter(x => x.id !== id)); await removeFromCloud('doacoes', id); }} insumos={insumos} />}
          {currentView === 'COMPRAS' && <Compras insumos={insumos} compras={compras} onAddCompra={async (c) => { setCompras([...compras, c]); await syncToCloud('compras', c); }} onDeleteCompra={async (id) => { setCompras(compras.filter(x => x.id !== id)); await removeFromCloud('compras', id); }} categorias={['Geral', 'Cozinha']} setCategorias={() => {}} />}
          {currentView === 'ESTOQUE' && <Inventory insumos={insumos} setInsumos={setInsumos} products={products} vendedores={vendedores} orders={orders} />}
          {currentView === 'TESOURARIA' && <Tesouraria orders={orders} products={products} currentEvent={currentEvent} />}
          {currentView === 'VENDAS_ANTECIPADAS' && <VendasAntecipadas vendedores={vendedores} setVendedores={setVendedores} products={products} />}
          {currentView === 'SERVICOS' && <Servicos services={services} setServices={setServices} />}
          {currentView === 'OFICIOS' && <Oficios />}
          {currentView === 'CONFIG' && <Config users={registeredUsers} setUsers={setRegisteredUsers} currentEvent={currentEvent} onUpdateEvent={async (e) => { setCurrentEvent(e); await syncToCloud('events', e); }} />}
        </div>
      </main>
    </div>
  );
};

export default App;
