import { Pinecone } from "@pinecone-database/pinecone";

let _client: Pinecone | null = null;

export function getPinecone(): Pinecone | null {
  if (!process.env.PINECONE_API_KEY) return null;
  if (!_client) _client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  return _client;
}

export const PINECONE_INDEX = process.env.PINECONE_INDEX ?? "novelya-kb";

/**
 * Chatbot bilgi tabanına metin kaydet (Pinecone integrated embedding kullanır).
 */
export async function upsertKnowledge(
  brandId: string,
  records: Array<{ id: string; text: string; source?: string }>
) {
  const pc = getPinecone();
  if (!pc) return;

  const index = pc.index(PINECONE_INDEX);
  await index.namespace(brandId).upsertRecords({
    records: records.map((r) => ({
      _id: r.id,
      text: r.text,
      brandId,
      source: r.source ?? "manual",
    })),
  });
}

/**
 * Sorguya en yakın N bilgi tabanı kaydını döndürür.
 */
export async function queryKnowledge(
  brandId: string,
  queryText: string,
  topK = 5
): Promise<Array<{ text: string; score: number }>> {
  const pc = getPinecone();
  if (!pc) return [];

  const index = pc.index(PINECONE_INDEX);
  const result = await index.namespace(brandId).searchRecords({
    query: { inputs: { text: queryText }, topK },
    fields: ["text", "source"],
  });

  return (result.result?.hits ?? []).map((h) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    text: String((h.fields as any)?.text ?? ""),
    score: h._score ?? 0,
  }));
}

/**
 * Markaya ait tüm vektörleri sil (marka silindiğinde).
 */
export async function deleteKnowledge(brandId: string) {
  const pc = getPinecone();
  if (!pc) return;
  const index = pc.index(PINECONE_INDEX);
  await index.namespace(brandId).deleteAll();
}
