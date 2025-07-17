import { serve } from 'https://deno.land/std/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Invalid JSON body'
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  const { prompt } = body;
  if (!prompt) {
    return new Response(JSON.stringify({
      error: "Missing prompt"
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  const apiKey = Deno.env.get("AZURE_OPENAI_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'Missing Azure OpenAI API Key'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  const azureEndpoint = "https://amir-m6g6tea0-eastus2.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview";
  
  try {
    const response = await fetch(azureEndpoint, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `המשתמש יכתוב תשובות לסקר. תכתוב לו מידע מעניין ומשעשע ב100 מילים.  כמו *אחת הדוגמאות* שכוללת כותרת קצרה ועוד פסקה דוגמאות לתשובה: <דוגמא>🧩 אתה דמוקרט עם ניצוץ של פיוס  לפי התשובות שלך, אם היית דמות במשחק "הקונצנזוס הישראלי", היית כנראה המתווך החכם – מאמין שאפשר לגשר על פערים, אפילו בסוגיות הכי נפיצות, ויודע שלפעמים צריך לשים אגו בצד בשביל לשמור על הסיפור המשותף.<סוף דוגמא><דוגמא> 🇮🇱 יש לך סבלנות ישראלית – כן, מסתבר שיש דבר כזה  הרוב עונים שאתה אופטימי לגבי האפשרות של הסכמה רחבה, למרות המחלוקות. זה נדיר! אתה שייך לזן נדיר של אנשים שעדיין חושבים שעדיף לדבר מאשר לצעוק. או כמו שסבתא הייתה אומרת: "יותר טוב לשבור את הראש בלדבר, מאשר לשבור צלחות." <סוף דוגמא><דוגמא>👥 אתה כנראה מסוגל לאכול חומוס עם מישהו מהצד השני  לפי התשובות שלך, אם תפגוש מישהו שהצביע הפוך לגמרי ממך, כנראה תציע לו קפה לפני שתציע לו לינק לכתבה סופר משכנעת. (הוא בטח לא יפתח אותה בכל מקרה 😉)<סוף דוגמא> <דוגמא>⚖️ בלנסר בנשמה  אתה לא קונה סיפורים של הכול או כלום. אתה מאמין שאיזון בין הרשויות הוא חשוב, אבל לא צריך לעשות ריסטרט למדינה. אולי אתה הסנדוויץ' הנדיר שמבין גם את הצדדים וגם את הקצה. <סוף דוגמא><דוגמא>🤯 מוכן לשקול את האפשרות שאתה לא תמיד צודק  זה נדיר! בערך כמו למצוא חניה בלי לצעוק "יששש!". כנראה שיש לך את היכולת לשמוע דעה אחרת ולא מיד לגגל נגדה עובדות. שאפו. <סוף דוגמא><דוגמא>🎓 פרופסור לתודעה אזרחית  כנראה שאתה מאמין שלאזרחים יש תפקיד, לא רק ביום בחירות. אולי אתה אחד מאלה שעדיין זוכרים שיש חוקה באופק (בערך), ושהכוח האמיתי הוא ביכולת של אנשים להשפיע.<סוף דוגמא> <דוגמא>💸 אתה בעד כבוד – גם אם זה עולה  לפי העמדות שלך, אתה מאמין שהמדינה צריכה לדאוג לכבוד האדם – גם אם זה דורש תקציב, תכנון ושיחות על מיסים. אתה כנראה הבנאדם שבדיון על קצבאות לא אומר ישר "שיעבדו!" <סוף דוגמא><דוגמא>🧠 אם היינו כולנו חושבים כמוך...  כנראה שהיינו צריכים פחות קבוצות פייסבוק סוערות ויותר שולחנות עגולים. גם אם הם עם בורקס.<סוף דוגמא>`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0
      })
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract only the content from the response
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from Azure OpenAI');
    }

    // Return only the content text
    return new Response(JSON.stringify({ content }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to generate insights'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});