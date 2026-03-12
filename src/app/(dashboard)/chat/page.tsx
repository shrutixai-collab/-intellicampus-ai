'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Search, Phone, Video, MoreVertical, Bot, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { chatContacts } from '@/data/seed-data';
import type { ChatContact, ChatMessage } from '@/types';

export default function ChatPage() {
  const [contacts, setContacts] = useState<ChatContact[]>(chatContacts);
  const [activeContact, setActiveContact] = useState<ChatContact>(chatContacts[0]);
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeContact.messages, isAiTyping]);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const aiAutoReply = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes('saturday') || t.includes('shaniwar') || t.includes('sunday') || t.includes('holiday') || t.includes('school band')) {
      return '🏫 Saturday 14th March school CLOSED hai (Holi holiday). School 16th March Monday ko reopen hogi. Koi aur query ho toh bataiye! 🙏';
    }
    if (t.includes('attendance') || t.includes('kitni hai') || t.includes('present') || t.includes('absent')) {
      return `Namaste! Aapke ward ki current attendance school records mein note ki gayi hai. Accurate attendance dekhne ke liye aap school portal par login kar sakte hain ya office se contact kar sakte hain: 020-27356789. ℹ️`;
    }
    if (t.includes('fee') || t.includes('paisa') || t.includes('payment') || t.includes('last date') || t.includes('deadline')) {
      return '💰 Fee deadline: 15th March 2026. Payment options:\n1. UPI/NEFT — school account details office se milenge\n2. Cheque/DD — accounts office, Mon-Fri 9am-2pm\n3. Cash counter — school timings mein\n\nLate fee charges laag sakte hain 15th March ke baad. 🙏';
    }
    if (t.includes('bus') || t.includes('transport') || t.includes('late') || t.includes('driver')) {
      return '🚌 Aapki transport complaint register ho gayi hai. Ref #: ' + Math.floor(2860 + Math.random() * 20) + '. Transport Head Mr. Sanjay Patil ko notify kar diya gaya hai. Expected response: 24 hours. Urgent ho toh: +91 98100 00000 📞';
    }
    if (t.includes('certificate') || t.includes('bonafide') || t.includes('tc') || t.includes('transfer') || t.includes('character')) {
      const refNo = Math.floor(135 + Math.random() * 10);
      return `📄 Certificate request register ho gaya hai! ✅\nRef No: #CR-${refNo}\n\nProcessing time: 3 working days\nCollection: School main office (Gate 1)\nTimings: 9 AM - 4 PM, Mon-Fri\nID proof saath laayein.\n\nReady hone par WhatsApp notification aayega! 🔔`;
    }
    if (t.includes('exam') || t.includes('result') || t.includes('test') || t.includes('marks')) {
      return '📝 Exam schedule aur results ke liye school notice board aur official WhatsApp group check karein. Latest updates principal ke office se ya class teacher se mile milte hain. PTM 18th March ko hai jahan detailed discussion hoga! 📅';
    }
    if (t.includes('complaint') || t.includes('problem') || t.includes('issue') || t.includes('shikayat')) {
      const refNo = Math.floor(2860 + Math.random() * 20);
      return `📋 Aapki complaint register ho gayi hai (Ref: #${refNo}). AI ne automatically categorize kar ke concerned department ko assign kar diya hai. Expected resolution: 48-72 hours. Status track kar sakte hain school app par. 🙏`;
    }
    if (t.includes('ptm') || t.includes('parent') || t.includes('meeting') || t.includes('teacher')) {
      return '👨‍👩‍👧 Parent-Teacher Meeting 18th March 2026 (Saturday) ko scheduled hai:\n• Class 6-7: 9:00-10:30 AM\n• Class 8-9: 10:30-12:00 PM\n• Class 10-12: 12:00-1:00 PM\n\nProgress reports distribute honge. Please school ID aur ward ka diary saath laayein! 📒';
    }
    if (t.includes('annual day') || t.includes('function') || t.includes('program')) {
      return '🎭 Annual Day: 28th March 2026 (Saturday), 5:30 PM\n📍 School Auditorium\n\nEntry: Invitation card required (1 card = 2 parents)\nPerforming students: Report by 3:30 PM in costume\nParking: Sports Ground, Gate 2\n\nAapka swagat hai! 🌟';
    }
    // Default response
    return `Namaste! 🙏 Aapka message receive hua. Main IntelliCampus AI hun.\n\nAap mujhse pooch sakte hain:\n• Fee status & payment\n• Attendance information\n• Certificate requests\n• Complaints & grievances\n• Exam schedules\n• Bus & transport issues\n• Event information\n\nAapki kya help kar sakta hun? 😊`;
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');

    // Add parent message
    const parentMsg: ChatMessage = {
      id: `m${Date.now()}`,
      text,
      sender: 'parent',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedContact = { ...activeContact, messages: [...activeContact.messages, parentMsg], lastMessage: text };
    setActiveContact(updatedContact);
    setContacts(cs => cs.map(c => c.id === activeContact.id ? updatedContact : c));

    // AI typing indicator
    setIsAiTyping(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    setIsAiTyping(false);

    // AI reply
    const aiMsg: ChatMessage = {
      id: `m${Date.now() + 1}`,
      text: aiAutoReply(text),
      sender: 'ai',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const finalContact = { ...updatedContact, messages: [...updatedContact.messages, aiMsg], lastMessage: `AI: ${aiMsg.text.slice(0, 40)}...`, unread: 0 };
    setActiveContact(finalContact);
    setContacts(cs => cs.map(c => c.id === activeContact.id ? finalContact : c));
  };

  return (
    <div className="page-enter">
      <Breadcrumb />
      <div className="mb-4">
        <h1 className="text-2xl font-bold">WhatsApp AI Simulator</h1>
        <p className="text-muted-foreground text-sm mt-1">Demo: See how IntelliCampus AI handles parent & student queries in Hinglish</p>
      </div>

      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <span className="font-semibold">Demo Mode:</span> Click any contact to view pre-loaded AI conversations. Type any message to get an AI response in real-time. Try asking about fees, attendance, bus, certificates, PTM, etc.
        </p>
      </div>

      <Card className="h-[calc(100vh-280px)] min-h-[500px] overflow-hidden flex flex-row">
        {/* Contact List */}
        <div className="w-80 border-r bg-background flex flex-col flex-shrink-0">
          {/* Header */}
          <div className="p-3 border-b bg-[#f0f2f5] dark:bg-[#111b21]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">IntelliCampus AI</p>
                  <p className="text-xs text-emerald-500">● Online</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                className="pl-8 h-8 text-xs bg-white dark:bg-[#2a3942] border-0 rounded-lg"
                placeholder="Search or start new chat"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Contact list */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${activeContact.id === contact.id ? 'bg-muted' : ''}`}
              >
                <div className="w-10 h-10 bg-[#0F172A] dark:bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {contact.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground truncate">{contact.name}</p>
                    <p className="text-xs text-muted-foreground flex-shrink-0 ml-1">{contact.time}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{contact.lastMessage}</p>
                </div>
                {contact.unread > 0 && (
                  <div className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-white font-bold">{contact.unread}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#ECE5DD] dark:bg-[#0b141a]">
          {/* Chat header */}
          <div className="h-14 bg-[#f0f2f5] dark:bg-[#202c33] border-b flex items-center px-4 gap-3">
            <div className="w-9 h-9 bg-[#0F172A] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {activeContact.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{activeContact.name}</p>
              <p className="text-xs text-emerald-500">
                {isAiTyping ? 'AI is typing...' : 'AI-powered • Responds instantly'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Phone className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Video className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><MoreVertical className="w-4 h-4" /></Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* AI intro chip */}
            <div className="flex justify-center mb-4">
              <div className="bg-[#e1f2fb] dark:bg-[#182229] text-[#54656f] dark:text-[#8696a0] text-xs px-4 py-1.5 rounded-full">
                🤖 IntelliCampus AI is active — responses are automated
              </div>
            </div>

            {activeContact.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] px-3 py-2 shadow-sm ${msg.sender === 'ai' ? 'bubble-received' : 'bubble-sent'}`}>
                  {msg.sender === 'ai' && (
                    <p className="text-[10px] text-[#25D366] font-semibold mb-0.5 flex items-center gap-1">
                      <Bot className="w-3 h-3" /> IntelliCampus AI
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: msg.sender === 'ai' ? undefined : '#111827' }}>
                    {msg.text}
                  </p>
                  <p className="text-[10px] text-right mt-0.5" style={{ color: msg.sender === 'ai' ? '#8696a0' : '#4b5563' }}>
                    {msg.time} {msg.sender === 'ai' ? '✓✓' : ''}
                  </p>
                </div>
              </div>
            ))}

            {isAiTyping && (
              <div className="flex justify-start">
                <div className="bubble-received px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="h-14 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center px-4 gap-3">
            <Input
              className="flex-1 h-9 bg-white dark:bg-[#2a3942] border-0 rounded-lg text-sm"
              placeholder="Type a message..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />
            <Button
              size="icon"
              className="w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex-shrink-0"
              onClick={handleSend}
              disabled={!inputText.trim() || isAiTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
