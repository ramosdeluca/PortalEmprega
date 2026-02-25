import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, FileText, Linkedin, Upload, CheckCircle, AlertCircle, Save, X } from 'lucide-react';
import { api } from '../services/api';

export default function CandidateDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [currentOccupation, setCurrentOccupation] = useState('');
    const [availability, setAvailability] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [uploadingResume, setUploadingResume] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await api.candidate.getMe();
            if (data) {
                setProfile(data);
                setName(data.name || '');
                setWhatsapp(data.whatsapp || '');
                setCurrentOccupation(data.current_occupation || '');
                setAvailability(data.availability || '');
                setLinkedin(data.linkedin || '');
                setAboutMe(data.about_me || '');
            }
        } catch (err) {
            console.error('Erro ao carregar perfil:', err);
            setError('Não foi possível carregar as informações do perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await api.candidate.updateMe({
                name,
                whatsapp,
                current_occupation: currentOccupation,
                availability,
                linkedin,
                about_me: aboutMe
            });
            setSuccess('Perfil atualizado com sucesso!');
            await loadProfile();
        } catch (err: any) {
            console.error('Erro ao atualizar:', err);
            setError(err.message || 'Erro ao atualizar perfil.');
        } finally {
            setSaving(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Apenas arquivos PDF são aceitos.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB
            setError('O arquivo deve ter no máximo 2MB.');
            return;
        }

        setUploadingResume(true);
        setError('');

        try {
            const updatedProfile = await api.candidate.uploadResume(file);
            setSuccess('Currículo atualizado com sucesso!');
            setProfile(updatedProfile); // Only update the profile object, leaving form edits intact
        } catch (err: any) {
            console.error('Erro ao enviar currículo:', err);
            setError(err.message || 'Erro ao enviar o arquivo.');
        } finally {
            setUploadingResume(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    if (loading) {
        return <div className="text-center py-20">Carregando painel...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Meu Currículo</h1>
                <p className="text-zinc-500 mt-2">Mantenha seu perfil atualizado para se destacar para as empresas.</p>
            </div>

            {(error || success) && (
                <div className={`p-4 rounded-2xl flex items-center justify-between shadow-sm ${error ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'}`}>
                    <div className="flex items-center gap-3">
                        {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        <span className="font-medium">{error || success}</span>
                    </div>
                    <button onClick={() => { setError(''); setSuccess(''); }}>
                        <X className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Painel Esquerdo: Info e CV */}
                <div className="md:col-span-1 space-y-6">
                    {/* Card Básico */}
                    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <h2 className="font-bold text-lg text-zinc-900">{profile?.name || 'Seu Nome'}</h2>
                            <p className="text-sm text-zinc-500">{profile?.email}</p>
                        </div>
                        <div className="pt-4 border-t border-zinc-100 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                <Briefcase className="w-4 h-4 text-emerald-600" />
                                <span>{profile?.current_occupation || 'Ocupação não informada'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                <Phone className="w-4 h-4 text-emerald-600" />
                                <span>{profile?.whatsapp || 'Sem contato'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Upload de Curriculo */}
                    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-zinc-900">Arquivo de Currículo</h3>
                        <p className="text-xs text-zinc-500">Envie seu currículo em PDF (Max. 2MB)</p>

                        {profile?.resume_url ? (
                            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                    <span className="text-sm font-medium text-zinc-700 truncate max-w-[120px]">Curriculo.pdf</span>
                                </div>
                                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-sm font-bold hover:underline">
                                    Ver
                                </a>
                            </div>
                        ) : (
                            <div className="p-4 bg-yellow-50 text-yellow-700 text-sm rounded-xl border border-yellow-200 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                Nenhum currículo enviado.
                            </div>
                        )}

                        <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors cursor-pointer text-sm">
                            {uploadingResume ? 'Enviando...' : <><Upload className="w-4 h-4" /> {profile?.resume_url ? 'Substituir PDF' : 'Enviar PDF'}</>}
                            <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={handleResumeUpload}
                                disabled={uploadingResume}
                            />
                        </label>
                    </div>
                </div>

                {/* Formulário Central */}
                <div className="md:col-span-2">
                    <form onSubmit={handleUpdateProfile} className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                        <h3 className="font-bold text-xl text-zinc-900 mb-6">Informações Profissionais</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">WhatsApp</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <input
                                        type="tel"
                                        required
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Ocupação Atual</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <input
                                        type="text"
                                        value={currentOccupation}
                                        onChange={(e) => setCurrentOccupation(e.target.value)}
                                        placeholder="Ex: Desenvolvedor Front-end"
                                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Disponibilidade</label>
                                <select
                                    value={availability}
                                    onChange={(e) => setAvailability(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Todos os dias">Todos os dias</option>
                                    <option value="Fins de semana">Fins de semana</option>
                                    <option value="Tempo integral">Tempo integral</option>
                                    <option value="Meio período">Meio período</option>
                                    <option value="Noturno">Noturno</option>
                                    <option value="Diurno">Diurno</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">Perfil do LinkedIn (Opcional)</label>
                            <div className="relative">
                                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="url"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    placeholder="https://linkedin.com/in/seuperfil"
                                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">Fale sobre você e sua experiência</label>
                            <textarea
                                value={aboutMe}
                                onChange={(e) => setAboutMe(e.target.value)}
                                rows={5}
                                placeholder="Resuma suas principais habilidades, experiências ou o que busca na carreira."
                                className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? 'Salvando...' : <><Save className="w-5 h-5" /> Salvar Perfil</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
