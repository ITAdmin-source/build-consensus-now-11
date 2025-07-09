
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  // Simple processing for bullet points using •
  const processContent = (text: string) => {
    return text
      .split('\n')
      .map(line => {
        // Convert • to markdown bullet points
        if (line.trim().startsWith('•')) {
          return line.replace(/^(\s*)•\s*/, '$1- ');
        }
        return line;
      })
      .join('\n');
  };

  const processedContent = processContent(content);

  return (
    <div className={`prose prose-sm max-w-none hebrew-text text-right ${className}`}>
      <ReactMarkdown
        components={{
          // Custom components for RTL support
          p: ({ children }) => (
            <p className="text-base leading-7 mb-3 last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mr-4 mb-4">{children}</ul>
          ),
          // Custom list item component for RTL support
          li: ({ children, ...props }) => {
            // If the children contain only text, render without p wrapper
            const textOnly = React.Children.toArray(children).every(
              child => typeof child === 'string' || (React.isValidElement(child) && child.type === 'p')
            );
            
            if (textOnly) {
              return (
                <li className="text-base leading-7" {...props}>
                  {React.Children.map(children, child => 
                    React.isValidElement(child) && child.type === 'p' 
                      ? child.props.children 
                      : child
                  )}
                </li>
              );
            }
            
            return <li className="text-base leading-7" {...props}>{children}</li>;
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
