import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllStudents, updateStudent, deleteStudent, fetchAnnouncements, postAnnouncement, deleteAnnouncement } from '../services/studentService';
import { TRIBUS } from '../utils/tribuData';
import { Users, Search, LogOut, RefreshCw, Pencil, Trash2, X, Check, ShieldAlert, Filter, Megaphone, Send } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTribu, setSelectedTribu] = useState('ALL');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('ALL');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Announcement Form State
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });
  const [postingAnn, setPostingAnn] = useState(false);

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    student_number: '',
    program: '',
    year_level: '',
    section: '',
    tribu_name: ''
  });
  const [actionError, setActionError] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAllStudents();
    const anns = await fetchAnnouncements();
    setStudents(data);
    setAnnouncements(anns);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteStudent(id);
        setStudents(students.filter(s => s.id !== id));
      } catch (err) {
        alert('Failed to delete student: ' + err.message);
      }
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) return;

    setPostingAnn(true);
    try {
      await postAnnouncement(announcementForm);
      setAnnouncementForm({ title: '', message: '' });
      const anns = await fetchAnnouncements();
      setAnnouncements(anns);
    } catch (err) {
      alert('Failed to post announcement: ' + err.message);
    } finally {
      setPostingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
        setAnnouncements(announcements.filter(a => a.id !== id));
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      full_name: student.full_name,
      student_number: student.student_number,
      program: student.program,
      year_level: student.year_level,
      section: student.section,
      tribu_name: student.tribu_name
    });
    setActionError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const updated = await updateStudent(editingStudent.id, editForm);
      setStudents(students.map(s => s.id === updated.id ? updated : s));
      setEditingStudent(null);
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Filter students based on search, tribu, program, and section filter tabs
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.student_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTribu = selectedTribu === 'ALL' || student.tribu_name === selectedTribu;
    
    let matchesProgram = true;
    if (selectedProgramFilter === 'BSCpE') {
      matchesProgram = student.program.includes('Computer Engineering');
    } else if (selectedProgramFilter === 'BSCE') {
      matchesProgram = student.program.includes('Civil Engineering');
    } else if (selectedProgramFilter === 'BSEE') {
      matchesProgram = student.program.includes('Electrical Engineering');
    }

    let matchesSection = true;
    if (selectedSectionFilter !== 'ALL') {
      const yearDigit = student.year_level.charAt(0);
      const targetCombo = `${yearDigit}${student.section}`.toUpperCase();
      matchesSection = targetCombo === selectedSectionFilter;
    }

    return matchesSearch && matchesTribu && matchesProgram && matchesSection;
  });

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Streamlined Admin Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-[#8b0000]/20 gap-4">
          <div>
            <span className="text-[11px] font-black text-[#8b0000] tracking-widest uppercase">Admin Portal</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl transition-all text-xs font-bold shadow-xs cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#8b0000]/10 text-[#8b0000] border border-[#8b0000]/30 rounded-xl transition-all text-xs font-bold shadow-xs cursor-pointer"
            >
              <LogOut size={14} /> Exit Admin
            </button>
          </div>
        </div>

        {/* Analytics Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center gap-4">
            <div className="p-3 bg-[#8b0000]/10 text-[#8b0000] rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Registered Students</div>
              <div className="text-2xl font-black text-slate-900">{students.length}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center gap-4">
            <div className="p-3 bg-[#8b0000]/10 text-[#8b0000] rounded-xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Active Tribus</div>
              <div className="text-2xl font-black text-slate-900">10 Teams</div>
            </div>
          </div>
        </div>

        {/* Broadcast Announcement Section */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#8b0000] font-black text-sm uppercase tracking-wider">
            <Megaphone size={20} /> Broadcast Announcement to Student Dashboards
          </div>
          
          <form onSubmit={handlePostAnnouncement} className="space-y-3">
            <input 
              type="text" 
              placeholder="Announcement Title (e.g., Festival Schedule Update)"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#8b0000]"
            />
            <textarea 
              placeholder="Write your announcement message here..."
              value={announcementForm.message}
              onChange={(e) => setAnnouncementForm({...announcementForm, message: e.target.value})}
              required
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#8b0000]"
            />
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={postingAnn}
                className="px-6 py-2.5 bg-[#8b0000] hover:bg-[#a30000] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send size={14} /> {postingAnn ? 'Broadcasting...' : 'Publish Announcement'}
              </button>
            </div>
          </form>

          {announcements.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2 max-h-48 overflow-y-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Active Broadcasts</span>
              {announcements.map((ann) => (
                <div key={ann.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{ann.title}</h4>
                    <p className="text-xs text-slate-600 truncate max-w-xl">{ann.message}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Announcement"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-[#8b0000]"
            />
          </div>

          <div className="w-full md:w-auto flex items-center gap-2">
            <select 
              value={selectedTribu}
              onChange={(e) => setSelectedTribu(e.target.value)}
              className="w-full md:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-[#8b0000] font-medium cursor-pointer"
            >
              <option value="ALL">All Tribus ({students.length})</option>
              {TRIBUS.map(tribu => (
                <option key={tribu} value={tribu}>
                  {tribu} ({students.filter(s => s.tribu_name === tribu).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Program & Section Filter Tabs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
              <Filter size={14} /> Programs:
            </span>
            {['ALL', 'BSCpE', 'BSCE', 'BSEE'].map((prog) => (
              <button
                key={prog}
                onClick={() => {
                  setSelectedProgramFilter(prog);
                  setSelectedSectionFilter('ALL');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  selectedProgramFilter === prog
                    ? 'bg-[#8b0000] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {prog === 'ALL' ? 'All Programs' : prog}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
              <Filter size={14} /> Sections:
            </span>
            {['ALL', '1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B'].map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSectionFilter(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  selectedSectionFilter === sec
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {sec === 'ALL' ? 'All Sections' : sec}
              </button>
            ))}
          </div>
        </div>

        {/* Students Data Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Student ID</th>
                  <th className="py-4 px-6">Program</th>
                  <th className="py-4 px-6">Year & Section</th>
                  <th className="py-4 px-6">Assigned Tribu</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{student.full_name}</td>
                      <td className="py-4 px-6 text-slate-600 font-mono text-xs">{student.student_number}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{student.program}</td>
                      <td className="py-4 px-6 text-slate-600">{student.year_level} • Sec {student.section}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-[#8b0000]/10 border border-[#8b0000]/30 text-[#8b0000] font-bold rounded-lg text-xs">
                          {student.tribu_name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEdit(student)}
                            className="p-2 bg-slate-100 hover:bg-blue-50 text-blue-600 rounded-lg border border-slate-200 cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(student.id, student.full_name)}
                            className="p-2 bg-slate-100 hover:bg-red-50 text-red-600 rounded-lg border border-slate-200 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                      No registered students found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
              <h3 className="text-lg font-black text-slate-900">Edit Student Record</h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Student Number</label>
                <input 
                  type="text" required
                  value={editForm.student_number}
                  onChange={(e) => setEditForm({...editForm, student_number: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Program</label>
                <select 
                  value={editForm.program}
                  onChange={(e) => setEditForm({...editForm, program: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm cursor-pointer"
                >
                  <option value="Bachelor of Science in Computer Engineering (BSCpE)">BS Computer Engineering (BSCpE)</option>
                  <option value="Bachelor of Science in Civil Engineering (BSCE)">BS Civil Engineering (BSCE)</option>
                  <option value="Bachelor of Science in Electrical Engineering (BSEE)">BS Electrical Engineering (BSEE)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Year Level</label>
                  <select 
                    value={editForm.year_level}
                    onChange={(e) => setEditForm({...editForm, year_level: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm cursor-pointer"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Section</label>
                  <input 
                    type="text" required
                    value={editForm.section}
                    onChange={(e) => setEditForm({...editForm, section: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Tribu</label>
                <select 
                  value={editForm.tribu_name}
                  onChange={(e) => setEditForm({...editForm, tribu_name: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm cursor-pointer"
                >
                  {TRIBUS.map(tribu => (
                    <option key={tribu} value={tribu}>{tribu}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button 
                  type="button" onClick={() => setEditingStudent(null)}
                  className="w-1/2 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-1/2 py-3 bg-[#8b0000] text-white font-bold rounded-xl text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check size={16} /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}