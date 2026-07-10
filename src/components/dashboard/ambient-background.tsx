// Ambient animasyonlu arka plan — dashboard'a derinlik katar,
// pointer-events: none olduğundan etkileşimi hiç engellemez
export function AmbientBackground() {
  return (
    <div className="nv-bg" aria-hidden="true">
      <div className="nv-dots" />
      <div className="nv-blob nv-blob-a" />
      <div className="nv-blob nv-blob-b" />
      <div className="nv-blob nv-blob-c" />
    </div>
  );
}
