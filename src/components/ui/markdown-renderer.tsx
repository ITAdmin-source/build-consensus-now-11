
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = ''
}) => {
  const formatText = (text: string) => {
    if (!text) return '';
    
    return text
      // Bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Bullet points: - text -> • text with proper spacing
      .replace(/^- (.+)$/gm, '<div class="flex items-start gap-2 mb-1"><span class="text-primary mt-0.5">•</span><span>$1</span></div>')
      // Double line breaks for paragraphs
      .replace(/\n\n/g, '</p><p class="mb-3">')
      // Single line breaks
      .replace(/\n/g, '<br>');
  };

  const formattedContent = formatText(content);
  const wrappedContent = formattedContent.includes('<div class="flex') 
    ? formattedContent 
    : `<p class="mb-3">${formattedContent}</p>`;

  return (
    <div 
      className={`hebrew-text text-right leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: wrappedContent }}
    />
  );
};
