import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTribuMembers, fetchTribuMessages, sendTribuMessage } from '../services/studentService';
import { Shield, Users, LogOut, Send, MessageSquare, Sparkles, GraduationCap } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [tribuMembers, setTribuMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' or 'chat'
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const current = localStorage.getItem('coestuary_current_student');
    if (!current) {
      navigate('/');
      return;
    }
    const parsedStudent = JSON.parse(current);
    setStudent(parsedStudent);

    const loadDashboardData = async () => {
      const members = await fetchTribuMembers(parsedStudent.tribu_name);
      setTribuMembers(members);

      const chatMsgs = await fetchTribuMessages(parsedStudent.tribu_name);
      setMessages(chatMsgs);
    };

    loadDashboardData();

    // Live polling interval for members and chat feed sync every 3 seconds
    const interval = setInterval(loadDashboardData, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('coestuary_current_student');
    navigate('/');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !student) return;

    setSending(true);
    setChatError('');
    try {
      await sendTribuMessage({
        tribu_name: student.tribu_name,
        student_number: student.student_number,
        full_name: student.full_name,
        message: newMessage.trim()
      });
      setNewMessage('');
      const chatMsgs = await fetchTribuMessages(student.tribu_name);
      setMessages(chatMsgs);
    } catch (err) {
      console.error('Failed to send message:', err);
      setChatError(err.message || 'Failed to send message. Check database RLS policies.');
    } finally {
      setSending(false);
    }
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-[#8b0000]/20 gap-4">
          <div>
            <span className="text-[11px] font-black text-[#8b0000] tracking-widest uppercase">COEstuary 2026 Portal</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              WELCOME, {student.full_name.toUpperCase()}!
            </h1>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#8b0000]/10 text-[#8b0000] border border-[#8b0000]/30 rounded-xl transition-all text-xs font-bold shadow-xs cursor-pointer"
          >
            <LogOut size={16} /> Exit Portal
          </button>
        </div>

        {/* Tribu Assignment Banner */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#8b0000] text-xs font-bold uppercase tracking-widest mb-1">
              <Shield size={18} /> Assigned Tribu
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-wide">
              {student.tribu_name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl">
              Connect with your fellow engineers, coordinate for festival activities, and interact with your Tribu mates.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl">
            <div className="p-3 bg-[#8b0000]/10 text-[#8b0000] rounded-xl">
              <Users size={28} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Tribu Members</div>
              <div className="text-2xl font-black text-slate-900">{tribuMembers.length} Students</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Roster vs Community Chat) */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
              activeTab === 'roster'
                ? 'bg-[#8b0000] text-white shadow-md shadow-[#8b0000]/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <GraduationCap size={16} /> Ka-Tribu ({tribuMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
              activeTab === 'chat'
                ? 'bg-[#8b0000] text-white shadow-md shadow-[#8b0000]/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <MessageSquare size={16} /> Community Chat
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="pt-1">
          {activeTab === 'roster' ? (
            /* Tribu Members Roster View */
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tribuMembers.map((member) => {
                  const isMe = member.student_number === student.student_number;
                  return (
                    <div 
                      key={member.id} 
                      className={`p-4 rounded-2xl transition-all border ${
                        isMe 
                          ? 'bg-[#8b0000]/5 border-[#8b0000]/40 shadow-sm' 
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {member.full_name} {isMe && <span className="text-[10px] bg-[#8b0000] text-white px-2 py-0.5 rounded-full ml-1 font-semibold">You</span>}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500">{member.student_number}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{member.program}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded font-semibold">
                          {member.year_level}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded font-semibold">
                          Sec {member.section}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Community Chat Tab View */
            <div className="flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs text-slate-500 font-medium">Interact and coordinate with your Tribu mates</span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Feed Active
                </span>
              </div>

              {chatError && (
                <div className="mb-3 p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl font-semibold">
                  {chatError}
                </div>
              )}

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 bg-white border border-slate-200 p-4 rounded-3xl shadow-xs">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMyMessage = msg.student_number === student.student_number;
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-xs font-bold text-slate-700">{msg.full_name}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div 
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isMyMessage 
                              ? 'bg-[#8b0000] text-white rounded-br-none' 
                              : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                    <Sparkles size={32} className="text-slate-300 animate-bounce" />
                    <p className="text-xs font-medium">No messages yet. Be the first to say hello to your Tribu mates!</p>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message to your Tribu..."
                  className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-[#8b0000] transition-colors shadow-xs"
                />
                <button 
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-6 py-3 bg-[#8b0000] hover:bg-[#a30000] disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}