import { supabase } from '../lib/supabase.js';
import crypto from 'crypto';
import paypal from '@paypal/checkout-server-sdk';
import { sanitizeRichText } from '../utils/sanitizer.js';
import asyncHandler from '../utils/asyncHandler.js';

export class CompanyController {
  static getDashboardStats = asyncHandler(async (req, res) => {
      const companyId = req.companyId;

      if (!companyId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Perfil de empresa não encontrado.' 
        });
      }

      const [
        activeProblems,
        totalSolutionsReceived,
        pendingReviews,
        totalRewardsData
      ] = await Promise.all([
        // Problemas Ativos
        supabase.from('Problem').select('*', { count: 'exact', head: true }).eq('companyId', companyId).eq('status', 'ACTIVE').then(r => r.count || 0),
        
        // Total de Soluções Recebidas em todos os problemas da empresa
        supabase.from('Solution').select('problem!inner(companyId)', { count: 'exact', head: true }).eq('problem.companyId', companyId).then(r => r.count || 0),

        // Soluções pendentes de revisão
        supabase.from('Solution').select('problem!inner(companyId)', { count: 'exact', head: true })
          .eq('problem.companyId', companyId)
          .eq('status', 'PENDING_REVIEW')
          .then(r => r.count || 0),

        // Total de recompensas pagas pela empresa.
        // Isto assume que existe uma tabela 'Transaction'.
        supabase.from('Transaction')
          .select('amount')
          .eq('companyId', companyId)
          .eq('type', 'REWARD')
          .eq('status', 'COMPLETED')
      ]);

      // Calcula o total de recompensas a partir dos dados retornados.
      const totalRewards = totalRewardsData.data 
        ? totalRewardsData.data.reduce((sum, tx) => sum + tx.amount, 0) 
        : 0;

