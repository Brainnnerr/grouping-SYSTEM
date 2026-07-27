import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findStudentByNumber } from '../services/studentService';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [studentNumber, setStudentNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!studentNumber.trim()) {
      setError('Please enter your student number.');
      return;
    }

    setLoading(true);

    try {
      const student = await findStudentByNumber(studentNumber.trim());
      if (student) {
        localStorage.setItem('coestuary_current_student', JSON.stringify(student));
        navigate('/dashboard');
      } else {
        setError('Student number not found. Please register first.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative w-full min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/COEstuary20261.avif')` }}
    >
      {/* Frosted Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />

      {/* Glassmorphic Login Box */}
      <div className="relative z-10 w-full max-w-md bg-white/25 backdrop-blur-xl border border-white/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
        
        {/* Logo Image */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-white border border-white/80 rounded-full flex items-center justify-center shadow-lg overflow-hidden p-0.5">
            <img 
              src="/FCO-LOGOO.jpg" 
              alt="FCO-COE Logo" 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>
        </div>

        {/* Title Header */}
        <div className="text-center mb-6">
          <h2 
            className="text-xl sm:text-2xl font-black text-blue-950 tracking-wider uppercase mb-0.5"
            style={{ fontFamily: "'Pacifico', cursive, sans-serif" }}
          >
            COEstuary 2026
          </h2>
          <p className="text-[11px] font-bold text-slate-800 tracking-widest uppercase">
            STUDENT DASHBOARD LOGIN
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-900 text-xs rounded-xl font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
              Student Number
            </label>
            <input 
              type="text" 
              required
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              className="w-full px-4 py-3 bg-white/70 border border-white/60 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-500 shadow-inner"
              placeholder="e.g. 23-01786"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-[#8b0000] hover:bg-[#a30000] text-white font-bold text-sm tracking-wider uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Verifying...</> : 'Access Dashboard'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-blue-950 font-bold hover:underline cursor-pointer"
          >
            Don&apos;t have a Tribu yet? Register here
          </button>
        </div>

        <div className="mt-6 text-center text-[10px] font-semibold text-slate-700 tracking-wider">
          © 2026 EASTERN SAMAR STATE UNIVERSITY
        </div>
      </div>
    </div>
  );
}