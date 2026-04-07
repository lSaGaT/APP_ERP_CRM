import { Cliente, Funcionario, Servico, Agendamento, Profile, JornadaTrabalho } from "../types/database";

export const mockProfiles: Profile[] = [
  { id: '1', email: 'admin@salao.com', full_name: 'Administrador Master', role: 'admin', updated_at: new Date().toISOString() },
  { id: '2', email: 'atendente@salao.com', full_name: 'Atendente Agenda', role: 'atendente', updated_at: new Date().toISOString() },
];

export const mockFuncionarios: Funcionario[] = [
  { id: 'f1', nome: 'Ana Silva', especialidade: 'Cabelo', cor_agenda: '#3b82f6', aceita_encaixe: true, ativo: true, created_at: new Date().toISOString() },
  { id: 'f2', nome: 'Bia Costa', especialidade: 'Manicure', cor_agenda: '#ec4899', aceita_encaixe: true, ativo: true, created_at: new Date().toISOString() },
  { id: 'f3', nome: 'Carla Souza', especialidade: 'Estética', cor_agenda: '#10b981', aceita_encaixe: false, ativo: true, created_at: new Date().toISOString() },
];

export const mockServicos: Servico[] = [
  { id: 's1', nome: 'Corte Feminino', preco: 120.00, duracao_total_minutos: 60, created_at: new Date().toISOString() },
  { id: 's2', nome: 'Manicure', preco: 45.00, duracao_total_minutos: 45, created_at: new Date().toISOString() },
  { id: 's3', nome: 'Limpeza de Pele', preco: 150.00, duracao_total_minutos: 90, created_at: new Date().toISOString() },
];

export const mockClientes: Cliente[] = [
  { 
    Cliente_id: 'c1', Nome: 'João Pereira', "CPF/CNPJ": '123.456.789-00', Telefone: '(11) 98888-7777', Email: 'joao@email.com', 
    "Endereco/Rua": 'Rua A', Numero: '10', Complemento: null, Cidade: 'São Paulo', Estado: 'SP', CEP: '01001-000', 
    created_at: new Date().toISOString(), status: 'status_novo', followUp: 'followUp_0', ultima_msg: null 
  },
  { 
    Cliente_id: 'c2', Nome: 'Maria Oliveira', "CPF/CNPJ": '987.654.321-11', Telefone: '(11) 97777-6666', Email: 'maria@email.com', 
    "Endereco/Rua": 'Rua B', Numero: '20', Complemento: 'Apto 1', Cidade: 'São Paulo', Estado: 'SP', CEP: '01002-000', 
    created_at: new Date().toISOString(), status: 'status_em_atendimento', followUp: 'followUp_1', ultima_msg: null 
  },
];

export const mockAgendamentos: Agendamento[] = [
  { 
    id: 'a1', cliente_id: 'c1', cliente_nome: 'João Pereira', cliente_telefone: '(11) 98888-7777', 
    data: new Date().toISOString().split('T')[0], horario: '09:00', servico: 'Corte Feminino', 
    status: 'confirmado', funcionario_id: 'f1', servico_id: 's1', hora_fim: '10:00', 
    Valor_total: 120.00, status_pagamento: 'pago', forma_pagamento: 'pix', created_at: new Date().toISOString() 
  },
  { 
    id: 'a2', cliente_id: 'c2', cliente_nome: 'Maria Oliveira', cliente_telefone: '(11) 97777-6666', 
    data: new Date().toISOString().split('T')[0], horario: '10:30', servico: 'Manicure', 
    status: 'pendente', funcionario_id: 'f2', servico_id: 's2', hora_fim: '11:15', 
    Valor_total: 45.00, status_pagamento: 'pendente', forma_pagamento: null, created_at: new Date().toISOString() 
  },
];

export const mockJornadas: JornadaTrabalho[] = mockFuncionarios.flatMap(f => 
  [1, 2, 3, 4, 5, 6].map(dia => ({
    id: `j-${f.id}-${dia}`,
    funcionario_id: f.id,
    dia_semana: dia,
    hora_inicio: '08:00',
    hora_fim: '18:00'
  }))
);