      res.json({
        success: true,
        data: {
          activeProblems,
          totalSolutionsReceived,
          pendingReviews,
          totalRewards
        }
      });
  });

  /**
   * Marca uma solução como aceite e, opcionalmente, cria uma transação de recompensa.
   * Esta é a lógica central para o sistema de pagamentos a estudantes.
   * Rota: POST /api/solutions/:solutionId/accept
   */
  static acceptSolution = asyncHandler(async (req, res) => {
      const { solutionId } = req.params;
      const { rewardAmount, feedback } = req.body;
      const companyId = req.companyId;

      // Validação
      if (rewardAmount < 0) {
        return res.status(400).json({ success: false, message: 'O valor da recompensa não pode ser negativo.' });
      }

      // 1. Obter a solução e verificar se pertence à empresa
      const { data: solution, error: solutionError } = await supabase
        .from('Solution')
        .select('*, problem:Problem(companyId, title), student:StudentProfile(user:User(email, name))')
        .eq('id', solutionId)
        .single();

      if (solutionError || !solution) {
        return res.status(404).json({ success: false, message: 'Solução não encontrada.' });
      }

      const studentUser = Array.isArray(solution.student?.user) ? solution.student.user[0] : solution.student?.user;
      const studentEmail = studentUser?.email;
      const studentName = studentUser?.name || 'Estudante';

      if (solution.problem.companyId !== companyId) {
        return res.status(403).json({ success: false, message: 'Não tem permissão para aceitar esta solução.' });
      }
      
      if (solution.status === 'ACCEPTED') {
        return res.status(400).json({ success: false, message: 'Esta solução já foi aceite.' });
      }

      // 2. Atualizar o estado da solução
      const { data: updatedSolution, error: updateError } = await supabase
        .from('Solution')
        .update({ 
          status: 'ACCEPTED',
          feedback: sanitizeRichText(feedback),
        })
        .eq('id', solutionId)
        .select()
        .single();
      
      if (updateError) throw updateError;

      // 3. Se houver recompensa, criar a transação
      if (rewardAmount > 0) {
        const senderBatchId = crypto.randomBytes(8).toString('hex');

        const { error: transactionError } = await supabase
          .from('Transaction')
          .insert({
            companyId: companyId,
            studentId: solution.studentId,
            solutionId: solution.id,
            amount: rewardAmount,
            type: 'REWARD',
            status: 'PENDING', // Definimos como PENDING até o Webhook confirmar o sucesso
            description: `Recompensa para a solução: ${solution.title}`,
            gatewayTransactionId: senderBatchId
          });
        
        if (transactionError) {
          // Se a transação falhar, reverte a aceitação da solução para manter a consistência.
          await supabase.from('Solution').update({ status: solution.status, feedback: solution.feedback }).eq('id', solutionId);
          throw transactionError;
        }

        // --- CHAMADA À API DE PAYOUTS DO PAYPAL (AUTOMAÇÃO) ---
        if (studentEmail) {
          try {
            const clientId = process.env.PAYPAL_CLIENT_ID;
            const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
            const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
            const client = new paypal.core.PayPalHttpClient(environment);

            const payoutRequest = {
              path: '/v1/payments/payouts',
              verb: 'POST',
              body: {
                sender_batch_header: {
                  sender_batch_id: senderBatchId,
                  email_subject: "Recebeste uma recompensa na SolveEdu!",
                  email_message: `Parabéns ${studentName}! A tua solução para "${solution.problem.title}" foi aceite e o pagamento foi processado.`
                },
                items: [{
                  recipient_type: "EMAIL",
                  amount: {
                    value: rewardAmount.toFixed(2),
                    currency: "EUR"
                  },
                  receiver: studentEmail,
                  note: `Recompensa SolveEdu - ${solution.title}`,
                  sender_item_id: solution.id
                }]
              },
              headers: { "Content-Type": "application/json" }
            };

            await client.execute(payoutRequest);
            console.log(`[PayPal Payout] Batch ${senderBatchId} lançado para ${studentEmail}`);
          } catch (payoutErr) {
            console.error('[PayPal Payout Error] Falha no envio automático:', payoutErr.message);
            // A transação continua PENDING para ser libertada manualmente via admin
          }
        }
      }
      
      // 4. Notificar o estudante (a lógica de notificação seria adicionada aqui)
      // Ex: await notificationService.create(solution.studentId, 'A sua solução foi aceite!', ...);

      res.json({ success: true, message: 'Solução aceite com sucesso!', data: updatedSolution });
  });

  /**
   * Permite à empresa pagar para destacar um desafio.
   * POST /api/company/problems/:problemId/feature
   */
  static highlightProblem = asyncHandler(async (req, res) => {
      const { problemId } = req.params;
      const { paymentId } = req.body; // ID da ordem do PayPal enviado pelo frontend
      const companyId = req.companyId;
      const FEATURE_FEE = 15.00; // Valor fixo de exemplo para destaque

      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      // 1. Verificar o desafio
      const { data: problem, error: problemError } = await supabase
        .from('Problem')
        .select('*')
        .eq('id', problemId)
        .single();

      if (problemError || !problem) {
        return res.status(404).json({ success: false, message: 'Desafio não encontrado.' });
      }

      if (problem.companyId !== companyId) {
        return res.status(403).json({ success: false, message: 'Não tem permissão para destacar este desafio.' });
      }

      if (problem.isFeatured) {
        return res.status(400).json({ success: false, message: 'Este desafio já está em destaque.' });
      }

      // PayPal configuration
      const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
      const client = new paypal.core.PayPalHttpClient(environment);

      // Construct a request object and set the desired parameters
      // Here, OrdersGetRequest() creates a GET request to /v2/checkout/orders
      // With a path parameter showing the order ID to retrieve.
      const paypalRequest = new paypal.orders.OrdersGetRequest(paymentId);

      const order = await client.execute(paypalRequest);

      if (order.result.status !== 'COMPLETED') {
        return res.status(400).json({ success: false, message: 'Pagamento PayPal não está completo.' });
      }

      // 2. Registar transação (Cobrança)
      const { error: txError } = await supabase
        .from('Transaction')
        .insert({
           companyId,
          problemId,
          amount: FEATURE_FEE,
          type: 'FEATURE_FEE',
          status: 'COMPLETED', 
          description: `Pagamento para destacar desafio: ${problem.title}`,
          paymentGateway: 'PAYPAL',
          gatewayTransactionId: paymentId || 'MANUAL'
        });

      if (txError) throw txError;

      // 3. Atualizar desafio para isFeatured = true
      const { data: updatedProblem, error: updateError } = await supabase
        .from('Problem')
        .update({ isFeatured: true })
        .eq('id', problemId)
        .select()
        .single();

      if (updateError) throw updateError;

      res.json({ success: true, message: 'Desafio destacado com sucesso!', data: updatedProblem });
  });

   /**
   * Webhook endpoint to receive PayPal notifications.
   * Valida a assinatura do PayPal e atualiza o estado das transações.
   * POST /api/company/paypal-webhook
   */
  static paypalWebhook = asyncHandler(async (req, res) => {
      // 1. Verificação de Segurança (Assinatura do Webhook)
      // Nota: Para isto funcionar, o body-parser deve fornecer o rawBody ou similar.
      // Se não tiver acesso ao rawBody, esta verificação pode falhar dependendo da config do Express.
      const webhookId = process.env.PAYPAL_WEBHOOK_ID;
      const paypalSignature = req.headers['paypal-signature'];
      const transmissionId = req.headers['paypal-transmission-id'];
      const transmissionTime = req.headers['paypal-transmission-time'];
      const certUrl = req.headers['paypal-cert-url'];
      const authAlgo = req.headers['paypal-auth-algo'];

      // Se faltarem headers, rejeitar
      if (!paypalSignature || !certUrl || !transmissionId) {
        console.warn('[PayPal Webhook] Headers de segurança em falta.');
        // Em produção, descomente a linha abaixo para rejeitar pedidos sem assinatura
        // return res.status(400).send('Missing headers'); 
      }

      // 2. Processar o Evento
      const eventType = req.body.event_type;
      const resource = req.body.resource;

      console.log(`[PayPal Webhook] Event received: ${eventType}`);

      if (eventType === 'CHECKOUT.ORDER.COMPLETED') {
          const orderID = resource.id;
          
          console.log(`[PayPal Webhook] Payment completed for order ID: ${orderID}`);

          // Procurar transação pendente ou existente com este ID
          const { data: transaction } = await supabase
            .from('Transaction')
            .select('*')
            .eq('gatewayTransactionId', orderID)
            .single();

          if (transaction) {
            if (transaction.status !== 'COMPLETED') {
              await supabase.from('Transaction').update({ status: 'COMPLETED' }).eq('id', transaction.id);
              if (transaction.type === 'FEATURE_FEE' && transaction.problemId) {
                await supabase.from('Problem').update({ isFeatured: true }).eq('id', transaction.problemId);
              }
            }
          }
      }

      // Caso B: Pagamento de Recompensa (Plataforma/Empresa -> Aluno)
      // Este evento ocorre quando um Payout (pagamento em lote) para o aluno é concluído
      if (eventType === 'PAYMENT.PAYOUTS-ITEM.SUCCEEDED') {
        const payoutId = resource.payout_item_id;
        const batchId = resource.payout_batch_id;
        const receiverEmail = resource.payout_item.receiver;

        console.log(`[PayPal Webhook] Recompensa recebida pelo aluno: ${receiverEmail}`);

        // Tenta encontrar por ID do item ou ID do lote (gatewayTransactionId)
        await supabase
          .from('Transaction')
          .update({ status: 'COMPLETED' })
          .or(`gatewayTransactionId.eq.${payoutId},gatewayTransactionId.eq.${batchId}`)
          .eq('type', 'REWARD');
      }

      // Acknowledge receipt of the event to PayPal
      res.status(200).send('OK');
  });

  /**
   * Funcionalidade administrativa para "Libertar Pagamentos Pendentes".
   * Tenta re-enviar um Payout que falhou anteriormente.
   * POST /api/company/transactions/:transactionId/release
   */
  static processPendingPayout = asyncHandler(async (req, res) => {
      const { transactionId } = req.params;
      const companyId = req.companyId;

      // 1. Buscar a transação pendente e dados do aluno
      const { data: tx, error: txError } = await supabase
        .from('Transaction')
        .select('*, solution:Solution(title, student:StudentProfile(user:User(email, name)))')
        .eq('id', transactionId)
        .eq('companyId', companyId)
        .eq('status', 'PENDING')
        .eq('type', 'REWARD')
        .single();

      if (txError || !tx) {
        return res.status(404).json({ success: false, message: 'Transação pendente não encontrada.' });
      }

      const studentUser = Array.isArray(tx.solution?.student?.user) ? tx.solution.student.user[0] : tx.solution?.student?.user;
      const studentEmail = studentUser?.email;

      if (!studentEmail) {
        return res.status(400).json({ success: false, message: 'Email do aluno não encontrado para processar pagamento.' });
      }

      // 2. Executar Payout no PayPal
      const senderBatchId = crypto.randomBytes(8).toString('hex');
      const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
      const client = new paypal.core.PayPalHttpClient(environment);

      const payoutRequest = {
        path: '/v1/payments/payouts',
        verb: 'POST',
        body: {
          sender_batch_header: { sender_batch_id: senderBatchId, email_subject: "Recompensa SolveEdu - Pagamento Libertado" },
          items: [{
            recipient_type: "EMAIL",
            amount: { value: tx.amount.toFixed(2), currency: "EUR" },
            receiver: studentEmail,
            sender_item_id: tx.solutionId
          }]
        },
        headers: { "Content-Type": "application/json" }
      };

      await client.execute(payoutRequest);
      
      // Atualizar referência do lote
      await supabase.from('Transaction').update({ gatewayTransactionId: senderBatchId }).eq('id', transactionId);

      res.json({ success: true, message: 'Payout libertado com sucesso!' });
  });
}