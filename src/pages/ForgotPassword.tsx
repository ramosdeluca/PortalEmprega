import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { api } from '../services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            await api.auth.resetPasswordForEmail(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar e-mail. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-12 space-y-8">
            <Link to="/login" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium w-fit transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar para o Login
            </Link>

            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Esqueci a Senha</h1>
                <p className="text-zinc-500">Informe seu e-mail para receber um link de redefinição.</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 text-sm">
                            <CheckCircle className="w-5 h-5 shrink-0" />
                            <span>Pronto! Se o e-mail estiver cadastrado, você receberá um link seguro para redefinir sua senha em instantes. Verifique também sua caixa de spam.</span>
                        </div>
                        <Link
                            to="/login"
                            className="w-full block text-center bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg"
                        >
                            Voltar ao Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">E-mail Cadastrado</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    required
                                    type="email"
                                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : <><Send className="w-5 h-5" /> Enviar Link de Recuperação</>}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
