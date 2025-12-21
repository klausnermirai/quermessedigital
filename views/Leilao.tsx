
import React, { useState } from 'react';
import { Gavel, Plus, Trophy, X, Save, DollarSign, User, Package, Trash2, History, Calendar, CheckCircle, Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { Lote } from '../types';
import { supabase } from '../lib/supabase';

interface LeilaoProps {
  lotes: Lote[];
  setLotes: React.Dispatch<React.SetStateAction<Lote[]>>;
}

const Leilao: React.FC<LeilaoProps> = ({ lotes, setLotes }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newLote, setNewLote] = useState({
    item: '',
    doador: '',
    lanceInicial: '',
    tipo: 'Lance Único' as Lote['tipo'],
    fotoUrl: ''
  });

  const [finalizeData, setFinalizeData] = useState({ valor: '', arrematador: '' });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('prendas')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('prendas')
        .getPublicUrl(fileName);

      setNewLote(prev => ({ ...prev, fotoUrl: publicUrl }));
    } catch (err) {
      alert('Erro ao subir foto. Verifique se o bucket "prendas" é público.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLote.item || !newLote.doador) return;

    const entry: Lote = {
      id: `lote_${Date.now()}`,
      item: newLote.item,
      doador: newLote.doador,
      lanceInicial: parseFloat(newLote.lanceInicial) || 0,
      status: 'ativo',
      tipo: newLote.tipo,
      fotoUrl: newLote.fotoUrl
    };

    const { error } = await supabase.from('lotes').insert(entry);
    if (!error) {
      setLotes(prev => [entry, ...prev]);
      setIsModalOpen(false);
      setNewLote({ item: '', doador: '', lanceInicial: '', tipo: 'Lance Único', fotoUrl: '' });
    }
  };

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLote) return;

    const updated = {
      ...selectedLote,
      status: 'arrematado' as const,
      valorArremate: parseFloat(finalizeData.valor),
      arrematador: finalizeData.arrematador,
      dataArremate: new Date().toISOString()
    };

    const { error } = await supabase.from('lotes').update(updated).eq('id', selectedLote.id);
    if (!error) {
      setLotes(prev => prev.map(l => l.id === selectedLote.id ? updated : l));
      setIsFinalizeModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800 italic uppercase">Leilão Virtual</h3>
          <p className="text-sm text-gray-500 font-medium">Gestão de Prendas com Fotos e Arremates</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-xl flex items-center gap-2">
          <Plus size={18} /> Novo Lote
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {lotes.map(lote => (
          <div key={lote.id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-xl hover:shadow-2xl transition-all group">
            <div className="h-48 bg-gray-100 relative overflow-hidden">
               {lote.fotoUrl ? (
                 <img src={lote.fotoUrl} alt={lote.item} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={48} />
                 </div>
               )}
               <div className={`absolute top-4 left-4 px-4 py-1 rounded-full text-[10px] font-black uppercase shadow-lg ${lote.status === 'ativo' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
                 {lote.status}
               </div>
            </div>
            
            <div className="p-6">
               <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">{lote.item}</h4>
               <p className="text-xs text-gray-400 font-bold uppercase mb-4 tracking-widest">Doador: {lote.doador}</p>
               
               <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase">Lance Inicial</p>
                    <p className="text-lg font-black text-gray-900">R$ {lote.lanceInicial.toFixed(2)}</p>
                  </div>
                  {lote.valorArremate && (
                    <div className="text-right">
                       <p className="text-[9px] font-black text-green-500 uppercase">Arrematado por</p>
                       <p className="text-lg font-black text-green-600">R$ {lote.valorArremate.toFixed(2)}</p>
                    </div>
                  )}
               </div>

               {lote.status === 'ativo' ? (
                 <button onClick={() => { setSelectedLote(lote); setIsFinalizeModalOpen(true); }} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-100">Finalizar Arremate</button>
               ) : (
                 <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center gap-3">
                    <Trophy className="text-green-600" size={24} />
                    <div>
                       <p className="text-[10px] font-black text-green-600 uppercase">Ganhador</p>
                       <p className="text-xs font-bold text-gray-700">{lote.arrematador}</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Lote */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden p-8">
            <h4 className="text-2xl font-black mb-6 uppercase italic tracking-tighter">Novo Lote de Leilão</h4>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-3xl cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden relative">
                  {isUploading ? (
                    <Loader2 className="animate-spin text-red-600" />
                  ) : newLote.fotoUrl ? (
                    <img src={newLote.fotoUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Foto da Prenda</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
              <input required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Item/Prenda" value={newLote.item} onChange={e => setNewLote({...newLote, item: e.target.value})} />
              <input required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Doador" value={newLote.doador} onChange={e => setNewLote({...newLote, doador: e.target.value})} />
              <input type="number" step="0.01" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Lance Inicial" value={newLote.lanceInicial} onChange={e => setNewLote({...newLote, lanceInicial: e.target.value})} />
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-gray-400 uppercase text-xs">Cancelar</button>
                <button type="submit" className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl">Salvar Lote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Finalizar */}
      {isFinalizeModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm p-8">
            <h4 className="text-2xl font-black mb-6 uppercase italic text-green-600">Arrematar Item</h4>
            <form onSubmit={handleFinalize} className="space-y-4">
              <input required type="number" step="0.01" className="w-full p-4 bg-green-50 text-green-700 border-none rounded-2xl font-black text-lg" placeholder="Valor Final" value={finalizeData.valor} onChange={e => setFinalizeData({...finalizeData, valor: e.target.value})} />
              <input required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Nome do Ganhador" value={finalizeData.arrematador} onChange={e => setFinalizeData({...finalizeData, arrematador: e.target.value})} />
              <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl mt-4">Confirmar Vitória</button>
              <button type="button" onClick={() => setIsFinalizeModalOpen(false)} className="w-full text-gray-300 font-black uppercase text-[10px] mt-2">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leilao;
