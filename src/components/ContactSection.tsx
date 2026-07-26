import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { CONTACT_INFO, FOUNDER_INFO } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface ContactForm {
  name: string;
  email: string;
  organization: string;
  inquiryType: string;
  message: string;
}

export default function ContactSection() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    organization: '',
    inquiryType: 'General Inquiry',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setErrorMessage('Please fill in all required fields (Name, Email, and Message).');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Send data to Formspree
      const response = await fetch('https://formspree.io/f/mbdnplad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          organization: form.organization,
          inquiryType: form.inquiryType,
          message: form.message
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit form to Formspree');
      }
      
      // Save locally to show persistence in guest mode
      const previousMessages = JSON.parse(localStorage.getItem('nexus_contact_messages') || '[]');
      const newMessage = {
        ...form,
        id: 'msg_' + Math.random().toString(36).substring(2, 9),
        submittedAt: new Date().toISOString()
      };
      localStorage.setItem('nexus_contact_messages', JSON.stringify([newMessage, ...previousMessages]));
      
      setSubmitted(true);
      setForm({
        name: '',
        email: '',
        organization: '',
        inquiryType: 'General Inquiry',
        message: ''
      });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setErrorMessage('Failed to submit message to Formspree. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 py-12 md:py-20 text-left" id="contact_section">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Direct Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
                Get in Touch with our Analysts
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Whether you are a commercial farm operator, academic researcher, or state planner, our expert team is ready to assist your clean energy initiatives.
              </p>
            </div>

            {/* Contact Details List */}
            <div className="space-y-4" id="contact_details_cards">
              
              {/* HQ Address Card */}
              <div 
                className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex gap-4"
              >
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 h-fit shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Lagos HQ Address</h4>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    {CONTACT_INFO.address}
                  </p>
                  <span className="inline-block text-[10px] text-slate-400 font-medium">Lagos State, Nigeria</span>
                </div>
              </div>

              {/* Email Card */}
              <div 
                className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex gap-4"
              >
                <div className="p-3 bg-teal-50 rounded-xl text-teal-600 h-fit shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Direct Email</h4>
                  <a 
                    href={`mailto:${CONTACT_INFO.email}`} 
                    className="block text-sm font-semibold text-slate-800 hover:text-emerald-600 transition-colors"
                  >
                    {CONTACT_INFO.email}
                  </a>
                  <span className="inline-block text-[10px] text-slate-400 font-medium">Inquiries and research submissions</span>
                </div>
              </div>

              {/* Phone Card */}
              <div 
                className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex gap-4"
              >
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 h-fit shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Phone Support</h4>
                  <a 
                    href={`tel:${CONTACT_INFO.phone}`} 
                    className="block text-sm font-semibold text-slate-800 hover:text-emerald-600 transition-colors"
                  >
                    {CONTACT_INFO.phone}
                  </a>
                  <span className="inline-block text-[10px] text-slate-400 font-medium">Monday – Friday, 8am – 6pm (WAT)</span>
                </div>
              </div>

              {/* Hours Card */}
              <div 
                className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex gap-4"
              >
                <div className="p-3 bg-slate-100 rounded-xl text-slate-600 h-fit shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Business Hours</h4>
                  <p className="text-sm font-semibold text-slate-800">
                    {CONTACT_INFO.hours}
                  </p>
                  <span className="inline-block text-[10px] text-slate-400 font-medium">West Africa Time Zone</span>
                </div>
              </div>

            </div>

            {/* Interactive Location Blueprint Map Mockup */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg border border-slate-800/40">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-35"></div>
              <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">HQ Lagos Coordinates</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold font-display">Nigeria Bioenergy Cluster</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Our workspace anchors scientific operations & local biodigester consulting directly from Lagos, serving public-private waste audit partnerships nationwide.
                  </p>
                </div>
                
                <div className="pt-2">
                  <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>LOCATION</span>
                      <span className="text-emerald-400">● PRIMARY REGION</span>
                    </div>
                    <div className="text-xs text-slate-300 flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Abule Egba Cluster</span>
                      <span className="font-mono">6.642° N, 3.284° E</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-3/4 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Us Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/50 shadow-sm relative">
              <div className="absolute top-6 right-6 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Response within 24h
              </div>

              <h3 className="text-xl font-bold text-slate-900 font-display mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                Send us a Message
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Have any inquiries, suggestions, or wish to schedule a consultation with our renewable energy analyst? Fill out the form below.
              </p>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form 
                    key="contact-form"
                    onSubmit={handleSubmit} 
                    className="space-y-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    
                    {/* Error Notice */}
                    {errorMessage && (
                      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-semibold text-rose-800">
                        {errorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="e.g. Dr. Kola Adewale"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none placeholder:text-slate-400"
                          required
                        />
                      </div>

                      {/* Email input */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="email" 
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="e.g. koladewale@domain.com"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none placeholder:text-slate-400"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Organization input */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Organization / Company <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input 
                          type="text" 
                          name="organization"
                          value={form.organization}
                          onChange={handleChange}
                          placeholder="e.g. Lagos Waste Management Authority"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none placeholder:text-slate-400"
                        />
                      </div>

                      {/* Inquiry Type Select */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Inquiry Type
                        </label>
                        <select 
                          name="inquiryType"
                          value={form.inquiryType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none cursor-pointer"
                        >
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Technical Feasibility Review">Technical Feasibility Review</option>
                          <option value="Capacity Training Module">Capacity Training Module</option>
                          <option value="Joint Climate Grant Proposal">Joint Climate Grant Proposal</option>
                          <option value="Research Paper Inquiry">Research Paper Inquiry</option>
                        </select>
                      </div>
                    </div>

                    {/* Message Textarea */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Your Message <span className="text-rose-500">*</span>
                      </label>
                      <textarea 
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Please describe your query or project proposal in detail..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none placeholder:text-slate-400 resize-none"
                        required
                      />
                    </div>

                    {/* Privacy notice */}
                    <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Your communication is protected under our research data policies. We never share submission datasets, contact parameters, or municipal waste audits with external agencies without prior written consent.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-sm active:scale-[0.99] transition-all duration-200 disabled:opacity-50 cursor-pointer border-0"
                    >
                      <Send className="w-4 h-4" />
                      {loading ? 'Sending Message...' : 'Send Message'}
                    </button>

                  </motion.form>
                ) : (
                  <motion.div 
                    key="success-message"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8 text-center space-y-6"
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-2 max-w-md mx-auto">
                      <h4 className="text-lg font-bold text-slate-900 font-display">Inquiry Sent Successfully!</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Thank you for reaching out to Aurenix Research. Your message has been routed to our direct desk.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-w-md mx-auto text-left space-y-2.5">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        Next Steps
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Our lead renewable energy analyst, <strong>{FOUNDER_INFO.name}</strong>, reviews all public-private project proposals and feasibility requests. You will receive an email back at the provided address shortly.
                      </p>
                    </div>

                    <button
                      onClick={() => setSubmitted(false)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Submit Another Message
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
