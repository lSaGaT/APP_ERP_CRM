import { supabase } from '../lib/supabase';
import { Agendamento, Cliente, Funcionario, Servico, Profile } from '../types/database';

export const supabaseService = {
  // Agendamentos
  async getAgendamentos(date?: string) {
    let query = supabase.from('agendamentos').select('*');
    if (date) {
      query = query.eq('data', date);
    }
    const { data, error } = await query.order('horario', { ascending: true });
    if (error) throw error;
    return data as Agendamento[];
  },

  async getAgendamentosCompletos(date?: string) {
    let query = supabase.from('vw_agenda_completa').select('*');
    if (date) {
      query = query.eq('data', date);
    }
    const { data, error } = await query.order('hora_inicio', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Clientes
  async getClientes() {
    const { data, error } = await supabase.from('Clientes').select('*');
    if (error) throw error;
    return data as Cliente[];
  },

  async updateClienteStatus(clienteId: string, status: string) {
    const { error } = await supabase
      .from('Clientes')
      .update({ status })
      .eq('Cliente_id', clienteId);
    if (error) throw error;
  },

  // Funcionários
  async getFuncionarios() {
    const { data, error } = await supabase.from('funcionarios').select('*').eq('ativo', true);
    if (error) throw error;
    return data as Funcionario[];
  },

  // Serviços
  async getServicos() {
    const { data, error } = await supabase.from('servicos').select('*');
    if (error) throw error;
    return data as Servico[];
  },

  // Dashboard
  async getDashboardStats() {
    const { data, error } = await supabase.from('vw_resumo_dashboard').select('*').single();
    if (error) throw error;
    return data;
  },

  // Financeiro
  async getFinanceiroAgendamentos() {
    const { data, error } = await supabase.from('vw_financeiro_agendamentos').select('*');
    if (error) throw error;
    return data;
  },

  // Profiles
  async getProfiles() {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data as Profile[];
  },

  async createProfile(email: string, password: string, fullName: string, role: 'admin' | 'atendente') {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;

    // 2. Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user?.id,
        email,
        full_name: fullName,
        role,
      });
    if (profileError) throw profileError;

    return authData;
  },

  async createServico(nome: string, preco: number, duracao: number) {
    const { data, error } = await supabase
      .from('servicos')
      .insert({
        nome,
        preco,
        duracao_total_minutos: duracao,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Servico;
  },

  async createFuncionario(nome: string, especialidade: string, cor: string, aceitaEncaixe: boolean) {
    const { data, error } = await supabase
      .from('funcionarios')
      .insert({
        nome,
        especialidade,
        cor_agenda: cor,
        aceita_encaixe: aceitaEncaixe,
        ativo: true,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Funcionario;
  },

  async updateServico(id: string, nome: string, preco: number, duracao: number) {
    const { error } = await supabase
      .from('servicos')
      .update({ nome, preco, duracao_total_minutos: duracao })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteServico(id: string) {
    const { error } = await supabase.from('servicos').delete().eq('id', id);
    if (error) throw error;
  },

  async updateFuncionario(id: string, nome: string, especialidade: string, cor: string, ativo: boolean) {
    const { error } = await supabase
      .from('funcionarios')
      .update({ nome, especialidade, cor_agenda: cor, ativo })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteFuncionario(id: string) {
    const { error } = await supabase.from('funcionarios').delete().eq('id', id);
    if (error) throw error;
  }
};
