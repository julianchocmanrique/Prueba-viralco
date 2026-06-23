import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'

import bodaImage from '../assets/plantillas/boda.png'
import cumpleImage from '../assets/plantillas/cumple.png'
import fiestaImage from '../assets/plantillas/fiesta.png'
import navidadImage from '../assets/plantillas/navidad.png'
import tropicalImage from '../assets/plantillas/tropical.png'

const templates = [
  {
    id: 'boda',
    name: 'Bodas',
    label: 'Wedding',
    image: bodaImage,
    tone: '#ef5a5a',
  },
  {
    id: 'fiesta',
    name: 'Fiestas privadas',
    label: 'Party',
    image: fiestaImage,
    tone: '#ff9f1c',
  },
  {
    id: 'corporativo',
    name: 'Corporativos',
    label: 'Brand',
    image: navidadImage,
    tone: '#2f80ed',
  },
  {
    id: 'cumple',
    name: 'Cumpleanos',
    label: 'Birthday',
    image: cumpleImage,
    tone: '#9b51e0',
  },
  {
    id: 'tropical',
    name: 'Tropical',
    label: 'Summer',
    image: tropicalImage,
    tone: '#00a870',
  },
]

const captureModes = ['Foto', 'GIF', 'Boomerang', 'Video', '360']
const filters = ['Original', 'Glam', 'B/N', 'Brannan', 'Vintage']
const experienceStyles = [
  {
    id: 'premium',
    name: 'Premium',
    mood: 'Limpio y elegante',
    accent: '#0a4de8',
    surface: '#eef5ff',
    dark: '#071225',
  },
  {
    id: 'neon',
    name: 'Neon',
    mood: 'Energia de fiesta',
    accent: '#d72cff',
    surface: '#f5e8ff',
    dark: '#180523',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    mood: 'Foto social sobria',
    accent: '#00a870',
    surface: '#e8f8f1',
    dark: '#072018',
  },
  {
    id: 'celebracion',
    name: 'Celebracion',
    mood: 'Color y movimiento',
    accent: '#ff9f1c',
    surface: '#fff3df',
    dark: '#261604',
  },
]
const cameraSources = ['Frontal', 'Trasera', 'USB/DSLR']
const orientations = ['Vertical', 'Horizontal', 'Cuadrado']
const qualityOptions = ['HD', 'Full HD', '4K']
const backgroundOptions = ['Original', 'Desenfoque', 'Color marca', 'Green screen']
const overlayOptions = ['Sin overlay', 'Canva PNG transparente', 'Marco Viralco', 'Logo + fecha', 'Sponsor']
const overlayImportSources = ['Canva PNG', 'Fototeca', 'Archivos', 'Google Drive']
const boothPlatforms = ['LumaBooth', 'DSLR Booth', 'Mirror Booth', 'Viralco web']
const printLayouts = ['Digital', 'Tira 2x6', 'Postal 4x6', 'Varias fotos']
const printLayoutDetails = {
  Digital: {
    name: 'Digital',
    note: 'Una foto vertical con plantilla completa.',
    slots: 1,
    width: 1200,
    height: 1500,
    printAspect: '4 / 5',
  },
  'Tira 2x6': {
    name: 'Tira 2x6',
    note: 'Tres fotos apiladas para tira impresa.',
    slots: 3,
    width: 600,
    height: 1800,
    printAspect: '2 / 6',
  },
  'Postal 4x6': {
    name: 'Postal 4x6',
    note: 'Una foto grande horizontal tipo postal.',
    slots: 1,
    width: 1800,
    height: 1200,
    printAspect: '4 / 6',
  },
  'Varias fotos': {
    name: 'Varias fotos',
    note: 'Collage de cuatro fotos en una plantilla.',
    slots: 4,
    width: 1600,
    height: 1200,
    printAspect: '4 / 3',
  },
}
const exportPresets = [
  {
    id: 'mirror-portrait',
    name: 'Mirror Booth',
    size: '1200 x 1800 px',
    note: 'Overlay vertical transparente como el flujo del video.',
    layout: 'Digital',
  },
  {
    id: 'strip-2x6',
    name: 'Tira 2x6',
    size: '600 x 1800 px',
    note: 'Tres fotos apiladas para imprimir o guardar.',
    layout: 'Tira 2x6',
  },
  {
    id: 'postcard-4x6',
    name: 'Postal 4x6',
    size: '1800 x 1200 px',
    note: 'Postal horizontal para marcos grandes.',
    layout: 'Postal 4x6',
  },
  {
    id: 'social-vertical',
    name: 'Historia vertical',
    size: '1080 x 1920 px',
    note: 'Entrega digital para WhatsApp e historias.',
    layout: 'Digital',
  },
]
const installChecklist = [
  'Exportar PNG con fondo transparente',
  'Subir como superposicion',
  'Elegir layout activo',
  'Probar QR e impresion',
]
const overlayQualityChecks = [
  'PNG con transparencia',
  'Medida igual al preset',
  'Foto dentro del area segura',
  'Prueba impresa antes del evento',
]
const setupTabs = [
  {
    id: 'evento',
    label: 'Evento',
    title: 'Nombre y captura',
    helper: 'Define el evento y el formato que va a usar el invitado.',
  },
  {
    id: 'captura',
    label: 'Captura',
    title: 'Ajustes del modo',
    helper: 'Controla tiempos, cantidad de tomas, revision y guardado original.',
  },
  {
    id: 'camara',
    label: 'Camara',
    title: 'Fuente y calidad',
    helper: 'Define camara frontal/trasera, orientacion, calidad y espejo de vista previa.',
  },
  {
    id: 'diseno',
    label: 'Diseno',
    title: 'Plantilla y exportacion',
    helper: 'Escoge filtro, plantilla, tamano de exportacion y formato de entrega.',
  },
  {
    id: 'efectos',
    label: 'Overlay',
    title: 'Fondos y superposicion',
    helper: 'Prepara el overlay transparente, su origen y la plataforma donde se instalara.',
  },
  {
    id: 'grabar',
    label: 'Grabar',
    title: 'Captura real',
    helper: 'Pide permiso de camara, prueba el encuadre y genera la captura.',
  },
  {
    id: 'salida',
    label: 'Salida',
    title: 'Entrega final',
    helper: 'Despues de grabar, habilita QR, envio digital e impresion.',
  },
  {
    id: 'resumen',
    label: 'Resumen',
    title: 'Evento listo',
    helper: 'Revisa todo antes de usarlo en el evento real.',
  },
]

const toolDetails = {
  WhatsApp: { title: 'WhatsApp', note: 'Abre WhatsApp con un mensaje listo para enviar.', accent: '#17a75b' },
  QR: { title: 'QR de descarga', note: 'Abre un QR para descargar o compartir el enlace.', accent: '#0a4de8' },
  Print: { title: 'Impresion', note: 'Imprime solo la foto final, no la pantalla de la app.', accent: '#222936' },
  Mail: { title: 'Email', note: 'Abre un correo con asunto y mensaje preparados.', accent: '#39a9ff' },
  SMS: { title: 'SMS', note: 'Prepara un mensaje de texto con el enlace.', accent: '#7b61ff' },
  Drive: { title: 'Drive', note: 'Abre Google Drive para guardar la entrega.', accent: '#f5a400' },
}

const captureModeDetails = {
  Foto: {
    title: 'Foto lista',
    instruction: 'Sonrie para la foto',
    primary: 'Tomar foto',
    countdown: '3',
    badge: '1 toma',
    output: 'Foto capturada',
    progress: ['Enfoque', 'Flash', 'Preview'],
    steps: ['Tomar foto', 'Elegir filtro', 'Imprimir', 'Compartir'],
    tools: ['WhatsApp', 'QR', 'Print', 'Mail'],
    settings: ['Cuenta regresiva 3s', 'Flash suave', 'Una foto por invitado'],
    control: { label: 'Cuenta regresiva', min: 1, max: 10, defaultValue: 3, unit: 's' },
  },
  GIF: {
    title: 'GIF animado',
    instruction: 'Tres poses rapidas',
    primary: 'Crear GIF',
    countdown: '1/3',
    badge: '3 fotos',
    output: 'GIF listo',
    progress: ['Pose 1', 'Pose 2', 'Pose 3'],
    steps: ['Capturar 3 fotos', 'Animar', 'Revisar', 'Compartir'],
    tools: ['WhatsApp', 'QR', 'SMS', 'Mail'],
    settings: ['3 poses automaticas', 'Velocidad media', 'Loop infinito'],
    control: { label: 'Cantidad de fotos', min: 2, max: 6, defaultValue: 3, unit: 'fotos' },
  },
  Boomerang: {
    title: 'Boomerang',
    instruction: 'Muevete un poco',
    primary: 'Grabar boom',
    countdown: '2s',
    badge: 'Loop',
    output: 'Boomerang listo',
    progress: ['Grabar', 'Reversa', 'Loop'],
    steps: ['Grabar clip', 'Crear loop', 'Revisar', 'Compartir'],
    tools: ['WhatsApp', 'QR', 'Mail', 'SMS'],
    settings: ['Clip de 2 segundos', 'Reversa automatica', 'Loop exportable'],
    control: { label: 'Duracion del clip', min: 1, max: 5, defaultValue: 2, unit: 's' },
  },
  Video: {
    title: 'Video corto',
    instruction: 'Mensaje para el evento',
    primary: 'Grabar video',
    countdown: 'REC',
    badge: '8s',
    output: 'Video guardado',
    progress: ['Rec', 'Procesar', 'Preview'],
    steps: ['Grabar', 'Revisar audio', 'Guardar', 'Compartir'],
    tools: ['WhatsApp', 'QR', 'Mail', 'Drive'],
    settings: ['Grabacion 8s', 'Audio activo', 'Formato vertical'],
    control: { label: 'Duracion del video', min: 3, max: 15, defaultValue: 8, unit: 's' },
  },
  360: {
    title: 'Video 360',
    instruction: 'Gira con la plataforma',
    primary: 'Iniciar 360',
    countdown: '360',
    badge: 'Spin',
    output: 'Clip 360 listo',
    progress: ['Cuenta', 'Giro', 'Render'],
    steps: ['Iniciar giro', 'Renderizar', 'Revisar', 'Compartir'],
    tools: ['WhatsApp', 'QR', 'Mail'],
    settings: ['Giro completo', 'Render rapido', 'Overlay del evento'],
    control: { label: 'Duracion del giro', min: 4, max: 20, defaultValue: 10, unit: 's' },
  },
}

