import { useState } from 'react';
import type { FormEvent } from 'react';

// Image asset from Figma (valid for 7 days)
const dividerLine = "https://www.figma.com/api/mcp/asset/1fefc4bf-2b1e-4428-aa3f-c60475cd9a3d";

interface LoginFormProps {
  className?: string;
  onSubmit?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
}

export default function LoginForm({ 
  className,
  onSubmit,
  onForgotPassword,
  onCreateAccount
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(email, password);
  };

  return (
    <div 
      style={{ padding: '27px 62px' }}
      className={`${className || ''} bg-[rgba(242,217,243,0.26)] border border-[rgba(20,0,21,0.37)] flex flex-col gap-2.5 items-center justify-center rounded-[17px] w-[359px]`}
    >
      <p className="font-semibold text-[29px] text-[#f3daff] w-full">
        Connectez-vous
      </p>

      <form 
        onSubmit={handleSubmit}
        style={{ padding: '32px 6px' }}
        className="flex flex-col gap-6 items-center w-[327px]"
      >
        {/* Input Fields */}
        <div className="flex flex-col gap-2.5 py-2.5 w-full">
          <div style={{ padding: '19px 15px' }} className="bg-[rgba(0,0,0,0.03)] border border-[#ffeded] flex items-center rounded-[13px] w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse e-mail"
              required
              aria-label="Adresse e-mail"
              className="w-full bg-transparent text-[#f3daff] text-sm font-semibold placeholder:text-[#f3daff] focus:outline-none"
            />
          </div>

          <div style={{ padding: '19px 15px' }} className="bg-[rgba(0,0,0,0.03)] border border-[#ffeded] flex items-center rounded-[13px] w-full">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
              aria-label="Mot de passe"
              className="w-full bg-transparent text-[#f3daff] text-sm font-semibold placeholder:text-[#f3daff] focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Button and Forgot Password */}
        <div style={{ padding: '13px 4px' }} className="flex flex-col gap-2.5 items-center w-[326px]">
          <button
            type="submit"
            style={{ padding: '8px 101px' }}
            className="bg-[#f3daff] flex items-center justify-center rounded-[34px] w-full hover:opacity-90 transition-opacity"
          >
            <span className="font-semibold text-sm text-[#1a1124] whitespace-nowrap">
              Se connecter
            </span>
          </button>

          <button
            type="button"
            onClick={onForgotPassword}
            className="font-semibold text-sm text-[#f3daff] text-center w-full hover:underline focus:outline-none"
          >
            Mot de passe oublié ?
          </button>
        </div>

        {/* Divider */}
        <div style={{ padding: '0 11px' }} className="flex gap-2 items-center justify-center">
          <div className="h-0 w-[94px] relative">
            <div className="absolute inset-[-1px_0_0_0]">
              <img alt="" className="block max-w-none size-full" src={dividerLine} />
            </div>
          </div>
          <p className="font-semibold text-sm text-[#f3daff] whitespace-nowrap">
            ou
          </p>
          <div className="h-0 w-[94px] relative">
            <div className="absolute inset-[-1px_0_0_0]">
              <img alt="" className="block max-w-none size-full" src={dividerLine} />
            </div>
          </div>
        </div>

        {/* Create Account Section */}
        <div style={{ padding: '0 4px' }} className="flex flex-col gap-2 items-center justify-center w-[326px]">
          <p className="font-semibold text-sm text-[#f3daff] text-center w-full">
            Pas encore de compte ?
          </p>
          <button
            type="button"
            onClick={onCreateAccount}
            style={{ padding: '8px 101px' }}
            className="bg-[#f3daff] flex items-center justify-center rounded-[34px] w-full hover:opacity-90 transition-opacity"
          >
            <span className="font-semibold text-sm text-[#1a1124] whitespace-nowrap">
              Créer un compte
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
