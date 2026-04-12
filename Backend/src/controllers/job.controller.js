// c:\Users\maels\Documents\Solve Edu\Backend\src\controllers\job.controller.js

import { supabase } from '../lib/supabase.js';
import { validationResult } from 'express-validator';
import { sanitizeRichText } from '../utils/sanitizer.js';
import asyncHandler from '../utils/asyncHandler.js';

export class JobController {
  
  /**
   * Cria uma nova vaga (Apenas Empresas)
   */
  static createJob = asyncHandler(async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const companyId = req.companyId;
      const { title, description, requirements, type, contract, salaryRange, location } = req.body;

      const { data: job, error } = await supabase
        .from('Job')
        .insert({
          companyId,
          title,
          description: sanitizeRichText(description),
          requirements: Array.isArray(requirements) ? requirements : [],
          type,
          contract,
          salaryRange,
          location
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ success: true, message: 'Vaga publicada com sucesso!', data: job });
  });

  /**
   * Lista todas as vagas com "Smart Matching" para estudantes.
   * Se for um estudante logado, calcula a % de match baseada nas skills.
   */
  static getJobs = asyncHandler(async (req, res) => {
      const { type, contract, search } = req.query;
      const studentId = req.studentId;

      let query = supabase
        .from('Job')
        .select('*, company:CompanyProfile(companyName, industry, user:User(avatar))')
        .eq('isActive', true)
        .order('createdAt', { ascending: false });

      if (type) query = query.eq('type', type);
      if (contract) query = query.eq('contract', contract);
      if (search) query = query.ilike('title', `%${search}%`);

      const { data: jobs, error } = await query;
      if (error) throw error;

      let enrichedJobs = jobs;

      // LÓGICA MODERNA: Calcular Match Score se for estudante
      if (studentId) {
        // 1. Buscar skills do estudante
        const { data: student } = await supabase
          .from('StudentProfile')
          .select('skills')
          .eq('id', studentId)
          .single();

        // Garantir que skills são únicas e minúsculas para um match preciso
        const studentSkills = [...new Set((student?.skills || []).map(s => s.toLowerCase().trim()))];

        // 2. Calcular afinidade para cada vaga
        enrichedJobs = jobs.map(job => {
          const reqs = (job.requirements || []).map(r => r.toLowerCase());
          if (reqs.length === 0) return { ...job, matchScore: 100 }; // Sem requisitos = 100% match

          const matches = reqs.filter(r => studentSkills.includes(r));
          const score = Math.round((matches.length / reqs.length) * 100);
          
          return { ...job, matchScore: score };
        });

        // Ordenar por maior match
        enrichedJobs.sort((a, b) => b.matchScore - a.matchScore);
      }

      res.json({ success: true, data: enrichedJobs });
  });

  /**
   * Candidatar-se a uma vaga
   */
  static applyToJob = asyncHandler(async (req, res) => {
      const { jobId } = req.params;
      const { coverLetter } = req.body;
      const studentId = req.studentId;

      // Verificar se já se candidatou
      const { data: existing } = await supabase
        .from('JobApplication')
        .select('id')
        .eq('jobId', jobId)
        .eq('studentId', studentId)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ success: false, message: 'Já se candidatou a esta vaga.' });
      }

      const { error } = await supabase
        .from('JobApplication')
        .insert({
          jobId,
          studentId,
          coverLetter,
          status: 'PENDING'
        });

      if (error) throw error;

      res.json({ success: true, message: 'Candidatura enviada com sucesso!' });
  });

  /**
   * Para Empresas: Ver candidatos de uma vaga
   * Traz as soluções aceites do aluno para a empresa ver o portfólio real.
   */
  static getJobCandidates = asyncHandler(async (req, res) => {
      const { jobId } = req.params;
      const companyId = req.companyId;

      // Verificar se a vaga pertence à empresa
      const { data: job } = await supabase.from('Job').select('companyId').eq('id', jobId).single();
      if (!job || job.companyId !== companyId) {
        return res.status(403).json({ success: false, message: 'Acesso negado.' });
      }

      const { data: applications, error } = await supabase
        .from('JobApplication')
        .select(`
          *,
          student:StudentProfile(
            id, 
            skills, 
            githubUrl, 
            linkedinUrl,
            user:User(name, email, avatar),
            solutions:Solution(id, title, status, problem:Problem(title))
          )
        `)
        .eq('jobId', jobId)
        .order('appliedAt', { ascending: false });

      if (error) throw error;

      // Filtrar apenas soluções aceites para mostrar no "Portfólio Validado"
      const candidates = applications.map(app => ({
        ...app,
        student: {
          ...app.student,
          validatedPortfolio: app.student.solutions.filter(s => s.status === 'ACCEPTED')
        }
      }));

      res.json({ success: true, data: candidates });
  });
}
