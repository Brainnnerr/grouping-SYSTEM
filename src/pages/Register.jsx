import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudent } from '../services/studentService';
import { Loader2 } from 'lucide-react';

const SECTION_MAPPINGS = {
  "Bachelor of Science in Computer Engineering (BSCpE)": {
    "1st Year": ["A", "B"],
    "2nd Year": ["A", "B"],
    "3rd Year": ["A", "B"],
    "4th Year": ["A"]
  },
  "Bachelor of Science in Civil Engineering (BSCE)": {
    "1st Year": ["A", "B", "C"],
    "2nd Year": ["A", "B", "C"],
    "3rd Year": ["A", "B", "C"],
    "4th Year": ["A", "B"]
  },
  "Bachelor of Science in Electrical Engineering (BSEE)": {
    "1st Year": ["A", "B", "C"],
    "2nd Year": ["A", "B"],
    "3rd Year": ["A", "B"],
    "4th Year": ["A", "B"]
  }
};

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    student_number: '',
    program: '',
    year_level: '',
    section: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already saved in browser session
  useEffect(() => {
    const savedStudent = localStorage.getItem('coestuary_current_student');
    if (savedStudent) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleProgramChange = (e) => {
    const newProgram = e.target.value;
    setFormData({
      ...formData,
      program: newProgram,
      year_level: '',
      section: ''
    });
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setFormData({
      ...formData,
      year_level: newYear,
      section: ''
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.program || !formData.year_level || !formData.section) {
      setError('Please select your Program, Year Level, and Section.');
      return;
    }

    setLoading(true);

    try {
      const registered = await registerStudent(formData);
      localStorage.setItem('coestuary_current_student', JSON.stringify(registered));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentYears = formData.program ? Object.keys(SECTION_MAPPINGS[formData.program] || {}) : [];
  const currentSections = (formData.program && formData.year_level) ? SECTION_MAPPINGS[formData.program][formData.year_level] || [] : [];

  return (
    <div 
      className="relative w-full min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/COEstuary20261.avif')` }}
    >
      {/* Frosted Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />

      {/* Glassmorphic Registration Box */}
      <div className="relative z-10 w-full max-w-md bg-white/25 backdrop-blur-xl border border-white/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
        
        {/* Logo Image */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-white border border-white/80 rounded-full flex items-center justify-center shadow-lg overflow-hidden p-0.5">
            <img 
              src="/FCO-LOGOO.png" 
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
            Please use an appropriate name. Otherwise, your registration may be removed from the system.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-900 text-xs rounded-xl font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input 
              type="text" 
              name="full_name" 
              required
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/70 border border-white/60 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-500 shadow-inner"
              placeholder="Lj Geposon"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
              Student Number
            </label>
            <input 
              type="text" 
              name="student_number" 
              required
              value={formData.student_number}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/70 border border-white/60 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-500 shadow-inner"
              placeholder="23-01786"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
              Program
            </label>
            <select 
              name="program"
              value={formData.program}
              onChange={handleProgramChange}
              required
              className="w-full px-4 py-3 bg-white/70 border border-white/60 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-600 transition-all shadow-inner cursor-pointer"
            >
              <option value="" disabled>-- Select Program --</option>
              <option value="Bachelor of Science in Computer Engineering (BSCpE)">BS Computer Engineering (BSCpE)</option>
              <option value="Bachelor of Science in Civil Engineering (BSCE)">BS Civil Engineering (BSCE)</option>
              <option value="Bachelor of Science in Electrical Engineering (BSEE)">BS Electrical Engineering (BSEE)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                Year Level
              </label>
              <select 
                name="year_level"
                value={formData.year_level}
                onChange={handleYearChange}
                required
                disabled={!formData.program}
                className="w-full px-3 py-3 bg-white/70 border border-white/60 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-600 transition-all shadow-inner cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>-- Year --</option>
                {currentYears.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                Section
              </label>
              <select 
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
                disabled={!formData.year_level}
                className="w-full px-3 py-3 bg-white/70 border border-white/60 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-600 transition-all shadow-inner cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>-- Section --</option>
                {currentSections.map((sec) => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-3 bg-[#8b0000] hover:bg-[#a30000] text-white font-bold text-sm tracking-wider uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : 'Register & Assign Tribu'}
          </button>
        </form>

        <div className="mt-3 text-center">
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="text-xs text-blue-950 font-bold hover:underline cursor-pointer"
          >
            Already registered? Login
          </button>
        </div>

        <div className="mt-5 text-center text-[10px] font-semibold text-slate-700 tracking-wider">
          BRAINERTECH
        </div>
      </div>
    </div>
  );
}
