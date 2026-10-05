import { BookOpen, FileText, PlayCircle, GraduationCap, ListChecks, Layers } from 'lucide-react';

/** lucide icon for a normalized DIKSHA item, by primaryCategory / mimeType. */
export const getDikshaTypeIcon = (item) => {
  const mime = item?.mimeType || '';
  const type = (item?.type || '').toLowerCase();
  if (type === 'course') return GraduationCap;
  if (type.includes('textbook') && item?.isCollection) return BookOpen;
  if (type.includes('question')) return ListChecks;
  if (mime.startsWith('video/')) return PlayCircle;
  if (mime === 'application/pdf') return FileText;
  if (item?.isCollection) return Layers;
  return FileText;
};

export default getDikshaTypeIcon;
