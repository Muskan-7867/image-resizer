"use client";
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Upload,
  Download,
  Settings,
  Image as ImageIcon,
  Maximize,
  MousePointer2,
  RefreshCw,
  ChevronRight,
  Info,
  X,
  Plus,
  Minus,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [fileSizeMB, setFileSizeMB] = useState<number | null>(null);
  const [fileSizeKB, setFileSizeKB] = useState<number | null>(null);

  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("jpeg");

  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setImageSrc(URL.createObjectURL(selected));
    setProcessedImage(null);
  };

  const handleProcess = async () => {
    if (!file || !croppedAreaPixels) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("crop", JSON.stringify(croppedAreaPixels));
    formData.append("quality", String(quality));
    formData.append("format", format);

    try {
      const res = await fetch("/api/process-image", {
        method: "POST",
        body: formData,
      });

      const blob = await res.blob();
      const sizeInMB = blob.size / (1024 * 1024);
      setFileSizeMB(Number(sizeInMB.toFixed(2)));

      const sizeInKB = blob.size / 1024;
      setFileSizeKB(Number(sizeInKB.toFixed(2)));
      const url = URL.createObjectURL(blob);

      setProcessedImage(url);
    } catch (error) {
      console.error("Processing failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `processed-image.${format}`;
    link.click();
  };

  const reset = () => {
    setImageSrc(null);
    setFile(null);
    setProcessedImage(null);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-blue-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center transition-all-custom">
      <div className="w-full max-w-7xl glass-card rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[500px] sm:min-h-[600px] md:min-h-[650px]">

        {/* Left Side: Workspace Area */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-white/20 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <ImageIcon className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                IMAGER<span className="text-indigo-600">SHARP</span>
              </h1>
            </div>
            {imageSrc && (
              <button
                onClick={reset}
                className="p-1.5 sm:p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 rounded-lg transition-all-custom"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {!imageSrc ? (
            <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-xl sm:rounded-2xl md:rounded-3xl cursor-pointer hover:bg-white/40 dark:hover:bg-indigo-900/10 transition-all-custom group p-4 sm:p-6 md:p-8">
              <div className="p-4 sm:p-6 md:p-8 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl mb-4 sm:mb-6 group-hover:scale-110 transition-all-custom">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-indigo-600" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700 dark:text-slate-200 mb-1 sm:mb-2 text-center">
                Drop your image here
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 text-center px-2">
                Or click to browse from your computer
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="flex-1 flex flex-col gap-4 sm:gap-6 relative z-10">
              <div className="flex-1 relative rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden border border-white/10 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px]">
                {!processedImage ? (
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1 / 1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    classes={{
                      containerClassName: "rounded-lg sm:rounded-xl md:rounded-2xl",
                      cropAreaClassName:
                        "border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]",
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3 md:p-4">
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="max-h-full w-auto rounded-lg sm:rounded-xl shadow-2xl ring-1 ring-white/20 animate-in fade-in zoom-in duration-500"
                    />
                  </div>
                )}
              </div>

              {/* Status Info - Responsive Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div className="p-2 sm:p-3 md:p-4 bg-white/40 dark:bg-white/5 rounded-lg sm:rounded-xl md:rounded-2xl border border-white/20">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <Maximize className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Original
                    </span>
                  </div>
                  <p className="text-sm sm:text-base md:text-xl font-bold text-slate-700 dark:text-slate-200 truncate">
                    Auto-detect
                  </p>
                </div>
                <div className="p-2 sm:p-3 md:p-4 bg-indigo-500/5 rounded-lg sm:rounded-xl md:rounded-2xl border border-indigo-500/10">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <MousePointer2 className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                    <span className="text-[8px] sm:text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      Crop Area
                    </span>
                  </div>
                  <p className="text-sm sm:text-base md:text-xl font-bold text-indigo-600 dark:text-indigo-400 truncate">
                    {Math.round(croppedAreaPixels?.width || 0)} ×{" "}
                    {Math.round(croppedAreaPixels?.height || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Decorative background element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-radial-gradient from-indigo-500/5 to-transparent pointer-events-none -z-10" />
        </div>

        {/* Right Side: Configuration Area */}
        <div className="w-full lg:w-[380px] xl:w-[400px] p-4 sm:p-6 md:p-8 lg:p-10 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col gap-4 sm:gap-6 md:gap-8 relative overflow-y-auto">
          <div className="flex items-center gap-2 sm:gap-3 sticky top-0 bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-sm py-2 z-10">
            <div className="p-1.5 sm:p-2 md:p-2.5 bg-indigo-100 dark:bg-indigo-950 rounded-lg sm:rounded-xl">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
              Configuration
            </h2>
          </div>

          {!imageSrc ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <Info className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-slate-400" />
              </div>
              <h3 className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-bold mb-1 sm:mb-2">
                Workspace locked
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-[250px] sm:max-w-[300px]">
                Upload an image to start configuring your resize and crop settings.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 sm:gap-6 md:gap-8">
              {/* Zoom Control */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Magnification
                  </label>
                  <span className="text-xs font-bold text-indigo-500">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  <button
                    onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                    className="p-1.5 sm:p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-all-custom flex-shrink-0"
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 h-1 sm:h-1.5 bg-indigo-100 dark:bg-slate-800 rounded-full appearance-none accent-indigo-600 cursor-pointer"
                  />
                  <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                    className="p-1.5 sm:p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-all-custom flex-shrink-0"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Quality Control */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Sharpness & Quality
                  </label>
                  <span className="text-xs font-bold text-emerald-500">
                    {quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-1 sm:h-1.5 bg-emerald-100 dark:bg-slate-800 rounded-full appearance-none accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                  <span>Lite</span>
                  <span>Balanced</span>
                  <span>Crystal</span>
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <label className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  Engine Format
                </label>
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  {["jpeg", "png", "webp"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all-custom border ${
                        format === f
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                          : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto space-y-2 sm:space-y-3 md:space-y-4 pt-4 sm:pt-6 md:pt-8 sticky bottom-0 bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-sm pb-2">
                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className="w-full py-3 sm:py-4 md:py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-xs sm:text-sm uppercase tracking-[0.2em] rounded-xl sm:rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all-custom flex items-center justify-center gap-2 sm:gap-3 overflow-hidden group"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Apply & Process</span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-all-custom" />
                    </>
                  )}
                </button>

                {processedImage && (
                  <>
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 sm:py-4 md:py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm uppercase tracking-[0.2em] rounded-xl sm:rounded-2xl shadow-xl shadow-emerald-500/20 transition-all-custom flex items-center justify-center gap-2 sm:gap-3 animate-in slide-in-from-bottom duration-500"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Download</span>
                    </button>
                    
                    {fileSizeKB && (
                      <div className="text-center text-xs text-slate-500 mt-1 sm:mt-2">
                        File Size:{" "}
                        <span className="font-bold text-indigo-600">
                          {fileSizeKB} KB
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 sm:gap-2 justify-center text-emerald-500 animate-in fade-in duration-1000">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">
                        Processed successfully
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}