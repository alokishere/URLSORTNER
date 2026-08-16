import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail} from 'lucide-react';
import instance from '../axios';
import { useNavigate } from 'react-router-dom';


const Loginpage = () => {  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
const navigate = useNavigate();
  // Form Validation
  const validateForm = () => {
    const tempErrors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Valid email is required';
    if (!password || password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
   instance.post('/user/login', { email, password })
      .then(response => {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        navigate('/dashboard'); // Redirect to dashboard on successful login
      })
      .catch(error => {
        console.error('Login failed:', error.response ? error.response.data : error.message);
        // Handle login failure (e.g., show error message)
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Sign in</h2>
        <div className="mt-8 bg-white py-8 px-6 shadow rounded-xl border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg ${errors.email ? 'border-red-300' : 'border-slate-300'}`} />
              </div>
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg ${errors.password ? 'border-red-300' : 'border-slate-300'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
                  {showPassword ? <EyeOff className="h-5 w-5 text-slate-400" /> : <Eye className="h-5 w-5 text-slate-400" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70">
              {isLoading ? 'Loading...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Loginpage
