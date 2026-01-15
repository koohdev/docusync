import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, User, Sparkles } from 'lucide-react';
import { createComplianceChat } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface ComplianceChatProps {
    isOpen: boolean;
    onClose: () => void;
    contextData: string;
    initialQuery?: string;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    isTyping?: boolean;
}

const ComplianceChat: React.FC<ComplianceChatProps> = ({ isOpen, onClose, contextData, initialQuery }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', role: 'model', text: 'Hello. I am the Compliance Officer. I can explain any formatting or citation rules you are struggling with.' }
    ]);
    const [input, setInput] = useState('');
    const [chatSession, setChatSession] = useState<any>(null);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (isOpen && !chatSession) {
            const session = createComplianceChat(contextData);
            setChatSession(session);
        }
    }, [isOpen, contextData, chatSession]);

    // Handle initial query trigger (e.g. from "Explain Rule" button)
    useEffect(() => {
        if (isOpen && chatSession && initialQuery && !hasInitialized.current) {
            hasInitialized.current = true;
            handleSend(initialQuery);
        }
    }, [isOpen, chatSession, initialQuery]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || !chatSession) return;

        const userMsgId = crypto.randomUUID();
        setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: textToSend }]);
        setInput('');
        setIsSending(true);

        try {
            // Optimistic AI message placeholder
            const aiMsgId = crypto.randomUUID();
            setMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: '', isTyping: true }]);

            const result = await chatSession.sendMessageStream({ message: textToSend });
            
            let fullText = '';
            for await (const chunk of result) {
                const c = chunk as GenerateContentResponse;
                const chunkText = c.text || '';
                fullText += chunkText;
                
                setMessages(prev => prev.map(m => 
                    m.id === aiMsgId ? { ...m, text: fullText, isTyping: false } : m
                ));
            }
        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', text: "I'm having trouble connecting to the handbook database right now." }]);
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-8 z-50 w-96 max-w-[calc(100vw-4rem)] shadow-2xl rounded-2xl overflow-hidden border border-slate-200 bg-white animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Compliance Assistant</h3>
                        <p className="text-xs text-blue-100">Ask about rules & guidelines</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tr-sm' 
                                : 'bg-blue-600 text-white shadow-md shadow-blue-600/10 rounded-tl-sm'
                        }`}>
                            {msg.text}
                            {msg.isTyping && <span className="inline-block w-1 h-3 ml-0.5 bg-white/50 animate-pulse align-middle"></span>}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 bg-white">
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all"
                >
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about formatting rules..." 
                        className="flex-1 bg-transparent border-none text-sm text-slate-900 focus:outline-none placeholder:text-slate-400"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isSending}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ComplianceChat;