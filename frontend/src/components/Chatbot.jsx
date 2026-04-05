import React, { useState } from 'react';
import './Chatbot.css';

const responses = {
  fever:    { icon: '🌡️', title: 'Fever Management',         color: '#f56565', tips: ['Take Paracetamol 500mg every 6-8 hours', 'Drink plenty of fluids (2-3 litres/day)', 'Rest and avoid strenuous activities', 'Use cold compress on forehead', 'Monitor temperature every 4 hours'], warn: 'If fever persists >3 days or >102°F, consult doctor immediately' },
  headache: { icon: '🤕', title: 'Headache Relief',           color: '#ed8936', tips: ['Take Crocin/Disprin 500mg', 'Apply cold/warm compress on forehead', 'Ensure adequate sleep (7-8 hours)', 'Stay well hydrated', 'Avoid bright screens and loud noise'], warn: 'If severe or persistent headache, seek medical attention' },
  cold:     { icon: '🤧', title: 'Cold & Cough Treatment',    color: '#4299e1', tips: ['Take Cetirizine 10mg once daily', 'Warm salt water gargling 3x daily', 'Steam inhalation 2-3 times daily', 'Honey with warm water or ginger tea', 'Avoid cold foods and drinks'], warn: 'If symptoms worsen or persist >7 days, consult doctor' },
  stomach:  { icon: '🤢', title: 'Stomach Pain Relief',       color: '#48bb78', tips: ['Take Antacid tablet after meals', 'Eat light, easily digestible food (khichdi, curd rice)', 'Avoid spicy, oily, or acidic foods', 'Drink warm water frequently', 'Rest and avoid physical stress'], warn: 'If severe pain, vomiting, or blood in stool, seek immediate help' },
  stress:   { icon: '😰', title: 'Stress & Anxiety Support',  color: '#9f7aea', tips: ['Practice 4-7-8 deep breathing technique', 'Try 10 min meditation or yoga daily', 'Maintain regular sleep schedule', 'Talk to a trusted friend or family member', 'Take short walks and engage in hobbies'], warn: 'For professional help, book anonymous psychiatrist consultation (Thursdays only)' },
};

const buttons = [
  { key: 'fever',    label: '🌡️ Fever',         color: 'rgba(245,101,101,0.15)',  border: 'rgba(245,101,101,0.3)' },
  { key: 'headache', label: '🤕 Headache',       color: 'rgba(237,137,54,0.15)',  border: 'rgba(237,137,54,0.3)' },
  { key: 'cold',     label: '🤧 Cold & Cough',   color: 'rgba(66,153,225,0.15)',  border: 'rgba(66,153,225,0.3)' },
  { key: 'stomach',  label: '🤢 Stomach Pain',   color: 'rgba(72,187,120,0.15)',  border: 'rgba(72,187,120,0.3)' },
  { key: 'stress',   label: '😰 Stress/Anxiety', color: 'rgba(159,122,234,0.15)', border: 'rgba(159,122,234,0.3)' },
];

const hour = new Date().getHours();
const tip = hour < 12 ? { icon: '🌅', text: 'Morning Tip: Start your day with warm water and light exercise!' }
  : hour < 17 ? { icon: '☀️', text: 'Afternoon Tip: Take short breaks and stay hydrated!' }
  : hour < 21 ? { icon: '🌆', text: 'Evening Tip: Wind down with relaxation techniques!' }
  : { icon: '🌙', text: 'Night Tip: Ensure 7-8 hours of quality sleep for better health!' };

export default function Chatbot() {
  const [reply, setReply] = useState(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(null);

  const handleClick = (key) => {
    setActive(key); setLoading(true); setReply(null);
    setTimeout(() => { setReply(responses[key]); setLoading(false); }, 1000);
  };

  return (
    <div className="card chatbot-card">
      <h3>🤖 AI Health Assistant</h3>
      <div className="health-tip">
        <span className="tip-icon">{tip.icon}</span>
        <span>{tip.text}</span>
      </div>
      <p className="sub-text">Select your health concern for instant AI guidance:</p>
      <div className="chatbot-buttons">
        {buttons.map(b => (
          <button key={b.key} className={`chatbot-btn ${active === b.key ? 'active' : ''}`}
            style={{ '--btn-bg': b.color, '--btn-border': b.border }}
            onClick={() => handleClick(b.key)}>{b.label}</button>
        ))}
      </div>
      {loading && (
        <div className="chat-loading">
          <div className="typing-dots"><span /><span /><span /></div>
          <span>AI is analyzing your symptoms...</span>
        </div>
      )}
      {reply && !loading && (
        <div className="chat-reply" style={{ '--reply-color': reply.color }}>
          <div className="chat-reply-header">
            <span className="chat-reply-icon">{reply.icon}</span>
            <div>
              <div className="chat-reply-title">{reply.title}</div>
              <div className="chat-reply-sub">AI Health Assistant</div>
            </div>
          </div>
          <ul className="chat-tips">
            {reply.tips.map((t, i) => (
              <li key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="tip-bullet">→</span>{t}
              </li>
            ))}
          </ul>
          <div className="chat-warn">⚠️ {reply.warn}</div>
          <div className="chat-disclaimer">💡 AI-generated guidance. For serious symptoms, always consult a healthcare professional.</div>
        </div>
      )}
    </div>
  );
}
