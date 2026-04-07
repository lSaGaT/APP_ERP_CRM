import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Download, 
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { supabaseService } from '../services/supabaseService';
import { formatCurrency, cn } from '../lib/utils';

export default function Financeiro() {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceiro = async () => {
      try {
        const data = await supabaseService.getFinanceiroAgendamentos();
        setAgendamentos(data);
      } catch (error) {
        console.error('Error fetching financeiro:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFinanceiro();
  }, []);

  const stats = useMemo(() => {
    const totalRecebido = agendamentos
      .filter(a => a.status_pagamento === 'pago')
      .reduce((acc, curr) => acc + curr.valor_cobrado, 0);
    
    const totalPendente = agendamentos
      .filter(a => a.status_pagamento === 'pendente' && a.status_agendamento !== 'cancelado')
      .reduce((acc, curr) => acc + curr.valor_cobrado, 0);

    return {
      recebido: formatCurrency(totalRecebido),
      pendente: formatCurrency(totalPendente),
      ticketMedio: formatCurrency(totalRecebido / (agendamentos.filter(a => a.status_pagamento === 'pago').length || 1)),
      crescimento: '+15.4%'
    };
  }, [agendamentos]);

  const data = [
    { name: 'Jan', valor: 4000 },
    { name: 'Fev', valor: 3000 },
    { name: 'Mar', valor: 5000 },
    { name: 'Abr', valor: 4500 },
    { name: 'Mai', valor: 6000 },
    { name: 'Jun', valor: 5500 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Financeiro</h2>
          <p className="text-slate-500">Controle de receitas, pagamentos e fluxo de caixa.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-50 transition-all font-bold shadow-sm">
          <Download size={20} />
          Exportar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Recebido</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.recebido}</p>
          <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold">
            <ArrowUpRight size={14} />
            <span>{stats.crescimento} em relação ao mês passado</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle size={20} />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">A Receber (Pendente)</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.pendente}</p>
          <p className="mt-4 text-slate-400 text-xs font-medium">Baseado em agendamentos confirmados</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign size={20} />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ticket Médio</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.ticketMedio}</p>
          <p className="mt-4 text-slate-400 text-xs font-medium">Média por atendimento realizado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Receita Mensal</h3>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="valor" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#3b82f6' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Últimas Transações</h3>
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"
                />
              </div>
            ) : agendamentos.length > 0 ? (
              agendamentos.filter(a => a.status_pagamento === 'pago').slice(0, 5).map((ag, idx) => (
                <div key={ag.agendamento_id || `trans-${idx}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{ag.cliente_nome}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{ag.forma_pagamento || 'N/A'}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-600">+{formatCurrency(ag.valor_cobrado)}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400">Nenhuma transação encontrada.</div>
            )}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition-colors">
            Ver Extrato Completo
          </button>
        </div>
      </div>
    </div>
  );
}