const WebApp = () => {
  const { width } = useWindowDimensions()
  const [selectedTemplate, setSelectedTemplate] = useState(templates[1])
  const [selectedMode, setSelectedMode] = useState('360')
  const [selectedFilter, setSelectedFilter] = useState('Original')
  const [selectedExperienceStyle, setSelectedExperienceStyle] = useState('premium')
  const [copies, setCopies] = useState(1)
  const [eventName, setEventName] = useState('Viralco live booth')
  const [capturePhase, setCapturePhase] = useState('idle')
  const [activityMessage, setActivityMessage] = useState('Camara lista')
  const [captureCount, setCaptureCount] = useState(0)
  const [activeTab, setActiveTab] = useState('evento')
  const [cameraSource, setCameraSource] = useState('Frontal')
  const [orientation, setOrientation] = useState('Vertical')
  const [captureQuality, setCaptureQuality] = useState('Full HD')
  const [mirrorPreview, setMirrorPreview] = useState(true)
  const [stabilization, setStabilization] = useState(true)
  const [retakeEnabled, setRetakeEnabled] = useState(true)
  const [saveOriginal, setSaveOriginal] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [printLayout, setPrintLayout] = useState('Digital')
  const [exportPreset, setExportPreset] = useState(exportPresets[0].id)
  const [backgroundMode, setBackgroundMode] = useState('Original')
  const [overlayMode, setOverlayMode] = useState('Canva PNG transparente')
  const [overlayImportSource, setOverlayImportSource] = useState('Canva PNG')
  const [boothPlatform, setBoothPlatform] = useState('LumaBooth')
  const [overlayFileName, setOverlayFileName] = useState('baby-shower-overlay.png')
  const [overlayImageUrl, setOverlayImageUrl] = useState('')
  const [overlayOpacity, setOverlayOpacity] = useState(90)
  const [overlaySafeArea, setOverlaySafeArea] = useState(12)
  const [beautyLevel, setBeautyLevel] = useState(30)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState('')
  const [recordingUrl, setRecordingUrl] = useState('')
  const [photoPrintUrl, setPhotoPrintUrl] = useState('')
  const [photoFrames, setPhotoFrames] = useState([])
  const [captureProgressIndex, setCaptureProgressIndex] = useState(0)
  const [liveCountdown, setLiveCountdown] = useState('')
  const desktopVideoRef = useRef(null)
  const mobileVideoRef = useRef(null)
  const streamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const captureTimerRef = useRef(null)
  const progressTimerRef = useRef(null)
  const countdownTimerRef = useRef(null)
  const [modeConfigValues, setModeConfigValues] = useState(
    captureModes.reduce(
      (values, mode) => ({
        ...values,
        [mode]: captureModeDetails[mode].control.defaultValue,
      }),
      {},
    ),
  )
  const isMobile = width < 760
  const modeDetails = captureModeDetails[selectedMode]
  const canPrintSelectedMode = selectedMode === 'Foto'
  const availableTools = modeDetails.tools.filter((tool) => tool !== 'Print' || canPrintSelectedMode)
  const isCapturing = capturePhase === 'capturing'
  const currentTabIndex = setupTabs.findIndex((tab) => tab.id === activeTab)
  const currentTab = setupTabs[currentTabIndex] || setupTabs[0]
  const canGoBack = currentTabIndex > 0
  const canGoNext = currentTabIndex < setupTabs.length - 1
  const selectedConfigValue = modeConfigValues[selectedMode]
  const controlLabel = `${selectedConfigValue} ${modeDetails.control.unit}`
  const selectedPrintLayout = printLayoutDetails[printLayout] || printLayoutDetails.Digital
  const selectedExportPreset =
    exportPresets.find((preset) => preset.id === exportPreset) || exportPresets[0]
  const visualStyle =
    experienceStyles.find((style) => style.id === selectedExperienceStyle) || experienceStyles[0]
  const overlayReady = overlayMode !== 'Sin overlay'
  const overlayStatus = overlayImageUrl ? overlayFileName : `${selectedTemplate.name} como preview`
  const photoFramesNeeded = selectedMode === 'Foto' ? selectedPrintLayout.slots : 1
  const photoFramesReady = Math.min(photoFrames.length, photoFramesNeeded)
  const hasRecording = captureCount > 0 || capturePhase === 'complete'
  const hasCamera = Boolean(cameraStream)
  const outputReady = capturePhase === 'complete'
  const idleCountdown =
    selectedMode === 'GIF'
      ? `1/${selectedConfigValue}`
      : selectedMode === 'Video'
        ? 'REC'
        : selectedMode === '360'
          ? '360'
          : String(selectedConfigValue)
  const displayCountdown = isCapturing && liveCountdown ? liveCountdown : idleCountdown
  const displayBadge =
    selectedMode === 'GIF'
      ? `${selectedConfigValue} fotos`
      : selectedMode === '360'
        ? `${selectedConfigValue}s giro`
        : `${selectedConfigValue}${modeDetails.control.unit}`
  const progressActiveCount = outputReady
    ? modeDetails.progress.length
    : isCapturing
      ? Math.max(1, captureProgressIndex + 1)
      : 0
  const modeActionCards =
    selectedMode === 'Foto'
      ? [
          ['Temporizador', controlLabel],
          ['Formato final', printLayout],
          ['Fotos necesarias', `${photoFramesNeeded}`],
          ['Entrega', 'WhatsApp / QR / Email'],
        ]
      : selectedMode === 'GIF'
        ? [
            ['Secuencia', `${selectedConfigValue} poses`],
            ['Ritmo', 'Rafaga automatica'],
            ['Resultado', 'Animacion loop'],
            ['Entrega', 'WhatsApp / QR / SMS'],
          ]
        : selectedMode === 'Boomerang'
          ? [
              ['Duracion', controlLabel],
              ['Movimiento', 'Ida + reversa'],
              ['Resultado', 'Loop corto'],
              ['Entrega', 'WhatsApp / QR / SMS'],
            ]
          : selectedMode === 'Video'
            ? [
                ['Duracion', controlLabel],
                ['Audio', audioEnabled ? 'Activo' : 'Apagado'],
                ['Resultado', 'Clip vertical'],
                ['Entrega', 'WhatsApp / QR / Drive'],
              ]
            : [
                ['Duracion', controlLabel],
                ['Guia', 'Giro completo'],
                ['Resultado', 'Clip 360'],
                ['Entrega', 'WhatsApp / QR / Email'],
              ]
  const resultLabel =
    selectedMode === 'Foto'
      ? `${printLayout} listo con plantilla ${selectedTemplate.name}`
      : selectedMode === 'GIF'
        ? `${selectedConfigValue} fotos listas para animar`
        : selectedMode === 'Boomerang'
          ? 'Loop corto listo para compartir'
          : selectedMode === 'Video'
            ? `${selectedConfigValue}s de video con ${audioEnabled ? 'audio' : 'audio apagado'}`
            : `${selectedConfigValue}s de recorrido 360`

  useEffect(() => {
    ;[desktopVideoRef.current, mobileVideoRef.current].forEach((video) => {
      if (!video || !cameraStream) {
        return
      }

      video.srcObject = cameraStream
      video.play?.().catch(() => undefined)
    })
  }, [cameraStream, isMobile])

  useEffect(
    () => () => {
      if (captureTimerRef.current) {
        clearTimeout(captureTimerRef.current)
      }

      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }

      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }

      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }

      streamRef.current?.getTracks().forEach((track) => track.stop())
    },
    [],
  )

  useEffect(
    () => () => {
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl)
      }
    },
    [recordingUrl],
  )

  useEffect(
    () => () => {
      if (overlayImageUrl) {
        URL.revokeObjectURL(overlayImageUrl)
      }
    },
    [overlayImageUrl],
  )

  const finishCapture = (message) => {
    if (captureTimerRef.current) {
      clearTimeout(captureTimerRef.current)
      captureTimerRef.current = null
    }

    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }

    setLiveCountdown('')
    setCaptureProgressIndex(modeDetails.progress.length - 1)
    setCapturePhase('complete')
    setCaptureCount((count) => count + 1)
    setActivityMessage(message)
    setActiveTab('salida')
  }

  const chooseMode = (mode) => {
    setSelectedMode(mode)
    setCapturePhase('idle')
    setCaptureProgressIndex(0)
    setLiveCountdown('')
    setPhotoFrames([])
    setPhotoPrintUrl('')
    setActivityMessage(`${captureModeDetails[mode].title}: listo para capturar`)
  }

  const updateModeConfig = (direction) => {
    const { min, max } = modeDetails.control
    const nextValue = Math.min(max, Math.max(min, selectedConfigValue + direction))
    setModeConfigValues((values) => ({
      ...values,
      [selectedMode]: nextValue,
    }))
    setActivityMessage(`${modeDetails.control.label}: ${nextValue} ${modeDetails.control.unit}`)
  }

  const stopCameraStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraStream(null)
  }

  const getCaptureDurationMs = () => {
    if (selectedMode === 'Foto') {
      return selectedConfigValue * 1000
    }

    if (selectedMode === 'GIF') {
      return selectedConfigValue * 650
    }

    return selectedConfigValue * 1000
  }

  const startProgressTimeline = (durationMs) => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }

    setCaptureProgressIndex(0)
    const steps = Math.max(1, modeDetails.progress.length)
    const intervalMs = Math.max(450, Math.floor(durationMs / steps))

    progressTimerRef.current = setInterval(() => {
      setCaptureProgressIndex((index) => Math.min(index + 1, steps - 1))
    }, intervalMs)
  }

  const getLiveCountdownLabel = (remaining, step = 1) => {
    if (selectedMode === 'GIF') {
      return `${Math.min(step, selectedConfigValue)}/${selectedConfigValue}`
    }

    if (selectedMode === 'Video') {
      return `REC ${remaining}s`
    }

    if (selectedMode === '360') {
      return `${remaining}s`
    }

    if (selectedMode === 'Boomerang') {
      return `${remaining}s`
    }

    return String(remaining)
  }

  const startLiveCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }

    if (selectedMode === 'GIF') {
      let step = 1
      setLiveCountdown(getLiveCountdownLabel(0, step))
      countdownTimerRef.current = setInterval(() => {
        step += 1
        setLiveCountdown(getLiveCountdownLabel(0, step))
        if (step >= selectedConfigValue && countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current)
          countdownTimerRef.current = null
        }
      }, 650)
      return
    }

    let remaining = selectedMode === 'Foto' ? selectedConfigValue : Math.ceil(getCaptureDurationMs() / 1000)
    setLiveCountdown(getLiveCountdownLabel(remaining))

    countdownTimerRef.current = setInterval(() => {
      remaining -= 1
      setLiveCountdown(getLiveCountdownLabel(Math.max(remaining, 0)))
      if (remaining <= 0 && countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
      }
    }, 1000)
  }

  const capturePhotoFrame = () => {
    if (typeof document === 'undefined') {
      return ''
    }

    const video = (isMobile ? mobileVideoRef.current : desktopVideoRef.current) ||
      mobileVideoRef.current ||
      desktopVideoRef.current

    if (!video?.videoWidth || !video?.videoHeight) {
      return ''
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')

    if (!context) {
      return ''
    }

    if (mirrorPreview) {
      context.translate(canvas.width, 0)
      context.scale(-1, 1)
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.92)
  }

  const getTemplateImageUrl = () =>
    typeof selectedTemplate.image === 'string' ? selectedTemplate.image : selectedTemplate.image?.uri || ''

  const handleOverlayFile = (event) => {
    const file = event?.target?.files?.[0]

    if (!file) {
      return
    }

    if (overlayImageUrl) {
      URL.revokeObjectURL(overlayImageUrl)
    }

    setOverlayImageUrl(URL.createObjectURL(file))
    setOverlayFileName(file.name)
    setOverlayMode('Canva PNG transparente')
    setOverlayImportSource('Archivos')
    setPhotoFrames([])
    setPhotoPrintUrl('')
    setCapturePhase('idle')
    setActivityMessage(`${file.name} cargado como overlay PNG`)
  }

  const loadCanvasImage = (source) =>
    new Promise((resolve, reject) => {
      if (!source || typeof window === 'undefined' || !window.Image) {
        reject(new Error('Imagen no disponible'))
        return
      }

      const image = new window.Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = source
    })

  const drawCoverImage = (context, image, x, y, width, height) => {
    const imageRatio = image.width / image.height
    const targetRatio = width / height
    const sourceWidth = imageRatio > targetRatio ? image.height * targetRatio : image.width
    const sourceHeight = imageRatio > targetRatio ? image.height : image.width / targetRatio
    const sourceX = (image.width - sourceWidth) / 2
    const sourceY = (image.height - sourceHeight) / 2

    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
  }

  const drawContainImage = (context, image, x, y, width, height) => {
    const imageRatio = image.width / image.height
    const targetRatio = width / height
    const targetWidth = imageRatio > targetRatio ? width : height * imageRatio
    const targetHeight = imageRatio > targetRatio ? width / imageRatio : height
    const targetX = x + (width - targetWidth) / 2
    const targetY = y + (height - targetHeight) / 2

    context.drawImage(image, targetX, targetY, targetWidth, targetHeight)
  }

  const roundedRectPath = (context, x, y, width, height, radius) => {
    if (context.roundRect) {
      context.roundRect(x, y, width, height, radius)
      return
    }

    const safeRadius = Math.min(radius, width / 2, height / 2)
    context.moveTo(x + safeRadius, y)
    context.lineTo(x + width - safeRadius, y)
    context.quadraticCurveTo(x + width, y, x + width, y + safeRadius)
    context.lineTo(x + width, y + height - safeRadius)
    context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height)
    context.lineTo(x + safeRadius, y + height)
    context.quadraticCurveTo(x, y + height, x, y + height - safeRadius)
    context.lineTo(x, y + safeRadius)
    context.quadraticCurveTo(x, y, x + safeRadius, y)
  }

  const getPhotoSlots = (layout, width, height) => {
    if (layout === 'Tira 2x6') {
      const margin = width * 0.075
      const gap = height * 0.025
      const header = height * 0.095
      const footer = height * 0.075
      const slotHeight = (height - header - footer - gap * 2 - margin * 2) / 3

      return [0, 1, 2].map((index) => ({
        x: margin,
        y: header + margin + index * (slotHeight + gap),
        width: width - margin * 2,
        height: slotHeight,
      }))
    }

    if (layout === 'Varias fotos') {
      const margin = width * 0.06
      const gap = width * 0.035
      const header = height * 0.12
      const footer = height * 0.08
      const slotWidth = (width - margin * 2 - gap) / 2
      const slotHeight = (height - header - footer - margin * 2 - gap) / 2

      return [0, 1, 2, 3].map((index) => ({
        x: margin + (index % 2) * (slotWidth + gap),
        y: header + margin + Math.floor(index / 2) * (slotHeight + gap),
        width: slotWidth,
        height: slotHeight,
      }))
    }

    if (layout === 'Postal 4x6') {
      const margin = width * 0.055
      return [
        {
          x: margin,
          y: height * 0.16,
          width: width - margin * 2,
          height: height * 0.68,
        },
      ]
    }

    const margin = width * 0.07
    return [
      {
        x: margin,
        y: height * 0.17,
        width: width - margin * 2,
        height: height * 0.66,
      },
    ]
  }

  const composePhotoOutput = async (frames) => {
    if (typeof document === 'undefined' || !frames.length) {
      return frames[0] || ''
    }

    const { width, height } = selectedPrintLayout
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')

    if (!context) {
      return frames[0] || ''
    }

    context.fillStyle = '#071225'
    context.fillRect(0, 0, width, height)

    let templateImage = null
    let overlayImage = null

    try {
      templateImage = await loadCanvasImage(getTemplateImageUrl())
      context.globalAlpha = 0.32
      drawCoverImage(context, templateImage, 0, 0, width, height)
      context.globalAlpha = 1
    } catch {
      context.globalAlpha = 1
    }

    if (overlayReady) {
      overlayImage = await loadCanvasImage(overlayImageUrl || getTemplateImageUrl()).catch(() => null)
    }

    const gradient = context.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, selectedTemplate.tone)
    gradient.addColorStop(0.48, '#0a4de8')
    gradient.addColorStop(1, '#051027')
    context.globalAlpha = 0.58
    context.fillStyle = gradient
    context.fillRect(0, 0, width, height)
    context.globalAlpha = 1

    const frameImages = await Promise.all(frames.map((frame) => loadCanvasImage(frame).catch(() => null)))
    const slots = getPhotoSlots(printLayout, width, height)

    slots.forEach((slot, index) => {
      const image = frameImages[index] || frameImages[index % frameImages.length]
      const radius = Math.max(18, width * 0.018)

      context.save()
      context.beginPath()
      roundedRectPath(context, slot.x, slot.y, slot.width, slot.height, radius)
      context.clip()
      context.fillStyle = '#101419'
      context.fillRect(slot.x, slot.y, slot.width, slot.height)
      if (image) {
        drawCoverImage(context, image, slot.x, slot.y, slot.width, slot.height)
      }

      if (overlayImage) {
        context.globalAlpha = Math.max(0.15, overlayOpacity / 100) * 0.32
        drawCoverImage(context, overlayImage, slot.x, slot.y, slot.width, slot.height)
        context.globalAlpha = overlayOpacity / 100
        drawContainImage(context, overlayImage, slot.x, slot.y, slot.width, slot.height)
        context.globalAlpha = 1
      }
      context.restore()

      context.lineWidth = Math.max(8, width * 0.012)
      context.strokeStyle = overlayImage ? 'rgba(255,255,255,0.9)' : '#ffffff'
      context.beginPath()
      roundedRectPath(context, slot.x, slot.y, slot.width, slot.height, radius)
      context.stroke()
    })

    context.fillStyle = '#ffffff'
    context.font = `900 ${Math.round(width * (printLayout === 'Tira 2x6' ? 0.062 : 0.04))}px Arial`
    context.textAlign = 'left'
    context.fillText(eventName || 'Viralco', width * 0.07, height * 0.075)
    context.font = `800 ${Math.round(width * (printLayout === 'Tira 2x6' ? 0.035 : 0.022))}px Arial`
    context.fillStyle = 'rgba(255,255,255,0.82)'
    context.fillText(`${selectedTemplate.name} / ${selectedFilter} / ${overlayMode}`, width * 0.07, height * 0.11)

    context.textAlign = 'right'
    context.font = `900 ${Math.round(width * (printLayout === 'Tira 2x6' ? 0.05 : 0.032))}px Arial`
    context.fillStyle = '#ffffff'
    context.fillText('Viralco', width * 0.93, height * 0.94)
    context.font = `800 ${Math.round(width * (printLayout === 'Tira 2x6' ? 0.03 : 0.02))}px Arial`
    context.fillStyle = 'rgba(255,255,255,0.72)'
    context.fillText('Producciones', width * 0.93, height * 0.97)

    return canvas.toDataURL('image/jpeg', 0.94)
  }

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  const buildPrintablePhoto = () => {
    const templateImageUrl = getTemplateImageUrl()
    const imageUrl = escapeHtml(photoPrintUrl || templateImageUrl)
    const safeEventName = escapeHtml(eventName)
    const safeFilter = escapeHtml(selectedFilter)
    const safeTemplateName = escapeHtml(selectedTemplate.name)
    const layoutLabel = printLayout === 'Digital' ? 'Foto digital' : printLayout
    const safeLayoutLabel = escapeHtml(layoutLabel)
    const repeatedPhotos = Array.from({ length: Math.max(1, copies) }, (_, index) => index)
    const printColumns = copies === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))'

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Impresion Viralco - ${safeEventName}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #f3f5f8;
        color: #111827;
        font-family: Arial, Helvetica, sans-serif;
      }
      .sheet {
        width: 100%;
        min-height: 100vh;
        padding: 22px;
        display: grid;
        gap: 18px;
        place-items: center;
      }
      .print-card {
        width: min(92vw, 620px);
        background: #fff;
        padding: 22px;
        border: 1px solid #d8dee8;
      }
      .brand {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        margin-bottom: 18px;
        font-weight: 900;
      }
      .brand-mark {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        background: #0a4de8;
        color: #fff;
        font-size: 24px;
      }
      .event {
        flex: 1;
      }
      .event-title {
        font-size: 18px;
        line-height: 23px;
      }
      .event-meta {
        color: #596273;
        font-size: 12px;
        margin-top: 3px;
      }
      .photos {
        display: grid;
        grid-template-columns: ${printColumns};
        gap: 12px;
      }
      .photo {
        border: 8px solid #fff;
        outline: 1px solid #d8dee8;
        background: #101419;
        aspect-ratio: ${selectedPrintLayout.printAspect};
        overflow: hidden;
      }
      .photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .footer {
        margin-top: 16px;
        display: flex;
        justify-content: space-between;
        color: #596273;
        font-size: 11px;
        font-weight: 700;
      }
      @media print {
        body { background: #fff; }
        .sheet { padding: 0; min-height: auto; display: block; }
        .print-card {
          width: 100%;
          min-height: 100vh;
          border: 0;
          padding: 0.35in;
          break-after: page;
        }
      }
    </style>
  </head>
  <body>
    <main class="sheet">
      <section class="print-card">
        <header class="brand">
          <div class="brand-mark">V</div>
          <div class="event">
            <div class="event-title">${safeEventName}</div>
            <div class="event-meta">${safeLayoutLabel} / ${safeFilter} / ${safeTemplateName}</div>
          </div>
        </header>
        <div class="photos">
          ${repeatedPhotos
            .map(
              () => `<figure class="photo"><img src="${imageUrl}" alt="Foto Viralco" /></figure>`,
            )
            .join('')}
        </div>
        <footer class="footer">
          <span>Viralco Producciones</span>
          <span>${copies} copia${copies === 1 ? '' : 's'}</span>
        </footer>
      </section>
    </main>
    <script>
      window.addEventListener('load', () => {
        setTimeout(() => window.print(), 250)
      })
    </script>
  </body>
</html>`
  }

  const printPhotoOutput = () => {
    if (!canPrintSelectedMode) {
      setActivityMessage('La impresion solo esta disponible para Foto')
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      setActivityMessage('El navegador bloqueo la ventana de impresion')
      return
    }

    printWindow.document.open()
    printWindow.document.write(buildPrintablePhoto())
    printWindow.document.close()
  }

  const requestCameraStream = async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('Este navegador no permite abrir camara desde la web')
    }

    stopCameraStream()

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: cameraSource === 'Trasera' ? 'environment' : 'user' },
        width: { ideal: captureQuality === '4K' ? 3840 : captureQuality === 'Full HD' ? 1920 : 1280 },
        height: { ideal: captureQuality === '4K' ? 2160 : captureQuality === 'Full HD' ? 1080 : 720 },
      },
      audio: selectedMode === 'Video' && audioEnabled,
    })

    streamRef.current = stream
    setCameraStream(stream)
    return stream
  }

  const startCapture = async () => {
    const shouldResetPhotoFrames =
      selectedMode !== 'Foto' || capturePhase === 'complete' || photoFrames.length >= photoFramesNeeded

    setCameraError('')
    setRecordingUrl('')
    setPhotoPrintUrl('')
    if (shouldResetPhotoFrames) {
      setPhotoFrames([])
    }
    setCaptureProgressIndex(0)
    setCapturePhase('capturing')
    setActivityMessage('Solicitando permiso de camara del celular...')

    let stream
    try {
      stream = await requestCameraStream()
    } catch (error) {
      setCapturePhase('idle')
      setLiveCountdown('')
      setCameraError(error.message)
      setActivityMessage('No se pudo abrir la camara. Revisa permisos del navegador.')
      return
    }

    setActivityMessage(`${modeDetails.primary} con camara activa (${controlLabel})`)

    const durationMs = getCaptureDurationMs()
    startProgressTimeline(durationMs)
    startLiveCountdown()

    if (selectedMode === 'Foto' || !window.MediaRecorder) {
      captureTimerRef.current = setTimeout(async () => {
        if (selectedMode === 'Foto') {
          const frame = capturePhotoFrame()
          const currentFrames = shouldResetPhotoFrames ? [] : photoFrames
          const nextFrames = [...currentFrames, frame].filter(Boolean).slice(-photoFramesNeeded)
          setPhotoFrames(nextFrames)

          if (nextFrames.length < photoFramesNeeded) {
            if (captureTimerRef.current) {
              clearTimeout(captureTimerRef.current)
              captureTimerRef.current = null
            }

            if (progressTimerRef.current) {
              clearInterval(progressTimerRef.current)
              progressTimerRef.current = null
            }

            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current)
              countdownTimerRef.current = null
            }

            setLiveCountdown('')
            setCaptureProgressIndex(0)
            setCapturePhase('idle')
            setActivityMessage(
              `Foto ${nextFrames.length} de ${photoFramesNeeded} guardada para ${printLayout}. Toma la siguiente.`,
            )
            return
          }

          const finalPhoto = await composePhotoOutput(nextFrames)
          setPhotoPrintUrl(finalPhoto || frame)
        }

        finishCapture(
          selectedMode === 'Foto'
            ? `${printLayout} final con plantilla ${selectedTemplate.name}`
            : `${modeDetails.output} con camara del celular (${controlLabel})`,
        )
      }, durationMs)
      return
    }

    const chunks = []
    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data?.size) {
        chunks.push(event.data)
      }
    }

    recorder.onstop = () => {
      const type = chunks[0]?.type || 'video/webm'
      const blob = new Blob(chunks, { type })
      setRecordingUrl(URL.createObjectURL(blob))
      finishCapture(`${modeDetails.output} grabado con la camara del celular (${controlLabel})`)
    }

    recorder.start()
    captureTimerRef.current = setTimeout(() => {
      if (recorder.state === 'recording') {
        recorder.stop()
      }
    }, durationMs)
  }

  const runTool = (tool) => {
    if (!hasRecording) {
      setActiveTab('grabar')
      setActivityMessage('Primero graba una captura antes de compartir')
      return
    }

    if (tool === 'Print' && !canPrintSelectedMode) {
      setActivityMessage('La impresion solo esta disponible para Foto')
      return
    }

    const pageUrl =
      typeof window !== 'undefined'
        ? window.location.href
        : 'https://www.viralcoproducciones.com/prueba-viralco/'
    const shareText = `${eventName}: ${modeDetails.output} de Viralco listo para compartir. ${pageUrl}`
    const encodedText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(pageUrl)
    const openExternal = (url) => {
      if (typeof window === 'undefined') return
      window.open(url, '_blank', 'noopener,noreferrer')
    }

    const messages = {
      WhatsApp: 'WhatsApp abierto con mensaje preparado',
      QR: 'QR abierto para descarga',
      Print: `${copies} copia${copies === 1 ? '' : 's'} de la foto lista${copies === 1 ? '' : 's'} para impresion`,
      Mail: 'Correo abierto con mensaje preparado',
      SMS: 'SMS preparado con enlace',
      Drive: 'Google Drive abierto para guardar entrega',
    }

    if (tool === 'WhatsApp') {
      openExternal(`https://wa.me/?text=${encodedText}`)
    }

    if (tool === 'QR') {
      openExternal(`https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodedUrl}`)
    }

    if (tool === 'Print') {
      printPhotoOutput()
    }

    if (tool === 'Mail' && typeof window !== 'undefined') {
      window.location.href = `mailto:?subject=${encodeURIComponent(`Captura Viralco - ${eventName}`)}&body=${encodedText}`
    }

    if (tool === 'SMS' && typeof window !== 'undefined') {
      window.location.href = `sms:?&body=${encodedText}`
    }

    if (tool === 'Drive') {
      openExternal('https://drive.google.com/drive/my-drive')
    }

    setCapturePhase('complete')
    setActivityMessage(messages[tool] || `${tool} listo`)
  }

  const goToNextTab = () => {
    const currentIndex = setupTabs.findIndex((tab) => tab.id === activeTab)
    const nextTab = setupTabs[Math.min(currentIndex + 1, setupTabs.length - 1)]
    setActiveTab(nextTab.id)
  }

  const goToPreviousTab = () => {
    const currentIndex = setupTabs.findIndex((tab) => tab.id === activeTab)
    const previousTab = setupTabs[Math.max(currentIndex - 1, 0)]
    setActiveTab(previousTab.id)
  }

  const getNextLabel = () => {
    if (activeTab === 'evento') return 'Configurar captura'
    if (activeTab === 'captura') return 'Configurar camara'
    if (activeTab === 'camara') return 'Elegir diseno'
    if (activeTab === 'diseno') return 'Elegir efectos'
    if (activeTab === 'efectos') return 'Ir a grabar'
    if (activeTab === 'grabar') return hasRecording ? 'Ver salida' : 'Esperando captura'
    if (activeTab === 'salida') return 'Ver resumen'
    return 'Finalizado'
  }

  const renderMobileStepNav = () => (
    <View style={styles.mobileStepNav}>
      <Pressable
        onPress={goToPreviousTab}
        disabled={!canGoBack}
        style={[styles.mobileSecondaryButton, !canGoBack && styles.mobileButtonDisabled]}
      >
        <Text style={[styles.mobileSecondaryText, !canGoBack && styles.mobileButtonDisabledText]}>
          Atras
        </Text>
      </Pressable>
      <Pressable
        onPress={goToNextTab}
        disabled={(!canGoNext && activeTab !== 'grabar') || (activeTab === 'grabar' && !hasRecording)}
        style={[
          styles.mobileStepNavPrimary,
          ((!canGoNext && activeTab !== 'grabar') || (activeTab === 'grabar' && !hasRecording)) &&
            styles.mobileButtonDisabled,
        ]}
      >
        <Text
          style={[
            styles.mobileStepNavPrimaryText,
            ((!canGoNext && activeTab !== 'grabar') || (activeTab === 'grabar' && !hasRecording)) &&
              styles.mobileButtonDisabledText,
          ]}
        >
          {getNextLabel()}
        </Text>
      </Pressable>
    </View>
  )

  const renderDesktopStepNav = () => (
    <View style={styles.desktopStepNav}>
      <Pressable
        onPress={goToPreviousTab}
        disabled={!canGoBack}
        style={[styles.secondaryButton, !canGoBack && styles.disabledButton]}
      >
        <Text style={[styles.secondaryButtonText, !canGoBack && styles.disabledText]}>Atras</Text>
      </Pressable>
      <Pressable
        onPress={goToNextTab}
        disabled={(!canGoNext && activeTab !== 'grabar') || (activeTab === 'grabar' && !hasRecording)}
        style={[
          styles.printButton,
          ((!canGoNext && activeTab !== 'grabar') || (activeTab === 'grabar' && !hasRecording)) &&
            styles.printButtonDisabled,
        ]}
      >
        <Text style={styles.printButtonText}>{getNextLabel()}</Text>
      </Pressable>
    </View>
  )

  const renderMobileFlowIntro = () => (
    <View style={styles.mobileFlowIntro}>
      <Text style={styles.mobileFlowStep}>Paso {currentTabIndex + 1} de {setupTabs.length}</Text>
      <Text style={styles.mobileFlowTitle}>{currentTab.title}</Text>
      <Text style={styles.mobileFlowText}>{currentTab.helper}</Text>
    </View>
  )

  const renderDesktopFlowIntro = () => (
    <View style={styles.flowIntro}>
      <Text style={styles.flowStep}>Paso {currentTabIndex + 1} de {setupTabs.length}</Text>
      <Text style={styles.flowTitle}>{currentTab.title}</Text>
      <Text style={styles.flowText}>{currentTab.helper}</Text>
    </View>
  )

  const renderMobileShareCard = (tool) => {
    const detail = toolDetails[tool] || { title: tool, note: 'Canal de entrega disponible.', accent: colors.red }

    return (
      <Pressable key={tool} onPress={() => runTool(tool)} style={styles.mobileShareCard}>
        <View style={[styles.mobileShareIcon, { backgroundColor: detail.accent }]}>
          <Text style={styles.mobileShareIconText}>{detail.title.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.mobileShareBody}>
          <Text style={styles.mobileShareTitle}>{detail.title}</Text>
          <Text style={styles.mobileShareNote}>{detail.note}</Text>
        </View>
      </Pressable>
    )
  }

  const renderDesktopShareCard = (tool) => {
    const detail = toolDetails[tool] || { title: tool, note: 'Canal de entrega disponible.', accent: colors.red }

    return (
      <Pressable key={tool} onPress={() => runTool(tool)} style={styles.shareCard}>
        <View style={[styles.shareIcon, { backgroundColor: detail.accent }]}>
          <Text style={styles.shareIconText}>{detail.title.slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={styles.shareTitle}>{detail.title}</Text>
        <Text style={styles.shareNote}>{detail.note}</Text>
      </Pressable>
    )
  }

  const renderMobileOptions = (options, value, onChange) => (
    <View style={styles.mobileModes}>
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          style={[styles.mobileModeButton, value === option && styles.mobileModeButtonActive]}
        >
          <Text style={[styles.mobileModeText, value === option && styles.mobileModeTextActive]}>
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  )

  const renderDesktopOptions = (options, value, onChange) => (
    <View style={styles.modeRow}>
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          style={[styles.modeButton, value === option && styles.modeButtonActive]}
        >
          <Text style={[styles.modeButtonText, value === option && styles.modeButtonTextActive]}>
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  )

  const choosePrintLayout = (layout) => {
    setPrintLayout(layout)
    setPhotoFrames([])
    setPhotoPrintUrl('')
    if (selectedMode === 'Foto') {
      setCapturePhase('idle')
      setActivityMessage(`${layout} seleccionado. Graba ${printLayoutDetails[layout].slots} foto${printLayoutDetails[layout].slots === 1 ? '' : 's'}.`)
    }
  }

  const chooseTemplate = (template) => {
    setSelectedTemplate(template)
    setPhotoFrames([])
    setPhotoPrintUrl('')
    if (selectedMode === 'Foto') {
      setCapturePhase('idle')
      setActivityMessage(`Plantilla ${template.name} seleccionada. Vuelve a tomar la foto final.`)
    }
  }

  const chooseExportPreset = (preset) => {
    setExportPreset(preset.id)
    setPhotoFrames([])
    setPhotoPrintUrl('')

    if (selectedMode === 'Foto' && preset.layout) {
      setPrintLayout(preset.layout)
      setCapturePhase('idle')
    }

    setActivityMessage(`${preset.name} configurado a ${preset.size} con PNG transparente`)
  }

  const getLayoutPreviewSlots = (layout) => {
    if (layout === 'Tira 2x6') {
      return [
        { left: '13%', top: '15%', width: '74%', height: '22%' },
        { left: '13%', top: '39%', width: '74%', height: '22%' },
        { left: '13%', top: '63%', width: '74%', height: '22%' },
      ]
    }

    if (layout === 'Varias fotos') {
      return [
        { left: '10%', top: '18%', width: '37%', height: '28%' },
        { left: '53%', top: '18%', width: '37%', height: '28%' },
        { left: '10%', top: '52%', width: '37%', height: '28%' },
        { left: '53%', top: '52%', width: '37%', height: '28%' },
      ]
    }

    if (layout === 'Postal 4x6') {
      return [{ left: '9%', top: '25%', width: '82%', height: '52%' }]
    }

    return [{ left: '14%', top: '20%', width: '72%', height: '58%' }]
  }

  const renderPhotoLayoutCards = (variant = 'desktop') => {
    const isMobileLayout = variant === 'mobile'

    return (
      <View style={isMobileLayout ? styles.mobileLayoutGrid : styles.photoLayoutGrid}>
        {printLayouts.map((layout) => {
          const detail = printLayoutDetails[layout]
          const active = printLayout === layout

          return (
            <Pressable
              key={layout}
              onPress={() => choosePrintLayout(layout)}
              style={[
                isMobileLayout ? styles.mobileLayoutCard : styles.photoLayoutCard,
                active && (isMobileLayout ? styles.mobileLayoutCardActive : styles.photoLayoutCardActive),
              ]}
            >
              <View
                style={[
                  isMobileLayout ? styles.mobileLayoutPreview : styles.photoLayoutPreview,
                  layout === 'Tira 2x6' && styles.photoLayoutPreviewStrip,
                ]}
              >
                <View style={[styles.photoLayoutPreviewTint, { backgroundColor: selectedTemplate.tone }]} />
                {getLayoutPreviewSlots(layout).map((slot, index) => (
                  <View key={`${layout}-${index}`} style={[styles.photoLayoutPreviewSlot, slot]}>
                    <Text style={styles.photoLayoutPreviewSlotText}>{index + 1}</Text>
                  </View>
                ))}
              </View>
              <Text style={isMobileLayout ? styles.mobileLayoutTitle : styles.photoLayoutTitle}>
                {detail.name}
              </Text>
              <Text style={isMobileLayout ? styles.mobileLayoutNote : styles.photoLayoutNote}>
                {detail.note}
              </Text>
            </Pressable>
          )
        })}
      </View>
    )
  }

  const renderExportPresetCards = (variant = 'desktop') => {
    const isMobileLayout = variant === 'mobile'

    return (
      <View style={isMobileLayout ? styles.mobilePresetGrid : styles.exportPresetGrid}>
        {exportPresets.map((preset) => {
          const active = selectedExportPreset.id === preset.id

          return (
            <Pressable
              key={preset.id}
              onPress={() => chooseExportPreset(preset)}
              style={[
                isMobileLayout ? styles.mobilePresetCard : styles.exportPresetCard,
                active && (isMobileLayout ? styles.mobilePresetCardActive : styles.exportPresetCardActive),
              ]}
            >
              <View style={isMobileLayout ? styles.mobilePresetHeader : styles.exportPresetHeader}>
                <Text style={isMobileLayout ? styles.mobilePresetName : styles.exportPresetName}>
                  {preset.name}
                </Text>
                <Text style={isMobileLayout ? styles.mobilePresetSize : styles.exportPresetSize}>
                  {preset.size}
                </Text>
              </View>
              <Text style={isMobileLayout ? styles.mobilePresetNote : styles.exportPresetNote}>
                {preset.note}
              </Text>
            </Pressable>
          )
        })}
      </View>
    )
  }

  const renderMobileInstallChecklist = () => (
    <View style={styles.mobileChecklist}>
      {installChecklist.map((item, index) => (
        <View key={item} style={styles.mobileChecklistRow}>
          <Text style={styles.mobileChecklistNumber}>{index + 1}</Text>
          <Text style={styles.mobileChecklistText}>{item}</Text>
        </View>
      ))}
    </View>
  )

  const renderDesktopInstallChecklist = () => (
    <View style={styles.installChecklist}>
      {installChecklist.map((item, index) => (
        <View key={item} style={styles.installChecklistRow}>
          <Text style={styles.installChecklistNumber}>{index + 1}</Text>
          <Text style={styles.installChecklistText}>{item}</Text>
        </View>
      ))}
    </View>
  )

  const renderOverlayPreview = (variant = 'desktop') => {
    const isMobileLayout = variant === 'mobile'
    const sectionStyles = isMobileLayout
      ? {
          wrap: styles.mobileOverlayPreview,
          media: styles.mobileOverlayMedia,
          image: styles.mobileOverlayImage,
          safe: styles.mobileOverlaySafeArea,
          meta: styles.mobileOverlayMeta,
          file: styles.mobileOverlayFile,
          note: styles.mobileOverlayNote,
          upload: styles.mobileUploadButton,
          uploadText: styles.mobileUploadButtonText,
        }
      : {
          wrap: styles.overlayPreview,
          media: styles.overlayMedia,
          image: styles.overlayImage,
          safe: styles.overlaySafeArea,
          meta: styles.overlayMeta,
          file: styles.overlayFile,
          note: styles.overlayNote,
          upload: styles.uploadButton,
          uploadText: styles.uploadButtonText,
        }

    return (
      <View style={sectionStyles.wrap}>
        <View style={sectionStyles.media}>
          <Image
            source={{ uri: overlayImageUrl || getTemplateImageUrl() }}
            style={[sectionStyles.image, { opacity: overlayReady ? overlayOpacity / 100 : 0.28 }]}
          />
          <View
            pointerEvents="none"
            style={[
              sectionStyles.safe,
              {
                top: `${overlaySafeArea}%`,
                right: `${overlaySafeArea}%`,
                bottom: `${overlaySafeArea}%`,
                left: `${overlaySafeArea}%`,
              },
            ]}
          />
        </View>
        <View style={sectionStyles.meta}>
          <Text style={sectionStyles.file}>{overlayStatus}</Text>
          <Text style={sectionStyles.note}>
            {selectedExportPreset.size} / {overlayOpacity}% opacidad / {overlaySafeArea}% margen seguro
          </Text>
          <label style={sectionStyles.upload}>
            <Text style={sectionStyles.uploadText}>Cargar PNG</Text>
            <input accept="image/png,image/webp,image/jpeg" type="file" onChange={handleOverlayFile} style={{ display: 'none' }} />
          </label>
        </View>
      </View>
    )
  }

  const renderOverlayQualityChecks = (variant = 'desktop') => {
    const isMobileLayout = variant === 'mobile'

    return (
      <View style={isMobileLayout ? styles.mobileQualityGrid : styles.qualityGrid}>
        {overlayQualityChecks.map((check) => (
          <View key={check} style={isMobileLayout ? styles.mobileQualityItem : styles.qualityItem}>
            <View style={isMobileLayout ? styles.mobileQualityDot : styles.qualityDot} />
            <Text style={isMobileLayout ? styles.mobileQualityText : styles.qualityText}>{check}</Text>
          </View>
        ))}
      </View>
    )
  }

  const renderExperienceStyleCards = (variant = 'desktop') => {
    const isMobileLayout = variant === 'mobile'

    return (
      <View style={isMobileLayout ? styles.mobileExperienceGrid : styles.experienceGrid}>
        {experienceStyles.map((style) => {
          const active = style.id === selectedExperienceStyle

          return (
            <Pressable
              key={style.id}
              onPress={() => {
                setSelectedExperienceStyle(style.id)
                setActivityMessage(`Estilo ${style.name} aplicado al flujo visual`)
              }}
              style={[
                isMobileLayout ? styles.mobileExperienceCard : styles.experienceCard,
                active && (isMobileLayout ? styles.mobileExperienceCardActive : styles.experienceCardActive),
              ]}
            >
              <View style={isMobileLayout ? styles.mobileExperienceSwatches : styles.experienceSwatches}>
                <View style={[styles.experienceSwatch, { backgroundColor: style.accent }]} />
                <View style={[styles.experienceSwatch, { backgroundColor: style.surface }]} />
                <View style={[styles.experienceSwatch, { backgroundColor: style.dark }]} />
              </View>
              <Text style={isMobileLayout ? styles.mobileExperienceName : styles.experienceName}>
                {style.name}
              </Text>
              <Text style={isMobileLayout ? styles.mobileExperienceMood : styles.experienceMood}>
                {style.mood}
              </Text>
            </Pressable>
          )
        })}
      </View>
    )
  }

  const renderLiveExperiencePreview = (variant = 'desktop') => {
    const isMobileLayout = variant === 'mobile'
    const previewStyles = isMobileLayout
      ? {
          shell: styles.mobileLivePreview,
          stage: styles.mobileLiveStage,
          top: styles.mobileLiveTop,
          title: styles.mobileLiveTitle,
          badge: styles.mobileLiveBadge,
          media: styles.mobileLiveMedia,
          image: styles.mobileLiveImage,
          overlay: styles.mobileLiveOverlay,
          dock: styles.mobileLiveDock,
          action: styles.mobileLiveAction,
          actionText: styles.mobileLiveActionText,
          meta: styles.mobileLiveMeta,
          metaText: styles.mobileLiveMetaText,
        }
      : {
          shell: styles.livePreview,
          stage: styles.liveStage,
          top: styles.liveTop,
          title: styles.liveTitle,
          badge: styles.liveBadge,
          media: styles.liveMedia,
          image: styles.liveImage,
          overlay: styles.liveOverlay,
          dock: styles.liveDock,
          action: styles.liveAction,
          actionText: styles.liveActionText,
          meta: styles.liveMeta,
          metaText: styles.liveMetaText,
        }

    return (
      <View style={[previewStyles.shell, { backgroundColor: visualStyle.dark }]}>
        <View style={previewStyles.stage}>
          <View style={previewStyles.top}>
            <Text style={previewStyles.title}>{eventName || 'Viralco'}</Text>
            <Text style={[previewStyles.badge, { backgroundColor: visualStyle.accent }]}>
              {selectedMode}
            </Text>
          </View>
          <View style={[previewStyles.media, { backgroundColor: visualStyle.surface }]}>
            <Image source={selectedTemplate.image} style={previewStyles.image} />
            {overlayReady && (
              <Image
                source={{ uri: overlayImageUrl || getTemplateImageUrl() }}
                style={[previewStyles.overlay, { opacity: overlayOpacity / 100 }]}
              />
            )}
          </View>
          <View style={previewStyles.dock}>
            {availableTools.slice(0, 4).map((tool) => (
              <View key={tool} style={[previewStyles.action, { borderColor: visualStyle.accent }]}>
                <Text style={[previewStyles.actionText, { color: visualStyle.accent }]}>
                  {tool.slice(0, 2).toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
          <View style={previewStyles.meta}>
            <Text style={previewStyles.metaText}>{visualStyle.name}</Text>
            <Text style={previewStyles.metaText}>{selectedExportPreset.size}</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderMobileToggle = (label, value, onChange) => (
    <Pressable onPress={() => onChange(!value)} style={styles.mobileSettingRow}>
      <View style={[styles.mobileSettingDot, value && styles.mobileSettingDotActive]} />
      <Text style={styles.mobileSettingText}>{label}</Text>
      <Text style={styles.mobileToggleText}>{value ? 'Activo' : 'Off'}</Text>
    </Pressable>
  )

  const renderDesktopToggle = (label, value, onChange) => (
    <Pressable onPress={() => onChange(!value)} style={styles.settingRow}>
      <View style={[styles.settingDot, value && styles.settingDotActive]} />
      <Text style={styles.settingText}>{label}</Text>
      <Text style={styles.settingToggleText}>{value ? 'Activo' : 'Off'}</Text>
    </Pressable>
  )

  const renderCaptureMedia = (variant) => {
    const isMobilePreview = variant === 'mobile'
    const videoRef = isMobilePreview ? mobileVideoRef : desktopVideoRef
    const imageStyle = isMobilePreview ? styles.mobileCameraImage : styles.cameraImage
    const videoStyle = isMobilePreview ? styles.mobileCameraVideo : styles.cameraVideo

    if (outputReady && selectedMode === 'Foto' && photoPrintUrl) {
      return <Image source={{ uri: photoPrintUrl }} style={[imageStyle, styles.finalCameraImage]} />
    }

    if (outputReady && recordingUrl) {
      return (
        <video
          src={recordingUrl}
          controls
          playsInline
          muted
          loop={selectedMode === 'GIF' || selectedMode === 'Boomerang'}
          style={videoStyle}
        />
      )
    }

    if (hasCamera) {
      return (
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{ ...videoStyle, transform: mirrorPreview ? 'scaleX(-1)' : 'none' }}
        />
      )
    }

    return <Image source={selectedTemplate.image} style={imageStyle} />
  }

  const renderMobileModeActionCards = () => (
    <View style={styles.mobileCaptureOptionGrid}>
      {modeActionCards.map(([label, value]) => (
        <View key={label} style={styles.mobileCaptureOptionCard}>
          <Text style={styles.mobileCaptureOptionLabel}>{label}</Text>
          <Text style={styles.mobileCaptureOptionValue}>{value}</Text>
        </View>
      ))}
    </View>
  )

  const renderDesktopModeActionCards = () => (
    <View style={styles.captureOptionGrid}>
      {modeActionCards.map(([label, value]) => (
        <View key={label} style={styles.captureOptionCard}>
          <Text style={styles.captureOptionLabel}>{label}</Text>
          <Text style={styles.captureOptionValue}>{value}</Text>
        </View>
      ))}
    </View>
  )

  const summaryRows = [
    ['Evento', eventName],
    ['Captura', `${selectedMode} - ${controlLabel}`],
    ['Camara', `${cameraSource}, ${orientation}, ${captureQuality}`],
    [
      'Diseno',
      `${visualStyle.name}, ${selectedTemplate.name}, ${selectedFilter}, ${selectedExportPreset.size}, ${
        canPrintSelectedMode ? printLayout : 'Digital'
      }`,
    ],
    [
      'Overlay',
      `${overlayStatus}, ${overlayMode} desde ${overlayImportSource} para ${boothPlatform}, ${overlayOpacity}% / area ${overlaySafeArea}%`,
    ],
    ['Efectos', `${backgroundMode}, retoque ${beautyLevel}%`],
    ['Salida', hasRecording ? availableTools.join(' / ') : 'Pendiente de grabar'],
  ]

  const renderMobileTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.mobileTabScroll}
    >
      {setupTabs.map((tab, index) => (
        <Pressable
          key={tab.id}
          onPress={() => setActiveTab(tab.id)}
          style={[
            styles.mobileTabButton,
            index < currentTabIndex && styles.mobileTabButtonDone,
            activeTab === tab.id && styles.mobileTabButtonActive,
          ]}
        >
          <Text style={[styles.mobileTabNumber, activeTab === tab.id && styles.mobileTabTextActive]}>
            {index < currentTabIndex ? 'OK' : index + 1}
          </Text>
          <Text style={[styles.mobileTabText, activeTab === tab.id && styles.mobileTabTextActive]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  )

  const renderDesktopTabs = () => (
    <View style={styles.desktopTabs}>
      {setupTabs.map((tab, index) => (
        <Pressable
          key={tab.id}
          onPress={() => setActiveTab(tab.id)}
          style={[
            styles.desktopTabButton,
            index < currentTabIndex && styles.desktopTabButtonDone,
            activeTab === tab.id && styles.desktopTabButtonActive,
          ]}
        >
          <Text style={[styles.desktopTabIndex, activeTab === tab.id && styles.desktopTabTextActive]}>
            {index < currentTabIndex ? 'OK' : index + 1}
          </Text>
          <View>
            <Text style={[styles.desktopTabLabel, activeTab === tab.id && styles.desktopTabTextActive]}>
              {tab.label}
            </Text>
            <Text style={[styles.desktopTabTitle, activeTab === tab.id && styles.desktopTabTextActive]}>
              {tab.title}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  )

  const renderMobilePreview = () => (
    <>
      <View style={styles.mobileCameraCard}>
        {renderCaptureMedia('mobile')}
        <View style={styles.mobileCameraShade} />
        <View style={[styles.mobileCountdown, isCapturing && styles.mobileCountdownActive]}>
          <Text style={styles.mobileCountdownText}>{displayCountdown}</Text>
        </View>
        <View style={styles.mobileCaptureMeta}>
          <Text style={styles.mobileCaptureMode}>{modeDetails.title}</Text>
          <Text style={styles.mobileCaptureBadge}>{displayBadge}</Text>
        </View>
        <Text style={styles.mobileCameraCopy}>{modeDetails.instruction}</Text>
        {cameraError && <Text style={styles.mobileCameraError}>{cameraError}</Text>}
        <View style={styles.mobileProgress}>
          {modeDetails.progress.map((step, index) => {
            return (
              <View key={step} style={styles.mobileProgressItem}>
                <View
                  style={[
                    styles.mobileProgressDot,
                    index < progressActiveCount && styles.mobileProgressDotActive,
                  ]}
                />
                <Text style={styles.mobileProgressText}>{step}</Text>
              </View>
            )
          })}
        </View>
      </View>

      <Pressable
        onPress={startCapture}
        disabled={isCapturing}
        style={[styles.mobileCaptureButton, isCapturing && styles.mobileCaptureButtonBusy]}
      >
        <Text style={styles.mobileCaptureButtonText}>
          {isCapturing ? 'Capturando...' : modeDetails.primary}
        </Text>
      </Pressable>

      <View style={styles.mobileActivityCard}>
        <Text style={styles.mobileActivityLabel}>Estado</Text>
        <Text style={styles.mobileActivityText}>{activityMessage}</Text>
        <Text style={styles.mobileActivityMeta}>
          {outputReady
            ? resultLabel
            : selectedMode === 'Foto'
              ? `${photoFramesReady}/${photoFramesNeeded} fotos para ${printLayout}`
              : `${captureCount} capturas en esta sesion`}
        </Text>
      </View>
    </>
  )

  const layoutSlots = useMemo(
    () => [
      { id: 1, width: '58%', height: 138, top: 18, left: 18, color: selectedTemplate.tone },
      { id: 2, width: '34%', height: 138, top: 18, right: 18, color: '#101820' },
      { id: 3, width: '43%', height: 118, bottom: 18, left: 18, color: '#f1c75b' },
      { id: 4, width: '49%', height: 118, bottom: 18, right: 18, color: '#5d7287' },
    ],
    [selectedTemplate],
  )

  if (isMobile) {
    return (
      <ScrollView style={styles.mobilePage} contentContainerStyle={styles.mobileContent}>
        <View style={styles.mobileHero}>
          <View style={styles.mobileHeroGlow} />
          <View style={styles.mobileHeader}>
            <View style={styles.mobileIcon}>
              <Text style={styles.mobileIconMark}>V</Text>
            </View>
            <View style={styles.mobileHeaderText}>
              <Text style={styles.mobileAppName}>Viralco</Text>
            </View>
            <View style={styles.mobileStatus}>
              <View style={styles.mobileStatusDot} />
              <Text style={styles.mobileStatusText}>{isCapturing ? 'REC' : 'ON'}</Text>
            </View>
          </View>

          <View style={styles.mobileEventCard}>
            <Text style={styles.mobileEyebrow}>Evento activo</Text>
            <TextInput
              value={eventName}
              onChangeText={setEventName}
              style={styles.mobileEventInput}
              placeholder="Nombre del evento"
              placeholderTextColor="rgba(255,255,255,0.48)"
            />
          </View>
        </View>

        {renderMobileTabs()}
        {renderMobileFlowIntro()}

        {activeTab === 'evento' && (
          <>
            <View style={styles.mobileSection}>
              <Text style={styles.mobileSectionTitle}>Nombre del evento</Text>
              <Text style={styles.mobileMutedText}>
                Este nombre aparece en el estado de captura y ayuda a identificar la sesion.
              </Text>
              <TextInput
                value={eventName}
                onChangeText={setEventName}
                style={styles.mobileLightInput}
                placeholder="Nombre del evento"
                placeholderTextColor="#8b93a0"
              />
            </View>

            <View style={styles.mobileSection}>
              <View style={styles.mobileSectionHeader}>
                <Text style={styles.mobileSectionTitle}>Tipo de captura</Text>
                <Text style={styles.mobileAccentText}>{selectedMode}</Text>
              </View>
              <Text style={styles.mobileMutedText}>
                Escoge primero el formato. La siguiente pestaña cambia sus controles segun esta seleccion.
              </Text>
              <View style={styles.mobileModes}>
                {captureModes.map((mode) => (
                  <Pressable
                    key={mode}
                    onPress={() => chooseMode(mode)}
                    style={[
                      styles.mobileModeButton,
                      selectedMode === mode && styles.mobileModeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.mobileModeText,
                        selectedMode === mode && styles.mobileModeTextActive,
                      ]}
                    >
                      {mode}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {renderMobileStepNav()}
          </>
        )}

        {activeTab === 'captura' && (
          <>
            <View style={styles.mobileSection}>
              <View style={styles.mobileSectionHeader}>
                <Text style={styles.mobileSectionTitle}>{modeDetails.title}</Text>
                <Text style={styles.mobileAccentText}>{displayBadge}</Text>
              </View>
              <Text style={styles.mobileMutedText}>{modeDetails.instruction}</Text>
              <View style={styles.mobileConfigControl}>
                <Text style={styles.mobileControlLabel}>{modeDetails.control.label}</Text>
                <View style={styles.mobileControlStepper}>
                  <Pressable onPress={() => updateModeConfig(-1)} style={styles.mobileStepButton}>
                    <Text style={styles.mobileStepButtonText}>-</Text>
                  </Pressable>
                  <Text style={styles.mobileControlValue}>{controlLabel}</Text>
                  <Pressable onPress={() => updateModeConfig(1)} style={styles.mobileStepButton}>
                    <Text style={styles.mobileStepButtonText}>+</Text>
                  </Pressable>
                </View>
                <Text style={styles.mobileControlLimit}>
                  Min {modeDetails.control.min} / Max {modeDetails.control.max}{' '}
                  {modeDetails.control.unit}
                </Text>
              </View>
              {renderMobileToggle('Permitir repetir captura', retakeEnabled, setRetakeEnabled)}
              {renderMobileToggle('Guardar original sin filtro', saveOriginal, setSaveOriginal)}
              {selectedMode === 'Video' &&
                renderMobileToggle('Grabar audio en video', audioEnabled, setAudioEnabled)}
              {modeDetails.settings.map((setting) => (
                <View key={setting} style={styles.mobileSettingRow}>
                  <View style={styles.mobileSettingDot} />
                  <Text style={styles.mobileSettingText}>{setting}</Text>
                </View>
              ))}
            </View>

            {renderMobileStepNav()}
          </>
        )}

        {activeTab === 'camara' && (
          <>
            <View style={styles.mobileSection}>
              <View style={styles.mobileSectionHeader}>
                <Text style={styles.mobileSectionTitle}>Camara</Text>
                <Text style={styles.mobileAccentText}>{cameraSource}</Text>
              </View>
              <Text style={styles.mobileMutedText}>
                Elige la camara y calidad antes de abrir el permiso del celular.
              </Text>
              <Text style={styles.mobileSubLabel}>Fuente</Text>
              {renderMobileOptions(cameraSources, cameraSource, setCameraSource)}
              <Text style={styles.mobileSubLabel}>Orientacion</Text>
              {renderMobileOptions(orientations, orientation, setOrientation)}
              <Text style={styles.mobileSubLabel}>Calidad</Text>
              {renderMobileOptions(qualityOptions, captureQuality, setCaptureQuality)}
              {renderMobileToggle('Espejo en vista previa', mirrorPreview, setMirrorPreview)}
              {renderMobileToggle('Estabilizacion / encuadre guiado', stabilization, setStabilization)}
            </View>

            {renderMobileStepNav()}
          </>
        )}

        {activeTab === 'diseno' && (
          <>
            <View style={styles.mobileSection}>
              <View style={styles.mobileSectionHeader}>
                <Text style={styles.mobileSectionTitle}>Filtros</Text>
                <Text style={styles.mobileAccentText}>{selectedFilter}</Text>
              </View>
              <Text style={styles.mobileMutedText}>
                El filtro se aplica antes de generar la salida final.
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mobileFilterScroll}
              >
                {filters.map((filter) => (
                  <Pressable
                    key={filter}
                    onPress={() => setSelectedFilter(filter)}
                    style={[
                      styles.mobileFilterButton,
                      selectedFilter === filter && styles.mobileFilterActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.mobileFilterText,
                        selectedFilter === filter && styles.mobileFilterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.mobileSection}>
              <View style={styles.mobileSectionHeader}>
                <Text style={styles.mobileSectionTitle}>Estilo visual</Text>
                <Text style={styles.mobileAccentText}>{visualStyle.name}</Text>
              </View>
              <Text style={styles.mobileMutedText}>
                Cambia la energia de la experiencia que ve el invitado en pantalla.
              </Text>
              {renderExperienceStyleCards('mobile')}
              {renderLiveExperiencePreview('mobile')}
            </View>

            <View style={styles.mobileSection}>
              <View style={styles.mobileSectionHeader}>
                <Text style={styles.mobileSectionTitle}>Plantillas</Text>
                <Text style={styles.mobileAccentText}>{selectedTemplate.name}</Text>
              </View>
              <Text style={styles.mobileMutedText}>
                La plantilla define el estilo visual que vera el invitado al recibir su archivo.
              </Text>
              <View style={styles.mobileTemplateGrid}>
                {templates.map((template) => {
                  const active = selectedTemplate.id === template.id
                  return (
                    <Pressable
                      key={template.id}
                      onPress={() => chooseTemplate(template)}
                      style={[styles.mobileTemplateCard, active && styles.mobileTemplateActive]}
                    >
                      <Image source={template.image} style={styles.mobileTemplateImage} />
                      <Text style={styles.mobileTemplateName}>{template.name}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View style={styles.mobileSection}>
              <View style={styles.mobileSectionHeader}>
                <Text style={styles.mobileSectionTitle}>Formato final</Text>
                <Text style={styles.mobileAccentText}>{canPrintSelectedMode ? printLayout : 'Digital'}</Text>
              </View>
              <Text style={styles.mobileMutedText}>
                Usa un tamano listo para exportar desde Canva como PNG transparente.
              </Text>
              {renderExportPresetCards('mobile')}
              {canPrintSelectedMode ? (
                <>
                  {renderPhotoLayoutCards('mobile')}
                  <Text style={styles.mobileControlLimit}>
                    {photoFramesReady}/{photoFramesNeeded} fotos listas para este formato
                  </Text>
                </>
              ) : (
                <Text style={styles.mobileMutedText}>
                  Este modo se entrega como archivo digital y no muestra opciones de impresion.
                </Text>
              )}
            </View>

            {renderMobileStepNav()}
          </>
        )}

        {activeTab === 'efectos' && (
          <>
            <View style={styles.mobileSection}>
              <View style={styles.mobileSectionHeader}>
                <Text style={styles.mobileSectionTitle}>Fondo</Text>
                <Text style={styles.mobileAccentText}>{backgroundMode}</Text>
              </View>
              <Text style={styles.mobileMutedText}>
                Prepara el acabado que se aplica despues de la captura.
              </Text>
              {renderMobileOptions(backgroundOptions, backgroundMode, setBackgroundMode)}
            </View>

            <View style={styles.mobileSection}>
              <View style={styles.mobileSectionHeader}>
                <Text style={styles.mobileSectionTitle}>Overlay</Text>
                <Text style={styles.mobileAccentText}>{overlayMode}</Text>
              </View>
              <Text style={styles.mobileMutedText}>
                El video usa un PNG transparente cargado como superposicion; esta seccion deja listo ese paso.
              </Text>
              {renderMobileOptions(overlayOptions, overlayMode, setOverlayMode)}
              <Text style={styles.mobileSubLabel}>Origen</Text>
              {renderMobileOptions(overlayImportSources, overlayImportSource, setOverlayImportSource)}
              <Text style={styles.mobileSubLabel}>Plataforma</Text>
              {renderMobileOptions(boothPlatforms, boothPlatform, setBoothPlatform)}
              {renderOverlayPreview('mobile')}
              <Text style={styles.mobileSubLabel}>Ajuste fino</Text>
              <View style={styles.mobileControlPair}>
                <View style={styles.mobileMiniControl}>
                  <Text style={styles.mobileControlLabel}>Opacidad</Text>
                  <View style={styles.mobileControlStepper}>
                    <Pressable
                      onPress={() => setOverlayOpacity((value) => Math.max(20, value - 10))}
                      style={styles.mobileStepButton}
                    >
                      <Text style={styles.mobileStepButtonText}>-</Text>
                    </Pressable>
                    <Text style={styles.mobileControlValue}>{overlayOpacity}%</Text>
                    <Pressable
                      onPress={() => setOverlayOpacity((value) => Math.min(100, value + 10))}
                      style={styles.mobileStepButton}
                    >
                      <Text style={styles.mobileStepButtonText}>+</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.mobileMiniControl}>
                  <Text style={styles.mobileControlLabel}>Area segura</Text>
                  <View style={styles.mobileControlStepper}>
                    <Pressable
                      onPress={() => setOverlaySafeArea((value) => Math.max(4, value - 2))}
                      style={styles.mobileStepButton}
                    >
                      <Text style={styles.mobileStepButtonText}>-</Text>
                    </Pressable>
                    <Text style={styles.mobileControlValue}>{overlaySafeArea}%</Text>
                    <Pressable
                      onPress={() => setOverlaySafeArea((value) => Math.min(24, value + 2))}
                      style={styles.mobileStepButton}
                    >
                      <Text style={styles.mobileStepButtonText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
              <View style={styles.mobileConfigControl}>
                <Text style={styles.mobileControlLabel}>Retoque invitado</Text>
                <View style={styles.mobileControlStepper}>
                  <Pressable
                    onPress={() => setBeautyLevel((value) => Math.max(0, value - 10))}
                    style={styles.mobileStepButton}
                  >
                    <Text style={styles.mobileStepButtonText}>-</Text>
                  </Pressable>
                  <Text style={styles.mobileControlValue}>{beautyLevel}%</Text>
                  <Pressable
                    onPress={() => setBeautyLevel((value) => Math.min(100, value + 10))}
                    style={styles.mobileStepButton}
                  >
                    <Text style={styles.mobileStepButtonText}>+</Text>
                  </Pressable>
                </View>
                <Text style={styles.mobileControlLimit}>Min 0 / Max 100%</Text>
              </View>
              {renderOverlayQualityChecks('mobile')}
              {renderMobileInstallChecklist()}
            </View>

            {renderMobileStepNav()}
          </>
        )}

        {activeTab === 'grabar' && (
          <>
            <View style={styles.mobileSection}>
              <View style={styles.mobileSectionHeader}>
                <Text style={styles.mobileSectionTitle}>Antes de grabar</Text>
                <Text style={styles.mobileAccentText}>{selectedMode}</Text>
              </View>
              <Text style={styles.mobileMutedText}>
                Acepta el permiso de camara, revisa el encuadre y usa las opciones propias de este modo.
              </Text>
              {renderMobileModeActionCards()}
            </View>
            {renderMobilePreview()}
            {renderMobileStepNav()}
          </>
        )}

        {activeTab === 'salida' && (
          <>
            {!hasRecording && (
              <View style={styles.mobileSection}>
                <Text style={styles.mobileSectionTitle}>Falta grabar</Text>
                <Text style={styles.mobileMutedText}>
                  Primero haz una captura de prueba para habilitar compartir e imprimir.
                </Text>
                <Pressable onPress={() => setActiveTab('grabar')} style={styles.mobilePrimaryButton}>
                  <Text style={styles.mobilePrimaryText}>Ir a grabar</Text>
                </Pressable>
              </View>
            )}

            {hasRecording && (
              <View style={styles.mobileSection}>
                {selectedMode === 'Foto' && photoPrintUrl && (
                  <View style={styles.mobileFinalPhotoBox}>
                    <Text style={styles.mobileSectionTitle}>Foto final</Text>
                    <Image
                      source={{ uri: photoPrintUrl }}
                      style={[
                        styles.mobileFinalPhoto,
                        { aspectRatio: selectedPrintLayout.width / selectedPrintLayout.height },
                      ]}
                    />
                    <Text style={styles.mobileMutedText}>
                      {printLayout} con plantilla {selectedTemplate.name}
                    </Text>
                  </View>
                )}
                <Text style={styles.mobileSectionTitle}>Entrega</Text>
                <Text style={styles.mobileMutedText}>
                  Selecciona como va a recibir el invitado el resultado final.
                </Text>
                <View style={styles.mobileShareGrid}>
                  {availableTools.map((tool) => renderMobileShareCard(tool))}
                </View>
              </View>
            )}

            {hasRecording && canPrintSelectedMode && (
              <View style={styles.mobileSection}>
                <Text style={styles.mobileSectionTitle}>Copias</Text>
                <View style={styles.mobileCopies}>
                  {[1, 2, 3, 4].map((number) => (
                    <Pressable
                      key={number}
                      onPress={() => setCopies(number)}
                      style={[
                        styles.mobileCopyButton,
                        copies === number && styles.mobileCopyActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.mobileCopyText,
                          copies === number && styles.mobileCopyTextActive,
                        ]}
                      >
                        {number}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable onPress={() => runTool('Print')} style={styles.mobilePrimaryButton}>
                  <Text style={styles.mobilePrimaryText}>Probar impresion</Text>
                </Pressable>
              </View>
            )}

            {!hasRecording && (
              <Pressable onPress={() => setActiveTab('grabar')} style={styles.mobileCaptureButton}>
                <Text style={styles.mobileCaptureButtonText}>Grabar primero</Text>
              </Pressable>
            )}
            {hasRecording && renderMobileStepNav()}
          </>
        )}

        {activeTab === 'resumen' && (
          <>
            <View style={styles.mobileSection}>
              <Text style={styles.mobileSectionTitle}>Resumen del evento</Text>
              <Text style={styles.mobileMutedText}>
                Revisa la configuracion completa antes de operar el booth.
              </Text>
              {summaryRows.map(([label, value]) => (
                <View key={label} style={styles.mobileSummaryRow}>
                  <Text style={styles.mobileSummaryLabel}>{label}</Text>
                  <Text style={styles.mobileSummaryValue}>{value}</Text>
                </View>
              ))}
              {renderMobileInstallChecklist()}
            </View>
            {renderMobileStepNav()}
          </>
        )}
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={styles.lumaHero}>
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />
        <View style={styles.appIdentity}>
          <View style={styles.appIcon}>
            <Text style={styles.iconMark}>V</Text>
          </View>
          <View>
            <Text style={styles.heroName}>Viralco</Text>
          </View>
        </View>
        <View style={styles.heroLine} />
      </View>

      <View style={styles.appShell}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>Viralco</Text>
          </View>
          <View style={styles.topActions}>
            <View style={styles.syncPill}>
              <View style={styles.syncDot} />
              <Text style={styles.syncText}>LISTO</Text>
            </View>
            <Text style={styles.topMeta}>Evento / {selectedMode} / {capturePhase}</Text>
          </View>
        </View>

        {renderDesktopTabs()}

        <View style={styles.desktopSetupGrid}>
          <View style={styles.desktopSectionPanel}>
            <Text style={styles.desktopSectionEyebrow}>
              {setupTabs.find((tab) => tab.id === activeTab)?.label}
            </Text>
            <Text style={styles.desktopSectionTitle}>
              {setupTabs.find((tab) => tab.id === activeTab)?.title}
            </Text>
            {renderDesktopFlowIntro()}

            {activeTab === 'evento' && (
              <>
                <Text style={styles.panelLabel}>Nombre del evento</Text>
                <Text style={styles.panelHelp}>Este nombre acompaña la sesion y aparece en los mensajes de estado.</Text>
                <TextInput
                  value={eventName}
                  onChangeText={setEventName}
                  style={styles.desktopInput}
                  placeholder="Nombre del evento"
                  placeholderTextColor="#7d8188"
                />

                <Text style={styles.panelLabel}>Tipo de captura</Text>
                <Text style={styles.panelHelp}>Elige el formato antes de configurar tiempos y salida.</Text>
                <View style={styles.modeRow}>
                  {captureModes.map((mode) => (
                    <Pressable
                      key={mode}
                      onPress={() => chooseMode(mode)}
                      style={[styles.modeButton, selectedMode === mode && styles.modeButtonActive]}
                    >
                      <Text
                        style={[
                          styles.modeButtonText,
                          selectedMode === mode && styles.modeButtonTextActive,
                        ]}
                      >
                        {mode}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {activeTab === 'captura' && (
              <>
                <View style={styles.settingSummary}>
                  <Text style={styles.settingSummaryTitle}>{modeDetails.title}</Text>
                  <Text style={styles.settingSummaryText}>{modeDetails.instruction}</Text>
                </View>
                <View style={styles.configControl}>
                  <Text style={styles.configControlLabel}>{modeDetails.control.label}</Text>
                  <View style={styles.configControlRow}>
                    <Pressable onPress={() => updateModeConfig(-1)} style={styles.configStepButton}>
                      <Text style={styles.configStepText}>-</Text>
                    </Pressable>
                    <Text style={styles.configValue}>{controlLabel}</Text>
                    <Pressable onPress={() => updateModeConfig(1)} style={styles.configStepButton}>
                      <Text style={styles.configStepText}>+</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.configLimit}>
                    Min {modeDetails.control.min} / Max {modeDetails.control.max}{' '}
                    {modeDetails.control.unit}
                  </Text>
                </View>
                {renderDesktopToggle('Permitir repetir captura', retakeEnabled, setRetakeEnabled)}
                {renderDesktopToggle('Guardar original sin filtro', saveOriginal, setSaveOriginal)}
                {selectedMode === 'Video' &&
                  renderDesktopToggle('Grabar audio en video', audioEnabled, setAudioEnabled)}
                {modeDetails.settings.map((setting) => (
                  <View key={setting} style={styles.settingRow}>
                    <View style={styles.settingDot} />
                    <Text style={styles.settingText}>{setting}</Text>
                  </View>
                ))}
              </>
            )}

            {activeTab === 'camara' && (
              <>
                <View style={styles.settingSummary}>
                  <Text style={styles.settingSummaryTitle}>Camara y calidad</Text>
                  <Text style={styles.settingSummaryText}>
                    Configura fuente, orientacion y resolucion antes de abrir la camara real.
                  </Text>
                </View>
                <Text style={styles.panelLabel}>Fuente de camara</Text>
                {renderDesktopOptions(cameraSources, cameraSource, setCameraSource)}
                <Text style={styles.panelLabel}>Orientacion</Text>
                {renderDesktopOptions(orientations, orientation, setOrientation)}
                <Text style={styles.panelLabel}>Calidad</Text>
                {renderDesktopOptions(qualityOptions, captureQuality, setCaptureQuality)}
                {renderDesktopToggle('Espejo en vista previa', mirrorPreview, setMirrorPreview)}
                {renderDesktopToggle('Estabilizacion / encuadre guiado', stabilization, setStabilization)}
              </>
            )}

            {activeTab === 'diseno' && (
              <>
                <Text style={styles.panelLabel}>Filtro</Text>
                <Text style={styles.panelHelp}>Define el acabado visual antes de grabar.</Text>
                <View style={styles.filterGrid}>
                  {filters.map((filter) => (
                    <Pressable
                      key={filter}
                      onPress={() => setSelectedFilter(filter)}
                      style={[
                        styles.filterButton,
                        selectedFilter === filter && styles.filterButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          selectedFilter === filter && styles.filterTextActive,
                        ]}
                      >
                        {filter}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.panelLabel}>Estilo visual</Text>
                <Text style={styles.panelHelp}>
                  Cambia la sensacion de la experiencia del invitado sin tocar la plantilla base.
                </Text>
                {renderExperienceStyleCards('desktop')}
                {renderLiveExperiencePreview('desktop')}

                <Text style={styles.panelLabel}>Plantilla</Text>
                <Text style={styles.panelHelp}>Selecciona una plantilla base para el evento.</Text>
                <View style={styles.templateGrid}>
                  {templates.map((template) => {
                    const active = selectedTemplate.id === template.id
                    return (
                      <Pressable
                        key={template.id}
                        onPress={() => chooseTemplate(template)}
                        style={[styles.templateCard, active && styles.templateCardActive]}
                      >
                        <Image source={template.image} style={styles.templateImage} />
                        <View style={styles.templateBody}>
                          <Text style={styles.templateLabel}>{template.label}</Text>
                          <Text style={styles.templateName}>{template.name}</Text>
                        </View>
                      </Pressable>
                    )
                  })}
                </View>

                <Text style={styles.panelLabel}>Formato final</Text>
                <Text style={styles.panelHelp}>
                  {canPrintSelectedMode
                    ? 'Define si la salida se prepara para digital o impresion.'
                    : 'Este modo se entrega como archivo digital y no muestra opciones de impresion.'}
                </Text>
                <Text style={styles.panelLabel}>Tamano de exportacion</Text>
                <Text style={styles.panelHelp}>
                  Presets inspirados en el flujo del video: crear en Canva, descargar PNG transparente y
                  subirlo como superposicion.
                </Text>
                {renderExportPresetCards('desktop')}
                {canPrintSelectedMode ? (
                  <>
                    {renderPhotoLayoutCards('desktop')}
                    <Text style={styles.configLimit}>
                      {photoFramesReady}/{photoFramesNeeded} fotos listas para este formato
                    </Text>
                  </>
                ) : (
                  <View style={styles.settingRow}>
                    <View style={[styles.settingDot, styles.settingDotActive]} />
                    <Text style={styles.settingText}>Entrega digital</Text>
                  </View>
                )}
              </>
            )}

            {activeTab === 'efectos' && (
              <>
                <View style={styles.settingSummary}>
                  <Text style={styles.settingSummaryTitle}>Efectos del invitado</Text>
                  <Text style={styles.settingSummaryText}>
                    Prepara fondos, overlays y retoque antes de la captura.
                  </Text>
                </View>
                <Text style={styles.panelLabel}>Fondo</Text>
                {renderDesktopOptions(backgroundOptions, backgroundMode, setBackgroundMode)}
                <Text style={styles.panelLabel}>Overlay</Text>
                {renderDesktopOptions(overlayOptions, overlayMode, setOverlayMode)}
                <Text style={styles.panelLabel}>Origen del overlay</Text>
                {renderDesktopOptions(overlayImportSources, overlayImportSource, setOverlayImportSource)}
                <Text style={styles.panelLabel}>Plataforma destino</Text>
                {renderDesktopOptions(boothPlatforms, boothPlatform, setBoothPlatform)}
                {renderOverlayPreview('desktop')}
                <Text style={styles.panelLabel}>Ajuste fino</Text>
                <View style={styles.controlSplit}>
                  <View style={styles.configControl}>
                    <Text style={styles.configControlLabel}>Opacidad overlay</Text>
                    <View style={styles.configControlRow}>
                      <Pressable
                        onPress={() => setOverlayOpacity((value) => Math.max(20, value - 10))}
                        style={styles.configStepButton}
                      >
                        <Text style={styles.configStepText}>-</Text>
                      </Pressable>
                      <Text style={styles.configValue}>{overlayOpacity}%</Text>
                      <Pressable
                        onPress={() => setOverlayOpacity((value) => Math.min(100, value + 10))}
                        style={styles.configStepButton}
                      >
                        <Text style={styles.configStepText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.configControl}>
                    <Text style={styles.configControlLabel}>Area segura</Text>
                    <View style={styles.configControlRow}>
                      <Pressable
                        onPress={() => setOverlaySafeArea((value) => Math.max(4, value - 2))}
                        style={styles.configStepButton}
                      >
                        <Text style={styles.configStepText}>-</Text>
                      </Pressable>
                      <Text style={styles.configValue}>{overlaySafeArea}%</Text>
                      <Pressable
                        onPress={() => setOverlaySafeArea((value) => Math.min(24, value + 2))}
                        style={styles.configStepButton}
                      >
                        <Text style={styles.configStepText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
                <View style={styles.configControl}>
                  <Text style={styles.configControlLabel}>Retoque invitado</Text>
                  <View style={styles.configControlRow}>
                    <Pressable
                      onPress={() => setBeautyLevel((value) => Math.max(0, value - 10))}
                      style={styles.configStepButton}
                    >
                      <Text style={styles.configStepText}>-</Text>
                    </Pressable>
                    <Text style={styles.configValue}>{beautyLevel}%</Text>
                    <Pressable
                      onPress={() => setBeautyLevel((value) => Math.min(100, value + 10))}
                      style={styles.configStepButton}
                    >
                      <Text style={styles.configStepText}>+</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.configLimit}>Min 0 / Max 100%</Text>
                </View>
                {renderOverlayQualityChecks('desktop')}
                {renderDesktopInstallChecklist()}
              </>
            )}

            {activeTab === 'grabar' && (
              <>
                <View style={styles.settingSummary}>
                  <Text style={styles.settingSummaryTitle}>Grabar antes de compartir</Text>
                  <Text style={styles.settingSummaryText}>
                    Prueba la captura con {selectedMode} configurado a {controlLabel}. Al terminar se
                    habilita Salida.
                  </Text>
                </View>
                {renderDesktopModeActionCards()}
                <Pressable
                  onPress={startCapture}
                  disabled={isCapturing}
                  style={[styles.printButton, isCapturing && styles.printButtonBusy]}
                >
                  <Text style={styles.printButtonText}>
                    {isCapturing ? 'Grabando...' : modeDetails.primary}
                  </Text>
                </Pressable>
              </>
            )}

            {activeTab === 'salida' && (
              <>
                {!hasRecording && (
                  <View style={styles.settingSummary}>
                    <Text style={styles.settingSummaryTitle}>Primero graba una captura</Text>
                    <Text style={styles.settingSummaryText}>
                      Las opciones de QR, impresion y envio se habilitan despues de grabar.
                    </Text>
                    <Pressable onPress={() => setActiveTab('grabar')} style={styles.mobilePrimaryButton}>
                      <Text style={styles.mobilePrimaryText}>Ir a grabar</Text>
                    </Pressable>
                  </View>
                )}

                {hasRecording && (
                  <>
                    {selectedMode === 'Foto' && photoPrintUrl && (
                      <>
                        <Text style={styles.panelLabel}>Foto final</Text>
                        <View style={styles.finalPhotoPanel}>
                          <Image
                            source={{ uri: photoPrintUrl }}
                            style={[
                              styles.finalPhotoImage,
                              { aspectRatio: selectedPrintLayout.width / selectedPrintLayout.height },
                            ]}
                          />
                          <View style={styles.finalPhotoMeta}>
                            <Text style={styles.settingSummaryTitle}>{printLayout}</Text>
                            <Text style={styles.settingSummaryText}>
                              Plantilla {selectedTemplate.name}, filtro {selectedFilter}, lista para imprimir o enviar.
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                    <Text style={styles.panelLabel}>Canales de entrega</Text>
                    <View style={styles.shareGrid}>
                      {availableTools.map((tool) => renderDesktopShareCard(tool))}
                    </View>

                    {canPrintSelectedMode && (
                      <>
                        <Text style={styles.panelLabel}>Copias de impresion</Text>
                        <View style={styles.copyRow}>
                          {[1, 2, 3, 4, 5].map((number) => (
                            <Pressable
                              key={number}
                              onPress={() => setCopies(number)}
                              style={[styles.copyButton, copies === number && styles.copyButtonActive]}
                            >
                              <Text
                                style={[
                                  styles.copyButtonText,
                                  copies === number && styles.copyButtonTextActive,
                                ]}
                              >
                                {number}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                        <Pressable onPress={() => runTool('Print')} style={styles.printButton}>
                          <Text style={styles.printButtonText}>Probar impresion</Text>
                        </Pressable>
                      </>
                    )}
                  </>
                )}
              </>
            )}
            {activeTab === 'resumen' && (
              <>
                <View style={styles.settingSummary}>
                  <Text style={styles.settingSummaryTitle}>Resumen final</Text>
                  <Text style={styles.settingSummaryText}>
                    Todo queda ordenado para revisar antes de operar en evento.
                  </Text>
                </View>
                {summaryRows.map(([label, value]) => (
                  <View key={label} style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{label}</Text>
                    <Text style={styles.summaryValue}>{value}</Text>
                  </View>
                ))}
                {renderDesktopInstallChecklist()}
              </>
            )}
            {activeTab !== 'salida' && renderDesktopStepNav()}
            {activeTab === 'salida' && hasRecording && renderDesktopStepNav()}
          </View>

          <View style={styles.previewColumn}>
            <View style={styles.cameraFrame}>
              {renderCaptureMedia('desktop')}
              <View style={styles.cameraOverlay}>
                <Text style={[styles.countdown, isCapturing && styles.countdownActive]}>
                  {displayCountdown}
                </Text>
                <Text style={styles.cameraInstruction}>{modeDetails.title}</Text>
                {cameraError && <Text style={styles.cameraError}>{cameraError}</Text>}
              </View>
              <View style={styles.captureStatus}>
                <Text style={styles.captureStatusLabel}>{displayBadge}</Text>
                <Text style={styles.captureStatusText}>{activityMessage}</Text>
              </View>
              <View style={styles.progressRail}>
                {modeDetails.progress.map((step, index) => (
                  <View key={step} style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressBar,
                        index < progressActiveCount && styles.progressBarActive,
                      ]}
                    />
                    <Text style={styles.progressStepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.previewResultPanel}>
              <Text style={styles.previewResultLabel}>Preview de salida</Text>
              <Text style={styles.previewResultTitle}>{outputReady ? resultLabel : modeDetails.output}</Text>
              <Text style={styles.previewResultText}>
                {outputReady
                  ? `Listo para ${availableTools.join(', ')}.`
                  : `Al grabar se genera una vista previa de ${selectedMode} antes de compartir.`}
              </Text>
            </View>
            {renderLiveExperiencePreview('desktop')}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default WebApp

const colors = {
  bg: '#101419',
  panel: '#f8f9fb',
  ink: '#171b22',
  muted: '#626b76',
  line: '#dfe3e8',
  red: '#0a4de8',
  blue: '#39a9ff',
  dark: '#222936',
}

const shadow = {
  boxShadow: '0 18px 42px rgba(4, 8, 15, 0.22)',
}

const styles = StyleSheet.create({
  mobilePage: {
    minHeight: '100vh',
    backgroundColor: '#0e1118',
  },
  mobileContent: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    padding: 14,
    paddingBottom: 28,
    gap: 14,
  },
  mobileHero: {
    marginHorizontal: -14,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#111720',
    overflow: 'hidden',
    position: 'relative',
  },
  mobileHeroGlow: {
    position: 'absolute',
    left: -90,
    top: -80,
    width: 260,
    height: 210,
    borderRadius: 130,
    backgroundColor: 'rgba(10, 77, 232, 0.34)',
    filter: 'blur(40px)',
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    zIndex: 2,
  },
  mobileIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 14px 30px rgba(10, 77, 232, 0.34)',
  },
  mobileIconMark: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
  },
  mobileHeaderText: {
    flex: 1,
  },
  mobileAppName: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
  },
  mobileStatus: {
    minWidth: 54,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mobileStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  mobileStatusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  mobileEventCard: {
    marginTop: 18,
    padding: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    position: 'relative',
    zIndex: 2,
  },
  mobileEyebrow: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  mobileEventInput: {
    marginTop: 4,
    padding: 0,
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
  },
  mobileTabScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  mobileTabButton: {
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  mobileTabButtonActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  mobileTabButtonDone: {
    backgroundColor: 'rgba(57, 169, 255, 0.18)',
    borderColor: 'rgba(57, 169, 255, 0.42)',
  },
  mobileTabNumber: {
    width: 24,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    color: '#ffffff',
    fontSize: 11,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '900',
  },
  mobileTabText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  mobileTabTextActive: {
    color: '#ffffff',
  },
  mobileFlowIntro: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8ebef',
    boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
  },
  mobileFlowStep: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  mobileFlowTitle: {
    color: colors.ink,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    marginTop: 4,
  },
  mobileFlowText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 5,
  },
  mobileLightInput: {
    marginTop: 12,
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dde2e8',
    backgroundColor: '#f8f9fb',
    color: colors.ink,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '800',
  },
  mobileSettingRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#f7f8fa',
    borderWidth: 1,
    borderColor: '#e5e9ef',
    padding: 10,
    borderRadius: 8,
  },
  mobileSettingDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#aeb7c4',
  },
  mobileSettingDotActive: {
    backgroundColor: colors.red,
  },
  mobileSettingText: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  mobileToggleText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '900',
  },
  mobileSubLabel: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    marginTop: 14,
    textTransform: 'uppercase',
  },
  mobileConfigControl: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eef5ff',
    borderWidth: 1,
    borderColor: '#b8d5ff',
  },
  mobileControlLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  mobileControlStepper: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  mobileStepButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileStepButtonText: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
  },
  mobileControlValue: {
    flex: 1,
    color: colors.ink,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    textAlign: 'center',
  },
  mobileControlLimit: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  mobileMutedText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  mobileCameraCard: {
    height: 430,
    borderRadius: 8,
    backgroundColor: '#05070a',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    boxShadow: '0 18px 42px rgba(0,0,0,0.32)',
  },
  mobileCameraImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mobileCameraVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    backgroundColor: '#05070a',
    transform: 'scaleX(-1)',
  },
  mobileCameraShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  mobileCountdown: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 5,
    borderColor: colors.red,
    backgroundColor: 'rgba(255,255,255,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -69 }],
  },
  mobileCountdownActive: {
    backgroundColor: '#ffffff',
    boxShadow: '0 0 34px rgba(57, 169, 255, 0.72)',
  },
  mobileCountdownText: {
    color: colors.red,
    fontSize: 58,
    lineHeight: 88,
    fontWeight: '900',
  },
  mobileCaptureMeta: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  mobileCaptureMode: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    backgroundColor: 'rgba(0,0,0,0.44)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  mobileCaptureBadge: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '900',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  mobileCameraCopy: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 58,
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    backgroundColor: 'rgba(0,0,0,0.46)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  mobileCameraError: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 118,
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textAlign: 'center',
    backgroundColor: 'rgba(10, 18, 30, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mobileProgress: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 18,
    flexDirection: 'row',
    gap: 8,
  },
  mobileProgressItem: {
    flex: 1,
    gap: 5,
  },
  mobileProgressDot: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  mobileProgressDotActive: {
    backgroundColor: colors.red,
  },
  mobileProgressText: {
    color: '#ffffff',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 3,
  },
  mobileCaptureButton: {
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 16px 34px rgba(10, 77, 232, 0.30)',
  },
  mobileCaptureButtonBusy: {
    backgroundColor: '#063fd1',
  },
  mobileCaptureButtonText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  mobileActivityCard: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8ebef',
    boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
  },
  mobileActivityLabel: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  mobileActivityText: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  mobileActivityMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 3,
  },
  mobileCaptureOptionGrid: {
    marginTop: 12,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
  },
  mobileCaptureOptionCard: {
    minHeight: 76,
    borderRadius: 8,
    backgroundColor: '#f7f9fc',
    borderWidth: 1,
    borderColor: '#dfe7f2',
    padding: 10,
    justifyContent: 'space-between',
  },
  mobileCaptureOptionLabel: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  mobileCaptureOptionValue: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
    marginTop: 8,
  },
  mobileSection: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8ebef',
    boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
  },
  mobileSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  mobileSectionTitle: {
    color: colors.ink,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  mobileAccentText: {
    color: colors.red,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textAlign: 'right',
  },
  mobileModes: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mobileModeButton: {
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: '#f3f5f8',
    borderWidth: 1,
    borderColor: '#dde2e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileModeButtonActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  mobileModeText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  mobileModeTextActive: {
    color: '#ffffff',
  },
  mobileShareGrid: {
    marginTop: 12,
    gap: 10,
  },
  mobileShareCard: {
    minHeight: 78,
    borderRadius: 8,
    backgroundColor: '#f7f9fc',
    borderWidth: 1,
    borderColor: '#dfe7f2',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mobileShareIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileShareIconText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  mobileShareBody: {
    flex: 1,
  },
  mobileShareTitle: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
  mobileShareNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 3,
  },
  mobileTwoCards: {
    flexDirection: 'row',
    gap: 12,
  },
  mobileMiniCard: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8ebef',
    boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
  },
  mobileStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  mobileStepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.red,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 26,
    fontSize: 13,
    fontWeight: '900',
  },
  mobileStepText: {
    flex: 1,
    color: colors.ink,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  mobileCopies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  mobileCopyButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f3f5f8',
    borderWidth: 1,
    borderColor: '#dde2e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileCopyActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  mobileCopyText: {
    color: colors.ink,
    fontWeight: '900',
  },
  mobileCopyTextActive: {
    color: '#ffffff',
  },
  mobilePrimaryButton: {
    marginTop: 12,
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobilePrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  mobileStepNav: {
    flexDirection: 'row',
    gap: 10,
  },
  mobileSecondaryButton: {
    flex: 0.82,
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileSecondaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  mobileStepNavPrimary: {
    flex: 1.18,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  mobileStepNavPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  mobileButtonDisabled: {
    opacity: 0.46,
  },
  mobileButtonDisabledText: {
    color: 'rgba(255,255,255,0.72)',
  },
  mobileFilterScroll: {
    gap: 8,
    paddingTop: 12,
  },
  mobileFilterButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f3f5f8',
    borderWidth: 1,
    borderColor: '#dde2e8',
    justifyContent: 'center',
  },
  mobileFilterActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  mobileFilterText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  mobileFilterTextActive: {
    color: '#ffffff',
  },
  mobileExperienceGrid: {
    marginTop: 12,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 9,
  },
  mobileExperienceCard: {
    minHeight: 116,
    borderRadius: 8,
    backgroundColor: '#f7f9fc',
    borderWidth: 1,
    borderColor: '#dfe7f2',
    padding: 10,
    justifyContent: 'space-between',
  },
  mobileExperienceCardActive: {
    borderColor: colors.red,
    boxShadow: '0 8px 18px rgba(10, 77, 232, 0.22)',
  },
  mobileExperienceSwatches: {
    flexDirection: 'row',
    gap: 6,
  },
  experienceSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  mobileExperienceName: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    marginTop: 10,
  },
  mobileExperienceMood: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    marginTop: 3,
  },
  mobileLivePreview: {
    marginTop: 12,
    borderRadius: 8,
    padding: 12,
    overflow: 'hidden',
  },
  mobileLiveStage: {
    minHeight: 360,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 12,
    justifyContent: 'space-between',
  },
  mobileLiveTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  mobileLiveTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  mobileLiveBadge: {
    color: '#ffffff',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mobileLiveMedia: {
    height: 220,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 12,
  },
  mobileLiveImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mobileLiveOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  mobileLiveDock: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  mobileLiveAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileLiveActionText: {
    fontSize: 11,
    fontWeight: '900',
  },
  mobileLiveMeta: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  mobileLiveMetaText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
  },
  mobileTemplateGrid: {
    marginTop: 12,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  mobileTemplateCard: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f3f5f8',
    borderWidth: 1,
    borderColor: '#dde2e8',
  },
  mobileTemplateActive: {
    borderColor: colors.red,
    boxShadow: '0 8px 18px rgba(10, 77, 232, 0.22)',
  },
  mobileTemplateImage: {
    width: '100%',
    aspectRatio: 1.28,
    resizeMode: 'cover',
  },
  mobileTemplateName: {
    color: colors.ink,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    padding: 9,
  },
  mobileLayoutGrid: {
    marginTop: 12,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  mobileLayoutCard: {
    minHeight: 184,
    borderRadius: 8,
    backgroundColor: '#f7f9fc',
    borderWidth: 1,
    borderColor: '#dfe7f2',
    padding: 10,
  },
  mobileLayoutCardActive: {
    borderColor: colors.red,
    boxShadow: '0 8px 18px rgba(10, 77, 232, 0.22)',
  },
  mobileLayoutPreview: {
    height: 96,
    borderRadius: 8,
    backgroundColor: '#071225',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(10, 77, 232, 0.18)',
  },
  mobileLayoutTitle: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
    marginTop: 9,
  },
  mobileLayoutNote: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    marginTop: 3,
  },
  mobilePresetGrid: {
    marginTop: 12,
    gap: 9,
  },
  mobilePresetCard: {
    borderRadius: 8,
    backgroundColor: '#f7f9fc',
    borderWidth: 1,
    borderColor: '#dfe7f2',
    padding: 11,
  },
  mobilePresetCardActive: {
    borderColor: colors.red,
    boxShadow: '0 8px 18px rgba(10, 77, 232, 0.22)',
  },
  mobilePresetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },
  mobilePresetName: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  mobilePresetSize: {
    color: colors.red,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    textAlign: 'right',
  },
  mobilePresetNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 5,
  },
  mobileOverlayPreview: {
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#f7f9fc',
    borderWidth: 1,
    borderColor: '#dfe7f2',
    overflow: 'hidden',
  },
  mobileOverlayMedia: {
    height: 220,
    position: 'relative',
    backgroundColor: '#dfe7f2',
    backgroundImage:
      'linear-gradient(45deg, rgba(255,255,255,0.85) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.85) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.85) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.85) 75%)',
    backgroundSize: '24px 24px',
    backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileOverlayImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  mobileOverlaySafeArea: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.red,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(10,77,232,0.06)',
  },
  mobileOverlayMeta: {
    padding: 11,
    gap: 5,
  },
  mobileOverlayFile: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  mobileOverlayNote: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  mobileUploadButton: {
    marginTop: 6,
    minHeight: 38,
    borderRadius: 8,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  mobileUploadButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  mobileControlPair: {
    marginTop: 10,
    gap: 10,
  },
  mobileMiniControl: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eef5ff',
    borderWidth: 1,
    borderColor: '#b8d5ff',
  },
  mobileQualityGrid: {
    marginTop: 12,
    gap: 8,
  },
  mobileQualityItem: {
    minHeight: 38,
    borderRadius: 8,
    backgroundColor: '#f7f9fc',
    borderWidth: 1,
    borderColor: '#dfe7f2',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileQualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  mobileQualityText: {
    flex: 1,
    color: colors.ink,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  mobileChecklist: {
    marginTop: 12,
    gap: 8,
  },
  mobileChecklistRow: {
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: '#f7f9fc',
    borderWidth: 1,
    borderColor: '#dfe7f2',
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  mobileChecklistNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.red,
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  mobileChecklistText: {
    flex: 1,
    color: colors.ink,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  mobileFinalPhotoBox: {
    marginBottom: 14,
    gap: 10,
  },
  mobileFinalPhoto: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#071225',
  },
  mobileSummaryRow: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f7f9fc',
    borderWidth: 1,
    borderColor: '#dfe7f2',
  },
  mobileSummaryLabel: {
    color: colors.red,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  mobileSummaryValue: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    marginTop: 4,
  },
  page: {
    minHeight: '100vh',
    backgroundColor: colors.bg,
  },
  pageContent: {
    width: '100%',
    padding: 18,
    paddingTop: 0,
  },
  lumaHero: {
    width: '100vw',
    minHeight: 238,
    marginLeft: -18,
    marginRight: -18,
    marginBottom: 18,
    paddingHorizontal: 32,
    paddingTop: 50,
    backgroundColor: '#131821',
    overflow: 'hidden',
    position: 'relative',
  },
  heroGlowOne: {
    position: 'absolute',
    left: -70,
    bottom: -118,
    width: 360,
    height: 250,
    borderRadius: 180,
    backgroundColor: 'rgba(0, 163, 146, 0.36)',
    filter: 'blur(48px)',
  },
  heroGlowTwo: {
    position: 'absolute',
    right: -44,
    top: 52,
    width: 340,
    height: 210,
    borderRadius: 170,
    backgroundColor: 'rgba(202, 223, 218, 0.28)',
    filter: 'blur(50px)',
  },
  appIdentity: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 34,
    zIndex: 2,
  },
  appIcon: {
    width: 142,
    height: 142,
    borderRadius: 32,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    boxShadow: '0 22px 48px rgba(10, 77, 232, 0.34)',
  },
  iconMark: {
    color: '#ffffff',
    fontSize: 78,
    lineHeight: 86,
    fontWeight: '900',
  },
  heroName: {
    color: '#f8fbff',
    fontSize: 44,
    fontWeight: '400',
  },
  heroLine: {
    position: 'absolute',
    left: '32%',
    right: 0,
    bottom: 26,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  appShell: {
    width: '100%',
    maxWidth: 1320,
    alignSelf: 'center',
  },
  desktopTabs: {
    marginTop: 18,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
    gap: 10,
  },
  desktopTabButton: {
    minHeight: 70,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...shadow,
  },
  desktopTabButtonActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  desktopTabButtonDone: {
    borderColor: '#b8d5ff',
    backgroundColor: '#eef5ff',
  },
  desktopTabIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f3f6',
    color: colors.ink,
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '900',
  },
  desktopTabLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  desktopTabTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  desktopTabTextActive: {
    color: '#ffffff',
  },
  desktopSetupGrid: {
    marginTop: 18,
    display: 'grid',
    gridTemplateColumns: 'minmax(360px, 0.92fr) minmax(420px, 1.08fr)',
    gap: 18,
  },
  desktopSectionPanel: {
    minHeight: 560,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    gap: 14,
    ...shadow,
  },
  desktopSectionEyebrow: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  desktopSectionTitle: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    marginBottom: 4,
  },
  flowIntro: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
  },
  flowStep: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  flowTitle: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    marginTop: 4,
  },
  flowText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  desktopInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '800',
  },
  settingSummary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
  },
  settingSummaryTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  settingSummaryText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  captureOptionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  captureOptionCard: {
    minHeight: 90,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
    justifyContent: 'space-between',
  },
  captureOptionLabel: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  captureOptionValue: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 10,
  },
  photoLayoutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  photoLayoutCard: {
    minHeight: 198,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
  },
  photoLayoutCardActive: {
    borderColor: colors.red,
    boxShadow: '0 8px 24px rgba(10, 77, 232, 0.22)',
  },
  photoLayoutPreview: {
    height: 104,
    backgroundColor: '#071225',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dbe4f0',
  },
  photoLayoutPreviewStrip: {
    width: 74,
    alignSelf: 'center',
  },
  photoLayoutPreviewTint: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.74,
  },
  photoLayoutPreviewSlot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoLayoutPreviewSlotText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  photoLayoutTitle: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 10,
  },
  photoLayoutNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  exportPresetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  exportPresetCard: {
    minHeight: 104,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
    justifyContent: 'space-between',
  },
  exportPresetCardActive: {
    borderColor: colors.red,
    boxShadow: '0 8px 24px rgba(10, 77, 232, 0.22)',
  },
  exportPresetHeader: {
    gap: 5,
  },
  exportPresetName: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
  exportPresetSize: {
    color: colors.red,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  exportPresetNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  experienceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 10,
  },
  experienceCard: {
    minHeight: 122,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    justifyContent: 'space-between',
  },
  experienceCardActive: {
    borderColor: colors.red,
    boxShadow: '0 8px 24px rgba(10, 77, 232, 0.22)',
  },
  experienceSwatches: {
    flexDirection: 'row',
    gap: 7,
  },
  experienceName: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 12,
  },
  experienceMood: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  livePreview: {
    backgroundColor: '#071225',
    padding: 16,
    minHeight: 420,
  },
  liveStage: {
    minHeight: 388,
    backgroundColor: '#ffffff',
    padding: 16,
    justifyContent: 'space-between',
  },
  liveTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  liveTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
  },
  liveBadge: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  liveMedia: {
    height: 250,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 16,
  },
  liveImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  liveOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  liveDock: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  liveAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveActionText: {
    fontSize: 12,
    fontWeight: '900',
  },
  liveMeta: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  liveMetaText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  overlayPreview: {
    minHeight: 220,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  overlayMedia: {
    width: 190,
    position: 'relative',
    backgroundColor: '#dfe7f2',
    backgroundImage:
      'linear-gradient(45deg, rgba(255,255,255,0.85) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.85) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.85) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.85) 75%)',
    backgroundSize: '24px 24px',
    backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  overlaySafeArea: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.red,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(10,77,232,0.06)',
  },
  overlayMeta: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    gap: 8,
  },
  overlayFile: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  overlayNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  uploadButton: {
    marginTop: 4,
    minHeight: 42,
    width: 132,
    borderRadius: 8,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  finalPhotoPanel: {
    minHeight: 178,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  finalPhotoImage: {
    width: 132,
    height: 158,
    resizeMode: 'contain',
    backgroundColor: '#071225',
  },
  finalPhotoMeta: {
    flex: 1,
  },
  configControl: {
    backgroundColor: '#eef5ff',
    borderWidth: 1,
    borderColor: '#b8d5ff',
    padding: 14,
  },
  controlSplit: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  configControlLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  configControlRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  configStepButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  configStepText: {
    color: '#ffffff',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
  },
  configValue: {
    flex: 1,
    color: colors.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  configLimit: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
  },
  settingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#aeb7c4',
  },
  settingDotActive: {
    backgroundColor: colors.red,
  },
  settingText: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  settingToggleText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '900',
  },
  summaryRow: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
  },
  summaryLabel: {
    color: colors.red,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    marginTop: 4,
  },
  installChecklist: {
    gap: 8,
  },
  installChecklistRow: {
    minHeight: 42,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  installChecklistNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.red,
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  installChecklistText: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  qualityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
  },
  qualityItem: {
    minHeight: 40,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  qualityText: {
    flex: 1,
    color: colors.ink,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.46,
  },
  disabledText: {
    color: colors.muted,
  },
  printButtonDisabled: {
    backgroundColor: '#7d8aa0',
  },
  previewColumn: {
    minWidth: 0,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  topBar: {
    minHeight: 68,
    paddingHorizontal: 22,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadow,
  },
  brand: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncPill: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eef5ff',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#b8d5ff',
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  syncText: {
    color: '#0a4de8',
    fontSize: 12,
    fontWeight: '900',
  },
  topMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  mainGrid: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 18,
  },
  captureColumn: {
    flex: 1.7,
    minWidth: 320,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  workflowColumn: {
    flex: 0.9,
    minWidth: 300,
    gap: 14,
  },
  captureHeader: {
    minHeight: 76,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: 18,
  },
  screenTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  screenCaption: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  eventInput: {
    width: 270,
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  cameraFrame: {
    minHeight: 470,
    backgroundColor: '#111',
    position: 'relative',
    overflow: 'hidden',
  },
  cameraImage: {
    width: '100%',
    height: '100%',
    minHeight: 470,
    resizeMode: 'cover',
    opacity: 0.86,
  },
  finalCameraImage: {
    resizeMode: 'contain',
    backgroundColor: '#071225',
    opacity: 1,
  },
  cameraVideo: {
    width: '100%',
    height: '100%',
    minHeight: 470,
    objectFit: 'cover',
    backgroundColor: '#05070a',
    transform: 'scaleX(-1)',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdown: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
    borderColor: colors.red,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    color: colors.red,
    fontSize: 82,
    lineHeight: 140,
    fontWeight: '900',
    textAlign: 'center',
  },
  countdownActive: {
    backgroundColor: '#ffffff',
    boxShadow: '0 0 42px rgba(57, 169, 255, 0.66)',
  },
  cameraInstruction: {
    marginTop: 14,
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.42)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cameraError: {
    marginTop: 10,
    maxWidth: 360,
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
    backgroundColor: 'rgba(10, 18, 30, 0.82)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  captureStatus: {
    position: 'absolute',
    left: 18,
    top: 18,
    maxWidth: 360,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 12,
  },
  captureStatusLabel: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  captureStatusText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 3,
  },
  progressRail: {
    position: 'absolute',
    left: 18,
    right: 86,
    bottom: 18,
    flexDirection: 'row',
    gap: 10,
  },
  progressStep: {
    flex: 1,
    gap: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.36)',
  },
  progressBarActive: {
    backgroundColor: colors.red,
  },
  progressStepText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.44)',
    textShadowRadius: 4,
  },
  previewResultPanel: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  previewResultLabel: {
    color: colors.red,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  previewResultTitle: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    marginTop: 4,
  },
  previewResultText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  sideTools: {
    position: 'absolute',
    right: 14,
    top: 92,
    gap: 10,
  },
  sideTool: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ededed',
  },
  sideToolText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '900',
  },
  captureControls: {
    padding: 18,
    gap: 16,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modeButton: {
    minHeight: 46,
    minWidth: 110,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6f8',
    borderWidth: 1,
    borderColor: colors.line,
  },
  modeButtonActive: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
  },
  modeButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  shareGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  shareCard: {
    minHeight: 132,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    justifyContent: 'space-between',
  },
  shareIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIconText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  shareTitle: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 10,
  },
  shareNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  printPanel: {
    minHeight: 90,
    backgroundColor: '#f3f3f3',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  panelLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  panelHelp: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: -8,
  },
  copyRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  copyButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  copyButtonActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  copyButtonText: {
    color: colors.ink,
    fontWeight: '900',
  },
  copyButtonTextActive: {
    color: '#ffffff',
  },
  printButton: {
    minHeight: 50,
    minWidth: 154,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  printButtonBusy: {
    backgroundColor: '#063fd1',
  },
  printButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  desktopStepNav: {
    marginTop: 'auto',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    minHeight: 50,
    minWidth: 126,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  panel: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    ...shadow,
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  steps: {
    gap: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f7f7f8',
    padding: 10,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  stepText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#f8f8f8',
  },
  filterButtonActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  filterText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  beautyRow: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  beautyLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  toggle: {
    minWidth: 72,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#eeeeee',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    gap: 6,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#b8b8b8',
  },
  toggleText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  printLayout: {
    height: 310,
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: colors.line,
    position: 'relative',
  },
  layoutSlot: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  layoutSlotText: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 4,
  },
  templateBand: {
    marginTop: 18,
    padding: 20,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  bandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bandTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  bandCaption: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  bandMeta: {
    color: colors.red,
    fontSize: 14,
    fontWeight: '900',
  },
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 12,
  },
  templateCard: {
    backgroundColor: '#f7f7f8',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  templateCardActive: {
    borderColor: colors.red,
    boxShadow: '0 8px 24px rgba(10, 77, 232, 0.22)',
  },
  templateImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    resizeMode: 'cover',
  },
  templateBody: {
    padding: 12,
  },
  templateLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  templateName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 5,
  },
  '@media (max-width: 980px)': {
    lumaHero: {
      minHeight: 206,
      paddingHorizontal: 22,
      paddingTop: 34,
    },
    appIdentity: {
      gap: 18,
    },
    appIcon: {
      width: 96,
      height: 96,
      borderRadius: 24,
    },
    iconMark: {
      fontSize: 54,
      lineHeight: 60,
    },
    heroName: {
      fontSize: 32,
    },
    heroLine: {
      left: 22,
      bottom: 20,
    },
    mainGrid: {
      flexDirection: 'column',
    },
    topBar: {
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 14,
      flexDirection: 'column',
    },
    captureHeader: {
      flexDirection: 'column',
      alignItems: 'stretch',
      paddingVertical: 16,
    },
    eventInput: {
      width: '100%',
    },
    cameraFrame: {
      minHeight: 380,
    },
    cameraImage: {
      minHeight: 380,
    },
    printPanel: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    printButton: {
      width: '100%',
    },
  },
  '@media (max-width: 640px)': {
    pageContent: {
      padding: 10,
      paddingTop: 0,
    },
    lumaHero: {
      width: '100vw',
      minHeight: 138,
      marginLeft: -10,
      marginRight: -10,
      marginBottom: 10,
      paddingHorizontal: 16,
      paddingTop: 22,
    },
    heroGlowOne: {
      left: -110,
      bottom: -130,
      width: 270,
      height: 210,
    },
    heroGlowTwo: {
      right: -120,
      top: 18,
      width: 260,
      height: 180,
    },
    appIdentity: {
      alignItems: 'center',
      gap: 12,
    },
    appIcon: {
      width: 66,
      height: 66,
      borderRadius: 17,
    },
    iconMark: {
      fontSize: 38,
      lineHeight: 44,
    },
    heroName: {
      fontSize: 25,
      lineHeight: 29,
      fontWeight: '700',
    },
    heroLine: {
      display: 'none',
    },
    appShell: {
      maxWidth: '100%',
    },
    topBar: {
      minHeight: 0,
      paddingHorizontal: 14,
      paddingVertical: 12,
      boxShadow: '0 10px 28px rgba(4, 8, 15, 0.18)',
    },
    brand: {
      fontSize: 20,
    },
    topActions: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    syncPill: {
      minHeight: 30,
      paddingHorizontal: 10,
    },
    topMeta: {
      fontSize: 12,
    },
    mainGrid: {
      gap: 10,
      marginTop: 10,
    },
    captureColumn: {
      minWidth: 0,
      borderWidth: 0,
      boxShadow: '0 10px 28px rgba(4, 8, 15, 0.18)',
    },
    captureHeader: {
      minHeight: 0,
      paddingHorizontal: 14,
      paddingVertical: 13,
      gap: 11,
    },
    screenTitle: {
      fontSize: 21,
      lineHeight: 25,
    },
    screenCaption: {
      fontSize: 12,
    },
    eventInput: {
      minHeight: 40,
      fontSize: 13,
    },
    cameraFrame: {
      minHeight: 0,
      height: 330,
    },
    cameraImage: {
      minHeight: 0,
      height: 330,
    },
    countdown: {
      width: 92,
      height: 92,
      borderRadius: 46,
      borderWidth: 4,
      fontSize: 52,
      lineHeight: 84,
    },
    cameraInstruction: {
      marginTop: 10,
      fontSize: 14,
      paddingHorizontal: 11,
      paddingVertical: 6,
    },
    sideTools: {
      top: 'auto',
      right: 10,
      left: 10,
      bottom: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    sideTool: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.92)',
    },
    sideToolText: {
      fontSize: 9,
    },
    captureControls: {
      padding: 12,
      gap: 12,
    },
    modeRow: {
      gap: 7,
    },
    modeButton: {
      minWidth: 0,
      flexGrow: 1,
      flexBasis: '30%',
      minHeight: 42,
    },
    modeButtonText: {
      fontSize: 13,
    },
    printPanel: {
      minHeight: 0,
      padding: 12,
      gap: 12,
    },
    copyRow: {
      gap: 7,
      justifyContent: 'space-between',
    },
    copyButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
    },
    printButton: {
      minHeight: 46,
      minWidth: 0,
    },
    workflowColumn: {
      minWidth: 0,
      gap: 10,
    },
    panel: {
      padding: 13,
      boxShadow: '0 10px 28px rgba(4, 8, 15, 0.14)',
    },
    panelTitle: {
      fontSize: 17,
      marginBottom: 11,
    },
    steps: {
      gap: 8,
    },
    stepItem: {
      padding: 9,
    },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
    },
    stepText: {
      fontSize: 14,
    },
    filterGrid: {
      gap: 7,
    },
    filterButton: {
      minHeight: 36,
      paddingHorizontal: 10,
    },
    printLayout: {
      height: 230,
    },
    layoutSlotText: {
      fontSize: 28,
    },
    templateBand: {
      marginTop: 10,
      padding: 13,
      boxShadow: '0 10px 28px rgba(4, 8, 15, 0.14)',
    },
    bandHeader: {
      flexDirection: 'column',
      marginBottom: 12,
    },
    bandTitle: {
      fontSize: 20,
    },
    bandCaption: {
      fontSize: 12,
      lineHeight: 17,
    },
    bandMeta: {
      fontSize: 12,
    },
    templateGrid: {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 9,
    },
    templateBody: {
      padding: 9,
    },
    templateLabel: {
      fontSize: 10,
    },
    templateName: {
      fontSize: 13,
      lineHeight: 17,
    },
  },
})
