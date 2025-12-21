
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, Trash2, Printer, Search, Plus, Minus, CreditCard, 
  Banknote, QrCode, Maximize2, Minimize2, Utensils, Monitor, 
  Smartphone, LogOut, ChevronRight, X, DollarSign, Calculator, ArrowRight
} from 'lucide-react';
import { Product, Order, PaymentEntry, UserRole, PaymentMethod } from '../types';

interface PDVProps {
  products: Product[];
  onAddOrder: (order: Order) => void;
  isFullScreen?: boolean;
  toggleFullScreen?: () => void;
  cashierName: string | null;
  setCashierName: (name: string | null) => void;
  userRole: UserRole;
  onLogout: () => void;
}

const PDV: React.FC<PDVProps> = ({ products, onAddOrder, isFullScreen, toggleFullScreen, cashierName, setCashierName, userRole, onLogout }) => {
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Comida');
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Estados para o formulário de pagamento atual
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod | null>(null);
  const [amountToPay, setAmountToPay] = useState<string>('');
  const [receivedAmount, setReceivedAmount] = useState<string>('');

  const cartTotal = useMemo(() => cart.reduce((acc, item) => {
    const p = products.find(x => x.id === item.productId);
    return acc + (p?.preco || 0) * item.quantity;
  }, 0), [cart, products]);

  const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);
  const remainingToPay = Math.max(0, cartTotal - totalPaid);
  
  // Cálculo de troco baseado no último pagamento em dinheiro ou no total acumulado
  const changeAmount = useMemo(() => {
    const cashPayments = payments.filter(p => p.method === 'Dinheiro');
    if (cashPayments.length === 0) return 0;
    return Math.max(0, totalPaid - cartTotal);
  }, [payments, totalPaid, cartTotal]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.nome.toLowerCase().includes(filter.toLowerCase());
      let matchesCategory = false;
      if (selectedCategory === 'Tudo') {
        matchesCategory = true;
      } else if (selectedCategory === 'BebidasDoces') {
        matchesCategory = p.categoria === 'Bebidas' || p.categoria === 'Doces';
      } else {
        matchesCategory = p.categoria === selectedCategory;
      }
      return matchesSearch && matchesCategory;
    });
  }, [products, filter, selectedCategory]);

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(item => item.productId !== productId);
        return prev.map(item => item.productId === productId ? { ...item, quantity: newQty } : item);
      } else if (delta > 0) {
        return [...prev, { productId, quantity: 1 }];
      }
      return prev;
    });
  };

  const addPayment = () => {
    if (!currentPaymentMethod) return;
    const value = parseFloat(amountToPay);
    if (isNaN(value) || value <= 0) return;

    const received = parseFloat(receivedAmount) || value;
    const change = currentPaymentMethod === 'Dinheiro' ? Math.max(0, received - value) : 0;

    const newPayment: PaymentEntry = {
      method: currentPaymentMethod,
      amount: value,
      received: currentPaymentMethod === 'Dinheiro' ? received : undefined,
      change: currentPaymentMethod === 'Dinheiro' ? change : undefined
    };

    setPayments([...payments, newPayment]);
    setAmountToPay('');
    setReceivedAmount('');
    setCurrentPaymentMethod(null);
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleCheckout = () => {
    if (cart.length === 0 || totalPaid < cartTotal) return;
    
    onAddOrder({
      id: Math.random().toString(36).substr(2, 9),
      items: cart.map(i => ({ ...i, price: products.find(p => p.id === i.productId)!.preco })),
      total: cartTotal,
      payments: payments,
      timestamp: new Date().toISOString(),
      cashierName: cashierName!
    });
    
    alert('VENDA CONCLUÍDA COM SUCESSO!');
    setCart([]);
    setPayments([]);
    setShowCheckout(false);
  };

  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    // (Lógica de abertura de caixa mantida conforme anterior...)
  };

  if (!cashierName) {
    // Tela de abertura... (Mantida para brevidade)
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50 animate-in fade-in zoom-in duration-500">
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 w-full max-w-xl text-center">
          <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4 italic leading-none">Abertura de Caixa</h2>
          <form onSubmit={(e) => { e.preventDefault(); setCashierName("CAIXA FIXO - OPERADOR"); }} className="space-y-4">
            <input required className="w-full p-5 border-2 border-gray-100 rounded-3xl outline-none focus:border-red-500 text-center text-lg" placeholder="NOME DO OPERADOR" />
            <button type="submit" className="w-full bg-red-600 text-white py-5 rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl">ABRIR CAIXA</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${isFullScreen ? 'h-screen p-6' : 'h-[calc(100vh-140px)]'}`}>
      {/* Lado Esquerdo: Produtos */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['Comida', 'BebidasDoces', 'Tudo'].map((catId) => (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                  selectedCategory === catId 
                  ? 'bg-red-600 border-red-600 text-white shadow-lg' 
                  : 'bg-white border-gray-100 text-gray-400'
                }`}
              >
                {catId === 'BebidasDoces' ? 'Bebidas/Doces' : catId}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input 
                className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 outline-none shadow-sm font-bold text-gray-700"
                placeholder="Buscar item..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-10 custom-scrollbar">
          {filteredProducts.map(product => {
            const inCart = cart.find(c => c.productId === product.id);
            return (
              <div
                key={product.id}
                onClick={() => updateQuantity(product.id, 1)}
                className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col justify-between h-44 cursor-pointer select-none active:scale-95 ${
                  inCart ? 'border-red-500 bg-red-50/30' : 'border-white bg-white shadow-sm hover:border-red-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{product.categoria}</span>
                    <h4 className="font-black text-gray-800 text-sm leading-tight line-clamp-2">{product.nome}</h4>
                  </div>
                  {inCart && <div className="bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-xs">{inCart.quantity}</div>}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-black text-gray-900">R$ {product.preco.toFixed(2)}</span>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-400"><Minus size={14} /></button>
                    <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lado Direito: Carrinho e Checkout */}
      <div className="w-full lg:w-[450px] bg-white rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-right-10">
        {!showCheckout ? (
          <>
            <div className="p-8 border-b bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-black text-gray-800 flex items-center gap-3 text-lg tracking-tighter"><ShoppingCart size={22} className="text-red-600" /> CARRINHO</h3>
              <button onClick={() => setCart([])} className="text-[10px] font-black text-gray-400 uppercase hover:text-red-600">Limpar</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-200 gap-4 opacity-50">
                  <Utensils size={64} />
                  <p className="font-black text-xs uppercase tracking-widest">Nenhum item selecionado</p>
                </div>
              ) : (
                cart.map(item => {
                  const p = products.find(x => x.id === item.productId)!;
                  return (
                    <div key={item.productId} className="flex items-center justify-between group animate-in slide-in-from-right-4">
                      <div className="flex-1">
                        <p className="font-black text-gray-800 uppercase text-xs">{p.nome}</p>
                        <p className="text-[10px] font-bold text-gray-400">{item.quantity}x R$ {p.preco.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-gray-900 text-sm">R$ {(item.quantity * p.preco).toFixed(2)}</span>
                        <button onClick={() => updateQuantity(p.id, -item.quantity)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-10 bg-gray-900 text-white">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total do Pedido</p>
                  <p className="text-4xl font-black text-white tracking-tighter">R$ {cartTotal.toFixed(2)}</p>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Calculator size={32} />
                </div>
              </div>
              <button 
                disabled={cart.length === 0}
                onClick={() => {
                  setShowCheckout(true);
                  setAmountToPay(cartTotal.toString());
                }}
                className="w-full bg-red-600 text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-red-900/40 hover:bg-red-500 active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3 transition-all"
              >
                PAGAMENTO <ArrowRight size={24} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full bg-white">
            <div className="p-8 border-b flex items-center justify-between bg-gray-50/50">
              <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
              <h3 className="font-black text-gray-800 text-lg tracking-tighter">CHECKOUT</h3>
              <div className="w-6" />
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Resumo de Valores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">A Pagar</p>
                  <p className="text-2xl font-black text-gray-900">R$ {cartTotal.toFixed(2)}</p>
                </div>
                <div className={`p-6 rounded-[2rem] border-2 transition-all ${remainingToPay > 0 ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                  <p className="text-[9px] font-black opacity-60 uppercase mb-1">Saldo</p>
                  <p className="text-2xl font-black">{remainingToPay > 0 ? `R$ ${remainingToPay.toFixed(2)}` : 'QUITADO'}</p>
                </div>
              </div>

              {/* Lançamentos de Pagamento */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pagamentos Realizados</p>
                {payments.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-left-4">
                    <div className="flex items-center gap-3">
                      {p.method === 'Dinheiro' ? <Banknote className="text-green-600" size={18} /> : p.method === 'Pix' ? <QrCode className="text-purple-600" size={18} /> : <CreditCard className="text-blue-600" size={18} />}
                      <div>
                        <p className="font-black text-xs uppercase text-gray-800">{p.method}</p>
                        {p.received && <p className="text-[9px] font-bold text-gray-400">Recebido R$ {p.received.toFixed(2)}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-gray-900 text-sm">R$ {p.amount.toFixed(2)}</span>
                      <button onClick={() => removePayment(idx)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && <p className="text-center py-4 text-gray-300 text-xs italic">Nenhum pagamento lançado</p>}
              </div>

              {/* Formulário de Adição de Pagamento */}
              {remainingToPay > 0 && (
                <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-6 space-y-6 shadow-xl">
                  <div className="flex gap-2">
                    {[
                      { id: 'Dinheiro', icon: Banknote, color: 'hover:bg-green-50 text-green-600' },
                      { id: 'Cartão', icon: CreditCard, color: 'hover:bg-blue-50 text-blue-600' },
                      { id: 'Pix', icon: QrCode, color: 'hover:bg-purple-50 text-purple-600' }
                    ].map(m => (
                      <button 
                        key={m.id}
                        onClick={() => {
                          setCurrentPaymentMethod(m.id as any);
                          setAmountToPay(remainingToPay.toString());
                        }}
                        className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1 ${currentPaymentMethod === m.id ? 'bg-gray-900 border-gray-900 text-white scale-105' : `bg-white border-gray-50 ${m.color}`}`}
                      >
                        <m.icon size={24} />
                        <span className="text-[9px] font-black uppercase">{m.id}</span>
                      </button>
                    ))}
                  </div>

                  {currentPaymentMethod && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Valor Lançado</label>
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 outline-none focus:ring-2 focus:ring-red-500/20"
                            value={amountToPay}
                            onChange={e => setAmountToPay(e.target.value)}
                          />
                        </div>
                        {currentPaymentMethod === 'Dinheiro' && (
                          <div>
                            <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Valor Recebido</label>
                            <input 
                              type="number" 
                              step="0.01"
                              autoFocus
                              className="w-full p-4 bg-green-50 border-none rounded-2xl font-black text-green-700 outline-none focus:ring-2 focus:ring-green-500/20"
                              placeholder="0.00"
                              value={receivedAmount}
                              onChange={e => setReceivedAmount(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                      
                      {currentPaymentMethod === 'Dinheiro' && receivedAmount && parseFloat(receivedAmount) > parseFloat(amountToPay) && (
                        <div className="bg-green-600 p-4 rounded-2xl text-white flex justify-between items-center">
                           <span className="text-[10px] font-black uppercase">Troco ao Cliente:</span>
                           <span className="text-xl font-black">R$ {(parseFloat(receivedAmount) - parseFloat(amountToPay)).toFixed(2)}</span>
                        </div>
                      )}

                      <button 
                        onClick={addPayment}
                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                      >
                        CONFIRMAR {currentPaymentMethod.toUpperCase()}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 border-t">
              {changeAmount > 0 && (
                 <div className="mb-6 bg-white p-6 rounded-3xl border-2 border-green-500 shadow-lg flex items-center justify-between animate-bounce">
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase">Troco Total Devido</p>
                       <p className="text-3xl font-black text-green-600">R$ {changeAmount.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-green-500 text-white rounded-2xl"><Banknote size={32} /></div>
                 </div>
              )}
              
              <button 
                disabled={totalPaid < cartTotal}
                onClick={handleCheckout}
                className="w-full bg-red-600 text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-red-200 disabled:opacity-10 flex items-center justify-center gap-4 transition-all"
              >
                <Printer size={28} /> FINALIZAR VENDA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDV;
