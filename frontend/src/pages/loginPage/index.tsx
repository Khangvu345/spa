import LoginHero from './components/LoginHero';
import LoginForm from './components/LoginForm';
import './styles.less';

export default function LoginPage() {
  return (
    <div className="login-page flex w-full min-h-screen">
      <LoginHero />
      <LoginForm />
    </div>
  );
}
