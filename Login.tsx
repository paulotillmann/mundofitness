import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { supabase } from './supabaseClient';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'forgot-success'>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Estado do Modal de Aviso Customizado
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info', onConfirm?: () => void) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  // Estados do Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Estados do Cadastro
  const [signUpName, setSignUpName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Estados de Esqueceu a Senha
  const [forgotEmail, setForgotEmail] = useState('');

  // Formatar Telefone automaticamente
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const clean = rawVal.replace(/\D/g, '');
    let formatted = clean;
    if (clean.length > 2) {
      formatted = `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    }
    if (clean.length > 7) {
      formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
    }
    setSignUpPhone(formatted);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        showAlert('Erro de Login', error.message, 'error');
        setIsLoading(false);
        return;
      }

      // Buscar se está aprovado
      const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('aprovado')
        .eq('id', data.user?.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        showAlert(
          'Perfil Não Encontrado',
          'Não encontramos o seu perfil de usuário no sistema. Se acabou de se cadastrar, aguarde a criação do perfil.',
          'error'
        );
        setIsLoading(false);
        return;
      }

      if (!profile.aprovado) {
        await supabase.auth.signOut();
        showAlert(
          'Acesso Pendente',
          'Sua conta foi cadastrada, mas ainda está pendente de aprovação pelo administrador. Entre em contato para liberar o acesso.',
          'info'
        );
        setIsLoading(false);
        return;
      }

      // Login bem sucedido
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      showAlert('Erro de Conexão', 'Ocorreu um erro ao conectar ao servidor.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirmPassword) {
      showAlert('Erro de Senha', 'As senhas digitadas não coincidem.', 'error');
      return;
    }
    if (!acceptTerms) {
      showAlert(
        'Termos Obrigatórios',
        'Você precisa aceitar os Termos de Serviço e a Política de Privacidade para prosseguir.',
        'info'
      );
      return;
    }
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            nome: signUpName,
            celular: signUpPhone,
          },
        },
      });

      if (error) {
        showAlert('Erro no Cadastro', error.message, 'error');
        setIsLoading(false);
        return;
      }

      showAlert(
        'Cadastro Realizado!',
        'Sua conta foi criada com sucesso e está sob análise do administrador. Você receberá permissão em breve.',
        'success',
        () => {
          setView('login');
          // Limpa os estados do cadastro
          setSignUpName('');
          setSignUpPhone('');
          setSignUpEmail('');
          setSignUpPassword('');
          setSignUpConfirmPassword('');
          setAcceptTerms(false);
        }
      );
    } catch (err: any) {
      console.error(err);
      showAlert('Erro no Cadastro', 'Ocorreu um erro ao cadastrar sua conta.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin,
      });

      if (error) {
        showAlert('Erro de Recuperação', error.message, 'error');
        setIsLoading(false);
        return;
      }

      setView('forgot-success');
    } catch (err: any) {
      console.error(err);
      showAlert('Erro de Conexão', 'Ocorreu um erro ao conectar ao servidor.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 h-screen overflow-hidden bg-[#F8FAFC] font-sans antialiased text-[#0F172A]">
      {/* LADO ESQUERDO: Formulários de Fluxo (Login, Cadastro, Recuperação) */}
      <div className="col-span-12 md:col-span-5 flex flex-col justify-between p-6 md:p-8 lg:p-10 bg-white shadow-xl z-10 h-full overflow-y-auto">
        <div className="w-full max-w-md mx-auto my-auto py-2">

          {/* Logo MundoFitness (Sempre no topo) */}
          <div className="flex items-center justify-center w-full mb-4">
            <div className="relative flex items-center justify-center w-[170px] h-[170px] rounded-full overflow-hidden border-2 border-brand-purple shadow-md">
              <img
                src="/import/logomundo.png"
                alt="MundoFitness Logo"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                    Entrar
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Seja bem-vindo de volta! Insira suas credenciais para acessar sua conta.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      E-mail
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemplo@gmail.com"
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all placeholder:text-gray-400 text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Senha */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      Senha
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full pl-9 pr-9 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all placeholder:text-gray-400 text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#64748B] hover:text-[#0F172A]"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Opções extras */}
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-gray-300 text-brand-purple focus:ring-brand-purple w-3.5 h-3.5"
                      />
                      <span className="text-[#64748B] select-none">Lembrar de mim</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-brand-purple hover:underline font-semibold"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>

                  {/* Botão Entrar */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-purple hover:bg-brand-purpleDark text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-brand-purple/20 transition-all active:scale-[0.98] mt-2 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Entrar'
                    )}
                  </button>
                </form>

                {/* Rodapé da tela de login */}
                <div className="text-center text-xs text-[#64748B] mt-1">
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setView('signup')}
                    className="text-brand-purple hover:underline font-semibold"
                  >
                    Cadastre-se
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-brand-purple hover:text-brand-purpleDark transition-all">
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="flex items-center text-[10px] font-bold uppercase tracking-wider gap-1"
                    >
                      <ArrowLeft size={14} /> Voltar ao Login
                    </button>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] mt-1">
                    Criar Conta
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Inscreva-se hoje para iniciar sua rotina saudável com a MundoFitness.
                  </p>
                </div>

                <form onSubmit={handleSignUpSubmit} className="space-y-2.5">
                  {/* Nome Completo */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all placeholder:text-gray-400 text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Telefone/Whatsapp */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      Telefone / Whatsapp
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                        <Phone size={16} />
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={15}
                        value={signUpPhone}
                        onChange={handlePhoneChange}
                        placeholder="(00) 00000-0000"
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all placeholder:text-gray-400 text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* E-mail */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      E-mail
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="exemplo@gmail.com"
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all placeholder:text-gray-400 text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Senha */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      Senha
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-9 pr-9 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all placeholder:text-gray-400 text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#64748B] hover:text-[#0F172A]"
                      >
                        {showSignUpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Senha */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      Confirmar Senha
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showSignUpConfirmPassword ? 'text' : 'password'}
                        required
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full pl-9 pr-9 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all placeholder:text-gray-400 text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#64748B] hover:text-[#0F172A]"
                      >
                        {showSignUpConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Termos de Uso */}
                  <div className="flex items-start space-x-1.5 text-xs font-semibold py-0.5">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="rounded border-gray-300 text-brand-purple focus:ring-brand-purple w-3.5 h-3.5 mt-0.5"
                    />
                    <label htmlFor="terms" className="text-[#64748B] select-none leading-relaxed text-[11px]">
                      Eu aceito os{' '}
                      <a href="#terms" className="text-brand-purple hover:underline font-semibold">
                        Termos
                      </a>{' '}
                      e a{' '}
                      <a href="#privacy" className="text-brand-purple hover:underline font-semibold">
                        Privacidade
                      </a>.
                    </label>
                  </div>

                  {/* Botão Cadastrar */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-purple hover:bg-brand-purpleDark text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-brand-purple/20 transition-all active:scale-[0.98] mt-1 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Cadastrar'
                    )}
                  </button>
                </form>

                {/* Rodapé da tela de cadastro */}
                <div className="text-center text-xs text-[#64748B] mt-1">
                  Já possui uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-brand-purple hover:underline font-semibold"
                  >
                    Entrar
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-brand-purple hover:text-brand-purpleDark transition-all">
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="flex items-center text-[10px] font-bold uppercase tracking-wider gap-1"
                    >
                      <ArrowLeft size={14} /> Voltar ao Login
                    </button>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] mt-1">
                    Recuperar Senha
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Insira o e-mail associado à sua conta e enviaremos um link para redefinir sua senha.
                  </p>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      E-mail
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="exemplo@gmail.com"
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all placeholder:text-gray-400 text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Botão Enviar */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-purple hover:bg-brand-purpleDark text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-brand-purple/20 transition-all active:scale-[0.98] mt-1 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Enviar Instruções'
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {view === 'forgot-success' && (
              <motion.div
                key="forgot-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 text-center"
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 bg-purple-50 text-brand-purple rounded-full flex items-center justify-center shadow-inner">
                    <CheckCircle2 size={32} className="text-brand-purple" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
                      E-mail Enviado!
                    </h2>
                    <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                      Enviamos um link com as instruções para redefinição de senha para{' '}
                      <span className="font-semibold text-[#0F172A]">{forgotEmail}</span>. Por favor, verifique sua caixa de entrada.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setForgotEmail('');
                  }}
                  className="w-full bg-brand-purple hover:bg-brand-purpleDark text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-brand-purple/20 transition-all active:scale-[0.98] mt-2"
                >
                  Voltar ao Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* LADO DIREITO: Quadro com a imagem de login sem cortes (quadro se ajusta à imagem) */}
      <div className="hidden md:flex md:col-span-7 h-screen items-center justify-center p-12 bg-white">
        <div className="rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.28)] overflow-hidden max-w-full max-h-[80vh] flex items-center justify-center">
          <img
            src="/import/imagem_login.png"
            alt="MundoFitness Login"
            className="max-w-full max-h-[80vh] object-contain rounded-[40px]"
          />
        </div>
      </div>

      {/* Modal de Avisos Customizado */}
      <AnimatePresence>
        {modal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModal({ ...modal, isOpen: false })}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            />

            {/* Modal Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-6 overflow-hidden z-10 border border-gray-100 flex flex-col items-center text-center space-y-4"
            >
              {/* Botão de Fechar */}
              <button
                type="button"
                onClick={() => setModal({ ...modal, isOpen: false })}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#0F172A] transition-colors"
              >
                <X size={18} />
              </button>

              {/* Ícone por Tipo */}
              <div className="flex items-center justify-center">
                {modal.type === 'success' && (
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                    <CheckCircle2 size={36} className="text-emerald-500" />
                  </div>
                )}
                {modal.type === 'error' && (
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
                    <XCircle size={36} className="text-rose-500" />
                  </div>
                )}
                {modal.type === 'info' && (
                  <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center shadow-inner">
                    <AlertCircle size={36} className="text-brand-blue" />
                  </div>
                )}
              </div>

              {/* Título e Texto */}
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#0F172A]">{modal.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{modal.message}</p>
              </div>

              {/* Botão de Ação */}
              <button
                type="button"
                onClick={() => {
                  const onConfirm = modal.onConfirm;
                  setModal({ ...modal, isOpen: false });
                  if (onConfirm) onConfirm();
                }}
                className={`w-full py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all active:scale-[0.98] ${modal.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10' :
                    modal.type === 'error' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10' :
                      'bg-brand-purple hover:bg-brand-purpleDark shadow-brand-purple/20'
                  }`}
              >
                Ok, entendi
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;

