
-- Enable Row Level Security on teacher_reports table
ALTER TABLE public.teacher_reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read teacher reports (since this is a public gallery)
CREATE POLICY "Anyone can view teacher reports" 
ON public.teacher_reports 
FOR SELECT 
TO public 
USING (true);

-- Create policy to allow anyone to insert teacher reports
CREATE POLICY "Anyone can create teacher reports" 
ON public.teacher_reports 
FOR INSERT 
TO public 
WITH CHECK (true);
