
import React, { useState, useEffect } from 'react';
import { 
  Landmark, CloudSync, Wifi, WifiOff, Plus
} from 'lucide-react';
import { db } from './lib/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

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
  // Perfil de usuário fixo para eliminar login
  const [user] = useState<User>({
    id: 'local-admin',
    email: 'admin@quermesse.local',
    name: 'Administrador Local',
    role: UserRole.ADMIN
  });

  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cashierName, setCashierName] = useState<string | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // States de Dados
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
  const [productCategories, setProductCategories] = useState<string[]>(['Comida', 'Bebidas', 'Doces']);

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

  // Sincronização em tempo real via Firestore Snapshots (Sempre ativa)
  useEffect(() => {
    setIsSyncing(true);

    const unsubscribers = [
      onSnapshot(collection(db, "events"), (s) => setEvents(s.docs.map(d => d.data() as Event))),
      onSnapshot(collection(db, "users"), (s) => setRegisteredUsers(s.docs.map(d => d.data() as User))),
      onSnapshot(collection(db, "insumos"), (s) => setInsumos(s.docs.map(d => d.data() as Insumo))),
      onSnapshot(query(collection(db, "orders"), orderBy("timestamp", "desc")), (s) => setOrders(s.docs.map(d => d.data() as Order))),
      onSnapshot(collection(db, "doadores"), (s) => setDoadores(s.docs.map(d => d.data() as Doador))),
      onSnapshot(collection(db, "doacoes"), (s) => setDoacoes(s.docs.map(d => d.data() as Doacao))),
      onSnapshot(collection(db, "compras"), (s) => setCompras(s.docs.map(d => d.data() as Compra))),
      onSnapshot(collection(db, "products"), (s) => setProducts(s.docs.map(d => d.data() as Product))),
      onSnapshot(collection(db, "lotes"), (s) => setLotes(s.docs.map(d => d.data() as Lote))),
      onSnapshot(collection(db, "vendedores"), (s) => setVendedores(s.docs.map(d => d.data() as Vendedor))),
      onSnapshot(collection(db, "services"), (s) => setServices(s.docs.map(d => d.data() as Servico))),
      onSnapshot(collection(db, "product_categories"), (s) => {
        const cats = s.docs.map(d => d.data().name);
        if (cats.length > 0) setProductCategories(cats);
      })
    ];

    setIsSyncing(false);
    return () => unsubscribers.forEach(fn => fn());
  }, []);

  const syncToCloud = async (table: string, data: any) => {
    if (!isOnline) return;
    setIsSyncing(true);
    const id = data.id || `doc_${Date.now()}`;
    await setDoc(doc(db, table, id), data);
    setIsSyncing(false);
  };

  const removeFromCloud = async (table: string, id: string) => {
    setIsSyncing(true);
    await deleteDoc(doc(db, table, id));
    setIsSyncing(false);
  };

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[2.2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-50">
            <Landmark size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">Selecione o Evento</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Sistema Quermesse Digital</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {events.map(event => (
            <div key={event.id} onClick={() => setCurrentEvent(event)} className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 hover:scale-105 transition-all cursor-pointer text-center group">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-600 group-hover:text-white transition-all">
                <Landmark size={32} />
              </div>
              <p className="font-black text-xl text-gray-800 uppercase leading-none truncate">{event.name}</p>
            </div>
          ))}

          <div onClick={() => setIsEventModalOpen(true)} className="bg-gray-50 border-4 border-dashed border-gray-200 p-8 rounded-[3rem] hover:border-red-200 hover:bg-white transition-all cursor-pointer flex flex-col items-center justify-center group">
            <Plus size={32} className="text-gray-400 group-hover:text-red-600" />
            <p className="font-black text-xl text-gray-400 group-hover:text-red-600 uppercase leading-none mt-4">Criar Novo</p>
          </div>
        </div>

        {isEventModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[3.5rem] shadow-2xl p-10 w-full max-w-xl">
               <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter italic">Nova Quermesse Firestore</h3>
               <button onClick={async () => {
                   const id = `evt_${Date.now()}`;
                   const newEvt: Event = { 
                     id, 
                     name: 'Evento Quermesse 2024', 
                     dateRanges: [{start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0]}], 
                     status: 'active' 
                   };
                   await syncToCloud('events', newEvt);
                   setIsEventModalOpen(false);
                }} className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black uppercase shadow-xl tracking-widest">
                 Salvar no Firebase
               </button>
               <button onClick={() => setIsEventModalOpen(false)} className="w-full mt-4 text-gray-400 font-black uppercase text-xs">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {!isFullScreen && <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} currentView={currentView} setView={setCurrentView} user={user} eventName={currentEvent.name} />}
      <main className="flex-1 overflow-y-auto relative">
        {!isFullScreen && (
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">{currentView}</h2>
              {isSyncing && <CloudSync className="animate-spin text-red-600" size={20} />}
              {!isOnline && <WifiOff className="text-red-500" size={20} />}
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentEvent(null)}
                className="text-[10px] font-black uppercase text-gray-400 hover:text-red-600 transition-colors"
              >
                Trocar Evento
              </button>
              <div className="h-6 w-px bg-gray-100"></div>
              <p className="text-[10px] font-black uppercase text-gray-900">{user.name}</p>
            </div>
          </header>
        )}

        <div className={isFullScreen ? "" : "p-6"}>
          {currentView === 'DASHBOARD' && <Dashboard lotes={lotes} vendedores={vendedores} products={products} />}
          {currentView === 'PDV' && (
            <PDV 
              products={products} 
              onAddOrder={async (o) => { await syncToCloud('orders', o); }} 
              cashierName={cashierName} 
              setCashierName={setCashierName} 
              userRole={user.role} 
              isFullScreen={isFullScreen}
              toggleFullScreen={() => setIsFullScreen(!isFullScreen)}
              categories={productCategories}
            />
          )}
          {currentView === 'LEILAO' && <Leilao lotes={lotes} setLotes={() => {}} />}
          {currentView === 'PRODUTOS' && (
            <Products 
              products={products} 
              setProducts={async (pList) => { }} 
              insumos={insumos} 
              categories={productCategories}
              setCategories={async (cats) => {
                await Promise.all(cats.map(c => setDoc(doc(db, "product_categories", c), { name: c })));
              }}
            />
          )}
          {currentView === 'BALANCETE' && <Balancete lotes={lotes} vendedores={vendedores} products={products} services={services} compras={compras} orders={orders} doacoes={doacoes} insumos={insumos} currentEvent={currentEvent} />}
          {currentView === 'DOACOES' && <Doacoes doadores={doadores} setDoadores={() => {}} doacoes={doacoes} onAddDoacao={async (d) => await syncToCloud('doacoes', d)} onDeleteDoacao={async (id) => await removeFromCloud('doacoes', id)} insumos={insumos} />}
          {currentView === 'COMPRAS' && <Compras insumos={insumos} compras={compras} onAddCompra={async (c) => await syncToCloud('compras', c)} onDeleteCompra={async (id) => await removeFromCloud('compras', id)} categorias={['Geral', 'Cozinha']} setCategorias={() => {}} />}
          {currentView === 'ESTOQUE' && <Inventory insumos={insumos} setInsumos={() => {}} products={products} vendedores={vendedores} orders={orders} />}
          {currentView === 'TESOURARIA' && <Tesouraria orders={orders} products={products} currentEvent={currentEvent} />}
          {currentView === 'VENDAS_ANTECIPADAS' && <VendasAntecipadas vendedores={vendedores} setVendedores={() => {}} products={products} />}
          {currentView === 'SERVICOS' && <Servicos services={services} setServices={() => {}} />}
          {currentView === 'OFICIOS' && <Oficios />}
          {currentView === 'CONFIG' && <Config users={registeredUsers} setUsers={() => {}} currentEvent={currentEvent} onUpdateEvent={async (e) => await syncToCloud('events', e)} />}
        </div>
      </main>
    </div>
  );
};

export default App;
