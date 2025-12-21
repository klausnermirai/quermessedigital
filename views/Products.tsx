
import React, { useState } from 'react';
import { Plus, Utensils, Edit3, Trash2, List, X, Save, PlusCircle, MinusCircle, Hash, Target } from 'lucide-react';
import { Product, ProductRecipe, Insumo } from '../types';

interface ProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  insumos: Insumo[];
}

const Products: React.FC<ProductsProps> = ({ products, setProducts, insumos }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formPreco, setFormPreco] = useState('');
  const [formCategoria, setFormCategoria] = useState('Culinária');
  const [formRendimento, setFormRendimento] = useState('100');
  const [formProjeção, setFormProjeção] = useState('500');
  const [formReceita, setFormReceita] = useState<ProductRecipe[]>([]);

  // Limpa/Reseta o formulário
  const resetForm = () => {
    setFormName('');
    setFormPreco('');
    setFormCategoria('Culinária');
    setFormRendimento('100');
    setFormProjeção('500');
    setFormReceita([]);
    setEditingProduct(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.nome);
    setFormPreco(product.preco.toString());
    setFormCategoria(product.categoria);
    setFormRendimento((product.rendimento || 100).toString());
    setFormProjeção((product.vendasProjetadas || 0).toString());
    setFormReceita([...product.receita]);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPreco) return;

    const productData: Product = {
      id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
      nome: formName,
      preco: parseFloat(formPreco),
      categoria: formCategoria,
      rendimento: parseInt(formRendimento) || 1,
      vendasProjetadas: parseInt(formProjeção) || 0,
      receita: formReceita
    };

    if (editingProduct) {
      setProducts(products.map(item => item.id === editingProduct.id ? productData : item));
    } else {
      setProducts([productData, ...products]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este produto?')) {
      setProducts(products.filter(item => item.id !== id));
    }
  };

  const addRecipeItem = () => {
    if (insumos.length === 0) {
      alert('Cadastre insumos no Estoque primeiro!');
      return;
    }
    setFormReceita([...formReceita, { insumoId: insumos[0].id, quantidade: 1 }]);
  };

  const removeRecipeItem = (index: number) => {
    setFormReceita(formReceita.filter((_, i) => i !== index));
  };

  const updateRecipeItem = (index: number, field: keyof ProductRecipe, value: any) => {
    const newReceita = [...formReceita];
    newReceita[index] = { ...newReceita[index], [field]: field === 'quantidade' ? parseFloat(value) : value };
    setFormReceita(newReceita);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Produtos e Fichas Técnicas</h3>
          <p className="text-sm text-gray-500">Defina as receitas e a meta de venda para calcular o estoque necessário</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-gray-100 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                  <Utensils size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-tight">{product.nome}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase font-black tracking-wider">{product.categoria}</span>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase font-black tracking-wider">{product.rendimento} Porções</span>
                    <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full uppercase font-black tracking-wider flex items-center gap-1">
                       <Target size={10} /> Meta: {product.vendasProjetadas}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Preço</p>
                <p className="text-xl font-black text-gray-900">R$ {product.preco.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-5 flex-1 bg-gray-50/50">
              <h5 className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center gap-1 tracking-widest">
                <List size={12} /> Composição (Receita Base)
              </h5>
              {product.receita.length > 0 ? (
                <ul className="space-y-2">
                  {product.receita.map((r, idx) => {
                    const insumo = insumos.find(i => i.id === r.insumoId);
                    return (
                      <li key={idx} className="text-sm flex justify-between text-gray-700">
                        <span className="text-gray-500">{insumo?.nome || 'Insumo não encontrado'}</span>
                        <span className="font-bold">{r.quantidade} {insumo?.unidade || ''}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">Nenhuma receita vinculada. Clique em editar para configurar.</p>
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <button 
                onClick={() => handleOpenEdit(product)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Edit3 size={16} /> Editar
              </button>
              <button 
                onClick={() => handleDelete(product.id)}
                className="p-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        
        <button 
          onClick={handleOpenCreate}
          className="h-full min-h-[220px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-red-400 hover:text-red-500 group transition-all"
        >
           <Plus size={40} className="mb-2 group-hover:scale-110 transition-transform" />
           <span className="font-bold">Cadastrar Outro Produto</span>
        </button>
      </div>

      {/* Modal Novo/Editar Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Utensils className="text-red-500" size={20} /> 
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Produto</label>
                  <input 
                    required
                    autoFocus
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                    placeholder="Ex: Galinhada Completa"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Preço (R$)</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                      placeholder="0.00"
                      value={formPreco}
                      onChange={(e) => setFormPreco(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Rendimento (Porções)</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        required
                        type="number"
                        className="w-full pl-9 p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                        placeholder="Ex: 100"
                        value={formRendimento}
                        onChange={(e) => setFormRendimento(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Projeção Venda (Festa)</label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        required
                        type="number"
                        className="w-full pl-9 p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-bold text-orange-600" 
                        placeholder="Ex: 500"
                        value={formProjeção}
                        onChange={(e) => setFormProjeção(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                  <select 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                  >
                    <option>Culinária</option>
                    <option>Bebidas</option>
                    <option>Doces</option>
                    <option>Brinquedos</option>
                    <option>Outros</option>
                  </select>
                </div>
              </div>

              {/* Seção de Receita */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h5 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <List size={16} /> Ficha Técnica (Insumos)
                    </h5>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Baseada em {formRendimento || '0'} porções</p>
                  </div>
                  <button 
                    type="button"
                    onClick={addRecipeItem}
                    className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg font-bold hover:bg-red-100 flex items-center gap-1 transition-colors"
                  >
                    <PlusCircle size={14} /> Adicionar Insumo
                  </button>
                </div>

                <div className="space-y-3">
                  {formReceita.length > 0 ? (
                    formReceita.map((item, index) => (
                      <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex-1">
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Insumo</label>
                          <select 
                            className="w-full p-2 border rounded text-sm bg-white"
                            value={item.insumoId}
                            onChange={(e) => updateRecipeItem(index, 'insumoId', e.target.value)}
                          >
                            {insumos.map(ins => (
                              <option key={ins.id} value={ins.id}>{ins.nome} ({ins.unidade})</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Qtd</label>
                          <input 
                            type="number"
                            step="0.001"
                            className="w-full p-2 border rounded text-sm"
                            value={item.quantidade}
                            onChange={(e) => updateRecipeItem(index, 'quantidade', e.target.value)}
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeRecipeItem(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <MinusCircle size={20} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-sm">
                      {insumos.length === 0 ? 'Cadastre insumos no estoque para criar receitas.' : 'Clique em "Adicionar Insumo" para compor a receita.'}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 flex gap-3 sticky bottom-0 bg-white pb-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                >
                  <Save size={18} /> {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
