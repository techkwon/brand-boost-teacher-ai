
-- Create teacher_reports table to store the analysis results
CREATE TABLE public.teacher_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_name TEXT NOT NULL,
  character_description TEXT NOT NULL,
  slogan TEXT NOT NULL,
  strengths TEXT[] NOT NULL,
  growth_point_title TEXT NOT NULL,
  growth_point_description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('teacher-images', 'teacher-images', true);

-- Create policy for storage bucket (allow all operations for now)
CREATE POLICY "Allow all operations on teacher-images bucket" 
ON storage.objects FOR ALL 
USING (bucket_id = 'teacher-images');
