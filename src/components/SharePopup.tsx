import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Poll } from '@/types/poll';

interface SharePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll: Poll;
  personalInsight?: string;
}

export const SharePopup: React.FC<SharePopupProps> = ({
  open,
  onOpenChange,
  poll,
  personalInsight
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const shareText = `עניתי על הסקר "${poll.title}" ויצאתי ${personalInsight || 'מסקנות מעניינות'}.
בואו תענו גם אתם תגלו משהו מעניין על עצמכם, ותעזרו לנו למצוא נקודות חיבור בעם ישראל.

${window.location.href}`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    onOpenChange(false);
    toast({
      title: "שותף ב-WhatsApp",
      description: "הסקר נשתף בהצלחה ב-WhatsApp",
    });
  };

  const handleMoreOptions = async () => {
    try {
      // Try Web Share API first (mobile/modern browsers)
      if (navigator.share) {
        await navigator.share({
          title: `סקר: ${poll.title}`,
          text: shareText,
          url: window.location.href
        });
        onOpenChange(false);
        toast({
          title: "שותף בהצלחה",
          description: "הסקר נשתף בהצלחה",
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "הועתק ללוח",
          description: "טקסט השיתוף הועתק ללוח. אפשר להדביק בכל מקום",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה בשיתוף",
        description: "נסה שוב או העתק את הקישור באופן ידני",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 backdrop-blur-sm">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
              <Share2 className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
          </div>
          
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hebrew-text">
            שתף את הסקר
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Share text preview */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 text-right">
            <p className="text-sm text-gray-700 hebrew-text leading-relaxed">
              עניתי על הסקר "<span className="font-semibold text-blue-600">{poll.title}</span>" ויצאתי <span className="font-semibold text-purple-600">{personalInsight || 'מסקנות מעניינות'}</span>.
              <br />
              בואו תענו גם אתם תגלו משהו מעניין על עצמכם, ותעזרו לנו למצוא נקודות חיבור בעם ישראל.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleWhatsAppShare}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hebrew-text font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
            >
              <MessageCircle className="h-5 w-5 ml-2 drop-shadow-sm" />
              שתף ב-WhatsApp
            </Button>

            <Button
              onClick={handleMoreOptions}
              variant="outline"
              className="w-full hebrew-text font-semibold py-3 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 transform hover:scale-[1.02] bg-white/50 backdrop-blur-sm"
            >
              {copied ? (
                <Check className="h-5 w-5 ml-2 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 ml-2 text-purple-600" />
              )}
              {copied ? 'הועתק!' : 'אפשרויות נוספות'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};