import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { supabaseService } from '../services/supabaseService';
import { formatCurrency, cn } from '../lib/utils';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
          trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </motion.div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [proximosAgendamentos, setProximosAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardStats, agendamentos] = await Promise.all([
          supabaseService.getDashboardStats(),
          supabaseService.getAgendamentosCompletos(new Date().toISOString().split('T')[0])
        ]);
        setStats(dashboardStats);
        setProximosAgendamentos(agendamentos.slice(0, 4));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = [
    { name: 'Seg', valor: 400 },
    { name: 'Ter', valor: 300 },
    { name: 'Qua', valor: 600 },
    { name: 'Qui', valor: 800 },
    { name: 'Sex', valor: 500 },
    { name: 'Sáb', valor: 900 },
    { name: 'Dom', valor: 200 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Visão Geral</h2>
        <p className="text-slate-500">Acompanhe o desempenho do seu negócio em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Agendamentos Hoje" 
          value={stats?.agendamentos_hoje || 0} 
          icon={Calendar} 
          color="bg-blue-600"
          trend="up"
          trendValue="12%"
        />
        <StatCard 
          title="Receita Hoje" 
          value={formatCurrency(stats?.receita_hoje || 0)} 
          icon={DollarSign} 
          color="bg-emerald-600"
          trend="up"
          trendValue="8%"
        />
        <StatCard 
          title="Leads Novos" 
          value={stats?.leads_novos_total || 0} 
          icon={Users} 
          color="bg-violet-600"
          trend="up"
          trendValue="5%"
        />
        <StatCard 
          title="Taxa Cancelamento" 
          value={`${stats?.taxa_cancelamento_mes_pct || 0}%`} 
          icon={TrendingUp} 
          color="bg-amber-600"
          trend="down"
          trendValue="2%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Fluxo de Receita Semanal</h3>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none">
              <option>Esta Semana</option>
              <option>Semana Passada</option>
            </select>
          </div>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Próximos Atendimentos</h3>
          <div className="space-y-6">
            {proximosAgendamentos.length > 0 ? proximosAgendamentos.map((ag, idx) => (
              <div key={ag.agendamento_id || `ag-dash-${idx}`} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex flex-col items-center justify-center text-blue-600">
                  <span className="text-xs font-bold uppercase">{ag.hora_inicio?.split(':')[0]}h</span>
                  <span className="text-[10px] font-medium">{ag.hora_inicio?.split(':')[1]}m</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{ag.cliente_nome}</p>
                  <p className="text-xs text-slate-500 truncate">{ag.servico_nome}</p>
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  ag.status === 'confirmado' ? "bg-emerald-500" : "bg-amber-500"
                )} />
              </div>
            )) : (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum agendamento para hoje.</p>
            )}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition-colors">
            Ver Agenda Completa
          </button>
        </div>
      </div>
    </div>
  );
}
