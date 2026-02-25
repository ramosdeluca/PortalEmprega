import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Building2, ArrowRight, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { Job } from '../types';

export default function Home() {
  const [search, setSearch] = useState('');
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.jobs.list({ limit: 4 }).then(setRecentJobs);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_100%)]" />

        <div className="text-center max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider"
          >
            <TrendingUp className="w-3 h-3" />
            O seu portal completo de vagas
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-zinc-900 tracking-tight leading-[1.1]"
          >
            Encontre o seu próximo <br />
            <span className="text-emerald-600">desafio profissional</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-600 max-w-2xl mx-auto"
          >
            Conectamos as melhores empresas aos talentos mais qualificados do mercado.
            Busca inteligente, candidaturas rápidas e gestão completa.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-3 p-2 bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 max-w-2xl mx-auto"
          >
            <div className="flex-1 flex items-center px-4 gap-3">
              <Search className="w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Ex: Desenvolvedor, Atendente, Gerente..."
                className="w-full py-3 bg-transparent border-none focus:ring-0 text-zinc-900 placeholder:text-zinc-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              Buscar Vagas
            </button>
          </motion.form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Vagas Ativas', value: '1,200+', icon: Briefcase },
          { label: 'Empresas Parceiras', value: '450+', icon: Building2 },
          { label: 'Candidatos Felizes', value: '15k+', icon: Users },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm text-center space-y-2"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <stat.icon className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-zinc-900">{stat.value}</div>
            <div className="text-zinc-500 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </section>

      {/* Recent Jobs */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Vagas Recentes</h2>
            <p className="text-zinc-500">As oportunidades mais novas publicadas na plataforma.</p>
          </div>
          <Link to="/jobs" className="text-emerald-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentJobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 overflow-hidden">
                  {job.company_logo ? (
                    <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{job.title}</h3>
                    <div className="flex gap-2">
                      <span className="text-xs font-medium px-2 py-1 bg-zinc-100 rounded-lg text-zinc-600">{job.type}</span>
                      {job.work_model && (
                        <span className="text-xs font-medium px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">{job.work_model}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {job.company_name}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {job.cbo_name}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dual CTA Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Candidate CTA */}
        <div className="bg-emerald-600 rounded-[2.5rem] p-12 text-center relative overflow-hidden flex flex-col justify-center border border-emerald-500 shadow-xl shadow-emerald-900/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/30 blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-800/30 blur-[100px] -ml-32 -mb-32" />

          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              Procurando sua <br />
              <span className="text-emerald-200">próxima oportunidade?</span>
            </h2>
            <p className="text-emerald-50 text-lg">
              Cadastre seu currículo para que as melhores empresas encontrem seu perfil e entrem em contato diretamente com você.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/signup-candidate" className="w-full sm:w-auto bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold hover:bg-zinc-50 transition-all shadow-lg active:scale-95">
                Cadastrar Currículo
              </Link>
              <Link to="/jobs" className="w-full sm:w-auto bg-black/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black/20 transition-all backdrop-blur-sm active:scale-95">
                Navegar Vagas
              </Link>
            </div>
          </div>
        </div>

        {/* Company CTA */}
        <div className="bg-zinc-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden flex flex-col justify-center border border-zinc-800 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/20 blur-[100px] -ml-32 -mb-32" />

          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              Sua empresa precisa dos <br />
              <span className="text-emerald-500">melhores talentos?</span>
            </h2>
            <p className="text-zinc-400 text-lg">
              Publique suas vagas e utilize nosso banco com milhares de profissionais prontos para uma entrevista.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/signup" className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                Começar Agora
              </Link>
              <Link to="/login" className="w-full sm:w-auto bg-white/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all backdrop-blur-sm active:scale-95">
                Fazer Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
