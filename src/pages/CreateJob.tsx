import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, MapPin, DollarSign, Calendar, 
  FileText, Search, CheckCircle, ArrowLeft, 
  AlertCircle, Loader2, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { CBO } from '../types';

export default function CreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cboSearch, setCboSearch] = useState('');
  const [cboResults, setCboResults] = useState<CBO[]>([]);
  const [searchingCbo, setSearchingCbo] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    cbo_code: '',
    cbo_name: '',
    description: '',
    requirements: '',
    location: '',
    type: 'Tempo Integral',
    salary: '',
    deadline: '',
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (cboSearch.length > 2) {
        handleCboSearch();
      } else {
        setCboResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [cboSearch]);

  const handleCboSearch = async () => {
    setSearchingCbo(true);
    console.log('Searching CBO for:', cboSearch);
    try {
      const results = await api.cbo.search(cboSearch);
      console.log('CBO Results:', results);
      setCboResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error('CBO Search Error:', error);
    } finally {
      setSearchingCbo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cbo_code) {
      alert('Por favor, selecione uma ocupação válida da lista.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.company.createJob(formData);
      if (res.id) {
        navigate('/company/jobs');
      } else {
        alert(res.error || 'Erro ao criar vaga');
      }
    } catch (error) {
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const selectCbo = (cbo: CBO) => {
    setFormData({ ...formData, cbo_code: cbo.codigo, cbo_name: cbo.nome });
    setCboSearch(cbo.nome);
    setCboResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Publicar Nova Vaga</h1>
          <p className="text-zinc-500">Preencha os detalhes abaixo para atrair os melhores candidatos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Título da Vaga</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  required
                  type="text"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Ex: Desenvolvedor Full Stack"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-zinc-700">Ocupação (CBO)</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  required
                  type="text"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Busque por ocupação..."
                  value={cboSearch}
                  onChange={(e) => setCboSearch(e.target.value)}
                />
                {searchingCbo && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />}
              </div>
              
              <AnimatePresence>
                {cboResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-50 w-full mt-2 bg-white border border-zinc-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto"
                  >
                    {cboResults.map((cbo) => (
                      <button
                        key={cbo.codigo}
                        type="button"
                        onClick={() => selectCbo(cbo)}
                        className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-zinc-50 last:border-none group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">{cbo.nome}</div>
                          <div className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">CBO {cbo.codigo}</div>
                        </div>
                        {cbo.sinonimos && (
                          <div className="text-[10px] text-zinc-500 mt-1 line-clamp-2 italic leading-tight">
                            {cbo.sinonimos}
                          </div>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
                {cboSearch.length > 2 && !searchingCbo && cboResults.length === 0 && !formData.cbo_code && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-50 w-full mt-2 bg-white border border-zinc-100 rounded-2xl shadow-xl p-4 text-center text-sm text-zinc-500"
                  >
                    Nenhuma ocupação encontrada para "{cboSearch}"
                  </motion.div>
                )}
              </AnimatePresence>
              {formData.cbo_code && !cboResults.length && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
                  <CheckCircle className="w-3 h-3" /> Selecionado: {formData.cbo_name}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Localização</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  required
                  type="text"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Cidade, Estado ou Remoto"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Tipo de Vaga</label>
              <select
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option>Tempo Integral</option>
                <option>Meio Período</option>
                <option>PJ</option>
                <option>Estágio</option>
                <option>Freelance</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Salário (Opcional)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Ex: R$ 5.000,00"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700">Data Limite</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                required
                type="date"
                className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Descrição da Vaga</label>
              <textarea
                required
                rows={6}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="Descreva as responsabilidades e o dia a dia da função..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Requisitos e Diferenciais</label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="Liste as competências técnicas e comportamentais necessárias..."
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>
          </div>

          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex gap-4">
            <Info className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="text-sm text-emerald-800 leading-relaxed">
              <strong>Dica:</strong> Vagas com descrições detalhadas e requisitos claros atraem candidatos 40% mais qualificados. Não esqueça de mencionar os benefícios!
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Publicando...' : <><CheckCircle className="w-5 h-5" /> Publicar Vaga</>}
          </button>
        </form>
      </div>
    </div>
  );
}
