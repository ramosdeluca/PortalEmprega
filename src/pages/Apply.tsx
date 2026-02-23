import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, FileText, MessageSquare, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { Job } from '../types';

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [resume, setResume] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      api.jobs.get(id).then(setJob);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    // File size validation (500KB)
    if (resume && resume.size > 500 * 1024) {
      alert('O arquivo do currículo excede o tamanho máximo permitido de 500KB. Por favor, envie um arquivo menor.');
      return;
    }
    
    setLoading(true);
    try {
      await api.jobs.apply(id, formData, resume || undefined);
      setSuccess(true);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('exceeded the maximum allowed size')) {
        alert('Erro: O arquivo enviado é muito grande (máximo 500KB).');
      } else {
        alert(`Erro ao enviar candidatura: ${error.message || 'Tente novamente.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle className="w-10 h-10" />
        </motion.div>
        <h1 className="text-3xl font-bold text-zinc-900">Candidatura Enviada!</h1>
        <p className="text-zinc-600">
          Sua candidatura para a vaga <strong>{job?.title}</strong> foi enviada com sucesso para a empresa <strong>{job?.company_name}</strong>.
        </p>
        <button
          onClick={() => navigate('/jobs')}
          className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all"
        >
          Ver outras vagas
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para a vaga
      </button>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Candidatar-se</h1>
          <p className="text-zinc-500">
            Você está se candidatando para: <span className="font-bold text-zinc-900">{job?.title}</span> em <span className="font-bold text-zinc-900">{job?.company_name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  required
                  type="text"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Telefone WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    required
                    type="tel"
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    required
                    type="email"
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Currículo (PDF ou DOC - Máx 500KB)</label>
              <div className="relative">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-200 border-dashed rounded-2xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className="w-8 h-8 text-zinc-400 mb-2" />
                      <p className="text-sm text-zinc-500">
                        {resume ? <span className="text-emerald-600 font-bold">{resume.name}</span> : 'Clique para fazer upload ou arraste'}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResume(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Mensagem (Opcional)</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-zinc-400" />
                <textarea
                  rows={4}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Conte um pouco sobre você..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : <><Send className="w-5 h-5" /> Enviar Candidatura</>}
          </button>
        </form>
      </div>
    </div>
  );
}
