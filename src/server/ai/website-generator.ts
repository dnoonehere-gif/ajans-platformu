import { generateText } from "./anthropic";

export type BlockType = "hero" | "features" | "about" | "services" | "contact" | "cta";

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

export interface WebsiteGenerateInput {
  brandName: string;
  sector: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  primaryColor?: string;
}

export async function generateWebsiteBlocks(input: WebsiteGenerateInput): Promise<Block[]> {
  const prompt = `
Sen bir Türk dijital ajans platformunun web sitesi oluşturucususun.
Aşağıdaki marka bilgilerine göre kurumsal bir web sitesi için JSON blokları üret.

Marka Adı: ${input.brandName}
Sektör: ${input.sector}
Açıklama: ${input.description}
${input.phone ? `Telefon: ${input.phone}` : ""}
${input.email ? `E-posta: ${input.email}` : ""}
${input.address ? `Adres: ${input.address}` : ""}

Tam olarak şu JSON formatında yanıt ver (başka hiçbir şey yazma):
[
  {
    "id": "hero",
    "type": "hero",
    "data": {
      "headline": "Ana başlık (güçlü, etkileyici)",
      "subheadline": "Alt başlık (2 cümle, markayı anlatan)",
      "cta": "Hemen Başla",
      "ctaHref": "#contact",
      "bgColor": "${input.primaryColor ?? "#6366f1"}"
    }
  },
  {
    "id": "features",
    "type": "features",
    "data": {
      "title": "Neden Biz?",
      "items": [
        {"icon": "⚡", "title": "Özellik 1", "desc": "Açıklama"},
        {"icon": "🎯", "title": "Özellik 2", "desc": "Açıklama"},
        {"icon": "💎", "title": "Özellik 3", "desc": "Açıklama"}
      ]
    }
  },
  {
    "id": "about",
    "type": "about",
    "data": {
      "title": "Hakkımızda",
      "body": "Uzun paragraf (3-4 cümle, markayı anlatan)",
      "stats": [
        {"value": "10+", "label": "Yıllık Deneyim"},
        {"value": "500+", "label": "Mutlu Müşteri"},
        {"value": "99%", "label": "Memnuniyet"}
      ]
    }
  },
  {
    "id": "services",
    "type": "services",
    "data": {
      "title": "Hizmetlerimiz",
      "items": [
        {"title": "Hizmet 1", "desc": "Açıklama", "icon": "🌟"},
        {"title": "Hizmet 2", "desc": "Açıklama", "icon": "🚀"},
        {"title": "Hizmet 3", "desc": "Açıklama", "icon": "💡"},
        {"title": "Hizmet 4", "desc": "Açıklama", "icon": "🔧"}
      ]
    }
  },
  {
    "id": "cta",
    "type": "cta",
    "data": {
      "title": "Harekete Geçirici Başlık",
      "body": "Kısa açıklama",
      "buttonText": "Hemen İletişime Geç",
      "buttonHref": "#contact"
    }
  },
  {
    "id": "contact",
    "type": "contact",
    "data": {
      "title": "İletişim",
      "phone": "${input.phone ?? ""}",
      "email": "${input.email ?? ""}",
      "address": "${input.address ?? ""}"
    }
  }
]

Tüm metinleri Türkçe yaz. Sadece JSON döndür.
`;

  const raw = await generateText({ prompt, maxTokens: 2048 });

  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("AI geçerli JSON üretmedi");

  return JSON.parse(jsonMatch[0]) as Block[];
}
