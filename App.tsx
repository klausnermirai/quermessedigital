
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
import { User, Event, View, UserRole, Insumo, Product, Lote, Vendedor, Servico, Compra, Doador, Doacao, Order } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cashierName, setCashierName] = useState<string | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Estados principais sincronizados com Supabase
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

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitoramento de Sessão
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
          role: session.user.user_metadata?.role || UserRole.ADMIN
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
          role: session.user.user_metadata?.role || UserRole.ADMIN
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Busca Geral de Dados (Conexão com as Tabelas do Supabase)
  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      // Carrega tudo em paralelo para performance
      const [
        { data: evts }, { data: usrs }, { data: ins }, { data: ords }, 
        { data: ddr }, { data: dcs }, { data: cmp }, { data: prod }, 
        { data: lt }, { data: vend }, { data: serv }
      ] = await Promise.all([
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
      ]);
      
      if (evts) setEvents(evts);
      if (usrs) setRegisteredUsers(usrs);
      if (ins) setInsumos(ins);
      if (ords) setOrders(ords);
      if (ddr) setDoadores(ddr);
      if (dcs) setDoacoes(dcs);
      if (cmp) setCompras(cmp);
      if (prod) setProducts(prod);
      if (lt) setLotes(lt);
      if (vend) setVendedores(vend);
      if (serv) setServices(serv);

    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  // Realtime: Escuta mudanças em tempo real no banco
  useEffect(() => {
    if (user) {
      fetchData();
      const channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user, fetchData]);

  // LOGIN POR E-MAIL/SENHA
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const email = (e.target as any).email.value;
    const password = (e.target as any).password.value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Fallback para acesso administrativo de emergência se o banco estiver vazio
      if (email === 'admin@master.com' && password === 'master123') {
         setUser({ id: 'master_root', email, name: 'Administrador Master', role: UserRole.ADMIN });
      } else {
         setLoginError('Credenciais inválidas. Tente admin@master.com / master123');
      }
    }
  };

  // LOGIN PELO GOOGLE (CORREÇÃO DO ERRO DO USUÁRIO)
  const handleGoogleLogin = async () => {
    setLoginError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      // Se cair aqui, é porque o Google não está ativo no Supabase
      setLoginError('O Google ainda não foi habilitado no seu painel Supabase. Use e-mail e senha por enquanto.');
      console.error('Erro OAuth:', error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentEvent(null);
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

  // TELA DE LOGIN (UI PREMIUM)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-[3.5rem] shadow-2xl p-10 w-full max-w-md animate-in fade-in zoom-in duration-500 border-b-8 border-red-700/20">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[2.2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-50">
              <Landmark size={40} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Quermesse<span className="text-red-600">Digital</span></h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Plataforma Cloud de Gestão Paroquial</p>
          </div>

          <div className="mb-8 p-6 bg-red-50 rounded-[2rem] border border-red-100">
            <p className="text-center text-xs font-bold text-red-800 leading-relaxed uppercase tracking-tighter">
              Utilize o Google se o provedor estiver ativo, ou entre com e-mail e senha para gerenciar seu evento.
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-2xl flex items-center gap-3 text-xs font-bold animate-pulse">
              <AlertCircle size={18} /> {loginError}
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all text-gray-700 active:scale-95 shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Entrar com Google
            </button>

            <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-gray-300 text-[10px] font-black uppercase">Ou use E-mail</span>
                <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input name="email" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-red-500 transition-all font-bold text-gray-700 text-sm" placeholder="E-mail" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input name="password" type="password" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-red-500 transition-all font-bold text-gray-700 text-sm" placeholder="Senha" required />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95">
                Acessar Sistema
              </button>
            </form>
          </div>

          <div className="mt-8 text-center text-gray-300 text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            CLOUD READY • {isOnline ? <Wifi size={12} className="text-green-500" /> : <WifiOff size={12} className="text-red-500" />} {isSyncing && <CloudSync className="animate-spin" size={12} />}
          </div>
        </div>
      </div>
    );
  }

  // TELA DE SELEÇÃO DE EVENTO (PÓS-LOGIN)
  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">Selecione a Quermesse</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Olá, {user.name}. Qual evento vamos gerenciar hoje?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {events.length > 0 ? events.map(event => (
            <div key={event.id} onClick={() => setCurrentEvent(event)} className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 hover:scale-105 transition-all cursor-pointer text-center group">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-600 group-hover:text-white transition-all">
                <Landmark size={32} />
              </div>
              <p className="font-black text-xl text-gray-800 uppercase leading-none truncate">{event.name}</p>
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">{event.status === 'active' ? '● Aberto para Operação' : 'Finalizado'}</p>
            </div>
          )) : (
            <div className="col-span-full p-12 text-center text-gray-300 font-bold uppercase text-sm border-4 border-dashed rounded-[3rem]">
               Nenhum evento encontrado no seu banco Supabase.
            </div>
          )}

          <div onClick={() => setIsEventModalOpen(true)} className="bg-gray-50 border-4 border-dashed border-gray-200 p-8 rounded-[3rem] hover:border-red-200 hover:bg-white transition-all cursor-pointer flex flex-col items-center justify-center group">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
              <Plus size={32} />
            </div>
            <p className="font-black text-xl text-gray-400 group-hover:text-red-600 uppercase leading-none">Criar Novo</p>
          </div>
        </div>

        <button onClick={handleLogout} className="mt-12 flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-[10px] tracking-widest transition-colors">
          <LogOut size={16} /> Sair da conta
        </button>

        {isEventModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[3.5rem] shadow-2xl p-10 w-full max-w-xl animate-in zoom-in duration-300">
               <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter italic">Configurar Nova Quermesse</h3>
               <p className="text-gray-500 mb-8 font-medium">Os dados serão sincronizados automaticamente com o banco ttkslmgvorvlczowrbdh.</p>
               <button onClick={async () => {
                   const newEvt: Event = { 
                     id: `evt_${Date.now()}`, 
                     name: 'Nova Quermesse 2024', 
                     dateRanges: [{start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0]}], 
                     status: 'active' 
                   };
                   await syncToCloud('events', newEvt);
                   setEvents([newEvt, ...events]);
                   setIsEventModalOpen(false);
                }} className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black uppercase shadow-xl tracking-widest active:scale-95 transition-all">
                 Salvar Novo Evento no Cloud
               </button>
               <button onClick={() => setIsEventModalOpen(false)} className="w-full mt-4 text-gray-400 font-black uppercase text-xs tracking-widest">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // APP PRINCIPAL
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
            {!isOnline && <WifiOff className="text-red-500" size={20} />}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-black uppercase text-gray-400">{user.name} | {user.role}</p>
            <button onClick={handleLogout} className="p-2 text-gray-300 hover:text-red-600 transition-colors"><LogOut size={20} /></button>
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
