import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, Edit, Power, PowerOff,
  ChevronRight, Search, Filter, ArrowLeft,
  MoreVertical, CheckCircle, XCircle, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { Job } from '../types';

interface JobWithPotentialCount extends Job {
  potentialCandidatesCount?: number;
}

export default function ManageJobs() {
  const [jobs, setJobs] = useState<JobWithPotentialCount[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await api.company.getJobs();

      const jobsWithCounts = await Promise.all(data.map(async (job) => {
        try {
          // Buscamos a contagem para cada vaga do usuário
          const potential = await api.company.getPotentialCandidates(job.title, job.cbo_name, job.id);
          return { ...job, potentialCandidatesCount: potential.length };
        } catch (e) {
          return { ...job, potentialCandidatesCount: 0 };
        }
      }));

      setJobs(jobsWithCounts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      await api.company.updateJobStatus(id, newStatus);
      setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus as any } : j));
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  if (loading) return <div className="text-center py-20">Carregando vagas...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <button onClick={() => navigate('/company/dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </button>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Gerenciar Vagas</h1>
          <p className="text-zinc-500">Acompanhe o status e os candidatos de cada oportunidade.</p>
        </div>
        <Link
          to="/company/jobs/new"
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
        >
          Nova Vaga
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Vaga</th>
                <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Candidatos</th>
                <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Criada em</th>
                <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Data Limite</th>
                <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{job.title}</div>
                      <div className="flex flex-col gap-1.5 mt-1">
                        <div className="text-xs text-zinc-500 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {job.cbo_name}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {job.type && (
                            <div className="text-[10px] font-bold text-zinc-600 bg-zinc-100 border border-zinc-200 rounded-lg px-2 py-0.5 w-fit uppercase tracking-wider">
                              {job.type}
                            </div>
                          )}
                          {job.work_model && (
                            <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-0.5 w-fit uppercase tracking-wider">
                              {job.work_model}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${job.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                      }`}>
                      {job.status === 'active' ? (
                        <><CheckCircle className="w-3 h-3" /> Ativa</>
                      ) : (
                        <><XCircle className="w-3 h-3" /> Encerrada</>
                      )}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-3">
                      <Link
                        to={`/company/jobs/${job.id}/candidates`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-emerald-600 transition-colors"
                      >
                        <Users className="w-4 h-4 text-zinc-400" />
                        Ver Candidatos
                        <span className="bg-zinc-100 text-zinc-600 text-[10px] px-1.5 py-0.5 rounded-full">
                          {job.candidatesCount || 0}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>

                      {(job.potentialCandidatesCount ?? 0) > 0 && (
                        <Link
                          to={`/company/jobs/${job.id}/potential-candidates`}
                          className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 px-2.5 py-1.5 rounded-lg w-fit"
                        >
                          <Zap className="w-4 h-4" />
                          Possíveis Candidatos
                          <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full ml-1">
                            {job.potentialCandidatesCount}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-zinc-500">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-emerald-600">
                    {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Não definida'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(job.id, job.status)}
                        title={job.status === 'active' ? 'Encerrar Vaga' : 'Reativar Vaga'}
                        className={`p-2 rounded-xl border transition-all ${job.status === 'active'
                          ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                          }`}
                      >
                        {job.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <Link to={`/company/jobs/${job.id}/edit`} className="p-2 inline-flex items-center justify-center bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-100 transition-all">
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8 text-zinc-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-zinc-900">Nenhuma vaga publicada</h3>
              <p className="text-zinc-500">Comece publicando sua primeira oportunidade.</p>
            </div>
            <Link
              to="/company/jobs/new"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
            >
              Publicar Vaga
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
