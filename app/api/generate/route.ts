import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  const { businessName, niche, phone, rating } = await request.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 });

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const prompt = `Você é um Web Designer e Copywriter focado em conversão.
Crie uma Landing Page moderna, bonita e responsiva para uma empresa chamada "${businessName}", do nicho de "${niche}".
Eles têm uma nota de ${rating} no Google, use isso como prova social (ex: "Junte-se aos nossos clientes satisfeitos que nos avaliaram com ${rating} estrelas").
O botão de Call to Action principal deve direcionar para o telefone/WhatsApp: ${phone || 'N/A'}.

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS o código HTML completo e válido, começando com <!DOCTYPE html> e terminando com </html>.
2. Não inclua blocos de formatação markdown (como \`\`\`html) no início ou no fim.
3. Use o CDN do TailwindCSS (<script src="https://cdn.tailwindcss.com"></script>) no <head> para todo o estilo.
4. Inclua ícones do FontAwesome se precisar.
5. Crie um design com Hero Section (chamada forte), Sobre, Prova Social e Rodapé.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let htmlCode = response.text || '';
    if (htmlCode.startsWith('```html')) {
        htmlCode = htmlCode.replace(/```html/g, '').replace(/```/g, '').trim();
    }

    return NextResponse.json({ code: htmlCode });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate website' }, { status: 500 });
  }
}