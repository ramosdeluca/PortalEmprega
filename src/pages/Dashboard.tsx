import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Users, CheckCircle, Clock, TrendingUp, 
  PlusCircle, ArrowRight, Building2, Calendar, 
  ChevronRight, AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, Cell 
} from 'recharts';
import { api } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [me, dashboard] = await Promise.all([
          api.company.getMe(),
          api.company.getDashboard()
        ]);
        setCompany(me);
        setData(dashboard);
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) return <div className="text-center py-20">Carregando painel...</div>;
  if (!data) return null;

  const { metrics, charts, interviews } = data;

  if (company?.subscription_status !== 'active') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-zinc-900">Assinatura Inativa</h1>
          <p className="text-zinc-500">
            Você precisa de uma assinatura ativa para acessar o dashboard e gerenciar suas vagas.
          </p>
        </div>
        <Link
          to="/company/subscription"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
        >
          Ativar Assinatura <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {company.logo_url && (
            <div className="w-16 h-16 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden flex items-center justify-center p-2">
              <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Olá, {company.name}</h1>
            <p className="text-zinc-500">Aqui está o resumo do seu recrutamento.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to="/company/jobs"
            className="bg-white text-zinc-900 px-6 py-3 rounded-xl font-bold border border-zinc-200 hover:bg-zinc-50 transition-all flex items-center gap-2"
          >
            Gerenciar Vagas
          </Link>
          <Link
            to="/company/jobs/new"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Nova Vaga
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total de Vagas', value: metrics.totalVagas, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
          { label: 'Vagas Ativas', value: metrics.vagasAtivas, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Total de Candidatos', value: metrics.totalCandidatos, icon: Users, color: 'bg-purple-50 text-purple-600' },
        ].map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm space-y-4"
          >
            <div className={`w-12 h-12 ${metric.color} rounded-2xl flex items-center justify-center`}>
              <metric.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-zinc-500 text-sm font-medium">{metric.label}</div>
              <div className="text-3xl font-bold text-zinc-900">{metric.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Candidates per Job */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" /> Candidatos por Vaga
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.candidatosPorVaga}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Candidates Trend */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Tendência de Candidaturas
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.candidatosPorPeriodo}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interviews & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Interviews */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" /> Entrevistas Agendadas
            </h3>
            <Link to="/company/jobs" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              Ver todas
            </Link>
          </div>
          
          <div className="space-y-4">
            {interviews.length > 0 ? (
              interviews.map((interview: any) => (
                <div key={interview.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center border border-zinc-100 shadow-sm">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">{new Date(interview.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                      <span className="text-lg font-bold text-zinc-900 leading-none">{new Date(interview.date).getDate()}</span>
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900">{interview.candidateName}</div>
                      <div className="text-xs text-zinc-500">{interview.jobTitle}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-bold text-zinc-900">
                      <Clock className="w-3 h-3 text-emerald-600" /> {interview.time.substring(0, 5)}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Horário Brasília</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center space-y-2">
                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6 text-zinc-300" />
                </div>
                <p className="text-zinc-500 text-sm">Nenhuma entrevista agendada para os próximos dias.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-zinc-900">Ações Rápidas</h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Publicar Vaga', icon: PlusCircle, link: '/company/jobs/new', color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Ver Candidatos', icon: Users, link: '/company/jobs', color: 'bg-blue-50 text-blue-600' },
              { label: 'Agendar Entrevista', icon: Calendar, link: '/company/jobs', color: 'bg-purple-50 text-purple-600' },
              { label: 'Configurações', icon: Building2, link: '/company/settings', color: 'bg-zinc-50 text-zinc-600' },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.link}
                className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-zinc-900 text-sm">{action.label}</div>
                <ChevronRight className="w-4 h-4 text-zinc-300 ml-auto group-hover:text-emerald-600 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
