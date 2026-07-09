import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, GraduationCap, HelpCircle } from 'lucide-react';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import useScrollAnimation from '../../../../hooks/useScrollAnimation';

const INQUIRY_TYPES = [
  { id: 'student', label: 'Student Inquiry', icon: GraduationCap, desc: 'Questions about courses or platform' },
  { id: 'school', label: 'School Onboarding', icon: MessageSquare, desc: 'Partner with Study Wisely' },
  { id: 'support', label: 'Support Request', icon: HelpCircle, desc: 'Technical help or issues' },
];

const s = {
  page: { paddingTop: 'var(--space-12)' },
  hero: { padding: 'var(--space-12) 0', background: 'var(--gradient-surface)', textAlign: 'center' },
  container: { maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--space-6)' },
  tag: { display: 'inline-flex', padding: 'var(--space-1) var(--space-4)', background: 'rgba(79,110,247,0.08)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' },
  title: { fontSize: 'var(--text-4xl)', fontWeight: '800', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-heading)' },
  subtitle: { fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', maxWidth: '560px', margin: '0 auto' },
  content: { padding: 'var(--space-16) 0', maxWidth: 'var(--max-width)', margin: '0 auto', paddingLeft: 'var(--space-6)', paddingRight: 'var(--space-6)' },
  form: { background: 'var(--color-surface)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border-light)' },
  formTitle: { fontSize: 'var(--text-2xl)', fontWeight: '700', marginBottom: 'var(--space-6)', fontFamily: 'var(--font-heading)' },
  fields: { display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' },
  row: { width: '100%' },
  types: { display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' },
  typeBtn: { flex: 1, minWidth: '120px', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' },
  typeActive: { borderColor: 'var(--color-accent)', background: 'rgba(79,110,247,0.04)', boxShadow: '0 0 0 3px rgba(79,110,247,0.1)' },
  infoSide: { display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' },
  infoCard: { display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-6)', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)' },
  infoIcon: { width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'rgba(79,110,247,0.08)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  infoTitle: { fontWeight: '600', marginBottom: '4px' },
  infoText: { fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' },
};

const Contact = () => {
  const [inquiryType, setInquiryType] = useState('student');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const heroRef = useScrollAnimation('fadeUp');

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Submit to API
    alert('Thank you! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div style={s.page}>
      <section style={s.hero}>
        <div style={s.container} ref={heroRef}>
          <span style={s.tag}>📬 Contact Us</span>
          <h1 style={s.title}>Get in Touch</h1>
          <p style={s.subtitle}>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      <div style={s.content} className="responsive-grid-2">
        <div style={s.form}>
          <h2 style={s.formTitle}>Send us a Message</h2>
          <div style={s.types}>
            {INQUIRY_TYPES.map((t) => (
              <button key={t.id} style={{ ...s.typeBtn, ...(inquiryType === t.id ? s.typeActive : {}) }} onClick={() => setInquiryType(t.id)}>
                <t.icon size={20} color={inquiryType === t.id ? 'var(--color-accent)' : 'var(--color-text-tertiary)'} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: inquiryType === t.id ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>{t.label}</span>
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={s.fields}>
              <div style={s.row} className="responsive-grid-2">
                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" required />
              </div>
              <div style={s.row} className="responsive-grid-2">
                <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                <Input label="Subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" required />
              </div>
              <Input label="Message" name="message" value={formData.message} onChange={handleChange} placeholder="Tell us more about your query..." textarea required />
              <Button variant="primary" size="lg" fullWidth iconRight={<Send size={18} />} type="submit">
                Send Message
              </Button>
            </div>
          </form>
        </div>

        <div style={s.infoSide}>
          <div style={s.infoCard}>
            <div style={s.infoIcon}><Mail size={22} /></div>
            <div>
              <h4 style={s.infoTitle}>Email</h4>
              <p style={s.infoText}>info@studywisely.in</p>
            </div>
          </div>
          <div style={s.infoCard}>
            <div style={s.infoIcon}><Phone size={22} /></div>
            <div>
              <h4 style={s.infoTitle}>Phone</h4>
              <p style={s.infoText}>+91 98765 43210</p>
            </div>
          </div>
          <div style={s.infoCard}>
            <div style={s.infoIcon}><MapPin size={22} /></div>
            <div>
              <h4 style={s.infoTitle}>Office</h4>
              <p style={s.infoText}>Study Wisely HQ, India</p>
            </div>
          </div>
          <div style={{ background: 'var(--gradient-accent)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', color: 'white' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', marginBottom: 'var(--space-3)' }}>🏫 School Partnership</h3>
            <p style={{ opacity: 0.85, lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
              Want to bring Study Wisely to your school? We offer custom packages for schools and institutions.
            </p>
            <Button variant="secondary" size="sm" style={{ color: 'var(--color-primary)' }}>Learn More</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
