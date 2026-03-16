"use client"

import { useState, useRef, useEffect } from "react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Video, Music, Type, CheckCircle, Download, Loader2, Scissors, Trash2, SlidersHorizontal, Mic, ArrowLeft, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


export default function VideoCaptionTool() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [processedVideo, setProcessedVideo] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [step, setStep] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [srtContent, setSrtContent] = useState<string | null>(null)
  const [chunks, setChunks] = useState<any[]>([])
  const [fontSize, setFontSize] = useState(32)
  const [captionStyle, setCaptionStyle] = useState("default")
  const [captionColor, setCaptionColor] = useState("#FFFFFF")
  const [noiseLevel, setNoiseLevel] = useState(10)
  const [cleanMusic, setCleanMusic] = useState(true)
  const [isIsolated, setIsIsolated] = useState(true)
  const [isReviewing, setIsReviewing] = useState(false)

  const ffmpegRef = useRef<FFmpeg | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Check for COOP/COEP isolation and initialize FFmpeg
    if (typeof window !== 'undefined') {
      ffmpegRef.current = new FFmpeg()

      // Enable logging for debugging
      ffmpegRef.current.on('log', ({ message }) => {
        console.log("FFmpeg Log:", message)
      })

      if (!window.crossOriginIsolated) {
        console.warn("Cross-Origin Isolation is not enabled. FFmpeg.wasm might be slow or fail.")
        setIsIsolated(false)
      }
    }
  }, [])

  const steps = [
    "Preparing Engine",
    "Extracting Audio",
    "Cleaning Audio",
    "Transcribing Speech",
    "Review & Edit",
    "Preparing Burner",
    "Burning Captions",
    "Complete"
  ]

  const reset = () => {
    setVideoFile(null)
    setVideoPreview(null)
    setProcessedVideo(null)
    setIsProcessing(false)
    setIsReviewing(false)
    setProgress(0)
    setStep("")
    setError(null)
    setSrtContent(null)
    setChunks([])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      setError("File size too large (max 50MB)")
      return
    }

    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      if (video.duration > 120) {
        setError("Video segment too long (max 120 seconds)")
        setVideoFile(null)
      } else {
        // Reset previous processing state when new file is chosen
        setProcessedVideo(null)
        setSrtContent(null)
        setChunks([])
        setIsReviewing(false)
        setProgress(0)
        setStep("")

        setVideoFile(file)
        setVideoPreview(url)
        setError(null)
      }
    }
    // We don't revoke here because we need it for the preview
    // setVideoPreview(url) is called in onloadedmetadata
    video.src = url
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatASSTime = (seconds: number) => {
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours()
    const mm = date.getUTCMinutes().toString().padStart(2, "0")
    const ss = date.getUTCSeconds().toString().padStart(2, "0")
    const cc = Math.floor((seconds % 1) * 100).toString().padStart(2, "0")
    return `${hh}:${mm}:${ss}.${cc}`
  }

  const formatSRTTime = (seconds: number) => {
    const ms = Math.floor((seconds % 1) * 1000)
    const totalSeconds = Math.floor(seconds)
    const hh = Math.floor(totalSeconds / 3600).toString().padStart(2, "0")
    const mm = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0")
    const ss = (totalSeconds % 60).toString().padStart(2, "0")
    const msStr = ms.toString().padStart(3, "0")
    return `${hh}:${mm}:${ss},${msStr}`
  }

  const generateSRT = (chunks: any[]) => {
    return chunks
      .map((c, i) => {
        let text = c.text.trim()
        if (cleanMusic) {
          text = text.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim()
        }
        if (text.length === 0) return null
        return `${i + 1}\n${formatSRTTime(c.timestamp[0])} --> ${formatSRTTime(c.timestamp[1])}\n${text}\n`
      })
      .filter(Boolean)
      .join("\n")
  }

  const generateASS = (chunks: any[], isPortrait: boolean) => {
    const bgrColor = captionColor.replace("#", "").toUpperCase()
    const bgrFF = `${bgrColor.substring(4, 6)}${bgrColor.substring(2, 4)}${bgrColor.substring(0, 2)}`
    
    // PlayRes matches our 960 target for stability
    const resX = isPortrait ? 540 : 960
    const resY = isPortrait ? 960 : 540
    const centerX = resX / 2
    const bottomY = resY - 100 

    const scaledSize = Math.max(fontSize * (resX / 1280), 24)

    // Elite Style Definitions
    let styleLine = `Style: Default,Inter,${scaledSize},&H00${bgrFF},&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1.5,2,20,20,70,1`
    
    if (captionStyle === "social" || captionStyle === "pop") {
      // Bold, All-Caps, Highlighted Box (The "Hormozi" Look)
      styleLine = `Style: Default,Inter,${scaledSize + 12},&H00${bgrFF},&H000000FF,&H00000000,&H99000000,-1,0,0,0,100,100,0,0,3,0,0,2,30,30,80,1`
    } else if (captionStyle === "cinematic" || captionStyle === "slide") {
      // Elegant, Sans-Serif, Thin Outline
      styleLine = `Style: Default,Inter,${scaledSize - 6},&H00FFFFFF,&H000000FF,&H00000000,&HAA000000,0,0,0,0,110,100,1,0,1,1,0,2,40,40,40,1`
    } else if (captionStyle === "glow") {
      // Neon/Glow aesthetic
      styleLine = `Style: Default,Inter,${scaledSize},&H00FFFFFF,&H000000FF,&H00${bgrFF},&H44${bgrFF},0,0,0,0,100,100,0,0,1,3,2,2,20,20,60,1`
    }

    const header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${resX}
PlayResY: ${resY}
Timer: 100.0000

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
${styleLine}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`
    const events = chunks
      .map(c => {
        let text = c.text.trim()
        if (cleanMusic) {
          text = text.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim()
        }
        if (text.length === 0) return null
        
        let aniTags = ""
        if (captionStyle === "pop") {
          // Snap Pop: Start small (80%), burst to 115%, settle at 100%
          aniTags = "{\\fscx80\\fscy80\\t(0,150,\\fscx115\\fscy115)\\t(150,300,\\fscx100\\fscy100)}"
        } else if (captionStyle === "slide") {
          // Elegant Glide: Rise 40px in 400ms
          aniTags = `{\\move(${centerX},${bottomY + 40},${centerX},${bottomY},0,400)}`
        } else if (captionStyle === "glow") {
          // Deep Fade: 400ms entry fade
          aniTags = "{\\fad(400,200)}"
        }

        const finalText = (captionStyle === "social" || captionStyle === "pop") ? text.toUpperCase() : text
        return `Dialogue: 0,${formatASSTime(c.timestamp[0])},${formatASSTime(c.timestamp[1])},Default,,0,0,0,,${aniTags}${finalText}`
      })
      .filter(Boolean)
      .join("\n")

    return header + events
  }

  const processVideo = async () => {
    if (!videoFile) return
    setIsProcessing(true)
    setError(null)
    setProcessedVideo(null)
    setProgress(5)

    try {
      setStep("Preparing Engine")
      console.log("Cross-Origin Isolated:", window.crossOriginIsolated)
      console.log("Video File:", videoFile.name, videoFile.size, videoFile.type)

      const ffmpeg = ffmpegRef.current
      if (!ffmpeg) throw new Error("FFmpeg not initialized")

      if (!ffmpeg.loaded) {
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd"
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        })
      }

      // 1. ULTRA-FAST AUDIO EXTRACTION (WebAudio API)
      setStep("Extracting Audio")
      setProgress(15)
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 })
      const fileBuffer = await videoFile.arrayBuffer()
      const decodedBuffer = await audioCtx.decodeAudioData(fileBuffer)
      
      // 2. SPECTRAL CLEANING (Offline Processing)
      setStep("Cleaning Audio")
      setProgress(30)
      
      const offlineCtx = new OfflineAudioContext(1, decodedBuffer.length, 16000)
      const source = offlineCtx.createBufferSource()
      source.buffer = decodedBuffer
      
      const hpf = offlineCtx.createBiquadFilter()
      hpf.type = "highpass"
      hpf.frequency.value = 100
      
      const lpf = offlineCtx.createBiquadFilter()
      lpf.type = "lowpass"
      lpf.frequency.value = 8000
      
      const gain = offlineCtx.createGain()
      gain.gain.value = 2.0 // Boost for Whisper
      
      source.connect(hpf)
      hpf.connect(lpf)
      lpf.connect(gain)
      gain.connect(offlineCtx.destination)
      
      source.start()
      const renderedBuffer = await offlineCtx.startRendering()
      const audioBuffer = renderedBuffer.getChannelData(0)
      
      console.log("Audio Cleared:", { duration: renderedBuffer.duration, samples: audioBuffer.length })

      console.log("Starting Transcription Process...")
      const result = await new Promise<any>((resolve, reject) => {
        const worker = new Worker("/workers/whisper.worker.js", { type: "module" })
        const timeout = setTimeout(() => {
          worker.terminate()
          reject(new Error("AI transcription timed out. The video might be too complex for browser processing."))
        }, 300000)

        worker.onmessage = (e) => {
          const { status, output, error } = e.data
          if (status === 'ready') {
            console.log("Worker ready, sending audio...")
            worker.postMessage({ type: 'transcribe', audio: audioBuffer })
          }
          else if (status === 'complete') {
            clearTimeout(timeout);
            worker.terminate();
            
            let cleanedChunks = output.chunks.map((c: any) => {
              let text = c.text
                .replace(/\[.*?\]/g, "")
                .replace(/\(.*?\)/g, "")
                .replace(/[\[\]\(\)]/g, "")
                .replace(/\b(music|audio|silence|background|playing|instrumental|static|noise)\b/gi, "")
                .trim()
              return { ...c, text }
            }).filter((c: any) => c.text.trim().length > 0)

            if (cleanedChunks.length === 0) {
              cleanedChunks.push({
                text: "Speech not clearly detected",
                timestamp: [0, Math.min(5, renderedBuffer.duration)]
              })
            }
            resolve({ ...output, chunks: cleanedChunks });
          }
          else if (status === 'error') { 
            clearTimeout(timeout); 
            worker.terminate(); 
            reject(new Error(error)); 
          }
        }
        worker.onerror = (e) => { clearTimeout(timeout); worker.terminate(); reject(e); }
        worker.postMessage({ type: 'load' })
      })

      setChunks(result.chunks)
      setIsReviewing(true)
      setStep("Review & Edit")
      setProgress(100)
      
      audioCtx.close()
    } catch (err: any) {
      console.error("Workflow Error:", err)
      setError(`AI processing failed: ${err.message || "Unknown Error"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const renderFinalVideo = async () => {
    if (!videoFile || !chunks || chunks.length === 0) {
      setError("No captions available to render. Please transcribe or add segments first.")
      return
    }
    setIsProcessing(true)
    setError(null)
    setProcessedVideo(null)
    setProgress(5)

    try {
      const ffmpeg = ffmpegRef.current!
      if (!ffmpeg.loaded) throw new Error("FFmpeg not loaded")

      console.log("Starting Burner with chunks:", chunks.length)
      setStep("Preparing Burner")
      const renderId = Math.random().toString(36).substring(7)
      const inputName = `in_${renderId}.mp4`
      const subName = `sub_${renderId}.ass`
      const outputName = `out_${renderId}.mp4`
      const fontName = "Inter.ttf"

      // Detect Dimensions for Aspect Ratio Correctness
      const dims = await new Promise<{w: number, h: number}>(resolve => {
        const v = document.createElement("video")
        v.preload = "metadata"
        v.onloadedmetadata = () => resolve({w: v.videoWidth, h: v.videoHeight})
        v.src = URL.createObjectURL(videoFile)
      })
      const isPortrait = dims.h > dims.w
      
      const assData = generateASS(chunks, isPortrait)
      await ffmpeg.writeFile(subName, new TextEncoder().encode(assData))
      
      try {
        const fontRes = await fetch("https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/inter/static/Inter-Bold.ttf")
        if (fontRes.ok) {
          const fontData = new Uint8Array(await fontRes.arrayBuffer())
          await ffmpeg.writeFile(fontName, fontData)
          console.log("Font Root Injected:", fontName)
        }
      } catch (e) { }

      // Use fetchFile for memory efficiency
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile))

      setStep("Burning Captions")
      setProgress(40)
      
      const progressHandler = ({ progress: p }: { progress: number }) => {
        setProgress(Math.round(40 + (p * 60)))
      }
      ffmpeg.on("progress", progressHandler)

      let audioFilter = "volume=1.0"
      if (noiseLevel > 0) {
        // High-stability studio cleaning: HPF -> Denoise -> Volume
        const nr = 10 + (noiseLevel * 0.15) // Noise reduction strength
        audioFilter = `highpass=f=100,afftdn=nr=${nr.toFixed(1)}:nf=-35,volume=1.6`
      }

      // 960p target scale
      const scaleFilter = isPortrait ? "scale=540:960" : "scale=960:540"
      // Flat pathing for fonts and subtitles
      const vfChain = `${scaleFilter},subtitles=${subName}:fontsdir=.`

      console.log(`Render Start: ${vfChain}`)
      
      try {
        await ffmpeg.exec([
          "-i", inputName,
          "-vf", vfChain,
          "-c:v", "libx264",
          "-preset", "ultrafast",
          "-crf", "25", // Slightly higher for rock-solid stability
          "-c:a", "aac",
          "-b:a", "128k",
          "-af", audioFilter,
          outputName
        ])
      } finally {
        ffmpeg.off("progress", progressHandler)
      }

      const finalData = await ffmpeg.readFile(outputName) as Uint8Array
      if (!finalData || finalData.length < 1000) throw new Error("Output video is empty")

      // Copy to fresh buffer to avoid SharedArrayBuffer detachment issues
      const videoBuffer = new Uint8Array(finalData.length)
      videoBuffer.set(finalData)
      
      const blob = new Blob([videoBuffer], { type: "video/mp4" })
      setProcessedVideo(URL.createObjectURL(blob))
      setSrtContent(assData)

      setStep("Complete")
      setProgress(100)
      setIsReviewing(false)

      // Cleanup
      const toDelete = [inputName, subName, outputName]
      for (const f of toDelete) try { await ffmpeg.deleteFile(f) } catch (e) { }
    } catch (err: any) {
      setError(`Rendering failed: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const updateChunk = (index: number, text: string) => {
    const newChunks = [...chunks]
    newChunks[index].text = text
    setChunks(newChunks)
  }

  const removeChunk = (index: number) => {
    setChunks(chunks.filter((_, i) => i !== index))
  }

  const resetStyles = () => {
    setCaptionStyle("default")
    setCaptionColor("#FFFFFF")
    setFontSize(24)
  }

  const downloadVideo = () => {
    if (!processedVideo) return
    const a = document.createElement("a")
    a.href = processedVideo
    a.download = "captioned_agba_cinema.mp4"
    a.click()
  }

  const downloadSRT = () => {
    if (chunks.length === 0) return
    const content = generateSRT(chunks)
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "subtitles.srt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-12">
      {!isIsolated && (
        <Alert className="bg-orange-50 border-orange-200 rounded-3xl">
          <AlertTitle className="text-orange-800 font-black uppercase tracking-widest text-xs">Performance Warning</AlertTitle>
          <AlertDescription className="text-orange-700">
            Cross-Origin Isolation is not active. The tool will run slower and may experience memory issues.
            Try refreshing the page or using a modern browser like Chrome.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Upload & Options */}
        <div className="space-y-8">
          <div
            className={`relative group border-4 border-dashed rounded-[2.5rem] transition-all duration-300 p-12 text-center flex flex-col items-center justify-center min-h-[400px] ${videoFile ? "border-green-400 bg-green-50" : "border-gray-100 hover:border-yellow-400 hover:bg-yellow-50"
              }`}
          >
            <input
              type="file"
              accept="video/mp4,video/quicktime"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              disabled={isProcessing}
            />

            <AnimatePresence mode="wait">
              {!videoFile ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-4"
                >
                  <div className="w-24 h-24 bg-yellow-100 rounded-[2rem] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="h-10 w-10 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Drop Video Here</h3>
                    <p className="text-gray-500 font-medium">MP4 or MOV • Max 60s • Max 50MB</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 w-full"
                >
                  <video
                    key={videoPreview}
                    src={videoPreview!}
                    className="w-full rounded-2xl shadow-premium aspect-video bg-black object-contain z-20 relative"
                    controls
                    autoPlay
                    muted={false}
                    playsInline
                  />
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Video className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm truncate max-w-[150px]">{videoFile.name}</p>
                        <p className="text-xs text-gray-500">Ready for processing</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {videoFile && !processedVideo && !isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-6">
                {/* Style & Color Section */}
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                    <span>Accent Color</span>
                    <span>{captionColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["#FFFFFF", "#FACC15", "#FB923C", "#F87171", "#4ADE80", "#60A5FA", "#C084FC"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setCaptionColor(c)}
                        className={`w-10 h-10 rounded-full border-4 shadow-sm transition-transform active:scale-90 ${captionColor === c ? "border-black scale-110" : "border-white"
                          }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={captionColor}
                      onChange={(e) => setCaptionColor(e.target.value)}
                      className="w-10 h-10 rounded-full border-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                    <span>Text Style</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "pop", label: "🔥 The Pop" },
                      { id: "slide", label: "🚀 Smooth Slide" },
                      { id: "glow", label: "✨ Neon Fade" },
                      { id: "social", label: "📱 Classic Social" },
                      { id: "cinematic", label: "🎬 Cinematic" },
                      { id: "default", label: "📍 Static Bottom" }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setCaptionStyle(s.id)}
                        className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-tighter transition-all text-left ${captionStyle === s.id
                            ? "bg-black border-black text-white scale-[1.02] shadow-lg"
                            : "bg-white border-gray-100 opacity-60 hover:opacity-100 hover:border-gray-200"
                          }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>Font Size</span>
                      <span>{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="64"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>Noise Kill</span>
                      <span>{noiseLevel}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={noiseLevel}
                      onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
                      className="w-full accent-yellow-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100">
                  <input
                    type="checkbox"
                    id="cleanMusic"
                    checked={cleanMusic}
                    onChange={(e) => setCleanMusic(e.target.checked)}
                    className="w-5 h-5 accent-black"
                  />
                  <label htmlFor="cleanMusic" className="text-xs font-black uppercase tracking-widest text-gray-500 cursor-pointer">
                    Auto-Hide [Music] Tags
                  </label>
                </div>
              </div>

              {!isReviewing ? (
                <Button
                  onClick={processVideo}
                  disabled={isProcessing}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xl italic uppercase tracking-tighter h-20 rounded-[1.5rem] shadow-xl shadow-yellow-400/20 group"
                >
                  Analyze &amp; Transcribe
                  <Loader2 className="ml-3 h-6 w-6 animate-spin opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              ) : (
                <Button
                  onClick={renderFinalVideo}
                  disabled={isProcessing}
                  className="w-full bg-black hover:bg-gray-800 text-white font-black text-xl italic uppercase tracking-tighter h-20 rounded-[1.5rem] shadow-xl group"
                >
                  Burn Captions & Export
                  <CheckCircle className="ml-3 h-6 w-6" />
                </Button>
              )}
            </motion.div>
          )}

          {isReviewing && chunks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white rounded-[2rem] border-2 border-black overflow-hidden"
            >
              <div className="bg-black p-4 flex justify-between items-center">
                <h4 className="text-white font-black italic uppercase tracking-tighter">Edit Segments</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const last = chunks[chunks.length - 1]
                      const end = last ? last.timestamp[1] : 0
                      setChunks([...chunks, { text: "New Caption", timestamp: [end, end + 2] }])
                    }}
                    className="bg-green-500 text-white text-[10px] px-3 py-1 rounded font-bold uppercase hover:bg-green-600"
                  >
                    + Add Segment
                  </button>
                  <span className="bg-yellow-400 text-black text-[10px] px-2 py-1 rounded font-bold uppercase">{chunks.length} Lines</span>
                </div>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto space-y-4 bg-gray-50">
                {chunks.map((chunk, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <span className="text-[10px] font-black text-gray-300 mt-2">{formatTime(chunk.timestamp[0])}</span>
                    <textarea
                      value={chunk.text}
                      onChange={(e) => updateChunk(idx, e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold resize-none leading-relaxed"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black text-white p-8 rounded-[2.5rem] space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter text-yellow-400">{step}</h4>
                  <p className="text-gray-400 text-sm font-medium">Please keep this tab open</p>
                </div>
                <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-500">
                  <span>Processing Workflow</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-4 bg-gray-800 rounded-full [&>div]:bg-yellow-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {steps.map((s, idx) => {
                  const currentIdx = steps.indexOf(step)
                  const isDone = steps.indexOf(s) < currentIdx
                  const isCurrent = s === step

                  return (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDone ? "bg-green-500" : isCurrent ? "bg-yellow-400" : "bg-gray-800"
                        }`}>
                        {isDone ? <CheckCircle className="h-3 w-3 text-white" /> : <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isDone ? "text-green-500" : isCurrent ? "text-yellow-400" : "text-gray-600"
                        }`}>{s}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Alert variant="destructive" className="rounded-2xl border-2">
                <AlertTitle>Processing Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </div>

        {/* Right Side: Result */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {!processedVideo ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[500px] border-4 border-gray-50 rounded-[3rem] bg-gray-50/50 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-32 h-32 bg-white rounded-[3rem] flex items-center justify-center shadow-premium mb-6">
                  <Type className="h-12 w-12 text-gray-200" />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-300">Awaiting Processed Video</h3>
                <p className="text-gray-400 max-w-[250px] mx-auto mt-2">The captioned video will appear here once processed.</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-black aspect-video ">
                  <video key={processedVideo} controls className="w-full h-full object-contain">
                    <source src={processedVideo} type="video/mp4" />
                  </video>
                  <div className="absolute top-6 left-6 flex gap-2">
                    <span className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" /> Processed
                    </span>
                    <span className="bg-yellow-400 text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                      Captions Burnt
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={downloadVideo}
                    className="h-20 rounded-3xl bg-black text-white font-black text-lg italic uppercase tracking-tighter flex items-center justify-center gap-3 hover:bg-gray-800"
                  >
                    <Download className="h-6 w-6" /> Download Video
                  </Button>
                  <Button
                    variant="outline"
                    onClick={downloadSRT}
                    className="h-20 rounded-3xl border-2 border-gray-100 font-black text-lg italic uppercase tracking-tighter flex items-center justify-center gap-3 hover:bg-gray-50"
                  >
                    <Type className="h-6 w-6" /> Get Subtitles (.srt)
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setProcessedVideo(null)
                      setIsReviewing(true)
                    }}
                    className="w-full py-8 rounded-3xl border-2 border-yellow-400 text-black font-black uppercase tracking-tighter hover:bg-yellow-50 flex items-center justify-center gap-3"
                  >
                    <Pencil className="h-5 w-5" /> Adjust Captions or Style
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={reset}
                    className="w-full py-6 text-gray-400 font-bold hover:text-black flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Clear and Start Over
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
