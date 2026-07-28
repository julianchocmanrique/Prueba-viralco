import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
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
import tropicalImage from '../assets/plantillas/tropical.png'

const colors = {
  ink: '#111827',
  muted: '#6b7280',
  soft: '#f8fafc',
  line: '#e5e7eb',
  rose: '#0a4de8',
  roseDark: '#063aaf',
  roseSoft: '#eef5ff',
  blue: '#0a4de8',
  green: '#16a34a',
  dark: '#0d1220',
}

const photoTypes = [
  {
    id: 'digital',
    name: 'Foto digital',
    note: 'Una foto vertical lista para WhatsApp o QR.',
    shots: 1,
    aspect: '4 / 5',
    width: 1200,
    height: 1500,
  },
  {
    id: 'doble',
    name: 'Dos fotos',
    note: 'Dos tomas en una misma plantilla.',
    shots: 2,
    aspect: '4 / 5',
    width: 1200,
    height: 1500,
  },
  {
    id: 'recuerdo',
    name: 'Foto recuerdo',
    note: 'Una grande y dos pequeñas en hoja vertical.',
    shots: 3,
    aspect: '4 / 6',
    width: 1200,
    height: 1800,
  },
  {
    id: 'tira',
    name: 'Tira 2x6',
    note: 'Una foto arriba y dos abajo para impresión.',
    shots: 3,
    aspect: '2 / 6',
    width: 600,
    height: 1800,
  },
  {
    id: 'personalizar-5x15',
    name: 'Personalizar',
    note: 'Diseño personalizado con recuadros manuales.',
    shots: 3,
    aspect: '10 / 15',
    width: 2000,
    height: 3000,
  },
  {
    id: 'postal',
    name: 'Postal 4x6',
    note: 'Foto horizontal para marco grande.',
    shots: 1,
    aspect: '4 / 6',
    width: 1800,
    height: 1200,
  },
  {
    id: 'collage',
    name: 'Collage',
    note: 'Cuatro fotos para grupos y fiestas.',
    shots: 4,
    aspect: '4 / 3',
    width: 1600,
    height: 1200,
  },
]

const defaultEventType = 'Boda'
const eventTypes = ['Boda', 'Cumpleaños', 'Bautizo', '15 años', 'Grado', 'Baby shower', 'Corporativo']
const templatesByEventType = {
  Boda: [
    { id: 'boda-clasica', name: 'Boda clásica', image: bodaImage, tone: '#0a4de8' },
    { id: 'boda-elegante', name: 'Boda elegante', image: bodaImage, tone: '#063aaf' },
    { id: 'boda-jardin', name: 'Boda jardín', image: tropicalImage, tone: '#38bdf8' },
    { id: 'boda-noche', name: 'Boda de noche', image: bodaImage, tone: '#172554' },
    { id: 'boda-dorada', name: 'Boda dorada', image: fiestaImage, tone: '#2563eb' },
  ],
  Cumpleaños: [
    { id: 'cumple-color', name: 'Cumple color', image: cumpleImage, tone: '#1d4ed8' },
    { id: 'cumple-globos', name: 'Cumple globos', image: cumpleImage, tone: '#38bdf8' },
    { id: 'cumple-neon', name: 'Cumple neón', image: fiestaImage, tone: '#2563eb' },
    { id: 'cumple-tropical', name: 'Cumple tropical', image: tropicalImage, tone: '#0ea5e9' },
    { id: 'cumple-premium', name: 'Cumple premium', image: cumpleImage, tone: '#063aaf' },
  ],
  Bautizo: [
    { id: 'bautizo-recuerdo', name: 'Recuerdo rosa', image: cumpleImage, tone: '#e9a8b9' },
    { id: 'bautizo-dorado', name: 'Bautizo dorado', image: bodaImage, tone: '#d7a63d' },
    { id: 'bautizo-blanco', name: 'Bautizo blanco', image: bodaImage, tone: '#94a3b8' },
    { id: 'bautizo-globos', name: 'Bautizo globos', image: cumpleImage, tone: '#f3a7c0' },
    { id: 'bautizo-cielo', name: 'Bautizo cielo', image: tropicalImage, tone: '#7dd3fc' },
  ],
  '15 años': [
    { id: 'quince-glam', name: '15 glam', image: cumpleImage, tone: '#0a4de8' },
    { id: 'quince-brillo', name: '15 brillo', image: fiestaImage, tone: '#2563eb' },
    { id: 'quince-princesa', name: '15 princesa', image: bodaImage, tone: '#38bdf8' },
    { id: 'quince-neon', name: '15 neón', image: fiestaImage, tone: '#1d4ed8' },
    { id: 'quince-tropical', name: '15 tropical', image: tropicalImage, tone: '#0ea5e9' },
  ],
  Grado: [
    { id: 'grado-clasico', name: 'Grado clásico', image: fiestaImage, tone: '#0a4de8' },
    { id: 'grado-premium', name: 'Grado premium', image: bodaImage, tone: '#063aaf' },
    { id: 'grado-azul', name: 'Grado azul', image: fiestaImage, tone: '#2563eb' },
    { id: 'grado-fiesta', name: 'Grado fiesta', image: cumpleImage, tone: '#38bdf8' },
    { id: 'grado-noche', name: 'Grado noche', image: fiestaImage, tone: '#172554' },
  ],
  'Baby shower': [
    { id: 'baby-cielo', name: 'Baby cielo', image: tropicalImage, tone: '#38bdf8' },
    { id: 'baby-dulce', name: 'Baby dulce', image: cumpleImage, tone: '#0ea5e9' },
    { id: 'baby-blanco', name: 'Baby blanco', image: bodaImage, tone: '#0a4de8' },
    { id: 'baby-globos', name: 'Baby globos', image: cumpleImage, tone: '#2563eb' },
    { id: 'baby-tropical', name: 'Baby tropical', image: tropicalImage, tone: '#0284c7' },
  ],
  'Fiesta privada': [
    { id: 'fiesta-neon', name: 'Fiesta neón', image: fiestaImage, tone: '#2563eb' },
    { id: 'fiesta-tropical', name: 'Fiesta tropical', image: tropicalImage, tone: '#0ea5e9' },
    { id: 'fiesta-premium', name: 'Fiesta premium', image: bodaImage, tone: '#063aaf' },
    { id: 'fiesta-color', name: 'Fiesta color', image: cumpleImage, tone: '#38bdf8' },
    { id: 'fiesta-noche', name: 'Fiesta noche', image: fiestaImage, tone: '#172554' },
  ],
  Corporativo: [
    { id: 'corp-marca', name: 'Corporativo marca', image: fiestaImage, tone: '#0a4de8' },
    { id: 'corp-gala', name: 'Corporativo gala', image: bodaImage, tone: '#063aaf' },
    { id: 'corp-lanzamiento', name: 'Lanzamiento', image: tropicalImage, tone: '#2563eb' },
    { id: 'corp-networking', name: 'Networking', image: fiestaImage, tone: '#38bdf8' },
    { id: 'corp-premium', name: 'Corporativo premium', image: bodaImage, tone: '#172554' },
  ],
}
const templates = Object.values(templatesByEventType).flat()
const getTemplatesForEventType = (type) => templatesByEventType[type] || templatesByEventType[defaultEventType]
const filters = ['Original', 'Glam', 'Blanco y negro', 'Cálido', 'Marca']
const shareTools = ['WhatsApp', 'QR', 'Imprimir']
const photoTextPresets = ['El tiempo de Dios es perfecto', 'Gracias por acompañarnos', 'Un recuerdo especial']
const customPhotoMaxSlots = 8
const captureAnimationPresets = [
  { id: 'brillo', label: 'Video brillo elegante' },
  { id: 'confeti', label: 'Video confeti suave' },
  { id: 'destello', label: 'Video destello suave' },
]
const animationVideoBase = `${import.meta.env.BASE_URL}animation-videos/`
const makeExampleVideo = (fileName) => ({
  fileName,
  url: `${animationVideoBase}${fileName}`,
  isExample: true,
})
const gifOverlaySizes = ['Rectángulo 720p 16:9', 'Vertical 720p 9:16', 'Cuadrado 720p', 'Pantalla completa 1080p']
const qualityOptions = ['Media', 'Alta', 'Superior']
const animationExperienceStyles = [
  { id: 'video-vertical', label: 'Vídeo vertical - Cabina espejo' },
  { id: 'minimal', label: 'Animación limpia' },
  { id: 'party', label: 'Fiesta con efectos' },
]
const animationVideoStages = [
  {
    id: 'start',
    title: 'Pantalla de Inicio',
    defaultVideo: makeExampleVideo('01.touch-to-start.mp4'),
    helper: 'Este video se reproducirá continuamente.',
    compact: true,
  },
  {
    id: 'beforeCountdown',
    title: 'Antes de la cuenta regresiva',
    exampleVideos: [
      makeExampleVideo('02.get-ready.mp4'),
      makeExampleVideo('03.say-cheese.mp4'),
      makeExampleVideo('04.smile.mp4'),
      makeExampleVideo('05.last-one.mp4'),
    ],
    helper: 'Videos antes de cada foto.',
    randomizable: true,
  },
  {
    id: 'afterCapture',
    title: 'Después de capturar',
    exampleVideos: [
      makeExampleVideo('06.looking-good.mp4'),
      makeExampleVideo('07.you-have-best-smile.mp4'),
      makeExampleVideo('08.you-light-up.mp4'),
      makeExampleVideo('09.do-you-model.mp4'),
    ],
    helper: 'Efectos entre foto y foto.',
    randomizable: true,
  },
  { id: 'countdown', title: 'Cuenta regresiva', defaultFile: 'Deseleccionado', compact: true },
  { id: 'pickMusic', title: 'Seleccionar una música', defaultFile: 'Deseleccionado', compact: true },
  { id: 'beforeSignature', title: 'Antes de la firma', defaultFile: 'Deseleccionado', compact: true },
  { id: 'processing', title: 'Mientras se procesa', defaultVideo: makeExampleVideo('10.processing.mp4'), compact: true },
  { id: 'afterProcessing', title: 'Después de procesar', defaultFile: 'Deseleccionado', compact: true },
  { id: 'sessionEnd', title: 'Fin de la sesión', defaultFile: 'Deseleccionado', compact: true },
]
const defaultRecentEvents = [
  {
    id: 'boda-valentina',
    name: 'Boda Valentina',
    eventType: 'Boda',
    photoTypeId: 'postal',
    templateId: 'boda-clasica',
    filter: 'Glam',
    updatedAt: 'Reciente',
  },
]
const editorTools = [
  { id: 'imagen', label: 'Imagen', icon: '▧' },
  { id: 'texto', label: 'Texto', icon: 'T' },
  { id: 'tema', label: 'Tema', icon: '▦' },
  { id: 'colores', label: 'Colores', icon: '◒' },
  { id: 'diseno', label: 'Diseño de foto', icon: '▣' },
  { id: 'fondo', label: 'Fondo', icon: '⌗' },
]
const designTools = [
  { id: 'cabina', label: 'Foto de la cabina', icon: '▣' },
  { id: 'texto', label: 'Texto', icon: 'T' },
  { id: 'imagen', label: 'Imagen', icon: '▧' },
  { id: 'datos', label: 'Datos del invitado', icon: '☑' },
  { id: 'impresion', label: 'Impresión', icon: '□' },
  { id: 'preset', label: 'Preset', icon: '▤' },
  { id: 'reciente', label: 'Reciente', icon: '↺' },
  { id: 'importar', label: 'Importar', icon: '↓' },
  { id: 'exportar', label: 'Exportar', icon: '↑' },
  { id: 'diseno', label: 'Diseño de impresión', icon: '▦' },
]
const printPaperPresets = [
  { id: '4x6', label: '4x6', sizeText: '10.16 x 15.24 cm', width: '10.16', height: '15.24', margin: '0', note: 'Postal 4x6 pulgadas.' },
  { id: '10x15', label: '10 x 15', sizeText: '10 x 15 cm', width: '10', height: '15', margin: '0', note: 'Hoja para dos tiras 5x15.' },
  { id: '5x15', label: '5 x 15', sizeText: '5 x 15 cm', width: '5', height: '15', margin: '0', note: 'Una tira vertical.' },
  { id: '10x20', label: '10 x 20', sizeText: '10 x 20 cm', width: '10', height: '20', margin: '0', note: 'Formato vertical más alto.' },
  { id: '15x20', label: '15 x 20', sizeText: '15 x 20 cm', width: '15', height: '20', margin: '0.2', note: 'Ampliación para marco.' },
]
const printDpiOptions = [203, 300, 600]
const defaultPrintSettings = {
  presetId: '10x15',
  widthCm: '10',
  heightCm: '15',
  marginCm: '0',
  copies: '1',
  dpi: 300,
  orientation: 'Vertical',
  fit: 'Ajustar',
  twoPerPage: false,
  secondaryPrinter: false,
}

const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max)

function normalizeCustomPhotoOrder(order, count) {
  const targetCount = Math.min(Math.max(Math.round(Number(count) || 0), 0), customPhotoMaxSlots)
  const cleaned = Array.isArray(order)
    ? order.map((item) => Number(item)).filter((item, index, list) => (
        Number.isInteger(item) && item >= 1 && item <= targetCount && list.indexOf(item) === index
      ))
    : []

  Array.from({ length: targetCount }, (_, index) => index + 1).forEach((item) => {
    if (!cleaned.includes(item)) cleaned.push(item)
  })

  return cleaned.slice(0, targetCount)
}

function createManualCustomPhotoSlot(photoNumber, index = 0, sourceSlot = null) {
  const offset = (index % 4) * 3.8
  const baseWidth = sourceSlot ? sourceSlot.width : 74
  const baseHeight = sourceSlot ? sourceSlot.height : 22
  return {
    photoNumber,
    x: clampNumber((sourceSlot ? sourceSlot.x + 5 : 13 + offset), 0, 100 - baseWidth),
    y: clampNumber((sourceSlot ? sourceSlot.y + 5 : 24 + offset), 0, 100 - baseHeight),
    width: baseWidth,
    height: baseHeight,
  }
}

function createDefaultCustomPhotoLayout(count) {
  const targetCount = Math.min(Math.max(Math.round(Number(count) || 3), 1), 6)
  const layoutsByCount = {
    1: [
      { x: 7.8, y: 23, width: 84.4, height: 45 },
    ],
    2: [
      { x: 7.8, y: 22, width: 84.4, height: 24 },
      { x: 7.8, y: 49, width: 84.4, height: 24 },
    ],
    3: [
      { x: 7.8, y: 20.5, width: 84.4, height: 30 },
      { x: 7.8, y: 53.5, width: 40.2, height: 22 },
      { x: 52, y: 53.5, width: 40.2, height: 22 },
    ],
    4: [
      { x: 7.8, y: 21, width: 40.2, height: 24 },
      { x: 52, y: 21, width: 40.2, height: 24 },
      { x: 7.8, y: 48, width: 40.2, height: 24 },
      { x: 52, y: 48, width: 40.2, height: 24 },
    ],
    5: [
      { x: 7.8, y: 20, width: 84.4, height: 22 },
      { x: 7.8, y: 45, width: 40.2, height: 15 },
      { x: 52, y: 45, width: 40.2, height: 15 },
      { x: 7.8, y: 62.5, width: 40.2, height: 15 },
      { x: 52, y: 62.5, width: 40.2, height: 15 },
    ],
    6: [
      { x: 7.8, y: 20, width: 40.2, height: 17 },
      { x: 52, y: 20, width: 40.2, height: 17 },
      { x: 7.8, y: 39.5, width: 40.2, height: 17 },
      { x: 52, y: 39.5, width: 40.2, height: 17 },
      { x: 7.8, y: 59, width: 40.2, height: 17 },
      { x: 52, y: 59, width: 40.2, height: 17 },
    ],
  }

  return layoutsByCount[targetCount].map((slot, index) => ({
    photoNumber: index + 1,
    ...slot,
  }))
}

function getCustomPhotoLayoutLabel(count) {
  const targetCount = Math.min(Math.max(Math.round(Number(count) || 3), 1), 6)
  const labelsByCount = {
    1: '1 foto centrada',
    2: '2 fotos una debajo de otra',
    3: '1 arriba + 2 abajo',
    4: '2 arriba + 2 abajo',
    5: '1 destacada + 4 abajo',
    6: '3 filas de 2 fotos',
  }

  return labelsByCount[targetCount]
}

function normalizeCustomPhotoLayout(layout, count) {
  const incoming = Array.isArray(layout) ? layout : []
  const targetCount = Math.min(Math.max(Math.round(Number(count) || incoming.length || 0), 0), customPhotoMaxSlots)

  return Array.from({ length: targetCount }, (_, index) => {
    const photoNumber = index + 1
    const defaultSlot = createManualCustomPhotoSlot(photoNumber, index)
    const slot = incoming[index] || incoming.find((item) => Number(item?.photoNumber) === photoNumber) || defaultSlot
    const widthValue = clampNumber(Number(slot.width) || defaultSlot.width, 18, 96)
    const heightValue = clampNumber(Number(slot.height) || defaultSlot.height, 7, 58)
    return {
      photoNumber,
      x: clampNumber(Number(slot.x) || defaultSlot.x, 0, 100 - widthValue),
      y: clampNumber(Number(slot.y) || defaultSlot.y, 0, 100 - heightValue),
      width: widthValue,
      height: heightValue,
    }
  })
}

