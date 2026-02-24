import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users, Mail, Phone, FileText, Linkedin,
    ArrowLeft, Search, Briefcase, Zap, Calendar, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { Job, CandidateProfile } from '../types';

export default function PotentialCandidatesList() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
    const [interviewData, setInterviewData] = useState({ date: '', time: '', notes: '' });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const jobData = await api.jobs.get(id!);
            setJob(jobData);

            const candidatesData = await api.company.getPotentialCandidates(jobData.title, jobData.cbo_name, Number(id));
            setCandidates(candidatesData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = (phone: string, candidateName: string) => {
        const message = encodeURIComponent(
            `Olá ${candidateName}! Aqui é da empresa ${job?.company_name}.\n\n` +
            `Encontramos o seu perfil em nossa base de talentos e vimos que você tem experiência em áreas relacionadas à nossa vaga de *${job?.title}*.\n\n` +
            `Gostaria de bater um papo sobre essa oportunidade?`
        );
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    };

    const handleScheduleInterview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !selectedCandidate) return;

        try {
            await api.company.schedulePotentialCandidateInterview(id, selectedCandidate, interviewData);
            alert('Entrevista agendada com sucesso! O candidato foi adicionado à sua vaga.');
            setIsInterviewModalOpen(false);

            // Remove o candidato da lista de "Possíveis Candidatos" porque ele agora é um candidato real
            setCandidates(candidates.filter(c => c.id !== selectedCandidate.id));
        } catch (error) {
            console.error(error);
            alert('Erro ao agendar entrevista.');
        }
    };

    if (loading) return <div className="text-center py-20">Buscando talentos...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <button onClick={() => navigate('/company/jobs')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium transition-colors mb-2">
                        <ArrowLeft className="w-4 h-4" /> Voltar para Vagas
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Possíveis Candidatos</h1>
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3" /> MATCH
                        </span>
                    </div>
                    <p className="text-zinc-500">
                        Perfis cadastrados com experiência em <span className="font-bold text-zinc-900">{job?.title}</span>
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                            <Search className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-zinc-900">{candidates.length} perfis encontrados</h3>
                            <p className="text-sm text-zinc-500">Baseado no título e CBO da vaga</p>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-zinc-100">
                    {candidates.map((candidate) => (
                        <div key={candidate.id} className="p-8 hover:bg-zinc-50/50 transition-colors">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 shrink-0">
                                    <Users className="w-8 h-8" />
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900">{candidate.name}</h3>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1.5 text-sm text-zinc-600 font-medium bg-zinc-100 px-3 py-1 rounded-full">
                                                    <Briefcase className="w-4 h-4" /> {candidate.current_occupation || 'Não informada'}
                                                </div>
                                                {candidate.availability && (
                                                    <div className="text-sm text-zinc-500">
                                                        Disponibilidade: {candidate.availability}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {candidate.about_me && (
                                        <p className="text-zinc-600 text-sm leading-relaxed border-l-2 border-emerald-500 pl-4 py-1">
                                            "{candidate.about_me}"
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-100">
                                        <button
                                            onClick={() => {
                                                setSelectedCandidate(candidate);
                                                setInterviewData({ date: '', time: '', notes: '' });
                                                setIsInterviewModalOpen(true);
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            <Calendar className="w-4 h-4" /> Agendar Entrevista
                                        </button>

                                        {candidate.whatsapp && (
                                            <button
                                                onClick={() => handleWhatsApp(candidate.whatsapp!, candidate.name)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-sm font-bold transition-colors"
                                            >
                                                <Phone className="w-4 h-4" /> Abordar WhatsApp
                                            </button>
                                        )}

                                        {candidate.email && (
                                            <a
                                                href={`mailto:${candidate.email}?subject=Oportunidade de Vaga: ${job?.title}&body=Olá ${candidate.name},`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-sm font-bold transition-colors"
                                            >
                                                <Mail className="w-4 h-4" /> Email
                                            </a>
                                        )}

                                        {candidate.linkedin && (
                                            <a
                                                href={candidate.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F0F7FE] text-[#0A66C2] hover:bg-[#E0EFFF] rounded-xl text-sm font-bold transition-colors"
                                            >
                                                <Linkedin className="w-4 h-4" /> Ver Perfil
                                            </a>
                                        )}

                                        {candidate.resume_url && (
                                            <a
                                                href={candidate.resume_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-bold transition-colors"
                                            >
                                                <FileText className="w-4 h-4" /> Currículo
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {candidates.length === 0 && (
                        <div className="text-center py-20 px-4">
                            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-zinc-900 mb-2">Nenhum perfil encontrado</h3>
                            <p className="text-zinc-500">
                                Ainda não há candidatos na plataforma com ocupações que correspondam diretamente a esta vaga.
                            </p>
                        </div>
                    )}
                </div>
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
                                <div>
                                    <h2 className="text-2xl font-bold text-zinc-900">Agendar Entrevista</h2>
                                    <p className="text-zinc-500 text-sm mt-1">Com {selectedCandidate?.name}</p>
                                </div>
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
                                    Confirmar Agendamento
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
