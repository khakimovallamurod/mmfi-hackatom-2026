import React, { useEffect, useState } from 'react';
import { Bot, SendHorizontal, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const languageConfig = {
  uz: {
    label: "O'zbekcha",
    placeholder: 'Savolingizni yozing...',
    offline: 'Gemini API key topilmadi, chatbot hali ishga tushmadi.',
    welcome: "Salom. Men admin yordamchi chatbotman. AES va desalination bo'yicha yordam beraman.",
    send: 'Yuborish',
    thinking: 'Yuborilmoqda...',
    endpointError: "Server bilan bog'lanishda xatolik bo'ldi.",
    systemInstruction:
      "Siz AES desalination admin paneli yordamchisiz. Faqat o'zbek tilida, aniq va qisqa javob bering.",
  },
  en: {
    label: 'English',
    placeholder: 'Write your question...',
    offline: 'Gemini API key is missing, chatbot is not started yet.',
    welcome: 'Hello. I am the admin assistant chatbot for AES desalination operations.',
    send: 'Send',
    thinking: 'Sending...',
    endpointError: 'Connection failed.',
    systemInstruction:
      'You are an AES desalination admin assistant. Reply only in English with concise operational answers.',
  },
  ru: {
    label: 'Русский',
    placeholder: 'Введите ваш вопрос...',
    offline: 'Gemini API key не найден, чат-бот пока не запущен.',
    welcome: 'Здравствуйте. Я помощник админ-панели AES для desalination системы.',
    send: 'Отправить',
    thinking: 'Отправка...',
    endpointError: 'Ошибка подключения.',
    systemInstruction:
      'Вы помощник админ-панели AES desalination. Отвечайте только на русском, кратко и по делу.',
  },
};

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`
  : null;

const AdminChatbot = () => {
  const { lang } = useLanguage();
  const locale = languageConfig[lang] || languageConfig.uz;
  const [input, setInput] = useState('');
  const [isSending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: locale.welcome,
    },
  ]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || !API_KEY || !GEMINI_URL) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setSending(true);

    try {
      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: nextMessages.map((message) => ({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.text }],
          })),
          systemInstruction: {
            parts: [{ text: locale.systemInstruction }],
          },
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 500,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('gemini_failed');
      }

      const data = await response.json();
      const modelText =
        data?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text)
          .filter(Boolean)
          .join('\n') || locale.endpointError;

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: modelText,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: locale.endpointError,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    setMessages((current) => {
      if (current.length !== 1 || current[0].role !== 'assistant') {
        return current;
      }
      return [
        {
          ...current[0],
          text: locale.welcome,
        },
      ];
    });
  }, [locale.welcome]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-blue-500" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Admin AI Chatbot</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Gemini 2.5 Flash · {locale.label}
        </span>
      </div>

      {!API_KEY ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/10 dark:text-amber-300">
          {locale.offline}
        </div>
      ) : null}

      <div className="mt-4 h-64 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[92%] rounded-2xl px-4 py-2 text-sm leading-6 ${
              message.role === 'user'
                ? 'ml-auto bg-blue-600 font-medium text-white'
                : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            {message.text}
          </div>
        ))}
        {isSending ? (
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Sparkles size={14} className="animate-pulse" />
            {locale.thinking}
          </div>
        ) : null}
      </div>

      <form onSubmit={sendMessage} className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={locale.placeholder}
          disabled={!API_KEY || isSending}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={!API_KEY || isSending || input.trim() === ''}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SendHorizontal size={14} />
          {locale.send}
        </button>
      </form>
    </section>
  );
};

export default AdminChatbot;
