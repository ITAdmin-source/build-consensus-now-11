import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, List, Eye, Edit } from 'lucide-react';
import { MarkdownRenderer } from './markdown-renderer';

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
  rows = 4
}) => {
  const [isPreview, setIsPreview] = useState(false);

  const insertFormat = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea[data-rich-text]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertBold = () => insertFormat('**', '**');
  const insertBulletPoint = () => {
    const lines = value.split('\n');
    const textarea = document.querySelector('textarea[data-rich-text]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const prefix = start === lineStart ? '• ' : '\n• ';
    
    const newText = value.substring(0, start) + prefix + value.substring(start);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={insertBold}
            className="h-8 px-2"
            disabled={isPreview}
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={insertBulletPoint}
            className="h-8 px-2"
            disabled={isPreview}
          >
            <List className="h-3 w-3" />
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="h-8 px-2"
        >
          {isPreview ? <Edit className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          <span className="mr-1 text-xs">
            {isPreview ? 'עריכה' : 'תצוגה מקדימה'}
          </span>
        </Button>
      </div>

      {isPreview ? (
        <div className="min-h-[100px] p-3 border rounded-md bg-muted/50">
          <MarkdownRenderer content={value} />
        </div>
      ) : (
        <Textarea
          data-rich-text
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="hebrew-text text-right min-h-[100px]"
          rows={rows}
        />
      )}

      <div className="text-xs text-muted-foreground hebrew-text">
        <p>תמיכה בעיצוב טקסט:</p>
        <p>• **טקסט מודגש** עבור כתב מודגש</p>
        <p>• • רשימת נקודות (השתמש בכפתור הרשימה או הקלד • )</p>
      </div>
    </div>
  );
};