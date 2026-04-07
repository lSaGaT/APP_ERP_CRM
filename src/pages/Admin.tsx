import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Scissors,
  Clock,
  Shield,
  Plus,
  Trash2,
  Edit3,
  UserPlus,
  X,
  Calendar,
  Mail,
  Lock,
  CheckCircle2,
  XCircle,
  Save
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { Profile, Servico, Funcionario } from '../types/database';
import { cn, formatCurrency } from '../lib/utils';

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all",
      active
        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
        : "text-slate-500 hover:bg-slate-100"
    )}
  >
    <Icon size={18} />
    {label}
  </button>
);

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

const InputField = ({ label, type = "text", value, onChange, placeholder, required = false }: any) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }: any) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#6366f1'
];

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

  // Modals state
  const [showUserModal, setShowUserModal] = useState(false);
  const [showServicoModal, setShowServicoModal] = useState(false);
  const [showFuncionarioModal, setShowFuncionarioModal] = useState(false);
  const [showJornadaModal, setShowJornadaModal] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);

  // Form states
  const [userForm, setUserForm] = useState({ email: '', password: '', fullName: '', role: 'atendente' });
  const [servicoForm, setServicoForm] = useState({ nome: '', preco: '', duracao: '' });
  const [funcionarioForm, setFuncionarioForm] = useState({ nome: '', especialidade: '', cor: '#3b82f6', aceitaEncaixe: true });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pData, sData, fData] = await Promise.all([
        supabaseService.getProfiles(),
        supabaseService.getServicos(),
        supabaseService.getFuncionarios()
      ]);
      setProfiles(pData);
      setServicos(sData);
      setFuncionarios(fData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabaseService.createProfile(
        userForm.email,
        userForm.password,
        userForm.fullName,
        userForm.role as 'admin' | 'atendente'
      );
      setShowUserModal(false);
      setUserForm({ email: '', password: '', fullName: '', role: 'atendente' });
      fetchData();
      alert('Usuário criado com sucesso!');
    } catch (error: any) {
      alert('Erro ao criar usuário: ' + error.message);
    }
  };

  const handleCreateServico = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingServico) {
        await supabaseService.updateServico(
          editingServico.id,
          servicoForm.nome,
          parseFloat(servicoForm.preco),
          parseInt(servicoForm.duracao)
        );
      } else {
        await supabaseService.createServico(
          servicoForm.nome,
          parseFloat(servicoForm.preco),
          parseInt(servicoForm.duracao)
        );
      }
      setShowServicoModal(false);
      setServicoForm({ nome: '', preco: '', duracao: '' });
      setEditingServico(null);
      fetchData();
    } catch (error: any) {
      alert('Erro ao salvar serviço: ' + error.message);
    }
  };

  const handleDeleteServico = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    try {
      await supabaseService.deleteServico(id);
      fetchData();
    } catch (error: any) {
      alert('Erro ao excluir serviço: ' + error.message);
    }
  };

  const handleCreateFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFuncionario) {
        await supabaseService.updateFuncionario(
          editingFuncionario.id,
          funcionarioForm.nome,
          funcionarioForm.especialidade,
          funcionarioForm.cor,
          true
        );
      } else {
        await supabaseService.createFuncionario(
          funcionarioForm.nome,
          funcionarioForm.especialidade,
          funcionarioForm.cor,
          funcionarioForm.aceitaEncaixe
        );
      }
      setShowFuncionarioModal(false);
      setFuncionarioForm({ nome: '', especialidade: '', cor: '#3b82f6', aceitaEncaixe: true });
      setEditingFuncionario(null);
      fetchData();
    } catch (error: any) {
      alert('Erro ao salvar funcionário: ' + error.message);
    }
  };

  const handleDeleteFuncionario = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;
    try {
      await supabaseService.deleteFuncionario(id);
      fetchData();
    } catch (error: any) {
      alert('Erro ao excluir funcionário: ' + error.message);
    }
  };

  const openEditServico = (servico: Servico) => {
    setEditingServico(servico);
    setServicoForm({ nome: servico.nome, preco: servico.preco.toString(), duracao: servico.duracao_total_minutos.toString() });
    setShowServicoModal(true);
  };

  const openEditFuncionario = (func: Funcionario) => {
    setEditingFuncionario(func);
    setFuncionarioForm({ nome: func.nome, especialidade: func.especialidade || '', cor: func.cor_agenda, aceitaEncaixe: func.aceita_encaixe });
    setShowFuncionarioModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Configurações</h2>
        <p className="text-slate-500">Gerencie usuários, serviços e jornadas de trabalho.</p>
      </div>

      <div className="flex flex-wrap gap-3 p-1 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
        <TabButton active={activeTab === 'usuarios'} onClick={() => setActiveTab('usuarios')} icon={Users} label="Usuários" />
        <TabButton active={activeTab === 'servicos'} onClick={() => setActiveTab('servicos')} icon={Scissors} label="Serviços" />
        <TabButton active={activeTab === 'funcionarios'} onClick={() => setActiveTab('funcionarios')} icon={Shield} label="Funcionários" />
        <TabButton active={activeTab === 'jornada'} onClick={() => setActiveTab('jornada')} icon={Clock} label="Jornada" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {activeTab === 'usuarios' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Gerenciar Acessos</h3>
              <button
                onClick={() => setShowUserModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                <UserPlus size={18} />
                Novo Usuário
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles?.map((profile, idx) => (
                <div key={profile.id || `profile-${idx}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {profile.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{profile.full_name || 'Sem Nome'}</p>
                      <p className="text-xs text-slate-500">{profile.email}</p>
                      <span className={cn(
                        "inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                        profile.role === 'admin' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {profile.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'servicos' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Catálogo de Serviços</h3>
              <button
                onClick={() => { setEditingServico(null); setServicoForm({ nome: '', preco: '', duracao: '' }); setShowServicoModal(true); }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Novo Serviço
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                    <th className="pb-4">Nome do Serviço</th>
                    <th className="pb-4">Duração</th>
                    <th className="pb-4">Preço</th>
                    <th className="pb-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {servicos?.map((servico, idx) => (
                    <tr key={servico.id || `servico-${idx}`} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-slate-900">{servico.nome}</td>
                      <td className="py-4 text-sm text-slate-500">{servico.duracao_total_minutos} min</td>
                      <td className="py-4 font-bold text-emerald-600">{formatCurrency(servico.preco)}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditServico(servico)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"><Edit3 size={18} /></button>
                          <button onClick={() => handleDeleteServico(servico.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'funcionarios' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Equipe de Profissionais</h3>
              <button
                onClick={() => { setEditingFuncionario(null); setFuncionarioForm({ nome: '', especialidade: '', cor: '#3b82f6', aceitaEncaixe: true }); setShowFuncionarioModal(true); }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Novo Funcionário
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {funcionarios?.map((func, idx) => (
                <div key={func.id || `func-${idx}`} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500" style={{ backgroundColor: func.cor_agenda }} />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl font-bold mb-4" style={{ color: func.cor_agenda }}>
                      {func.nome?.charAt(0) || '?'}
                    </div>
                    <h4 className="font-bold text-slate-900">{func.nome}</h4>
                    <p className="text-xs text-slate-500 mb-4">{func.especialidade || 'Profissional'}</p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                        func.ativo ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                      )}>
                        {func.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => openEditFuncionario(func)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"><Edit3 size={16} /></button>
                      <button onClick={() => handleDeleteFuncionario(func.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'jornada' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Configuração de Jornada</h3>
                <p className="text-slate-500 mt-1">Defina os horários de trabalho de cada profissional por dia da semana.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {funcionarios?.filter(f => f.ativo).map((func) => (
                <div key={func.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: func.cor_agenda }}>
                      {func.nome?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{func.nome}</h4>
                      <p className="text-xs text-slate-500">{func.especialidade || 'Profissional'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {DIAS_SEMANA.map(dia => (
                      <div key={dia.value} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{dia.label}</span>
                        <span className="text-slate-400">09:00 - 18:00</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                    Editar Jornada
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo Usuário */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title="Novo Usuário">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <InputField
            label="E-mail"
            type="email"
            value={userForm.email}
            onChange={(e: any) => setUserForm({ ...userForm, email: e.target.value })}
            placeholder="usuario@exemplo.com"
            required
          />
          <InputField
            label="Senha"
            type="password"
            value={userForm.password}
            onChange={(e: any) => setUserForm({ ...userForm, password: e.target.value })}
            placeholder="••••••••"
            required
          />
          <InputField
            label="Nome Completo"
            value={userForm.fullName}
            onChange={(e: any) => setUserForm({ ...userForm, fullName: e.target.value })}
            placeholder="Nome do usuário"
            required
          />
          <SelectField
            label="Função"
            value={userForm.role}
            onChange={(e: any) => setUserForm({ ...userForm, role: e.target.value })}
            options={[
              { value: 'atendente', label: 'Atendente' },
              { value: 'admin', label: 'Administrador' }
            ]}
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all">
            Criar Usuário
          </button>
        </form>
      </Modal>

      {/* Modal Novo Serviço */}
      <Modal isOpen={showServicoModal} onClose={() => { setShowServicoModal(false); setEditingServico(null); setServicoForm({ nome: '', preco: '', duracao: '' }); }} title={editingServico ? 'Editar Serviço' : 'Novo Serviço'}>
        <form onSubmit={handleCreateServico} className="space-y-4">
          <InputField
            label="Nome do Serviço"
            value={servicoForm.nome}
            onChange={(e: any) => setServicoForm({ ...servicoForm, nome: e.target.value })}
            placeholder="Ex: Corte Masculino"
            required
          />
          <InputField
            label="Preço (R$)"
            type="number"
            step="0.01"
            value={servicoForm.preco}
            onChange={(e: any) => setServicoForm({ ...servicoForm, preco: e.target.value })}
            placeholder="50.00"
            required
          />
          <InputField
            label="Duração (minutos)"
            type="number"
            value={servicoForm.duracao}
            onChange={(e: any) => setServicoForm({ ...servicoForm, duracao: e.target.value })}
            placeholder="30"
            required
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all">
            {editingServico ? 'Salvar Alterações' : 'Adicionar Serviço'}
          </button>
        </form>
      </Modal>

      {/* Modal Novo Funcionário */}
      <Modal isOpen={showFuncionarioModal} onClose={() => { setShowFuncionarioModal(false); setEditingFuncionario(null); setFuncionarioForm({ nome: '', especialidade: '', cor: '#3b82f6', aceitaEncaixe: true }); }} title={editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}>
        <form onSubmit={handleCreateFuncionario} className="space-y-4">
          <InputField
            label="Nome"
            value={funcionarioForm.nome}
            onChange={(e: any) => setFuncionarioForm({ ...funcionarioForm, nome: e.target.value })}
            placeholder="Nome do profissional"
            required
          />
          <InputField
            label="Especialidade"
            value={funcionarioForm.especialidade}
            onChange={(e: any) => setFuncionarioForm({ ...funcionarioForm, especialidade: e.target.value })}
            placeholder="Ex: Barbeiro, Manicure"
          />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Cor na Agenda</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFuncionarioForm({ ...funcionarioForm, cor: color })}
                  className={cn("w-8 h-8 rounded-full transition-all", funcionarioForm.cor === color ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : "opacity-60 hover:opacity-100")}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="aceitaEncaixe"
              checked={funcionarioForm.aceitaEncaixe}
              onChange={(e: any) => setFuncionarioForm({ ...funcionarioForm, aceitaEncaixe: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="aceitaEncaixe" className="text-sm font-medium text-slate-700">Aceita encaixes</label>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all">
            {editingFuncionario ? 'Salvar Alterações' : 'Adicionar Funcionário'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
