import React, { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'motion/react';
import {
  Plus,
  MoreVertical,
  Phone,
  Mail,
  Clock,
  Calendar,
  UserPlus,
  Search,
  Filter,
  Lock,
  LockOpen
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { Cliente } from '../types/database';
import { cn } from '../lib/utils';

const COLUMNS = [
  { id: 'status_novo', label: 'Novos Leads', color: 'bg-blue-500' },
  { id: 'status_atendimento', label: 'Em Atendimento', color: 'bg-amber-500' },
  { id: 'status_marcado', label: 'Agendamento Marcado', color: 'bg-emerald-500' },
  { id: 'status_duvida', label: 'Em Dúvida', color: 'bg-rose-500' },
];

const KanbanCard: React.FC<{
  cliente: Cliente,
  isOverlay?: boolean,
  onToggleTrava?: (clienteId: string, newTrava: boolean) => void
}> = ({ cliente, isOverlay, onToggleTrava }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: cliente.Cliente_id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isLocked = cliente.trava === true;

  const handleToggleTrava = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleTrava) {
      const newTrava = !isLocked;
      onToggleTrava(cliente.Cliente_id, newTrava);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative",
        isLocked
          ? "border-rose-200 bg-rose-50/30"
          : "border-slate-100",
        isOverlay && "shadow-xl border-blue-200 ring-2 ring-blue-500/20"
      )}
    >
      {/* Indicator bar when locked */}
      {isLocked && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded-t-2xl" />
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLocked && (
            <div className="p-1 bg-rose-100 rounded-lg">
              <Lock size={14} className="text-rose-600" />
            </div>
          )}
          <h4 className={cn(
            "font-bold transition-colors",
            isLocked ? "text-rose-700" : "text-slate-900 group-hover:text-blue-600"
          )}>{cliente.Nome}</h4>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleTrava}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              isLocked
                ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            )}
            title={isLocked ? "Desbloquear conversa (IA voltará a responder)" : "Bloquear conversa (só humanos)"}
          >
            {isLocked ? <LockOpen size={14} /> : <Lock size={14} />}
          </button>
          <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-400">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Phone size={12} />
          <span>{cliente.Telefone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Mail size={12} />
          <span className="truncate">{cliente.Email}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <Clock size={12} />
          <span>{cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('pt-BR') : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          {isLocked && (
            <div className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-600 text-[10px] font-bold uppercase flex items-center gap-1">
              <Lock size={10} />
              Bloqueado
            </div>
          )}
          <div className={cn(
            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
            cliente.followUp === 'followUp_0' ? "bg-red-50 text-red-600" :
            cliente.followUp === 'followUp_1' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
          )}>
            {cliente.followUp || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CRM() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await supabaseService.getClientes();
        setClientes(data);
      } catch (error) {
        console.error('Error fetching clientes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  // Filtrar clientes do dia (baseado em ultima_msg)
  const clientesDoDia = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return clientes.filter(c => {
      if (!c.ultima_msg) return false;

      const dataMsg = new Date(c.ultima_msg);
      dataMsg.setHours(0, 0, 0, 0);

      return dataMsg.getTime() === hoje.getTime();
    });
  }, [clientes]);

  const handleToggleTrava = async (clienteId: string, newTrava: boolean) => {
    try {
      await supabaseService.updateClienteTrava(clienteId, newTrava);
      setClientes(prev => prev.map(c =>
        c.Cliente_id === clienteId ? { ...c, trava: newTrava } : c
      ));
    } catch (error) {
      console.error('Error updating trava:', error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (over) {
      const activeCliente = clientesDoDia.find(c => c.Cliente_id === active.id);
      const overColumn = COLUMNS.find(col => col.id === over.id);
      const overCliente = clientesDoDia.find(c => c.Cliente_id === over.id);

      let newStatus = activeCliente?.status;

      // If dropped over a column header or empty space in column
      if (COLUMNS.some(col => col.id === over.id)) {
        newStatus = over.id as any;
      } else if (overCliente) {
        newStatus = overCliente.status;
      }

      if (activeCliente && newStatus && activeCliente.status !== newStatus) {
        try {
          await supabaseService.updateClienteStatus(activeCliente.Cliente_id, newStatus);
          setClientes(prev => prev.map(c =>
            c.Cliente_id === activeCliente.Cliente_id ? { ...c, status: newStatus as any } : c
          ));
        } catch (error) {
          console.error('Error updating status:', error);
        }
      }
    }
    setActiveId(null);
  };

  const activeCliente = activeId ? clientesDoDia.find(c => c.Cliente_id === activeId) : null;

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
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">CRM Kanban</h2>
          <p className="text-slate-500">Gerencie seus leads e funil de vendas.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-bold">
            <Filter size={18} />
            Filtros
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 font-bold">
            <UserPlus size={18} />
            Novo Lead
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-6">
        <div className="flex gap-6 h-full min-w-[1000px]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {COLUMNS.map((col) => (
              <div key={col.id} className="flex-1 flex flex-col min-w-[280px] bg-slate-100/50 rounded-3xl p-4 border border-slate-200/50">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", col.color)} />
                    <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{col.label}</h3>
                    <span className="bg-white px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-400 border border-slate-200">
                      {clientesDoDia.filter(c => c.status === col.id).length}
                    </span>
                  </div>
                  <button className="p-1 hover:bg-white rounded-lg text-slate-400 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                  <SortableContext
                    items={clientesDoDia.filter(c => c.status === col.id).map(c => c.Cliente_id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {clientesDoDia
                      .filter(c => c.status === col.id)
                      .map((cliente) => (
                        <KanbanCard
                          key={cliente.Cliente_id}
                          cliente={cliente}
                          onToggleTrava={handleToggleTrava}
                        />
                      ))}
                  </SortableContext>
                </div>
              </div>
            ))}
            
            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: '0.5',
                  },
                },
              }),
            }}>
              {activeCliente ? (
                <KanbanCard
                  cliente={activeCliente}
                  isOverlay
                  onToggleTrava={handleToggleTrava}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
