import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
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
  Calendar
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { cn, formatCurrency } from '../lib/utils';

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Agenda Diária</h2>
          <p className="text-slate-500">Gerencie os horários e atendimentos do dia.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 font-bold">
          <Plus size={20} />
          Novo Agendamento
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-700 px-2"
            />
            <button 
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cliente ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full sm:w-64"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-medium">
              <Filter size={18} />
              Filtros
            </button>
          </div>
        </div>

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
  );
}
