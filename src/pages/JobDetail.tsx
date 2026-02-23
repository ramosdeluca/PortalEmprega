import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Building2, Briefcase, Calendar, Clock, DollarSign, ArrowLeft, Share2, CheckCircle, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { Job } from '../types';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.jobs.get(id).then(setJob).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="text-center py-20">Carregando...</div>;
  if (!job) return <div className="text-center py-20">Vaga não encontrada.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center border border-zinc-100 overflow-hidden">
                {job.company_logo ? (
                  <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-zinc-400" />
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-zinc-500">
                  <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {job.company_name}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-zinc-100">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tipo</div>
                <div className="text-sm font-bold text-zinc-900">{job.type}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Salário</div>
                <div className="text-sm font-bold text-zinc-900">{job.salary || 'A combinar'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ocupação</div>
                <div className="text-sm font-bold text-zinc-900">{job.cbo_name}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Postada em</div>
                <div className="text-sm font-bold text-zinc-900">{new Date(job.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">Descrição da Vaga</h2>
              <div className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">Requisitos</h2>
              <div className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                {job.requirements}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6 sticky top-24">
            <div className="space-y-4">
              <Link
                to={`/jobs/${job.id}/apply`}
                className="block w-full bg-emerald-600 text-white text-center py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                Candidatar-se Agora
              </Link>
              <button className="w-full bg-zinc-50 text-zinc-900 py-4 rounded-2xl font-bold hover:bg-zinc-100 transition-all flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" /> Compartilhar
              </button>
            </div>

            <div className="pt-6 border-t border-zinc-100 space-y-4">
              <h3 className="font-bold text-zinc-900">Sobre a Empresa</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100 overflow-hidden">
                  {job.company_logo ? (
                    <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-zinc-900">{job.company_name}</div>
                  <div className="text-xs text-zinc-500">Empresa Verificada</div>
                </div>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Esta empresa utiliza o PortalEmprega para gerenciar seus processos seletivos de forma transparente e eficiente.
              </p>
              {job.company_whatsapp && (
                <a
                  href={`https://wa.me/${job.company_whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-600 text-sm font-bold hover:underline"
                >
                  <MessageCircle className="w-4 h-4" /> Contato via WhatsApp
                </a>
              )}
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Clock className="w-3 h-3" />
                Expira em: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Não definido'}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
