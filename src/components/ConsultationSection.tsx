import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Send, CheckCircle2, AlertCircle, HelpCircle, Briefcase, RefreshCw } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { ConsultationInquiry } from '../types';
import { CONSULTANCY_SERVICES } from '../data';
import { submitInquiry, getUserInquiries } from '../services/db';
import { motion } from 'motion/react';

interface ConsultationSectionProps {
  user: FirebaseUser | null;
  onSignIn: () => void;
  activeInquiries: ConsultationInquiry[];
  setActiveInquiries: React.Dispatch<React.SetStateAction<ConsultationInquiry[]>>;
}

export default function ConsultationSection({ 
  user, 
  onSignIn,
  activeInquiries,
  setActiveInquiries
}: ConsultationSectionProps) {
  // Form State
  const [organization, setOrganization] = useState('');
  const [serviceType, setServiceType] = useState('Bioenergy Feasibility Studies');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reload inquiries from Firestore
  const loadInquiries = async () => {
    if (!user) return;
    try {
      const data = await getUserInquiries(user.uid);
      setActiveInquiries(data);
    } catch (err) {
      console.error('Error loading inquiries:', err);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onSignIn();
      return;
    }

    if (!organization || !message) {
      setErrorMsg('Organization name and project brief are required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await submitInquiry({
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || 'Member',
        organization,
        serviceType,
        message,
      });

      setSuccess(true);
      setOrganization('');
      setMessage('');
      
      // Reload active list
      await loadInquiries();
      
      // Auto-dismiss success notification
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Inquiry submission error:', err);
      setErrorMsg('Could not submit request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-white" id="services">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            Our Advisory Services
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Rigorous Engineering & Policy Consulting
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            We provide verified, research-backed feasibility and sustainability advisory for organizations seeking reliable bioenergy installations.
          </p>
        </div>

        {/* Services Bento-like Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-20" id="services_grid">
          {CONSULTANCY_SERVICES.map((service, index) => (
            <motion.div 
              key={service.id}
              whileHover={{ y: -6, scale: 1.01 }}
              className="bg-slate-50 p-8 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 group relative"
              id={`service_card_${service.id}`}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-3xl font-mono font-bold text-slate-300">0{index + 1}</span>
                  <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                </div>

                <h3 className="text-xl font-display font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {service.title}
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {service.description}
                </p>

                {/* Bullets */}
                <ul className="space-y-3 pt-2 text-left">
                  {service.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="text-emerald-600 shrink-0 font-bold">✓</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Consulting Request Form Container */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden" id="consultation_form_section">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-700/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-800/20 rounded-full blur-3xl"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
            
            {/* Form Left Info */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="inline-block text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                READY TO START?
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-bold tracking-tight leading-tight">
                Let's discuss <br />your project
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Tell us about your organic waste profile, municipal constraints, or policy queries. An analyst will review your submission and reply within 48 hours.
              </p>
              
              <div className="space-y-4 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-xs text-slate-300">Technical reports delivered within 30 days</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-xs text-slate-300">Certified training completion modules</span>
                </div>
              </div>
            </div>

            {/* Form Right Inputs */}
            <div className="lg:col-span-7 bg-white/5 p-6 sm:p-8 rounded-2xl">
              {success ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-emerald-900/50 text-emerald-400 rounded-full">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-100">Inquiry Received Successfully!</h4>
                    <p className="text-xs text-slate-400 max-w-md mt-1">
                      Thank you for submitting. Our team will perform an initial feasibility review and contact you shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMsg && (
                    <div className="p-3 bg-red-950/50 border border-red-900 rounded-xl text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {!user && (
                    <div className="p-4 bg-emerald-950/40 rounded-xl text-left">
                      <p className="text-xs text-emerald-200 leading-relaxed">
                        <strong>Sign-In Required:</strong> To submit a consulting request and monitor its real-time review status, you must sign in with your Google account first.
                      </p>
                      <motion.button
                        type="button"
                        onClick={onSignIn}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="mt-3 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition-colors cursor-pointer"
                      >
                        Sign In with Google
                      </motion.button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="block text-xs font-bold text-slate-300 uppercase">Organization / Entity</label>
                      <input
                        type="text"
                        required
                        disabled={!user || loading}
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g. Lagos Waste Mgmt Authority"
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-emerald-500 focus:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="block text-xs font-bold text-slate-300 uppercase">Required Advisory</label>
                      <select
                        disabled={!user || loading}
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="Bioenergy Feasibility Studies">Bioenergy Feasibility Studies</option>
                        <option value="Environmental Impact Analysis">Environmental Impact Analysis</option>
                        <option value="Net-Zero Strategy & Advisory">Net-Zero Strategy & Advisory</option>
                        <option value="Research & Practical Training">Research & Practical Training</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="block text-xs font-bold text-slate-300 uppercase">Project Brief / Questions</label>
                    <textarea
                      rows={4}
                      required
                      disabled={!user || loading}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. Seeking feasibility audit for a 10-ton/day organic waste anaerobic digester project in Abule Egba area..."
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-emerald-500 focus:bg-white/10 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    ></textarea>
                  </div>

                  {user && (
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/50 text-white rounded-xl font-bold transition-all shadow cursor-pointer text-sm border-0"
                      id="submit_consult_btn"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Feasibility Inquiry
                        </>
                      )}
                    </motion.button>
                  )}
                </form>
              )}
            </div>

          </div>
        </div>

        {/* Real-time submissions viewer for authenticated users */}
        {user && activeInquiries.length > 0 && (
          <div className="mt-16 text-left border-t border-slate-100 pt-12">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-display font-bold text-slate-900">
                Your Advisory Requests ({activeInquiries.length})
              </h4>
              <button
                onClick={loadInquiries}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeInquiries.map((inq) => (
                <motion.div 
                  key={inq.id} 
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="p-5 bg-slate-50 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-500">{new Date(inq.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inq.status === 'Pending' 
                          ? 'bg-amber-100 text-amber-800' 
                          : inq.status === 'In Review' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {inq.status}
                      </span>
                    </div>
                    <span className="block text-xs font-bold text-emerald-800">{inq.serviceType}</span>
                    <span className="block text-xs font-semibold text-slate-700 font-mono">Org: {inq.organization}</span>
                    <p className="text-xs text-slate-600 line-clamp-2">{inq.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
