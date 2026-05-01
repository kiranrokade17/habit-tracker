"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Key, ExternalLink } from "lucide-react";
import { Habit, HabitEntry } from "@/lib/types";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

interface GeminiFeedbackProps {
  habits: Habit[];
  entries: HabitEntry[];
}

export function GeminiFeedback({ habits, entries }: GeminiFeedbackProps) {
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userApiKey, setUserApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) {
      setUserApiKey(storedKey);
      setHasKey(true);
    }
  }, []);

  const saveApiKey = () => {
    if (userApiKey.trim().length > 0) {
      localStorage.setItem("gemini_api_key", userApiKey.trim());
      setHasKey(true);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setUserApiKey("");
    setHasKey(false);
    setMessages([]);
  };

  const generateFeedback = async (isFollowUp = false) => {
    if (isFollowUp && !chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    if (isFollowUp) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setChatInput("");
    }
    
    setLoading(true);
    setError(null);
    try {
      // Real stats calculation
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return format(d, "yyyy-MM-dd");
      });

      const recentEntries = entries.filter(e => last7Days.includes(e.date));
      const completedRecent = recentEntries.filter(e => e.completed).length;
      const totalPossibleRecent = habits.length * 7;
      const completionRate = totalPossibleRecent === 0 ? 0 : Math.round((completedRecent / totalPossibleRecent) * 100);
      
      // Calculate most missed habit
      const habitMisses: Record<string, number> = {};
      habits.forEach(h => habitMisses[h.id] = 7); // start with 7 misses
      recentEntries.forEach(e => {
        if (e.completed && habitMisses[e.habit_id] !== undefined) {
          habitMisses[e.habit_id]--;
        }
      });
      
      let mostMissed = "None";
      let maxMisses = -1;
      habits.forEach(h => {
        if (habitMisses[h.id] > maxMisses) {
          maxMisses = habitMisses[h.id];
          mostMissed = h.name;
        }
      });

      let currentStreak = 0;
      const checkDate = new Date();
      while (true) {
        const dStr = format(checkDate, "yyyy-MM-dd");
        const hasCompleted = entries.some(e => e.date === dStr && e.completed);
        if (hasCompleted) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          if (currentStreak === 0 && dStr === todayStr) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
          break;
        }
      }

      const stats = {
        totalHabits: habits.length,
        completionRate: completionRate,
        bestStreak: currentStreak, 
        mostMissed: maxMisses > 0 ? mostMissed : "None! Perfect week!"
      };

      const res = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stats, 
          habits, 
          chatHistory: isFollowUp ? messages : [], 
          prompt: isFollowUp ? userMessage : "", 
          apiKey: userApiKey 
        })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch feedback");
      
      setMessages(prev => [...prev, { role: 'model', content: data.review }]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 bg-gradient-to-br from-card to-card/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Coach
        </h3>
        {hasKey && messages.length === 0 && !loading && (
          <Button 
            onClick={() => generateFeedback(false)} 
            variant="outline" 
            size="sm" 
            className="gap-2"
            disabled={habits.length === 0}
          >
            {habits.length === 0 ? "Add habits first" : "Analyze My Week"}
          </Button>
        )}
        {hasKey && (
          <Button onClick={clearApiKey} variant="ghost" size="sm" className="text-xs text-muted-foreground ml-2">
            Change Key
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pb-2">
        {!hasKey ? (
          <div className="flex flex-col h-full items-center justify-center space-y-4 px-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h4 className="font-semibold text-foreground">Bring Your Own Key</h4>
              <p className="text-sm text-muted-foreground">
                To use the AI Coach, you need a free Google Gemini API key. We don&apos;t store your key on our servers; it stays right here in your browser.
              </p>
            </div>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary flex items-center hover:underline"
            >
              Get a free API key <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            <div className="flex w-full max-w-sm items-center space-x-2 mt-4">
              <Input 
                type="password" 
                placeholder="Paste your Gemini API Key here..." 
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
              />
              <Button type="button" onClick={saveApiKey}>Save</Button>
            </div>
          </div>
        ) : (
          <>
            {messages.length === 0 && !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 text-center opacity-60">
                <Sparkles className="w-10 h-10 mb-2" />
                <p>Click &quot;Analyze My Week&quot; to get your personalized coaching report.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-muted/50 text-foreground rounded-tl-sm border border-muted'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted/50 text-muted-foreground rounded-2xl rounded-tl-sm border border-muted px-4 py-3 flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Coach is typing...
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center text-destructive/80 text-sm p-4 text-center flex-col items-center border border-destructive/20 rounded-xl bg-destructive/5 mt-4">
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={() => setError(null)} className="mt-4">Dismiss Error</Button>
              </div>
            )}
          </>
        )}
      </div>

      {hasKey && messages.length > 0 && (
        <div className="mt-4 pt-4 border-t flex items-center gap-2">
          <Input 
            type="text" 
            placeholder="Ask your coach a question..." 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateFeedback(true)}
            className="flex-1 rounded-full bg-muted/50 border-muted"
            disabled={loading}
          />
          <Button 
            onClick={() => generateFeedback(true)} 
            disabled={!chatInput.trim() || loading}
            size="sm"
            className="rounded-full px-4"
          >
            Send
          </Button>
        </div>
      )}
    </div>
  );
}
