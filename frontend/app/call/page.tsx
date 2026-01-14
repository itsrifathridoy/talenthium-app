'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiMic, FiVideo, FiMonitor, FiMessageCircle, FiPhoneOff, FiSettings, FiSun, FiMoon } from 'react-icons/fi';
import { useConversation } from '@elevenlabs/react';
import VideoPlaceholder from '@/components/call/VideoPlaceholder';
import CodeEditor from '@/components/call/CodeEditor';
import TldrawCanvas from '@/components/call/TldrawCanvas';
import { ChatBox } from '@/components/call/Chat';
import { Lang, sampleCode } from '@/components/call/types';

type View = 'video' | 'code' | 'canvas';

export default function CallPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Initialize view from query parameters
    const [view, setView] = useState<View>(() => {
        const tabParam = searchParams?.get('tab') as View;
        return ['video', 'code', 'canvas'].includes(tabParam) ? tabParam : 'video';
    });

    const [messages, setMessages] = useState([
        {
            id: 'm1',
            author: 'Other' as const,
            name: 'Helen Miller',
            initials: 'HM',
            text: "Hi! I'm Helen Miller, an HR Specialist. If you have any questions regarding the interview, you can write them here. You can tag a specific person from the Participants tab with the @ symbol if needed.",
            ts: Date.now() - 1000 * 60 * 10
        },
        {
            id: 'm2',
            author: 'You' as const,
            text: "Hi! Thanks, I will if I have any questions.",
            ts: Date.now() - 1000 * 60 * 9
        },
        {
            id: 'm3',
            author: 'You' as const,
            text: "Does the text I enter in the 'Notes' tab get sent as a response, or is it just for my use and not sent?",
            ts: Date.now() - 1000 * 60 * 8
        }
    ]);

    // Initialize showChat from query parameters
    const [showChat, setShowChat] = useState(() => {
        const chatParam = searchParams?.get('chat');
        return chatParam === 'true';
    });

    const [theme, setTheme] = useState<"light" | "dark">("light");

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    // Save theme to localStorage when it changes
    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Update chat visibility when URL search params change
    useEffect(() => {
        const chatParam = searchParams?.get('chat');
        setShowChat(chatParam === 'true');
    }, [searchParams]);

    // Update view when URL search params change
    useEffect(() => {
        const tabParam = searchParams?.get('tab') as View;
        if (['video', 'code', 'canvas'].includes(tabParam)) {
            setView(tabParam);
        }
    }, [searchParams]);

    // ElevenLabs conversation state
    const [hasPermission, setHasPermission] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [speechText, setSpeechText] = useState("Hello! I'm your AI interviewer. I'm ready to begin our conversation. Please introduce yourself and tell me about your experience.");

    const [lang, setLang] = useState<Lang>('typescript');
    const [code, setCode] = useState<string>(sampleCode('typescript'));
    const codeRef = useRef<string>(code);
    // Track tab/window switches during an active conversation
    const tabSwitchCountRef = useRef<number>(0);
    const lastSwitchTsRef = useRef<number>(0);
    const sessionActiveRef = useRef<boolean>(false);

    // Update code sample when language changes
    useEffect(() => {
        setCode(sampleCode(lang));
    }, [lang]);

    // Keep a ref in sync with the latest code so tools can read fresh content
    useEffect(() => {
        codeRef.current = code;
    }, [code]);

    // Listen for tab/window switches and count them while session is active
    useEffect(() => {
        const recordSwitch = () => {
            if (!sessionActiveRef.current) return;
            const now = Date.now();
            // Debounce to avoid double-counting from blur + visibilitychange
            if (now - lastSwitchTsRef.current < 500) return;
            tabSwitchCountRef.current += 1;
            lastSwitchTsRef.current = now;
            // console.debug('[DEBUG] Tab/window switch #', tabSwitchCountRef.current);
        };

        const onVisibility = () => {
            if (document.visibilityState === 'hidden') recordSwitch();
        };
        const onBlur = () => recordSwitch();

        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('blur', onBlur);
        return () => {
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('blur', onBlur);
        };
    }, []);

    // Debug: log code every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('[DEBUG] Current code:', code);
        }, 3000);
        return () => clearInterval(interval);
    }, [code]);
    // ElevenLabs conversation hook
    const conversation = useConversation({
        onConnect: () => {
            console.log("Connected to ElevenLabs");
        },
        onDisconnect: () => {
            console.log("Disconnected from ElevenLabs");
        },
        onMessage: (message) => {
            console.log("Received message:", message);
            // Extract the message text and update speech text
            if (message && typeof message === 'object' && 'message' in message) {
                setSpeechText(message.message as string);
            }
        },
        onDebug: (...args: any[]) => {
            try {
                console.debug('[ElevenLabs][Debug]', ...args);
            } catch {
                // noop
            }
        },
        onError: (error: string | Error) => {
            setErrorMessage(typeof error === "string" ? error : error.message);
            console.error("Error:", error);
        },
    });

    const { status, isSpeaking } = conversation;

    // Request microphone permission on component mount
    useEffect(() => {
        const requestMicPermission = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                setHasPermission(true);
            } catch (error) {
                setErrorMessage("Microphone access denied");
                console.error("Error accessing microphone:", error);
            }
        };

        requestMicPermission();
    }, []);

    const handleStartConversation = async () => {
        try {
            const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
            if (!agentId) {
                setErrorMessage("Agent ID not configured");
                return;
            }

            const conversationId = await conversation.startSession({
                agentId,
                connectionType: 'webrtc',
                userId: `user-${Date.now()}`,
                clientTools: {
                    extractCode: async () => {
                        const current = codeRef.current;
                        console.log('[DEBUG] extractCode called. Returning code (length):', current?.length);
                        return current;
                    },
                    switchToCodeEditor: async () => {
                        console.log('[DEBUG] switchToCodeEditor called');
                        updateView('code');
                    },
                    switchToVideo: async () => {
                        console.log('[DEBUG] switchToVideo called');
                        updateView('video');
                    }
                }
            });
            console.log('[DEBUG] Session started. Code snapshot (length):', codeRef.current?.length);
            console.log("Started conversation:", conversationId);
            // Reset and enable tab/window switch tracking
            tabSwitchCountRef.current = 0;
            lastSwitchTsRef.current = 0;
            sessionActiveRef.current = true;
        } catch (error) {
            setErrorMessage("Failed to start conversation");
            console.error("Error starting conversation:", error);
        }
    };

    const handleEndConversation = async () => {
        try {
            await conversation.endSession();
            // Log number of tab/window switches during the session
            console.log('[DEBUG] Tab/window switches during session:', tabSwitchCountRef.current);
            sessionActiveRef.current = false;
        } catch (error) {
            setErrorMessage("Failed to end conversation");
            console.error("Error ending conversation:", error);
        }
    };

    const handleSend = (text: string) => {
        if (!text.trim()) return;
        const message = {
            id: cryptoRandomId(),
            author: 'You' as const,
            text: text.trim(),
            ts: Date.now()
        };
        setMessages((prev) => [...prev, message]);
    };

    const toggleChat = () => {
        const newShowChat = !showChat;
        setShowChat(newShowChat);

        // Update URL with query parameter
        const currentParams = new URLSearchParams(searchParams?.toString() || '');
        if (newShowChat) {
            currentParams.set('chat', 'true');
        } else {
            currentParams.delete('chat');
        }

        const newUrl = currentParams.toString() ? `?${currentParams.toString()}` : '';
        router.replace(`/call${newUrl}`, { scroll: false });
    };

    const updateView = (newView: View) => {
        setView(newView);

        // Update URL with query parameter
        const currentParams = new URLSearchParams(searchParams?.toString() || '');
        if (newView === 'video') {
            currentParams.delete('tab');
        } else {
            currentParams.set('tab', newView);
        }

        const newUrl = currentParams.toString() ? `?${currentParams.toString()}` : '';
        router.replace(`/call${newUrl}`, { scroll: false });
    };

    const toggleTo = (target: Exclude<View, 'video'>) => {
        const newView = view === target ? 'video' : target;
        updateView(newView);
    };


    return (
        <div className={`relative h-dvh overflow-hidden text-[var(--foreground)] ${
            theme === "light"
                ? "bg-gradient-to-br from-emerald-50 via-white to-emerald-100"
                : "bg-[#0a1813]"
        }`}>
            {/* App-wide background: glow + grid */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[110vw] w-[110vw] ${
                    theme === "light"
                        ? "bg-[radial-gradient(circle,rgba(16,185,129,0.08)_0%,transparent_60%)]"
                        : "bg-[radial-gradient(circle,rgba(19,255,140,0.12)_0%,transparent_70%)]"
                }`} />
                <svg width="100%" height="100%">
                    <defs>
                        <pattern id="grid-call" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={theme === "light" ? "rgba(16,185,129,0.1)" : "#1a2a22"} strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-call)" />
                </svg>
            </div>

            <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col p-5">
                <header className="mb-3 flex items-center justify-between">
                    <div>
                        <h1 className={`text-xl font-bold tracking-tight drop-shadow-sm ${
                            theme === "light"
                                ? "text-emerald-700"
                                : "text-emerald-200"
                        }`}>
                            Interview Call: Senior Frontend Engineer
                        </h1>
                    </div>
                    <button
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors backdrop-blur-sm ${
                            theme === "light"
                                ? "bg-white/80 border border-emerald-200/50 text-emerald-700 hover:bg-white shadow-sm"
                                : "bg-emerald-900/40 border border-emerald-300/30 text-emerald-100 hover:bg-emerald-800/40"
                        }`}
                    >
                        {theme === "light" ? <FiMoon size={16} /> : <FiSun size={16} />}
                        {theme === "light" ? "Dark" : "Light"}
                    </button>
                </header>

                <main className={`grid flex-1 min-h-0 gap-5 ${showChat ? 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]' : 'grid-cols-1'}`}>
                    <section
                        aria-label="Stage"
                        className={`relative h-full overflow-hidden rounded-xl border shadow-[inset_0_0_0_1px_rgba(16,185,129,0.08)] ${
                            theme === "light"
                                ? "border-emerald-200/50 bg-white/80"
                                : "border-emerald-300/20 bg-[#0b1412]"
                        } ${!showChat ? 'w-full col-span-1' : ''}`}
                    >
                        {/* Stage-only grid overlay */}
                        <div className="pointer-events-none absolute inset-0 z-0 opacity-90">
                            <svg width="100%" height="100%">
                                <defs>
                                    <pattern id="grid-stage" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke={theme === "light" ? "rgba(16,185,129,0.05)" : "#12221b"} strokeWidth="1" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid-stage)" />
                            </svg>
                        </div>
                        {/* Subtle vignette */}
                        <div className={`pointer-events-none absolute inset-0 z-0 ${
                            theme === "light"
                                ? "bg-[radial-gradient(1200px_1200px_at_10%_10%,rgba(16,185,129,0.02),transparent_55%)]"
                                : "bg-[radial-gradient(1200px_1200px_at_10%_10%,rgba(86,251,212,0.06),transparent_55%)]"
                        }`} />

                        <div className="relative z-10 h-full w-full">
                            {/* Switcher at absolute bottom right corner of stage */}
                            <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateView(view === 'code' ? 'video' : 'code')}
                                    className={`flex items-center gap-1 rounded-full border px-4 py-1 text-xs font-medium shadow transition-all ${
                                        view === 'code'
                                            ? theme === "light"
                                                ? 'ring-2 ring-emerald-500 border-emerald-300/50 bg-emerald-50 text-emerald-700'
                                                : 'ring-2 ring-emerald-400/60 border-emerald-300/30 bg-emerald-900/40 text-emerald-100'
                                            : theme === "light"
                                                ? 'border-emerald-200/50 bg-white/90 text-emerald-700 hover:bg-white backdrop-blur-sm'
                                                : 'border-emerald-300/30 bg-emerald-900/40 text-emerald-100 hover:bg-emerald-800/40'
                                    }`}
                                >
                                    <span className="font-mono text-[13px]">{'{ }'}</span> Code
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateView(view === 'canvas' ? 'video' : 'canvas')}
                                    className={`flex items-center gap-1 rounded-full border px-4 py-1 text-xs font-medium shadow transition-all ${
                                        view === 'canvas'
                                            ? theme === "light"
                                                ? 'ring-2 ring-emerald-500 border-emerald-300/50 bg-emerald-50 text-emerald-700'
                                                : 'ring-2 ring-emerald-400/60 border-emerald-300/30 bg-emerald-900/40 text-emerald-100'
                                            : theme === "light"
                                                ? 'border-emerald-200/50 bg-white/90 text-emerald-700 hover:bg-white backdrop-blur-sm'
                                                : 'border-emerald-300/30 bg-emerald-900/40 text-emerald-100 hover:bg-emerald-800/40'
                                    }`}
                                >
                                    <span className="text-xs">◼</span> Canvas
                                </button>
                            </div>

                            {/* Stage content */}
                            {view === 'video' && (
                                <VideoPlaceholder
                                    hasPermission={hasPermission}
                                    errorMessage={errorMessage}
                                    speechText={speechText}
                                    status={status}
                                    isSpeaking={isSpeaking}
                                    onStartConversation={handleStartConversation}
                                    onEndConversation={handleEndConversation}
                                    theme={theme}
                                />
                            )}
                            {view === 'code' && <CodeEditor lang={lang} code={code} setLang={setLang} setCode={setCode} theme={theme} />}
                            {view === 'canvas' && <TldrawCanvas theme={theme} />}

                            {/* Label at bottom left only for canvas */}
                            {view === 'canvas' && (
                                <div className={`absolute bottom-4 left-5 text-base drop-shadow-[0_0_10px_rgba(19,255,140,0.25)] ${
                                    theme === "light"
                                        ? "text-emerald-700"
                                        : "text-emerald-200/90"
                                }`}>
                                    Canvas
                                </div>
                            )}

                            {/* Auto Translator bubble only in video mode, then controls below */}
                            {view === 'video' && (
                                <>
                                    {/* <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 bottom-36 flex justify-center">
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-100/20 bg-transparent px-4 py-2 text-white whitespace-nowrap overflow-hidden" style={{fontSize: '16px', fontWeight: 400}}>
                      <span className="text-emerald-100/70 font-normal mr-2" style={{fontSize: '15px'}}>Auto Translator</span>
                      <span className="text-white font-normal truncate" style={{fontSize: '16px', maxWidth: '32em'}}>Hi Everyone, welcome to the interview. Please introduce yourself...</span>
                    </div>
                  </div> */}
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-10 w-full flex justify-center">
                                        <ControlsBar onChatClick={toggleChat} chatActive={showChat} theme={theme} />
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {showChat && (
                        <aside className="h-full min-h-0 overflow-hidden">
                            <ChatBox messages={messages} onSend={handleSend} theme={theme} />
                        </aside>
                    )}
                </main>
            </div>
        </div>
    );
}

