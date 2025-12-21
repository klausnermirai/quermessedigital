
export enum UserRole {
  ADMIN = 'ADMINISTRADOR',
  USER = 'USUARIO',
  PDV = 'PDV',
  PDV_MOBILE = 'PDV_MOVEL'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  eventId?: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface Event {
  id: string;
  name: string;
  dateRanges: DateRange[];
  status: 'active' | 'closed';
}

export interface Insumo {
  id: string;
  nome: string;
  unidade: 'kg' | 'un' | 'litro' | 'g' | 'ml';
  estoqueMinimo: number;
  estoqueAtual: number;
  totalDoado: number;
  totalComprado: number;
  projetado: number; 
}

export interface Doador {
  id: string;
  nome: string;
  contato?: string;
  tipo: 'pessoa' | 'empresa';
}

export interface Doacao {
  id: string;
  doadorId: string;
  tipo: 'insumo' | 'financeira' | 'prenda';
  insumoId?: string;
  quantidade?: number;
  valor?: number;
  descricao?: string;
  data: string;
}

export interface Compra {
  id: string;
  tipo: 'insumo' | 'geral';
  insumoId?: string;
  descricaoGeral?: string;
  quantidade: number;
  valorTotal: number;
  data: string;
  fornecedor?: string;
  categoria?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export type PaymentMethod = 'Dinheiro' | 'Cartão' | 'Pix' | 'Vale Troca' | 'Devolução';

export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
  received?: number;
  change?: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  payments: PaymentEntry[];
  timestamp: string;
  cashierName?: string; 
  operatorId?: string;
}

export interface ProductRecipe {
  insumoId: string;
  quantidade: number;
}

export interface Product {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  rendimento: number; 
  vendasProjetadas: number; 
  receita: ProductRecipe[];
}

export interface Lote {
  id: string;
  item: string;
  doador: string;
  lanceInicial: number;
  status: 'ativo' | 'arrematado';
  tipo: 'Lance Único' | 'Acumulativo';
  valorArremate?: number;
  dataArremate?: string;
  arrematador?: string;
  fotoUrl?: string;
}

export interface VendaAntecipadaItem {
  productId: string;
  quantidadePega: number;
  quantidadeVendida: number;
}

export interface Vendedor {
  id: string;
  nome: string;
  contato?: string;
  vendas: VendaAntecipadaItem[];
}

export interface Servico {
  id: string;
  descricao: string;
  prestador?: string;
  status: 'previsto' | 'orcado' | 'confirmado';
  valorOrcado?: number;
  valorFinal?: number;
  categoria: string;
}

export type View = 
  | 'DASHBOARD' 
  | 'CONFIG' 
  | 'OFICIOS' 
  | 'DOACOES' 
  | 'ESTOQUE' 
  | 'COMPRAS' 
  | 'SERVICOS' 
  | 'LEILAO' 
  | 'VENDAS_ANTECIPADAS' 
  | 'PRODUTOS' 
  | 'PDV' 
  | 'TESOURARIA' 
  | 'BALANCETE';
