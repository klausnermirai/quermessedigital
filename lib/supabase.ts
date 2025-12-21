
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttkslmgvorvlczowrbdh.supabase.co';
const supabaseKey = 'sb_publishable_AgJGXL1OnT2ArQG6WEOBDw_Nz7rJie1';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * 🚀 GUIA DE CONFIGURAÇÃO DO SUPABASE (SQL EDITOR)
 * 
 * Copie e cole os comandos abaixo no SQL Editor do seu Supabase para que o app funcione:
 * 
 * -- 1. CRIAR TABELAS (Caso ainda não tenha criado)
 * CREATE TABLE IF NOT EXISTS public.users (id uuid primary key default auth.uid(), email text, name text, role text);
 * CREATE TABLE IF NOT EXISTS public.events (id text primary key, name text, "dateRanges" jsonb, status text);
 * CREATE TABLE IF NOT EXISTS public.orders (id text primary key, items jsonb, total decimal, payments jsonb, timestamp timestamptz, "cashierName" text);
 * CREATE TABLE IF NOT EXISTS public.products (id text primary key, nome text, preco decimal, categoria text, receita jsonb, rendimento int, "vendasProjetadas" int);
 * CREATE TABLE IF NOT EXISTS public.lotes (id text primary key, item text, doador text, "lanceInicial" decimal, status text, tipo text, "valorArremate" decimal, "arrematador" text, "fotoUrl" text, "dataArremate" timestamptz);
 * CREATE TABLE IF NOT EXISTS public.doacoes (id text primary key, "doadorId" text, tipo text, "insumoId" text, quantidade decimal, valor decimal, descricao text, data timestamptz);
 * 
 * -- 2. HABILITAR REALTIME
 * ALTER PUBLICATION supabase_realtime ADD TABLE orders, doacoes, lotes, events, products;
 * 
 * -- 3. CONFIGURAR STORAGE (BUCKET PÚBLICO)
 * -- Vá em Storage > New Bucket > Name: 'prendas' > Public: YES
 */
