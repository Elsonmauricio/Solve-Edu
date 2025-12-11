import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendWelcomeEmail(to, name) {
    try {
      const mailOptions = {
        from: `"SolveEdu" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Bem-vindo à SolveEdu! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Bem-vindo(a), ${name}! 🎓</h1>
            <p>Estamos muito felizes por se juntar à comunidade SolveEdu.</p>
            <p>Na nossa plataforma, poderá:</p>
            <ul>
              <li>🔍 Encontrar desafios reais de empresas</li>
              <li>💡 Submeter soluções inovadoras</li>
              <li>🏆 Ganhar recompensas e reconhecimento</li>
              <li>🤝 Conectar-se com empresas e outros estudantes</li>
            </ul>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3>Próximos Passos:</h3>
              <ol>
                <li>Complete o seu perfil</li>
                <li>Explore os desafios disponíveis</li>
                <li>Comece a submeter soluções</li>
              </ol>
            </div>
            <p>Se tiver alguma dúvida, não hesite em contactar-nos.</p>
            <p>Boa sorte nos seus projetos! 🚀</p>
            <p><strong>Equipa SolveEdu</strong></p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  async sendSolutionSubmittedEmail(to, studentName, problemTitle, solutionId) {
    try {
      const mailOptions = {
        from: `"SolveEdu" <${process.env.SMTP_USER}>`,
        to,
        subject: '🎯 Nova Solução Submetida',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Nova Solução Recebida!</h1>
            <p>Olá,</p>
            <p>O estudante <strong>${studentName}</strong> submeteu uma solução para o seu desafio:</p>
            <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0;">${problemTitle}</h3>
            </div>
            <p>A solução está agora em análise. Pode avaliá-la através do seu dashboard.</p>
            <a href="${process.env.FRONTEND_URL}/company-dashboard/solutions/${solutionId}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">
              Ver Solução
            </a>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Esta é uma notificação automática da plataforma SolveEdu.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Solution submitted email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending solution submitted email:', error);
      return false;
    }
  }

  async sendSolutionReviewedEmail(to, studentName, problemTitle, status, feedback) {
    try {
      const statusMessages = {
        ACCEPTED: '🎉 A sua solução foi aceite!',
        REJECTED: '📝 A sua solução precisa de revisão',
        NEEDS_REVISION: '🔧 A sua solução precisa de ajustes',
      };

      const mailOptions = {
        from: `"SolveEdu" <${process.env.SMTP_USER}>`,
        to,
        subject: statusMessages[status] || 'Solução Avaliada',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: ${status === 'ACCEPTED' ? '#10b981' : '#ef4444'}">
              ${statusMessages[status]}
            </h1>
            <p>Olá <strong>${studentName}</strong>,</p>
            <p>A sua solução para o desafio foi avaliada:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0;">${problemTitle}</h3>
              <p style="margin: 10px 0 0 0;"><strong>Status:</strong> ${status}</p>
            </div>
            ${feedback ? `
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0;">Feedback da Empresa:</h4>
                <p style="margin: 0;">${feedback}</p>
              </div>
            ` : ''}
            ${status !== 'ACCEPTED' ? `
              <p>Recomendamos que reveja o feedback e submeta uma versão atualizada da sua solução.</p>
            ` : `
              <p>Parabéns! A sua solução foi selecionada. A empresa entrará em contacto consigo em breve.</p>
            `}
            <a href="${process.env.FRONTEND_URL}/student-dashboard/solutions" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">
              Ver Minhas Soluções
            </a>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Esta é uma notificação automática da plataforma SolveEdu.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Solution reviewed email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending solution reviewed email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(to, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"SolveEdu" <${process.env.SMTP_USER}>`,
        to,
        subject: '🔐 Redefinir a sua palavra-passe',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Redefinir Palavra-passe</h1>
            <p>Recebemos um pedido para redefinir a sua palavra-passe.</p>
            <p>Clique no botão abaixo para criar uma nova palavra-passe:</p>
            <a href="${resetUrl}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">
              Redefinir Palavra-passe
            </a>
            <p>Este link expira em 1 hora.</p>
            <p>Se não solicitou a redefinição da palavra-passe, ignore este email.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p><strong>Nota de segurança:</strong> Nunca partilhe este link com ninguém.</p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  async sendProblemExpiringEmail(to, problemTitle, daysLeft) {
    try {
      const mailOptions = {
        from: `"SolveEdu" <${process.env.SMTP_USER}>`,
        to,
        subject: `⏰ Desafio a expirar em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">Desafio a Expirar</h1>
            <p>O prazo do seu desafio está a chegar ao fim:</p>
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0;">${problemTitle}</h3>
              <p style="margin: 10px 0 0 0;"><strong>Dias restantes:</strong> ${daysLeft}</p>
            </div>
            <p>Recomendamos que:</p>
            <ul>
              <li>Revise as soluções submetidas</li>
              <li>Selecione a melhor solução</li>
              <li>Entre em contacto com os estudantes selecionados</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/company-dashboard/problems" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">
              Gerir Desafios
            </a>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Esta é uma notificação automática da plataforma SolveEdu.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Problem expiring email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending problem expiring email:', error);
      return false;
    }
  }
}

export default new EmailService();