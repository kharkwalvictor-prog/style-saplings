import { useState, useRef, useEffect } from "react";
import { Smartphone, Tablet, Laptop, Monitor, RotateCcw, ExternalLink } from "lucide-react";

type DeviceKey = "mobile" | "tablet" | "laptop" | "desktop";

interface Device {
  key: DeviceKey;
  label: string;
  icon: React.ElementType;
  width: number;
  height: number;
  note: string;
}

const DEVICES: Device[] = [
  { key: "mobile",  label: "Mobile",  icon: Smartphone, width: 390,  height: 844,  note: "iPhone 14" },
  { key: "tablet",  label: "Tablet",  icon: Tablet,     width: 768,  height: 1024, note: "iPad" },
  { key: "laptop",  label: "Laptop",  icon: Laptop,     width: 1280, height: 800,  note: "MacBook" },
  { key: "desktop", label: "Desktop", icon: Monitor,    width: 1440, height: 900,  note: "Full HD" },
];

const PAGES = [
  { label: "Home",    path: "/" },
  { label: "Shop",    path: "/shop" },
  { label: "About",   path: "/about" },
  { label: "Blog",    path: "/blog" },
  { label: "Contact", path: "/contact" },
];

const AdminPreview = () => {
  const [device, setDevice] = useState<DeviceKey>("mobile");
  const [path, setPath] = useState("/");
  const [key, setKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const current = DEVICES.find(d => d.key === device)!;
  const origin = window.location.origin;
  const src = `${origin}${path}`;

  // Recalculate scale whenever device or container size changes
  useEffect(() => {
    const calc = () => {
      if (!containerRef.current) return;
      const available = containerRef.current.clientWidth - 32; // 16px padding each side
      setScale(Math.min(1, available / current.width));
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [device, current.width]);

  const scaledHeight = Math.round(current.height * scale);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-serif text-xl font-semibold">Site Preview</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live preview of the storefront at different screen sizes.
          </p>
        </div>

        {/* Open in new tab */}
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open in browser
        </a>
      </div>

      {/* Page nav */}
      <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar border-b border-border">
        {PAGES.map(p => (
          <button
            key={p.path}
            onClick={() => { setPath(p.path); setKey(k => k + 1); }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
              path === p.path
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
            {path === p.path && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Device toggle */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {DEVICES.map(d => (
            <button
              key={d.key}
              onClick={() => setDevice(d.key)}
              title={`${d.label} — ${d.width}×${d.height}px (${d.note})`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                device === d.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <d.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{d.label}</span>
            </button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground hidden sm:inline">
          {current.width} × {current.height}px &middot; {current.note}
        </span>

        <button
          onClick={() => setKey(k => k + 1)}
          title="Reload preview"
          className="ml-auto p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Preview container */}
      <div ref={containerRef} className="flex-1 min-h-0 flex justify-center">
        <div
          className={`relative ${
            device === "mobile" ? "rounded-[2rem] border-[8px] border-foreground/10 shadow-2xl" :
            device === "tablet" ? "rounded-[1.5rem] border-[6px] border-foreground/10 shadow-2xl" :
            "rounded-xl border border-border shadow-xl"
          } overflow-hidden bg-background`}
          style={{
            width: current.width * scale,
            height: scaledHeight,
          }}
        >
          <iframe
            key={key}
            src={src}
            title="Site preview"
            style={{
              width: current.width,
              height: current.height,
              border: "none",
              transformOrigin: "top left",
              transform: `scale(${scale})`,
              display: "block",
              pointerEvents: scale === 1 ? "auto" : "none",
            }}
          />
          {/* Overlay to allow scrolling on scaled frames */}
          {scale < 1 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background/80 backdrop-blur-sm text-xs text-muted-foreground px-3 py-1.5 rounded-full border border-border">
                {Math.round(scale * 100)}% — Open in browser to interact
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPreview;
