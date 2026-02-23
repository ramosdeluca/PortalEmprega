import { supabase } from './supabase';

export const api = {
  auth: {
    login: async (data: any) => {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      return authData;
    },
    register: async (data: any) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            cnpj: data.cnpj,
            whatsapp: data.whatsapp,
          }
        }
      });
      if (error) throw error;
      return authData;
    },
    signOut: () => supabase.auth.signOut(),
  },
  company: {
    getMe: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    subscribe: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from('companies')
        .update({ subscription_status: 'active' })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    updateMe: async (companyData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    uploadLogo: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      const { data, error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    },
    getDashboard: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Fetch metrics
      const { count: totalVagas } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', user.id);

      const { count: vagasAtivas } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', user.id)
        .eq('status', 'active');

      const { data: jobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', user.id);
      
      const jobIds = jobs?.map(j => j.id) || [];
      
      const { count: totalCandidatos } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .in('job_id', jobIds);

      // Charts data
      const { data: candidatosPorVaga } = await supabase
        .from('jobs')
        .select('title, candidates(count)')
        .eq('company_id', user.id);

      const formattedCandidatosPorVaga = candidatosPorVaga?.map(j => ({
        title: j.title,
        count: (j as any).candidates[0].count
      })) || [];

      // Upcoming interviews
      const { data: interviews } = await supabase
        .from('interviews')
        .select(`
          id,
          date,
          time,
          candidate:candidates (
            name,
            job:jobs (
              title
            )
          )
        `)
        .in('candidate_id', await (async () => {
          const { data: candidates } = await supabase
            .from('candidates')
            .select('id')
            .in('job_id', jobIds);
          return candidates?.map(c => c.id) || [];
        })())
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(5);

      // Trend data (last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const { data: candidatesTrend } = await supabase
        .from('candidates')
        .select('created_at')
        .in('job_id', jobIds)
        .gte('created_at', last7Days[0]);

      const trendMap = candidatesTrend?.reduce((acc: any, curr: any) => {
        const date = curr.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}) || {};

      const formattedTrend = last7Days.map(date => ({
        date: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        count: trendMap[date] || 0
      }));

      return {
        metrics: {
          totalVagas: totalVagas || 0,
          vagasAtivas: vagasAtivas || 0,
          totalCandidatos: totalCandidatos || 0,
        },
        charts: {
          candidatosPorVaga: formattedCandidatosPorVaga,
          candidatosPorPeriodo: formattedTrend
        },
        interviews: interviews?.map(i => ({
          id: i.id,
          date: i.date,
          time: i.time,
          candidateName: (i.candidate as any).name,
          jobTitle: (i.candidate as any).job.title
        })) || []
      };
    },
    getJobs: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    createJob: async (jobData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('jobs')
        .insert([{ ...jobData, company_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    updateJobStatus: async (id: number, status: string) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    getCandidates: async (jobId: number) => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    scheduleInterview: async (interviewData: any) => {
      const { data, error } = await supabase
        .from('interviews')
        .insert([interviewData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    getInterviewByCandidate: async (candidateId: number) => {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    updateInterview: async (id: number, interviewData: any) => {
      const { data, error } = await supabase
        .from('interviews')
        .update(interviewData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    deleteInterview: async (id: number) => {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },
  },
  jobs: {
    list: async (params: any = {}) => {
      let query = supabase
        .from('jobs')
        .select('*, companies(name, logo_url)')
        .eq('status', 'active');

      if (params.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }
      if (params.location) {
        query = query.ilike('location', `%${params.location}%`);
      }
      if (params.occupation) {
        query = query.ilike('cbo_name', `%${params.occupation}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      return data.map(job => ({
        ...job,
        company_name: (job.companies as any).name,
        company_logo: (job.companies as any).logo_url
      }));
    },
    get: async (id: string) => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(name, logo_url, whatsapp, email)')
        .eq('id', id)
        .single();
      if (error) throw error;
      
      return {
        ...data,
        company_name: (data.companies as any).name,
        company_logo: (data.companies as any).logo_url,
        company_whatsapp: (data.companies as any).whatsapp,
        company_email: (data.companies as any).email
      };
    },
    apply: async (jobId: string, formData: any, resumeFile?: File) => {
      // 1. Fetch job and company info for notification
      const job = await api.jobs.get(jobId);
      
      let resume_url = null;
      
      if (resumeFile) {
        try {
          const fileExt = resumeFile.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `resumes/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, resumeFile);

          if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            throw new Error(`Erro no upload do currículo: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(filePath);
          
          resume_url = publicUrl;
        } catch (err: any) {
          console.error('Resume upload failed:', err);
          throw err;
        }
      }

      // 2. Insert candidate into database
      const { error } = await supabase
        .from('candidates')
        .insert([{
          job_id: parseInt(jobId),
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
          resume_url
        }]);
      
      if (error) {
        console.error('Candidate Insert Error:', error);
        throw error;
      }

      // 3. Send email notification to company
      try {
        await fetch('/api/notify-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyEmail: job.company_email,
            companyName: job.company_name,
            jobTitle: job.title,
            candidateName: formData.name,
            candidateEmail: formData.email,
            candidatePhone: formData.phone,
            candidateMessage: formData.message
          })
        });
      } catch (notifyError) {
        console.error('Failed to send notification email:', notifyError);
        // Don't throw here, as the application was already saved
      }

      return { success: true };
    },
  },
  cbo: {
    search: (words: string) => fetch(`/api/cbo?words=${encodeURIComponent(words)}`).then(res => res.json()),
  }
};
