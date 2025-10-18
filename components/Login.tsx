
import React, { useState, useEffect, useRef } from 'react';
import { LogoIcon, GoogleIcon } from './Icons';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// Em um aplicativo real, estes seriam carregados a partir de variáveis de ambiente.
// Substitua estes espaços reservados pelos seus IDs de cliente reais.
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID';

declare global {
    interface Window {
        google: any;
        fbAsyncInit: () => void;
        FB: any;
    }
}

interface LoginProps {
  onAuth: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onAuth }) => {
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'main' | 'login' | 'register' | 'guest'>('main');
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const isGoogleConfigured = GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
  const isFacebookConfigured = FACEBOOK_APP_ID !== 'YOUR_FACEBOOK_APP_ID';

  useEffect(() => {
    // Facebook SDK Initialization
    if (isFacebookConfigured) {
        window.fbAsyncInit = function() {
          window.FB.init({
            appId      : FACEBOOK_APP_ID,
            cookie     : true,
            xfml      : true,
            version    : 'v19.0'
          });
        };
    }

    // Google Sign-In Initialization
    if (isGoogleConfigured && window.google) {
        try {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCallbackResponse,
            });
            if (googleButtonRef.current) {
              window.google.accounts.id.renderButton(
                  googleButtonRef.current,
                  { theme: "outline", size: "large", text: "continue_with", shape: "rectangular", logo_alignment: "left" }
              );
            }
        } catch (e) {
          console.error("Error initializing Google Sign-In", e);
        }
    }
  }, [isGoogleConfigured, isFacebookConfigured]);

  const handleGoogleCallbackResponse = (response: any) => {
    try {
        const userObject = JSON.parse(atob(response.credential.split('.')[1]));
        const user: User = {
            id: `google-${userObject.sub}`,
            name: userObject.name,
            authType: 'registered',
            avatarUrl: userObject.picture,
        };
        onAuth(user);
    } catch (e) {
        console.error("Error decoding Google token", e);
        setError("Invalid response from Google.");
    }
  };
  
  const handleFacebookLogin = () => {
    if (!window.FB) {
        setError("Facebook SDK not loaded. Please try again.");
        return;
    }
    window.FB.login(function(response: any) {
        if (response.authResponse) {
            window.FB.api('/me', { fields: 'name,picture.type(large)' }, function(apiResponse: any) {
                if (apiResponse && !apiResponse.error) {
                  const user: User = {
                      id: `facebook-${apiResponse.id}`,
                      name: apiResponse.name,
                      authType: 'registered',
                      avatarUrl: apiResponse.picture.data.url,
                  };
                  onAuth(user);
                } else {
                   setError(apiResponse.error?.message || 'Failed to get user info from Facebook.');
                }
            });
        } else {
            setError('Facebook login was cancelled or failed.');
        }
    }, {scope: 'public_profile'});
  };

  const handleUnconfiguredClick = (provider: 'Google' | 'Facebook') => {
      if (provider === 'Google') {
        setError("O Login com Google não está configurado. Substitua o GOOGLE_CLIENT_ID em components/Login.tsx pelo seu ID de cliente real.");
      } else {
        setError("O Login com Facebook não está configurado. Substitua o FACEBOOK_APP_ID em components/Login.tsx pelo seu ID de aplicativo real.");
      }
  }

  const handleLocalAuth = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (name.trim().length < 3 || password.length < 6) {
          setError(t('loginError', 'Username must be > 2 chars, password > 5 chars.'));
          return;
      }
      
      let usersInDb: User[];
      try {
        usersInDb = JSON.parse(localStorage.getItem('wheresup_users') || '[]');
      } catch (err) {
        console.error("Failed to parse user database from localStorage", err);
        setError('There was an issue accessing user data. Please try clearing your site data.');
        return;
      }
      
      if (mode === 'login') {
          // In a real app, we'd hash the password and compare.
          // For this mock, we find the user by name and assume the password is correct,
          // as we are not storing passwords anymore.
          const foundUser = usersInDb.find(u => u.name === name.trim());
          if (foundUser) {
              // Ensure password is not passed to the main app state, even if it exists from old logic
              const { password, ...userToAuth } = foundUser;
              onAuth(userToAuth as User);
          } else {
              setError(t('credentialsError', 'Invalid credentials.'));
          }
      } else if (mode === 'register') {
          if (usersInDb.some(u => u.name === name.trim())) {
              setError(t('usernameTakenError', 'Username is already taken.'));
              return;
          }
          // In a real app, you would hash and salt the password here.
          // For this mock app, we avoid storing it entirely for better security.
          const newUser: User = {
              id: `local-${Date.now()}`,
              name: name.trim(),
              authType: 'registered'
          };
          const updatedUsers = [...usersInDb, newUser];
          localStorage.setItem('wheresup_users', JSON.stringify(updatedUsers));
          // Since newUser doesn't have a password, we can pass it directly.
          onAuth(newUser);
      }
  }

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError(t('guestNameError', 'Guest name must be at least 3 characters.'));
      return;
    }
    onAuth({ id: `guest-${Date.now()}`, name: name.trim(), authType: 'guest' });
  }

  const renderMain = () => (
      <div className="space-y-4 animate-fadeIn">
          {isGoogleConfigured ? (
              <div ref={googleButtonRef} className="flex justify-center"></div>
          ) : (
              <button 
                  onClick={() => handleUnconfiguredClick('Google')} 
                  className="w-full bg-white text-gray-700 font-semibold py-2.5 px-4 rounded-md flex items-center justify-center gap-3 h-[40px] border border-gray-300 opacity-60 cursor-pointer"
                  title="Desenvolvedor: Adicione seu Google Client ID para habilitar este recurso.">
                  <GoogleIcon className="w-5 h-5" />
                  <span className="text-sm">{t('continueWithGoogle', 'Continue with Google')}</span>
              </button>
          )}

          <button 
              onClick={isFacebookConfigured ? handleFacebookLogin : () => handleUnconfiguredClick('Facebook')} 
              className={`w-full bg-[#1877F2] text-white font-bold py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-3 h-[40px] ${!isFacebookConfigured ? 'opacity-60 cursor-pointer' : 'hover:bg-opacity-90'}`}
              title={!isFacebookConfigured ? "Desenvolvedor: Adicione seu Facebook App ID para habilitar este recurso." : undefined}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-.86 0-1 .43-1 1v2h2.5l-.5 3H15v6.8c4.56-.93 8-4.96 8-9.8z"></path></svg>
              <span className="text-sm">{t('continueWithFacebook', 'Continue with Facebook')}</span>
          </button>
          
          <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-brand-tertiary"></div>
              <span className="flex-shrink mx-4 text-brand-text-secondary text-sm">{t('or', 'OR')}</span>
              <div className="flex-grow border-t border-brand-tertiary"></div>
          </div>
          
          <button onClick={() => setMode('login')} className="w-full text-brand-neon hover:text-opacity-80 font-semibold py-2 px-4 rounded-md transition-colors text-sm border border-brand-neon">
              {t('signInWithEmail', 'Sign in with Email')}
          </button>
          
          <div className="text-center text-sm">
            <span className="text-brand-text-secondary">{t('noAccount', "Don't have an account?")} </span>
            <button onClick={() => setMode('register')} className="font-semibold text-brand-neon hover:underline">{t('register', 'Register')}</button>
          </div>

          <div className="text-center pt-2">
            <button onClick={() => setMode('guest')} className="text-brand-text-secondary hover:text-white font-semibold py-2 px-4 transition-colors text-sm">
                {t('continueAsGuest', 'Continue as a Guest')}
            </button>
          </div>
      </div>
  );
  
  const renderForm = (isLogin: boolean) => (
      <form onSubmit={handleLocalAuth} className="space-y-4 animate-fadeIn">
          <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('username', 'Username')}
              className="w-full bg-brand-tertiary border border-brand-tertiary/50 rounded-md p-3 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none transition"
          />
          <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password', 'Password')}
              className="w-full bg-brand-tertiary border border-brand-tertiary/50 rounded-md p-3 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none transition"
          />
          <button type="submit" className="w-full bg-brand-neon hover:bg-opacity-90 text-brand-primary font-bold py-2.5 px-4 rounded-md transition-colors">
              {isLogin ? t('signIn', 'Sign In') : t('createAccount', 'Create Account')}
          </button>
          <button type="button" onClick={() => { setMode('main'); setError('') }} className="w-full text-center text-sm text-brand-text-secondary hover:text-white mt-1">
              {t('back', 'Back')}
          </button>
      </form>
  );

  const renderGuestForm = () => (
    <form onSubmit={handleGuestLogin} className="space-y-3 pt-2 animate-fadeIn">
       <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('guestNamePlaceholder', 'Choose a guest name...')}
          className="w-full bg-brand-tertiary border border-brand-tertiary/50 rounded-md p-3 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none transition"
       />
       <button type="submit" className="w-full bg-brand-tertiary hover:bg-opacity-80 text-white font-bold py-2.5 px-4 rounded-md transition-colors">{t('joinAsGuest', 'Join as Guest')}</button>
       <button type="button" onClick={() => { setMode('main'); setError('') }} className="w-full text-center text-sm text-brand-text-secondary hover:text-white mt-1">
          {t('back', 'Back')}
       </button>
    </form>
  )

  const renderContent = () => {
      switch(mode) {
          case 'login': return renderForm(true);
          case 'register': return renderForm(false);
          case 'guest': return renderGuestForm();
          case 'main':
          default:
              return renderMain();
      }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-primary animate-fadeIn p-4">
      <div className="w-full max-w-sm mx-auto bg-brand-secondary p-8 rounded-2xl shadow-lg shadow-brand-neon/10 border border-brand-tertiary">
        <div className="flex flex-col items-center mb-6">
          <LogoIcon className="w-12 h-12 text-brand-neon" />
          <h1 className="text-3xl font-bold tracking-wider text-brand-text mt-4">
            Where's Up?
          </h1>
          <p className="text-brand-text-secondary mt-1">
            {t('loginSlogan', 'Ephemeral events start here.')}
          </p>
        </div>
        
        {renderContent()}

        {error && <p className="text-red-400 text-sm text-center pt-4">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
