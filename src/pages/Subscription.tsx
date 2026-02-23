import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShieldCheck, Zap, CreditCard, ArrowRight, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';

export default function Subscription() {
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.company.getMe().then(setCompany).catch(() => navigate('/login'));
  }, [navigate]);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await api.company.subscribe();
      navigate('/company/dashboard');
    } catch (error) {
      alert('Erro ao processar assinatura.');
    } finally {
      setLoading(false);
    }
  };

  if (!company) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">Escolha seu plano</h1>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
          Para começar a publicar vagas e gerenciar candidatos, você precisa de uma assinatura ativa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Plan Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-10 rounded-[3rem] border-2 border-emerald-600 shadow-xl shadow-emerald-100 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-emerald-600 text-white px-6 py-2 rounded-bl-3xl text-xs font-bold uppercase tracking-widest">
            Mais Popular
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-zinc-900">Plano Mensal Pro</h3>
              <p className="text-zinc-500">Tudo o que sua empresa precisa para contratar.</p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-zinc-900">R$ 149</span>
              <span className="text-zinc-500 font-medium">/mês</span>
            </div>

            <ul className="space-y-4">
              {[
                'Vagas ilimitadas',
                'Visualização de currículos',
                'Dashboard analítico completo',
                'Busca inteligente de ocupações',
                'Gestão de entrevistas',
                'Suporte prioritário',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-600 font-medium">
                  <div className="bg-emerald-100 p-1 rounded-full">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Processando...' : <><Zap className="w-5 h-5" /> Assinar Agora</>}
            </button>
            
            <p className="text-center text-xs text-zinc-400">
              Cancele a qualquer momento. Sem fidelidade.
            </p>
          </div>
        </motion.div>

        {/* Benefits List */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-zinc-900">Por que assinar?</h3>
            <div className="space-y-6">
              {[
                {
                  title: 'Contratação Ágil',
                  desc: 'Publique vagas em segundos e receba candidatos qualificados imediatamente.',
                  icon: Zap,
                },
                {
                  title: 'Gestão Centralizada',
                  desc: 'Acompanhe todo o funil de recrutamento em um único lugar.',
                  icon: Building2,
                },
                {
                  title: 'Segurança de Dados',
                  desc: 'Seus dados e currículos dos candidatos protegidos com criptografia.',
                  icon: ShieldCheck,
                },
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center shrink-0">
                    <benefit.icon className="w-6 h-6 text-zinc-900" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-zinc-900">{benefit.title}</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-zinc-400" />
              <span className="text-sm font-bold text-zinc-900">Pagamento Seguro</span>
            </div>
            <p className="text-xs text-zinc-500">
              Utilizamos tecnologia de ponta para garantir que suas transações sejam 100% seguras. 
              Aceitamos todos os cartões e PIX.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
