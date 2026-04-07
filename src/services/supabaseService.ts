import { supabase } from '../lib/supabase';
import { fetchWithTimeout } from '../lib/supabaseHelper';
import { Agendamento, Cliente, Funcionario, Servico, Profile, BloqueioAgenda } from '../types/database';

// Timeout padrão para queries (10 segundos)
const QUERY_TIMEOUT = 10000;

// Wrapper para queries com timeout
async function safeQuery<T>(queryFn: () => Promise<{ data: T | null; error: any }>, defaultValue: T): Promise<T> {
  const promise = queryFn();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Query timeout após ${QUERY_TIMEOUT}ms`));
    }, QUERY_TIMEOUT);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);

    if (result.error) {
      console.error('Erro na query:', result.error.message);
      return defaultValue;
    }

    return result.data ?? defaultValue;
  } catch (error: any) {
    console.error('Erro/Timeout na query:', error.message);
    return defaultValue;
  }
}

export const supabaseService = {
  // ==================== QUERIES COM TIMEOUT (não travam o app) ====================

  // Agendamentos
  async getAgendamentos(date?: string): Promise<Agendamento[]> {
    return safeQuery(
      () => {
        let query = supabase.from('agendamentos').select('*');
        if (date) query = query.eq('data', date);
        return query.order('horario', { ascending: true });
      },
      []
    );
  },

  async getAgendamentosCompletos(date?: string): Promise<any[]> {
    return safeQuery(
      () => {
        let query = supabase.from('vw_agenda_completa').select('*');
        if (date) query = query.eq('data', date);
        return query.order('hora_inicio', { ascending: true });
      },
      []
    );
  },

  // Clientes
  async getClientes(): Promise<Cliente[]> {
    return safeQuery(
      () => supabase.from('Clientes').select('*'),
      []
    );
  },

  // Funcionários
  async getFuncionarios(): Promise<Funcionario[]> {
    return safeQuery(
      () => supabase.from('funcionarios').select('*').eq('ativo', true),
      []
    );
  },

  // Serviços
  async getServicos(): Promise<Servico[]> {
    return safeQuery(
      () => supabase.from('servicos').select('*'),
      []
    );
  },

  // Dashboard - VIEW com potencial de travar
  async getDashboardStats(): Promise<any> {
    return safeQuery(
      () => supabase.from('vw_resumo_dashboard').select('*').single(),
      {}
    );
  },

  // Financeiro - VIEW com potencial de travar
  async getFinanceiroAgendamentos(): Promise<any[]> {
    return safeQuery(
      () => supabase.from('vw_financeiro_agendamentos').select('*'),
      []
    );
  },

  // Profiles
  async getProfiles(): Promise<Profile[]> {
    return safeQuery(
      () => supabase.from('profiles').select('*'),
      []
    );
  },

  // Bloqueios de Agenda
  async getBloqueios(): Promise<any[]> {
    return safeQuery(
      () => supabase
        .from('bloqueios_agenda')
        .select('*, funcionarios (nome, cor_agenda)')
        .order('data_inicio', { ascending: true }),
      []
    );
  },

  // ==================== MUTAÇÕES (precisam dar erro em caso de falha) ====================

  async updateClienteStatus(clienteId: string, status: string) {
    const { error } = await supabase
      .from('Clientes')
      .update({ status })
      .eq('Cliente_id', clienteId);
    if (error) throw error;
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

  async createServico(
    nome: string,
    preco: number,
    duracao: number,
    tempoAplicacao: number | null,
    tempoEspera: number | null,
    tempoFinalizacao: number | null
  ) {
    const { data, error } = await supabase
      .from('servicos')
      .insert({
        nome,
        preco,
        duracao_total_minutos: duracao,
        tempo_aplicacao_minutos: tempoAplicacao,
        tempo_espera_minutos: tempoEspera,
        tempo_finalizacao_minutos: tempoFinalizacao,
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

  async updateServico(
    id: string,
    nome: string,
    preco: number,
    duracao: number,
    tempoAplicacao: number | null,
    tempoEspera: number | null,
    tempoFinalizacao: number | null
  ) {
    const { error } = await supabase
      .from('servicos')
      .update({
        nome,
        preco,
        duracao_total_minutos: duracao,
        tempo_aplicacao_minutos: tempoAplicacao,
        tempo_espera_minutos: tempoEspera,
        tempo_finalizacao_minutos: tempoFinalizacao,
      })
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
  },

  async createBloqueio(
    funcionarioId: string | null,
    dataInicio: string,
    dataFim: string,
    horaInicio: string | null,
    horaFim: string | null,
    motivo: string | null,
    recorrente: boolean,
    recorrenciaTipo: string | null
  ) {
    const { data, error } = await supabase
      .from('bloqueios_agenda')
      .insert({
        funcionario_id: funcionarioId,
        data_inicio: dataInicio,
        data_fim: dataFim,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        motivo,
        recorrente,
        recorrencia_tipo: recorrenciaTipo,
      })
      .select()
      .single();
    if (error) throw error;
    return data as BloqueioAgenda;
  },

  async deleteBloqueio(id: string) {
    const { error } = await supabase.from('bloqueios_agenda').delete().eq('id', id);
    if (error) throw error;
  }
};
