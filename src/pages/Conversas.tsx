import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MoreVertical,
  Phone,
  User,
  Clock,
  Send,
  Lock,
  LockOpen,
  Check
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { sendWhatsAppMessage } from '../services/whatsappService';

interface ChatMessage {
  type: 'human' | 'agent';
  content: string;
  additional_kwargs?: any;
  response_metadata?: any;
  timestamp?: string;
  id?: number;
}

interface ChatSession {
  session_id: string;
  messages: ChatMessage[];
  last_message?: string;
  last_time?: string;
  unread_count?: number;
  cliente?: {
    Nome?: string;
    Telefone?: string;
    trava?: string;
  };
}

export default function Conversas() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar conversas
  useEffect(() => {
    loadConversas();
  }, []);

  // Polling para atualização em tempo real (a cada 5 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversas();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll para o final das mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession, selectedSessionData?.messages]);

  const handleToggleTrava = async () => {
    if (!selectedSession) return;

    const currentSession = sessions.find(s => s.session_id === selectedSession);
    if (!currentSession?.cliente) {
      alert('Cliente não encontrado. Não é possível bloquear/desbloquear.');
      return;
    }

    const currentTrava = currentSession.cliente.trava;
    const newTrava: 'true' | 'false' = currentTrava === 'true' ? 'false' : 'true';

    try {
      // Buscar cliente por telefone para obter o ID
      const cliente = await supabaseService.buscarClientePorTelefone(selectedSession);
      if (!cliente) {
        alert('Cliente não encontrado.');
        return;
      }

      await supabaseService.updateClienteTrava(cliente.Cliente_id, newTrava);

      // Atualizar estado local
      setSessions(prev => prev.map(session => {
        if (session.session_id === selectedSession) {
          return {
            ...session,
            cliente: {
              ...session.cliente!,
              trava: newTrava
            }
          };
        }
        return session;
      }));

      setMenuOpen(false);
    } catch (error: any) {
      alert('Erro ao atualizar trava: ' + error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedSession || !messageText.trim() || sendingMessage) return;

    setSendingMessage(true);

    try {
      await sendWhatsAppMessage(selectedSession, messageText);
      setMessageText('');

      // Opcional: Adicionar mensagem ao estado local imediatamente
      // (ela aparecerá no próximo polling de qualquer forma)
      setSessions(prev => prev.map(session => {
        if (session.session_id === selectedSession) {
          return {
            ...session,
            messages: [
              ...session.messages,
              {
                type: 'agent',
                content: messageText,
                timestamp: new Date().toISOString()
              }
            ],
            last_message: messageText.substring(0, 50) + '...',
            last_time: new Date().toISOString()
          };
        }
        return session;
      }));

    } catch (error: any) {
      alert('Erro ao enviar mensagem: ' + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const loadConversas = async () => {
    try {
      console.log('=== CARREGANDO CONVERSAS ===');

      // Buscar todas as mensagens do n8n
      const { data, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .order('id', { ascending: true });

      console.log('Data:', data);
      console.log('Error:', error);

      if (error) throw error;

      // Agrupar por session_id
      const grouped: Record<string, ChatMessage[]> = {};

      data?.forEach((msg: any) => {
        const sessionId = msg.session_id;
        if (!grouped[sessionId]) {
          grouped[sessionId] = [];
        }
        grouped[sessionId].push({
          ...msg.message,
          id: msg.id,
          timestamp: msg.created_at
        });
      });

      // Buscar dados dos clientes
      const telefones = Object.keys(grouped);
      const clientesData = await Promise.all(
        telefones.map(tel =>
          supabaseService.buscarClientePorTelefone(tel)
        )
      );

      // Criar sessions com dados do cliente
      const sessionsList: ChatSession[] = Object.entries(grouped).map(([sessionId, messages]) => {
        const cliente = clientesData.find(c => c?.Telefone?.includes(sessionId));

        // Pegar última mensagem
        const lastMsg = messages[messages.length - 1];

        return {
          session_id: sessionId,
          messages,
          last_message: lastMsg?.content?.substring(0, 50) + '...' || '',
          last_time: lastMsg?.timestamp,
          unread_count: 0, // TODO: calcular mensagens não lidas
          cliente: cliente ? {
            Nome: cliente.Nome,
            Telefone: cliente.Telefone,
            trava: cliente.trava
          } : undefined
        };
      });

      // Ordenar por mais recente
      sessionsList.sort((a, b) => {
        const timeA = a.last_time ? new Date(a.last_time).getTime() : 0;
        const timeB = b.last_time ? new Date(b.last_time).getTime() : 0;
        return timeB - timeA;
      });

      setSessions(sessionsList);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar conversas
  const filteredSessions = useMemo(() => {
    if (!searchTerm) return sessions;

    return sessions.filter(session => {
      const nome = session.cliente?.Nome?.toLowerCase() || '';
      const telefone = session.session_id;
      const term = searchTerm.toLowerCase();

      return nome.includes(term) || telefone.includes(term);
    });
  }, [sessions, searchTerm]);

  const selectedSessionData = selectedSession
    ? sessions.find(s => s.session_id === selectedSession)
    : null;

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
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Conversas IA</h2>
          <p className="text-slate-500">Histórico de conversas com o agente de IA</p>
        </div>
      </div>

      {/* Container Principal */}
      <div className="flex-1 flex bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Sidebar - Lista de Conversas */}
        <div className="w-80 border-r border-slate-200 flex flex-col">
          {/* Busca */}
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar conversa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Lista de Conversas */}
          <div className="flex-1 overflow-y-auto">
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                <Phone size={48} strokeWidth={1} />
                <p className="mt-4 text-sm font-medium">Nenhuma conversa encontrada</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => setSelectedSession(session.session_id)}
                  className={cn(
                    "w-full p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left",
                    selectedSession === session.session_id && "bg-blue-50 border-l-4 border-l-blue-600"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                      {session.cliente?.Nome?.charAt(0) || session.session_id.slice(-2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 truncate">
                          {session.cliente?.Nome || session.session_id}
                        </span>
                        {session.cliente?.trava === 'true' && (
                          <Lock size={14} className="text-rose-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mb-1">
                        {session.last_message}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Clock size={10} />
                        <span>
                          {session.last_time
                            ? new Date(session.last_time).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!selectedSessionData ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Phone size={64} strokeWidth={1} className="mx-auto mb-4" />
                <p className="text-lg font-medium">Selecione uma conversa</p>
                <p className="text-sm mt-2">Clique em uma conversa na lista para ver o histórico</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {selectedSessionData.cliente?.Nome?.charAt(0) || selectedSessionData.session_id.slice(-2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {selectedSessionData.cliente?.Nome || 'Cliente'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{selectedSessionData.session_id}</span>
                        {selectedSessionData.cliente?.trava === 'true' && (
                          <>
                            <span>•</span>
                            <span className="text-rose-500 flex items-center gap-1">
                              <Lock size={10} /> Bloqueado
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {menuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
                        >
                          {selectedSessionData.cliente?.trava === 'true' ? (
                            <button
                              onClick={handleToggleTrava}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700"
                            >
                              <div className="p-1.5 bg-emerald-100 rounded-lg">
                                <LockOpen size={16} className="text-emerald-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">Desbloquear IA</p>
                                <p className="text-xs text-slate-400">IA voltará a responder</p>
                              </div>
                            </button>
                          ) : (
                            <button
                              onClick={handleToggleTrava}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700"
                            >
                              <div className="p-1.5 bg-rose-100 rounded-lg">
                                <Lock size={16} className="text-rose-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">Bloquear IA</p>
                                <p className="text-xs text-slate-400">Apenas humanos respondem</p>
                              </div>
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {selectedSessionData.messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex max-w-[80%]",
                      msg.type === 'human' ? 'justify-start' : 'justify-end ml-auto'
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm",
                        msg.type === 'human'
                          ? "bg-white text-slate-800 rounded-tl-none"
                          : "bg-green-500 text-white rounded-tr-none"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <div
                        className={cn(
                          "text-[10px] mt-1 opacity-70",
                          msg.type === 'human' ? "text-slate-400" : "text-green-100"
                        )}
                      >
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : ''}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendingMessage}
                    className={cn(
                      "flex-1 px-4 py-3 border rounded-xl outline-none text-sm transition-all",
                      sendingMessage
                        ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-white border-slate-200 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    )}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendingMessage}
                    className={cn(
                      "p-3 text-white rounded-xl transition-all",
                      !messageText.trim() || sendingMessage
                        ? "bg-slate-300 cursor-not-allowed opacity-50"
                        : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                    )}
                  >
                    {sendingMessage ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                  <span>Pressione Enter para enviar</span>
                  {selectedSessionData.cliente?.trava === 'true' && (
                    <>
                      <span>•</span>
                      <span className="text-rose-500 flex items-center gap-1">
                        <Lock size={10} /> IA bloqueada - apenas humanos respondem
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
