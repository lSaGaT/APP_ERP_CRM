import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Scissors,
  CreditCard,
  Calendar,
  X,
  Phone,
  UserPlus,
  Check,
  ChevronDown
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { Cliente, Servico, Funcionario } from '../types/database';
import { cn, formatCurrency } from '../lib/utils';

// Modal Component
const Modal = ({ isOpen, onClose, title, children }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
          <h3 className="text-2xl font-bold text-slate-900 mb-6">{title}</h3>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [agendamentosDoMes, setAgendamentosDoMes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal de Agendamento
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);
  const [agendamentoStep, setAgendamentoStep] = useState<'busca-cliente' | 'novo-cliente' | 'detalhes'>('busca-cliente');

  // Estados de dados
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

  // Estados do formulário
  const [telefoneBusca, setTelefoneBusca] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);

  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    telefone: '',
    email: '',
    cpf: ''
  });

  const [agendamentoForm, setAgendamentoForm] = useState({
    cliente_id: '',
    cliente_nome: '',
    cliente_telefone: '',
    servico_id: '',
    servico_nome: '',
    funcionario_id: '',
    data: selectedDate,
    horario: '',
    valor: 0
  });

  // Carregar dados necessários
  useEffect(() => {
    loadDadosAgendamento();
  }, []);

  const loadDadosAgendamento = async () => {
    const [sData, fData] = await Promise.all([
      supabaseService.getServicos(),
      supabaseService.getFuncionarios()
    ]);
    setServicos(sData);
    setFuncionarios(fData);
  };

  useEffect(() => {
    const fetchAgendamentos = async () => {
      setLoading(true);
      try {
        const data = await supabaseService.getAgendamentosCompletos(selectedDate);
        setAgendamentos(data);
      } catch (error) {
        console.error('Error fetching agendamentos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgendamentos();
  }, [selectedDate]);

  // Carregar agendamentos do mês para mostrar indicadores no calendário
  useEffect(() => {
    const fetchAgendamentosMes = async () => {
      try {
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const primeiroDia = `${year}-${month}-01`;
        const ultimoDia = new Date(year, currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];
        const data = await supabaseService.getAgendamentosPorPeriodo(primeiroDia, ultimoDia);
        setAgendamentosDoMes(data);
      } catch (error) {
        console.error('Error fetching agendamentos do mes:', error);
      }
    };
    fetchAgendamentosMes();
  }, [currentMonth]);

  // Buscar cliente por telefone
  const buscarCliente = async () => {
    if (!telefoneBusca) {
      alert('Digite um telefone para buscar');
      return;
    }

    setBuscandoCliente(true);
    try {
      const cliente = await supabaseService.buscarClientePorTelefone(telefoneBusca);
      if (cliente) {
        setClienteEncontrado(cliente);
        setAgendamentoForm(prev => ({
          ...prev,
          cliente_id: cliente.Cliente_id,
          cliente_nome: cliente.Nome,
          cliente_telefone: cliente.Telefone || ''
        }));
        setAgendamentoStep('detalhes');
      } else {
        // Cliente não encontrado, vai para cadastro
        setAgendamentoStep('novo-cliente');
        setNovoCliente(prev => ({ ...prev, telefone: telefoneBusca }));
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
    } finally {
      setBuscandoCliente(false);
    }
  };

  // Criar novo cliente
  const criarNovoCliente = async () => {
    if (!novoCliente.nome || !novoCliente.telefone) {
      alert('Preencha nome e telefone');
      return;
    }

    try {
      const novo = await supabaseService.createCliente({
        Nome: novoCliente.nome,
        Telefone: novoCliente.telefone,
        Email: novoCliente.email || undefined,
        'CPF/CNPJ': novoCliente.cpf || undefined,
      });

      setClienteEncontrado(novo);
      setAgendamentoForm(prev => ({
        ...prev,
        cliente_id: novo.Cliente_id,
        cliente_nome: novo.Nome,
        cliente_telefone: novo.Telefone || ''
      }));
      setAgendamentoStep('detalhes');
    } catch (error: any) {
      alert('Erro ao criar cliente: ' + error.message);
    }
  };

  // Confirmar agendamento
  const confirmarAgendamento = async () => {
    if (!agendamentoForm.servico_id || !agendamentoForm.horario) {
      alert('Selecione o serviço e o horário');
      return;
    }

    try {
      const servico = servicos.find(s => s.id === agendamentoForm.servico_id);
      if (!servico) return;

      await supabaseService.createAgendamento({
        cliente_id: agendamentoForm.cliente_id,
        cliente_nome: agendamentoForm.cliente_nome,
        cliente_telefone: agendamentoForm.cliente_telefone,
        data: agendamentoForm.data,
        horario: agendamentoForm.horario,
        hora_fim: calcularHoraFim(agendamentoForm.horario, servico.duracao_total_minutos),
        funcionario_id: agendamentoForm.funcionario_id || undefined,
        servico_id: agendamentoForm.servico_id,
        servico: agendamentoForm.servico_nome,
        Valor_total: servico.preco,
      });

      // Recarregar agendamentos e fechar modal
      const data = await supabaseService.getAgendamentosCompletos(selectedDate);
      setAgendamentos(data);
      fecharModal();
      alert('Agendamento criado com sucesso!');
    } catch (error: any) {
      alert('Erro ao criar agendamento: ' + error.message);
    }
  };

  const calcularHoraFim = (horaInicio: string, duracaoMinutos: number): string => {
    const [hora, min] = horaInicio.split(':').map(Number);
    const dataInicio = new Date();
    dataInicio.setHours(hora, min, 0, 0);
    dataInicio.setMinutes(dataInicio.getMinutes() + duracaoMinutos);
    return `${String(dataInicio.getHours()).padStart(2, '0')}:${String(dataInicio.getMinutes()).padStart(2, '0')}`;
  };

  const fecharModal = () => {
    setShowAgendamentoModal(false);
    setAgendamentoStep('busca-cliente');
    setTelefoneBusca('');
    setClienteEncontrado(null);
    setNovoCliente({ nome: '', telefone: '', email: '', cpf: '' });
    setAgendamentoForm({
      cliente_id: '',
      cliente_nome: '',
      cliente_telefone: '',
      servico_id: '',
      servico_nome: '',
      funcionario_id: '',
      data: selectedDate,
      horario: '',
      valor: 0
    });
  };

  const abrirModalAgendamento = () => {
    setAgendamentoForm(prev => ({ ...prev, data: selectedDate }));
    setShowAgendamentoModal(true);
    setAgendamentoStep('busca-cliente');
  };

  const filteredAgendamentos = useMemo(() => {
    return agendamentos.filter(ag =>
      (ag.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       ag.servico_nome?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [agendamentos, searchTerm]);

  const statusColors: any = {
    pendente: "bg-amber-50 text-amber-600 border-amber-100",
    confirmado: "bg-emerald-50 text-emerald-600 border-emerald-100",
    cancelado: "bg-rose-50 text-rose-600 border-rose-100",
  };

  const paymentColors: any = {
    pago: "bg-blue-50 text-blue-600 border-blue-100",
    pendente: "bg-slate-50 text-slate-500 border-slate-100",
  };

  // Horários disponíveis (de 30 em 30 minutos)
  const horariosDisponiveis = useMemo(() => {
    const horarios: string[] = [];
    for (let h = 8; h < 20; h++) {
      horarios.push(`${String(h).padStart(2, '0')}:00`);
      horarios.push(`${String(h).padStart(2, '0')}:30`);
    }
    return horarios;
  }, []);

  // Funções auxiliares para o calendário
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = domingo

    const days: any[] = [];

    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: '', isEmpty: true });
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasAgendamento = agendamentosDoMes.some((ag: any) => ag.data === dateStr);
      const isSelected = selectedDate === dateStr;
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push({
        day,
        date: dateStr,
        isEmpty: false,
        hasAgendamento,
        isSelected,
        isToday
      });
    }

    return days;
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const calendarDays = getDaysInMonth(currentMonth);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Agenda</h2>
          <p className="text-slate-500">Gerencie os horários e atendimentos.</p>
        </div>
        <button
          onClick={abrirModalAgendamento}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 font-bold"
        >
          <Plus size={20} />
          Novo Agendamento
        </button>
      </div>

      {/* Grid Principal: Calendário + Agendamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Calendário */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-6">
            {/* Navegação do Mês */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ChevronLeft size={24} className="text-slate-600" />
              </button>
              <h3 className="text-xl font-bold text-slate-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ChevronRight size={24} className="text-slate-600" />
              </button>
            </div>

            {/* Dias da Semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Grade do Calendário */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayInfo, idx) => (
                <button
                  key={idx}
                  onClick={() => !dayInfo.isEmpty && handleDateClick(dayInfo.date)}
                  disabled={dayInfo.isEmpty}
                  className={cn(
                    "relative aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all",
                    dayInfo.isEmpty && "invisible",
                    !dayInfo.isEmpty && [
                      "hover:bg-blue-50 hover:scale-105 active:scale-95",
                      dayInfo.isSelected && "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200",
                      dayInfo.isToday && !dayInfo.isSelected && "bg-blue-100 text-blue-700 font-bold",
                      !dayInfo.isSelected && !dayInfo.isToday && "text-slate-700"
                    ]
                  )}
                >
                  <span>{dayInfo.day}</span>

                  {/* Indicador de agendamentos */}
                  {dayInfo.hasAgendamento && !dayInfo.isEmpty && (
                    <div className={cn(
                      "absolute bottom-1.5 w-1.5 h-1.5 rounded-full",
                      dayInfo.isSelected ? "bg-white" : "bg-blue-500"
                    )} />
                  )}
                </button>
              ))}
            </div>

            {/* Data Selecionada */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Data selecionada:</span>
                <span className="font-bold text-slate-900">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Agendamentos do Dia */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            {/* Header dos Agendamentos */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long'
                  })}
                </h3>
                <p className="text-sm text-slate-500">
                  {filteredAgendamentos.length} {filteredAgendamentos.length === 1 ? 'agendamento' : 'agendamentos'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm w-full sm:w-48"
                  />
                </div>
                <button className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 text-sm font-medium">
                  <Filter size={16} />
                  <span>Filtros</span>
                </button>
              </div>
            </div>

            {/* Lista de Agendamentos */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"
                  />
                </div>
              ) : (
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-slate-400 text-xs uppercase tracking-widest font-bold">
                      <th className="px-4 pb-2">Horário</th>
                      <th className="px-4 pb-2">Cliente</th>
                      <th className="px-4 pb-2">Serviço</th>
                      <th className="px-4 pb-2">Profissional</th>
                      <th className="px-4 pb-2">Status</th>
                      <th className="px-4 pb-2">Pagamento</th>
                      <th className="px-4 pb-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgendamentos.length > 0 ? (
                      filteredAgendamentos.map((ag, idx) => (
                        <motion.tr
                          key={ag.agendamento_id || `ag-agenda-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group bg-white hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-4 rounded-l-2xl border-y border-l border-slate-100">
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                              <Clock size={16} className="text-blue-500" />
                              {ag.hora_inicio?.slice(0, 5)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">Fim: {ag.hora_fim?.slice(0, 5)}</div>
                          </td>
                          <td className="px-4 py-4 border-y border-slate-100">
                            <div className="font-bold text-slate-900">{ag.cliente_nome}</div>
                            <div className="text-xs text-slate-500">{ag.cliente_telefone}</div>
                          </td>
                          <td className="px-4 py-4 border-y border-slate-100">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <Scissors size={14} className="text-slate-400" />
                              {ag.servico_nome}
                            </div>
                          </td>
                          <td className="px-4 py-4 border-y border-slate-100">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: ag.funcionario_cor }}
                              />
                              <span className="text-sm font-medium text-slate-700">
                                {ag.funcionario_nome}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 border-y border-slate-100">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                              statusColors[ag.status]
                            )}>
                              {ag.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 border-y border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                paymentColors[ag.status_pagamento]
                              )}>
                                {ag.status_pagamento}
                              </span>
                              {ag.forma_pagamento && (
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{ag.forma_pagamento}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 rounded-r-2xl border-y border-r border-slate-100 text-right">
                            <div className="font-bold text-slate-900">{formatCurrency(ag.valor_total)}</div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <Calendar size={48} strokeWidth={1} />
                            <p className="font-medium">Nenhum agendamento para esta data.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MODAL DE AGENDAMENTO ==================== */}

      <Modal isOpen={showAgendamentoModal} onClose={fecharModal} title="Novo Agendamento">
        {/* ETAPA 1: Buscar Cliente */}
        {agendamentoStep === 'busca-cliente' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                <Phone size={32} />
              </div>
              <p className="text-slate-600">Buscar cliente por telefone</p>
              <p className="text-sm text-slate-400 mt-1">Digite o número com DDD</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Telefone do Cliente</label>
              <input
                type="tel"
                value={telefoneBusca}
                onChange={(e) => setTelefoneBusca(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              onClick={buscarCliente}
              disabled={buscandoCliente}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {buscandoCliente ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Buscando...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Buscar Cliente
                </>
              )}
            </button>

            <div className="text-center">
              <button
                onClick={() => setAgendamentoStep('novo-cliente')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center gap-2 mx-auto"
              >
                <UserPlus size={16} />
                Cadastrar novo cliente
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 2: Novo Cliente */}
        {agendamentoStep === 'novo-cliente' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <UserPlus size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Cadastrar Novo Cliente</p>
                <p className="text-xs text-slate-500">Preencha os dados do cliente</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nome Completo *</label>
              <input
                type="text"
                value={novoCliente.nome}
                onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                placeholder="Nome do cliente"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Telefone *</label>
              <input
                type="tel"
                value={novoCliente.telefone}
                onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
              <input
                type="email"
                value={novoCliente.email}
                onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                placeholder="cliente@email.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">CPF/CNPJ</label>
              <input
                type="text"
                value={novoCliente.cpf}
                onChange={(e) => setNovoCliente({ ...novoCliente, cpf: e.target.value })}
                placeholder="000.000.000-00"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setAgendamentoStep('busca-cliente')}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={criarNovoCliente}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Salvar Cliente
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 3: Detalhes do Agendamento */}
        {agendamentoStep === 'detalhes' && (
          <div className="space-y-4">
            {/* Cliente Selecionado */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {agendamentoForm.cliente_nome.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{agendamentoForm.cliente_nome}</p>
                  <p className="text-xs text-slate-500">{agendamentoForm.cliente_telefone}</p>
                </div>
                <button
                  onClick={() => setAgendamentoStep('busca-cliente')}
                  className="text-blue-600 text-xs font-medium hover:underline"
                >
                  Alterar
                </button>
              </div>
            </div>

            {/* Seleção de Serviço */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Serviço *</label>
              <select
                value={agendamentoForm.servico_id}
                onChange={(e) => {
                  const servico = servicos.find(s => s.id === e.target.value);
                  setAgendamentoForm({
                    ...agendamentoForm,
                    servico_id: e.target.value,
                    servico_nome: servico?.nome || '',
                    valor: servico?.preco || 0
                  });
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Selecione um serviço</option>
                {servicos.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nome} - {formatCurrency(s.preco)} ({s.duracao_total_minutos} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Seleção de Funcionário */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Profissional (opcional)</label>
              <select
                value={agendamentoForm.funcionario_id}
                onChange={(e) => setAgendamentoForm({ ...agendamentoForm, funcionario_id: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Qualquer profissional</option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Data *</label>
              <input
                type="date"
                value={agendamentoForm.data}
                onChange={(e) => setAgendamentoForm({ ...agendamentoForm, data: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Horário */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Horário *</label>
              <select
                value={agendamentoForm.horario}
                onChange={(e) => setAgendamentoForm({ ...agendamentoForm, horario: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Selecione um horário</option>
                {horariosDisponiveis.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Resumo */}
            {agendamentoForm.servico_id && agendamentoForm.horario && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-2">Resumo do Agendamento</p>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-600"><span className="font-medium">Serviço:</span> {agendamentoForm.servico_nome}</p>
                  <p className="text-slate-600"><span className="font-medium">Valor:</span> {formatCurrency(agendamentoForm.valor)}</p>
                  <p className="text-slate-600"><span className="font-medium">Data:</span> {new Date(agendamentoForm.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                  <p className="text-slate-600"><span className="font-medium">Horário:</span> {agendamentoForm.horario}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={fecharModal}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAgendamento}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Confirmar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
