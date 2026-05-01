import React from 'react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

const privacyPolicyContent = `
# Privacy Policy

**Effective Date:** 01/05/2026
**Website/App Name:** CountMantra
**Website URL:** https://codemanaicstudiocountmantra.vercel.app/

## 1. Introduction

Welcome to CountMantra. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application.

By using CountMantra, you agree to the collection and use of information in accordance with this policy.

---

## 2. Information We Collect

### 2.1 Personal Information

We do **not collect personally identifiable information** such as your name, email address, or phone number unless explicitly provided by you.

### 2.2 Usage Data

We may collect limited non-personal data such as:

* App usage patterns
* Device type and operating system
* App performance and crash logs

This helps us improve app functionality and user experience.

### 2.3 Mantra / Counter Data

* Your mantra counts and progress are stored locally on your device.
* We do not access, store, or share your spiritual or personal practice data externally.

---

## 3. How We Use Your Information

We use collected information to:

* Improve app performance and usability
* Fix bugs and technical issues
* Enhance user experience
* Analyze basic usage trends

We **do not sell, trade, or rent your personal data**.

---

## 4. Third-Party Services

We may use third-party services that may collect information, such as:

* Analytics tools (e.g., Firebase, Google Analytics)
* Advertising services (if enabled in future)

These third parties have their own privacy policies governing how they use your data.

---

## 5. Data Storage and Security

* Your core data (mantra counts) is stored locally on your device.
* We implement reasonable security measures to protect data.
* However, no method of transmission over the internet is 100% secure.

---

## 6. Children’s Privacy

CountMantra does not knowingly collect personal information from children under the age of 13. If you believe a child has provided personal data, please contact us so we can remove it.

---

## 7. Your Privacy Rights

Depending on your location, you may have rights to:

* Access your data
* Request deletion of your data
* Withdraw consent

Since most data is stored locally, you can delete it anytime by uninstalling the app.

---

## 8. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.

---

## 9. Contact Us

If you have any questions about this Privacy Policy, you can contact us at:

**Email:** :- teams@codemaniacstudio.com
**Website:** https://codemanaicstudiocountmantra.vercel.app/

---

## 10. Consent

By using CountMantra, you consent to this Privacy Policy.
`;

export function PrivacyPolicy({ isDarkMode, background, onBack }: { isDarkMode: boolean, background: string, onBack: () => void }) {
  const isDark = isDarkMode || !!background;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] flex flex-col ${
        !background ? (isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-800') : 'bg-black text-zinc-100'
      } overflow-y-auto font-sans selection:bg-teal-500/30`}
      style={{ color: isDark ? '#f4f4f5' : '#18181b' }}
    >
      {/* Background Image Layer Consistency */}
      {background && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${background})` }}
        >
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/95' : 'bg-zinc-950/98'} backdrop-blur-2xl`}></div>
        </div>
      )}

      <div className={`sticky top-0 z-[110] w-full p-4 flex items-center justify-between backdrop-blur-xl border-b ${
        isDark ? 'border-white/10 bg-black/40' : 'border-zinc-200 bg-white/40'
      }`}>
        <button 
          onClick={onBack}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
            isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-zinc-900 border border-zinc-200'
          }`}
        >
          ← Back to Counter
        </button>
        <div className="flex items-center gap-2 text-teal-500 mr-2">
          <Shield size={20} fill="currentColor" fillOpacity={0.1} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Security Verified</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 w-full max-w-3xl mx-auto p-8 md:p-16">
        <div className="markdown-body">
          <Markdown>{privacyPolicyContent}</Markdown>
        </div>
        
        <div className={`mt-20 pt-10 border-t ${isDark ? 'border-white/10' : 'border-zinc-200'} text-center pb-20`}>
          <p className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">
            © {new Date().getFullYear()} Tapasya by Codemaniac Studio
          </p>
          <p className="text-[8px] uppercase tracking-[0.1em] opacity-20 mt-2">
            Crafted for Mindful Presence
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .markdown-body { 
          color: ${isDark ? '#e4e4e7 !important' : '#27272a !important'}; 
          font-size: 1rem;
          line-height: 1.8;
        }
        .markdown-body h1 { 
          font-size: 3rem; 
          font-weight: 900; 
          margin-bottom: 2.5rem; 
          color: #14b8a6 !important; 
          text-transform: uppercase; 
          letter-spacing: -0.06em; 
          line-height: 0.85;
          margin-top: 0;
        }
        .markdown-body h2 { 
          font-size: 1.5rem; 
          font-weight: 800; 
          margin-top: 3.5rem; 
          margin-bottom: 1.5rem; 
          color: #14b8a6 !important;
          border-bottom: 2px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
          padding-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        .markdown-body h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: ${isDark ? '#fafafa !important' : '#09090b !important'};
        }
        .markdown-body p { 
          margin-bottom: 1.5rem; 
          color: inherit !important;
        }
        .markdown-body ul { 
          list-style-type: none; 
          padding-left: 0; 
          margin-bottom: 2rem; 
        }
        .markdown-body li { 
          margin-bottom: 1rem; 
          padding-left: 1.5rem;
          position: relative;
          color: inherit !important;
        }
        .markdown-body li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #14b8a6;
          font-weight: bold;
        }
        .markdown-body hr { 
          height: 1px; 
          border: none; 
          background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}; 
          margin: 3.5rem 0; 
        }
        .markdown-body strong { 
          font-weight: 800; 
          color: #14b8a6 !important; 
        }
        @media (max-width: 640px) {
          .markdown-body h1 { font-size: 2.25rem; }
          .markdown-body h2 { font-size: 1.25rem; }
        }
      `}} />
    </motion.div>
  );
}
