"use client";
import { useState, useCallback, useEffect } from "react";
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
  Layers,
  Sliders,
  Crop,
  DownloadCloud,
  ArrowLeft,
  Trash2,
} from "lucide-react";

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1 / 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("jpeg");

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [vibrance, setVibrance] = useState(100);
  const [blur, setBlur] = useState(0);

  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [fileSizeKB, setFileSizeKB] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const presets = [
    { name: "Instagram Post", value: 1 / 1, icon: "square" },
    { name: "Instagram Story", value: 9 / 16, icon: "smartphone" },
    { name: "YouTube Thumb", value: 16 / 9, icon: "tv" },
    { name: "Facebook Post", value: 1.91 / 1, icon: "facebook" },
  ];

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
    formData.append("brightness", String(brightness));
    formData.append("contrast", String(contrast));
    formData.append("saturation", String(saturation));
    formData.append("vibrance", String(vibrance));
    formData.append("blur", String(blur));

    try {
      const res = await fetch("/api/process-image", {
        method: "POST",
        body: formData,
      });

      const blob = await res.blob();
      const sizeInKB = blob.size / 1024;
      setFileSizeKB(Number(sizeInKB.toFixed(2)));
      setProcessedImage(URL.createObjectURL(blob));
    } catch (error) {
      console.error(error);
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
    setFileSizeKB(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const Slider = ({
    label,
    value,
    setValue,
    min = 0,
    max = 200,
    icon: Icon,
  }: any) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs font-semibold tracking-wider uppercase text-slate-500/80">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {label}
        </div>
        <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full ring-1 ring-indigo-200/50">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0e11] flex flex-col items-center py-8 px-4 md:px-8 transition-colors duration-500 overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/20 blur-[100px] rounded-full animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-7xl flex flex-col gap-6">
        {/* Header */}
        <header className="flex justify-center  items-center  backdrop-blur-xl  px-6  rounded-3xl shadow-sm">
          <div className="flex items-center justify-center flex-col  gap-2">
            <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div className="">
              <h1 className="text-2xl font-bold text-center tracking-tight text-slate-900 dark:text-white">
                ImageFlow
              </h1>
              <p className="text-[10px] text-center font-medium text-slate-400 uppercase tracking-[0.2em] mt-1">
                Image Resizer & Studio
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Workspace */}
          <div className="flex-1 w-full flex flex-col gap-6">
            {!imageSrc ? (
              <div className="group relative flex-1 min-h-[500px] flex flex-col items-center justify-center bg-white/40 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] hover:border-indigo-400  transition-all-custom cursor-pointer overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-0 flex flex-col items-center text-center px-8">
                  <div className="w-20 h-20 mb-6  dark:bg-indigo-500/10 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    Drop your vision here
                  </h3>
                  <p className="text-slate-500  text-sm max-w-sm">
                    Drag and drop your image, or click to browse. Supports JPG,
                    PNG, and WebP.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="relative w-full aspect-video md:aspect-[4/3] lg:aspect-square max-h-[600px] bg-slate-100 dark:bg-slate-900/50 rounded-[2rem] overflow-hidden border border-slate-200/60 dark:border-white/5 shadow-2xl">
                  {!processedImage ? (
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={aspect}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      style={{
                        mediaStyle: {
                          filter: `
                            brightness(${brightness}%)
                            contrast(${contrast}%)
                            saturate(${saturation}%)
                            blur(${blur}px)
                          `,
                        },
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-8">
                      <img
                        src={processedImage}
                        alt="Processed"
                        style={{
                          filter: `
                            brightness(${brightness}%)
                            contrast(${contrast}%)
                            saturate(${saturation}%)
                            blur(${blur}px)
                          `,
                        }}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                      />
                    </div>
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <button
                      onClick={reset}
                      className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 text-slate-600 hover:text-red-500 transition-all active:scale-95"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>

                  {processedImage && (
                    <div className="absolute bottom-6 right-6 flex items-center gap-3">
                      <div className="bg-emerald-500/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg border border-emerald-400/20 font-semibold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Ready for download
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl">
                  <div className="flex gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-none mb-1">
                        Dimensions
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {Math.round(croppedAreaPixels?.width || 0)} ×{" "}
                        {Math.round(croppedAreaPixels?.height || 0)} px
                      </span>
                    </div>
                    {fileSizeKB && (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-none mb-1">
                          Size
                        </span>
                        <span className="text-sm font-bold text-indigo-600">
                          {fileSizeKB} KB
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <Info className="w-3 h-3" />
                    DRAG TO PAN • SCROLL TO ZOOM
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Sidebar */}
          <aside className="w-full lg:w-[400px] flex flex-col gap-6 sticky top-12">
            <div className="glass-card p-4 rounded-[2rem] flex flex-col gap-8">
              {imageSrc ? (
                <>
                  {/* Presets Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Layers className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-widest">
                        Canvas Ratio
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {presets.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => setAspect(p.value)}
                          className={`p-2 rounded-2xl text-[11px] font-bold border transition-all-custom flex flex-col items-center gap-2 ${
                            aspect === p.value
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200/50"
                              : "bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-white"
                          }`}
                        >
                          <span className="text-xs">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tuning Section */}

                  <div className="space-y-4">
                    <Slider
                      label="Canvas Zoom"
                      value={zoom}
                      setValue={setZoom}
                      min={1}
                      max={3}
                      icon={Maximize}
                    />
                    <Slider
                      label="Export Quality"
                      value={quality}
                      setValue={setQuality}
                      min={10}
                      max={100}
                      icon={CheckCircle2}
                    />

                    <div className="h-px bg-slate-200/60 dark:bg-white/5 my-2" />

                    <Slider
                      label="Brightness"
                      value={brightness}
                      setValue={setBrightness}
                      icon={Plus}
                    />
                    <Slider
                      label="Contrast"
                      value={contrast}
                      setValue={setContrast}
                      icon={RefreshCw}
                    />
                    <Slider
                      label="Saturation"
                      value={saturation}
                      setValue={setSaturation}
                      icon={Layers}
                    />
                    <Slider
                      label="Blur Effect"
                      value={blur}
                      setValue={setBlur}
                      max={20}
                      icon={Info}
                    />
                  </div>

                  {/* Format Selection */}
                  <div className="">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Settings className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-widest">
                        Export Format
                      </h3>
                    </div>
                    <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl gap-1">
                      {["jpeg", "png", "webp"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setFormat(f)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all-custom ${
                            format === f
                              ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Core Actions */}
                  <div className="space-y-1 border-t border-slate-200/60 dark:border-white/5">
                    <button
                      onClick={handleProcess}
                      disabled={loading || !imageSrc}
                      className="w-full premium-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 transition-all"
                    >
                      {loading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Crop className="w-5 h-5" />
                      )}
                      {loading ? "Optimizing..." : "Apply & Render"}
                    </button>

                    {processedImage && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleDownload}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
                        >
                          <DownloadCloud className="w-5 h-5" />
                          Save
                        </button>
                        <button
                          onClick={reset}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                          Discard
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                    <Sliders className="w-6 h-6 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">
                      Controls Locked
                    </h4>
                    <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                      Upload an image to start refining your vision.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
