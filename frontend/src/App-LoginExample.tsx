import LoginForm from './components/LoginForm';

/**
 * Exemple d'utilisation du composant LoginForm
 */
function App() {
  const handleLogin = (email: string, password: string) => {
    console.log('Login attempt:', { email, password });
    // Ajoutez ici votre logique d'authentification
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // Ajoutez ici la logique de réinitialisation de mot de passe
  };

  const handleCreateAccount = () => {
    console.log('Create account clicked');
    // Ajoutez ici la logique de création de compte
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 p-4">
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
}

export default App;
