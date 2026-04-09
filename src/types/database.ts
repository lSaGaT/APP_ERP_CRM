export type UserRole = 'admin' | 'atendente';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  updated_at: string;
}

export interface Cliente {
  Cliente_id: string;
  Nome: string;
  "CPF/CNPJ": string | null;
  Telefone: string | null;
  Email: string | null;
  "Endereco/Rua": string | null;
  Numero: string | null;
  Complemento: string | null;
  Cidade: string | null;
  Estado: string | null;
  CEP: string | null;
  created_at: string;
  status: 'status_novo' | 'status_atendimento' | 'status_marcado' | 'status_duvida';
  followUp: 'followUp_0' | 'followUp_1' | 'followUp_2';
  ultima_msg: string | null;
  trava: boolean;
}

export interface Funcionario {
  id: string;
  nome: string;
  especialidade: string | null;
  cor_agenda: string;
  aceita_encaixe: boolean;
  ativo: boolean;
  created_at: string;
}

export interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao_total_minutos: number;
  tempo_aplicacao_minutos: number | null;
  tempo_espera_minutos: number | null;
  tempo_finalizacao_minutos: number | null;
  created_at: string;
}

export interface Agendamento {
  id: string;
  cliente_id: string | null;
  cliente_nome: string;
  cliente_telefone: string | null;
  data: string;
  horario: string;
  servico: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  funcionario_id: string | null;
  servico_id: string | null;
  hora_fim: string | null;
  Valor_total: number;
  status_pagamento: 'pendente' | 'pago';
  forma_pagamento: 'dinheiro' | 'cartao' | 'pix' | null;
  created_at: string;
}

export interface JornadaTrabalho {
  id: string;
  funcionario_id: string;
  dia_semana: number; // 0-6
  hora_inicio: string;
  hora_fim: string;
}

export interface BloqueioAgenda {
  id: string;
  funcionario_id: string | null;
  data_inicio: string;
  data_fim: string;
  hora_inicio: string | null;
  hora_fim: string | null;
  motivo: string | null;
  recorrente: boolean;
  recorrencia_tipo: 'semanal' | 'mensal' | 'anual' | null;
}
