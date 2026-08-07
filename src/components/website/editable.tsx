"use client";
import { createContext, useContext, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useLang } from "@/components/language-provider";

/**
 * Önizlemede doğrudan düzenleme altyapısı.
 *
 * Editör, blokları sohbetle değiştirmenin yanında artık tıklayıp yazarak da
 * düzenlemeye izin veriyor. Metinler `contentEditable` olarak render edilir;
 * odak kaybında değer blok ağacına yazılır (her tuşta state güncellemek
 * imleci zıplatır, bu yüzden blur'da commit edilir).
 *
 * Biçim (font/boyut/renk/kalınlık) blok verisinin içinde `_fmt` altında,
 * alan adına göre saklanır — böylece kaydedilen JSON'la birlikte taşınır.
 */

export interface TextFormat {
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  bold?: boolean;
}

interface EditApi {
  editable: boolean;
  blockId: string;
  /** path örn. "headline" veya "items.2.title" */
  update: (blockId: string, path: string, value: string) => void;
  /** Bir alana odaklanıldığında editörün araç çubuğunu açması için */
  onFocusField?: (blockId: string, path: string) => void;
  /** Dosyayı yükleyip herkese açık URL döndürür; hata olursa null. */
  uploadMedia?: (file: File) => Promise<string | null>;
}

const EditCtx = createContext<EditApi | null>(null);

export function EditProvider({ value, children }: { value: EditApi; children: React.ReactNode }) {
  return <EditCtx.Provider value={value}>{children}</EditCtx.Provider>;
}

export function useEdit() {
  return useContext(EditCtx);
}

/** İç içe yoldaki değeri değiştirip YENİ nesne döndürür (state mutasyonu yok). */
export function setByPath<T>(obj: T, path: string, value: unknown): T {
  const parts = path.split(".");
  const clone: unknown = Array.isArray(obj) ? [...(obj as unknown[])] : { ...(obj as object) };
  let cur = clone as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    const next = cur[k];
    cur[k] = Array.isArray(next) ? [...next] : { ...(next as object) };
    cur = cur[k] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
  return clone as T;
}

export function getFormat(data: Record<string, unknown>, path: string): TextFormat {
  const fmt = data._fmt as Record<string, TextFormat> | undefined;
  return fmt?.[path] ?? {};
}

/**
 * Düzenlenebilir metin. Salt okunur bağlamda (yayınlanmış site) düz metin
 * basar — yayındaki sayfaya hiçbir editör kodu sızmaz.
 */
export function T({
  data,
  path,
  as: Tag = "span",
  className = "",
  style,
  fallback = "",
}: {
  data: Record<string, unknown>;
  path: string;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  fallback?: string;
}) {
  const api = useEdit();
  const ref = useRef<HTMLElement>(null);

  const raw = path.split(".").reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], data);
  const text = raw == null ? fallback : String(raw);
  const f = getFormat(data, path);

  const fmtStyle: React.CSSProperties = {
    ...style,
    ...(f.fontFamily ? { fontFamily: f.fontFamily } : {}),
    ...(f.fontSize ? { fontSize: f.fontSize } : {}),
    ...(f.color ? { color: f.color } : {}),
    ...(f.bold ? { fontWeight: 800 } : {}),
  };

  if (!api?.editable) {
    return <Tag className={className} style={fmtStyle}>{text}</Tag>;
  }

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-nv-path={path}
      onFocus={() => api.onFocusField?.(api.blockId, path)}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const yeni = e.currentTarget.textContent ?? "";
        if (yeni !== text) api.update(api.blockId, path, yeni);
      }}
      onKeyDown={(e: React.KeyboardEvent) => {
        // Enter yeni blok açmasın; satır sonu yerine düzenlemeyi bitir.
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      }}
      className={`${className} cursor-text rounded outline-none ring-offset-2 transition focus:ring-2 focus:ring-blue-500/60 hover:bg-blue-500/5`}
      style={fmtStyle}
    >
      {text}
    </Tag>
  );
}


/**
 * Düzenlenebilir görsel/video yuvası.
 *
 * Salt okunur bağlamda doğrudan medyayı basar. Editörde tıklanınca dosya
 * seçici açılır — mobilde bu, telefonun galerisini ve kamerasını sunar,
 * masaüstünde dosya penceresini. Ayrıca sürükle-bırak desteklenir.
 */
export function Media({
  data,
  path,
  className = "",
  style,
}: {
  data: Record<string, unknown>;
  path: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const api = useEdit();
  const { lang } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const m = lang === "en"
    ? { add: "Add image", hint: "Click or drag and drop", loading: "Uploading..." }
    : { add: "Görsel ekle", hint: "Tıkla veya sürükle-bırak", loading: "Yükleniyor..." };

  const src = String(
    path.split(".").reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], data) ?? ""
  );
  const video = /\.(mp4|webm|mov)(\?|$)/i.test(src);

  async function dosyaAl(file?: File | null) {
    if (!file || !api?.uploadMedia) return;
    setYukleniyor(true);
    const url = await api.uploadMedia(file);
    setYukleniyor(false);
    if (url) api.update(api.blockId, path, url);
  }

  const icerik = src ? (
    video
      ? <video src={src} className="h-full w-full object-cover" muted loop playsInline autoPlay />
      : <img src={src} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 opacity-40">
      <Camera className="h-6 w-6" />
      {api?.editable && <span className="text-[10px]">{m.add}</span>}
    </div>
  );

  // Yayınlanmış sitede boş görsel yuvası hiç çizilmez; aksi hâlde ziyaretçi
  // yarım kalmış gibi görünen boş kareler görürdü.
  if (!api?.editable) {
    if (!src) return null;
    return <div className={className} style={style}>{icerik}</div>;
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); void dosyaAl(e.dataTransfer.files?.[0]); }}
      className={`${className} group relative cursor-pointer ring-offset-2 transition hover:ring-2 hover:ring-blue-500/60`}
      style={style}
      title={m.hint}
    >
      {icerik}
      {yukleniyor && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white">
          {m.loading}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime"
        onChange={(e) => { void dosyaAl(e.target.files?.[0]); e.target.value = ""; }}
        className="hidden"
      />
    </div>
  );
}
