import Link from "next/link";
import { ArrowRight, BarChart3, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
          
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">
            <Sparkles className="mr-2 h-4 w-4" />
            <span className="font-medium">AI-Powered Habit Tracking</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
            Build habits that <br className="hidden sm:block" /> actually stick
          </h1>

          <p className="text-xl text-muted-foreground max-w-[800px] leading-relaxed">
            The premium spreadsheet-style habit tracker that uses AI to analyze your performance and keep you motivated. Clean, fast, and beautifully designed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-primary text-primary-foreground">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-lg h-14 px-8 rounded-full border-2 hover:bg-muted/50 transition-colors">
                Log In
              </Button>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
            <div className="p-8 rounded-3xl border bg-card/40 backdrop-blur-xl shadow-lg border-primary/10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Spreadsheet Interface</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track your habits with the speed and precision of a spreadsheet, but the beauty of a premium app.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl border bg-card/40 backdrop-blur-xl shadow-lg border-primary/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 relative z-10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">AI Habit Coach</h3>
              <p className="text-muted-foreground leading-relaxed relative z-10">
                Our Gemini AI integration analyzes your streaks and provides personalized motivational feedback.
              </p>
            </div>

            <div className="p-8 rounded-3xl border bg-card/40 backdrop-blur-xl shadow-lg border-primary/10">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Goal Mastery</h3>
              <p className="text-muted-foreground leading-relaxed">
                Stay consistent and watch your progress soar with automatic streak calculations and rich visual charts.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
