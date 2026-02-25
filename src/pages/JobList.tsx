import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, Filter, X, Briefcase, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { Job } from '../types';

export default function JobList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    occupation: searchParams.get('occupation') || '',
  });

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api.jobs.list(Object.fromEntries(searchParams));
      setJobs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (filters.search) newParams.set('search', filters.search);
    if (filters.location) newParams.set('location', filters.location);
    if (filters.occupation) newParams.set('occupation', filters.occupation);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ search: '', location: '', occupation: '' });
    setSearchParams({});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Filters */}
      <aside className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-zinc-900 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filtros
            </h2>
            <button onClick={clearFilters} className="text-xs text-zinc-400 hover:text-emerald-600 font-medium">
              Limpar
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Palavra-chave</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Ex: Vendedor"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Localização</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Ex: São Paulo"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ocupação (CBO)</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Ex: Atendente"
                  value={filters.occupation}
                  onChange={(e) => setFilters({ ...filters, occupation: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all"
            >
              Aplicar Filtros
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {loading ? 'Carregando vagas...' : `${jobs.length} Vagas encontradas`}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 shrink-0 overflow-hidden">
                    {job.company_logo ? (
                      <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 text-zinc-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                          {job.type}
                        </span>
                        {job.work_model && (
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                            {job.work_model}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" /> {job.company_name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" /> {job.cbo_name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {job.salary && (
                      <div className="text-right hidden md:block">
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Salário</div>
                        <div className="text-sm font-bold text-zinc-900">{job.salary}</div>
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {!loading && jobs.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-zinc-200">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-zinc-300" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Nenhuma vaga encontrada</h3>
              <p className="text-zinc-500 mt-2">Tente ajustar seus filtros ou buscar por outros termos.</p>
              <button onClick={clearFilters} className="mt-6 text-emerald-600 font-bold hover:underline">
                Limpar todos os filtros
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
