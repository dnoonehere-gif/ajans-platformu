import { Pinecone } from "@pinecone-database/pinecone";

let _client: Pinecone | null = null;

export function getPinecone(): Pinecone | null {
  if (!process.env.PINECONE_API_KEY) return null;
  if (!_client) _client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  return _client;
}

export const PINECONE_INDEX = process.env.PINECONE_INDEX ?? "novelya-kb";

/**
 * Chatbot bilgi tabanı için belge göm.
 * Her kayıt: { id, values (embedding), metadata: { brandId, text, source } }
 */
export async function upsertKnowledge(
  brandId: string,
  records: Array<{ id: string; values: number[]; text: string; source?: string }>
) {
  const pc = getPinecone();
  if (!pc) return;

  const index = pc.index(PINECONE_INDEX);
  await index.namespace(brandId).upsert(
    records.map((r) => ({
      id: r.id,
      values: r.values,
      metadata: { brandId, text: r.text, source: r.source ?? "manual" },
    }))
  );
}

/**
 * Sorguya en yakın N bilgi tabanı kaydını döndürür.
 */
export async function queryKnowledge(
  brandId: string,
  queryEmbedding: number[],
  topK = 5
): Promise<Array<{ text: string; score: number }>> {
  const pc = getPinecone();
  if (!pc) return [];

  const index = pc.index(PINECONE_INDEX);
  const result = await index.namespace(brandId).query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return (result.matches ?? []).map((m) => ({
    text: String(m.metadata?.text ?? ""),
    score: m.score ?? 0,
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