function cryptoRandomId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as any).randomUUID();
    return Math.random().toString(36).slice(2);
}


function ControlsBar({ onChatClick, chatActive, theme }: { onChatClick: () => void; chatActive: boolean; theme: "light" | "dark" }) {
    const router = useRouter();
    // Use react-icons for modern control icons
    const controls = [
        { title: 'Mute Mic', icon: <FiMic size={22} /> },
        { title: 'Toggle Camera', icon: <FiVideo size={22} /> },
        { title: 'Share Screen', icon: <FiMonitor size={22} /> },
        { title: 'Chat', icon: <FiMessageCircle size={22} />, onClick: onChatClick, active: chatActive },
        { title: 'End Call', icon: <FiPhoneOff size={22} />, danger: true, onClick: () => router.back() },
        { title: 'Settings', icon: <FiSettings size={22} /> },
    ];
    return (
        <div className="flex w-full justify-center">
            <div className={`flex items-center gap-4 rounded-2xl px-4 py-2 ring-1 shadow-lg backdrop-blur-sm ${
                theme === "light"
                    ? "bg-white/80 ring-emerald-200/30"
                    : "bg-emerald-900/30 ring-emerald-300/10"
            }`}>
                {controls.map((c) => (
                    <button
                        key={c.title}
                        type="button"
                        aria-label={c.title}
                        title={c.title}
                        onClick={c.onClick}
                        className={`grid h-11 w-11 place-items-center rounded-full transition shadow-sm ${
                            c.danger
                                ? 'border-2 border-red-500 bg-red-500 text-white hover:bg-red-600'
                                : c.active
                                    ? theme === "light"
                                        ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/50'
                                        : 'bg-emerald-400/30 text-emerald-100 ring-2 ring-emerald-400'
                                    : theme === "light"
                                        ? 'bg-white/60 text-emerald-700 hover:bg-white/80 backdrop-blur-sm'
                                        : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-800/40'
                        }`}
                    >
                        {c.icon}
                    </button>
                ))}
            </div>
        </div>
    );
}