const WebApp = () => {
  const { width } = useWindowDimensions()
  const isMobile = width < 760
  const capturePulse = useRef(new Animated.Value(0)).current
  const captureFloat = useRef(new Animated.Value(0)).current
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [showHomeLauncher, setShowHomeLauncher] = useState(true)
  const [showStartEditor, setShowStartEditor] = useState(false)
  const [showPhotoDesignScreen, setShowPhotoDesignScreen] = useState(false)
  const [showCaptureModeScreen, setShowCaptureModeScreen] = useState(false)
  const [showCaptureConfigScreen, setShowCaptureConfigScreen] = useState(false)
  const [showPrintConfigScreen, setShowPrintConfigScreen] = useState(false)
  const [showPrintOptions, setShowPrintOptions] = useState(false)
  const [showQrOptions, setShowQrOptions] = useState(false)
  const [showBackgroundRemovalScreen, setShowBackgroundRemovalScreen] = useState(false)
  const [showEventOptionsScreen, setShowEventOptionsScreen] = useState(false)
  const [showAnimationVideoScreen, setShowAnimationVideoScreen] = useState(false)
  const [showCustomPhotoLayoutScreen, setShowCustomPhotoLayoutScreen] = useState(false)
  const [showCapturePhotoScreen, setShowCapturePhotoScreen] = useState(false)
  const [showOperatorMenu, setShowOperatorMenu] = useState(false)
  const [operatorQuickPanel, setOperatorQuickPanel] = useState(null)
  const [operatorSettingsActive, setOperatorSettingsActive] = useState(false)
  const [captureIntroActive, setCaptureIntroActive] = useState(false)
  const [showPreviewScreen, setShowPreviewScreen] = useState(false)
  const [showShareScreen, setShowShareScreen] = useState(false)
  const [eventName, setEventName] = useState('')
  const [eventNameError, setEventNameError] = useState('')
  const [eventType, setEventType] = useState('')
  const [selectedType, setSelectedType] = useState(photoTypes[0])
  const [selectedTemplate, setSelectedTemplate] = useState(getTemplatesForEventType(defaultEventType)[0])
  const [selectedFilter, setSelectedFilter] = useState(filters[0])
  const [recentEvents, setRecentEvents] = useState(defaultRecentEvents)
  const [selectedRecentId, setSelectedRecentId] = useState(defaultRecentEvents[0]?.id || '')
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState('')
  const [photoFrames, setPhotoFrames] = useState([])
  const [finalPhotoUrl, setFinalPhotoUrl] = useState('')
  const [retakeFrameIndex, setRetakeFrameIndex] = useState(null)
  const [captureStatus, setCaptureStatus] = useState('Crea un evento para empezar')
  const [countdown, setCountdown] = useState('')
  const [overlayImageUrl, setOverlayImageUrl] = useState('')
  const [overlayFileName, setOverlayFileName] = useState('')
  const [activeEditorTool, setActiveEditorTool] = useState('diseno')
  const [activeDesignTool, setActiveDesignTool] = useState('diseno')
  const [layoutVariant, setLayoutVariant] = useState(1)
  const [captureOriginal, setCaptureOriginal] = useState(true)
  const [photoCountdownFirst, setPhotoCountdownFirst] = useState(5)
  const [photoCountdownNext, setPhotoCountdownNext] = useState(5)
  const [photoReviewSeconds, setPhotoReviewSeconds] = useState(2)
  const [flashBeforePhoto, setFlashBeforePhoto] = useState(true)
  const [roamingMode, setRoamingMode] = useState(false)
  const [gifOverlayUrl, setGifOverlayUrl] = useState('')
  const [gifOverlayFileName, setGifOverlayFileName] = useState('')
  const [gifOverlaySize, setGifOverlaySize] = useState(gifOverlaySizes[0])
  const [gifReverse, setGifReverse] = useState(false)
  const [gifCountdownFirst, setGifCountdownFirst] = useState(5)
  const [gifCountdownNext, setGifCountdownNext] = useState(5)
  const [gifReviewSeconds, setGifReviewSeconds] = useState(2)
  const [gifCaptureCount, setGifCaptureCount] = useState(2)
  const [gifDelayMs, setGifDelayMs] = useState(300)
  const [qualityMode, setQualityMode] = useState('Alta')
  const [preCaptureText, setPreCaptureText] = useState('Prepárese')
  const [photoScriptText, setPhotoScriptText] = useState(photoTextPresets[0])
  const [photoNameText, setPhotoNameText] = useState('')
  const [photoDateText, setPhotoDateText] = useState('')
  const [photoEventText, setPhotoEventText] = useState('')
  const [customPhotoCount, setCustomPhotoCount] = useState(0)
  const [customPhotoOrder, setCustomPhotoOrder] = useState([])
  const [customPhotoLayout, setCustomPhotoLayout] = useState([])
  const [selectedCustomLayoutPhoto, setSelectedCustomLayoutPhoto] = useState(1)
  const [captureAnimation, setCaptureAnimation] = useState(captureAnimationPresets[0].id)
  const [animationOverlay, setAnimationOverlay] = useState(null)
  const [animationVideoUrl, setAnimationVideoUrl] = useState('')
  const [animationVideoFileName, setAnimationVideoFileName] = useState('')
  const [animationVideoPromptAnswered, setAnimationVideoPromptAnswered] = useState(false)
  const [animationVideoQuestionMode, setAnimationVideoQuestionMode] = useState('question')
  const [virtualAssistantEnabled, setVirtualAssistantEnabled] = useState(true)
  const [animationExperienceStyle, setAnimationExperienceStyle] = useState(animationExperienceStyles[0].id)
  const [animationStageVideos, setAnimationStageVideos] = useState({})
  const [animationStageRandom, setAnimationStageRandom] = useState({
    beforeCountdown: false,
    afterCapture: false,
  })
  const [activePreset, setActivePreset] = useState('Fiesta')
  const [backgroundEnabled, setBackgroundEnabled] = useState(true)
  const [backgroundCutMode, setBackgroundCutMode] = useState('Automático')
  const [backgroundFinal, setBackgroundFinal] = useState('Transparente')
  const [edgeSoftness, setEdgeSoftness] = useState('Medio')
  const [keepShadow, setKeepShadow] = useState(true)
  const [applyFrameAfter, setApplyFrameAfter] = useState(true)
  const [printSettings, setPrintSettings] = useState(defaultPrintSettings)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const countdownRef = useRef(null)
  const customEditorStripRef = useRef(null)
  const customLayoutPointerRef = useRef(null)

  const eventTitle = eventName.trim() || 'Evento Viralco'
  const eventReady = Boolean(eventName.trim())
  const framesReady = photoFrames.length
  const captureComplete = Boolean(finalPhotoUrl)
  const customPhotoSequence = useMemo(
    () => normalizeCustomPhotoOrder(customPhotoOrder, customPhotoCount),
    [customPhotoOrder, customPhotoCount],
  )
  const customLayoutSlots = useMemo(
    () => normalizeCustomPhotoLayout(customPhotoLayout, customPhotoCount),
    [customPhotoLayout, customPhotoCount],
  )
  const selectedShotCount = selectedType.id === 'personalizar-5x15' ? customPhotoCount : selectedType.shots
  const normalizedPrintSettings = useMemo(() => {
    const parsePositive = (value, fallback) => {
      const parsed = Number(String(value).replace(',', '.'))
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
    }
    const widthCm = Math.max(parsePositive(printSettings.widthCm, 10), 1)
    const heightCm = Math.max(parsePositive(printSettings.heightCm, 15), 1)
    const marginCm = Math.min(parsePositive(printSettings.marginCm, 0), Math.min(widthCm, heightCm) / 3)
    const copies = Math.min(Math.max(Math.round(parsePositive(printSettings.copies, 1)), 1), 20)
    const dpi = printDpiOptions.includes(Number(printSettings.dpi)) ? Number(printSettings.dpi) : 300
    const landscape = printSettings.orientation === 'Horizontal'
    const orientedWidthCm = landscape ? Math.max(widthCm, heightCm) : Math.min(widthCm, heightCm)
    const orientedHeightCm = landscape ? Math.min(widthCm, heightCm) : Math.max(widthCm, heightCm)
    const printableWidthCm = Math.max(orientedWidthCm - marginCm * 2, 0.1)
    const printableHeightCm = Math.max(orientedHeightCm - marginCm * 2, 0.1)
    return {
      widthCm: orientedWidthCm,
      heightCm: orientedHeightCm,
      widthIn: orientedWidthCm / 2.54,
      heightIn: orientedHeightCm / 2.54,
      printableWidthCm,
      printableHeightCm,
      outputWidthPx: Math.round((orientedWidthCm / 2.54) * dpi),
      outputHeightPx: Math.round((orientedHeightCm / 2.54) * dpi),
      stripWidthCm: orientedWidthCm / 2,
      marginCm,
      copies,
      dpi,
      fit: printSettings.fit,
      twoPerPage: Boolean(printSettings.twoPerPage),
      secondaryPrinter: Boolean(printSettings.secondaryPrinter),
    }
  }, [printSettings])
  const selectedRecentEvent = useMemo(
    () => recentEvents.find((item) => (item.id || item.name) === selectedRecentId) || recentEvents[0],
    [recentEvents, selectedRecentId],
  )
  const eventTemplateOptions = useMemo(() => getTemplatesForEventType(eventType), [eventType])
  const printSizeLabel = `${normalizedPrintSettings.widthCm}x${normalizedPrintSettings.heightCm} cm`
  const activePrintPreset = printPaperPresets.find((preset) => preset.id === printSettings.presetId)
  const activePrintLabel = activePrintPreset?.label || 'Manual'
  const sharePageUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : 'https://www.viralcoproducciones.com/prueba-viralco/'
  const shareText = `${eventTitle}: foto del espejo mágico Viralco lista. ${sharePageUrl}`
  const encodedShareText = encodeURIComponent(shareText)
  const encodedShareUrl = encodeURIComponent(sharePageUrl)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=14&data=${encodedShareUrl}`

  const getCurrentSetup = () => ({
    id: eventName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `evento-${Date.now()}`,
    name: eventName.trim() || 'Evento Viralco',
    eventName: eventName.trim() || 'Evento Viralco',
    eventType: eventType || defaultEventType,
    photoTypeId: selectedType.id,
    customLayoutMode: 'manual-free',
    customPhotoCount,
    customPhotoOrder: customPhotoSequence,
    customPhotoLayout: customLayoutSlots,
    templateId: selectedTemplate.id,
    filter: selectedFilter,
    updatedAt: 'Ahora',
  })

  const applyEventSetup = (setup, status = 'listo para lanzar fotos') => {
    const nextType = photoTypes.find((item) => item.id === setup.photoTypeId) || selectedType
    const nextEventType = setup.eventType || defaultEventType
    const nextTemplateOptions = getTemplatesForEventType(nextEventType)
    const nextTemplate =
      nextTemplateOptions.find((item) => item.id === setup.templateId) ||
      templates.find((item) => item.id === setup.templateId) ||
      nextTemplateOptions[0] ||
      selectedTemplate
    const nextFilter = filters.includes(setup.filter) ? setup.filter : selectedFilter
    const nextName = setup.eventName || setup.name || 'Evento Viralco'

    setEventName(nextName)
    setEventType(nextEventType)
    setSelectedType(nextType)
    if (nextType.id === 'personalizar-5x15') {
      const savedManualLayout = setup.customLayoutMode === 'manual-free'
      const savedLayout = savedManualLayout && Array.isArray(setup.customPhotoLayout) ? setup.customPhotoLayout : []
      const nextCustomCount = Math.min(
        Math.max(Math.round(Number(setup.customPhotoCount) || savedLayout.length || 0), 0),
        customPhotoMaxSlots,
      )
      setCustomPhotoCount(nextCustomCount)
      setCustomPhotoOrder(normalizeCustomPhotoOrder(savedManualLayout ? setup.customPhotoOrder : [], nextCustomCount))
      setCustomPhotoLayout(normalizeCustomPhotoLayout(savedLayout, nextCustomCount))
      setSelectedCustomLayoutPhoto(1)
    }
    setSelectedTemplate(nextTemplate)
    setSelectedFilter(nextFilter)
    setPhotoFrames([])
    setFinalPhotoUrl('')
    setRetakeFrameIndex(null)
    setAnimationVideoPromptAnswered(false)
    setAnimationVideoQuestionMode('question')
    setCountdown('')
    setCaptureStatus(`${nextName}: ${status}`)
  }

  const rememberRecentEvent = (setup) => {
    setRecentEvents((current) => {
      const next = [
        { ...setup, id: setup.id || `evento-${Date.now()}`, updatedAt: 'Ahora' },
        ...current.filter((item) => (item.id || item.name) !== (setup.id || setup.name)),
      ].slice(0, 1)
      return next
    })
  }

  const launchEvent = (setup = getCurrentSetup(), destination = 'capture') => {
    const nextType = photoTypes.find((item) => item.id === setup.photoTypeId) || selectedType
    const shouldAskAnimationVideo = destination === 'capture' && nextType.id === 'personalizar-5x15'
    applyEventSetup(setup)
    rememberRecentEvent(setup)
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(destination === 'options')
    setShowAnimationVideoScreen(shouldAskAnimationVideo)
    setShowCustomPhotoLayoutScreen(false)
    setShowCapturePhotoScreen(destination === 'capture' && !shouldAskAnimationVideo)
    setCaptureIntroActive(destination === 'capture' && !shouldAskAnimationVideo)
    setShowPreviewScreen(destination === 'preview')
    setShowShareScreen(destination === 'share')
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
  }

  const openNewEventModal = () => {
    setEventName('')
    setEventNameError('')
    setEventType('')
    setSelectedTemplate(getTemplatesForEventType(defaultEventType)[0])
    setPhotoFrames([])
    setFinalPhotoUrl('')
    setRetakeFrameIndex(null)
    setAnimationVideoPromptAnswered(false)
    setAnimationVideoQuestionMode('question')
    setCaptureStatus('Escribe el nombre del evento')
    setShowEventOptionsScreen(false)
    setShowCustomPhotoLayoutScreen(false)
    setShowCapturePhotoScreen(false)
    setCaptureIntroActive(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowCreateEventModal(true)
  }

  const launchNewEventFromModal = (destination = 'options') => {
    if (!eventName.trim()) {
      setEventNameError('Escribe el nombre del evento para continuar.')
      setCaptureStatus('Escribe el nombre del evento para continuar.')
      return
    }

    setEventNameError('')
    launchEvent(getCurrentSetup(), destination)
  }

  const nextShotLabel = useMemo(() => {
    if (captureComplete) return 'Foto final lista'
    if (!framesReady) return `Necesitas ${selectedShotCount} foto${selectedShotCount === 1 ? '' : 's'}`
    return `Foto ${framesReady} de ${selectedShotCount} guardada`
  }, [captureComplete, framesReady, selectedShotCount])

  useEffect(() => {
    if (!videoRef.current || !cameraStream) return
    videoRef.current.srcObject = cameraStream
    videoRef.current.play?.().catch(() => undefined)
  }, [cameraStream])

  useEffect(() => {
    if (!captureIntroActive) {
      capturePulse.setValue(0)
      captureFloat.setValue(0)
      return undefined
    }

    const pulseLoop = Animated.loop(
      Animated.timing(capturePulse, {
        toValue: 1,
        duration: 1450,
        useNativeDriver: false,
      }),
    )
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(captureFloat, {
          toValue: 1,
          duration: 1050,
          useNativeDriver: false,
        }),
        Animated.timing(captureFloat, {
          toValue: 0,
          duration: 1050,
          useNativeDriver: false,
        }),
      ]),
    )

    pulseLoop.start()
    floatLoop.start()

    return () => {
      pulseLoop.stop()
      floatLoop.stop()
    }
  }, [captureFloat, captureIntroActive, capturePulse])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const saved = window.localStorage.getItem('viralco-mirror-photo-app')
    const savedRecent = window.localStorage.getItem('viralco-mirror-recent-events')

    try {
      const parsedRecent = savedRecent ? JSON.parse(savedRecent) : []
      if (Array.isArray(parsedRecent) && parsedRecent.length) {
        setRecentEvents(parsedRecent.slice(0, 1))
        setSelectedRecentId(parsedRecent[0].id || parsedRecent[0].name || '')
      }
      if (saved) {
        const setup = JSON.parse(saved)
        applyEventSetup(setup, 'listo para fotos')
      }
    } catch {
      window.localStorage.removeItem('viralco-mirror-photo-app')
      window.localStorage.removeItem('viralco-mirror-recent-events')
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const setup = {
      eventName: eventName.trim(),
      eventType,
      photoTypeId: selectedType.id,
      customLayoutMode: 'manual-free',
      customPhotoCount,
      customPhotoOrder: customPhotoSequence,
      customPhotoLayout: customLayoutSlots,
      templateId: selectedTemplate.id,
      filter: selectedFilter,
    }
    window.localStorage.setItem('viralco-mirror-photo-app', JSON.stringify(setup))
  }, [eventName, eventType, selectedType, customPhotoCount, customPhotoSequence, customLayoutSlots, selectedTemplate, selectedFilter])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('viralco-mirror-recent-events', JSON.stringify(recentEvents))
  }, [recentEvents])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const getEventPoint = (event) => {
      const touch = event.touches?.[0] || event.changedTouches?.[0]
      return {
        clientX: touch?.clientX ?? event.clientX ?? event.pageX,
        clientY: touch?.clientY ?? event.clientY ?? event.pageY,
      }
    }

    const handlePointerMove = (event) => {
      const active = customLayoutPointerRef.current
      if (!active) return
      const point = getEventPoint(event)
      if (!Number.isFinite(point.clientX) || !Number.isFinite(point.clientY)) return
      event.preventDefault?.()
      const deltaX = ((point.clientX - active.startX) / active.rect.width) * 100
      const deltaY = ((point.clientY - active.startY) / active.rect.height) * 100

      setCustomPhotoLayout((current) =>
        normalizeCustomPhotoLayout(current, customPhotoCount).map((slot) => {
          if (slot.photoNumber !== active.photoNumber) return slot
          if (active.mode === 'resize') {
            const nextWidth = clampNumber(active.slot.width + deltaX, 18, 100 - active.slot.x)
            const nextHeight = clampNumber(active.slot.height + deltaY, 7, 100 - active.slot.y)
            return { ...slot, width: nextWidth, height: nextHeight }
          }

          return {
            ...slot,
            x: clampNumber(active.slot.x + deltaX, 0, 100 - active.slot.width),
            y: clampNumber(active.slot.y + deltaY, 0, 100 - active.slot.height),
          }
        }),
      )
    }

    const handlePointerUp = () => {
      customLayoutPointerRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('touchmove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('mouseup', handlePointerUp)
    window.addEventListener('touchend', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchend', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [customPhotoCount])

  useEffect(
    () => () => {
      stopCamera()
      if (countdownRef.current) countdownRef.current.active = false
      if (overlayImageUrl) URL.revokeObjectURL(overlayImageUrl)
      if (gifOverlayUrl) URL.revokeObjectURL(gifOverlayUrl)
    },
    [overlayImageUrl, gifOverlayUrl],
  )

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraStream(null)
  }

  const openCamera = async () => {
    setCameraError('')
    setCaptureStatus('Abriendo cámara del espejo mágico...')

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Este navegador no permite abrir la cámara.')
      }

      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'user' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      streamRef.current = stream
      setCameraStream(stream)
      setCaptureStatus('Cámara activa. Ubica a la persona frente al espejo.')
      return stream
    } catch (error) {
      const readableError =
        error?.name === 'NotFoundError' || /requested device not found/i.test(error?.message || '')
          ? 'No encontré una cámara conectada en este dispositivo.'
          : error?.name === 'NotAllowedError'
            ? 'El navegador no tiene permiso para usar la cámara.'
            : 'No se pudo abrir la cámara.'
      setCameraError(readableError)
      setCaptureStatus('No se pudo abrir la cámara. Revisa permisos del navegador.')
      return null
    }
  }

  const captureFrame = () => {
    if (typeof document === 'undefined' || !videoRef.current) return ''
    const video = videoRef.current
    if (!video.videoWidth || !video.videoHeight) return ''

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return ''

    context.translate(canvas.width, 0)
    context.scale(-1, 1)
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const jpegQuality = qualityMode === 'Superior' ? 0.96 : qualityMode === 'Media' ? 0.82 : 0.9
    return canvas.toDataURL('image/jpeg', jpegQuality)
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

  const getTemplateImageUrl = () =>
    typeof selectedTemplate.image === 'string' ? selectedTemplate.image : selectedTemplate.image?.uri || ''

  const drawCover = (context, image, x, y, widthValue, heightValue) => {
    const sourceRatio = image.width / image.height
    const targetRatio = widthValue / heightValue
    const sourceWidth = sourceRatio > targetRatio ? image.height * targetRatio : image.width
    const sourceHeight = sourceRatio > targetRatio ? image.height : image.width / targetRatio
    const sourceX = (image.width - sourceWidth) / 2
    const sourceY = (image.height - sourceHeight) / 2
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, widthValue, heightValue)
  }

  const drawGifOverlay = async (context, canvasWidth, canvasHeight) => {
    if (!gifOverlayUrl) return
    const image = await loadCanvasImage(gifOverlayUrl).catch(() => null)
    if (!image) return
    context.save()
    context.globalAlpha = 0.92
    drawCover(context, image, 0, 0, canvasWidth, canvasHeight)
    context.restore()
  }

  const roundedPath = (context, x, y, widthValue, heightValue, radius) => {
    if (context.roundRect) {
      context.roundRect(x, y, widthValue, heightValue, radius)
      return
    }

    const safeRadius = Math.min(radius, widthValue / 2, heightValue / 2)
    context.moveTo(x + safeRadius, y)
    context.lineTo(x + widthValue - safeRadius, y)
    context.quadraticCurveTo(x + widthValue, y, x + widthValue, y + safeRadius)
    context.lineTo(x + widthValue, y + heightValue - safeRadius)
    context.quadraticCurveTo(x + widthValue, y + heightValue, x + widthValue - safeRadius, y + heightValue)
    context.lineTo(x + safeRadius, y + heightValue)
    context.quadraticCurveTo(x, y + heightValue, x, y + heightValue - safeRadius)
    context.lineTo(x, y + safeRadius)
    context.quadraticCurveTo(x, y, x + safeRadius, y)
  }

  const drawFlower = (context, x, y, radius, fillStyle, centerStyle = '#d7a63d') => {
    context.save()
    context.fillStyle = fillStyle
    ;[0, 1, 2, 3, 4].forEach((index) => {
      const angle = (Math.PI * 2 * index) / 5
      context.beginPath()
      context.arc(x + Math.cos(angle) * radius * 0.95, y + Math.sin(angle) * radius * 0.95, radius * 0.62, 0, Math.PI * 2)
      context.fill()
    })
    context.fillStyle = centerStyle
    context.beginPath()
    context.arc(x, y, radius * 0.45, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }

  const drawBow = (context, x, y, scale = 1, fillStyle = '#f4a3bd', strokeStyle = '#b85f78') => {
    context.save()
    context.translate(x, y)
    context.scale(scale, scale)
    context.fillStyle = fillStyle
    context.strokeStyle = strokeStyle
    context.lineWidth = 5

    context.beginPath()
    context.moveTo(0, 0)
    context.bezierCurveTo(-72, -62, -138, -42, -130, 32)
    context.bezierCurveTo(-118, 100, -48, 74, 0, 14)
    context.closePath()
    context.fill()
    context.stroke()

    context.beginPath()
    context.moveTo(0, 0)
    context.bezierCurveTo(72, -62, 138, -42, 130, 32)
    context.bezierCurveTo(118, 100, 48, 74, 0, 14)
    context.closePath()
    context.fill()
    context.stroke()

    context.fillStyle = '#f9d7e2'
    context.beginPath()
    context.ellipse(0, 13, 24, 30, 0, 0, Math.PI * 2)
    context.fill()
    context.stroke()
    context.restore()
  }

  const drawEarMascot = (context, x, y, scale = 1, bowColor = '#f4a3bd') => {
    context.save()
    context.translate(x, y)
    context.scale(scale, scale)
    context.fillStyle = '#1f2937'
    context.beginPath()
    context.arc(-54, -46, 50, 0, Math.PI * 2)
    context.arc(54, -46, 50, 0, Math.PI * 2)
    context.arc(0, 16, 64, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#fee2e2'
    context.beginPath()
    context.arc(0, 32, 42, 0, Math.PI * 2)
    context.fill()
    drawBow(context, 0, -76, 0.43, bowColor)
    context.restore()
  }

  const drawRecuerdoFrame = (context, canvasWidth, canvasHeight) => {
    const border = canvasWidth * 0.04
    context.fillStyle = '#fffdfb'
    context.fillRect(0, 0, canvasWidth, canvasHeight)

    context.strokeStyle = '#efb3c1'
    context.lineWidth = Math.max(6, canvasWidth * 0.008)
    context.strokeRect(border * 0.78, border * 0.78, canvasWidth - border * 1.56, canvasHeight - border * 1.56)

    context.strokeStyle = 'rgba(239, 179, 193, 0.58)'
    context.lineWidth = Math.max(3, canvasWidth * 0.004)
    context.strokeRect(border * 1.55, border * 1.55, canvasWidth - border * 3.1, canvasHeight - border * 3.1)

    context.save()
    context.globalAlpha = 0.62
    context.fillStyle = 'rgba(226, 128, 151, 0.18)'
    context.strokeStyle = 'rgba(199, 91, 118, 0.46)'
    context.lineWidth = Math.max(2, canvasWidth * 0.003)
    const laceRadius = canvasWidth * 0.024
    const laceStep = laceRadius * 1.25
    const drawLace = (x, y, rotation = 0) => {
      context.save()
      context.translate(x, y)
      context.rotate(rotation)
      for (let index = 0; index < 5; index += 1) {
        const angle = -Math.PI * 0.85 + index * Math.PI * 0.18
        context.beginPath()
        context.arc(Math.cos(angle) * laceRadius * 0.62, Math.sin(angle) * laceRadius * 0.45, laceRadius * 0.52, 0, Math.PI * 2)
        context.fill()
        context.stroke()
      }
      context.restore()
    }
    for (let x = border * 1.55; x < canvasWidth - border * 1.4; x += laceStep) {
      drawLace(x, border * 1.15, 0)
      drawLace(x, canvasHeight - border * 1.15, Math.PI)
    }
    for (let y = border * 1.9; y < canvasHeight - border * 1.8; y += laceStep) {
      drawLace(border * 1.15, y, Math.PI * 1.5)
      drawLace(canvasWidth - border * 1.15, y, Math.PI * 0.5)
    }
    context.restore()

    drawBow(context, canvasWidth * 0.2, canvasHeight * 0.8, 0.42, '#f3a7c0')
    drawEarMascot(context, canvasWidth * 0.16, canvasHeight * 0.885, 1.02, '#f3a7c0')
    drawEarMascot(context, canvasWidth * 0.84, canvasHeight * 0.87, 0.86, '#ffffff')
  }

  const getSlots = (type, widthValue, heightValue) => {
    const margin = widthValue * 0.07
    if (type.id === 'recuerdo') {
      const side = widthValue * 0.13
      const gap = widthValue * 0.026
      const smallWidth = (widthValue - side * 2 - gap) / 2
      return [
        { x: side, y: heightValue * 0.09, width: widthValue - side * 2, height: heightValue * 0.32 },
        { x: side, y: heightValue * 0.445, width: smallWidth, height: heightValue * 0.285 },
        { x: side + smallWidth + gap, y: heightValue * 0.445, width: smallWidth, height: heightValue * 0.285 },
      ]
    }

    if (type.id === 'doble') {
      const gap = heightValue * 0.035
      const slotHeight = (heightValue - margin * 2 - gap - heightValue * 0.17) / 2
      return [0, 1].map((index) => ({
        x: margin,
        y: heightValue * 0.12 + margin + index * (slotHeight + gap),
        width: widthValue - margin * 2,
        height: slotHeight,
      }))
    }

    if (type.id === 'personalizar-5x15') {
      const stripWidth = widthValue * 0.43
      const stripX = (widthValue - stripWidth) / 2
      const count = selectedType.id === 'personalizar-5x15' ? customPhotoCount : type.shots
      const photoTop = heightValue * 0.2
      const gap = heightValue * (count > 4 ? 0.012 : 0.025)
      const slotHeight = Math.min(heightValue * 0.18, (heightValue * 0.57 - gap * (count - 1)) / count)
      return Array.from({ length: count }, (_, index) => ({
        x: stripX,
        y: photoTop + index * (slotHeight + gap),
        width: stripWidth,
        height: slotHeight,
      }))
    }

    if (type.id === 'tira') {
      const gap = heightValue * 0.024
      const slotHeight = (heightValue - margin * 2 - gap * 2 - heightValue * 0.16) / 3
      return [0, 1, 2].map((index) => ({
        x: margin,
        y: heightValue * 0.1 + margin + index * (slotHeight + gap),
        width: widthValue - margin * 2,
        height: slotHeight,
      }))
    }

    if (type.id === 'collage') {
      const gap = widthValue * 0.035
      const slotWidth = (widthValue - margin * 2 - gap) / 2
      const slotHeight = (heightValue - margin * 2 - gap - heightValue * 0.18) / 2
      return [0, 1, 2, 3].map((_, index) => ({
        x: margin + (index % 2) * (slotWidth + gap),
        y: heightValue * 0.12 + margin + Math.floor(index / 2) * (slotHeight + gap),
        width: slotWidth,
        height: slotHeight,
      }))
    }

    if (type.id === 'postal') {
      return [{ x: margin, y: heightValue * 0.17, width: widthValue - margin * 2, height: heightValue * 0.65 }]
    }

    return [{ x: margin, y: heightValue * 0.17, width: widthValue - margin * 2, height: heightValue * 0.66 }]
  }

  const drawCustom5x15Decor = (context, x, y, widthValue, heightValue) => {
    context.save()
    context.globalAlpha = 0.2
    context.strokeStyle = '#8aa174'
    context.fillStyle = '#c9d8b5'
    ;[
      [x + widthValue * 0.04, y + heightValue * 0.17, -0.45],
      [x + widthValue * 0.95, y + heightValue * 0.19, 0.35],
      [x + widthValue * 0.06, y + heightValue * 0.84, 0.28],
      [x + widthValue * 0.94, y + heightValue * 0.86, -0.3],
    ].forEach(([leafX, leafY, rotation]) => {
      context.save()
      context.translate(leafX, leafY)
      context.rotate(rotation)
      context.lineWidth = Math.max(3, widthValue * 0.004)
      for (let index = 0; index < 4; index += 1) {
        context.beginPath()
        context.ellipse(index * widthValue * 0.038, -index * widthValue * 0.006, widthValue * 0.04, widthValue * 0.018, -0.55, 0, Math.PI * 2)
        context.fill()
        context.stroke()
      }
      context.restore()
    })
    context.restore()
  }

  const drawMultilineCenteredText = (context, lines, x, y, lineHeight) => {
    lines.forEach((line, index) => {
      context.fillText(line, x, y + index * lineHeight)
    })
  }

  const formatEventDate = () => {
    const date = new Date()
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`
  }

  const getPhotoNameText = () => photoNameText.trim() || eventTitle
  const getPhotoDateText = () => photoDateText.trim() || formatEventDate()
  const getPhotoEventText = () => photoEventText.trim()

  const wait = (milliseconds) => new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })

  const getPhotoScriptLines = () => {
    const text = photoScriptText.trim() || photoTextPresets[0]
    if (text.length <= 23) return [text]
    const words = text.split(/\s+/)
    const lines = ['']
    words.forEach((word) => {
      const current = lines[lines.length - 1]
      const next = current ? `${current} ${word}` : word
      if (next.length > 20 && lines.length < 3) {
        lines.push(word)
      } else {
        lines[lines.length - 1] = next
      }
    })
    return lines
  }

  const getPhotoNameLines = () => {
    const text = getPhotoNameText()
    if (text.length <= 16) return [text]
    const words = text.split(/\s+/)
    const lines = ['']
    words.forEach((word) => {
      const current = lines[lines.length - 1]
      const next = current ? `${current} ${word}` : word
      if (next.length > 15 && lines.length < 2) {
        lines.push(word)
      } else {
        lines[lines.length - 1] = next
      }
    })
    return lines
  }

  const drawCustom5x15Strip = (context, frameImages, x, y, widthValue, heightValue) => {
    const orderedImages = customPhotoSequence.map((photoNumber) => frameImages[photoNumber - 1]).filter(Boolean)
    const layoutByPhoto = new Map(customLayoutSlots.map((slot) => [slot.photoNumber, slot]))
    const photoSlots = customPhotoSequence.map((photoNumber) => {
      const slot = layoutByPhoto.get(photoNumber) || createDefaultCustomPhotoLayout(customPhotoCount)[photoNumber - 1]
      return {
        photoNumber,
        x: x + (slot.x / 100) * widthValue,
        y: y + (slot.y / 100) * heightValue,
        width: (slot.width / 100) * widthValue,
        height: (slot.height / 100) * heightValue,
      }
    })

    context.save()
    context.fillStyle = '#fffdf8'
    context.fillRect(x, y, widthValue, heightValue)
    drawCustom5x15Decor(context, x, y, widthValue, heightValue)

    context.strokeStyle = 'rgba(17, 24, 39, 0.14)'
    context.setLineDash([5, 8])
    context.lineWidth = Math.max(2, widthValue * 0.002)
    context.strokeRect(x + 2, y + 2, widthValue - 4, heightValue - 4)
    context.setLineDash([])

    context.textAlign = 'center'
    context.fillStyle = '#1f2937'
    context.font = `500 ${Math.round(widthValue * 0.073)}px "Brush Script MT", "Segoe Script", "Comic Sans MS", cursive`
    drawMultilineCenteredText(context, getPhotoScriptLines(), x + widthValue / 2, y + heightValue * 0.078, heightValue * 0.055)

    photoSlots.forEach((slot, index) => {
      const image = orderedImages[index] || orderedImages[index % orderedImages.length] || frameImages[index] || frameImages[index % frameImages.length]
      context.save()
      context.beginPath()
      context.rect(slot.x, slot.y, slot.width, slot.height)
      context.clip()
      context.fillStyle = '#111827'
      context.fillRect(slot.x, slot.y, slot.width, slot.height)
      if (image) drawCover(context, image, slot.x, slot.y, slot.width, slot.height)
      context.restore()

      context.lineWidth = Math.max(10, widthValue * 0.014)
      context.strokeStyle = '#ffffff'
      context.strokeRect(slot.x, slot.y, slot.width, slot.height)
    })

    const eventText = getPhotoEventText()
    context.fillStyle = '#b96f71'
    context.font = `800 ${Math.round(widthValue * 0.092)}px Arial, "Helvetica Neue", sans-serif`
    drawMultilineCenteredText(context, getPhotoNameLines(), x + widthValue / 2, y + heightValue * 0.84, heightValue * 0.052)

    if (eventText) {
      context.fillStyle = '#b96f71'
      context.font = `700 ${Math.round(widthValue * 0.036)}px Arial, "Helvetica Neue", sans-serif`
      context.fillText(eventText, x + widthValue / 2, y + heightValue * 0.91)
    }

    context.fillStyle = '#b96f71'
    context.font = `700 ${Math.round(widthValue * 0.038)}px Arial, "Helvetica Neue", sans-serif`
    context.fillText(getPhotoDateText(), x + widthValue / 2, y + heightValue * 0.955)
    context.restore()
  }

  const composeFinalPhoto = async (frames) => {
    if (typeof document === 'undefined' || !frames.length) return frames[0] || ''

    const canvas = document.createElement('canvas')
    canvas.width = selectedType.width
    canvas.height = selectedType.height
    const context = canvas.getContext('2d')
    if (!context) return frames[0] || ''

    const { width: canvasWidth, height: canvasHeight } = canvas
    const isRecuerdo = selectedType.id === 'recuerdo'
    const isCustom5x15 = selectedType.id === 'personalizar-5x15'

    if (isCustom5x15) {
      context.fillStyle = '#f8fafc'
      context.fillRect(0, 0, canvasWidth, canvasHeight)
      const frameImages = await Promise.all(frames.map((frame) => loadCanvasImage(frame).catch(() => null)))
      const pagePad = canvasWidth * 0.035
      const gutter = canvasWidth * 0.018
      const stripWidth = (canvasWidth - pagePad * 2 - gutter) / 2
      const stripHeight = canvasHeight - pagePad * 2
      drawCustom5x15Strip(context, frameImages, pagePad, pagePad, stripWidth, stripHeight)
      drawCustom5x15Strip(context, frameImages, pagePad + stripWidth + gutter, pagePad, stripWidth, stripHeight)
      context.strokeStyle = 'rgba(17, 24, 39, 0.18)'
      context.setLineDash([12, 14])
      context.lineWidth = Math.max(3, canvasWidth * 0.002)
      context.beginPath()
      context.moveTo(canvasWidth / 2, pagePad)
      context.lineTo(canvasWidth / 2, canvasHeight - pagePad)
      context.stroke()
      context.setLineDash([])
      await drawGifOverlay(context, canvasWidth, canvasHeight)
      return canvas.toDataURL('image/jpeg', qualityMode === 'Superior' ? 0.96 : qualityMode === 'Media' ? 0.84 : 0.92)
    }

    if (isRecuerdo) {
      drawRecuerdoFrame(context, canvasWidth, canvasHeight)
    } else {
      const gradient = context.createLinearGradient(0, 0, canvasWidth, canvasHeight)
      gradient.addColorStop(0, selectedTemplate.tone)
      gradient.addColorStop(0.58, colors.rose)
      gradient.addColorStop(1, colors.dark)
      context.fillStyle = gradient
      context.fillRect(0, 0, canvasWidth, canvasHeight)
    }

    const templateImage = isRecuerdo ? null : await loadCanvasImage(overlayImageUrl || getTemplateImageUrl()).catch(() => null)
    if (templateImage) {
      context.globalAlpha = overlayImageUrl ? 0.86 : 0.24
      drawCover(context, templateImage, 0, 0, canvasWidth, canvasHeight)
      context.globalAlpha = 1
    }

    const frameImages = await Promise.all(frames.map((frame) => loadCanvasImage(frame).catch(() => null)))
    getSlots(selectedType, canvasWidth, canvasHeight).forEach((slot, index) => {
      const image = frameImages[index] || frameImages[index % frameImages.length]
      const radius = isRecuerdo ? 0 : Math.max(22, canvasWidth * 0.018)

      context.save()
      context.beginPath()
      roundedPath(context, slot.x, slot.y, slot.width, slot.height, radius)
      context.clip()
      context.fillStyle = '#101419'
      context.fillRect(slot.x, slot.y, slot.width, slot.height)
      if (image) drawCover(context, image, slot.x, slot.y, slot.width, slot.height)
      context.restore()

      context.lineWidth = Math.max(8, canvasWidth * 0.011)
      context.strokeStyle = '#ffffff'
      context.beginPath()
      roundedPath(context, slot.x, slot.y, slot.width, slot.height, radius)
      context.stroke()

      if (isRecuerdo) {
        context.lineWidth = Math.max(2, canvasWidth * 0.003)
        context.strokeStyle = 'rgba(219, 146, 162, 0.42)'
        context.strokeRect(slot.x - 8, slot.y - 8, slot.width + 16, slot.height + 16)
      }
    })

    if (isRecuerdo) {
      const dateText = photoDateText.trim()
      context.textAlign = 'center'
      context.fillStyle = '#c96e7c'
      context.font = `700 ${Math.round(canvasWidth * 0.078)}px "Brush Script MT", "Segoe Script", "Comic Sans MS", cursive`
      drawMultilineCenteredText(context, getPhotoNameLines(), canvasWidth * 0.5, canvasHeight * 0.805, canvasHeight * 0.055)
      context.font = `700 ${Math.round(canvasWidth * 0.029)}px "Comic Sans MS", "Trebuchet MS", Arial`
      context.fillStyle = '#c87887'
      context.fillText(getPhotoEventText(), canvasWidth * 0.5, canvasHeight * 0.928)
      if (dateText) {
        context.font = `600 ${Math.round(canvasWidth * 0.02)}px Arial`
        context.fillStyle = '#9ca3af'
        context.fillText(dateText, canvasWidth * 0.5, canvasHeight * 0.958)
      }
    } else {
      context.textAlign = 'left'
      context.fillStyle = '#ffffff'
      context.font = `900 ${Math.round(canvasWidth * 0.043)}px Arial`
      context.fillText(eventTitle, canvasWidth * 0.07, canvasHeight * 0.075)
      context.font = `700 ${Math.round(canvasWidth * 0.022)}px Arial`
      context.fillStyle = 'rgba(255,255,255,0.78)'
      context.fillText(`${selectedType.name} / ${selectedFilter}`, canvasWidth * 0.07, canvasHeight * 0.112)

      context.textAlign = 'right'
      context.font = `900 ${Math.round(canvasWidth * 0.034)}px Arial`
      context.fillStyle = '#ffffff'
      context.fillText('Viralco', canvasWidth * 0.93, canvasHeight * 0.94)
      context.font = `700 ${Math.round(canvasWidth * 0.02)}px Arial`
      context.fillStyle = 'rgba(255,255,255,0.7)'
      context.fillText('Espejo mágico', canvasWidth * 0.93, canvasHeight * 0.969)
    }

    await drawGifOverlay(context, canvasWidth, canvasHeight)
    return canvas.toDataURL('image/jpeg', qualityMode === 'Superior' ? 0.96 : qualityMode === 'Media' ? 0.84 : 0.92)
  }

  const runCountdownAndCapture = async () => {
    if (countdownRef.current) return
    const replacingIndex = Number.isInteger(retakeFrameIndex) ? retakeFrameIndex : null

    if (!eventReady) {
      setEventNameError('Escribe el nombre del evento para continuar.')
      setShowCreateEventModal(true)
      setCaptureStatus('Primero escribe el nombre del evento.')
      return
    }

    if (!cameraStream && !streamRef.current) {
      const openedStream = await openCamera()
      if (!openedStream) {
        countdownRef.current = null
        return
      }
      await wait(650)
    }

    setCaptureIntroActive(false)
    const countdownSeconds = replacingIndex === null && framesReady > 0 ? photoCountdownNext : photoCountdownFirst

    countdownRef.current = { active: true }
    setAnimationOverlay({
      mode: captureAnimation,
      title: preCaptureText,
      text: replacingIndex === null ? (framesReady ? 'Video antes de la siguiente foto' : 'Video de animación antes de tomar la foto') : `Video antes de repetir foto ${replacingIndex + 1}`,
      stage: 'beforeCountdown',
      videoUrl: getAnimationStageVideoUrl('beforeCountdown'),
    })
    setCaptureStatus(replacingIndex === null ? 'Mostrando animación antes de la foto...' : `Preparando reemplazo de foto ${replacingIndex + 1}...`)
    await wait(flashBeforePhoto ? 900 : 350)

    if (!countdownRef.current?.active) return

    for (let seconds = countdownSeconds; seconds > 0; seconds -= 1) {
      setCountdown(String(seconds))
      setCaptureStatus(`Preparando foto en ${seconds}...`)
      await wait(1000)
    }

    setCountdown('')
    setAnimationOverlay(null)

    const frame = captureFrame()
    if (!frame) {
      countdownRef.current = null
      setCaptureStatus('No se pudo capturar la imagen. Vuelve a abrir la cámara.')
      return
    }

    const nextFrames =
      replacingIndex === null
        ? [...photoFrames, frame].slice(-selectedShotCount)
        : photoFrames.map((currentFrame, index) => (index === replacingIndex ? frame : currentFrame))
    setPhotoFrames(nextFrames)

    if (replacingIndex !== null) {
      setAnimationOverlay({
        mode: captureAnimation,
        title: 'Foto reemplazada',
        text: `Actualizando foto ${replacingIndex + 1}`,
        videoUrl: getAnimationStageVideoUrl('processing'),
      })
      setCaptureStatus(`Foto ${replacingIndex + 1} reemplazada. Armando resultado final...`)
      const output = await composeFinalPhoto(nextFrames)
      setFinalPhotoUrl(output)
      setRetakeFrameIndex(null)
      setAnimationOverlay(null)
      countdownRef.current = null
      setCaptureStatus(`Foto ${replacingIndex + 1} actualizada en el resultado final.`)
      setShowCapturePhotoScreen(false)
      setShowPreviewScreen(true)
      setShowShareScreen(false)
      return
    }

    if (nextFrames.length < selectedShotCount) {
      setAnimationOverlay({
        mode: captureAnimation,
        title: 'Foto guardada',
        text: `Efecto entre fotos ${nextFrames.length} de ${selectedShotCount}`,
        stage: 'afterCapture',
        videoUrl: getAnimationStageVideoUrl('afterCapture'),
      })
      setCaptureStatus(`Foto ${nextFrames.length} de ${selectedShotCount} guardada. Efecto entre fotos activo.`)
      await wait(photoReviewSeconds * 1000)
      setAnimationOverlay(null)
      countdownRef.current = null
      setCaptureIntroActive(true)
      setCaptureStatus(`Foto ${nextFrames.length} guardada. Oprime para tomar la siguiente.`)
      return
    }

    setAnimationOverlay({
      mode: captureAnimation,
      title: 'Listo',
      text: 'Armando recuerdo final',
      videoUrl: getAnimationStageVideoUrl('processing'),
    })
    setCaptureStatus('Armando foto final...')
    const output = await composeFinalPhoto(nextFrames)
    setFinalPhotoUrl(output)
    setAnimationOverlay(null)
    countdownRef.current = null
    setCaptureStatus(`${selectedType.name} listo para compartir o imprimir.`)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(true)
    setShowShareScreen(false)
  }

  const resetPhoto = () => {
    setPhotoFrames([])
    setFinalPhotoUrl('')
    setRetakeFrameIndex(null)
    setCountdown('')
    setCaptureIntroActive(true)
    setCaptureStatus(`${selectedType.name}: listo para tomar fotos`)
  }

  const chooseType = (type) => {
    setSelectedType(type)
    setPhotoFrames([])
    setFinalPhotoUrl('')
    setRetakeFrameIndex(null)
    setAnimationVideoPromptAnswered(false)
    setAnimationVideoQuestionMode('question')
    if (type.id === 'personalizar-5x15') {
      setShowCustomPhotoLayoutScreen(true)
      setCustomPhotoOrder((current) => normalizeCustomPhotoOrder(current, customPhotoCount))
      setCustomPhotoLayout((current) => normalizeCustomPhotoLayout(current, customPhotoCount))
      setSelectedCustomLayoutPhoto(1)
      setCaptureStatus(customPhotoCount ? `${type.name}: ${customPhotoCount} recuadro${customPhotoCount === 1 ? '' : 's'} manual${customPhotoCount === 1 ? '' : 'es'}.` : 'Personalizar: agrega fotos manualmente sobre el fondo.')
      return
    }
    setShowCustomPhotoLayoutScreen(false)
    setCaptureStatus(`${type.name}: toma ${type.shots} foto${type.shots === 1 ? '' : 's'}`)
  }

  const updateCustomPhotoCount = (nextCount) => {
    const boundedCount = Math.min(Math.max(Math.round(Number(nextCount) || 0), 0), customPhotoMaxSlots)
    setCustomPhotoCount(boundedCount)
    setCustomPhotoOrder((current) => normalizeCustomPhotoOrder(current, boundedCount))
    setCustomPhotoLayout((current) => normalizeCustomPhotoLayout(current, boundedCount))
    setSelectedCustomLayoutPhoto((current) => Math.min(current, Math.max(boundedCount, 1)))
    setPhotoFrames([])
    setFinalPhotoUrl('')
    setRetakeFrameIndex(null)
    setCaptureStatus(`Personalizar: ${boundedCount} recuadro${boundedCount === 1 ? '' : 's'} manual${boundedCount === 1 ? '' : 'es'}.`)
  }

  const addCustomLayoutPhoto = (sourceSlot = null) => {
    const currentSlots = customLayoutSlots
    if (currentSlots.length >= customPhotoMaxSlots) {
      setCaptureStatus(`Máximo ${customPhotoMaxSlots} recuadros por diseño.`)
      return
    }
    const nextPhotoNumber = currentSlots.length + 1
    const nextSlot = createManualCustomPhotoSlot(nextPhotoNumber, currentSlots.length, sourceSlot)
    const nextSlots = normalizeCustomPhotoLayout([...currentSlots, nextSlot], nextPhotoNumber)
    setCustomPhotoCount(nextSlots.length)
    setCustomPhotoOrder(normalizeCustomPhotoOrder([], nextSlots.length))
    setCustomPhotoLayout(nextSlots)
    setSelectedCustomLayoutPhoto(nextPhotoNumber)
    setPhotoFrames([])
    setFinalPhotoUrl('')
    setRetakeFrameIndex(null)
    setCaptureStatus(`Recuadro ${nextPhotoNumber} agregado. Muévelo y agrándalo manualmente.`)
  }

  const duplicateCustomLayoutPhoto = () => {
    const sourceSlot = customLayoutSlots.find((item) => item.photoNumber === selectedCustomLayoutPhoto) || customLayoutSlots[customLayoutSlots.length - 1]
    if (!sourceSlot) {
      addCustomLayoutPhoto()
      return
    }
    addCustomLayoutPhoto(sourceSlot)
  }

  const deleteCustomLayoutPhoto = () => {
    if (!customLayoutSlots.length) return
    const nextSlots = customLayoutSlots
      .filter((slot) => slot.photoNumber !== selectedCustomLayoutPhoto)
      .map((slot, index) => ({ ...slot, photoNumber: index + 1 }))
    setCustomPhotoCount(nextSlots.length)
    setCustomPhotoOrder(normalizeCustomPhotoOrder([], nextSlots.length))
    setCustomPhotoLayout(normalizeCustomPhotoLayout(nextSlots, nextSlots.length))
    setSelectedCustomLayoutPhoto(Math.min(selectedCustomLayoutPhoto, Math.max(nextSlots.length, 1)))
    setPhotoFrames([])
    setFinalPhotoUrl('')
    setRetakeFrameIndex(null)
    setCaptureStatus(nextSlots.length ? 'Recuadro borrado. El fondo sigue editable.' : 'Fondo limpio. Agrega una foto para crear el primer recuadro.')
  }

  const beginCustomLayoutPointer = (photoNumber, mode, event) => {
    const nativeEvent = event?.nativeEvent || event
    const touch = nativeEvent?.touches?.[0] || nativeEvent?.changedTouches?.[0]
    const startX = touch?.clientX ?? nativeEvent?.clientX ?? nativeEvent?.pageX
    const startY = touch?.clientY ?? nativeEvent?.clientY ?? nativeEvent?.pageY
    const rect = customEditorStripRef.current?.getBoundingClientRect?.()
    const slot = customLayoutSlots.find((item) => item.photoNumber === photoNumber)
    if (!rect || !slot || !Number.isFinite(startX) || !Number.isFinite(startY)) return

    event?.preventDefault?.()
    event?.stopPropagation?.()
    nativeEvent.preventDefault?.()
    nativeEvent.stopPropagation?.()
    setSelectedCustomLayoutPhoto(photoNumber)
    customLayoutPointerRef.current = {
      mode,
      photoNumber,
      rect,
      slot,
      startX,
      startY,
    }
  }

  const nudgeCustomLayoutPhoto = (photoNumber, axis, amount) => {
    if (!customLayoutSlots.length) return
    setSelectedCustomLayoutPhoto(photoNumber)
    setCustomPhotoLayout((current) =>
      normalizeCustomPhotoLayout(current, customPhotoCount).map((slot) => {
        if (slot.photoNumber !== photoNumber) return slot
        if (axis === 'x') return { ...slot, x: clampNumber(slot.x + amount, 0, 100 - slot.width) }
        if (axis === 'y') return { ...slot, y: clampNumber(slot.y + amount, 0, 100 - slot.height) }
        if (axis === 'width') return { ...slot, width: clampNumber(slot.width + amount, 18, 100 - slot.x) }
        return { ...slot, height: clampNumber(slot.height + amount, 7, 100 - slot.y) }
      }),
    )
    setPhotoFrames([])
    setFinalPhotoUrl('')
    setRetakeFrameIndex(null)
  }

  const resetCustomPhotoLayout = () => {
    setCustomPhotoCount(0)
    setCustomPhotoOrder([])
    setCustomPhotoLayout([])
    setSelectedCustomLayoutPhoto(1)
    setPhotoFrames([])
    setFinalPhotoUrl('')
    setRetakeFrameIndex(null)
    setCaptureStatus('Fondo limpio. Agrega fotos manualmente.')
  }

  const chooseTemplate = (template) => {
    setSelectedTemplate(template)
    if (overlayImageUrl) {
      URL.revokeObjectURL(overlayImageUrl)
      setOverlayImageUrl('')
      setOverlayFileName('')
    }
    resetPhoto()
  }

  const chooseEventType = (type) => {
    const nextTemplate = getTemplatesForEventType(type)[0]
    setEventType(type)
    if (nextTemplate) chooseTemplate(nextTemplate)
    setCaptureStatus(`${type}: paquete básico de 5 plantillas cargado.`)
  }

  const cycleTemplateForCurrentEvent = () => {
    const options = getTemplatesForEventType(eventType)
    const currentIndex = options.findIndex((item) => item.id === selectedTemplate.id)
    const nextTemplate = options[(currentIndex + 1) % options.length] || options[0] || selectedTemplate
    chooseTemplate(nextTemplate)
    return nextTemplate
  }

  const handleOverlayFile = (event) => {
    const file = event?.target?.files?.[0]
    if (!file) return
    if (overlayImageUrl) URL.revokeObjectURL(overlayImageUrl)
    setOverlayImageUrl(URL.createObjectURL(file))
    setOverlayFileName(file.name)
    resetPhoto()
    setCaptureStatus(`${file.name} cargado como marco del espejo mágico`)
  }

  const handleGifOverlayFile = (event) => {
    const file = event?.target?.files?.[0]
    if (!file) return
    if (gifOverlayUrl) URL.revokeObjectURL(gifOverlayUrl)
    setGifOverlayUrl(URL.createObjectURL(file))
    setGifOverlayFileName(file.name)
    setCaptureStatus(`${file.name} cargado como GIF o imagen para superponer.`)
  }

  const cycleGifOverlaySize = () => {
    const currentIndex = gifOverlaySizes.indexOf(gifOverlaySize)
    const nextSize = gifOverlaySizes[(currentIndex + 1) % gifOverlaySizes.length] || gifOverlaySizes[0]
    setGifOverlaySize(nextSize)
    setCaptureStatus(`Tamaño de GIF cambiado a ${nextSize}.`)
  }

  const renderRangeSlider = ({ value, min, max, step = 1, onChange, statusText }) => (
    <View style={styles.realSliderWrap}>
      <View style={[styles.sliderFillStatic, { width: `${((value - min) / (max - min)) * 100}%` }]} />
      {React.createElement('input', {
        type: 'range',
        min,
        max,
        step,
        value,
        onInput: (event) => {
          const nextValue = Number(event.target.value)
          onChange(nextValue)
          if (statusText) setCaptureStatus(statusText(nextValue))
        },
        onChange: (event) => {
          const nextValue = Number(event.target.value)
          onChange(nextValue)
          if (statusText) setCaptureStatus(statusText(nextValue))
        },
        style: {
          width: '100%',
          height: 34,
          margin: 0,
          background: 'transparent',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 2,
        },
      })}
    </View>
  )

  const setSessionCountdown = (value) => {
    setPhotoCountdownFirst(value)
    setPhotoCountdownNext(value)
  }

  const applyCapturePreset = (preset) => {
    setActivePreset(preset)
    if (preset === 'Suave') {
      setPhotoCountdownFirst(5)
      setPhotoCountdownNext(5)
      setPhotoReviewSeconds(3)
      setQualityMode('Media')
      setFlashBeforePhoto(false)
    }
    if (preset === 'Rápido') {
      setPhotoCountdownFirst(3)
      setPhotoCountdownNext(2)
      setPhotoReviewSeconds(1)
      setQualityMode('Alta')
      setFlashBeforePhoto(true)
    }
    if (preset === 'Fiesta') {
      setPhotoCountdownFirst(5)
      setPhotoCountdownNext(4)
      setPhotoReviewSeconds(2)
      setQualityMode('Alta')
      setFlashBeforePhoto(true)
    }
    if (preset === 'Evento') {
      setPhotoCountdownFirst(6)
      setPhotoCountdownNext(5)
      setPhotoReviewSeconds(2)
      setQualityMode('Superior')
      setFlashBeforePhoto(true)
    }
    setCaptureStatus(`Preset ${preset} aplicado a los controles reales de captura.`)
  }

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  const executePrint = () => {
    if (!captureComplete || typeof window === 'undefined') return

    const imageCopies = Array.from({ length: normalizedPrintSettings.copies }, (_, index) => (
      `<img src="${finalPhotoUrl}" alt="Foto Viralco ${index + 1}" />`
    )).join('')
    const printFit = normalizedPrintSettings.fit === 'Rellenar' ? 'cover' : 'contain'
    const printableWidth = `calc(${normalizedPrintSettings.widthCm}cm - ${normalizedPrintSettings.marginCm * 2}cm)`
    const printableHeight = `calc(${normalizedPrintSettings.heightCm}cm - ${normalizedPrintSettings.marginCm * 2}cm)`
    const printGridColumns = normalizedPrintSettings.twoPerPage ? '1fr 1fr' : '1fr'
    const printImageWidth = normalizedPrintSettings.twoPerPage ? `calc((${printableWidth} - 0.2cm) / 2)` : printableWidth
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setCaptureStatus('El navegador bloqueó la ventana de impresión.')
      return
    }
    printWindow.document.open()
    printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(eventTitle)} - Viralco</title>
    <style>
      body { margin: 0; background: #f3f4f6; font-family: Arial, sans-serif; }
      main { min-height: 100vh; display: grid; place-items: center; gap: 24px; padding: 24px; }
      img { max-width: min(92vw, 760px); max-height: 92vh; background: #111827; box-shadow: 0 20px 60px rgba(0,0,0,.18); }
      @page { size: ${normalizedPrintSettings.widthCm}cm ${normalizedPrintSettings.heightCm}cm; margin: ${normalizedPrintSettings.marginCm}cm; }
      @media print {
        body { background: #fff; }
        main { width: ${printableWidth}; min-height: 0; padding: 0; display: grid; grid-template-columns: ${printGridColumns}; gap: 0.2cm; align-items: center; justify-items: center; }
        img { width: ${printImageWidth}; height: ${printableHeight}; max-width: none; max-height: none; object-fit: ${printFit}; box-shadow: none; break-inside: avoid; display: block; }
        ${normalizedPrintSettings.twoPerPage ? 'img:nth-child(2n) { page-break-after: always; break-after: page; } img:last-child { page-break-after: auto; break-after: auto; }' : 'img { page-break-after: always; break-after: page; } img:last-child { page-break-after: auto; break-after: auto; }'}
      }
    </style>
  </head>
  <body>
    <main>${imageCopies}</main>
    <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250))</script>
  </body>
</html>`)
    printWindow.document.close()
    setShowPrintOptions(false)
    setCaptureStatus(`Impresión lista en papel ${printSizeLabel}, ${normalizedPrintSettings.copies} copia${normalizedPrintSettings.copies === 1 ? '' : 's'}${normalizedPrintSettings.secondaryPrinter ? ' usando impresora secundaria' : ''}.`)
  }

  const runTool = (tool) => {
    if (!captureComplete) {
      setCaptureStatus('Primero toma la foto final.')
      return
    }

    if (tool === 'WhatsApp' && typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encodedShareText}`, '_blank', 'noopener,noreferrer')
    }

    if (tool === 'QR') {
      setShowQrOptions(true)
      setCaptureStatus('QR listo para que el cliente lo escanee.')
      return
    }

    if (tool === 'Imprimir') {
      setShowQrOptions(false)
      setShowPrintOptions(true)
      setCaptureStatus('Elige cuántas copias quieres imprimir.')
      return
    }

    setCaptureStatus(`${tool} listo para ${eventTitle}.`)
  }

  const openStartEditor = () => {
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    setShowStartEditor(true)
    setCaptureStatus('Personaliza la pantalla de inicio para los invitados')
  }

  const openPhotoDesignScreen = () => {
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    setShowPhotoDesignScreen(true)
    setCaptureStatus('Ajusta el diseño de foto antes de capturar')
  }

  const openCaptureModeScreen = () => {
    setShowHomeLauncher(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    setShowCaptureModeScreen(true)
    setCaptureStatus('Modo Foto habilitado para el espejo mágico')
  }

  const openCaptureConfigScreen = (fromOperator = false) => {
    const keepOperatorMode = fromOperator || operatorSettingsActive
    setOperatorSettingsActive(keepOperatorMode)
    setShowHomeLauncher(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowBackgroundRemovalScreen(false)
    setShowPrintConfigScreen(false)
    setShowCaptureConfigScreen(true)
    setCaptureStatus('Configuración de captura lista para fotos')
  }

  const openPrintConfigScreen = (fromOperator = false) => {
    const keepOperatorMode = fromOperator || operatorSettingsActive
    setOperatorSettingsActive(keepOperatorMode)
    setShowHomeLauncher(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(true)
    setShowBackgroundRemovalScreen(false)
    setCaptureStatus(`Configuración de impresión lista para papel ${printSizeLabel}.`)
  }

  const openBackgroundRemovalScreen = () => {
    setShowHomeLauncher(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(true)
    setCaptureStatus('Eliminación de fondo lista para fotos')
  }

  const openEventOptionsScreen = (fromOperator = false) => {
    const keepOperatorMode = fromOperator || operatorSettingsActive
    setOperatorSettingsActive(keepOperatorMode)
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(true)
    setShowAnimationVideoScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    setCaptureStatus('Configura tipo de foto, efectos y marcos.')
  }

  const openCapturePhotoScreen = () => {
    if (selectedType.id === 'personalizar-5x15' && customPhotoCount < 1) {
      setShowCustomPhotoLayoutScreen(true)
      setCaptureStatus('Agrega al menos un recuadro de foto antes de capturar.')
      return
    }
    setRetakeFrameIndex(null)
    setOperatorSettingsActive(false)
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowCapturePhotoScreen(true)
    setCaptureIntroActive(true)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    setCaptureStatus(`${selectedType.name}: listo para tomar fotos`)
    openCamera()
  }

  const closeOperatorSettingsToCapture = () => {
    setOperatorSettingsActive(false)
    setShowOperatorMenu(false)
    setOperatorQuickPanel(null)
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowCapturePhotoScreen(true)
    setCaptureIntroActive(true)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    setCountdown('')
    setCaptureStatus(`${selectedType.name}: listo para tomar fotos`)
    if (!cameraStream) openCamera()
  }

  const openOperatorQuickPanel = (panel) => {
    setShowOperatorMenu(false)
    setOperatorSettingsActive(false)
    setOperatorQuickPanel(panel)
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowCapturePhotoScreen(true)
    setCaptureIntroActive(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    setCountdown('')
    if (!cameraStream) openCamera()
  }

  const runOperatorAction = (action, opensSettings = false) => {
    setShowOperatorMenu(false)
    setOperatorSettingsActive(opensSettings)
    action(opensSettings)
  }

  const startRetakeFrame = (index) => {
    if (!photoFrames[index]) return
    setRetakeFrameIndex(index)
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowCapturePhotoScreen(true)
    setCaptureIntroActive(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    setCountdown('')
    setCaptureStatus(`Vuelve a tomar la foto ${index + 1}. Las otras fotos se conservan.`)
    openCamera()
  }

  const openAnimationVideoScreen = () => {
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(true)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    setAnimationVideoQuestionMode('question')
    setCaptureStatus('Pregunta de video de animación antes de tomar fotos.')
  }

  const continueAfterAnimationVideo = () => {
    setAnimationVideoPromptAnswered(true)
    openCapturePhotoScreen()
  }

  const personalizeAnimationVideo = () => {
    setAnimationVideoQuestionMode('customize')
    setAnimationVideoPromptAnswered(true)
    setCaptureStatus('Personaliza el video de animación antes de tomar fotos.')
  }

  const handleAnimationVideoFile = (event) => {
    const file = event?.target?.files?.[0]
    if (!file) return
    if (animationVideoUrl) URL.revokeObjectURL(animationVideoUrl)
    setAnimationVideoUrl(URL.createObjectURL(file))
    setAnimationVideoFileName(file.name)
    setAnimationVideoPromptAnswered(true)
    setCaptureStatus(`${file.name} cargado como video de animación.`)
  }

  const handleAnimationStageVideoFile = (stageId, event) => {
    const file = event?.target?.files?.[0]
    if (!file) return
    const previousUrl = animationStageVideos[stageId]?.url
    if (previousUrl && !animationStageVideos[stageId]?.isExample) URL.revokeObjectURL(previousUrl)
    setAnimationStageVideos((current) => ({
      ...current,
      [stageId]: {
        fileName: file.name,
        url: URL.createObjectURL(file),
        isExample: false,
      },
    }))
    if (stageId === 'start') {
      setAnimationVideoPromptAnswered(true)
      setAnimationVideoFileName(file.name)
    }
    setCaptureStatus(`${file.name} cargado para ${animationVideoStages.find((stage) => stage.id === stageId)?.title || 'video de animación'}.`)
  }

  const selectExampleStageVideo = (stageId, video) => {
    const previousUrl = animationStageVideos[stageId]?.url
    if (previousUrl && !animationStageVideos[stageId]?.isExample) URL.revokeObjectURL(previousUrl)
    setAnimationStageVideos((current) => ({
      ...current,
      [stageId]: video,
    }))
    if (stageId === 'start') {
      setAnimationVideoPromptAnswered(true)
      setAnimationVideoFileName(video.fileName)
    }
    setCaptureStatus(`${video.fileName} seleccionado como video de ejemplo.`)
  }

  const clearAnimationStageVideo = (stageId) => {
    const previousUrl = animationStageVideos[stageId]?.url
    if (previousUrl && !animationStageVideos[stageId]?.isExample) URL.revokeObjectURL(previousUrl)
    setAnimationStageVideos((current) => {
      const next = { ...current }
      delete next[stageId]
      return next
    })
    setCaptureStatus('Video de animación quitado.')
  }

  const getAnimationStageVideo = (stageId) => {
    const stage = animationVideoStages.find((item) => item.id === stageId)
    return animationStageVideos[stageId] || stage?.defaultVideo || stage?.exampleVideos?.[0] || null
  }

  const getAnimationStageVideoUrl = (stageId) => getAnimationStageVideo(stageId)?.url || animationVideoUrl

  const toggleAnimationStageRandom = (stageId) => {
    setAnimationStageRandom((current) => ({ ...current, [stageId]: !current[stageId] }))
  }

  const handleContinueToCapture = () => {
    if (selectedType.id === 'personalizar-5x15' && customPhotoCount < 1) {
      setShowCustomPhotoLayoutScreen(true)
      setCaptureStatus('Agrega al menos un recuadro de foto antes de capturar.')
      return
    }

    if (selectedType.id === 'personalizar-5x15' && !animationVideoPromptAnswered) {
      openAnimationVideoScreen()
      return
    }

    openCapturePhotoScreen()
  }

  const openPreviewScreen = () => {
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(true)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    setCaptureStatus(captureComplete ? 'Preview listo para revisar.' : 'Toma una foto para generar el preview.')
  }

  const openShareScreen = () => {
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(true)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    setCaptureStatus(captureComplete ? 'Elige cómo compartir o imprimir.' : 'Primero confirma el preview.')
  }

  const handleEditorTool = (toolId) => {
    setActiveEditorTool(toolId)

    if (toolId === 'diseno') {
      openPhotoDesignScreen()
      return
    }

    if (toolId === 'imagen') {
      const nextTemplate = cycleTemplateForCurrentEvent()
      setCaptureStatus(`Imagen de inicio cambiada a ${nextTemplate.name}.`)
      return
    }

    if (toolId === 'texto') {
      setEventName((current) => (current.trim() ? current : 'Evento Viralco'))
      setCaptureStatus('Texto de bienvenida actualizado en la vista del invitado.')
      return
    }

    if (toolId === 'tema') {
      const nextFilter = filters[(filters.indexOf(selectedFilter) + 1) % filters.length]
      setSelectedFilter(nextFilter)
      resetPhoto()
      setCaptureStatus(`Tema visual cambiado a ${nextFilter}.`)
      return
    }

    if (toolId === 'colores') {
      const nextTemplate = cycleTemplateForCurrentEvent()
      setCaptureStatus(`Color principal actualizado con ${nextTemplate.name}.`)
      return
    }

    if (toolId === 'fondo') {
      openBackgroundRemovalScreen()
    }
  }

  const handleDesignTool = (toolId) => {
    setActiveDesignTool(toolId)

    if (toolId === 'cabina') {
      chooseType(photoTypes.find((item) => item.id === 'digital') || photoTypes[0])
      setCaptureStatus('Foto de la cabina aplicada al layout.')
      return
    }

    if (toolId === 'texto') {
      setEventName((current) => (current.trim() ? current : 'Evento Viralco'))
      setCaptureStatus('Texto agregado al diseño de foto.')
      return
    }

    if (toolId === 'imagen') {
      const nextTemplate = cycleTemplateForCurrentEvent()
      setCaptureStatus(`Imagen decorativa cambiada a ${nextTemplate.name}.`)
      return
    }

    if (toolId === 'datos') {
      setCaptureStatus('Datos del invitado activados para nombre y teléfono.')
      return
    }

    if (toolId === 'impresion' || toolId === 'diseno') {
      if (toolId === 'impresion') {
        chooseType(photoTypes.find((item) => item.id === 'personalizar-5x15') || selectedType)
        setPrintSettings((current) => ({ ...current, ...defaultPrintSettings }))
        openPrintConfigScreen()
        return
      }
      setCaptureStatus(`Diseño de impresión listo para papel ${printSizeLabel}.`)
      return
    }

    if (toolId === 'preset') {
      setActivePreset((current) => (current === 'Fiesta' ? 'Evento' : 'Fiesta'))
      setCaptureStatus('Preset aplicado al diseño actual.')
      return
    }

    if (toolId === 'reciente') {
      if (selectedRecentEvent) applyEventSetup(selectedRecentEvent, 'reciente aplicado al diseño')
      return
    }

    if (toolId === 'importar') {
      setCaptureStatus('Importar listo: usa Marco personalizado para cargar un PNG/JPG.')
      return
    }

    if (toolId === 'exportar') {
      runTool('Imprimir')
    }
  }

  const applyPrintPreset = (preset) => {
    setPrintSettings((current) => ({
      ...current,
      presetId: preset.id,
      widthCm: preset.width,
      heightCm: preset.height,
      marginCm: preset.margin,
    }))
    setCaptureStatus(`Medida de impresora seleccionada: ${preset.label} (${preset.sizeText}).`)
  }

  const updatePrintSetting = (key, value) => {
    setPrintSettings((current) => ({
      ...current,
      presetId: key === 'widthCm' || key === 'heightCm' || key === 'marginCm' ? 'manual' : current.presetId,
      [key]: value,
    }))
  }

  const renderPrintSettingsMenu = (compact = false) => (
    <View style={[styles.printSettingsPanel, compact && styles.printSettingsPanelCompact]}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelEyebrow}>Impresora</Text>
          <Text style={styles.panelTitle}>Configuración de impresión</Text>
        </View>
        <View style={styles.printSizeBadge}>
          <Text style={styles.printSizeBadgeText}>{printSizeLabel}</Text>
        </View>
      </View>

      <View style={styles.printReferenceRow}>
        <View style={styles.printPaperSelector}>
          <Text style={styles.printPaperSelectorText}>{activePrintLabel}</Text>
          <Text style={styles.printPaperSelectorArrow}>⌄</Text>
        </View>
        <View style={styles.printOrientationSwitch}>
          {['Vertical', 'Horizontal'].map((option) => (
            <Pressable
              key={option}
              accessibilityLabel={`Impresión ${option}`}
              onPress={() => updatePrintSetting('orientation', option)}
              style={[styles.printOrientationButton, printSettings.orientation === option && styles.printOrientationButtonActive]}
            >
              <View style={[
                styles.printOrientationIcon,
                option === 'Horizontal' && styles.printOrientationIconHorizontal,
                printSettings.orientation === option && styles.printOrientationIconActive,
              ]} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.printPresetGrid}>
        {printPaperPresets.map((preset) => {
          const active = printSettings.presetId === preset.id
          return (
            <Pressable
              key={preset.id}
              onPress={() => applyPrintPreset(preset)}
              style={[styles.printPresetCard, active && styles.printPresetCardActive]}
            >
              <Text style={[styles.printPresetTitle, active && styles.printPresetTitleActive]}>
                {preset.label}
              </Text>
              <Text style={styles.printPresetSize}>{preset.sizeText}</Text>
              <Text style={styles.printPresetText}>{preset.note}</Text>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.printMeasurePanel}>
        <View style={styles.printMeasureHeader}>
          <Text style={styles.printMeasureTitle}>Medidas de impresora</Text>
          <Text style={styles.printMeasureBadge}>{normalizedPrintSettings.dpi} DPI</Text>
        </View>
        <View style={styles.printMeasureGrid}>
          <View style={styles.printMeasureCard}>
            <Text style={styles.printMeasureLabel}>Papel</Text>
            <Text style={styles.printMeasureValue}>{printSizeLabel}</Text>
            <Text style={styles.printMeasureMeta}>
              {normalizedPrintSettings.widthIn.toFixed(2)} x {normalizedPrintSettings.heightIn.toFixed(2)} pulgadas
            </Text>
          </View>
          <View style={styles.printMeasureCard}>
            <Text style={styles.printMeasureLabel}>Archivo recomendado</Text>
            <Text style={styles.printMeasureValue}>{normalizedPrintSettings.outputWidthPx} x {normalizedPrintSettings.outputHeightPx} px</Text>
            <Text style={styles.printMeasureMeta}>Según el DPI seleccionado</Text>
          </View>
          <View style={styles.printMeasureCard}>
            <Text style={styles.printMeasureLabel}>Área útil</Text>
            <Text style={styles.printMeasureValue}>
              {normalizedPrintSettings.printableWidthCm.toFixed(1)} x {normalizedPrintSettings.printableHeightCm.toFixed(1)} cm
            </Text>
            <Text style={styles.printMeasureMeta}>Descontando margen/sangrado</Text>
          </View>
          <View style={styles.printMeasureCard}>
            <Text style={styles.printMeasureLabel}>Corte 5x15</Text>
            <Text style={styles.printMeasureValue}>{normalizedPrintSettings.stripWidthCm.toFixed(1)} x {normalizedPrintSettings.heightCm} cm</Text>
            <Text style={styles.printMeasureMeta}>Dos tiras lado a lado en 10x15</Text>
          </View>
        </View>
      </View>

      <View style={styles.printPixelRow}>
        <Text style={styles.printPixelText}>W {normalizedPrintSettings.outputWidthPx} px</Text>
        <Text style={styles.printPixelText}>H {normalizedPrintSettings.outputHeightPx} px</Text>
      </View>

      <View style={styles.printInputGrid}>
        {[
          { key: 'widthCm', label: 'Ancho cm', value: printSettings.widthCm },
          { key: 'heightCm', label: 'Alto cm', value: printSettings.heightCm },
          { key: 'marginCm', label: 'Margen cm', value: printSettings.marginCm },
          { key: 'copies', label: 'Copias', value: printSettings.copies },
        ].map((field) => (
          <View key={field.key} style={styles.printInputWrap}>
            <Text style={styles.printInputLabel}>{field.label}</Text>
            <TextInput
              value={field.value}
              onChangeText={(value) => updatePrintSetting(field.key, value)}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#9ca3af"
              style={styles.printInput}
            />
          </View>
        ))}
      </View>

      <View style={styles.printOptionRow}>
        <View style={styles.printSegment}>
          {['Vertical', 'Horizontal'].map((option) => (
            <Pressable
              key={option}
              onPress={() => updatePrintSetting('orientation', option)}
              style={[styles.printSegmentOption, printSettings.orientation === option && styles.printSegmentOptionActive]}
            >
              <Text style={[styles.printSegmentText, printSettings.orientation === option && styles.printSegmentTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.printSegment}>
          {['Ajustar', 'Rellenar'].map((option) => (
            <Pressable
              key={option}
              onPress={() => updatePrintSetting('fit', option)}
              style={[styles.printSegmentOption, printSettings.fit === option && styles.printSegmentOptionActive]}
            >
              <Text style={[styles.printSegmentText, printSettings.fit === option && styles.printSegmentTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.printDpiRow}>
        <Text style={styles.printInputLabel}>Resolución impresora</Text>
        <View style={styles.printSegment}>
          {printDpiOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => updatePrintSetting('dpi', option)}
              style={[styles.printSegmentOption, normalizedPrintSettings.dpi === option && styles.printSegmentOptionActive]}
            >
              <Text style={[styles.printSegmentText, normalizedPrintSettings.dpi === option && styles.printSegmentTextActive]}>{option} DPI</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.printToggleStack}>
        <Pressable
          onPress={() => {
            updatePrintSetting('twoPerPage', !printSettings.twoPerPage)
            setCaptureStatus(`Imprimir 2 por página ${printSettings.twoPerPage ? 'desactivado' : 'activado'}.`)
          }}
          style={styles.checkRow}
        >
          <View style={[styles.checkBox, !printSettings.twoPerPage && styles.checkBoxOff]}>
            <Text style={styles.checkMark}>{printSettings.twoPerPage ? '✓' : ''}</Text>
          </View>
          <View style={styles.checkCopy}>
            <Text style={styles.checkTitle}>Imprimir 2 por página</Text>
            <Text style={styles.checkText}>Agrupa dos copias en la misma hoja al imprimir.</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            updatePrintSetting('secondaryPrinter', !printSettings.secondaryPrinter)
            setCaptureStatus(`Impresora secundaria ${printSettings.secondaryPrinter ? 'desactivada' : 'activada'}.`)
          }}
          style={styles.checkRow}
        >
          <View style={[styles.checkBox, !printSettings.secondaryPrinter && styles.checkBoxOff]}>
            <Text style={styles.checkMark}>{printSettings.secondaryPrinter ? '✓' : ''}</Text>
          </View>
          <View style={styles.checkCopy}>
            <Text style={styles.checkTitle}>Imprimir a la Impresora Secundaria</Text>
            <Text style={styles.checkText}>Marca esta salida para usar la impresora secundaria configurada.</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setCaptureStatus(`Impresoras listas: ${printSettings.secondaryPrinter ? 'secundaria activa' : 'principal activa'}.`)}
        >
          <Text style={styles.previewConfigLink}>Configurar impresoras ›</Text>
        </Pressable>
      </View>

      <Text style={styles.printSettingsHint}>
        La ventana de impresión se abrirá con {printSizeLabel}, margen {normalizedPrintSettings.marginCm} cm, {normalizedPrintSettings.copies} copia{normalizedPrintSettings.copies === 1 ? '' : 's'} y {normalizedPrintSettings.twoPerPage ? '2 por página' : '1 por página'}.
      </Text>
    </View>
  )

  const changePrintCopies = (delta) => {
    const nextCopies = Math.min(Math.max(normalizedPrintSettings.copies + delta, 1), 20)
    updatePrintSetting('copies', String(nextCopies))
    setCaptureStatus(`${nextCopies} copia${nextCopies === 1 ? '' : 's'} seleccionada${nextCopies === 1 ? '' : 's'} para imprimir.`)
  }

  const renderPrintOptionsModal = () => (
    <View style={styles.printOptionsOverlay}>
      {finalPhotoUrl ? <Image source={{ uri: finalPhotoUrl }} style={styles.printOptionsBackdropImage} accessibilityLabel="Foto final lista para imprimir" /> : null}
      <View style={styles.printOptionsShade} />
      <Pressable onPress={() => setShowPrintOptions(false)} style={styles.printOptionsClose}>
        <Text style={styles.printOptionsCloseText}>×</Text>
      </Pressable>
      <View style={styles.printOptionsCard}>
        <Text style={styles.printOptionsTitle}>¿Cuántas copias?</Text>
        <View style={styles.printCopiesControl}>
          <Pressable
            onPress={() => changePrintCopies(-1)}
            style={[styles.printCopiesButton, normalizedPrintSettings.copies <= 1 && styles.printCopiesButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Restar copia"
          >
            <Text style={styles.printCopiesButtonText}>−</Text>
          </Pressable>
          <Text style={styles.printCopiesNumber}>{normalizedPrintSettings.copies}</Text>
          <Pressable
            onPress={() => changePrintCopies(1)}
            style={[styles.printCopiesButton, normalizedPrintSettings.copies >= 20 && styles.printCopiesButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Agregar copia"
          >
            <Text style={styles.printCopiesButtonText}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.printCopiesLabel}>copias</Text>
        <Pressable onPress={executePrint} style={styles.printOptionsButton} accessibilityRole="button" accessibilityLabel="Imprimir copias seleccionadas">
          <Text style={styles.printOptionsButtonText}>Imprimir</Text>
        </Pressable>
        <Text style={styles.printOptionsMeta}>
          {activePrintLabel} · {printSizeLabel} · {normalizedPrintSettings.twoPerPage ? '2 por página' : '1 por página'}
        </Text>
      </View>
    </View>
  )

  const renderCreateEventModal = () => (
    <View style={styles.modalBackdrop}>
      <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
        <Pressable onPress={() => setShowCreateEventModal(false)} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </Pressable>
        <Text style={[styles.modalTitle, isMobile && styles.modalTitleMobile]}>Crear evento nuevo</Text>
        <Text style={[styles.modalQuestion, isMobile && styles.modalQuestionMobile]}>¿Cómo le gustaría llamarlo?</Text>
        <TextInput
          value={eventName}
          onChangeText={(value) => {
            setEventName(value)
            if (eventNameError && value.trim()) setEventNameError('')
            setCaptureStatus(value.trim() ? `${value.trim()} listo para configurar` : 'Escribe el nombre del evento')
          }}
          placeholder="Ingrese el nombre del evento"
          placeholderTextColor="#9ca3af"
          style={[styles.modalInput, isMobile && styles.modalInputMobile]}
          accessibilityLabel="Nombre del evento"
        />
        {eventNameError ? <Text style={styles.modalInputError}>{eventNameError}</Text> : null}
        <View style={[styles.modalTypeWrap, isMobile && styles.modalTypeWrapMobile]}>
          {eventTypes.map((type) => (
            <Pressable
              key={type}
              onPress={() => chooseEventType(type)}
              style={[styles.typeChip, isMobile && styles.typeChipMobile, eventType === type && styles.typeChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`Elegir evento ${type}`}
            >
              <Text style={[styles.typeChipText, isMobile && styles.typeChipTextMobile, eventType === type && styles.typeChipTextActive]}>{type}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={() => launchNewEventFromModal('options')}
          style={[styles.primaryButton, isMobile && styles.modalActionButtonMobile]}
          accessibilityRole="button"
          accessibilityLabel="Continuar a configurar evento"
        >
          <Text style={[styles.primaryButtonText, isMobile && styles.modalActionTextMobile]}>Continuar a configurar</Text>
        </Pressable>
        <View style={[styles.modalProductBox, isMobile && styles.modalProductBoxMobile]}>
          <View style={[styles.modalProductIcon, isMobile && styles.modalProductIconMobile]}>
            <Text style={[styles.modalProductIconText, isMobile && styles.modalProductIconTextMobile]}>▦</Text>
          </View>
          <View style={styles.modalProductCopy}>
            <Text style={[styles.modalProductTitle, isMobile && styles.modalProductTitleMobile]}>Producto activo: Espejo mágico</Text>
            <Text style={[styles.modalProductText, isMobile && styles.modalProductTextMobile]}>Solo fotos, marcos y formatos de entrega.</Text>
          </View>
        </View>
      </View>
    </View>
  )

  const renderRecentEventsLauncher = () => (
    <View style={styles.recentEventsPanel}>
      <View style={[styles.recentEventsHeader, isMobile && styles.recentEventsHeaderMobile]}>
        <View style={styles.recentEventsHeading}>
          <Text style={styles.panelTitle}>Lanzar evento</Text>
          <Text style={styles.recentEventsIntro}>
            Lanza el último evento guardado sin volverlo a configurar.
          </Text>
        </View>
      </View>

      <View style={styles.recentEventsGrid}>
        {recentEvents.length ? recentEvents.slice(0, 1).map((recentEvent) => {
          const type = photoTypes.find((item) => item.id === recentEvent.photoTypeId) || photoTypes[0]
          const recentEventTemplates = getTemplatesForEventType(recentEvent.eventType)
          const template =
            recentEventTemplates.find((item) => item.id === recentEvent.templateId) ||
            templates.find((item) => item.id === recentEvent.templateId) ||
            recentEventTemplates[0] ||
            templates[0]
          const active = (recentEvent.id || recentEvent.name) === (selectedRecentEvent?.id || selectedRecentEvent?.name)
          return (
            <Pressable
              key={recentEvent.id || recentEvent.name}
              onPress={() => {
                setSelectedRecentId(recentEvent.id || recentEvent.name)
                launchEvent(recentEvent)
              }}
              style={[styles.recentEventCard, active && styles.recentEventCardActive]}
              accessibilityRole="button"
              accessibilityLabel={`Lanzar ${recentEvent.name || 'último evento'}`}
            >
              <Image source={template.image} style={styles.recentEventImage} accessibilityLabel={`Plantilla de ${recentEvent.eventType || 'evento'}`} />
              <View style={styles.recentEventShade} />
              <View style={styles.recentEventContent}>
                <Text style={styles.recentEventMeta}>{recentEvent.updatedAt || 'Reciente'}</Text>
                <Text style={styles.recentEventTitle}>{recentEvent.name || 'Último evento'}</Text>
                <Text style={styles.recentEventDetails}>{recentEvent.eventType || 'Evento'} / {type.name}</Text>
                <View style={styles.launchRecentButton}>
                  <Text style={styles.launchRecentButtonText}>Lanzar evento</Text>
                </View>
              </View>
            </Pressable>
          )
        }) : (
          <View style={styles.recentEventEmpty}>
            <Text style={styles.recentEventEmptyTitle}>Sin eventos recientes</Text>
            <Text style={styles.recentEventEmptyText}>Crea un evento nuevo para dejarlo listo aquí.</Text>
          </View>
        )}
      </View>
    </View>
  )

  const renderHomeActionCard = () => {
    return (
      <View style={styles.homeActionCard}>
        <Pressable onPress={openNewEventModal} style={styles.homeCreateButton} accessibilityRole="button" accessibilityLabel="Crear evento nuevo">
          <Text style={styles.homeCreateButtonText}>+ Crear evento nuevo</Text>
        </Pressable>
      </View>
    )
  }

  const renderHomeLauncher = () => (
    <View style={styles.homeLauncherPage}>
      {React.createElement(
        'h1',
        {
          style: {
            margin: 0,
            color: colors.blue,
            fontSize: 18,
            lineHeight: '24px',
            fontWeight: 900,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 0,
          },
        },
        'Viralco',
      )}
      <Text style={styles.homeWelcome}>Espejo mágico</Text>
      <Text style={styles.homeWelcomeSub}>Eventos, fotos y entregas listas para imprimir o compartir</Text>
      {renderRecentEventsLauncher()}
      {renderHomeActionCard()}
    </View>
  )

  const renderEventOptionsScreen = () => (
    <View style={styles.eventOptionsPage}>
      <View style={[styles.eventOptionsHeader, isMobile && styles.eventOptionsHeaderMobile]}>
        <View style={styles.eventOptionsHeading}>
          <Text style={styles.panelEyebrow}>Evento nuevo</Text>
          <Text style={[styles.eventOptionsTitle, isMobile && styles.eventOptionsTitleMobile]}>{eventTitle}</Text>
          <Text style={styles.eventOptionsText}>
            Configura el tipo de foto, la plantilla, la captura y la impresión antes de abrir cámara.
          </Text>
        </View>
        <View style={styles.eventOptionsBadge}>
          <Text style={styles.eventOptionsBadgeText}>{eventType || defaultEventType}</Text>
        </View>
        {operatorSettingsActive ? (
          <Pressable onPress={closeOperatorSettingsToCapture} style={styles.operatorDoneButton} accessibilityRole="button" accessibilityLabel="Listo, volver a tomar fotos">
            <Text style={styles.operatorDoneButtonText}>Listo</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.eventOptionsBody}>
        <View style={styles.eventOptionsSection}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelEyebrow}>Configuración</Text>
              <Text style={styles.panelTitle}>Tipo de foto</Text>
            </View>
            <Text style={styles.nextShot}>{selectedType.name}</Text>
          </View>
          <View style={[styles.typeGrid, isMobile && styles.typeGridMobile]}>
            {photoTypes.map((type) => {
              const active = selectedType.id === type.id
              return (
                <Pressable
                  key={type.id}
                  onPress={() => chooseType(type)}
                  style={[styles.typeCard, isMobile && styles.typeCardMobile, active && styles.typeCardActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Elegir tipo de foto ${type.name}`}
                >
                  {renderTypePreview(type)}
                  <View style={styles.typeTitleRow}>
                    <Text style={[styles.typeTitle, active && styles.typeTitleActive]}>{type.name}</Text>
                    {type.sizeLabel ? <Text style={[styles.typeSizePill, active && styles.typeSizePillActive]}>{type.sizeLabel}</Text> : null}
                  </View>
                  <Text style={styles.typeNote}>{type.note}</Text>
                  {type.id === 'personalizar-5x15' && active ? (
                    <Text style={styles.typeConfigHint}>{customPhotoCount ? `${customPhotoCount} recuadro${customPhotoCount === 1 ? '' : 's'} manual${customPhotoCount === 1 ? '' : 'es'}` : 'Fondo vacío / agregar fotos'}</Text>
                  ) : null}
                </Pressable>
              )
            })}
          </View>
        </View>

        {selectedType.id === 'personalizar-5x15' ? (
          <View style={styles.eventOptionsSection}>
            <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelEyebrow}>Personalizar</Text>
              <Text style={styles.panelTitle}>Textos y animación</Text>
            </View>
              <Text style={styles.nextShot}>Texto normal</Text>
            </View>

            <View style={styles.photoTextQuickPanel}>
              <Pressable
                onPress={() => setShowCustomPhotoLayoutScreen(true)}
                style={styles.customOpenButton}
                accessibilityRole="button"
                accessibilityLabel="Abrir cantidad y orden de fotos"
              >
                <Text style={styles.customOpenTitle}>Layout manual</Text>
                <Text style={styles.customOpenMeta}>{customPhotoCount ? `${customPhotoCount} recuadro${customPhotoCount === 1 ? '' : 's'}` : 'Fondo vacío / agregar fotos'}</Text>
              </Pressable>
              <View style={styles.scriptPreviewBox}>
                <Text style={styles.normalPreviewName}>{getPhotoNameText()}</Text>
                {getPhotoEventText() ? <Text style={styles.normalPreviewDetail}>{getPhotoEventText()}</Text> : null}
                <Text style={styles.normalPreviewDate}>{getPhotoDateText()}</Text>
                <Text style={styles.scriptPreviewMeta}>Nombre, fecha y texto en letra normal.</Text>
              </View>
              <TextInput
                value={photoNameText}
                onChangeText={(value) => {
                  setPhotoNameText(value)
                  setCaptureStatus('Nombre de la foto actualizado.')
                }}
                placeholder={`Nombre (${eventTitle})`}
                placeholderTextColor="#9ca3af"
                style={styles.scriptInput}
              />
              <TextInput
                value={photoEventText}
                onChangeText={(value) => {
                  setPhotoEventText(value)
                  setCaptureStatus('Texto inferior de la foto actualizado.')
                }}
                placeholder="Texto inferior opcional"
                placeholderTextColor="#9ca3af"
                style={styles.scriptInput}
              />
              <TextInput
                value={photoDateText}
                onChangeText={(value) => {
                  setPhotoDateText(value)
                  setCaptureStatus('Fecha de la foto actualizada.')
                }}
                placeholder={`Fecha (${formatEventDate()})`}
                placeholderTextColor="#9ca3af"
                style={styles.scriptInput}
              />
              <TextInput
                value={photoScriptText}
                onChangeText={(value) => {
                  setPhotoScriptText(value)
                  setCaptureStatus('Frase superior de la foto actualizada.')
                }}
                placeholder="Frase superior de la tira"
                placeholderTextColor="#9ca3af"
                style={styles.scriptInput}
              />
              <View style={styles.animationPicker}>
                {captureAnimationPresets.map((animation) => (
                  <Pressable
                    key={animation.id}
                    onPress={() => {
                      setCaptureAnimation(animation.id)
                      setCaptureStatus(`Animación antes y entre fotos: ${animation.label}.`)
                    }}
                    style={[styles.animationChoice, captureAnimation === animation.id && styles.animationChoiceActive]}
                  >
                    <View style={styles.animationChoiceIcon} />
                    <Text style={[styles.animationChoiceText, captureAnimation === animation.id && styles.animationChoiceTextActive]}>{animation.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.eventOptionsSection}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelEyebrow}>Diseño</Text>
              <Text style={styles.panelTitle}>Plantillas / marcos</Text>
            </View>
            <Text style={styles.nextShot}>{overlayFileName || selectedTemplate.name}</Text>
          </View>
          <View style={[styles.templateGrid, isMobile && styles.templateGridMobile]}>
            {eventTemplateOptions.map((template) => {
              const active = selectedTemplate.id === template.id && !overlayImageUrl
              return (
                <Pressable
                  key={template.id}
                  onPress={() => chooseTemplate(template)}
                  style={[styles.templateCard, isMobile && styles.templateCardMobile, active && styles.templateCardActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Elegir plantilla ${template.name}`}
                >
                  <Image source={template.image} style={[styles.templateImage, isMobile && styles.templateImageMobile]} accessibilityLabel={`Plantilla ${template.name}`} />
                  <Text style={[styles.templateName, active && styles.templateNameActive]}>{template.name}</Text>
                </Pressable>
              )
            })}
            <label style={overlayImageUrl ? { ...styles.uploadTemplateCard, ...(isMobile ? styles.uploadTemplateCardMobile : {}), ...styles.uploadTemplateCardActive } : { ...styles.uploadTemplateCard, ...(isMobile ? styles.uploadTemplateCardMobile : {}) }}>
              <View style={styles.uploadTemplateIcon}>
                <Text style={styles.uploadTemplateIconText}>+</Text>
              </View>
              <Text style={styles.uploadTemplateTitle}>Subir desde el celular</Text>
              <Text style={styles.uploadTemplateText}>
                {overlayFileName || 'Plantilla o marco PNG/JPG'}
              </Text>
              <input accept="image/png,image/jpeg,image/webp" type="file" onChange={handleOverlayFile} style={{ display: 'none' }} />
            </label>
          </View>
        </View>

      </View>

      <View style={[styles.eventOptionsFooter, isMobile && styles.eventOptionsFooterMobile]}>
        <Pressable
          onPress={() => openCaptureConfigScreen(operatorSettingsActive)}
          style={[styles.eventOptionsSecondaryButton, isMobile && styles.eventOptionsSecondaryButtonMobile]}
          accessibilityRole="button"
          accessibilityLabel="Abrir configuración de captura"
        >
          <Text style={[styles.eventOptionsSecondaryText, isMobile && styles.eventOptionsSecondaryTextMobile]}>{isMobile ? 'Captura' : 'Configuración de captura'}</Text>
        </Pressable>
        <Pressable
          onPress={() => openPrintConfigScreen(operatorSettingsActive)}
          style={[styles.eventOptionsSecondaryButton, isMobile && styles.eventOptionsSecondaryButtonMobile]}
          accessibilityRole="button"
          accessibilityLabel="Abrir configuración de impresión"
        >
          <Text style={[styles.eventOptionsSecondaryText, isMobile && styles.eventOptionsSecondaryTextMobile]}>{isMobile ? 'Impresión' : 'Configuración de impresión'}</Text>
        </Pressable>
        <Pressable
          onPress={operatorSettingsActive ? closeOperatorSettingsToCapture : handleContinueToCapture}
          style={[styles.eventOptionsPrimaryButton, isMobile && styles.eventOptionsPrimaryButtonMobile]}
          accessibilityRole="button"
          accessibilityLabel={operatorSettingsActive ? 'Listo, volver a tomar fotos' : 'Continuar a cámara'}
        >
          <Text style={[styles.eventOptionsPrimaryText, isMobile && styles.eventOptionsPrimaryTextMobile]}>{operatorSettingsActive ? 'Listo' : isMobile ? 'Tomar foto' : 'Continuar a tomar foto'}</Text>
        </Pressable>
      </View>
    </View>
  )

  const renderCustomPhotoLayoutScreen = () => (
    <View style={styles.customLayoutPage}>
      <View style={[styles.startEditorHeader, isMobile && styles.startEditorHeaderMobile]}>
        <View style={styles.startEditorHeading}>
          <Text style={styles.panelEyebrow}>Personalizar</Text>
          <Text style={[styles.startEditorTitle, isMobile && styles.startEditorTitleMobile]}>Layout manual</Text>
          <Text style={[styles.startEditorSubtitle, isMobile && styles.startEditorSubtitleMobile]}>
            Parte de un fondo vacío. Agrega recuadros de foto, muévelos, agrándalos, duplícalos o bórralos manualmente.
          </Text>
        </View>
        <Pressable
          onPress={() => setShowCustomPhotoLayoutScreen(false)}
          style={[styles.startEditorClose, isMobile && styles.startEditorCloseMobile]}
          accessibilityRole="button"
          accessibilityLabel="Volver a configuración del evento"
        >
          <Text style={styles.startEditorCloseText}>⌄</Text>
        </Pressable>
      </View>

      <View style={[styles.customLayoutContent, isMobile && styles.customLayoutContentMobile]}>
        <View style={styles.customLayoutPreviewPanel}>
          <View style={styles.customLayoutSheet}>
            <View
              ref={customEditorStripRef}
              style={[styles.customLayoutStrip, styles.customLayoutStripEditable]}
            >
              <View style={styles.customLayoutScriptLine} />
              {!customLayoutSlots.length ? (
                <View style={styles.customLayoutEmptyState}>
                  <Text style={styles.customLayoutEmptyTitle}>Fondo vacío</Text>
                  <Text style={styles.customLayoutEmptyText}>Toca “Agregar foto” para crear un recuadro.</Text>
                </View>
              ) : null}
              {customLayoutSlots.map((slot, index) => {
                const photoNumber = slot.photoNumber
                const selected = selectedCustomLayoutPhoto === photoNumber
                if (!slot) return null
                return (
                  <Pressable
                    key={`custom-layout-slot-${photoNumber}-${index}`}
                    testID={`custom-layout-slot-${photoNumber}`}
                    onPress={() => setSelectedCustomLayoutPhoto(photoNumber)}
                    onPressIn={(event) => beginCustomLayoutPointer(photoNumber, 'move', event)}
                    style={[
                      styles.customLayoutSlot,
                      {
                        left: `${slot.x}%`,
                        top: `${slot.y}%`,
                        width: `${slot.width}%`,
                        height: `${slot.height}%`,
                        zIndex: selected ? 10 : index + 1,
                      },
                      selected && styles.customLayoutSlotSelected,
                    ]}
                  >
                    <Text style={styles.customLayoutSlotNumber}>{photoNumber}</Text>
                    <Text style={styles.customLayoutSlotMeta}>Foto {photoNumber}</Text>
                    <Pressable
                      testID={`custom-layout-resize-${photoNumber}`}
                      onPressIn={(event) => beginCustomLayoutPointer(photoNumber, 'resize', event)}
                      style={styles.customLayoutResizeHandle}
                    >
                      <Text style={styles.customLayoutResizeText}>↘</Text>
                    </Pressable>
                  </Pressable>
                )
              })}
              <View style={styles.customLayoutNameLine} />
              <View style={styles.customLayoutDateLine} />
            </View>
          </View>
          <Text style={styles.customLayoutHint}>
            Arrastra los recuadros sobre el fondo. Al imprimir, la app repite el diseño si necesitas dos tiras.
          </Text>
        </View>

        <View style={styles.customLayoutControls}>
          <View style={styles.customLayoutCard}>
            <View style={styles.customLayoutCardHeader}>
              <View>
                <Text style={styles.panelEyebrow}>Fondo</Text>
                <Text style={styles.customLayoutTitle}>Agregar recuadros</Text>
              </View>
              <Text style={styles.customLayoutCount}>{customLayoutSlots.length}/{customPhotoMaxSlots}</Text>
            </View>
            <View style={styles.customManualActions}>
              <Pressable onPress={() => addCustomLayoutPhoto()} style={styles.customManualPrimaryButton} accessibilityRole="button" accessibilityLabel="Agregar recuadro de foto">
                <Text style={styles.customManualPrimaryText}>+ Agregar foto</Text>
              </Pressable>
              <Pressable onPress={duplicateCustomLayoutPhoto} disabled={!customLayoutSlots.length || customLayoutSlots.length >= customPhotoMaxSlots} style={[styles.customManualButton, (!customLayoutSlots.length || customLayoutSlots.length >= customPhotoMaxSlots) && styles.customManualButtonDisabled]} accessibilityRole="button" accessibilityLabel="Duplicar recuadro seleccionado">
                <Text style={styles.customManualButtonText}>Duplicar</Text>
              </Pressable>
              <Pressable onPress={deleteCustomLayoutPhoto} disabled={!customLayoutSlots.length} style={[styles.customManualButton, !customLayoutSlots.length && styles.customManualButtonDisabled]} accessibilityRole="button" accessibilityLabel="Borrar recuadro seleccionado">
                <Text style={styles.customManualButtonText}>Borrar</Text>
              </Pressable>
              <Pressable onPress={resetCustomPhotoLayout} style={styles.customManualGhostButton} accessibilityRole="button" accessibilityLabel="Limpiar todos los recuadros">
                <Text style={styles.customManualGhostText}>Limpiar fondo</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.customLayoutCard}>
            <View style={styles.customLayoutCardHeader}>
              <View>
                <Text style={styles.panelEyebrow}>Mouse</Text>
                <Text style={styles.customLayoutTitle}>Tamaño y posición</Text>
              </View>
              <Text style={styles.customLayoutCount}>{customLayoutSlots.length ? `Foto ${selectedCustomLayoutPhoto}` : 'Sin foto'}</Text>
            </View>
            <View style={styles.customFineGrid}>
              <Pressable disabled={!customLayoutSlots.length} onPress={() => nudgeCustomLayoutPhoto(selectedCustomLayoutPhoto, 'y', -1.5)} style={[styles.customFineButton, !customLayoutSlots.length && styles.customFineButtonDisabled]} accessibilityRole="button" accessibilityLabel="Subir foto seleccionada">
                <Text style={styles.customFineButtonText}>↑</Text>
              </Pressable>
              <Pressable disabled={!customLayoutSlots.length} onPress={() => nudgeCustomLayoutPhoto(selectedCustomLayoutPhoto, 'x', -1.5)} style={[styles.customFineButton, !customLayoutSlots.length && styles.customFineButtonDisabled]} accessibilityRole="button" accessibilityLabel="Mover foto a la izquierda">
                <Text style={styles.customFineButtonText}>←</Text>
              </Pressable>
              <Pressable disabled={!customLayoutSlots.length} onPress={() => nudgeCustomLayoutPhoto(selectedCustomLayoutPhoto, 'x', 1.5)} style={[styles.customFineButton, !customLayoutSlots.length && styles.customFineButtonDisabled]} accessibilityRole="button" accessibilityLabel="Mover foto a la derecha">
                <Text style={styles.customFineButtonText}>→</Text>
              </Pressable>
              <Pressable disabled={!customLayoutSlots.length} onPress={() => nudgeCustomLayoutPhoto(selectedCustomLayoutPhoto, 'y', 1.5)} style={[styles.customFineButton, !customLayoutSlots.length && styles.customFineButtonDisabled]} accessibilityRole="button" accessibilityLabel="Bajar foto seleccionada">
                <Text style={styles.customFineButtonText}>↓</Text>
              </Pressable>
              <Pressable disabled={!customLayoutSlots.length} onPress={() => nudgeCustomLayoutPhoto(selectedCustomLayoutPhoto, 'width', -2)} style={[styles.customFineButtonWide, !customLayoutSlots.length && styles.customFineButtonDisabled]} accessibilityRole="button" accessibilityLabel="Reducir ancho">
                <Text style={styles.customFineButtonText}>Ancho -</Text>
              </Pressable>
              <Pressable disabled={!customLayoutSlots.length} onPress={() => nudgeCustomLayoutPhoto(selectedCustomLayoutPhoto, 'width', 2)} style={[styles.customFineButtonWide, !customLayoutSlots.length && styles.customFineButtonDisabled]} accessibilityRole="button" accessibilityLabel="Aumentar ancho">
                <Text style={styles.customFineButtonText}>Ancho +</Text>
              </Pressable>
              <Pressable disabled={!customLayoutSlots.length} onPress={() => nudgeCustomLayoutPhoto(selectedCustomLayoutPhoto, 'height', -1.5)} style={[styles.customFineButtonWide, !customLayoutSlots.length && styles.customFineButtonDisabled]} accessibilityRole="button" accessibilityLabel="Reducir alto">
                <Text style={styles.customFineButtonText}>Alto -</Text>
              </Pressable>
              <Pressable disabled={!customLayoutSlots.length} onPress={() => nudgeCustomLayoutPhoto(selectedCustomLayoutPhoto, 'height', 1.5)} style={[styles.customFineButtonWide, !customLayoutSlots.length && styles.customFineButtonDisabled]} accessibilityRole="button" accessibilityLabel="Aumentar alto">
                <Text style={styles.customFineButtonText}>Alto +</Text>
              </Pressable>
            </View>
            <Text style={styles.customLayoutHint}>También puedes arrastrar el recuadro y tomar la esquina para agrandarlo.</Text>
          </View>

          <View style={styles.customLayoutCard}>
            <View style={styles.customLayoutCardHeader}>
              <View>
                <Text style={styles.panelEyebrow}>Recuadros</Text>
                <Text style={styles.customLayoutTitle}>Fotos creadas</Text>
              </View>
              <Text style={styles.customLayoutCount}>{customLayoutSlots.length}</Text>
            </View>
            <View style={styles.customOrderList}>
              {customLayoutSlots.length ? customLayoutSlots.map((slot, index) => {
                const photoNumber = slot.photoNumber
                const selected = selectedCustomLayoutPhoto === photoNumber
                return (
                <View key={`custom-order-${photoNumber}-${index}`} style={styles.customOrderRow}>
                  <View style={styles.customOrderBadge}>
                    <Text style={styles.customOrderBadgeText}>{photoNumber}</Text>
                  </View>
                  <View style={styles.customOrderCopy}>
                    <Text style={styles.customOrderTitle}>Foto {photoNumber}</Text>
                    <Text style={styles.customOrderText}>Sale en posición {index + 1}</Text>
                  </View>
                  <View style={styles.customOrderActions}>
                    <Pressable
                      onPress={() => setSelectedCustomLayoutPhoto(photoNumber)}
                      style={[styles.customOrderButton, selected && styles.customOrderButtonActive]}
                      accessibilityRole="button"
                      accessibilityLabel={`Seleccionar foto ${photoNumber}`}
                    >
                      <Text style={[styles.customOrderButtonText, selected && styles.customOrderButtonTextActive]}>✓</Text>
                    </Pressable>
                  </View>
                </View>
                )
              }) : (
                <Text style={styles.customLayoutHint}>Aún no hay recuadros. Agrega una foto para empezar.</Text>
              )}
            </View>
          </View>

          <Pressable
            onPress={() => setShowCustomPhotoLayoutScreen(false)}
            style={styles.customLayoutDoneButton}
            accessibilityRole="button"
            accessibilityLabel="Guardar layout manual"
          >
            <Text style={styles.customLayoutDoneText}>Guardar y volver</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )

  const renderTypePreview = (type) => {
    if (type.id === 'personalizar-5x15') {
      const previewSequence = selectedType.id === 'personalizar-5x15' && customPhotoSequence.length ? customPhotoSequence : [1]
      return (
        <View style={[styles.typePreview, isMobile && styles.typePreviewMobile, styles.typePreviewCustomSheet, isMobile && styles.typePreviewCustomSheetMobile]}>
          {[0, 1].map((stripIndex) => (
            <View key={`custom-strip-${stripIndex}`} style={styles.typePreviewCustomStrip}>
              <View style={styles.typePreviewCustomTextLine} />
              {previewSequence.map((photoNumber, slotIndex) => (
                <View key={`custom-strip-${stripIndex}-${slotIndex}`} style={styles.typePreviewCustomPhoto}>
                  <Text style={styles.typePreviewText}>{photoNumber}</Text>
                </View>
              ))}
              <View style={styles.typePreviewCustomNameLine} />
              <View style={styles.typePreviewCustomDateLine} />
            </View>
          ))}
        </View>
      )
    }

    return (
      <View
        style={[
          styles.typePreview,
          isMobile && styles.typePreviewMobile,
          type.id === 'tira' && styles.typePreviewStrip,
          type.id === 'postal' && styles.typePreviewPostal,
          isMobile && type.id === 'tira' && styles.typePreviewStripMobile,
          isMobile && type.id === 'postal' && styles.typePreviewPostalMobile,
        ]}
      >
        {getSlots(type, 100, 130).map((slot, index) => (
          <View
            key={`${type.id}-${index}`}
            style={[
              styles.typePreviewSlot,
              {
                left: `${slot.x}%`,
                top: `${slot.y / 1.3}%`,
                width: `${slot.width}%`,
                height: `${slot.height / 1.3}%`,
              },
            ]}
          >
            <Text style={styles.typePreviewText}>{index + 1}</Text>
          </View>
        ))}
      </View>
    )
  }

  const renderAnimationOverlay = () => {
    if (!animationOverlay) return null
    if (animationOverlay.stage === 'beforeCountdown') return null

    const hasAnimationVideo = Boolean(animationOverlay.videoUrl || animationVideoUrl)
    const fallbackTitle = animationOverlay.stage === 'afterCapture' ? 'Efecto entre fotos' : 'Video de animación'

    return (
      <View style={styles.animationOverlay}>
        <View style={[styles.animationHalo, animationOverlay.mode === 'confeti' && styles.animationHaloConfetti]} />
        <View style={[styles.animationCard, animationOverlay.mode === 'destello' && styles.animationCardLight]}>
          {hasAnimationVideo ? (
            React.createElement('video', {
              src: animationOverlay.videoUrl || animationVideoUrl,
              autoPlay: true,
              muted: true,
              playsInline: true,
              loop: true,
              style: {
                width: '100%',
                height: 150,
                objectFit: 'cover',
                display: 'block',
                borderRadius: 8,
                marginBottom: 12,
              },
            })
          ) : (
            <View style={[styles.animationVideoMockInline, animationOverlay.mode === 'confeti' && styles.animationVideoMockConfetti]}>
              <Text style={styles.animationVideoMockInlineText}>{fallbackTitle}</Text>
            </View>
          )}
          <Text style={styles.animationTitle}>{animationOverlay.title}</Text>
          <Text style={styles.animationText}>{animationOverlay.text}</Text>
          <View style={styles.animationDots}>
            {[0, 1, 2].map((dot) => (
              <View key={`animation-dot-${dot}`} style={[styles.animationDot, dot === 1 && styles.animationDotMiddle]} />
            ))}
          </View>
        </View>
      </View>
    )
  }

  const renderAnimationVideoScreen = () => {
    const selectedExperienceStyle = animationExperienceStyles.find((item) => item.id === animationExperienceStyle) || animationExperienceStyles[0]
    const renderVideoStage = (stage) => {
      const stageVideo = animationStageVideos[stage.id]
      const selectedExampleVideo = getAnimationStageVideo(stage.id)
      const selectedLabel = selectedExampleVideo?.fileName || stage.defaultFile || 'Deseleccionado'
      const videos = stage.exampleVideos || (stage.defaultVideo ? [stage.defaultVideo] : [])
      const activeStageStyle = selectedExampleVideo ? [styles.stageVideoCard, styles.stageVideoCardActive] : styles.stageVideoCard

      if (stage.compact) {
        return (
          <View key={stage.id} style={activeStageStyle}>
            <View style={styles.stageCardHeader}>
              <Text style={styles.stageCardTitle}>{stage.title}</Text>
            </View>
            <View style={styles.stageSelectWrap}>
              <label style={styles.stageSelectLine}>
                <Text style={styles.stageSelectText}>{selectedLabel}</Text>
                <Text style={styles.stageChevron}>⌄</Text>
                <input accept="video/mp4,video/quicktime,video/webm,video/*" type="file" onChange={(event) => handleAnimationStageVideoFile(stage.id, event)} style={{ display: 'none' }} />
              </label>
              <Pressable onPress={() => clearAnimationStageVideo(stage.id)} style={styles.stageTrashButton}>
                <Text style={styles.stageTrashText}>⌫</Text>
              </Pressable>
            </View>
            {videos.length ? (
              <View style={styles.exampleVideoRow}>
                {videos.map((video) => (
                  <Pressable
                    key={`${stage.id}-${video.fileName}`}
                    onPress={() => selectExampleStageVideo(stage.id, video)}
                    style={[styles.exampleVideoPill, selectedLabel === video.fileName && styles.exampleVideoPillActive]}
                  >
                    <Text style={[styles.exampleVideoPillText, selectedLabel === video.fileName && styles.exampleVideoPillTextActive]}>Ejemplo</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {stage.helper ? <Text style={styles.stageHelper}>{stage.helper}</Text> : null}
          </View>
        )
      }

      return (
        <View key={stage.id} style={styles.animationSequenceCard}>
          <View style={styles.sequenceHeaderRow}>
            <View>
              <Text style={styles.sequenceTitle}>{stage.title}</Text>
              <Text style={styles.sequenceHelper}>{stage.helper}</Text>
            </View>
            <label style={styles.stageSelectButton}>
              <Text style={styles.stageSelectButtonText}>Seleccionar</Text>
              <Text style={styles.stageSelectButtonHint}>Video</Text>
              <input accept="video/mp4,video/quicktime,video/webm,video/*" type="file" onChange={(event) => handleAnimationStageVideoFile(stage.id, event)} style={{ display: 'none' }} />
            </label>
          </View>
          <View style={styles.videoCarouselRow}>
            <Text style={styles.carouselArrow}>‹</Text>
            <View style={styles.videoThumbTrack}>
              {videos.map((video) => (
                <Pressable
                  key={`${stage.id}-${video.fileName}`}
                  onPress={() => selectExampleStageVideo(stage.id, video)}
                  style={[styles.videoThumb, selectedExampleVideo?.fileName === video.fileName && styles.videoThumbActive]}
                >
                  <View style={styles.videoThumbPreview}>
                    {React.createElement('video', {
                      src: video.url,
                      autoPlay: true,
                      muted: true,
                      playsInline: true,
                      loop: true,
                      style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      },
                    })}
                  </View>
                  <Text style={styles.videoThumbText}>{video.fileName}</Text>
                  <Pressable onPress={() => clearAnimationStageVideo(stage.id)} style={styles.thumbTrashButton}>
                    <Text style={styles.thumbTrashText}>⌫</Text>
                  </Pressable>
                </Pressable>
              ))}
            </View>
            <Text style={styles.carouselArrow}>›</Text>
          </View>
          {stage.randomizable ? (
            <Pressable onPress={() => toggleAnimationStageRandom(stage.id)} style={styles.randomCheckRow}>
              <View style={[styles.randomCheckBox, animationStageRandom[stage.id] && styles.randomCheckBoxActive]}>
                {animationStageRandom[stage.id] ? <Text style={styles.randomCheckMark}>✓</Text> : null}
              </View>
              <Text style={styles.randomCheckText}>Hacer aleatorio</Text>
            </Pressable>
          ) : null}
        </View>
      )
    }

    if (animationVideoQuestionMode === 'question') {
      return (
        <View style={styles.flowStepPage}>
          <View style={[styles.flowStepHeader, isMobile && styles.flowStepHeaderMobile]}>
            <View>
              <Text style={styles.panelEyebrow}>Antes de tomar fotos</Text>
              <Text style={[styles.flowStepTitle, isMobile && styles.flowStepTitleMobile]}>Video de animación</Text>
              <Text style={styles.flowStepText}>
                ¿Ya tiene un video de animación? Puede personalizarlo ahora o continuar directo a tomar las fotos.
              </Text>
            </View>
            <View style={styles.eventOptionsBadge}>
              <Text style={styles.eventOptionsBadgeText}>Papel 10x15</Text>
            </View>
          </View>

          <View style={[styles.animationQuestionCard, isMobile && styles.animationQuestionCardMobile]}>
            <View style={styles.animationQuestionPreview}>
              <View style={styles.animationVideoPlay}>
                <Text style={styles.animationVideoPlayText}>▶</Text>
              </View>
              <Text style={styles.animationVideoMockTitle}>¿Tiene video de animación?</Text>
              <Text style={styles.animationVideoMockText}>Se mostrará antes de empezar la toma de fotos.</Text>
            </View>

            <View style={styles.animationQuestionCopy}>
              <Text style={styles.animationQuestionTitle}>Elija cómo continuar</Text>
              <Text style={styles.animationQuestionText}>
                Si ya tiene un video, entre a personalizarlo y cargarlo por etapa. Si no, la experiencia usa los videos de ejemplo y abre la cámara.
              </Text>
              <View style={[styles.animationQuestionActions, isMobile && styles.animationQuestionActionsMobile]}>
                <Pressable onPress={personalizeAnimationVideo} style={styles.eventOptionsSecondaryButton}>
                  <Text style={styles.eventOptionsSecondaryText}>Sí, personalizarlo</Text>
                </Pressable>
                <Pressable onPress={continueAfterAnimationVideo} style={styles.eventOptionsPrimaryButton}>
                  <Text style={styles.eventOptionsPrimaryText}>No, continuar</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => openEventOptionsScreen(false)}>
                <Text style={styles.previewConfigLink}>← Volver a configuración</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.flowStepPage}>
        <View style={[styles.flowStepHeader, isMobile && styles.flowStepHeaderMobile]}>
          <View>
            <Text style={styles.panelEyebrow}>Antes de tomar fotos</Text>
            <Text style={[styles.flowStepTitle, isMobile && styles.flowStepTitleMobile]}>Video de animación</Text>
            <Text style={styles.flowStepText}>
              ¿Ya tiene un video de animación? Puede personalizarlo por etapa o continuar con los videos de ejemplo.
            </Text>
          </View>
          <View style={styles.eventOptionsBadge}>
            <Text style={styles.eventOptionsBadgeText}>Papel 10x15</Text>
          </View>
        </View>

        <View style={styles.virtualAssistantPanel}>
          <View style={styles.assistantTopRow}>
            <View style={styles.assistantTitleWrap}>
              <View style={styles.assistantTitleLine}>
                <Text style={styles.assistantTitle}>Asistente virtual</Text>
                <Pressable
                  onPress={() => setVirtualAssistantEnabled((value) => !value)}
                  style={[styles.assistantSwitch, virtualAssistantEnabled && styles.assistantSwitchActive]}
                >
                  <View style={[styles.assistantSwitchKnob, virtualAssistantEnabled && styles.assistantSwitchKnobActive]} />
                  <Text style={styles.assistantSwitchText}>{virtualAssistantEnabled ? 'Sí' : 'No'}</Text>
                </Pressable>
              </View>
              <Text style={styles.assistantQuestion}>¿Desea guiar a los usuarios a través de la experiencia?</Text>
            </View>
            <Pressable style={styles.assistantCollapseButton}>
              <Text style={styles.assistantCollapseText}>⌄</Text>
            </Pressable>
          </View>

          <View style={[styles.animationStageGrid, isMobile && styles.animationStageGridMobile]}>
            <View style={styles.animationLeftColumn}>
              <Text style={styles.sequenceTitle}>Estilo</Text>
              <View style={styles.styleSelectBox}>
                <Text style={styles.stageSelectText}>{selectedExperienceStyle.label}</Text>
                <Text style={styles.stageChevron}>⌄</Text>
              </View>
              <View style={styles.animationPicker}>
                {animationExperienceStyles.map((style) => (
                  <Pressable
                    key={style.id}
                    onPress={() => setAnimationExperienceStyle(style.id)}
                    style={[styles.animationChoice, animationExperienceStyle === style.id && styles.animationChoiceActive]}
                  >
                    <View style={styles.animationChoiceIcon} />
                    <Text style={[styles.animationChoiceText, animationExperienceStyle === style.id && styles.animationChoiceTextActive]}>{style.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.animationRightColumn}>
              {animationVideoStages.filter((stage) => stage.id === 'start').map(renderVideoStage)}
            </View>
          </View>

          <View style={styles.animationSequenceList}>
            {animationVideoStages.filter((stage) => !stage.compact).map(renderVideoStage)}
          </View>

          <View style={[styles.animationCompactGrid, isMobile && styles.animationCompactGridMobile]}>
            {animationVideoStages.filter((stage) => stage.compact && stage.id !== 'start').map(renderVideoStage)}
          </View>

          {getAnimationStageVideoUrl('start') ? (
            <View style={styles.animationVideoPreviewStrip}>
              {React.createElement('video', {
                src: getAnimationStageVideoUrl('start'),
                controls: true,
                muted: true,
                playsInline: true,
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                },
              })}
            </View>
          ) : null}

          <Text style={styles.captureStatus}>{captureStatus}</Text>
          <View style={[styles.flowFooter, isMobile && styles.flowFooterMobile]}>
            <Pressable onPress={() => openEventOptionsScreen(false)} style={[styles.eventOptionsSecondaryButton, styles.assistantFooterSecondary]}>
              <Text style={[styles.eventOptionsSecondaryText, styles.assistantFooterSecondaryText]}>← Volver</Text>
            </Pressable>
            <View style={[styles.animationFooterActions, isMobile && styles.animationFooterActionsMobile]}>
              <label style={{ ...styles.eventOptionsSecondaryButton, ...styles.assistantFooterSecondary }}>
                <Text style={[styles.eventOptionsSecondaryText, styles.assistantFooterSecondaryText]}>Personalizar video</Text>
                <input accept="video/mp4,video/quicktime,video/webm,video/*" type="file" onChange={handleAnimationVideoFile} style={{ display: 'none' }} />
              </label>
              <Pressable onPress={continueAfterAnimationVideo} style={[styles.eventOptionsPrimaryButton, styles.assistantFooterPrimary]}>
                <Text style={styles.eventOptionsPrimaryText}>Continuar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    )
  }

  const renderCamera = (shellStyle = null, onPress = null, showBadge = true) => {
    const CameraContainer = onPress ? Pressable : View

    return (
      <CameraContainer
        onPress={onPress || undefined}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={onPress ? 'Tomar foto' : undefined}
        style={[styles.cameraShell, isMobile && styles.cameraShellMobile, shellStyle, onPress && styles.cameraTouchArea]}
      >
      {cameraStream ? (
        React.createElement('video', {
          ref: videoRef,
          playsInline: true,
          muted: true,
          style: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            display: 'block',
          },
        })
      ) : (
        <Image source={selectedTemplate.image} style={styles.cameraPlaceholder} accessibilityLabel={`Vista de cámara con plantilla ${selectedTemplate.name}`} />
      )}
      <View style={styles.cameraShade} />
      <View style={styles.safeFrame} />
      {gifOverlayUrl ? <Image source={{ uri: gifOverlayUrl }} style={styles.cameraGifOverlay} accessibilityLabel="Imagen superpuesta en cámara" /> : null}
      {renderAnimationOverlay()}
      {countdown ? <Text style={[styles.countdown, isMobile && styles.countdownMobile]}>{countdown}</Text> : null}
      {showBadge ? <View style={styles.cameraBadge}>
        <Text style={styles.cameraBadgeText}>ESPEJO MÁGICO</Text>
      </View> : null}
      </CameraContainer>
    )
  }

  const renderCaptureStartOverlay = () => {
    if (!captureIntroActive || countdownRef.current) return null

    const promptText = framesReady ? 'Oprimir para tomar la siguiente foto' : 'Oprimir para tomar fotos'
    const actionText = framesReady ? 'Siguiente' : 'Tomar'
    const helperText = framesReady ? 'foto' : 'fotos'
    const pulseStyle = {
      opacity: capturePulse.interpolate({
        inputRange: [0, 0.72, 1],
        outputRange: [0.85, 0, 0],
      }),
      transform: [{
        scale: capturePulse.interpolate({
          inputRange: [0, 0.72, 1],
          outputRange: [0.82, 1.2, 1.2],
        }),
      }],
    }
    const buttonMotionStyle = {
      transform: [{
        translateY: captureFloat.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -5],
        }),
      }],
    }

    return (
      <Pressable
        onPress={runCountdownAndCapture}
        style={({ pressed }) => [
          styles.captureStartOverlay,
          pressed && styles.captureStartOverlayPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={promptText}
      >
        <Animated.View style={[styles.captureStartPulseRing, pulseStyle]} />
        <Animated.View style={[styles.captureStartButton, buttonMotionStyle]}>
          <View style={styles.captureStartCameraIcon}>
            <View style={styles.captureStartCameraLens} />
            <View style={styles.captureStartCameraFlash} />
          </View>
          <Text style={styles.captureStartButtonText}>{actionText}</Text>
          <Text style={styles.captureStartButtonSubText}>{helperText}</Text>
        </Animated.View>
        {cameraError ? <Text style={styles.captureStartError}>{cameraError}</Text> : null}
      </Pressable>
    )
  }

  const renderOperatorMenu = () => {
    if (!showOperatorMenu) return null

    const actions = [
      { label: 'Evento y marco', helper: 'Tipo de foto, textos y plantilla', onPress: () => openOperatorQuickPanel('event') },
      { label: 'Captura', helper: 'Conteo, calidad y animaciones', onPress: () => openOperatorQuickPanel('capture') },
      { label: 'Impresión', helper: 'Papel, copias y DPI', onPress: () => openOperatorQuickPanel('print') },
      { label: cameraStream ? 'Reiniciar cámara' : 'Abrir cámara', helper: 'Permisos o cambio de cámara', onPress: openCamera },
      { label: 'Repetir fotos', helper: 'Borra las tomas actuales', onPress: resetPhoto },
    ]

    return (
      <View style={styles.operatorMenuLayer}>
        <Pressable onPress={() => setShowOperatorMenu(false)} style={styles.operatorMenuScrim} accessibilityLabel="Cerrar menú de operario" />
        <View style={[styles.operatorMenuPanel, isMobile && styles.operatorMenuPanelMobile]}>
          <View style={styles.operatorMenuHeader}>
            <View>
              <Text style={styles.operatorMenuEyebrow}>Operario</Text>
              <Text style={styles.operatorMenuTitle}>Configuración rápida</Text>
            </View>
            <Pressable onPress={() => setShowOperatorMenu(false)} style={styles.operatorMenuClose} accessibilityRole="button" accessibilityLabel="Cerrar menú de operario">
              <Text style={styles.operatorMenuCloseText}>×</Text>
            </Pressable>
          </View>
          <View style={styles.operatorMenuList}>
            {actions.map((action) => (
              <Pressable key={action.label} onPress={() => runOperatorAction(action.onPress, action.opensSettings)} style={styles.operatorMenuItem} accessibilityRole="button">
                <View>
                  <Text style={styles.operatorMenuItemTitle}>{action.label}</Text>
                  <Text style={styles.operatorMenuItemText}>{action.helper}</Text>
                </View>
                <Text style={styles.operatorMenuArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    )
  }

  const renderOperatorQuickPanel = () => {
    if (!operatorQuickPanel) return null

    const panelTitles = {
      event: 'Evento y marco',
      capture: 'Captura',
      print: 'Impresión',
    }

    return (
      <View style={styles.operatorQuickLayer}>
        <Pressable onPress={closeOperatorSettingsToCapture} style={styles.operatorQuickScrim} accessibilityLabel="Cerrar configuración rápida" />
        <View style={[styles.operatorQuickPanel, isMobile && styles.operatorQuickPanelMobile]}>
          <View style={styles.operatorQuickHeader}>
            <View style={styles.operatorQuickHeading}>
              <Text style={styles.operatorMenuEyebrow}>Operario</Text>
              <Text style={styles.operatorQuickTitle}>{panelTitles[operatorQuickPanel]}</Text>
            </View>
            <Pressable onPress={closeOperatorSettingsToCapture} style={styles.operatorDoneButton} accessibilityRole="button" accessibilityLabel="Listo, volver a tomar fotos">
              <Text style={styles.operatorDoneButtonText}>Listo</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.operatorQuickScroll} contentContainerStyle={styles.operatorQuickContent}>
            {operatorQuickPanel === 'capture' ? (
              <>
                <View style={styles.operatorQuickCard}>
                  <Text style={styles.operatorQuickCardTitle}>Foto</Text>
                  <View style={styles.photoSettingRow}>
                    <Text style={styles.photoSettingLabel}>Cuenta regresiva</Text>
                    <View style={styles.photoSliderWrap}>
                      {renderRangeSlider({
                        value: photoCountdownFirst,
                        min: 1,
                        max: 10,
                        onChange: setSessionCountdown,
                        statusText: (value) => `Cuenta regresiva de todas las fotos: ${value} sec.`,
                      })}
                    </View>
                    <Text style={styles.photoSettingValue}>{photoCountdownFirst} sec</Text>
                  </View>
                  <View style={styles.photoSettingRow}>
                    <Text style={styles.photoSettingLabel}>Siguientes fotos (opcional)</Text>
                    <View style={styles.photoSliderWrap}>
                      {renderRangeSlider({
                        value: photoCountdownNext,
                        min: 1,
                        max: 10,
                        onChange: setPhotoCountdownNext,
                        statusText: (value) => `Cuenta regresiva de siguientes fotos: ${value} sec.`,
                      })}
                    </View>
                    <Text style={styles.photoSettingValue}>{photoCountdownNext} sec</Text>
                  </View>
                  <View style={styles.photoSettingRow}>
                    <Text style={styles.photoSettingLabel}>Mostrar cada foto</Text>
                    <View style={styles.photoSliderWrap}>
                      {renderRangeSlider({
                        value: photoReviewSeconds,
                        min: 1,
                        max: 6,
                        onChange: setPhotoReviewSeconds,
                        statusText: (value) => `Cada foto se mostrará ${value} sec.`,
                      })}
                    </View>
                    <Text style={styles.photoSettingValue}>{photoReviewSeconds} sec</Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      setCaptureOriginal((value) => !value)
                      setCaptureStatus(`Guardar foto original ${captureOriginal ? 'desactivado' : 'activado'}.`)
                    }}
                    style={styles.checkRow}
                  >
                    <View style={[styles.checkBox, !captureOriginal && styles.checkBoxOff]}>
                      <Text style={styles.checkMark}>{captureOriginal ? '✓' : ''}</Text>
                    </View>
                    <View style={styles.checkCopy}>
                      <Text style={styles.checkTitle}>Guardar foto original</Text>
                      <Text style={styles.checkText}>Conserva una copia limpia.</Text>
                    </View>
                  </Pressable>
                </View>
                <View style={styles.operatorQuickTabs}>
                  <Pressable onPress={() => setOperatorQuickPanel('event')} style={styles.operatorQuickTab}>
                    <Text style={styles.operatorQuickTabText}>Evento</Text>
                  </Pressable>
                  <Pressable onPress={() => setOperatorQuickPanel('print')} style={styles.operatorQuickTab}>
                    <Text style={styles.operatorQuickTabText}>Impresión</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {operatorQuickPanel === 'event' ? (
              <>
                <View style={styles.operatorQuickCard}>
                  <Text style={styles.operatorQuickCardTitle}>Tipo de foto</Text>
                  <View style={styles.operatorQuickGrid}>
                    {photoTypes.map((type) => {
                      const active = selectedType.id === type.id
                      return (
                        <Pressable key={type.id} onPress={() => chooseType(type)} style={[styles.operatorQuickChoice, active && styles.operatorQuickChoiceActive]}>
                          <Text style={[styles.operatorQuickChoiceTitle, active && styles.operatorQuickChoiceTitleActive]}>{type.name}</Text>
                          <Text style={styles.operatorQuickChoiceText}>{type.sizeLabel || type.note}</Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
                <View style={styles.operatorQuickCard}>
                  <Text style={styles.operatorQuickCardTitle}>Plantilla / marco</Text>
                  <View style={styles.operatorQuickGrid}>
                    {eventTemplateOptions.map((template) => {
                      const active = selectedTemplate.id === template.id && !overlayImageUrl
                      return (
                        <Pressable key={template.id} onPress={() => chooseTemplate(template)} style={[styles.operatorQuickChoice, active && styles.operatorQuickChoiceActive]}>
                          <Text style={[styles.operatorQuickChoiceTitle, active && styles.operatorQuickChoiceTitleActive]}>{template.name}</Text>
                          <Text style={styles.operatorQuickChoiceText}>{active ? 'Activa' : 'Tocar para usar'}</Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
                <View style={styles.operatorQuickTabs}>
                  <Pressable onPress={() => setOperatorQuickPanel('capture')} style={styles.operatorQuickTab}>
                    <Text style={styles.operatorQuickTabText}>Captura</Text>
                  </Pressable>
                  <Pressable onPress={() => setOperatorQuickPanel('print')} style={styles.operatorQuickTab}>
                    <Text style={styles.operatorQuickTabText}>Impresión</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {operatorQuickPanel === 'print' ? (
              <>
                <View style={styles.operatorQuickCard}>
                  {renderPrintSettingsMenu()}
                </View>
                <View style={styles.operatorQuickTabs}>
                  <Pressable onPress={() => setOperatorQuickPanel('event')} style={styles.operatorQuickTab}>
                    <Text style={styles.operatorQuickTabText}>Evento</Text>
                  </Pressable>
                  <Pressable onPress={() => setOperatorQuickPanel('capture')} style={styles.operatorQuickTab}>
                    <Text style={styles.operatorQuickTabText}>Captura</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>
    )
  }

  const renderCapturePhotoScreen = () => (
    <View style={styles.mirrorCapturePage}>
      {renderCamera(styles.mirrorCameraShell, runCountdownAndCapture, false)}
      {renderCaptureStartOverlay()}
      {renderOperatorQuickPanel()}
      <Pressable
        onPress={() => setShowOperatorMenu(true)}
        onLongPress={() => setShowOperatorMenu(true)}
        delayLongPress={450}
        style={styles.operatorHotspot}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú de operario"
      >
        <View style={styles.operatorHotspotHandle} />
      </Pressable>

      <View style={[styles.mirrorTopBar, isMobile && styles.mirrorTopBarMobile]}>
        <View style={styles.mirrorTopInfo}>
          <View style={styles.mirrorBrandRow}>
            <Text style={styles.mirrorBrandText}>Viralco</Text>
            <Text style={styles.mirrorStepText}>Ventana 3</Text>
          </View>
          <Text style={[styles.mirrorTitle, isMobile && styles.mirrorTitleMobile]}>Tomar foto</Text>
          <Text style={styles.mirrorSubText}>
            {retakeFrameIndex === null
              ? `${eventTitle} / ${selectedType.name} / ${selectedTemplate.name}`
            : `Reemplazando foto ${retakeFrameIndex + 1} / ${selectedType.name}`}
          </Text>
        </View>
        <Pressable
          onLongPress={() => setShowOperatorMenu(true)}
          delayLongPress={450}
          style={styles.mirrorStatusPill}
          accessibilityRole="button"
          accessibilityLabel="Conteo de fotos"
        >
          <Text style={styles.mirrorStatusText}>{framesReady}/{selectedShotCount}</Text>
        </Pressable>
      </View>

      {!captureIntroActive && (cameraError || captureStatus) ? (
        <View style={[styles.mirrorStatusToast, isMobile && styles.mirrorStatusToastMobile]}>
          {cameraError ? <Text style={styles.errorText}>{cameraError}</Text> : null}
          <Text style={styles.mirrorCaptureStatus}>{captureStatus}</Text>
        </View>
      ) : null}
      {renderOperatorMenu()}
    </View>
  )

  const renderPreviewOutput = (emptyTitle, emptyText) => (
    <View
      style={[
        styles.outputPreview,
        finalPhotoUrl && styles.outputPreviewFinal,
        finalPhotoUrl && { aspectRatio: selectedType.width / selectedType.height },
      ]}
    >
      {finalPhotoUrl ? (
        <Image source={{ uri: finalPhotoUrl }} style={styles.outputImage} accessibilityLabel="Resultado final de la foto" />
      ) : photoFrames.length ? (
        <View style={styles.previewFrameGrid}>
          {photoFrames.map((frame, index) => (
            <View key={`preview-frame-${index}`} style={styles.previewFrameCard}>
              <Image source={{ uri: frame }} style={styles.previewFrameImage} accessibilityLabel={`Foto capturada ${index + 1}`} />
              <Text style={styles.previewFrameLabel}>Foto {index + 1}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyOutput}>
          <Text style={styles.emptyOutputTitle}>{emptyTitle}</Text>
          <Text style={styles.emptyOutputText}>{emptyText}</Text>
        </View>
      )}
    </View>
  )

  const renderTakenFramesStrip = () =>
    photoFrames.length ? (
      <View style={styles.takenFramesStrip}>
        <View>
          <Text style={styles.takenFramesTitle}>Toca la foto que quieres volver a tomar</Text>
          <Text style={styles.takenFramesHint}>Solo se reemplaza esa foto; las demás se conservan.</Text>
        </View>
        <View style={styles.takenFramesRow}>
          {photoFrames.map((frame, index) => (
            <Pressable
              key={`taken-frame-${index}`}
              onPress={() => startRetakeFrame(index)}
              style={styles.takenFrameButton}
              accessibilityRole="button"
              accessibilityLabel={`Reemplazar foto ${index + 1}`}
            >
              <Image source={{ uri: frame }} style={styles.takenFrameThumb} accessibilityLabel={`Foto ${index + 1} para reemplazar`} />
              <View style={styles.takenFrameShade} />
              <View style={styles.takenFrameBadge}>
                <Text style={styles.takenFrameBadgeText}>{index + 1}</Text>
              </View>
              <View style={styles.takenFrameRetakeIcon}>
                <Text style={styles.takenFrameRetakeIconText}>↻</Text>
              </View>
              <View style={styles.takenFrameReplacePill}>
                <Text style={styles.takenFrameReplaceText}>Volver a tomar</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    ) : null

  const renderDeliverySideActions = () => (
    <View style={styles.deliverySidePanel}>
      <View>
        <Text style={styles.deliverySideEyebrow}>Opciones laterales</Text>
        <Text style={styles.deliverySideTitle}>Entrega al cliente</Text>
        <Text style={styles.deliverySideText}>QR e impresión quedan disponibles apenas termina la sesión.</Text>
      </View>
      <View style={styles.deliveryActionStack}>
        {[
          { key: 'QR', title: 'QR', helper: 'Mostrar código para escanear', icon: 'QR' },
          { key: 'Imprimir', title: 'Imprimir', helper: `${activePrintLabel} · ${normalizedPrintSettings.copies} copia${normalizedPrintSettings.copies === 1 ? '' : 's'}`, icon: 'IMP' },
          { key: 'WhatsApp', title: 'WhatsApp', helper: 'Enviar enlace del recuerdo', icon: 'WA' },
        ].map((action) => (
          <Pressable
            key={action.key}
            onPress={() => runTool(action.key)}
            style={[styles.deliveryActionButton, !captureComplete && styles.deliveryActionButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel={action.title}
          >
            <View style={styles.deliveryActionIcon}>
              <Text style={styles.deliveryActionIconText}>{action.icon}</Text>
            </View>
            <View style={styles.deliveryActionCopy}>
              <Text style={[styles.deliveryActionTitle, !captureComplete && styles.deliveryActionTextDisabled]}>{action.title}</Text>
              <Text style={[styles.deliveryActionHelper, !captureComplete && styles.deliveryActionTextDisabled]}>{action.helper}</Text>
            </View>
            <Text style={[styles.deliveryActionArrow, !captureComplete && styles.deliveryActionTextDisabled]}>›</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => openPrintConfigScreen(false)} style={styles.deliveryConfigButton}>
        <Text style={styles.deliveryConfigText}>Configurar impresión</Text>
      </Pressable>
    </View>
  )

  const renderQrOptionsModal = () => (
    <View style={styles.qrOptionsOverlay}>
      <Pressable onPress={() => setShowQrOptions(false)} style={styles.qrOptionsBackdrop} />
      <View style={styles.qrOptionsCard}>
        <View style={styles.qrOptionsHeader}>
          <View>
            <Text style={styles.qrOptionsEyebrow}>Entrega digital</Text>
            <Text style={styles.qrOptionsTitle}>QR para el cliente</Text>
          </View>
          <Pressable onPress={() => setShowQrOptions(false)} style={styles.qrOptionsClose}>
            <Text style={styles.qrOptionsCloseText}>×</Text>
          </Pressable>
        </View>
        <View style={styles.qrImageFrame}>
          <Image source={{ uri: qrImageUrl }} style={styles.qrImage} accessibilityLabel="Código QR para abrir la foto del cliente" />
        </View>
        <Text style={styles.qrOptionsEvent}>{eventTitle}</Text>
        <Text style={styles.qrOptionsText}>El cliente puede escanear este código después de tomar sus fotos.</Text>
        <View style={styles.qrOptionsActions}>
          <Pressable
            onPress={() => {
              if (typeof window !== 'undefined') {
                window.open(qrImageUrl, '_blank', 'noopener,noreferrer')
              }
            }}
            style={styles.qrSecondaryButton}
          >
            <Text style={styles.qrSecondaryText}>Abrir QR</Text>
          </Pressable>
          <Pressable onPress={() => runTool('Imprimir')} style={styles.qrPrimaryButton}>
            <Text style={styles.qrPrimaryText}>Imprimir</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )

  const renderPreviewScreen = () => (
    <View style={styles.flowStepPage}>
      <View style={[styles.flowStepHeader, isMobile && styles.flowStepHeaderMobile]}>
        <View>
          <Text style={styles.panelEyebrow}>Ventana 4</Text>
          <Text style={[styles.flowStepTitle, isMobile && styles.flowStepTitleMobile]}>Preview</Text>
          <Text style={styles.flowStepText}>Revisa el resultado antes de compartir o imprimir.</Text>
        </View>
      </View>

      <View style={styles.previewOnlyBody}>
        <View style={[styles.deliveryResultLayout, isMobile && styles.deliveryResultLayoutMobile]}>
          {renderPreviewOutput('Preview pendiente', 'Toma la foto para ver el resultado final aquí.')}
          {renderDeliverySideActions()}
        </View>
        {renderTakenFramesStrip()}
        <Text style={styles.captureStatus}>{captureStatus}</Text>
        <View style={[styles.flowFooter, isMobile && styles.flowFooterMobile]}>
          <Pressable
            onPress={() => {
              resetPhoto()
              openCapturePhotoScreen()
            }}
            style={styles.eventOptionsSecondaryButton}
          >
            <Text style={styles.eventOptionsSecondaryText}>← Repetir foto</Text>
          </Pressable>
          <Pressable onPress={captureComplete ? openShareScreen : undefined} style={[styles.eventOptionsPrimaryButton, !captureComplete && styles.flowButtonDisabled]}>
            <Text style={styles.eventOptionsPrimaryText}>Compartir →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )

  const renderShareScreen = () => (
    <View style={styles.flowStepPage}>
      <View style={[styles.flowStepHeader, isMobile && styles.flowStepHeaderMobile]}>
        <View>
          <Text style={styles.panelEyebrow}>Ventana 5</Text>
          <Text style={[styles.flowStepTitle, isMobile && styles.flowStepTitleMobile]}>Compartir</Text>
          <Text style={styles.flowStepText}>Envía por WhatsApp, genera QR o imprime el resultado final.</Text>
        </View>
      </View>

        <View style={styles.shareOnlyBody}>
        <View style={[styles.deliveryResultLayout, isMobile && styles.deliveryResultLayoutMobile]}>
          {renderPreviewOutput('Sin preview', 'Primero toma y confirma la foto.')}
          {renderDeliverySideActions()}
        </View>
        {renderTakenFramesStrip()}
        <View style={[styles.flowFooter, isMobile && styles.flowFooterMobile]}>
          <Pressable onPress={openPreviewScreen} style={styles.eventOptionsSecondaryButton}>
            <Text style={styles.eventOptionsSecondaryText}>← Preview</Text>
          </Pressable>
          <Pressable onPress={() => openEventOptionsScreen(false)} style={styles.eventOptionsSecondaryButton}>
            <Text style={styles.eventOptionsSecondaryText}>Nuevo ajuste</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )

  const renderStartEditor = () => (
    <View style={styles.startEditorPage}>
      <View style={[styles.startEditorHeader, isMobile && styles.startEditorHeaderMobile]}>
        <View style={styles.startEditorHeading}>
          <Text style={[styles.startEditorTitle, isMobile && styles.startEditorTitleMobile]}>
            Editar la Pantalla inicio
          </Text>
          <Text style={[styles.startEditorSubtitle, isMobile && styles.startEditorSubtitleMobile]}>
            Personalice la pantalla inicio para sus invitados
          </Text>
        </View>
        <Pressable onPress={() => setShowStartEditor(false)} style={[styles.startEditorClose, isMobile && styles.startEditorCloseMobile]}>
          <Text style={styles.startEditorCloseText}>⌄</Text>
        </Pressable>
      </View>

      <View style={[styles.startEditorBody, isMobile && styles.startEditorBodyMobile]}>
        <View style={styles.phonePreviewShell}>
          <View style={[styles.phonePreview, { backgroundColor: selectedTemplate.tone }]}>
            <Image source={selectedTemplate.image} style={styles.phonePreviewImage} accessibilityLabel={`Vista previa con plantilla ${selectedTemplate.name}`} />
            <View style={styles.phonePreviewWash} />
            <View style={styles.photoStack}>
              <View style={styles.photoStackBack} />
              <View style={styles.photoStackFront}>
                <Text style={styles.photoStackIcon}>▧</Text>
              </View>
            </View>
            <View style={styles.phoneTitleWrap}>
              <Text style={styles.phoneTitle}>{eventTitle}</Text>
              <Text style={styles.phoneSubtitle}>{eventType || 'Toque Foto para comenzar'}</Text>
            </View>
            <View style={styles.guestModeRow}>
              <View style={styles.guestModeButton}>
                <Text style={styles.guestModeIcon}>▣</Text>
              </View>
              <Text style={styles.guestModeLabel}>Foto</Text>
            </View>
          </View>
        </View>

        <View style={styles.editorSidePanel}>
          <Text style={styles.panelEyebrow}>Inicio invitado</Text>
          <Text style={styles.panelTitle}>Solo botón de foto</Text>
          <Text style={styles.editorSideText}>
            Esta pantalla es lo primero que ve el invitado. Cada botón de abajo aplica un cambio real sobre imagen, texto, tema, color, diseño o fondo.
          </Text>
          <View style={styles.activeToolNotice}>
            <Text style={styles.activeToolTitle}>
              Herramienta activa: {editorTools.find((tool) => tool.id === activeEditorTool)?.label || 'Diseño de foto'}
            </Text>
            <Text style={styles.activeToolText}>{captureStatus}</Text>
          </View>
          <View style={styles.editorSummaryGrid}>
            <View style={styles.editorSummaryCard}>
              <Text style={styles.editorSummaryValue}>{selectedType.name}</Text>
              <Text style={styles.editorSummaryLabel}>Diseño activo</Text>
            </View>
            <View style={styles.editorSummaryCard}>
              <Text style={styles.editorSummaryValue}>{selectedTemplate.name}</Text>
              <Text style={styles.editorSummaryLabel}>Marco base</Text>
            </View>
          </View>
          <Pressable onPress={openPhotoDesignScreen} style={styles.editorNextButton}>
            <Text style={styles.editorNextButtonText}>Diseño de foto →</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.editorToolbar}>
        {editorTools.map((tool) => {
          const active = tool.id === activeEditorTool
          return (
            <Pressable
              key={tool.id}
              onPress={() => handleEditorTool(tool.id)}
              style={styles.editorTool}
            >
              <View style={[styles.editorToolIcon, active && styles.editorToolIconActive]}>
                <Text style={[styles.editorToolIconText, active && styles.editorToolIconTextActive]}>{tool.icon}</Text>
              </View>
              <Text style={styles.editorToolLabel}>{tool.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )

  const renderPhotoDesignScreen = () => {
    const slots =
      layoutVariant === 2
        ? [
            { x: 0, y: 0, width: 100, height: 55 },
            { x: 0, y: 55, width: 50, height: 45 },
            { x: 50, y: 55, width: 50, height: 45 },
          ]
        : [
            { x: 0, y: 0, width: 50, height: 50 },
            { x: 50, y: 0, width: 50, height: 50 },
            { x: 0, y: 50, width: 50, height: 50 },
            { x: 50, y: 50, width: 50, height: 50 },
          ]

    return (
      <View style={styles.photoDesignPage}>
        <View style={styles.photoDesignTop}>
          <Pressable onPress={() => setShowPhotoDesignScreen(false)} style={[styles.startEditorClose, styles.photoDesignClose]}>
            <Text style={styles.startEditorCloseText}>⌄</Text>
          </Pressable>
        </View>

        <View style={styles.photoDesignPreviewWrap}>
          <View style={styles.photoDesignPreview}>
            {slots.map((slot, index) => (
              <View
                key={`${selectedType.id}-design-${index}`}
                style={[
                  styles.photoDesignSlot,
                  {
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    width: `${slot.width}%`,
                    height: `${slot.height}%`,
                    backgroundColor: ['#0a4de8', '#2563eb', '#60a5fa', '#dbeafe'][index % 4],
                  },
                ]}
              >
                <Text style={styles.photoDesignPerson}>{index % 2 === 0 ? '◖' : '◗'}</Text>
                <Text style={styles.photoDesignSlotNumber}>{index + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.photoDesignControls}>
          <Pressable
            onPress={() => {
              if (typeof window !== 'undefined') {
                window.open(`https://wa.me/?text=${encodeURIComponent(`${eventTitle}: vista previa Viralco lista`)}`, '_blank', 'noopener,noreferrer')
              }
              setCaptureStatus('Vista previa preparada para compartir.')
            }}
            style={styles.previewShareButton}
          >
            <Text style={styles.previewShareText}>Compartir{'\n'}vista previa</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              const nextLayout = layoutVariant === 1 ? 2 : 1
              setLayoutVariant(nextLayout)
              setCaptureStatus(`Layout ${nextLayout} aplicado al diseño de foto.`)
            }}
            style={styles.layoutPicker}
          >
            <Text style={styles.layoutPickerText}>Layout {layoutVariant}⌄</Text>
          </Pressable>
          <View style={styles.activeToolNotice}>
            <Text style={styles.activeToolTitle}>
              Herramienta activa: {designTools.find((tool) => tool.id === activeDesignTool)?.label || 'Diseño de impresión'}
            </Text>
            <Text style={styles.activeToolText}>{captureStatus}</Text>
          </View>
          <View style={styles.designToolGrid}>
            {designTools.map((tool) => {
              const active = tool.id === activeDesignTool
              return (
                <Pressable key={tool.id} onPress={() => handleDesignTool(tool.id)} style={styles.designTool}>
                  <View style={[styles.designToolIcon, active && styles.designToolIconActive]}>
                    <Text style={[styles.designToolIconText, active && styles.designToolIconTextActive]}>
                      {tool.icon}
                    </Text>
                  </View>
                  <Text style={styles.designToolLabel}>{tool.label}</Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        <View style={[styles.captureModeFooter, isMobile && styles.captureModeFooterMobile]}>
          <Pressable onPress={() => openEventOptionsScreen(false)} style={styles.captureModeFooterButton}>
            <Text style={[styles.captureModeFooterText, isMobile && styles.captureModeFooterTextMobile]}>← Configurar fotos</Text>
          </Pressable>
          <Pressable onPress={openCaptureModeScreen} style={styles.captureModeFooterButton}>
            <Text style={[styles.captureModeFooterText, isMobile && styles.captureModeFooterTextMobile]}>Modo de captura →</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  const renderCaptureModeScreen = () => (
    <View style={styles.captureModePage}>
      <View style={[styles.captureModeHeader, isMobile && styles.captureModeHeaderMobile]}>
        <View style={styles.startEditorHeading}>
          <Text style={[styles.startEditorTitle, isMobile && styles.startEditorTitleMobile]}>
            Modo de captura
          </Text>
          <Text style={[styles.startEditorSubtitle, isMobile && styles.startEditorSubtitleMobile]}>
            ¿Cuál modo desea habilitar?
          </Text>
        </View>
        <Pressable onPress={() => setShowCaptureModeScreen(false)} style={[styles.startEditorClose, isMobile && styles.startEditorCloseMobile]}>
          <Text style={styles.startEditorCloseText}>⌄</Text>
        </Pressable>
      </View>

      <View style={styles.captureModeContent}>
        <View style={styles.captureModeCard}>
          <View style={styles.captureModeIconWrap}>
            <Text style={styles.captureModeIcon}>▣</Text>
          </View>
          <Text style={styles.captureModeTitle}>Foto</Text>
          <Text style={styles.captureModeText}>Capturar fotos para impresión y entrega digital</Text>
          <View style={styles.captureModeEnabled}>
            <Text style={styles.captureModeEnabledText}>Habilitado</Text>
          </View>
        </View>
      </View>

      <View style={[styles.captureModeFooter, isMobile && styles.captureModeFooterMobile]}>
        <Pressable onPress={() => {
          setShowCaptureModeScreen(false)
          setShowPhotoDesignScreen(true)
        }} style={styles.captureModeFooterButton}>
          <Text style={[styles.captureModeFooterText, isMobile && styles.captureModeFooterTextMobile]}>← Diseño de foto</Text>
        </Pressable>
        <Pressable onPress={() => openCaptureConfigScreen(false)} style={styles.captureModeFooterButton}>
          <Text style={[styles.captureModeFooterText, isMobile && styles.captureModeFooterTextMobile]}>Configuración de captura →</Text>
        </Pressable>
      </View>
    </View>
  )

  const renderGifSettingsCard = () => (
    <View style={styles.photoConfigCard}>
      <View style={styles.gifHeaderRow}>
        <View>
          <Text style={styles.photoConfigTitle}>GIFs</Text>
          <Text style={styles.gifSubtitle}>Imágenes para superponer</Text>
        </View>
        <label style={styles.gifSelectButton}>
          <Text style={styles.gifSelectButtonText}>Seleccionar</Text>
          <input accept="image/gif,image/png,image/webp,image/*" type="file" onChange={handleGifOverlayFile} style={{ display: 'none' }} />
        </label>
      </View>

      <View style={styles.gifPreviewRow}>
        <Pressable
          onPress={() => setCaptureStatus('GIF anterior seleccionado.')}
          style={styles.gifArrowButton}
          accessibilityRole="button"
          accessibilityLabel="GIF anterior"
        >
          <Text style={styles.gifArrowText}>‹</Text>
        </Pressable>
        <View style={styles.gifPreviewBox}>
          {gifOverlayUrl ? (
            <Image source={{ uri: gifOverlayUrl }} style={styles.gifPreviewImage} accessibilityLabel="Vista previa de imagen superpuesta" />
          ) : (
            <Text style={styles.gifPreviewIcon}>GIF</Text>
          )}
        </View>
        <Pressable
          onPress={() => setCaptureStatus('GIF siguiente seleccionado.')}
          style={styles.gifArrowButton}
          accessibilityRole="button"
          accessibilityLabel="GIF siguiente"
        >
          <Text style={styles.gifArrowText}>›</Text>
        </Pressable>
      </View>

      <Text style={styles.gifMeta}>
        {gifOverlayFileName || 'Transparent PNG'}{'\n'}AI: 720px An: 1280px
      </Text>

      <Pressable onPress={cycleGifOverlaySize} style={styles.sizeRow}>
        <Text style={styles.photoSettingLabel}>Tamaño</Text>
        <Text style={styles.sizeValue}>{gifOverlaySize}⌄</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          setGifReverse((value) => !value)
          setCaptureStatus(`Reverso de GIF ${gifReverse ? 'desactivado' : 'activado'}.`)
        }}
        style={styles.checkRow}
      >
        <View style={[styles.checkBox, !gifReverse && styles.checkBoxOff]}>
          <Text style={styles.checkMark}>{gifReverse ? '✓' : ''}</Text>
        </View>
        <View style={styles.checkCopy}>
          <Text style={styles.checkTitle}>Reverso</Text>
          <Text style={styles.checkText}>Reproduce el GIF hacia adelante y luego hacia atrás</Text>
        </View>
      </Pressable>

      <View style={styles.photoSettingRow}>
        <Text style={styles.photoSettingLabel}>Cuenta regresiva antes</Text>
        <View style={styles.photoSliderWrap}>
          {renderRangeSlider({
            value: gifCountdownFirst,
            min: 1,
            max: 10,
            onChange: setGifCountdownFirst,
            statusText: (value) => `GIF: cuenta regresiva inicial en ${value} sec.`,
          })}
        </View>
        <Text style={styles.photoSettingValue}>{gifCountdownFirst} sec</Text>
      </View>

      <View style={styles.photoSettingRow}>
        <Text style={styles.photoSettingLabel}>Cuenta regresiva antes de las otras fotos</Text>
        <View style={styles.photoSliderWrap}>
          {renderRangeSlider({
            value: gifCountdownNext,
            min: 1,
            max: 10,
            onChange: setGifCountdownNext,
            statusText: (value) => `GIF: cuenta regresiva de siguientes fotos en ${value} sec.`,
          })}
        </View>
        <Text style={styles.photoSettingValue}>{gifCountdownNext} sec</Text>
      </View>

      <View style={styles.photoSettingRow}>
        <Text style={styles.photoSettingLabel}>Mostrar cada foto</Text>
        <View style={styles.photoSliderWrap}>
          {renderRangeSlider({
            value: gifReviewSeconds,
            min: 1,
            max: 6,
            onChange: setGifReviewSeconds,
            statusText: (value) => `GIF: cada foto se mostrará ${value} sec.`,
          })}
        </View>
        <Text style={styles.photoSettingValue}>{gifReviewSeconds} sec</Text>
      </View>

      <View style={styles.photoSettingRow}>
        <Text style={styles.photoSettingLabel}>Capturar</Text>
        <View style={styles.photoSliderWrap}>
          {renderRangeSlider({
            value: gifCaptureCount,
            min: 1,
            max: 8,
            onChange: setGifCaptureCount,
            statusText: (value) => `GIF configurado para capturar ${value} foto${value === 1 ? '' : 's'}.`,
          })}
        </View>
        <Text style={styles.photoSettingValue}>{gifCaptureCount} fotos</Text>
      </View>

      <View style={styles.photoSettingRow}>
        <Text style={styles.photoSettingLabel}>Retardo</Text>
        <View style={styles.photoSliderWrap}>
          {renderRangeSlider({
            value: gifDelayMs,
            min: 100,
            max: 1000,
            step: 50,
            onChange: setGifDelayMs,
            statusText: (value) => `Retardo de GIF cambiado a ${value} ms.`,
          })}
        </View>
        <Text style={styles.photoSettingValue}>{gifDelayMs} ms</Text>
      </View>

      <Pressable
        onPress={() => {
          setRoamingMode((value) => !value)
          setCaptureStatus(`Modo fotógrafo itinerante ${roamingMode ? 'desactivado' : 'activado'}.`)
        }}
      >
        <Text style={styles.previewConfigLink}>Modo fotógrafo itinerante {roamingMode ? 'activo' : '›'}</Text>
      </Pressable>
    </View>
  )

  const renderCaptureConfigScreen = () => (
    <View style={styles.captureConfigPage}>
      <View style={[styles.captureModeHeader, isMobile && styles.captureModeHeaderMobile]}>
        <View style={styles.startEditorHeading}>
          <Text style={[styles.startEditorTitle, isMobile && styles.startEditorTitleMobile]}>
            Configuración de captura
          </Text>
          <Text style={[styles.startEditorSubtitle, isMobile && styles.startEditorSubtitleMobile]}>
            Ajuste las configuraciones predeterminadas de captura
          </Text>
        </View>
        {operatorSettingsActive ? (
          <Pressable onPress={closeOperatorSettingsToCapture} style={styles.operatorDoneButton} accessibilityRole="button" accessibilityLabel="Listo, volver a tomar fotos">
            <Text style={styles.operatorDoneButtonText}>Listo</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => setShowCaptureConfigScreen(false)} style={[styles.startEditorClose, isMobile && styles.startEditorCloseMobile]}>
            <Text style={styles.startEditorCloseText}>⌄</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.captureConfigContent}>
        <View style={styles.activeToolNotice}>
          <Text style={styles.activeToolTitle}>Configuración activa</Text>
          <Text style={styles.activeToolText}>{captureStatus}</Text>
        </View>
        <View style={styles.photoConfigCard}>
          <Text style={styles.photoConfigTitle}>Foto</Text>

          <View style={styles.photoSettingRow}>
            <Text style={styles.photoSettingLabel}>Cuenta regresiva antes</Text>
            <View style={styles.photoSliderWrap}>
              {renderRangeSlider({
                value: photoCountdownFirst,
                min: 1,
                max: 10,
                onChange: setPhotoCountdownFirst,
                statusText: (value) => `Cuenta regresiva antes configurada en ${value} sec.`,
              })}
            </View>
            <Text style={styles.photoSettingValue}>{photoCountdownFirst} sec</Text>
          </View>

          <View style={styles.photoSettingRow}>
            <Text style={styles.photoSettingLabel}>Cuenta regresiva antes de las otras fotos</Text>
            <View style={styles.photoSliderWrap}>
              {renderRangeSlider({
                value: photoCountdownNext,
                min: 1,
                max: 10,
                onChange: setPhotoCountdownNext,
                statusText: (value) => `Cuenta regresiva de siguientes fotos configurada en ${value} sec.`,
              })}
            </View>
            <Text style={styles.photoSettingValue}>{photoCountdownNext} sec</Text>
          </View>

          <View style={styles.photoSettingRow}>
            <Text style={styles.photoSettingLabel}>Mostrar cada foto</Text>
            <View style={styles.photoSliderWrap}>
              {renderRangeSlider({
                value: photoReviewSeconds,
                min: 1,
                max: 6,
                onChange: setPhotoReviewSeconds,
                statusText: (value) => `Cada foto se mostrará ${value} sec antes de continuar.`,
              })}
            </View>
            <Text style={styles.photoSettingValue}>{photoReviewSeconds} sec</Text>
          </View>

          <Pressable
            onPress={() => {
              setCaptureOriginal((value) => !value)
              setCaptureStatus(`Guardar foto original ${captureOriginal ? 'desactivado' : 'activado'}.`)
            }}
            style={styles.checkRow}
          >
            <View style={[styles.checkBox, !captureOriginal && styles.checkBoxOff]}>
              <Text style={styles.checkMark}>{captureOriginal ? '✓' : ''}</Text>
            </View>
            <View style={styles.checkCopy}>
              <Text style={styles.checkTitle}>Guardar foto original</Text>
              <Text style={styles.checkText}>Conserva una copia limpia además del diseño final</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              setRoamingMode((value) => !value)
              setCaptureStatus(`Modo fotógrafo itinerante ${roamingMode ? 'desactivado' : 'activado'}.`)
            }}
          >
            <Text style={styles.previewConfigLink}>Modo fotógrafo itinerante {roamingMode ? 'activo' : '›'}</Text>
          </Pressable>
        </View>

        {renderGifSettingsCard()}

        <View style={styles.photoConfigCard}>
          <Text style={styles.photoConfigTitle}>Calidad y guía</Text>

          <View style={styles.photoSettingRow}>
            <Text style={styles.photoSettingLabel}>Calidad</Text>
            <View style={styles.photoSliderWrap}>
              {renderRangeSlider({
                value: Math.max(0, qualityOptions.indexOf(qualityMode)),
                min: 0,
                max: qualityOptions.length - 1,
                onChange: (value) => setQualityMode(qualityOptions[value] || 'Alta'),
                statusText: (value) => `Calidad de captura cambiada a ${qualityOptions[value] || 'Alta'}.`,
              })}
              <View style={styles.qualityScale}>
                <Text style={styles.previewConfigMeta}>Archivo ligero</Text>
                <Text style={styles.previewConfigMeta}>Superior</Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                const nextQuality = qualityMode === 'Alta' ? 'Superior' : qualityMode === 'Superior' ? 'Media' : 'Alta'
                setQualityMode(nextQuality)
                setCaptureStatus(`Calidad de captura cambiada a ${nextQuality}.`)
              }}
            >
              <Text style={styles.photoSettingValue}>{qualityMode}</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              const currentIndex = photoTypes.findIndex((item) => item.id === selectedType.id)
              chooseType(photoTypes[(currentIndex + 1) % photoTypes.length])
            }}
            style={styles.sizeRow}
          >
            <Text style={styles.photoSettingLabel}>Tamaño</Text>
            <Text style={styles.sizeValue}>{selectedType.name}⌄</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setFlashBeforePhoto((value) => !value)
              setCaptureStatus(`Flash antes de la foto ${flashBeforePhoto ? 'desactivado' : 'activado'}.`)
            }}
            style={styles.checkRow}
          >
            <View style={[styles.checkBox, !flashBeforePhoto && styles.checkBoxOff]}>
              <Text style={styles.checkMark}>{flashBeforePhoto ? '✓' : ''}</Text>
            </View>
            <View style={styles.checkCopy}>
              <Text style={styles.checkTitle}>Flash antes de la foto</Text>
              <Text style={styles.checkText}>Ilumina la pantalla antes de capturar</Text>
            </View>
          </Pressable>

          <View style={styles.configBlock}>
            <Text style={styles.configTitle}>Preset</Text>
            <View style={styles.presetGrid}>
              {['Suave', 'Rápido', 'Fiesta', 'Evento'].map((preset) => (
                <Pressable
                  key={preset}
                  onPress={() => applyCapturePreset(preset)}
                  style={[styles.presetPill, activePreset === preset && styles.presetPillActive]}
                >
                  <Text style={[styles.presetPillText, activePreset === preset && styles.presetPillTextActive]}>{preset}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.photoConfigCard}>
          <Text style={styles.photoConfigTitle}>Textos y animación</Text>

          <View style={styles.scriptPreviewBox}>
            <Text style={styles.normalPreviewName}>{getPhotoNameText()}</Text>
            {getPhotoEventText() ? <Text style={styles.normalPreviewDetail}>{getPhotoEventText()}</Text> : null}
            <Text style={styles.normalPreviewDate}>{getPhotoDateText()}</Text>
            <Text style={styles.scriptPreviewMeta}>Nombre, fecha y texto en letra normal.</Text>
          </View>

          <TextInput
            value={photoNameText}
            onChangeText={(value) => {
              setPhotoNameText(value)
              setCaptureStatus('Nombre de la foto actualizado.')
            }}
            placeholder={`Nombre (${eventTitle})`}
            placeholderTextColor="#9ca3af"
            style={styles.scriptInput}
          />

          <TextInput
            value={photoEventText}
            onChangeText={(value) => {
              setPhotoEventText(value)
              setCaptureStatus('Texto inferior de la foto actualizado.')
            }}
            placeholder="Texto inferior opcional"
            placeholderTextColor="#9ca3af"
            style={styles.scriptInput}
          />

          <TextInput
            value={photoDateText}
            onChangeText={(value) => {
              setPhotoDateText(value)
              setCaptureStatus('Fecha de la foto actualizada.')
            }}
            placeholder={`Fecha (${formatEventDate()})`}
            placeholderTextColor="#9ca3af"
            style={styles.scriptInput}
          />

          <TextInput
            value={photoScriptText}
            onChangeText={(value) => {
              setPhotoScriptText(value)
              setCaptureStatus('Frase superior de la foto actualizada.')
            }}
            placeholder="Frase superior de la tira"
            placeholderTextColor="#9ca3af"
            style={styles.scriptInput}
          />

          <View style={styles.presetGrid}>
            {photoTextPresets.map((preset) => (
              <Pressable
                key={preset}
                onPress={() => {
                  setPhotoScriptText(preset)
                  setCaptureStatus(`Texto para la foto cambiado a: ${preset}.`)
                }}
                style={[styles.presetPill, photoScriptText === preset && styles.presetPillActive]}
              >
                <Text style={[styles.presetPillText, photoScriptText === preset && styles.presetPillTextActive]}>{preset}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => {
              const options = ['Prepárese', 'Sonría', 'Mire al espejo']
              const nextText = options[(options.indexOf(preCaptureText) + 1) % options.length]
              setPreCaptureText(nextText)
              setCaptureStatus(`Texto antes de capturar cambiado a: ${nextText}.`)
            }}
            style={styles.sizeRow}
          >
            <Text style={styles.photoSettingLabel}>Texto antes de tomar foto</Text>
            <Text style={styles.sizeValue}>{preCaptureText}</Text>
          </Pressable>

          <View style={styles.animationPicker}>
            {captureAnimationPresets.map((animation) => (
              <Pressable
                key={animation.id}
                onPress={() => {
                  setCaptureAnimation(animation.id)
                  setCaptureStatus(`Animación antes y entre fotos: ${animation.label}.`)
                }}
                style={[styles.animationChoice, captureAnimation === animation.id && styles.animationChoiceActive]}
              >
                <View style={styles.animationChoiceIcon} />
                <Text style={[styles.animationChoiceText, captureAnimation === animation.id && styles.animationChoiceTextActive]}>{animation.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.photoConfigCard}>
          <Text style={styles.photoConfigTitle}>Vista previa de foto</Text>
          <View style={styles.previewConfigRow}>
            <Image source={selectedTemplate.image} style={styles.previewConfigImage} accessibilityLabel={`Plantilla seleccionada ${selectedTemplate.name}`} />
            <View style={styles.previewConfigCopy}>
              <Pressable
                onPress={async () => {
                  if (!photoFrames.length) {
                    setCaptureStatus('Toma una foto para generar una previsualización real.')
                    return
                  }
                  const output = await composeFinalPhoto(photoFrames)
                  setFinalPhotoUrl(output)
                  setCaptureStatus('Previsualización real actualizada con la configuración activa.')
                }}
                style={styles.previewConfigButton}
              >
                <Text style={styles.previewConfigButtonText}>Previsualizar</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const nextTemplate = cycleTemplateForCurrentEvent()
                  setCaptureStatus(`Foto de prueba cambiada a ${nextTemplate.name}.`)
                }}
              >
                <Text style={styles.previewConfigLink}>Seleccionar foto de prueba ›</Text>
              </Pressable>
              <Text style={styles.previewConfigMeta}>
                JPG/PNG recomendado. La app usará {selectedShotCount} foto{selectedShotCount === 1 ? '' : 's'} en el layout activo.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.captureModeFooter, isMobile && styles.captureModeFooterMobile]}>
        <Pressable
          onPress={operatorSettingsActive ? () => openEventOptionsScreen(true) : () => {
            setShowCaptureConfigScreen(false)
            setShowPrintConfigScreen(false)
            setShowCaptureModeScreen(true)
          }}
          style={styles.captureModeFooterButton}
        >
          <Text style={[styles.captureModeFooterText, isMobile && styles.captureModeFooterTextMobile]}>
            {operatorSettingsActive ? 'Evento y marco' : '← Modo de captura'}
          </Text>
        </Pressable>
        <Pressable onPress={operatorSettingsActive ? closeOperatorSettingsToCapture : openBackgroundRemovalScreen} style={operatorSettingsActive ? styles.eventOptionsPrimaryButton : styles.captureModeFooterButton}>
          <Text style={operatorSettingsActive ? styles.eventOptionsPrimaryText : [styles.captureModeFooterText, isMobile && styles.captureModeFooterTextMobile]}>
            {operatorSettingsActive ? 'Listo' : 'Eliminación de fondo →'}
          </Text>
        </Pressable>
        {operatorSettingsActive ? (
          <Pressable onPress={() => openPrintConfigScreen(true)} style={styles.captureModeFooterButton}>
            <Text style={[styles.captureModeFooterText, isMobile && styles.captureModeFooterTextMobile]}>Impresión</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )

  const renderPrintConfigScreen = () => (
    <View style={styles.captureConfigPage}>
      <View style={[styles.captureModeHeader, isMobile && styles.captureModeHeaderMobile]}>
        <View style={styles.startEditorHeading}>
          <Text style={[styles.startEditorTitle, isMobile && styles.startEditorTitleMobile]}>
            Configuración de impresión
          </Text>
          <Text style={[styles.startEditorSubtitle, isMobile && styles.startEditorSubtitleMobile]}>
            Ajuste papel, copias e impresora antes de imprimir
          </Text>
        </View>
        {operatorSettingsActive ? (
          <Pressable onPress={closeOperatorSettingsToCapture} style={styles.operatorDoneButton} accessibilityRole="button" accessibilityLabel="Listo, volver a tomar fotos">
            <Text style={styles.operatorDoneButtonText}>Listo</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => openEventOptionsScreen(false)} style={[styles.startEditorClose, isMobile && styles.startEditorCloseMobile]}>
            <Text style={styles.startEditorCloseText}>⌄</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.captureConfigContent}>
        <View style={styles.activeToolNotice}>
          <Text style={styles.activeToolTitle}>Impresión activa</Text>
          <Text style={styles.activeToolText}>{captureStatus}</Text>
        </View>
        {renderPrintSettingsMenu()}
      </View>

      <View style={[styles.captureModeFooter, isMobile && styles.captureModeFooterMobile]}>
        <Pressable onPress={() => openEventOptionsScreen(operatorSettingsActive)} style={styles.captureModeFooterButton}>
          <Text style={[styles.captureModeFooterText, isMobile && styles.captureModeFooterTextMobile]}>← Configurar fotos</Text>
        </Pressable>
        <Pressable
          onPress={operatorSettingsActive ? closeOperatorSettingsToCapture : () => openCaptureConfigScreen(false)}
          style={operatorSettingsActive ? styles.eventOptionsPrimaryButton : styles.captureModeFooterButton}
        >
          <Text style={operatorSettingsActive ? styles.eventOptionsPrimaryText : [styles.captureModeFooterText, isMobile && styles.captureModeFooterTextMobile]}>
            {operatorSettingsActive ? 'Listo' : 'Configuración de captura →'}
          </Text>
        </Pressable>
        {operatorSettingsActive ? (
          <Pressable onPress={() => openCaptureConfigScreen(true)} style={styles.captureModeFooterButton}>
            <Text style={[styles.captureModeFooterText, isMobile && styles.captureModeFooterTextMobile]}>Captura</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )

  const renderBackgroundRemovalScreen = () => (
    <View style={styles.backgroundRemovalPage}>
      <View style={[styles.captureModeHeader, isMobile && styles.captureModeHeaderMobile]}>
        <View style={styles.startEditorHeading}>
          <Text style={[styles.startEditorTitle, isMobile && styles.startEditorTitleMobile]}>
            Eliminación de fondo
          </Text>
          <Text style={[styles.startEditorSubtitle, isMobile && styles.startEditorSubtitleMobile]}>
            Configure cómo se limpia la foto antes de aplicar el diseño final
          </Text>
        </View>
        <Pressable onPress={() => setShowBackgroundRemovalScreen(false)} style={[styles.startEditorClose, isMobile && styles.startEditorCloseMobile]}>
          <Text style={styles.startEditorCloseText}>⌄</Text>
        </Pressable>
      </View>

      <View style={[styles.backgroundRemovalContent, isMobile && styles.backgroundRemovalContentMobile]}>
        <View style={styles.backgroundPreviewPanel}>
          <View style={styles.backgroundPreviewCanvas}>
            <View style={styles.backgroundBefore}>
              <Image source={selectedTemplate.image} style={styles.backgroundPreviewImage} accessibilityLabel={`Fondo original ${selectedTemplate.name}`} />
              <View style={styles.backgroundBeforeWash} />
              <Text style={styles.backgroundPreviewLabel}>Original</Text>
            </View>
            <View style={styles.backgroundAfter}>
              <View style={styles.transparentGrid} />
              <View style={styles.personCutout}>
                <Text style={styles.personCutoutHead}>●</Text>
                <Text style={styles.personCutoutBody}>◕</Text>
              </View>
              <Text style={styles.backgroundPreviewLabel}>Fondo eliminado</Text>
            </View>
          </View>
          <View style={styles.backgroundPreviewMeta}>
            <Text style={styles.backgroundPreviewTitle}>Vista previa del invitado</Text>
            <Text style={styles.backgroundPreviewText}>
              El recorte conserva la persona y deja el marco listo para WhatsApp, QR o impresión.
            </Text>
          </View>
        </View>

        <View style={styles.backgroundSettingsPanel}>
          <View style={styles.activeToolNotice}>
            <Text style={styles.activeToolTitle}>Fondo activo: {backgroundFinal}</Text>
            <Text style={styles.activeToolText}>{captureStatus}</Text>
          </View>

          <Pressable
            onPress={() => {
              setBackgroundEnabled((value) => !value)
              setCaptureStatus(`Eliminación de fondo ${backgroundEnabled ? 'desactivada' : 'activada'}.`)
            }}
            style={styles.backgroundToggleRow}
          >
            <View style={styles.backgroundToggleCopy}>
              <Text style={styles.photoConfigTitle}>Eliminar fondo</Text>
              <Text style={styles.backgroundSettingText}>
                {backgroundEnabled ? 'Activado para cada foto capturada' : 'Desactivado para conservar el fondo original'}
              </Text>
            </View>
            <View style={[styles.toggleSwitch, !backgroundEnabled && styles.toggleSwitchOff]}>
              <View style={[styles.toggleKnob, !backgroundEnabled && styles.toggleKnobOff]} />
            </View>
          </Pressable>

          <View style={styles.backgroundSettingBlock}>
            <Text style={styles.backgroundSettingLabel}>Modo de recorte</Text>
            <View style={styles.segmentedControl}>
              {['Automático', 'Suave', 'Preciso'].map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    setBackgroundCutMode(option)
                    setCaptureStatus(`Modo de recorte cambiado a ${option}.`)
                  }}
                  style={[styles.segmentedOption, option === backgroundCutMode && styles.segmentedOptionActive]}
                >
                  <Text style={[styles.segmentedOptionText, option === backgroundCutMode && styles.segmentedOptionTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.backgroundSettingBlock}>
            <Text style={styles.backgroundSettingLabel}>Fondo final</Text>
            <View style={styles.backgroundChoiceGrid}>
              {[
                { label: 'Transparente', tone: '#ffffff', pattern: true },
                { label: 'Color Viralco', tone: colors.blue },
                { label: 'Plantilla', tone: selectedTemplate.tone },
                { label: 'Desenfoque', tone: '#64748b' },
              ].map((choice) => (
                <Pressable
                  key={choice.label}
                  onPress={() => {
                    setBackgroundFinal(choice.label)
                    setCaptureStatus(`Fondo final cambiado a ${choice.label}.`)
                  }}
                  style={[styles.backgroundChoice, backgroundFinal === choice.label && styles.backgroundChoiceActive]}
                >
                  <View style={[styles.backgroundChoiceSwatch, { backgroundColor: choice.tone }]}>
                    {choice.pattern ? <View style={styles.backgroundChoicePattern} /> : null}
                  </View>
                  <Text style={styles.backgroundChoiceText}>{choice.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.backgroundSettingBlock}>
            <Text style={styles.backgroundSettingLabel}>Ajustes</Text>
            <Pressable
              onPress={() => {
                const options = ['Bajo', 'Medio', 'Alto']
                const nextValue = options[(options.indexOf(edgeSoftness) + 1) % options.length]
                setEdgeSoftness(nextValue)
                setCaptureStatus(`Suavizar bordes cambiado a ${nextValue}.`)
              }}
              style={styles.backgroundSettingRow}
            >
              <Text style={styles.backgroundSettingText}>Suavizar bordes</Text>
              <Text style={styles.backgroundSettingValue}>{edgeSoftness}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setKeepShadow((value) => !value)
                setCaptureStatus(`Conservar sombra ${keepShadow ? 'desactivado' : 'activado'}.`)
              }}
              style={styles.backgroundSettingRow}
            >
              <Text style={styles.backgroundSettingText}>Conservar sombra</Text>
              <Text style={styles.backgroundSettingValue}>{keepShadow ? 'Sí' : 'No'}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setApplyFrameAfter((value) => !value)
                setCaptureStatus(`Aplicar marco después ${applyFrameAfter ? 'desactivado' : 'activado'}.`)
              }}
              style={styles.backgroundSettingRow}
            >
              <Text style={styles.backgroundSettingText}>Aplicar marco después</Text>
              <Text style={styles.backgroundSettingValue}>{applyFrameAfter ? selectedTemplate.name : 'No'}</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              setFinalPhotoUrl('')
              setPhotoFrames([])
              setCaptureStatus(`Prueba de fondo lista: ${backgroundCutMode}, ${backgroundFinal}.`)
            }}
            style={styles.backgroundTestButton}
          >
            <Text style={styles.backgroundTestButtonText}>Probar con foto de ejemplo</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.captureModeFooter, isMobile && styles.captureModeFooterMobile]}>
        <Pressable onPress={() => {
          setShowBackgroundRemovalScreen(false)
          setShowCaptureConfigScreen(true)
        }} style={styles.captureModeFooterButton}>
          <Text style={[styles.captureModeFooterText, isMobile && styles.captureModeFooterTextMobile]}>← Configuración de captura</Text>
        </Pressable>
        <Pressable onPress={() => setShowBackgroundRemovalScreen(false)} style={styles.captureModeFooterButton}>
          <Text style={[styles.captureModeFooterText, isMobile && styles.captureModeFooterTextMobile]}>Finalizar →</Text>
        </Pressable>
      </View>
    </View>
  )

  if (showStartEditor) {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.pageContent}>
          {renderStartEditor()}
        </ScrollView>
      </View>
    )
  }

  if (showPhotoDesignScreen) {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.pageContent}>
          {renderPhotoDesignScreen()}
        </ScrollView>
      </View>
    )
  }

  if (showCaptureModeScreen) {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.pageContent}>
          {renderCaptureModeScreen()}
        </ScrollView>
      </View>
    )
  }

  if (showCaptureConfigScreen) {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.pageContent}>
          {renderCaptureConfigScreen()}
        </ScrollView>
      </View>
    )
  }

  if (showPrintConfigScreen) {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.pageContent}>
          {renderPrintConfigScreen()}
        </ScrollView>
      </View>
    )
  }

  if (showBackgroundRemovalScreen) {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.pageContent}>
          {renderBackgroundRemovalScreen()}
        </ScrollView>
      </View>
    )
  }

  if (showHomeLauncher) {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={[styles.pageContent, styles.homePageContent]}>
          {renderHomeLauncher()}
        </ScrollView>
        {showCreateEventModal && renderCreateEventModal()}
      </View>
    )
  }

  if (showCustomPhotoLayoutScreen) {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.pageContent}>
          {renderCustomPhotoLayoutScreen()}
        </ScrollView>
      </View>
    )
  }

  if (showEventOptionsScreen) {
    if (showCustomPhotoLayoutScreen) {
      return (
        <View style={styles.page}>
          <ScrollView contentContainerStyle={styles.pageContent}>
            {renderCustomPhotoLayoutScreen()}
          </ScrollView>
        </View>
      )
    }

    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.pageContent}>
          {renderEventOptionsScreen()}
        </ScrollView>
        {showCreateEventModal && renderCreateEventModal()}
      </View>
    )
  }

  if (showAnimationVideoScreen) {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.pageContent}>
          {renderAnimationVideoScreen()}
        </ScrollView>
      </View>
    )
  }

  if (showCapturePhotoScreen) {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.mirrorPageContent}>
          {renderCapturePhotoScreen()}
        </ScrollView>
      </View>
    )
  }

  if (showPreviewScreen) {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.pageContent}>
          {renderPreviewScreen()}
        </ScrollView>
        {showPrintOptions && renderPrintOptionsModal()}
        {showQrOptions && renderQrOptionsModal()}
      </View>
    )
  }

  if (showShareScreen) {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.pageContent}>
          {renderShareScreen()}
        </ScrollView>
        {showPrintOptions && renderPrintOptionsModal()}
        {showQrOptions && renderQrOptionsModal()}
      </View>
    )
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.pageContent}>
        <View style={[styles.hero, isMobile && styles.heroMobile]}>
          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>Viralco Producciones</Text>
            <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>Espejo mágico</Text>
            <Text style={styles.heroText}>
              Primer producto activo. El flujo queda limpio: crear evento, elegir tipo de foto, tomar la captura y entregar.
            </Text>
          </View>
          <View style={styles.heroPanel}>
            <Text style={styles.heroPanelLabel}>Evento</Text>
            <Text style={styles.heroPanelTitle}>{eventTitle}</Text>
            <Text style={styles.heroPanelMeta}>{eventType || 'Tipo de evento pendiente'} / {selectedType.name}</Text>
            <Pressable onPress={openNewEventModal} style={styles.heroPanelButton}>
              <Text style={styles.heroPanelButtonText}>Nuevo evento</Text>
            </Pressable>
          </View>
        </View>

        {renderRecentEventsLauncher()}

        <View style={[styles.mainGrid, isMobile && styles.mainGridMobile]}>
          <View style={styles.capturePanel}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelEyebrow}>Captura</Text>
                <Text style={styles.panelTitle}>Solo fotos</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{framesReady}/{selectedShotCount}</Text>
              </View>
            </View>
            {renderCamera()}
            {cameraError ? <Text style={styles.errorText}>{cameraError}</Text> : null}
            <Text style={styles.captureStatus}>{captureStatus}</Text>
            <View style={[styles.actionRow, isMobile && styles.actionRowMobile]}>
              <Pressable onPress={openCamera} style={styles.secondaryAction}>
                <Text style={styles.secondaryActionText}>{cameraStream ? 'Reiniciar cámara' : 'Abrir cámara'}</Text>
              </Pressable>
              <Pressable onPress={runCountdownAndCapture} style={styles.captureButton}>
                <Text style={styles.captureButtonText}>{cameraStream ? 'Tomar foto' : 'Abrir y tomar'}</Text>
              </Pressable>
            </View>
            <Pressable onPress={resetPhoto} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Repetir formato</Text>
            </Pressable>
          </View>

          <View style={styles.controlsPanel}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelEyebrow}>Formato</Text>
                <Text style={styles.panelTitle}>Tipos de foto</Text>
              </View>
              <Text style={styles.nextShot}>{nextShotLabel}</Text>
            </View>

            <View style={[styles.typeGrid, isMobile && styles.typeGridMobile]}>
              {photoTypes.map((type) => {
                const active = selectedType.id === type.id
                return (
                  <Pressable
                    key={type.id}
                    onPress={() => chooseType(type)}
                    style={[styles.typeCard, isMobile && styles.typeCardMobile, active && styles.typeCardActive]}
                  >
                    {renderTypePreview(type)}
                    <View style={styles.typeTitleRow}>
                      <Text style={[styles.typeTitle, active && styles.typeTitleActive]}>{type.name}</Text>
                      {type.sizeLabel ? <Text style={[styles.typeSizePill, active && styles.typeSizePillActive]}>{type.sizeLabel}</Text> : null}
                    </View>
                    <Text style={styles.typeNote}>{type.note}</Text>
                  </Pressable>
                )
              })}
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Plantillas / marcos</Text>
              <View style={[styles.templateGrid, isMobile && styles.templateGridMobile]}>
                {eventTemplateOptions.map((template) => {
                  const active = selectedTemplate.id === template.id && !overlayImageUrl
                  return (
                    <Pressable
                      key={template.id}
                      onPress={() => chooseTemplate(template)}
                      style={[styles.templateCard, isMobile && styles.templateCardMobile, active && styles.templateCardActive]}
                    >
                      <Image source={template.image} style={[styles.templateImage, isMobile && styles.templateImageMobile]} accessibilityLabel={`Plantilla ${template.name}`} />
                      <Text style={[styles.templateName, active && styles.templateNameActive]}>{template.name}</Text>
                    </Pressable>
                  )
                })}
                <label style={overlayImageUrl ? { ...styles.uploadTemplateCard, ...(isMobile ? styles.uploadTemplateCardMobile : {}), ...styles.uploadTemplateCardActive } : { ...styles.uploadTemplateCard, ...(isMobile ? styles.uploadTemplateCardMobile : {}) }}>
                  <View style={styles.uploadTemplateIcon}>
                    <Text style={styles.uploadTemplateIconText}>+</Text>
                  </View>
                  <Text style={styles.uploadTemplateTitle}>Subir desde el celular</Text>
                  <Text style={styles.uploadTemplateText}>
                    {overlayFileName || 'Plantilla o marco PNG/JPG'}
                  </Text>
                  <input accept="image/png,image/jpeg,image/webp" type="file" onChange={handleOverlayFile} style={{ display: 'none' }} />
                </label>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Marco personalizado</Text>
              <label style={styles.uploadLabel}>
                <Text style={styles.uploadLabelText}>{overlayFileName || 'Cargar PNG del marco'}</Text>
                <input accept="image/png,image/jpeg,image/webp" type="file" onChange={handleOverlayFile} style={{ display: 'none' }} />
              </label>
            </View>
          </View>
        </View>

        <View style={[styles.outputPanel, isMobile && styles.outputPanelMobile]}>
          <View>
            <Text style={styles.panelEyebrow}>Entrega</Text>
            <Text style={styles.panelTitle}>Resultado final</Text>
          </View>
          <View style={[styles.outputBody, isMobile && styles.outputBodyMobile]}>
            {renderPreviewOutput('Preview pendiente', 'La foto final aparece aquí cuando completes el formato.')}
            {renderDeliverySideActions()}
          </View>
        </View>
      </ScrollView>
      {showCreateEventModal && renderCreateEventModal()}
      {showPrintOptions && renderPrintOptionsModal()}
      {showQrOptions && renderQrOptionsModal()}
    </View>
  )
}

export default WebApp

const styles = StyleSheet.create({
  page: {
    height: '100svh',
    width: '100vw',
    backgroundColor: '#f5f7fb',
    overflow: 'hidden',
  },
  pageContent: {
    height: '100svh',
    padding: 'clamp(10px, 2svh, 18px)',
    paddingBottom: 'clamp(10px, 2svh, 18px)',
    overflow: 'hidden',
  },
  homePageContent: {
    height: '100svh',
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 'clamp(10px, 2svh, 22px)',
    paddingBottom: 'clamp(10px, 2svh, 22px)',
  },
  mirrorPageContent: {
    minHeight: '100vh',
    padding: 0,
    backgroundColor: colors.dark,
  },
  hero: {
    minHeight: 245,
    borderRadius: 8,
    padding: 24,
    backgroundColor: colors.dark,
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  heroMobile: {
    flexDirection: 'column',
    padding: 18,
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'center',
  },
  kicker: {
    color: '#bfdbfe',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 46,
    lineHeight: 52,
    fontWeight: '900',
    marginTop: 8,
  },
  heroTitleMobile: {
    fontSize: 34,
    lineHeight: 39,
  },
  heroText: {
    color: '#d1d5db',
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 610,
    marginTop: 10,
  },
  heroPanel: {
    width: 330,
    maxWidth: '100%',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 18,
    justifyContent: 'center',
  },
  heroPanelLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroPanelTitle: {
    color: colors.ink,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900',
    marginTop: 6,
  },
  heroPanelMeta: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 8,
  },
  heroPanelButton: {
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  heroPanelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  homeLauncherPage: {
    width: '100%',
    maxWidth: 760,
    height: 'calc(100svh - clamp(20px, 4svh, 44px))',
    alignSelf: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    gap: 'clamp(8px, 1.4svh, 16px)',
  },
  homeBrandTitle: {
    margin: 0,
    color: colors.blue,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  homeWelcome: {
    color: colors.ink,
    fontSize: 'clamp(30px, 5.1svh, 40px)',
    lineHeight: 'clamp(35px, 5.8svh, 46px)',
    fontWeight: '900',
    textAlign: 'center',
  },
  homeWelcomeSub: {
    color: colors.muted,
    fontSize: 'clamp(14px, 2.1svh, 17px)',
    lineHeight: 'clamp(19px, 2.8svh, 23px)',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 0,
  },
  recentEventsPanel: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 'clamp(10px, 1.7svh, 14px)',
    gap: 'clamp(8px, 1.3svh, 12px)',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  recentEventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  recentEventsHeaderMobile: {
    flexDirection: 'column',
  },
  recentEventsHeading: {
    flex: 1,
    minWidth: 0,
  },
  recentEventsIntro: {
    color: colors.muted,
    fontSize: 'clamp(12px, 1.7svh, 14px)',
    lineHeight: 'clamp(16px, 2.2svh, 20px)',
    marginTop: 4,
  },
  newEventButton: {
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flexShrink: 0,
  },
  newEventButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  recentEventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: 12,
    flexGrow: 1,
    minHeight: 0,
  },
  recentEventEmpty: {
    minHeight: 160,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  recentEventEmptyTitle: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    textAlign: 'center',
  },
  recentEventEmptyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 5,
  },
  recentEventCard: {
    position: 'relative',
    minHeight: 'clamp(250px, calc(100svh - 390px), 720px)',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.dark,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recentEventCardActive: {
    borderColor: colors.blue,
  },
  recentEventImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  recentEventShade: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(13,18,32,0.56)',
  },
  recentEventContent: {
    position: 'absolute',
    inset: 0,
    padding: 'clamp(12px, 1.9svh, 16px)',
    justifyContent: 'flex-end',
    gap: 'clamp(5px, 0.9svh, 7px)',
  },
  recentEventMeta: {
    alignSelf: 'flex-start',
    minHeight: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.88)',
    color: colors.rose,
    fontSize: 12,
    lineHeight: 28,
    fontWeight: '900',
    paddingHorizontal: 10,
  },
  recentEventTitle: {
    color: '#ffffff',
    fontSize: 'clamp(20px, 2.8svh, 23px)',
    lineHeight: 'clamp(24px, 3.3svh, 28px)',
    fontWeight: '900',
  },
  recentEventDetails: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  launchRecentButton: {
    minHeight: 'clamp(40px, 5svh, 46px)',
    borderRadius: 21,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: colors.blue,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  launchRecentButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  homeActionCard: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 'clamp(10px, 1.7svh, 16px)',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  homeLaunchButton: {
    minHeight: 66,
    borderRadius: 33,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: colors.blue,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  homeLaunchButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  homeDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 4,
  },
  homeDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  homeDividerText: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: '900',
  },
  homeCreateButton: {
    minHeight: 'clamp(50px, 6.8svh, 58px)',
    borderRadius: 29,
    borderWidth: 2,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  homeCreateButtonText: {
    color: colors.blue,
    fontSize: 17,
    fontWeight: '900',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(320px, 0.92fr) minmax(360px, 1.08fr)',
    gap: 14,
    marginTop: 14,
  },
  mainGridMobile: {
    display: 'flex',
  },
  capturePanel: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 14,
  },
  controlsPanel: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 18,
  },
  eventOptionsPage: {
    height: 'calc(100svh - clamp(20px, 4svh, 36px))',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  eventOptionsHeader: {
    padding: 'clamp(14px, 2.2svh, 22px)',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
  },
  eventOptionsHeaderMobile: {
    flexDirection: 'column',
    padding: 14,
    gap: 10,
  },
  eventOptionsHeading: {
    flex: 1,
    minWidth: 0,
  },
  eventOptionsTitle: {
    color: colors.ink,
    fontSize: 'clamp(25px, 4svh, 34px)',
    lineHeight: 'clamp(30px, 4.7svh, 40px)',
    fontWeight: '900',
    marginTop: 4,
  },
  eventOptionsTitleMobile: {
    fontSize: 26,
    lineHeight: 31,
  },
  eventOptionsText: {
    color: colors.muted,
    fontSize: 'clamp(13px, 1.9svh, 15px)',
    lineHeight: 'clamp(18px, 2.5svh, 22px)',
    marginTop: 6,
    maxWidth: 680,
  },
  eventOptionsBadge: {
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: colors.roseSoft,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventOptionsBadgeText: {
    color: colors.roseDark,
    fontSize: 13,
    fontWeight: '900',
  },
  operatorDoneButton: {
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: colors.rose,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 28px rgba(244,63,94,0.22)',
  },
  operatorDoneButtonText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  eventOptionsBody: {
    flex: 1,
    minHeight: 0,
    padding: 'clamp(10px, 1.7svh, 16px)',
    gap: 'clamp(10px, 1.7svh, 16px)',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  },
  eventOptionsSection: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    padding: 'clamp(10px, 1.7svh, 14px)',
    gap: 'clamp(10px, 1.7svh, 14px)',
  },
  eventOptionsFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    padding: 'clamp(10px, 1.7svh, 16px)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    backgroundColor: '#ffffff',
  },
  eventOptionsFooterMobile: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    padding: 10,
    gap: 8,
  },
  eventOptionsPrimaryButton: {
    minHeight: 'clamp(46px, 6svh, 52px)',
    borderRadius: 24,
    backgroundColor: colors.rose,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventOptionsPrimaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  eventOptionsPrimaryButtonMobile: {
    gridColumn: '1 / -1',
    minHeight: 48,
  },
  eventOptionsPrimaryTextMobile: {
    fontSize: 15,
  },
  eventOptionsSecondaryButton: {
    minHeight: 'clamp(42px, 5.6svh, 48px)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.rose,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventOptionsSecondaryButtonMobile: {
    minHeight: 40,
    paddingHorizontal: 10,
  },
  eventOptionsSecondaryText: {
    color: colors.rose,
    fontSize: 15,
    fontWeight: '900',
  },
  eventOptionsSecondaryTextMobile: {
    fontSize: 14,
  },
  flowStepPage: {
    minHeight: 'calc(100vh - 36px)',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  flowStepHeader: {
    padding: 22,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
  },
  flowStepHeaderMobile: {
    padding: 16,
  },
  flowStepTitle: {
    color: colors.ink,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    marginTop: 4,
  },
  flowStepTitleMobile: {
    fontSize: 28,
    lineHeight: 33,
  },
  flowStepText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 7,
  },
  captureOnlyBody: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    padding: 16,
    gap: 14,
  },
  previewOnlyBody: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    padding: 16,
    gap: 14,
  },
  shareOnlyBody: {
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
    padding: 16,
    gap: 16,
  },
  deliveryResultLayout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(260px, 1fr) minmax(240px, 300px)',
    gap: 14,
    alignItems: 'start',
  },
  deliveryResultLayoutMobile: {
    display: 'flex',
  },
  flowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  flowFooterMobile: {
    flexDirection: 'column',
  },
  flowButtonDisabled: {
    opacity: 0.45,
  },
  animationVideoBody: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    padding: 16,
    gap: 16,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
  },
  animationVideoBodyMobile: {
    display: 'flex',
  },
  animationVideoPreview: {
    minHeight: 460,
    borderRadius: 8,
    backgroundColor: colors.dark,
    overflow: 'hidden',
  },
  animationVideoMock: {
    minHeight: 460,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0f172a',
  },
  animationVideoPlay: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  animationVideoPlayText: {
    color: colors.rose,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '900',
    marginLeft: 4,
  },
  animationVideoMockTitle: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  animationVideoMockText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  animationVideoCard: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    gap: 16,
  },
  animationVideoText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  animationQuestionCard: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
  },
  animationQuestionCardMobile: {
    display: 'flex',
  },
  animationQuestionPreview: {
    minHeight: 380,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0f172a',
  },
  animationQuestionCopy: {
    padding: 24,
    gap: 16,
    justifyContent: 'center',
  },
  animationQuestionTitle: {
    color: colors.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  animationQuestionText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  animationQuestionActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  animationQuestionActionsMobile: {
    flexDirection: 'column',
  },
  virtualAssistantPanel: {
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: '#f4f5f5',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
  assistantTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#ffffff',
    padding: 18,
    boxShadow: '0 8px 22px rgba(15,23,42,0.08)',
    zIndex: 2,
  },
  assistantTitleWrap: {
    gap: 10,
    flexShrink: 1,
  },
  assistantTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    flexWrap: 'wrap',
  },
  assistantTitle: {
    color: colors.ink,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
  },
  assistantQuestion: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  assistantSwitch: {
    minWidth: 86,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 5,
    backgroundColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  assistantSwitchActive: {
    backgroundColor: '#b51f5a',
  },
  assistantSwitchKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
  },
  assistantSwitchKnobActive: {
    order: 2,
  },
  assistantSwitchText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    paddingHorizontal: 4,
  },
  assistantCollapseButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#b51f5a',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  assistantCollapseText: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '900',
  },
  animationStageGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  animationStageGridMobile: {
    display: 'flex',
  },
  animationLeftColumn: {
    gap: 12,
    padding: 22,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  animationRightColumn: {
    gap: 12,
    padding: 22,
  },
  styleSelectBox: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stageVideoCard: {
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    padding: 0,
    gap: 10,
  },
  stageVideoCardActive: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  stageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  stageCardTitle: {
    color: colors.ink,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
  },
  stageSelectWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageTrashButton: {
    width: 34,
    height: 34,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stageTrashText: {
    color: '#b51f5a',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '900',
  },
  stageSelectLine: {
    display: 'flex',
    minHeight: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    cursor: 'pointer',
    flex: 1,
  },
  stageSelectText: {
    color: '#374151',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  exampleVideoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleVideoPill: {
    minHeight: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  exampleVideoPillActive: {
    borderColor: '#b51f5a',
    backgroundColor: '#b51f5a',
  },
  exampleVideoPillText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  exampleVideoPillTextActive: {
    color: '#ffffff',
  },
  compactVideoPreview: {
    height: 130,
    borderRadius: 8,
    backgroundColor: '#111827',
    overflow: 'hidden',
  },
  stageChevron: {
    color: '#b51f5a',
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '900',
  },
  stageHelper: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  animationSequenceList: {
    gap: 0,
  },
  animationSequenceCard: {
    borderRadius: 0,
    backgroundColor: '#ffffff',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    padding: 22,
    gap: 12,
  },
  sequenceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  sequenceTitle: {
    color: colors.ink,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
  },
  sequenceHelper: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  stageSelectButton: {
    display: 'flex',
    minWidth: 126,
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#b51f5a',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    paddingHorizontal: 14,
    cursor: 'pointer',
  },
  stageSelectButtonText: {
    color: '#8b1747',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  stageSelectButtonHint: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
  },
  videoCarouselRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  carouselArrow: {
    color: '#b51f5a',
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '500',
  },
  videoThumbTrack: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 10,
  },
  videoThumb: {
    minHeight: 132,
    borderRadius: 4,
    backgroundColor: '#d8d8d8',
    padding: 8,
    justifyContent: 'space-between',
    position: 'relative',
    gap: 8,
  },
  videoThumbActive: {
    backgroundColor: '#f1d3df',
  },
  videoThumbPreview: {
    height: 78,
    borderRadius: 2,
    backgroundColor: '#cfcfcf',
    overflow: 'hidden',
    opacity: 0.72,
  },
  videoThumbText: {
    color: '#9a1f52',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  thumbTrashButton: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbTrashText: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '900',
  },
  randomCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  randomCheckBox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  randomCheckBoxActive: {
    backgroundColor: '#b51f5a',
    borderColor: '#b51f5a',
  },
  randomCheckMark: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '900',
  },
  randomCheckText: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  animationCompactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 22,
    padding: 22,
  },
  animationCompactGridMobile: {
    display: 'flex',
  },
  animationVideoPreviewStrip: {
    height: 180,
    borderRadius: 8,
    backgroundColor: colors.dark,
    overflow: 'hidden',
  },
  animationFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  animationFooterActionsMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  assistantFooterPrimary: {
    backgroundColor: '#b51f5a',
  },
  assistantFooterSecondary: {
    borderColor: '#b51f5a',
    backgroundColor: '#ffffff',
  },
  assistantFooterSecondaryText: {
    color: '#b51f5a',
  },
  animationUploadCard: {
    minHeight: 132,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rose,
    borderStyle: 'dashed',
    backgroundColor: colors.soft,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
  },
  animationUploadCardActive: {
    borderStyle: 'solid',
    backgroundColor: colors.roseSoft,
  },
  animationUploadTitle: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  animationUploadText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  panelEyebrow: {
    color: colors.rose,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
  },
  statusPill: {
    minWidth: 46,
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    color: colors.rose,
    fontWeight: '900',
  },
  mirrorCapturePage: {
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: colors.dark,
    overflow: 'hidden',
  },
  mirrorCameraShell: {
    height: '100vh',
    minHeight: 720,
    borderRadius: 0,
  },
  cameraTouchArea: {
    cursor: 'pointer',
  },
  mirrorTopBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 18,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'center',
  },
  mirrorTopBarMobile: {
    left: 12,
    right: 12,
    top: 12,
  },
  mirrorTopInfo: {
    flex: 1,
    minWidth: 0,
  },
  mirrorBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  mirrorBrandText: {
    color: colors.ink,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  mirrorStepText: {
    color: colors.rose,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  mirrorTitle: {
    color: colors.ink,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    marginTop: 3,
  },
  mirrorTitleMobile: {
    fontSize: 24,
    lineHeight: 29,
  },
  mirrorSubText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    maxWidth: '100%',
  },
  mirrorStatusPill: {
    minWidth: 56,
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mirrorStatusText: {
    color: colors.rose,
    fontSize: 17,
    fontWeight: '900',
  },
  operatorHotspot: {
    position: 'absolute',
    right: 0,
    top: '38%',
    width: 42,
    height: 164,
    zIndex: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  operatorHotspotHandle: {
    width: 5,
    height: 76,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  operatorMenuLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  operatorMenuScrim: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  operatorMenuPanel: {
    width: 340,
    maxWidth: 'calc(100vw - 28px)',
    marginRight: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    boxShadow: '0 28px 90px rgba(0,0,0,0.34)',
    padding: 14,
    gap: 12,
  },
  operatorMenuPanelMobile: {
    width: 'calc(100vw - 24px)',
    marginRight: 12,
  },
  operatorMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  operatorMenuEyebrow: {
    color: colors.rose,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  operatorMenuTitle: {
    color: colors.ink,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  operatorMenuClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorMenuCloseText: {
    color: colors.rose,
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '900',
  },
  operatorMenuList: {
    gap: 8,
  },
  operatorMenuItem: {
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  operatorMenuItemTitle: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  operatorMenuItemText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
  },
  operatorMenuArrow: {
    color: colors.rose,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '700',
  },
  operatorQuickLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 11,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  operatorQuickScrim: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  operatorQuickPanel: {
    width: 520,
    maxWidth: 'calc(100vw - 24px)',
    maxHeight: 'calc(100% - 24px)',
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    boxShadow: '0 26px 90px rgba(0,0,0,0.36)',
    overflow: 'hidden',
  },
  operatorQuickPanelMobile: {
    width: 'calc(100vw - 18px)',
    maxHeight: 'calc(100% - 18px)',
    marginRight: 9,
  },
  operatorQuickHeader: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  operatorQuickHeading: {
    flexShrink: 1,
  },
  operatorQuickTitle: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
  },
  operatorQuickScroll: {
    maxHeight: 'calc(100vh - 120px)',
  },
  operatorQuickContent: {
    padding: 14,
    gap: 12,
  },
  operatorQuickCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    padding: 13,
    gap: 12,
  },
  operatorQuickCardTitle: {
    color: colors.ink,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  operatorQuickTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  operatorQuickTab: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  operatorQuickTabText: {
    color: colors.blue,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  operatorQuickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
  },
  operatorQuickChoice: {
    minHeight: 66,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    padding: 10,
    justifyContent: 'center',
  },
  operatorQuickChoiceActive: {
    borderColor: colors.blue,
    backgroundColor: '#eff6ff',
  },
  operatorQuickChoiceTitle: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  operatorQuickChoiceTitleActive: {
    color: colors.blue,
  },
  operatorQuickChoiceText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 15,
    marginTop: 2,
    fontWeight: '700',
  },
  mirrorControls: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 14,
    gap: 10,
  },
  mirrorControlsMobile: {
    left: 12,
    right: 12,
    bottom: 18,
  },
  mirrorCaptureStatus: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },
  mirrorStatusToast: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  mirrorStatusToastMobile: {
    left: 12,
    right: 12,
    bottom: 18,
  },
  mirrorActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mirrorActionRowMobile: {
    flexDirection: 'column',
  },
  mirrorCaptureButton: {
    flex: 1.3,
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mirrorSecondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.rose,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  mirrorSecondaryText: {
    color: colors.rose,
    fontSize: 14,
    fontWeight: '900',
  },
  cameraShell: {
    position: 'relative',
    height: 520,
    borderRadius: 8,
    backgroundColor: colors.dark,
    overflow: 'hidden',
  },
  cameraShellMobile: {
    height: 420,
  },
  cameraPlaceholder: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.72,
  },
  cameraShade: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  cameraGifOverlay: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.86,
    pointerEvents: 'none',
  },
  safeFrame: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '12%',
    bottom: '12%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    borderRadius: 8,
  },
  cameraBadge: {
    position: 'absolute',
    left: 14,
    top: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cameraBadgeText: {
    color: colors.rose,
    fontSize: 11,
    fontWeight: '900',
  },
  captureStartOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    zIndex: 3,
    cursor: 'pointer',
  },
  captureStartOverlayPressed: {
    opacity: 0.92,
  },
  captureStartPulseRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    backgroundColor: 'rgba(10,77,232,0.13)',
  },
  captureStartButton: {
    width: 154,
    height: 154,
    borderRadius: 77,
    backgroundColor: 'rgba(10,77,232,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.88)',
    boxShadow: '0 22px 70px rgba(0,0,0,0.34)',
  },
  captureStartCameraIcon: {
    width: 44,
    height: 32,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  captureStartCameraLens: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  captureStartCameraFlash: {
    position: 'absolute',
    right: 6,
    top: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  captureStartButtonText: {
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  captureStartButtonSubText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  captureStartError: {
    maxWidth: 430,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
    color: '#dc2626',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  countdown: {
    position: 'absolute',
    right: 34,
    top: 156,
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: 'rgba(10,77,232,0.94)',
    color: '#ffffff',
    fontSize: 58,
    lineHeight: 91,
    textAlign: 'center',
    fontWeight: '900',
    boxShadow: '0 18px 44px rgba(0,0,0,0.28)',
  },
  countdownMobile: {
    right: 26,
    top: 230,
    width: 78,
    height: 78,
    borderRadius: 39,
    fontSize: 46,
    lineHeight: 76,
  },
  animationOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,18,32,0.38)',
    overflow: 'hidden',
  },
  animationHalo: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.76)',
    backgroundColor: 'rgba(10,77,232,0.22)',
    transform: [{ scale: 1.08 }],
  },
  animationHaloConfetti: {
    borderStyle: 'dashed',
    backgroundColor: 'rgba(56,189,248,0.22)',
  },
  animationCard: {
    minWidth: 220,
    maxWidth: '76%',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.93)',
    paddingHorizontal: 24,
    paddingVertical: 22,
    alignItems: 'center',
    boxShadow: '0 24px 70px rgba(0,0,0,0.28)',
  },
  animationCardLight: {
    backgroundColor: 'rgba(255,253,248,0.95)',
  },
  animationVideoMockInline: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#fce7f3',
    borderWidth: 1,
    borderColor: 'rgba(190,24,93,0.18)',
    boxShadow: 'inset 0 0 28px rgba(255,255,255,0.72)',
  },
  animationVideoMockConfetti: {
    backgroundColor: '#ecfeff',
  },
  animationVideoMockInlineText: {
    color: '#9f1239',
    fontSize: 32,
    lineHeight: 38,
    fontFamily: '"Brush Script MT", "Segoe Script", "Comic Sans MS", cursive',
    textAlign: 'center',
  },
  animationTitle: {
    color: '#172554',
    fontSize: 36,
    lineHeight: 42,
    fontFamily: '"Brush Script MT", "Segoe Script", "Comic Sans MS", cursive',
    textAlign: 'center',
  },
  animationText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
  },
  animationDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  animationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.rose,
    opacity: 0.55,
  },
  animationDotMiddle: {
    opacity: 1,
    transform: [{ scale: 1.35 }],
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '700',
  },
  captureStatus: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionRowMobile: {
    flexDirection: 'column',
  },
  secondaryAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: colors.rose,
    fontSize: 14,
    fontWeight: '900',
  },
  captureButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  resetButton: {
    alignSelf: 'center',
    minHeight: 34,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  resetButtonText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  nextShot: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 10,
  },
  typeGridMobile: {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    paddingBottom: 4,
    scrollSnapType: 'x mandatory',
  },
  typeCard: {
    minHeight: 184,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  typeCardMobile: {
    width: 'min(68vw, 228px)',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    minHeight: 138,
    padding: 10,
    gap: 5,
  },
  typePreviewMobile: {
    width: 56,
    height: 74,
  },
  typeCardActive: {
    borderColor: colors.rose,
    backgroundColor: colors.roseSoft,
  },
  typePreview: {
    position: 'relative',
    alignSelf: 'center',
    width: 72,
    height: 94,
    borderRadius: 8,
    backgroundColor: colors.dark,
    overflow: 'hidden',
  },
  typePreviewStrip: {
    width: 48,
    height: 106,
  },
  typePreviewStripMobile: {
    width: 40,
    height: 78,
  },
  typePreviewPostal: {
    width: 96,
    height: 64,
  },
  typePreviewPostalMobile: {
    width: 72,
    height: 48,
  },
  typePreviewCustomSheet: {
    width: 88,
    height: 118,
    borderRadius: 3,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 5,
    flexDirection: 'row',
    gap: 4,
  },
  typePreviewCustomSheetMobile: {
    width: 64,
    height: 82,
    padding: 4,
    gap: 3,
  },
  typePreviewCustomStrip: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
    padding: 3,
    gap: 3,
    alignItems: 'center',
  },
  typePreviewCustomTextLine: {
    width: '86%',
    height: 9,
    borderRadius: 999,
    backgroundColor: '#1f2937',
    opacity: 0.75,
    marginBottom: 5,
  },
  typePreviewCustomPhoto: {
    width: '100%',
    flex: 1,
    minHeight: 13,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typePreviewCustomNameLine: {
    width: '96%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#1f2937',
    opacity: 0.75,
    marginTop: 5,
  },
  typePreviewCustomDateLine: {
    width: '72%',
    height: 5,
    borderRadius: 999,
    backgroundColor: '#1f2937',
    opacity: 0.55,
  },
  typePreviewSlot: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typePreviewText: {
    color: colors.rose,
    fontSize: 10,
    fontWeight: '900',
  },
  typeTitleRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  typeTitle: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  typeTitleActive: {
    color: colors.roseDark,
  },
  typeSizePill: {
    borderRadius: 999,
    backgroundColor: colors.roseSoft,
    color: colors.roseDark,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  typeSizePillActive: {
    backgroundColor: '#ffffff',
    color: colors.rose,
  },
  typeNote: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: 10,
  },
  templateGridMobile: {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    paddingBottom: 4,
    scrollSnapType: 'x mandatory',
  },
  templateCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  templateCardMobile: {
    width: 'min(48vw, 170px)',
    flexShrink: 0,
    scrollSnapAlign: 'start',
  },
  templateCardActive: {
    borderColor: colors.rose,
  },
  templateImage: {
    width: '100%',
    height: 86,
    objectFit: 'cover',
  },
  templateImageMobile: {
    height: 58,
  },
  templateName: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    padding: 10,
  },
  templateNameActive: {
    color: colors.rose,
  },
  uploadTemplateCard: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 148,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rose,
    borderStyle: 'dashed',
    backgroundColor: '#ffffff',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    cursor: 'pointer',
  },
  uploadTemplateCardMobile: {
    width: 'min(48vw, 170px)',
    minHeight: 106,
    flexShrink: 0,
    scrollSnapAlign: 'start',
  },
  uploadTemplateCardActive: {
    borderStyle: 'solid',
    backgroundColor: colors.roseSoft,
  },
  uploadTemplateIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTemplateIconText: {
    color: '#ffffff',
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '800',
  },
  uploadTemplateTitle: {
    color: colors.roseDark,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  uploadTemplateText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 13,
    justifyContent: 'center',
  },
  filterChipActive: {
    borderColor: colors.rose,
    backgroundColor: colors.rose,
  },
  filterText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  uploadLabelText: {
    color: colors.rose,
    fontSize: 14,
    fontWeight: '900',
  },
  outputPanel: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginTop: 14,
    gap: 14,
  },
  outputPanelMobile: {
    marginBottom: 16,
  },
  outputBody: {
    display: 'grid',
    gridTemplateColumns: 'minmax(240px, 390px) minmax(240px, 1fr)',
    gap: 14,
  },
  outputBodyMobile: {
    display: 'flex',
  },
  outputPreview: {
    height: 420,
    minHeight: 300,
    borderRadius: 8,
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  outputPreviewFinal: {
    width: '100%',
    height: 'auto',
    minHeight: 0,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
  },
  outputImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  previewFrameGrid: {
    minHeight: 300,
    padding: 12,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 10,
  },
  previewFrameCard: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  previewFrameImage: {
    width: '100%',
    height: 230,
    objectFit: 'cover',
  },
  previewFrameLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    padding: 10,
  },
  takenFramesStrip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 12,
  },
  takenFramesTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  takenFramesHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3,
  },
  takenFramesRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))',
    gap: 10,
  },
  takenFrameButton: {
    width: '100%',
    minHeight: 132,
    aspectRatio: 0.82,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    position: 'relative',
  },
  takenFrameThumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  takenFrameShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.12)',
  },
  takenFrameBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17, 24, 39, 0.14)',
  },
  takenFrameBadgeText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  takenFrameReplacePill: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    minHeight: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  takenFrameReplaceText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '900',
  },
  takenFrameRetakeIcon: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 48,
    height: 48,
    marginLeft: -24,
    marginTop: -24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17, 24, 39, 0.12)',
  },
  takenFrameRetakeIconText: {
    color: colors.ink,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '900',
  },
  emptyOutput: {
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyOutputTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  emptyOutputText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
  },
  shareGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: 10,
    alignContent: 'start',
  },
  shareButton: {
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  shareButtonTextDisabled: {
    color: '#9ca3af',
  },
  deliverySidePanel: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    gap: 12,
    boxShadow: '0 16px 34px rgba(17,24,39,0.08)',
  },
  deliverySideEyebrow: {
    color: colors.rose,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  deliverySideTitle: {
    color: colors.ink,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
    marginTop: 3,
  },
  deliverySideText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  deliveryActionStack: {
    gap: 9,
  },
  deliveryActionButton: {
    minHeight: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(190, 18, 60, 0.18)',
    backgroundColor: '#fff7fb',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deliveryActionButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: colors.line,
    opacity: 0.62,
  },
  deliveryActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryActionIconText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  deliveryActionCopy: {
    flex: 1,
    minWidth: 0,
  },
  deliveryActionTitle: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
  deliveryActionHelper: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  deliveryActionArrow: {
    color: colors.rose,
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '300',
  },
  deliveryActionTextDisabled: {
    color: '#9ca3af',
  },
  deliveryConfigButton: {
    minHeight: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
  },
  deliveryConfigText: {
    color: colors.roseDark,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  startEditorPage: {
    minHeight: 'calc(100vh - 36px)',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  startEditorHeader: {
    minHeight: 128,
    paddingHorizontal: 28,
    paddingVertical: 22,
    paddingRight: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  },
  startEditorHeaderMobile: {
    minHeight: 118,
    paddingLeft: 14,
    paddingRight: 78,
    paddingVertical: 18,
    justifyContent: 'flex-start',
  },
  startEditorHeading: {
    flex: 1,
    minWidth: 0,
  },
  startEditorTitle: {
    color: '#000000',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    textAlign: 'center',
  },
  startEditorTitleMobile: {
    fontSize: 25,
    lineHeight: 30,
    textAlign: 'left',
  },
  startEditorSubtitle: {
    color: '#000000',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 14,
  },
  startEditorSubtitleMobile: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'left',
    marginTop: 10,
  },
  startEditorClose: {
    position: 'absolute',
    right: 28,
    top: 22,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startEditorCloseMobile: {
    right: 14,
    top: 28,
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  startEditorCloseText: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 34,
    fontWeight: '700',
  },
  startEditorBody: {
    padding: 26,
    display: 'grid',
    gridTemplateColumns: 'minmax(320px, 470px) minmax(300px, 1fr)',
    gap: 28,
    alignItems: 'center',
  },
  startEditorBodyMobile: {
    display: 'flex',
    padding: 14,
  },
  phonePreviewShell: {
    alignItems: 'center',
  },
  phonePreview: {
    position: 'relative',
    width: 390,
    maxWidth: '100%',
    aspectRatio: 0.56,
    overflow: 'hidden',
    backgroundColor: '#dbeafe',
  },
  phonePreviewImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.38,
  },
  phonePreviewWash: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  photoStack: {
    position: 'absolute',
    left: 24,
    top: 18,
    width: 150,
    height: 132,
  },
  photoStackBack: {
    position: 'absolute',
    left: 18,
    top: 5,
    width: 122,
    height: 108,
    borderWidth: 5,
    borderColor: '#ffffff',
    backgroundColor: '#1f2937',
    transform: [{ rotate: '8deg' }],
  },
  photoStackFront: {
    position: 'absolute',
    left: 4,
    top: 20,
    width: 122,
    height: 108,
    borderWidth: 5,
    borderColor: '#ffffff',
    backgroundColor: '#202020',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '6deg' }],
  },
  photoStackIcon: {
    color: '#ffffff',
    fontSize: 54,
    lineHeight: 58,
  },
  phoneTitleWrap: {
    position: 'absolute',
    left: 28,
    right: 28,
    top: '35%',
    alignItems: 'center',
  },
  phoneTitle: {
    color: '#ffffff',
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '300',
    textAlign: 'center',
  },
  phoneSubtitle: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 15,
    lineHeight: 20,
    marginTop: 5,
    textAlign: 'center',
  },
  guestModeRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 84,
    alignItems: 'center',
    gap: 10,
  },
  guestModeButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 26px rgba(15,23,42,0.16)',
  },
  guestModeIcon: {
    color: '#222222',
    fontSize: 34,
    lineHeight: 38,
  },
  guestModeLabel: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 25,
  },
  editorSidePanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    padding: 20,
    gap: 14,
  },
  editorSideText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  activeToolNotice: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: colors.roseSoft,
    padding: 12,
    gap: 4,
  },
  activeToolTitle: {
    color: colors.roseDark,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  activeToolText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  printSettingsPanel: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 12,
  },
  printSettingsPanelCompact: {
    maxWidth: 760,
    alignSelf: 'center',
  },
  printSizeBadge: {
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    flexShrink: 0,
  },
  printSizeBadgeText: {
    color: colors.roseDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  printPresetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
    gap: 8,
  },
  printReferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  printPaperSelector: {
    minWidth: 150,
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    paddingHorizontal: 4,
  },
  printPaperSelectorText: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  printPaperSelectorArrow: {
    color: colors.rose,
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '900',
  },
  printOrientationSwitch: {
    minHeight: 44,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.rose,
    backgroundColor: '#ffffff',
    padding: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  printOrientationButton: {
    width: 42,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printOrientationButtonActive: {
    backgroundColor: colors.rose,
  },
  printOrientationIcon: {
    width: 14,
    height: 20,
    borderRadius: 2,
    borderWidth: 3,
    borderColor: colors.rose,
  },
  printOrientationIconHorizontal: {
    width: 22,
    height: 16,
  },
  printOrientationIconActive: {
    borderColor: '#ffffff',
  },
  printPresetCard: {
    minHeight: 78,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    padding: 10,
    justifyContent: 'center',
    gap: 4,
  },
  printPresetCardActive: {
    borderColor: colors.rose,
    backgroundColor: colors.roseSoft,
  },
  printPresetTitle: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  printPresetTitleActive: {
    color: colors.roseDark,
  },
  printPresetSize: {
    color: colors.ink,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
  },
  printPresetText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  printInputGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))',
    gap: 8,
  },
  printPixelRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  printPixelText: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
    paddingBottom: 6,
  },
  printMeasurePanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: colors.roseSoft,
    padding: 12,
    gap: 10,
  },
  printMeasureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  printMeasureTitle: {
    color: colors.roseDark,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
  },
  printMeasureBadge: {
    minHeight: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    color: colors.roseDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  printMeasureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(138px, 1fr))',
    gap: 8,
  },
  printMeasureCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
    backgroundColor: '#ffffff',
    padding: 10,
    gap: 3,
  },
  printMeasureLabel: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  printMeasureValue: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
  },
  printMeasureMeta: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  printInputWrap: {
    gap: 5,
  },
  printInputLabel: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  printInput: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    paddingHorizontal: 10,
  },
  printOptionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  printDpiRow: {
    gap: 7,
  },
  printToggleStack: {
    gap: 14,
  },
  printSegment: {
    flex: 1,
    minWidth: 190,
    minHeight: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    padding: 3,
    flexDirection: 'row',
  },
  printSegmentOption: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  printSegmentOptionActive: {
    backgroundColor: colors.rose,
  },
  printSegmentText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  printSegmentTextActive: {
    color: '#ffffff',
  },
  printSettingsHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  printOptionsOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    overflow: 'hidden',
  },
  printOptionsBackdropImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.3,
    transform: [{ scale: 1.08 }],
  },
  printOptionsShade: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(17,24,39,0.58)',
  },
  printOptionsClose: {
    position: 'absolute',
    left: 18,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printOptionsCloseText: {
    color: '#ffffff',
    fontSize: 42,
    lineHeight: 42,
    fontWeight: '300',
  },
  printOptionsCard: {
    width: 320,
    maxWidth: '84%',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  printOptionsTitle: {
    color: '#ffffff',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  printCopiesControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
  },
  printCopiesButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printCopiesButtonDisabled: {
    opacity: 0.38,
  },
  printCopiesButtonText: {
    color: '#ffffff',
    fontSize: 54,
    lineHeight: 54,
    fontWeight: '300',
  },
  printCopiesNumber: {
    minWidth: 78,
    color: '#ffffff',
    fontSize: 72,
    lineHeight: 78,
    fontWeight: '300',
    textAlign: 'center',
  },
  printCopiesLabel: {
    color: '#ffffff',
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '700',
    textAlign: 'center',
  },
  printOptionsButton: {
    marginTop: 18,
    minWidth: 210,
    minHeight: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    boxShadow: '0 16px 34px rgba(0,0,0,0.22)',
  },
  printOptionsButtonText: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  printOptionsMeta: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  qrOptionsOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 85,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  qrOptionsBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(17,24,39,0.62)',
  },
  qrOptionsCard: {
    width: 390,
    maxWidth: '100%',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 14,
    boxShadow: '0 24px 70px rgba(0,0,0,0.24)',
  },
  qrOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  qrOptionsEyebrow: {
    color: colors.rose,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  qrOptionsTitle: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    marginTop: 2,
  },
  qrOptionsClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrOptionsCloseText: {
    color: colors.ink,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '300',
  },
  qrImageFrame: {
    alignSelf: 'center',
    width: 238,
    height: 238,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
  },
  qrImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  qrOptionsEvent: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    textAlign: 'center',
  },
  qrOptionsText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  qrOptionsActions: {
    flexDirection: 'row',
    gap: 10,
  },
  qrSecondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  qrSecondaryText: {
    color: colors.rose,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  qrPrimaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  qrPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  editorSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 10,
  },
  editorSummaryCard: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
  },
  editorSummaryValue: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  editorSummaryLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700',
  },
  editorNextButton: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  editorNextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  editorToolbar: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 18,
    boxShadow: '0 -8px 24px rgba(15,23,42,0.08)',
  },
  editorTool: {
    width: 92,
    alignItems: 'center',
    gap: 8,
  },
  editorToolIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorToolIconActive: {
    backgroundColor: colors.roseDark,
  },
  editorToolIconText: {
    color: '#ffffff',
    fontSize: 25,
    lineHeight: 29,
    fontWeight: '900',
  },
  editorToolIconTextActive: {
    color: '#ffffff',
  },
  editorToolLabel: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  photoDesignPage: {
    minHeight: 'calc(100vh - 36px)',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  photoDesignTop: {
    minHeight: 150,
    backgroundColor: '#ffffff',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 26,
  },
  photoDesignClose: {
    position: 'relative',
    right: 'auto',
    top: 'auto',
  },
  photoDesignPreviewWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 0,
  },
  photoDesignPreview: {
    position: 'relative',
    width: 620,
    maxWidth: '100%',
    aspectRatio: 1.5,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  photoDesignSlot: {
    position: 'absolute',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  photoDesignPerson: {
    position: 'absolute',
    left: '28%',
    top: '15%',
    color: '#000000',
    fontSize: 92,
    lineHeight: 100,
    fontWeight: '900',
  },
  photoDesignSlotNumber: {
    position: 'absolute',
    right: 28,
    bottom: 24,
    color: '#000000',
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '500',
  },
  photoDesignControls: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 42,
    paddingBottom: 22,
    gap: 12,
  },
  previewShareButton: {
    minHeight: 52,
    minWidth: 170,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 28px rgba(15,23,42,0.06)',
  },
  previewShareText: {
    color: colors.rose,
    fontSize: 16,
    lineHeight: 19,
    textAlign: 'center',
  },
  layoutPicker: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layoutPickerText: {
    color: '#000000',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  designToolGrid: {
    width: '100%',
    maxWidth: 620,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  designTool: {
    width: 98,
    alignItems: 'center',
    gap: 8,
  },
  designToolIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: colors.rose,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  designToolIconActive: {
    backgroundColor: colors.rose,
  },
  designToolIconText: {
    color: colors.rose,
    fontSize: 25,
    lineHeight: 29,
    fontWeight: '900',
  },
  designToolIconTextActive: {
    color: '#ffffff',
  },
  designToolLabel: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  captureModePage: {
    minHeight: 'calc(100vh - 36px)',
    borderRadius: 8,
    backgroundColor: '#f3f3f3',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  captureModeHeader: {
    minHeight: 128,
    paddingHorizontal: 28,
    paddingRight: 100,
    paddingVertical: 22,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
  },
  captureModeHeaderMobile: {
    minHeight: 118,
    paddingLeft: 14,
    paddingRight: 78,
    paddingVertical: 18,
    justifyContent: 'flex-start',
  },
  captureModeContent: {
    minHeight: 570,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  captureModeCard: {
    width: 420,
    maxWidth: '100%',
    minHeight: 380,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 12,
    boxShadow: '0 18px 50px rgba(15,23,42,0.08)',
  },
  captureModeIconWrap: {
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 0,
    borderColor: colors.rose,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  captureModeIcon: {
    color: '#ffffff',
    fontSize: 62,
    lineHeight: 66,
  },
  captureModeTitle: {
    color: '#000000',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  captureModeText: {
    color: '#000000',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 220,
  },
  captureModeEnabled: {
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: colors.roseSoft,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  captureModeEnabledText: {
    color: colors.rose,
    fontSize: 13,
    fontWeight: '900',
  },
  captureModeFooter: {
    minHeight: 82,
    paddingHorizontal: 28,
    paddingVertical: 18,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 -8px 24px rgba(15,23,42,0.08)',
  },
  captureModeFooterMobile: {
    paddingHorizontal: 16,
    alignItems: 'stretch',
  },
  captureModeFooterButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  captureModeFooterText: {
    color: colors.rose,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  captureModeFooterTextMobile: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  captureConfigPage: {
    minHeight: 'calc(100vh - 36px)',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  captureConfigContent: {
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 34,
    gap: 18,
  },
  customLayoutPage: {
    minHeight: 'calc(100vh - 36px)',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  customLayoutContent: {
    display: 'grid',
    gridTemplateColumns: 'minmax(260px, 0.92fr) minmax(280px, 1.08fr)',
    gap: 18,
    padding: 18,
  },
  customLayoutContentMobile: {
    gridTemplateColumns: 'minmax(0, 1fr)',
    padding: 14,
  },
  customLayoutPreviewPanel: {
    gap: 12,
    alignItems: 'center',
  },
  customLayoutSheet: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 5 / 15,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    alignSelf: 'center',
  },
  customLayoutStrip: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#eadfca',
    position: 'relative',
    overflow: 'hidden',
  },
  customLayoutStripEditable: {
    boxShadow: '0 0 0 2px rgba(10,77,232,0.16)',
  },
  customLayoutScriptLine: {
    position: 'absolute',
    top: '7.2%',
    left: '12%',
    height: 14,
    width: '76%',
    borderRadius: 7,
    backgroundColor: '#b96f71',
    opacity: 0.28,
  },
  customLayoutSlot: {
    position: 'absolute',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    userSelect: 'none',
    touchAction: 'none',
    boxShadow: '0 8px 20px rgba(15,23,42,0.13)',
  },
  customLayoutSlotSelected: {
    borderColor: colors.rose,
    backgroundColor: '#dbeafe',
    boxShadow: '0 0 0 3px rgba(10,77,232,0.22), 0 12px 26px rgba(15,23,42,0.18)',
  },
  customLayoutSlotNumber: {
    color: colors.rose,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '900',
  },
  customLayoutSlotMeta: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
  },
  customLayoutEmptyState: {
    position: 'absolute',
    left: '10%',
    top: '28%',
    width: '80%',
    minHeight: 96,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#bfdbfe',
    backgroundColor: 'rgba(238,245,255,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 6,
  },
  customLayoutEmptyTitle: {
    color: colors.rose,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  customLayoutEmptyText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  customLayoutResizeHandle: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderTopLeftRadius: 8,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'nwse-resize',
    touchAction: 'none',
  },
  customLayoutResizeText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '900',
  },
  customLayoutNameLine: {
    position: 'absolute',
    top: '83.2%',
    left: '18%',
    height: 16,
    width: '64%',
    borderRadius: 8,
    backgroundColor: '#b96f71',
    opacity: 0.5,
  },
  customLayoutDateLine: {
    position: 'absolute',
    top: '93.8%',
    left: '26%',
    height: 8,
    width: '48%',
    borderRadius: 4,
    backgroundColor: '#b96f71',
    opacity: 0.36,
  },
  customLayoutHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 420,
  },
  customLayoutControls: {
    gap: 14,
  },
  customLayoutCard: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 14,
    boxShadow: '0 12px 34px rgba(15,23,42,0.07)',
  },
  customLayoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  customLayoutTitle: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
  },
  customLayoutCount: {
    color: colors.rose,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  customCountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customCountButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCountButtonActive: {
    borderColor: colors.rose,
    backgroundColor: colors.rose,
  },
  customCountText: {
    color: colors.ink,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '900',
  },
  customCountTextActive: {
    color: '#ffffff',
  },
  customManualActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customManualPrimaryButton: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  customManualPrimaryText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
  customManualButton: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  customManualButtonDisabled: {
    opacity: 0.42,
  },
  customManualButtonText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  customManualGhostButton: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  customManualGhostText: {
    color: colors.rose,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  customOrderList: {
    gap: 10,
  },
  customOrderRow: {
    minHeight: 66,
    borderRadius: 8,
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customOrderBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customOrderBadgeText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  customOrderCopy: {
    flex: 1,
    minWidth: 0,
  },
  customOrderTitle: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  customOrderText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  customOrderActions: {
    flexDirection: 'row',
    gap: 6,
  },
  customOrderButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customOrderButtonDisabled: {
    opacity: 0.35,
  },
  customOrderButtonActive: {
    backgroundColor: colors.rose,
    borderColor: colors.rose,
  },
  customOrderButtonText: {
    color: colors.rose,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  customOrderButtonTextActive: {
    color: '#ffffff',
  },
  customFineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customFineButton: {
    width: 50,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customFineButtonWide: {
    minWidth: 86,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  customFineButtonDisabled: {
    opacity: 0.4,
  },
  customFineButtonText: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  customLayoutResetButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  customLayoutResetText: {
    color: colors.rose,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  customLayoutDoneButton: {
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  customLayoutDoneText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  photoConfigCard: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 24,
    boxShadow: '0 12px 34px rgba(15,23,42,0.07)',
  },
  photoConfigTitle: {
    color: '#52525b',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  gifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  gifSubtitle: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
    marginTop: 2,
    maxWidth: 220,
  },
  gifSelectButton: {
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.rose,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  gifSelectButtonText: {
    color: colors.rose,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  gifPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  gifArrowButton: {
    width: 40,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifArrowText: {
    color: colors.rose,
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '600',
  },
  gifPreviewBox: {
    flex: 1,
    height: 116,
    borderRadius: 8,
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gifPreviewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  gifPreviewIcon: {
    color: colors.rose,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  gifMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: -12,
  },
  photoSettingRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(110px, 1fr) minmax(90px, 1fr) 48px',
    gap: 6,
    alignItems: 'center',
  },
  photoSettingLabel: {
    color: '#3f3f46',
    fontSize: 18,
    lineHeight: 24,
  },
  photoSliderWrap: {
    minWidth: 0,
  },
  realSliderWrap: {
    position: 'relative',
    minHeight: 34,
    justifyContent: 'center',
  },
  sliderFillStatic: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 13,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.rose,
    pointerEvents: 'none',
  },
  photoSettingValue: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    textAlign: 'right',
  },
  configBlock: {
    gap: 12,
  },
  configTitle: {
    color: '#3f3f46',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '500',
  },
  sliderTrack: {
    position: 'relative',
    height: 9,
    borderRadius: 5,
    backgroundColor: '#e5e5e5',
    marginTop: 8,
  },
  sliderFill: {
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.rose,
  },
  sliderThumb: {
    position: 'absolute',
    left: 0,
    top: -14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d4d4d8',
    boxShadow: '0 4px 16px rgba(15,23,42,0.12)',
  },
  sliderThumbRight: {
    left: '78%',
  },
  sliderThumbMid: {
    left: '24%',
  },
  sliderThumbLow: {
    left: '16%',
  },
  sliderThumbQuality: {
    left: '42%',
  },
  sliderThumbGifBefore: {
    left: '28%',
  },
  qualityScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sizeRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(120px, 1fr) minmax(120px, 1fr)',
    gap: 14,
    alignItems: 'end',
  },
  sizeValue: {
    color: '#111827',
    fontSize: 18,
    lineHeight: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
    paddingBottom: 6,
    fontWeight: '700',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  },
  presetPill: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetPillActive: {
    backgroundColor: colors.rose,
  },
  presetPillText: {
    color: '#52525b',
    fontSize: 14,
    fontWeight: '900',
  },
  presetPillTextActive: {
    color: '#ffffff',
  },
  scriptPreviewBox: {
    borderRadius: 8,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#e7d8b8',
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  scriptPreviewText: {
    color: '#1f2937',
    fontSize: 34,
    lineHeight: 40,
    fontFamily: '"Brush Script MT", "Segoe Script", "Comic Sans MS", cursive',
    textAlign: 'center',
  },
  normalPreviewName: {
    color: '#b96f71',
    fontSize: 30,
    lineHeight: 36,
    fontFamily: 'Arial, "Helvetica Neue", sans-serif',
    fontWeight: '800',
    textAlign: 'center',
  },
  normalPreviewDetail: {
    color: '#b96f71',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Arial, "Helvetica Neue", sans-serif',
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  normalPreviewDate: {
    color: '#b96f71',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Arial, "Helvetica Neue", sans-serif',
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  scriptPreviewMeta: {
    color: '#71717a',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  scriptInput: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    color: '#111827',
    fontSize: 18,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
  },
  photoTextQuickPanel: {
    gap: 14,
  },
  customOpenButton: {
    minHeight: 66,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rose,
    backgroundColor: colors.roseSoft,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  customOpenTitle: {
    color: colors.roseDark,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  customOpenMeta: {
    color: colors.rose,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'right',
  },
  typeConfigHint: {
    color: colors.rose,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    marginTop: 8,
  },
  animationPicker: {
    gap: 10,
  },
  animationChoice: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
  },
  animationChoiceActive: {
    borderColor: '#b51f5a',
    backgroundColor: '#fff1f6',
  },
  animationChoiceIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#b51f5a',
    boxShadow: '0 0 18px rgba(181,31,90,0.28)',
  },
  animationChoiceText: {
    color: '#52525b',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  animationChoiceTextActive: {
    color: '#8b1747',
  },
  configMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  configMeta: {
    color: '#52525b',
    fontSize: 16,
    lineHeight: 22,
  },
  configMetaStrong: {
    color: '#111827',
    fontWeight: '900',
  },
  configValue: {
    alignSelf: 'flex-end',
    color: '#71717a',
    fontSize: 16,
    fontWeight: '900',
  },
  checkRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  checkCopy: {
    flex: 1,
    minWidth: 0,
  },
  checkBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  checkBoxOff: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '900',
  },
  checkTitle: {
    color: '#52525b',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600',
  },
  checkText: {
    color: '#52525b',
    fontSize: 13,
    lineHeight: 18,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  timelineActions: {
    flexDirection: 'row',
    gap: 18,
  },
  timelineAction: {
    color: colors.rose,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '900',
  },
  timelinePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timelineArrow: {
    color: colors.rose,
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '300',
  },
  timelineCard: {
    flex: 1,
    height: 92,
    maxWidth: 190,
    borderWidth: 4,
    borderColor: colors.rose,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCardIcon: {
    color: '#111827',
    fontSize: 20,
    lineHeight: 22,
  },
  timelineCardText: {
    color: colors.rose,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  timelineScale: {
    maxWidth: 220,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: '#e5e5e5',
    paddingTop: 4,
    marginLeft: 48,
  },
  previewConfigRow: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  previewConfigImage: {
    width: 150,
    height: 150,
    objectFit: 'cover',
  },
  previewConfigCopy: {
    flex: 1,
    minWidth: 220,
    gap: 10,
  },
  previewConfigButton: {
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  previewConfigButtonText: {
    color: colors.rose,
    fontSize: 16,
    fontWeight: '900',
  },
  previewConfigLink: {
    color: colors.rose,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
  },
  previewConfigMeta: {
    color: '#71717a',
    fontSize: 13,
    lineHeight: 18,
  },
  backgroundRemovalPage: {
    minHeight: 'calc(100vh - 36px)',
    borderRadius: 8,
    backgroundColor: '#f7f7f8',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  backgroundRemovalContent: {
    display: 'grid',
    gridTemplateColumns: 'minmax(320px, 1fr) minmax(340px, 440px)',
    gap: 18,
    padding: 20,
    alignItems: 'start',
  },
  backgroundRemovalContentMobile: {
    display: 'flex',
  },
  backgroundPreviewPanel: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    gap: 16,
    boxShadow: '0 12px 34px rgba(15,23,42,0.07)',
  },
  backgroundPreviewCanvas: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  },
  backgroundBefore: {
    position: 'relative',
    minHeight: 430,
    borderRadius: 8,
    backgroundColor: colors.dark,
    overflow: 'hidden',
  },
  backgroundAfter: {
    position: 'relative',
    minHeight: 430,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundPreviewImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  backgroundBeforeWash: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  transparentGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
    backgroundSize: '28px 28px',
  },
  personCutout: {
    width: 190,
    height: 270,
    borderRadius: 95,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 18px 44px rgba(10,77,232,0.24)',
  },
  personCutoutHead: {
    color: '#ffffff',
    fontSize: 72,
    lineHeight: 76,
    marginBottom: -18,
  },
  personCutoutBody: {
    color: '#ffffff',
    fontSize: 142,
    lineHeight: 146,
  },
  backgroundPreviewLabel: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    minHeight: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(17,24,39,0.82)',
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 30,
    fontWeight: '900',
    paddingHorizontal: 12,
  },
  backgroundPreviewMeta: {
    gap: 6,
  },
  backgroundPreviewTitle: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  backgroundPreviewText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  backgroundSettingsPanel: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 20,
    gap: 24,
    boxShadow: '0 12px 34px rgba(15,23,42,0.07)',
  },
  backgroundToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  backgroundToggleCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  toggleSwitch: {
    width: 66,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.rose,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleSwitchOff: {
    backgroundColor: '#cbd5e1',
  },
  toggleKnob: {
    alignSelf: 'flex-end',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    boxShadow: '0 3px 12px rgba(15,23,42,0.18)',
  },
  toggleKnobOff: {
    alignSelf: 'flex-start',
  },
  backgroundSettingBlock: {
    gap: 12,
  },
  backgroundSettingLabel: {
    color: '#3f3f46',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  backgroundSettingText: {
    color: '#52525b',
    fontSize: 15,
    lineHeight: 21,
  },
  segmentedControl: {
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: '#f1f5f9',
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  segmentedOption: {
    flex: 1,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  segmentedOptionActive: {
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 14px rgba(15,23,42,0.10)',
  },
  segmentedOptionText: {
    color: '#71717a',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  segmentedOptionTextActive: {
    color: colors.rose,
  },
  backgroundChoiceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  },
  backgroundChoice: {
    minHeight: 98,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    padding: 10,
    gap: 8,
  },
  backgroundChoiceActive: {
    borderColor: colors.rose,
    backgroundColor: colors.roseSoft,
  },
  backgroundChoiceSwatch: {
    position: 'relative',
    height: 42,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  backgroundChoicePattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
    backgroundSize: '18px 18px',
  },
  backgroundChoiceText: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  backgroundSettingRow: {
    minHeight: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },
  backgroundSettingValue: {
    color: colors.rose,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    textAlign: 'right',
    flexShrink: 1,
  },
  backgroundTestButton: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  backgroundTestButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    zIndex: 20,
  },
  modalCard: {
    width: 560,
    maxWidth: 'calc(100vw - 20px)',
    minHeight: 720,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: '#ffffff',
    paddingHorizontal: 40,
    paddingVertical: 52,
    alignItems: 'center',
    gap: 22,
    boxShadow: '0 20px 70px rgba(15,23,42,0.18)',
  },
  modalCardMobile: {
    width: 'calc(100vw - 18px)',
    maxWidth: 380,
    height: 'calc(100vh - 18px)',
    maxHeight: 830,
    minHeight: 0,
    paddingHorizontal: 22,
    paddingVertical: 34,
    justifyContent: 'center',
    gap: 14,
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    top: 18,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: colors.rose,
    fontSize: 42,
    lineHeight: 42,
    fontWeight: '300',
  },
  modalTitle: {
    color: '#000000',
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalTitleMobile: {
    maxWidth: 250,
    fontSize: 27,
    lineHeight: 32,
    marginTop: 18,
  },
  modalQuestion: {
    color: '#111827',
    fontSize: 22,
    lineHeight: 29,
    textAlign: 'center',
  },
  modalQuestionMobile: {
    fontSize: 17,
    lineHeight: 22,
  },
  modalInput: {
    width: 360,
    maxWidth: '100%',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#555555',
    outlineStyle: 'none',
    color: colors.ink,
    fontSize: 19,
    textAlign: 'center',
    paddingVertical: 10,
  },
  modalInputError: {
    color: '#dc2626',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: -8,
  },
  modalInputMobile: {
    fontSize: 17,
    paddingVertical: 8,
  },
  modalTypeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    maxWidth: 560,
  },
  modalTypeWrapMobile: {
    gap: 8,
    maxWidth: 280,
  },
  typeChip: {
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  typeChipMobile: {
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: 13,
  },
  typeChipActive: {
    backgroundColor: colors.rose,
    borderColor: colors.rose,
  },
  typeChipText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  typeChipTextMobile: {
    fontSize: 13,
  },
  typeChipTextActive: {
    color: '#ffffff',
  },
  outlineButton: {
    minHeight: 58,
    width: '100%',
    maxWidth: 280,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: colors.rose,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: colors.rose,
    fontSize: 17,
    fontWeight: '900',
  },
  modalActionButtonMobile: {
    minHeight: 54,
  },
  modalActionTextMobile: {
    fontSize: 16,
  },
  orText: {
    color: '#000000',
    fontSize: 22,
    lineHeight: 22,
  },
  orTextMobile: {
    fontSize: 19,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 62,
    width: '100%',
    maxWidth: 290,
    borderRadius: 31,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 22px rgba(10,77,232,0.28)',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  modalProductBox: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: colors.roseSoft,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  modalProductBoxMobile: {
    padding: 14,
    gap: 12,
    marginTop: 0,
  },
  modalProductIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalProductIconMobile: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  modalProductIconText: {
    color: colors.rose,
    fontSize: 26,
    fontWeight: '900',
  },
  modalProductIconTextMobile: {
    fontSize: 22,
  },
  modalProductCopy: {
    flex: 1,
  },
  modalProductTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  modalProductTitleMobile: {
    fontSize: 14,
  },
  modalProductText: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 3,
  },
  modalProductTextMobile: {
    fontSize: 13,
  },
})
