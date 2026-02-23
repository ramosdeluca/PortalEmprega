import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Phone, Globe, Save, ArrowLeft, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    logo_url: '',
    email: '', // Read-only
    cnpj: '',  // Read-only
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await api.company.getMe();
        if (data) {
          setFormData({
            name: data.name || '',
            whatsapp: data.whatsapp || '',
            logo_url: data.logo_url || '',
            email: data.email || '',
            cnpj: data.cnpj || '',
          });
        }
      } catch (err) {
        setError('Erro ao carregar dados da empresa.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2MB.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const data = await api.company.uploadLogo(file);
      setFormData(prev => ({ ...prev, logo_url: data.logo_url }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('Erro ao fazer upload da logo. Verifique se o bucket "logos" existe.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { email, cnpj, logo_url, ...updateData } = formData;
      await api.company.updateMe(updateData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar dados.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">Carregando configurações...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button 
        onClick={() => navigate('/company/dashboard')} 
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para o Painel
      </button>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Configurações da Empresa</h1>
          <p className="text-zinc-500">Atualize as informações públicas da sua empresa.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
            <Save className="w-5 h-5 flex-shrink-0" />
            Dados atualizados com sucesso!
          </div>
        )}

        <div className="space-y-6">
          {/* Logo Upload Section */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-zinc-700">Logo da Empresa</label>
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center border border-zinc-100 overflow-hidden shadow-sm relative group">
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-300" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-3 text-center md:text-left">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-zinc-900">Alterar imagem da logo</p>
                  <p className="text-xs text-zinc-500">PNG, JPG ou SVG. Máximo de 2MB.</p>
                </div>
                
                <label className="inline-flex items-center gap-2 bg-white text-zinc-900 px-4 py-2 rounded-xl text-sm font-bold border border-zinc-200 hover:bg-zinc-50 transition-all cursor-pointer shadow-sm">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Nome da Empresa</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  required
                  type="text"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Nome da sua empresa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">E-mail (Não alterável)</label>
                <input
                  disabled
                  type="email"
                  className="w-full px-4 py-3 bg-zinc-100 border border-zinc-200 rounded-2xl text-zinc-500 cursor-not-allowed outline-none"
                  value={formData.email}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">CNPJ (Não alterável)</label>
                <input
                  disabled
                  type="text"
                  className="w-full px-4 py-3 bg-zinc-100 border border-zinc-200 rounded-2xl text-zinc-500 cursor-not-allowed outline-none"
                  value={formData.cnpj}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">WhatsApp de Contato</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  required
                  type="tel"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="(00) 00000-0000"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              {/* Logo URL input removed as we use upload now */}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : <><Save className="w-5 h-5" /> Salvar Alterações</>}
          </button>
        </form>
      </div>
    </div>
  </div>
);
}
