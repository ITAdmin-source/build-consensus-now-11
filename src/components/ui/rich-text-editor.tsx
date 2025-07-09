
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bold, List, Eye, EyeOff } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  rows = 6
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const formatText = (text: string) => {
    return text
      // Bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Bullet points: - text -> • text
      .replace(/^- (.+)$/gm, '• $1')
      // Line breaks
      .replace(/\n/g, '<br>');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertFormatting('**', '**')}
          className="hebrew-text"
        >
          <Bold className="h-4 w-4 ml-1" />
          מודגש
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertFormatting('- ')}
          className="hebrew-text"
        >
          <List className="h-4 w-4 ml-1" />
          רשימה
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="hebrew-text"
        >
          {showPreview ? <EyeOff className="h-4 w-4 ml-1" /> : <Eye className="h-4 w-4 ml-1" />}
          {showPreview ? 'עריכה' : 'תצוגה מקדימה'}
        </Button>
      </div>

      {showPreview ? (
        <div 
          className="min-h-[150px] p-3 border rounded-md bg-gray-50 hebrew-text text-right"
          dangerouslySetInnerHTML={{ __html: formatText(value) }}
        />
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`hebrew-text text-right min-h-[150px]`}
          rows={rows}
        />
      )}

      <div className="text-xs text-gray-500 hebrew-text">
        <p>עיצוב זמין:</p>
        <p>• **טקסט מודגש** לטקסט בולט</p>
        <p>• - פריט ברשימה</p>
        <p>• שורות ריקות למרווח בין פסקאות</p>
      </div>
    </div>
  );
};
