import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, Mail, Phone, FileText, MessageCircle,
  Calendar, ArrowLeft, ExternalLink, MessageSquare,
  Clock, CheckCircle, X, Loader2, Linkedin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { Candidate, Job } from '../types';

export default function CandidateList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [currentInterview, setCurrentInterview] = useState<any>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isEditingInterview, setIsEditingInterview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [interviewData, setInterviewData] = useState({
    date: '',
    time: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (selectedCandidate) {
      fetchInterview(selectedCandidate.id);
    } else {
      setCurrentInterview(null);
    }
  }, [selectedCandidate]);

  const fetchInterview = async (candidateId: number) => {
    try {
      const interview = await api.company.getInterviewByCandidate(candidateId);
      setCurrentInterview(interview);
    } catch (error) {
      console.error('Error fetching interview:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [jobData, candidatesData] = await Promise.all([
        api.jobs.get(id!),
        api.company.getCandidates(Number(id))
      ]);
      setJob(jobData);
      setCandidates(candidatesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    try {
      if (isEditingInterview && currentInterview) {
        await api.company.updateInterview(currentInterview.id, interviewData);
        alert('Entrevista atualizada com sucesso!');
      } else {
        await api.company.scheduleInterview({
          candidate_id: selectedCandidate.id,
          ...interviewData
        });
        alert('Entrevista agendada com sucesso!');
      }

      // Prepare WhatsApp message
      const formattedDate = new Date(interviewData.date).toLocaleDateString('pt-BR');
      const message = encodeURIComponent(
        `Olá ${selectedCandidate.name}! Aqui é da empresa ${job?.company_name}.\n\n` +
        `Gostaríamos de confirmar o agendamento da sua entrevista para a vaga de *${job?.title}*.\n\n` +
        `📅 *Data:* ${formattedDate}\n` +
        `🕒 *Hora:* ${interviewData.time}\n` +
        (interviewData.notes ? `📍 *Observações:* ${interviewData.notes}\n\n` : '\n') +
        `Poderia confirmar o recebimento desta mensagem?`
      );

      const whatsappUrl = `https://wa.me/${selectedCandidate.phone.replace(/\D/g, '')}?text=${message}`;

      setIsInterviewModalOpen(false);
      setIsEditingInterview(false);
      setInterviewData({ date: '', time: '', notes: '' });
      fetchInterview(selectedCandidate.id);

      // Automatic redirection
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      alert('Erro ao processar entrevista.');
    }
  };

  const handleDeleteInterview = async () => {
    if (!currentInterview) return;

    setIsDeleting(true);
    try {
      const interviewId = Number(currentInterview.id);
      await api.company.deleteInterview(interviewId);
      alert('Entrevista cancelada com sucesso!');
      setCurrentInterview(null);
      setIsDeleting(false);
    } catch (error) {
      console.error('Error deleting interview:', error);
      alert('Erro ao cancelar entrevista.');
      setIsDeleting(false);
    }
  };

  const openEditInterview = () => {
    if (!currentInterview) return;
    setInterviewData({
      date: currentInterview.date,
      time: currentInterview.time,
      notes: currentInterview.notes || '',
    });
    setIsEditingInterview(true);
    setIsInterviewModalOpen(true);
  };

  if (loading) return <div className="text-center py-20">Carregando candidatos...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <button onClick={() => navigate('/company/jobs')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Voltar para Vagas
          </button>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Candidatos para {job?.title}</h1>
          <p className="text-zinc-500">Gerencie os talentos que se aplicaram a esta oportunidade.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidates List */}
        <div className="lg:col-span-2 space-y-4">
          {candidates.map((candidate, i) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-6 bg-white rounded-3xl border transition-all cursor-pointer group ${selectedCandidate?.id === candidate.id ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500' : 'border-zinc-100 shadow-sm hover:shadow-md'
                }`}
              onClick={() => setSelectedCandidate(candidate)}
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 shrink-0">
                  <Users className="w-6 h-6 text-zinc-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900">{candidate.name}</h3>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(candidate.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {candidate.email}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {candidate.phone}</span>
                    {candidate.linkedin && (
                      <span className="flex items-center gap-1.5"><Linkedin className="w-4 h-4" /> Linkedin</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {candidates.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-zinc-200">
              <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-900">Nenhum candidato ainda</h3>
              <p className="text-zinc-500 mt-2">Assim que alguém se candidatar, aparecerá aqui.</p>
            </div>
          )}
        </div>

        {/* Candidate Detail Sidebar */}
        <aside className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedCandidate ? (
              <motion.div
                key={selectedCandidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-8 sticky top-24"
              >
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                    <Users className="w-10 h-10" />
                  </div>
                  <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold text-zinc-900">{selectedCandidate.name}</h2>
                    <p className="text-sm text-zinc-500">{selectedCandidate.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ações</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <a
                      href={`https://wa.me/${selectedCandidate.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                    >
                      <MessageCircle className="w-5 h-5" /> WhatsApp
                    </a>

                    {currentInterview ? (
                      <div className="p-6 bg-zinc-900 text-white rounded-3xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                            <Calendar className="w-4 h-4" /> Entrevista Agendada
                          </div>
                          <div className="flex gap-2">
                            {isDeleting ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleDeleteInterview}
                                  className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  Confirmar?
                                </button>
                                <button
                                  onClick={() => setIsDeleting(false)}
                                  className="p-1 hover:bg-white/10 rounded-lg text-zinc-400"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={openEditInterview}
                                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
                                  title="Editar"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setIsDeleting(true)}
                                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
                                  title="Cancelar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Data</div>
                            <div className="text-sm font-bold">{new Date(currentInterview.date).toLocaleDateString()}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Hora</div>
                            <div className="text-sm font-bold">{currentInterview.time.substring(0, 5)}</div>
                          </div>
                        </div>
                        {currentInterview.notes && (
                          <div className="space-y-1 pt-2 border-t border-white/10">
                            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Observações</div>
                            <div className="text-xs text-zinc-300 line-clamp-2">{currentInterview.notes}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setIsEditingInterview(false);
                          setInterviewData({ date: '', time: '', notes: '' });
                          setIsInterviewModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all"
                      >
                        <Calendar className="w-5 h-5" /> Marcar Entrevista
                      </button>
                    )}
                    {selectedCandidate.resume_url && (
                      <a
                        href={selectedCandidate.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-zinc-50 text-zinc-900 py-4 rounded-2xl font-bold hover:bg-zinc-100 transition-all border border-zinc-200"
                      >
                        <FileText className="w-5 h-5" /> Ver Currículo
                      </a>
                    )}
                    {selectedCandidate.linkedin && (
                      <a
                        href={selectedCandidate.linkedin.startsWith('http') ? selectedCandidate.linkedin : `https://${selectedCandidate.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-[#0A66C2] text-white py-4 rounded-2xl font-bold hover:bg-[#004182] transition-all shadow-lg shadow-blue-200"
                      >
                        <Linkedin className="w-5 h-5 fill-current" /> Ver Perfil no LinkedIn
                      </a>
                    )}
                  </div>
                </div>

                {selectedCandidate.message && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mensagem</h3>
                    <div className="p-4 bg-zinc-50 rounded-2xl text-sm text-zinc-600 leading-relaxed italic">
                      "{selectedCandidate.message}"
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-dashed border-zinc-200 text-center space-y-4">
                <Users className="w-10 h-10 text-zinc-300 mx-auto" />
                <p className="text-sm text-zinc-500">Selecione um candidato para ver os detalhes e entrar em contato.</p>
              </div>
            )}
          </AnimatePresence>
        </aside>
      </div>

      {/* Interview Modal */}
      <AnimatePresence>
        {isInterviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
              onClick={() => setIsInterviewModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 md:p-12 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-zinc-900">
                  {isEditingInterview ? 'Editar Entrevista' : 'Agendar Entrevista'}
                </h2>
                <button onClick={() => setIsInterviewModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleScheduleInterview} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">Data</label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      value={interviewData.date}
                      onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">Hora</label>
                    <input
                      required
                      type="time"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      value={interviewData.time}
                      onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Observações</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Link da reunião, local ou instruções..."
                    value={interviewData.notes}
                    onChange={(e) => setInterviewData({ ...interviewData, notes: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  {isEditingInterview ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
