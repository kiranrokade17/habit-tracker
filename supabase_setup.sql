-- 1. Create a table for Habits
CREATE TABLE public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'activity',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create a table for Habit Entries (Daily logs)
CREATE TABLE public.habit_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(habit_id, date) -- Ensure only one entry per habit per day
);

-- 3. Set up Row Level Security (RLS)
-- Enable RLS on both tables
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_entries ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only see and modify their own data
CREATE POLICY "Users can manage their own habits" 
  ON public.habits FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own entries" 
  ON public.habit_entries FOR ALL 
  USING (auth.uid() = user_id);
