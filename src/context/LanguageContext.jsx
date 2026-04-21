/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
  uz: {
    title: "AI Desalination Smart System",
    home: "Bosh sahifa",
    login: "Kirish",
    dashboard: "Dashboard",
    analytics: "Analitika",
    reports: "Hisobotlar",
    logout: "Chiqish",
    username: "Foydalanuvchi nomi",
    password: "Parol",
    login_btn: "Tizimga kirish",
    welcome: "Xush kelibsiz!",
    team_members: "Jamoa a'zolari",
    power: "AES Quvvati",
    hydrogen: "Vodorod ishlab chiqarish",
    water: "Suv ishlab chiqarish",
    safety: "Xavfsizlik holati",
    radiation: "Radiatsiya",
    leak: "Sizib chiqish",
    normal: "Normal",
    warning: "Ogohlantirish",
    danger: "Xavfli",
    no_leak: "Yo'q",
    toggle_theme: "Mavzuni o'zgartirish",
    lang: "Til"
  },
  en: {
    title: "AI Desalination Smart System",
    home: "Home",
    login: "Login",
    dashboard: "Dashboard",
    analytics: "Analytics",
    reports: "Reports",
    logout: "Logout",
    username: "Username",
    password: "Password",
    login_btn: "Login",
    welcome: "Welcome!",
    team_members: "Team Members",
    power: "AES Power",
    hydrogen: "Hydrogen Production",
    water: "Water Production",
    safety: "Safety Status",
    radiation: "Radiation",
    leak: "Leak",
    normal: "Normal",
    warning: "Warning",
    danger: "Danger",
    no_leak: "None",
    toggle_theme: "Toggle Theme",
    lang: "Language"
  },
  ru: {
    title: "AI система опреснения воды",
    home: "Главная",
    login: "Вход",
    dashboard: "Панель управления",
    analytics: "Аналитика",
    reports: "Отчеты",
    logout: "Выход",
    username: "Имя пользователя",
    password: "Пароль",
    login_btn: "Войти",
    welcome: "Добро пожаловать!",
    team_members: "Члены команды",
    power: "Мощность АЭС",
    hydrogen: "Производство водорода",
    water: "Производство воды",
    safety: "Статус безопасности",
    radiation: "Радиация",
    leak: "Утечка",
    normal: "Нормально",
    warning: "Предупреждение",
    danger: "Опасно",
    no_leak: "Нет",
    toggle_theme: "Сменить тему",
    lang: "Язык"
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'uz');

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
