import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../layouts';
import { Button, Card, Input } from '../components/ui';
import { useToast } from '../context/ToastContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast.error('Invalid email or password');
      } else {
        toast.success('Login successful');
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-navy mb-6">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@school.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <Button
            type="submit"
            className="w-full mt-2"
            loading={isLoading}
          >
            Login as Admin
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-text-secondary">
          Are you a parent? <Link to="/parent/login" className="text-brand-blue font-semibold hover:underline">Login here</Link>
        </div>
      </Card>
    </AuthLayout>
  );
};

export default Login;
