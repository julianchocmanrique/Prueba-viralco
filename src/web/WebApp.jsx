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
import playaImage from '../assets/plantillas/playa.jpg'
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

const appSetupStorageKey = 'viralco-mirror-photo-app'
const appSessionStorageKey = 'viralco-mirror-photo-session'
const recentEventsStorageKey = 'viralco-mirror-recent-events'
const deletedEventsStorageKey = 'viralco-mirror-deleted-events'
const eventGalleryStorageKey = 'viralco-mirror-event-galleries'
const activeProfileStorageKey = 'viralco-mirror-active-profile'
const cloudApiBase = 'https://beijing-recommend-marilyn-por.trycloudflare.com'
const photoUploadEndpoint = `${cloudApiBase}/prueba-viralco/api/photos/`
const cloudStateEndpoint = `${cloudApiBase}/prueba-viralco/api/state/`
const persistentPhotoDbName = 'viralco-mirror-photo-images'
const persistentPhotoStoreName = 'images'
const persistentFinalPhotoKey = 'final'
const persistentFrameKey = (index) => `frame-${index}`
const cp1500ShortEdgeCm = 10
const cp1500LongEdgeCm = 14.8
const cp1500CanvasWidth = 2000
const cp1500CanvasHeight = Math.round(cp1500CanvasWidth * (cp1500LongEdgeCm / cp1500ShortEdgeCm))
const createEventSlug = (value) =>
  String(value || 'evento-viralco')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'evento-viralco'
const getEventIdentity = (event) => event?.id || event?.name || createEventSlug(event?.eventName || event?.name)

const openPersistentPhotoDb = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no disponible'))
      return
    }
    const request = window.indexedDB.open(persistentPhotoDbName, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(persistentPhotoStoreName)) {
        db.createObjectStore(persistentPhotoStoreName)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('No se pudo abrir IndexedDB'))
  })

const writePersistentPhoto = async (key, value) => {
  const db = await openPersistentPhotoDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(persistentPhotoStoreName, 'readwrite')
    const store = transaction.objectStore(persistentPhotoStoreName)
    const request = value ? store.put(value, key) : store.delete(key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
    transaction.onerror = () => {
      db.close()
      reject(transaction.error)
    }
  })
}

const readPersistentPhoto = async (key) => {
  const db = await openPersistentPhotoDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(persistentPhotoStoreName, 'readonly')
    const store = transaction.objectStore(persistentPhotoStoreName)
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result || '')
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
    transaction.onerror = () => {
      db.close()
      reject(transaction.error)
    }
  })
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
    aspect: `${cp1500ShortEdgeCm} / ${cp1500LongEdgeCm}`,
    width: cp1500CanvasWidth,
    height: cp1500CanvasHeight,
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
    { id: 'boda-clasica', name: 'Playa elegante', image: playaImage, tone: '#0ea5e9' },
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
const customTextFonts = ['Arial', 'Georgia', 'Impact', 'Verdana', 'Courier New']
const customTextColors = [
  '#111827', '#ffffff', '#6b7280', '#d1d5db',
  '#7f1d1d', '#dc2626', '#f97316', '#facc15',
  '#16a34a', '#22c55e', '#14b8a6', '#06b6d4',
  '#0a4de8', '#2563eb', '#6366f1', '#7c3aed',
  '#a21caf', '#ec4899', '#f43f5e', '#b96f71',
]
const customTextLabels = {
  script: 'Frase',
  name: 'Nombre',
  event: 'Evento',
  date: 'Fecha',
}
const defaultCustomTextLayers = {
  script: { x: 18, y: 6.5, width: 64, size: 18, color: '#7f1d1d', font: 'Arial' },
  name: { x: 18, y: 80, width: 64, size: 22, color: '#7f1d1d', font: 'Arial' },
  event: { x: 20, y: 85, width: 60, size: 14, color: '#111827', font: 'Arial' },
  date: { x: 24, y: 89, width: 52, size: 12, color: '#6b7280', font: 'Arial' },
}
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
const defaultOperatorEvents = [
  {
    id: 'op1-cumple-color',
    operatorId: 'operario-1',
    name: 'Cumple Laura',
    eventName: 'Cumple Laura',
    eventType: 'Cumpleaños',
    photoTypeId: 'doble',
    templateId: 'cumple-color',
    filter: 'Original',
    updatedAt: 'Asignado',
  },
  {
    id: 'op2-corporativo-gala',
    operatorId: 'operario-2',
    name: 'Gala Empresa',
    eventName: 'Gala Empresa',
    eventType: 'Corporativo',
    photoTypeId: 'postal',
    templateId: 'corp-gala',
    filter: 'Glam',
    updatedAt: 'Asignado',
  },
]
const defaultRecentEvents = [
  {
    id: 'boda-valentina',
    name: 'Boda Valentina',
    eventName: 'Boda Valentina',
    eventType: 'Boda',
    photoTypeId: 'postal',
    templateId: 'boda-clasica',
    filter: 'Glam',
    updatedAt: 'Reciente',
  },
  ...defaultOperatorEvents,
]
const mergeEventsWithDefaults = (events = [], deletedIds = []) => {
  const savedIds = new Set(events.map(getEventIdentity))
  const missingDefaults = defaultRecentEvents.filter((event) => {
    const eventId = getEventIdentity(event)
    return !savedIds.has(eventId) && !deletedIds.includes(eventId)
  })
  return [...events, ...missingDefaults].filter((event) => !deletedIds.includes(getEventIdentity(event)))
}
const profileOptions = [
  { id: 'admin', name: 'Administrador', shortName: 'Admin', role: 'admin' },
  { id: 'operario-1', name: 'Operario 1', shortName: 'Op. 1', role: 'operator' },
  { id: 'operario-2', name: 'Operario 2', shortName: 'Op. 2', role: 'operator' },
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
  { id: '10x15', label: '10 x 15', sizeText: '10 x 15 cm', width: '10', height: '15', margin: '0', note: 'Hoja para dos tiras 5x15.' },
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
  fit: 'Rellenar',
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
  const { width, height } = useWindowDimensions()
  const isMobile = width < 760
  const isPhone = width <= 500
  const isShortScreen = height < 720
  const isPortraitMirrorScreen = width >= 760 && width < 880 && height > width * 1.35
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
  const [qrPhotoUrl, setQrPhotoUrl] = useState('')
  const [showPreviewShareMenu, setShowPreviewShareMenu] = useState(false)
  const [showEventGallery, setShowEventGallery] = useState(false)
  const [selectedGalleryId, setSelectedGalleryId] = useState('')
  const [selectedGalleryPrintIds, setSelectedGalleryPrintIds] = useState([])
  const [showBackgroundRemovalScreen, setShowBackgroundRemovalScreen] = useState(false)
  const [showEventOptionsScreen, setShowEventOptionsScreen] = useState(false)
  const [showAnimationVideoScreen, setShowAnimationVideoScreen] = useState(false)
  const [showLaunchIntroScreen, setShowLaunchIntroScreen] = useState(false)
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
  const previewOutputWidth = Math.min(width * 0.92, Math.max(280, (height - (isMobile ? 250 : 280)) * (selectedType.width / selectedType.height)), 860)
  const [selectedTemplate, setSelectedTemplate] = useState(getTemplatesForEventType(defaultEventType)[0])
  const [selectedFilter, setSelectedFilter] = useState(filters[0])
  const [activeProfileId, setActiveProfileId] = useState('admin')
  const [recentEvents, setRecentEvents] = useState(defaultRecentEvents)
  const [deletedEventIds, setDeletedEventIds] = useState([])
  const [eventGalleries, setEventGalleries] = useState({})
  const [selectedRecentId, setSelectedRecentId] = useState(defaultRecentEvents[0]?.id || '')
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraOpening, setCameraOpening] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [photoFrames, setPhotoFrames] = useState([])
  const [finalPhotoUrl, setFinalPhotoUrl] = useState('')
  const [savedPhotoUrl, setSavedPhotoUrl] = useState('')
  const [savedPhotoId, setSavedPhotoId] = useState('')
  const [photoSaveStatus, setPhotoSaveStatus] = useState('')
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
  const [photoReviewSeconds, setPhotoReviewSeconds] = useState(5)
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
  const [selectedCustomLayoutPhotos, setSelectedCustomLayoutPhotos] = useState([1])
  const [multiCustomLayoutSelect, setMultiCustomLayoutSelect] = useState(false)
  const [customMirrorMode, setCustomMirrorMode] = useState(false)
  const [customTextLayers, setCustomTextLayers] = useState(defaultCustomTextLayers)
  const [selectedCustomTextLayer, setSelectedCustomTextLayer] = useState('name')
  const [showCustomTextColorPalette, setShowCustomTextColorPalette] = useState(false)
  const [showCustomTextFontMenu, setShowCustomTextFontMenu] = useState(false)
  const [uploadedCustomFonts, setUploadedCustomFonts] = useState([])
  const [activeCustomMenu, setActiveCustomMenu] = useState('photos')
  const [customAlignmentGuides, setCustomAlignmentGuides] = useState({ x: [], y: [] })
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
  const cameraOpenRequestRef = useRef(0)
  const countdownRef = useRef(null)
  const customEditorStripRef = useRef(null)
  const customLayoutPointerRef = useRef(null)
  const storageHydratedRef = useRef(false)
  const cloudStateSaveTimerRef = useRef(null)

  const eventTitle = eventName.trim() || 'Evento Viralco'
  const eventGalleryId = selectedRecentId || createEventSlug(eventTitle)
  const fallbackEventGalleryId = createEventSlug(eventTitle)
  const currentEventGalleryItems = [
    ...(eventGalleries[eventGalleryId]?.items || []),
    ...(eventGalleryId !== fallbackEventGalleryId ? (eventGalleries[fallbackEventGalleryId]?.items || []) : []),
  ]
  const currentEventGallery = currentEventGalleryItems.filter((photo, index, all) => (
    index === all.findIndex((item) => (item.id || item.src) === (photo.id || photo.src))
  ))
  const latestEventGalleryPhoto = currentEventGallery[0]
  const activeProfile = profileOptions.find((profile) => profile.id === activeProfileId) || profileOptions[0]
  const isAdminProfile = activeProfile.role === 'admin'
  const visibleLaunchEvents = useMemo(() => {
    const activeEvents = recentEvents.filter((item) => !deletedEventIds.includes(getEventIdentity(item)))
    if (isAdminProfile) return activeEvents
    return activeEvents.filter((item) => item.operatorId === activeProfile.id)
  }, [activeProfile.id, deletedEventIds, isAdminProfile, recentEvents])
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
  const customFontChoices = useMemo(
    () => [...customTextFonts, ...uploadedCustomFonts.map((font) => font.family)],
    [uploadedCustomFonts],
  )
  const selectedShotCount = selectedType.id === 'personalizar-5x15' ? customPhotoCount : selectedType.shots
  const normalizedPrintSettings = useMemo(() => {
    const parsePositive = (value, fallback) => {
      const parsed = Number(String(value).replace(',', '.'))
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
    }
    const widthCm = cp1500ShortEdgeCm
    const heightCm = cp1500LongEdgeCm
    const marginCm = Math.min(parsePositive(printSettings.marginCm, 0), Math.min(widthCm, heightCm) / 3)
    const copies = Math.min(Math.max(Math.round(parsePositive(printSettings.copies, 1)), 1), 20)
    const dpi = printDpiOptions.includes(Number(printSettings.dpi)) ? Number(printSettings.dpi) : 300
    const orientedWidthCm = widthCm
    const orientedHeightCm = heightCm
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
    () => visibleLaunchEvents.find((item) => (item.id || item.name) === selectedRecentId) || visibleLaunchEvents[0],
    [visibleLaunchEvents, selectedRecentId],
  )
  const getEventGalleryIds = (event) => [
    event?.id,
    createEventSlug(event?.eventName || event?.name),
  ].filter(Boolean).filter((id, index, all) => all.indexOf(id) === index)
  const normalizeGalleryItems = (items = []) => items
    .filter((photo, photoIndex, all) => (
      photoIndex === all.findIndex((item) => (item.id || item.src) === (photo.id || photo.src))
    ))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  const getEventGalleryFolder = (event, index = 0) => {
    const ids = getEventGalleryIds(event)
    const items = normalizeGalleryItems(ids.flatMap((id) => eventGalleries[id]?.items || []))
    return {
      id: ids[0] || `evento-${index + 1}`,
      event,
      eventName: event?.eventName || event?.name || `Evento ${index + 1}`,
      items,
      latest: items[0],
      operatorId: event?.operatorId || 'admin',
    }
  }
  const visibleGalleryFolders = useMemo(() => {
    const sourceEvents = isAdminProfile
      ? recentEvents.filter((item) => !deletedEventIds.includes(getEventIdentity(item)))
      : visibleLaunchEvents
    const folders = sourceEvents.map(getEventGalleryFolder)
    if (!isAdminProfile) return folders

    const knownIds = new Set(folders.flatMap((folder) => [folder.id, ...getEventGalleryIds(folder.event)]))
    const remoteOnlyFolders = Object.values(eventGalleries)
      .filter((gallery) => gallery?.id && !knownIds.has(gallery.id))
      .map((gallery, index) => {
        const items = normalizeGalleryItems(gallery.items || [])
        return {
          id: gallery.id || `galeria-${index + 1}`,
          event: { id: gallery.id, name: gallery.eventName, eventName: gallery.eventName, operatorId: gallery.operatorId },
          eventName: gallery.eventName || `Evento ${index + 1}`,
          items,
          latest: items[0],
          operatorId: gallery.operatorId || 'admin',
        }
      })

    return [...folders, ...remoteOnlyFolders]
  }, [deletedEventIds, eventGalleries, isAdminProfile, recentEvents, visibleLaunchEvents])
  const getGalleryPhotoKey = (photo, index = 0) =>
    String(photo?.id || photo?.publicUrl || photo?.src || `gallery-photo-${index}`)
  const getGalleryPhotoSource = (photo) => photo?.localUrl || photo?.publicUrl || photo?.src || ''
  const openEventGallery = (galleryId) => {
    setSelectedGalleryId(galleryId)
    setSelectedGalleryPrintIds([])
    setShowEventGallery(true)
  }
  const closeEventGallery = () => {
    setShowEventGallery(false)
    setSelectedGalleryPrintIds([])
  }
  const toggleGalleryPrintSelection = (photo, index) => {
    const photoKey = getGalleryPhotoKey(photo, index)
    setSelectedGalleryPrintIds((current) => (
      current.includes(photoKey)
        ? current.filter((item) => item !== photoKey)
        : [...current, photoKey]
    ))
  }
  const eventTemplateOptions = useMemo(() => getTemplatesForEventType(eventType), [eventType])
  const printSizeLabel = '10x15 cm'
  const activePrintLabel = 'Canon CP1500'
  const getAppRoutePath = (route = 'inicio') => {
    const base = import.meta.env.BASE_URL || '/'
    const normalizedBase = base.endsWith('/') ? base : `${base}/`
    return `${normalizedBase}${route}`.replace(/\/{2,}/g, '/')
  }
  const updateAppRoute = (route = 'inicio', replace = false) => {
    if (typeof window === 'undefined') return
    const nextPath = getAppRoutePath(route)
    if (window.location.pathname === nextPath) return
    window.history[replace ? 'replaceState' : 'pushState']({ viralcoRoute: route }, '', nextPath)
  }
  const getRouteFromLocation = () => {
    if (typeof window === 'undefined') return 'inicio'
    const base = import.meta.env.BASE_URL || '/'
    const normalizedBase = base.endsWith('/') ? base : `${base}/`
    const route = window.location.pathname.startsWith(normalizedBase)
      ? window.location.pathname.slice(normalizedBase.length)
      : ''
    return route.replace(/^\/+|\/+$/g, '') || 'inicio'
  }
  const applyAppRouteState = (route = 'inicio') => {
    const validRoutes = new Set([
      'inicio',
      'nuevo-evento',
      'editor-inicio',
      'diseno-foto',
      'modo-captura',
      'configuracion-captura',
      'impresion',
      'fondo',
      'configurar-evento',
      'animacion',
      'lanzar-evento',
      'personalizar',
      'captura',
      'preview',
      'compartir',
    ])
    const cleanRoute = ['diseno-foto', 'modo-captura', 'fondo'].includes(route) ? 'configuracion-captura' : route
    const nextRoute = validRoutes.has(cleanRoute) ? cleanRoute : 'inicio'
    setShowHomeLauncher(nextRoute === 'inicio' || nextRoute === 'nuevo-evento')
    setShowCreateEventModal(nextRoute === 'nuevo-evento')
    setShowStartEditor(nextRoute === 'editor-inicio')
    setShowPhotoDesignScreen(nextRoute === 'diseno-foto')
    setShowCaptureModeScreen(nextRoute === 'modo-captura')
    setShowCaptureConfigScreen(nextRoute === 'configuracion-captura')
    setShowPrintConfigScreen(nextRoute === 'impresion')
    setShowBackgroundRemovalScreen(nextRoute === 'fondo')
    setShowEventOptionsScreen(nextRoute === 'configurar-evento')
    setShowAnimationVideoScreen(false)
    setShowLaunchIntroScreen(nextRoute === 'lanzar-evento' || nextRoute === 'animacion')
    setShowCustomPhotoLayoutScreen(nextRoute === 'personalizar')
    setShowCapturePhotoScreen(nextRoute === 'captura')
    setCaptureIntroActive(nextRoute === 'captura')
    setShowPreviewScreen(nextRoute === 'preview')
    setShowShareScreen(nextRoute === 'compartir')
    setShowOperatorMenu(false)
    setOperatorQuickPanel(null)
    setShowPreviewShareMenu(false)
  }
  const sharePageUrl =
    savedPhotoUrl || (typeof window !== 'undefined'
      ? window.location.href
      : 'https://www.viralcoproducciones.com/prueba-viralco/')
  const shareText = `${eventTitle}: foto del espejo mágico Viralco lista. ${sharePageUrl}`
  const encodedShareText = encodeURIComponent(shareText)
  const qrTargetUrl = qrPhotoUrl || savedPhotoUrl || sharePageUrl
  const encodedShareUrl = encodeURIComponent(qrTargetUrl)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=14&data=${encodedShareUrl}`
  const clearSavedPhoto = () => {
    setSavedPhotoUrl('')
    setSavedPhotoId('')
    setPhotoSaveStatus('')
    setQrPhotoUrl('')
  }

  const closePreviewShareMenu = () => setShowPreviewShareMenu(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const base = import.meta.env.BASE_URL || '/'
    const normalizedBase = base.endsWith('/') ? base : `${base}/`
    const syncRoute = () => applyAppRouteState(getRouteFromLocation())
    if (window.location.pathname === normalizedBase || window.location.pathname === normalizedBase.slice(0, -1)) {
      updateAppRoute('inicio', true)
    } else {
      syncRoute()
    }
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

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
    customMirrorMode,
    customTextLayers,
    uploadedCustomFonts,
    templateId: selectedTemplate.id,
    filter: selectedFilter,
    captureOriginal,
    photoCountdownFirst,
    photoCountdownNext,
    photoReviewSeconds,
    flashBeforePhoto,
    roamingMode,
    qualityMode,
    activePreset,
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
    const nextNumber = (value, fallback) => {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : fallback
    }

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
      setCustomMirrorMode(Boolean(setup.customMirrorMode))
      if (setup.customTextLayers && typeof setup.customTextLayers === 'object') {
        setCustomTextLayers({ ...defaultCustomTextLayers, ...setup.customTextLayers })
      }
      if (Array.isArray(setup.uploadedCustomFonts)) {
        setUploadedCustomFonts(setup.uploadedCustomFonts)
      }
      setSelectedCustomLayoutPhoto(1)
      setSelectedCustomLayoutPhotos(nextCustomCount ? [1] : [])
      setMultiCustomLayoutSelect(false)
    }
    setSelectedTemplate(nextTemplate)
    setSelectedFilter(nextFilter)
    setCaptureOriginal(setup.captureOriginal !== undefined ? Boolean(setup.captureOriginal) : captureOriginal)
    setPhotoCountdownFirst(Math.min(Math.max(Math.round(nextNumber(setup.photoCountdownFirst, photoCountdownFirst)), 1), 10))
    setPhotoCountdownNext(Math.min(Math.max(Math.round(nextNumber(setup.photoCountdownNext, photoCountdownNext)), 1), 10))
    setPhotoReviewSeconds(Math.min(Math.max(Math.round(nextNumber(setup.photoReviewSeconds, photoReviewSeconds)), 1), 8))
    setFlashBeforePhoto(setup.flashBeforePhoto !== undefined ? Boolean(setup.flashBeforePhoto) : flashBeforePhoto)
    setRoamingMode(setup.roamingMode !== undefined ? Boolean(setup.roamingMode) : roamingMode)
    if (qualityOptions.includes(setup.qualityMode)) setQualityMode(setup.qualityMode)
    if (['Suave', 'Rápido', 'Fiesta', 'Evento'].includes(setup.activePreset)) setActivePreset(setup.activePreset)
    setPhotoFrames([])
    setFinalPhotoUrl('')
    clearSavedPhoto()
    setRetakeFrameIndex(null)
    setAnimationVideoPromptAnswered(false)
    setAnimationVideoQuestionMode('question')
    setCountdown('')
    setCaptureStatus(`${nextName}: ${status}`)
  }

  const rememberRecentEvent = (setup) => {
    const setupId = getEventIdentity(setup)
    setDeletedEventIds((current) => current.filter((id) => id !== setupId))
    setRecentEvents((current) => {
      const next = [
        { ...setup, id: setup.id || `evento-${Date.now()}`, updatedAt: 'Ahora' },
        ...current.filter((item) => getEventIdentity(item) !== setupId),
      ].slice(0, 200)
      return next
    })
  }

  const deleteRecentEvent = (eventToDelete) => {
    const eventId = getEventIdentity(eventToDelete)
    const galleryIds = getEventGalleryIds(eventToDelete)
    setRecentEvents((current) => current.filter((item) => getEventIdentity(item) !== eventId))
    setDeletedEventIds((current) => (current.includes(eventId) ? current : [...current, eventId]))
    setEventGalleries((current) => {
      const next = { ...current }
      galleryIds.forEach((galleryId) => {
        delete next[galleryId]
      })
      return next
    })
    if ((selectedRecentId || '') === eventId || selectedRecentId === eventToDelete?.name) {
      setSelectedRecentId('')
    }
    setCaptureStatus(`${eventToDelete?.name || eventToDelete?.eventName || 'Evento'} eliminado.`)
  }

  const saveCurrentSetupToRecentEvents = (status = 'Evento guardado.') => {
    const currentSetup = getCurrentSetup()
    const existingSetup =
      selectedRecentEvent ||
      recentEvents.find((item) => (item.id || item.name) === selectedRecentId)
    const savedSetup = {
      ...existingSetup,
      ...currentSetup,
      id: existingSetup?.id || selectedRecentId || currentSetup.id,
      operatorId: existingSetup?.operatorId || currentSetup.operatorId,
      updatedAt: 'Ahora',
    }

    rememberRecentEvent(savedSetup)
    setSelectedRecentId(savedSetup.id || savedSetup.name)
    setCaptureStatus(status)
    return savedSetup
  }

  const launchEvent = (setup = getCurrentSetup(), destination = 'capture') => {
    const shouldShowLaunchIntro = destination === 'capture'
    setSelectedRecentId(setup.id || setup.name || createEventSlug(setup.eventName || setup.name))
    applyEventSetup(setup)
    rememberRecentEvent(setup)
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(destination === 'options')
    setShowAnimationVideoScreen(false)
    setShowLaunchIntroScreen(shouldShowLaunchIntro)
    setShowCustomPhotoLayoutScreen(false)
    setShowCapturePhotoScreen(false)
    setCaptureIntroActive(false)
    setShowPreviewScreen(destination === 'preview')
    setShowShareScreen(destination === 'share')
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    if (destination === 'options') updateAppRoute('configurar-evento')
    else if (shouldShowLaunchIntro) updateAppRoute('lanzar-evento')
    else if (destination === 'preview') updateAppRoute('preview')
    else if (destination === 'share') updateAppRoute('compartir')
  }

  const openNewEventModal = () => {
    setEventName('')
    setEventNameError('')
    setEventType('')
    setSelectedTemplate(getTemplatesForEventType(defaultEventType)[0])
    setPhotoFrames([])
    setFinalPhotoUrl('')
    clearSavedPhoto()
    setRetakeFrameIndex(null)
    setAnimationVideoPromptAnswered(false)
    setAnimationVideoQuestionMode('question')
    setCaptureStatus('Escribe el nombre del evento')
    setShowEventOptionsScreen(false)
    setShowCustomPhotoLayoutScreen(false)
    setShowLaunchIntroScreen(false)
    setShowCapturePhotoScreen(false)
    setCaptureIntroActive(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    updateAppRoute('nuevo-evento')
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

  const switchProfile = (profileId) => {
    setActiveProfileId(profileId)
    setShowCreateEventModal(false)
    setShowOperatorMenu(false)
    setOperatorQuickPanel(null)
    setCaptureStatus(`Perfil ${profileOptions.find((profile) => profile.id === profileId)?.name || 'Viralco'} activo.`)
  }

  const returnToHomeScreen = () => {
    setShowPreviewShareMenu(false)
    setShowEventGallery(false)
    setShowOperatorMenu(false)
    setOperatorQuickPanel(null)
    applyAppRouteState('inicio')
    updateAppRoute('inicio')
  }

  const renderHiddenHomeButton = () => (
    <Pressable
      onPress={returnToHomeScreen}
      style={styles.hiddenHomeButton}
      accessibilityRole="button"
      accessibilityLabel="Volver a inicio"
    >
      <View style={styles.hiddenHomeButtonDot} />
    </Pressable>
  )

  const startLaunchIntroExperience = () => {
    setShowLaunchIntroScreen(false)
    setShowCapturePhotoScreen(true)
    setCaptureIntroActive(true)
    setCountdown('')
    setCaptureStatus(`${selectedType.name}: listo para tomar fotos`)
    updateAppRoute('captura')
    void ensureCameraReady('Verificando cámara antes de iniciar el evento...')
  }

  const fetchServerEventGalleries = async () => {
    if (typeof fetch === 'undefined') return null
    try {
      const response = await fetch(photoUploadEndpoint, { method: 'GET', cache: 'no-store' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result?.ok || !Array.isArray(result.photos)) return null

      return result.photos.reduce((folders, photo) => {
        const galleryId = photo.eventId || createEventSlug(photo.eventName)
        const item = {
          id: photo.id,
          eventId: galleryId,
          operatorId: photo.operatorId || 'admin',
          eventName: photo.eventName || 'Evento Viralco',
          photoType: photo.photoType || 'Foto',
          templateName: photo.templateName || 'Plantilla',
          createdAt: photo.createdAt || photo.savedAt || new Date().toISOString(),
          src: photo.absoluteUrl || photo.url,
          publicUrl: photo.absoluteUrl || photo.url,
          localUrl: '',
          frames: photo.frameCount || 0,
        }
        if (!item.src) return folders
        const gallery = folders[galleryId] || {
          id: galleryId,
          eventName: item.eventName,
          operatorId: item.operatorId,
          items: [],
        }
        return {
          ...folders,
          [galleryId]: {
            ...gallery,
            eventName: gallery.eventName || item.eventName,
            operatorId: gallery.operatorId || item.operatorId,
            updatedAt: item.createdAt,
            items: [item, ...gallery.items].slice(0, 60),
          },
        }
      }, {})
    } catch {
      return null
    }
  }

  const compactCloudGalleries = (galleries = {}) => (
    Object.fromEntries(
      Object.entries(galleries || {}).map(([key, gallery]) => [
        key,
        {
          id: gallery?.id || key,
          eventName: gallery?.eventName || 'Evento Viralco',
          operatorId: gallery?.operatorId || 'admin',
          updatedAt: gallery?.updatedAt || '',
          items: (gallery?.items || []).slice(0, 80).map((photo) => {
            const publicUrl = photo.publicUrl || (typeof photo.src === 'string' && !photo.src.startsWith('data:') ? photo.src : '')
            return {
              id: photo.id,
              eventId: photo.eventId || key,
              operatorId: photo.operatorId || gallery?.operatorId || 'admin',
              eventName: photo.eventName || gallery?.eventName || 'Evento Viralco',
              photoType: photo.photoType || 'Foto',
              templateName: photo.templateName || 'Plantilla',
              createdAt: photo.createdAt || '',
              src: publicUrl,
              publicUrl,
              localUrl: '',
              frames: photo.frames || 0,
            }
          }).filter((photo) => photo.src || photo.publicUrl),
        },
      ]),
    )
  )

  const fetchServerAppState = async () => {
    if (typeof fetch === 'undefined') return null
    try {
      const response = await fetch(cloudStateEndpoint, { method: 'GET', cache: 'no-store' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result?.ok || !result.state) return null
      return {
        recentEvents: Array.isArray(result.state.recentEvents) ? result.state.recentEvents : [],
        deletedEventIds: Array.isArray(result.state.deletedEventIds) ? result.state.deletedEventIds : [],
        eventGalleries: result.state.eventGalleries && typeof result.state.eventGalleries === 'object' ? result.state.eventGalleries : {},
      }
    } catch {
      return null
    }
  }

  const saveServerAppState = async (state) => {
    if (typeof fetch === 'undefined') return false
    try {
      const response = await fetch(cloudStateEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recentEvents: state.recentEvents,
          deletedEventIds: state.deletedEventIds,
          eventGalleries: compactCloudGalleries(state.eventGalleries),
        }),
      })
      const result = await response.json().catch(() => ({}))
      return Boolean(response.ok && result?.ok)
    } catch {
      return false
    }
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

    let cancelled = false
    const hydrateStorage = async () => {
      const saved = window.localStorage.getItem(appSetupStorageKey)
      const savedSession = window.localStorage.getItem(appSessionStorageKey)
      const savedRecent = window.localStorage.getItem(recentEventsStorageKey)
      const savedDeletedEvents = window.localStorage.getItem(deletedEventsStorageKey)
      const savedGalleries = window.localStorage.getItem(eventGalleryStorageKey)
      const savedProfile = window.localStorage.getItem(activeProfileStorageKey)

      try {
        if (profileOptions.some((profile) => profile.id === savedProfile)) {
          setActiveProfileId(savedProfile)
        }
        const cloudState = await fetchServerAppState()
        const parsedDeletedEvents = savedDeletedEvents ? JSON.parse(savedDeletedEvents) : []
        const nextDeletedEventIds = (cloudState?.deletedEventIds?.length ? cloudState.deletedEventIds : (Array.isArray(parsedDeletedEvents) ? parsedDeletedEvents : [])).filter(Boolean)
        setDeletedEventIds(nextDeletedEventIds)
        const parsedRecent = savedRecent ? JSON.parse(savedRecent) : null
        const cloudEvents = Array.isArray(cloudState?.recentEvents) ? cloudState.recentEvents : []
        const localEvents = Array.isArray(parsedRecent) ? parsedRecent : []
        const preferredEvents = cloudEvents.length ? cloudEvents : localEvents
        if (preferredEvents.length) {
          const nextRecentEvents = mergeEventsWithDefaults(preferredEvents, nextDeletedEventIds).slice(0, 200)
          setRecentEvents(nextRecentEvents)
          setSelectedRecentId(nextRecentEvents[0]?.id || nextRecentEvents[0]?.name || '')
        }
        if (saved) {
          const setup = JSON.parse(saved)
          applyEventSetup(setup, 'listo para fotos')
        }
        if (savedSession) {
          const session = JSON.parse(savedSession)
          const inlineFrames = Array.isArray(session.photoFrames) ? session.photoFrames.filter(Boolean) : []
          const frameCount = Number(session.photoFrameCount) || inlineFrames.length || 0
          const storedFrames = frameCount
            ? await Promise.all(Array.from({ length: frameCount }, (_, index) => readPersistentPhoto(persistentFrameKey(index)).catch(() => '')))
            : []
          const nextFrames = storedFrames.filter(Boolean).length ? storedFrames.filter(Boolean) : inlineFrames
          const storedFinalPhoto = await readPersistentPhoto(persistentFinalPhotoKey).catch(() => '')
          if (!cancelled) {
            if (nextFrames.length) setPhotoFrames(nextFrames)
            if (storedFinalPhoto || typeof session.finalPhotoUrl === 'string') {
              setFinalPhotoUrl(storedFinalPhoto || session.finalPhotoUrl)
            }
            if (typeof session.savedPhotoUrl === 'string') {
              setSavedPhotoUrl(session.savedPhotoUrl)
            }
            if (typeof session.savedPhotoId === 'string') {
              setSavedPhotoId(session.savedPhotoId)
            }
            if (typeof session.photoSaveStatus === 'string') {
              setPhotoSaveStatus(session.photoSaveStatus)
            }
            if (typeof session.captureStatus === 'string' && session.captureStatus.trim()) {
              setCaptureStatus(session.captureStatus)
            }
          }
        }
        let localGalleries = {}
        if (savedGalleries) {
          const galleries = JSON.parse(savedGalleries)
          if (galleries && typeof galleries === 'object') {
            localGalleries = galleries
          }
        }
        const serverGalleries = await fetchServerEventGalleries()
        if (!cancelled) {
          setEventGalleries({
            ...localGalleries,
            ...(cloudState?.eventGalleries || {}),
            ...(serverGalleries || {}),
          })
        }
      } catch {
        window.localStorage.removeItem(appSetupStorageKey)
        window.localStorage.removeItem(appSessionStorageKey)
        window.localStorage.removeItem(recentEventsStorageKey)
        window.localStorage.removeItem(deletedEventsStorageKey)
        window.localStorage.removeItem(eventGalleryStorageKey)
        window.localStorage.removeItem(activeProfileStorageKey)
      } finally {
        storageHydratedRef.current = true
      }
    }

    hydrateStorage()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    let cancelled = false
    const refreshServerData = async () => {
      const [cloudState, serverGalleries] = await Promise.all([
        fetchServerAppState(),
        fetchServerEventGalleries(),
      ])
      if (cancelled) return
      if (cloudState?.recentEvents?.length || cloudState?.deletedEventIds?.length) {
        const nextDeletedIds = cloudState.deletedEventIds || []
        setDeletedEventIds(nextDeletedIds)
        setRecentEvents(mergeEventsWithDefaults(cloudState.recentEvents || [], nextDeletedIds).slice(0, 200))
      }
      if (!serverGalleries && !cloudState?.eventGalleries) return
      setEventGalleries((current) => ({
        ...current,
        ...(cloudState?.eventGalleries || {}),
        ...serverGalleries,
      }))
    }

    const handleFocus = () => {
      void refreshServerData()
    }
    window.addEventListener('focus', handleFocus)
    const intervalId = window.setInterval(refreshServerData, 12000)

    return () => {
      cancelled = true
      window.removeEventListener('focus', handleFocus)
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !storageHydratedRef.current) return
    const setup = {
      eventName: eventName.trim(),
      eventType,
      photoTypeId: selectedType.id,
      customLayoutMode: 'manual-free',
      customPhotoCount,
      customPhotoOrder: customPhotoSequence,
      customPhotoLayout: customLayoutSlots,
      customMirrorMode,
      customTextLayers,
      uploadedCustomFonts,
      templateId: selectedTemplate.id,
      filter: selectedFilter,
    }
    try {
      window.localStorage.setItem(appSetupStorageKey, JSON.stringify(setup))
    } catch {
      window.localStorage.setItem(appSetupStorageKey, JSON.stringify({ ...setup, uploadedCustomFonts: [] }))
    }
  }, [eventName, eventType, selectedType, customPhotoCount, customPhotoSequence, customLayoutSlots, customMirrorMode, customTextLayers, uploadedCustomFonts, selectedTemplate, selectedFilter])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof FontFace === 'undefined') return
    uploadedCustomFonts.forEach((font) => {
      if (!font?.family || !font?.source) return
      const fontFace = new FontFace(font.family, `url(${font.source})`)
      fontFace.load()
        .then((loadedFace) => {
          document.fonts?.add?.(loadedFace)
        })
        .catch(() => {})
    })
  }, [uploadedCustomFonts])

  useEffect(() => {
    if (typeof window === 'undefined' || !storageHydratedRef.current) return
    let cancelled = false
    const persistSession = async () => {
      try {
        await Promise.all([
          writePersistentPhoto(persistentFinalPhotoKey, finalPhotoUrl),
          ...Array.from({ length: customPhotoMaxSlots }, (_, index) => (
            writePersistentPhoto(persistentFrameKey(index), photoFrames[index] || '')
          )),
        ])
      } catch {
        // Keep metadata even if large image storage is not available.
      }

      if (cancelled) return
      try {
        const session = {
          photoFrameCount: photoFrames.length,
          hasFinalPhoto: Boolean(finalPhotoUrl),
          savedPhotoUrl,
          savedPhotoId,
          photoSaveStatus,
          captureStatus,
          updatedAt: Date.now(),
        }
        window.localStorage.setItem(appSessionStorageKey, JSON.stringify(session))
      } catch {
        try {
          window.localStorage.setItem(appSessionStorageKey, JSON.stringify({
            photoFrameCount: photoFrames.length,
            hasFinalPhoto: Boolean(finalPhotoUrl),
            captureStatus,
            updatedAt: Date.now(),
          }))
        } catch {
          // Ignore session metadata persistence failures.
        }
      }
    }

    persistSession()
    return () => {
      cancelled = true
    }
  }, [photoFrames, finalPhotoUrl, savedPhotoUrl, savedPhotoId, photoSaveStatus, captureStatus])

  useEffect(() => {
    if (typeof window === 'undefined' || !storageHydratedRef.current) return
    window.localStorage.setItem(recentEventsStorageKey, JSON.stringify(recentEvents))
  }, [recentEvents])

  useEffect(() => {
    if (typeof window === 'undefined' || !storageHydratedRef.current) return
    window.localStorage.setItem(deletedEventsStorageKey, JSON.stringify(deletedEventIds))
  }, [deletedEventIds])

  useEffect(() => {
    if (typeof window === 'undefined' || !storageHydratedRef.current) return
    window.localStorage.setItem(activeProfileStorageKey, activeProfileId)
  }, [activeProfileId])

  useEffect(() => {
    const firstLaunchEvent = visibleLaunchEvents[0]
    if (!firstLaunchEvent) {
      setSelectedRecentId('')
      return
    }
    const hasSelectedEvent = visibleLaunchEvents.some((item) => getEventIdentity(item) === selectedRecentId || item.name === selectedRecentId)
    if (!hasSelectedEvent) {
      setSelectedRecentId(firstLaunchEvent.id || firstLaunchEvent.name)
    }
  }, [selectedRecentId, visibleLaunchEvents])

  useEffect(() => {
    if (typeof window === 'undefined' || !storageHydratedRef.current) return
    try {
      window.localStorage.setItem(eventGalleryStorageKey, JSON.stringify(eventGalleries))
    } catch {
      try {
        const compactGalleries = Object.fromEntries(
          Object.entries(eventGalleries).map(([key, gallery]) => [
            key,
            {
              ...gallery,
              items: (gallery.items || []).slice(0, 4),
            },
          ]),
        )
        window.localStorage.setItem(eventGalleryStorageKey, JSON.stringify(compactGalleries))
        setEventGalleries(compactGalleries)
      } catch {
        // Ignore gallery persistence failures when storage is full.
      }
    }
  }, [eventGalleries])

  useEffect(() => {
    if (typeof window === 'undefined' || !storageHydratedRef.current) return undefined
    if (cloudStateSaveTimerRef.current) window.clearTimeout(cloudStateSaveTimerRef.current)
    cloudStateSaveTimerRef.current = window.setTimeout(() => {
      void saveServerAppState({
        recentEvents,
        deletedEventIds,
        eventGalleries,
      })
    }, 900)
    return () => {
      if (cloudStateSaveTimerRef.current) window.clearTimeout(cloudStateSaveTimerRef.current)
    }
  }, [recentEvents, deletedEventIds, eventGalleries])

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
      const snapThreshold = 1.2
      const getSnapPosition = (box, targets) => {
        const guides = { x: [], y: [] }
        let nextX = box.x
        let nextY = box.y
        const probesX = [
          { value: box.x, offset: 0 },
          { value: box.x + box.width / 2, offset: box.width / 2 },
          { value: box.x + box.width, offset: box.width },
        ]
        const probesY = [
          { value: box.y, offset: 0 },
          { value: box.y + box.height / 2, offset: box.height / 2 },
          { value: box.y + box.height, offset: box.height },
        ]

        targets.x.some((target) => {
          const match = probesX.find((probe) => Math.abs(probe.value - target) <= snapThreshold)
          if (!match) return false
          nextX = clampNumber(target - match.offset, 0, 100 - box.width)
          guides.x = [target]
          return true
        })
        targets.y.some((target) => {
          const match = probesY.find((probe) => Math.abs(probe.value - target) <= snapThreshold)
          if (!match) return false
          nextY = clampNumber(target - match.offset, 0, 100 - box.height)
          guides.y = [target]
          return true
        })

        return { x: nextX, y: nextY, guides }
      }
      const getAlignmentTargets = (activeBoxKey) => {
        const targets = { x: [0, 50, 100], y: [0, 50, 100] }
        customLayoutSlots.forEach((slot) => {
          const key = `photo-${slot.photoNumber}`
          if (key === activeBoxKey) return
          targets.x.push(slot.x, slot.x + slot.width / 2, slot.x + slot.width)
          targets.y.push(slot.y, slot.y + slot.height / 2, slot.y + slot.height)
        })
        Object.entries(customTextLayers).forEach(([textId, layer]) => {
          const key = `text-${textId}`
          if (key === activeBoxKey) return
          const height = Math.max(4, layer.size / 2)
          targets.x.push(layer.x, layer.x + layer.width / 2, layer.x + layer.width)
          targets.y.push(layer.y, layer.y + height / 2, layer.y + height)
        })
        return targets
      }

      if (active.kind === 'text') {
        setCustomTextLayers((current) => {
          const layer = current[active.textId] || active.layer
          const height = Math.max(4, active.layer.size / 2)
          const rawBox = {
            x: clampNumber(active.layer.x + deltaX, 0, 100 - active.layer.width),
            y: clampNumber(active.layer.y + deltaY, 0, 96),
            width: active.layer.width,
            height,
          }
          const snapped = getSnapPosition(rawBox, getAlignmentTargets(`text-${active.textId}`))
          setCustomAlignmentGuides(snapped.guides)
          return {
            ...current,
            [active.textId]: {
              ...layer,
              x: snapped.x,
              y: snapped.y,
            },
          }
        })
        return
      }

      setCustomPhotoLayout((current) =>
        normalizeCustomPhotoLayout(current, customPhotoCount).map((slot) => {
          if (active.mode === 'resize') {
            const groupSlots = active.slots?.length ? active.slots : [active.slot]
            const minDeltaWidth = Math.max(...groupSlots.map((item) => 18 - item.width))
            const maxDeltaWidth = Math.min(...groupSlots.map((item) => 100 - item.x - item.width))
            const minDeltaHeight = Math.max(...groupSlots.map((item) => 7 - item.height))
            const maxDeltaHeight = Math.min(...groupSlots.map((item) => 100 - item.y - item.height))
            const nextDeltaWidth = clampNumber(deltaX, minDeltaWidth, maxDeltaWidth)
            const nextDeltaHeight = clampNumber(deltaY, minDeltaHeight, maxDeltaHeight)
            setCustomAlignmentGuides({ x: [], y: [] })
            if (!active.photoNumbers?.includes(slot.photoNumber)) return slot
            const startSlot = groupSlots.find((item) => item.photoNumber === slot.photoNumber) || slot
            return {
              ...slot,
              width: clampNumber(startSlot.width + nextDeltaWidth, 18, 100 - startSlot.x),
              height: clampNumber(startSlot.height + nextDeltaHeight, 7, 100 - startSlot.y),
            }
          }

          const groupSlots = active.slots?.length ? active.slots : [active.slot]
          const minDeltaX = Math.max(...groupSlots.map((item) => -item.x))
          const maxDeltaX = Math.min(...groupSlots.map((item) => 100 - item.x - item.width))
          const minDeltaY = Math.max(...groupSlots.map((item) => -item.y))
          const maxDeltaY = Math.min(...groupSlots.map((item) => 100 - item.y - item.height))
          let nextDeltaX = clampNumber(deltaX, minDeltaX, maxDeltaX)
          let nextDeltaY = clampNumber(deltaY, minDeltaY, maxDeltaY)
          const rawBox = {
            x: clampNumber(active.slot.x + nextDeltaX, 0, 100 - active.slot.width),
            y: clampNumber(active.slot.y + nextDeltaY, 0, 100 - active.slot.height),
            width: active.slot.width,
            height: active.slot.height,
          }
          const snapped = getSnapPosition(rawBox, getAlignmentTargets(`photo-${active.photoNumber}`))
          nextDeltaX = clampNumber(snapped.x - active.slot.x, minDeltaX, maxDeltaX)
          nextDeltaY = clampNumber(snapped.y - active.slot.y, minDeltaY, maxDeltaY)
          setCustomAlignmentGuides(snapped.guides)
          if (!active.photoNumbers?.includes(slot.photoNumber)) return slot
          const startSlot = groupSlots.find((item) => item.photoNumber === slot.photoNumber) || slot
          return {
            ...slot,
            x: clampNumber(startSlot.x + nextDeltaX, 0, 100 - startSlot.width),
            y: clampNumber(startSlot.y + nextDeltaY, 0, 100 - startSlot.height),
          }
        }),
      )
    }

    const handlePointerUp = () => {
      customLayoutPointerRef.current = null
      setCustomAlignmentGuides({ x: [], y: [] })
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
    if (videoRef.current) {
      videoRef.current.pause?.()
      videoRef.current.srcObject = null
    }
    streamRef.current = null
    setCameraStream(null)
  }

  const waitForVideoReady = async (stream, timeoutMs = 3200) => {
    const startedAt = Date.now()
    while (Date.now() - startedAt < timeoutMs) {
      const video = videoRef.current
      const liveTrack = stream.getVideoTracks?.().some((track) => track.readyState === 'live')
      if (!liveTrack) throw new Error('La cámara se detuvo antes de iniciar.')

      if (video) {
        if (video.srcObject !== stream) video.srcObject = stream
        await video.play?.().catch(() => undefined)
        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) return true
      }
      await wait(120)
    }
    return Boolean(stream.getVideoTracks?.().some((track) => track.readyState === 'live'))
  }

  const getCameraAttemptConstraints = () => [
    {
      video: {
        facingMode: { ideal: 'user' },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30, max: 30 },
      },
      audio: false,
    },
    {
      video: {
        facingMode: { ideal: 'user' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    },
    {
      video: true,
      audio: false,
    },
  ]

  const checkCameraEnvironment = async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('Este navegador no permite abrir la cámara.')
    }

    if (navigator.permissions?.query) {
      try {
        const permission = await navigator.permissions.query({ name: 'camera' })
        if (permission?.state === 'denied') {
          throw new Error('El navegador tiene bloqueado el permiso de cámara.')
        }
      } catch (error) {
        if (/bloqueado|permiso/i.test(error?.message || '')) throw error
      }
    }

    if (navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoInputs = devices.filter((device) => device.kind === 'videoinput')
        if (devices.length && !videoInputs.length) {
          throw new Error('No encontré una cámara conectada en este dispositivo.')
        }
      } catch (error) {
        if (/No encontré/i.test(error?.message || '')) throw error
      }
    }
  }

  const openCamera = async ({ force = true, reason = 'Abriendo cámara del espejo mágico...' } = {}) => {
    if (cameraOpening && !force) return streamRef.current
    const requestId = cameraOpenRequestRef.current + 1
    cameraOpenRequestRef.current = requestId
    setCameraError('')
    setCameraOpening(true)
    setCaptureStatus(reason)

    try {
      await checkCameraEnvironment()

      stopCamera()
      await wait(180)

      let stream = null
      let lastError = null
      const attempts = getCameraAttemptConstraints()
      for (let index = 0; index < attempts.length; index += 1) {
        if (requestId !== cameraOpenRequestRef.current) return null
        try {
          setCaptureStatus(index === 0 ? 'Verificando cámara del espejo mágico...' : 'Reintentando cámara con configuración compatible...')
          stream = await navigator.mediaDevices.getUserMedia(attempts[index])
          await waitForVideoReady(stream)
          break
        } catch (error) {
          lastError = error
          stream?.getTracks?.().forEach((track) => track.stop())
          stream = null
          await wait(180)
        }
      }

      if (!stream) throw lastError || new Error('No se pudo abrir la cámara.')
      if (requestId !== cameraOpenRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return null
      }

      streamRef.current = stream
      setCameraStream(stream)
      setCaptureStatus('Cámara verificada. Ubica a la persona frente al espejo.')
      return stream
    } catch (error) {
      const readableError =
        error?.name === 'NotFoundError' || /requested device not found|No encontré/i.test(error?.message || '')
          ? 'No encontré una cámara conectada en este dispositivo.'
          : error?.name === 'NotAllowedError' || /bloqueado|permiso/i.test(error?.message || '')
            ? 'El navegador no tiene permiso para usar la cámara.'
            : error?.name === 'NotReadableError'
              ? 'La cámara está ocupada por otra app. Cierra la otra cámara y vuelve a intentar.'
            : 'No se pudo abrir la cámara.'
      setCameraError(readableError)
      setCaptureStatus('No se pudo abrir la cámara. Revisa permisos del navegador.')
      return null
    } finally {
      if (requestId === cameraOpenRequestRef.current) setCameraOpening(false)
    }
  }

  const ensureCameraReady = async (reason = 'Verificando cámara antes de tomar foto...') => {
    const stream = streamRef.current
    const liveTrack = stream?.getVideoTracks?.().some((track) => track.readyState === 'live')
    const videoReady = videoRef.current?.readyState >= 2 && videoRef.current?.videoWidth > 0 && videoRef.current?.videoHeight > 0
    if (stream && liveTrack && videoReady) return stream

    setCaptureStatus(reason)
    return openCamera({ force: true, reason })
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

  const drawContain = (context, image, x, y, widthValue, heightValue) => {
    const scale = Math.min(widthValue / image.width, heightValue / image.height)
    const drawWidth = image.width * scale
    const drawHeight = image.height * scale
    const drawX = x + (widthValue - drawWidth) / 2
    const drawY = y + (heightValue - drawHeight) / 2
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight)
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

  const renderLiveCaptureFrameOverlay = () => {
    const activeIndex = retakeFrameIndex === null
      ? Math.min(framesReady, selectedShotCount - 1)
      : Math.min(retakeFrameIndex, selectedShotCount - 1)
    const activePhotoNumber = selectedType.id === 'personalizar-5x15'
      ? customPhotoSequence[activeIndex] || activeIndex + 1
      : activeIndex + 1
    const frameSource = overlayImageUrl ? { uri: overlayImageUrl } : selectedTemplate.image

    return (
      <View style={styles.liveFrameOverlayLayer} pointerEvents="none">
        <View style={styles.liveFrameOverlaySurface}>
          <Image
            source={frameSource}
            style={styles.liveFrameOverlayImage}
            accessibilityLabel={`Marco activo ${selectedTemplate.name}`}
          />
          <View style={styles.liveFrameOverlaySoftWash} />
          <View style={styles.liveFrameCurrentBadge}>
            <Text style={styles.liveFrameCurrentBadgeText}>Foto {activePhotoNumber}</Text>
          </View>
        </View>
      </View>
    )
  }

  const getPreviewRetakeSlots = () => {
    if (selectedType.id === 'personalizar-5x15') {
      const canvasWidth = selectedType.width
      const canvasHeight = selectedType.height
      const pagePad = canvasWidth * 0.035
      const stripHeight = canvasHeight - pagePad * 2
      const gutter = customMirrorMode ? canvasWidth * 0.018 : 0
      const stripWidth = customMirrorMode
        ? (canvasWidth - pagePad * 2 - gutter) / 2
        : canvasWidth - pagePad * 2
      const strips = customMirrorMode ? [pagePad, pagePad + stripWidth + gutter] : [pagePad]

      return strips.flatMap((stripX) =>
        customPhotoSequence.map((photoNumber) => {
          const slot = customLayoutSlots.find((item) => item.photoNumber === photoNumber)
            || createDefaultCustomPhotoLayout(customPhotoCount)[photoNumber - 1]
          return {
            photoNumber,
            index: photoNumber - 1,
            x: ((stripX + (slot.x / 100) * stripWidth) / canvasWidth) * 100,
            y: ((pagePad + (slot.y / 100) * stripHeight) / canvasHeight) * 100,
            width: (((slot.width / 100) * stripWidth) / canvasWidth) * 100,
            height: (((slot.height / 100) * stripHeight) / canvasHeight) * 100,
          }
        }),
      )
    }

    return getSlots(selectedType, selectedType.width, selectedType.height).map((slot, index) => ({
      photoNumber: index + 1,
      index,
      x: (slot.x / selectedType.width) * 100,
      y: (slot.y / selectedType.height) * 100,
      width: (slot.width / selectedType.width) * 100,
      height: (slot.height / selectedType.height) * 100,
    }))
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

  const formatDateFromISO = (value) => {
    if (!value) return ''
    const [year, month, day] = value.split('-').map(Number)
    if (!year || !month || !day) return ''
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${String(day).padStart(2, '0')}-${months[month - 1]}-${year}`
  }

  const dateTextToISO = (value) => {
    if (!value) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const match = value.trim().toLowerCase().match(/^(\d{1,2})-([a-záéíóú]{3})-(\d{4})$/)
    if (!match) return ''
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    const monthIndex = months.indexOf(match[2])
    if (monthIndex < 0) return ''
    return `${match[3]}-${String(monthIndex + 1).padStart(2, '0')}-${String(Number(match[1])).padStart(2, '0')}`
  }

  const updatePhotoDateFromISO = (value, status = 'Fecha de la foto actualizada.') => {
    setPhotoDateText(formatDateFromISO(value))
    setCaptureStatus(status)
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

  const drawCustom5x15Strip = (context, frameImages, x, y, widthValue, heightValue, templateImage = null) => {
    const orderedImages = customPhotoSequence.map((photoNumber) => frameImages[photoNumber - 1]).filter(Boolean)
    const layoutByPhoto = new Map(customLayoutSlots.map((slot) => [slot.photoNumber, slot]))
    const basePhotoSlots = customPhotoSequence.map((photoNumber) => {
      const slot = layoutByPhoto.get(photoNumber) || createDefaultCustomPhotoLayout(customPhotoCount)[photoNumber - 1]
      return {
        photoNumber,
        x: x + (slot.x / 100) * widthValue,
        y: y + (slot.y / 100) * heightValue,
        width: (slot.width / 100) * widthValue,
        height: (slot.height / 100) * heightValue,
      }
    })
    const photoSlots = basePhotoSlots

    context.save()
    context.fillStyle = '#fffdf8'
    context.fillRect(x, y, widthValue, heightValue)
    if (templateImage) {
      context.save()
      context.globalAlpha = overlayImageUrl ? 0.94 : 1
      drawCover(context, templateImage, x, y, widthValue, heightValue)
      context.restore()
    } else {
      drawCustom5x15Decor(context, x, y, widthValue, heightValue)
    }

    context.strokeStyle = 'rgba(17, 24, 39, 0.14)'
    context.setLineDash([5, 8])
    context.lineWidth = Math.max(2, widthValue * 0.002)
    context.strokeRect(x + 2, y + 2, widthValue - 4, heightValue - 4)
    context.setLineDash([])

    const drawCustomCanvasTextLayer = (textId, value) => {
      if (!value) return
      const layer = customTextLayers[textId] || defaultCustomTextLayers[textId]
      const fontSize = Math.round(widthValue * (layer.size / 520))
      const centerX = x + ((layer.x + layer.width / 2) / 100) * widthValue
      const centerY = y + (layer.y / 100) * heightValue
      context.save()
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = layer.color
      const fontFamily = layer.font?.includes(' ') ? `"${layer.font}"` : layer.font || 'Arial'
      context.font = `900 ${fontSize}px ${fontFamily}, "Helvetica Neue", sans-serif`
      context.shadowColor = 'rgba(255,255,255,0.78)'
      context.shadowBlur = Math.max(8, widthValue * 0.012)
      const text = String(value)
      const words = text.split(/\s+/)
      const maxWidth = (layer.width / 100) * widthValue
      const lines = ['']
      words.forEach((word) => {
        const current = lines[lines.length - 1]
        const next = current ? `${current} ${word}` : word
        if (context.measureText(next).width > maxWidth && current && lines.length < 3) {
          lines.push(word)
        } else {
          lines[lines.length - 1] = next
        }
      })
      const lineHeight = fontSize * 1.12
      const startY = centerY - ((lines.length - 1) * lineHeight) / 2
      lines.forEach((line, index) => {
        context.fillText(line, centerX, startY + index * lineHeight)
      })
      context.restore()
    }

    drawCustomCanvasTextLayer('script', photoScriptText.trim() || photoTextPresets[0])

    photoSlots.forEach((slot, index) => {
      const image = frameImages[slot.photoNumber - 1] || orderedImages[index % orderedImages.length] || frameImages[index % frameImages.length]
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

    drawCustomCanvasTextLayer('name', getPhotoNameText())
    drawCustomCanvasTextLayer('event', getPhotoEventText())
    drawCustomCanvasTextLayer('date', getPhotoDateText())
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
      const templateImage = await loadCanvasImage(overlayImageUrl || getTemplateImageUrl()).catch(() => null)
      const pagePad = canvasWidth * 0.035
      const stripHeight = canvasHeight - pagePad * 2
      if (customMirrorMode) {
        const gutter = canvasWidth * 0.018
        const stripWidth = (canvasWidth - pagePad * 2 - gutter) / 2
        drawCustom5x15Strip(context, frameImages, pagePad, pagePad, stripWidth, stripHeight, templateImage)
        drawCustom5x15Strip(context, frameImages, pagePad + stripWidth + gutter, pagePad, stripWidth, stripHeight, templateImage)
        context.strokeStyle = 'rgba(17, 24, 39, 0.18)'
        context.setLineDash([12, 14])
        context.lineWidth = Math.max(3, canvasWidth * 0.002)
        context.beginPath()
        context.moveTo(canvasWidth / 2, pagePad)
        context.lineTo(canvasWidth / 2, canvasHeight - pagePad)
        context.stroke()
        context.setLineDash([])
      } else {
        drawCustom5x15Strip(context, frameImages, pagePad, pagePad, canvasWidth - pagePad * 2, stripHeight, templateImage)
      }
      await drawGifOverlay(context, canvasWidth, canvasHeight)
      return canvas.toDataURL('image/jpeg', qualityMode === 'Superior' ? 0.96 : qualityMode === 'Media' ? 0.84 : 0.92)
    }

    if (isRecuerdo) {
      drawRecuerdoFrame(context, canvasWidth, canvasHeight)
    } else {
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvasWidth, canvasHeight)
    }

    const templateImage = isRecuerdo ? null : await loadCanvasImage(overlayImageUrl || getTemplateImageUrl()).catch(() => null)
    if (templateImage) {
      context.globalAlpha = overlayImageUrl ? 0.92 : 1
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
      if (image) drawContain(context, image, slot.x, slot.y, slot.width, slot.height)
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

    }

    await drawGifOverlay(context, canvasWidth, canvasHeight)
    return canvas.toDataURL('image/jpeg', qualityMode === 'Superior' ? 0.96 : qualityMode === 'Media' ? 0.84 : 0.92)
  }

  const saveFinalPhotoToServer = async (finalPhoto, frames = photoFrames) => {
    if (!finalPhoto || typeof fetch === 'undefined') return null

    setPhotoSaveStatus('Guardando foto en servidor...')
    setSavedPhotoUrl('')
    setSavedPhotoId('')

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    const timeoutId = controller ? setTimeout(() => controller.abort(), 12000) : null

    try {
      const response = await fetch(photoUploadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller?.signal,
        body: JSON.stringify({
          eventId: eventGalleryId,
          operatorId: selectedRecentEvent?.operatorId || activeProfile.id,
          eventName: eventTitle,
          eventType,
          photoType: selectedType.name,
          photoTypeId: selectedType.id,
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          filter: selectedFilter,
          finalPhoto,
          frames,
          createdAt: new Date().toISOString(),
        }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || 'No se pudo guardar la foto.')
      }

      const publicUrl = result.absoluteUrl || result.url || ''
      setSavedPhotoUrl(publicUrl)
      setSavedPhotoId(result.id || '')
      setQrPhotoUrl(publicUrl)
      setPhotoSaveStatus('Foto guardada en servidor.')
      return result
    } catch (error) {
      setPhotoSaveStatus('Foto guardada en este dispositivo. Falta activar el servidor para guardarla en la nube.')
      return null
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }

  const dataUrlToPhotoFile = async (dataUrl) => {
    if (!dataUrl || typeof fetch === 'undefined' || typeof File === 'undefined') return null
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    const cleanName = eventTitle
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'foto-viralco'
    return new File([blob], `${cleanName}.jpg`, { type: blob.type || 'image/jpeg' })
  }

  const shareFinalPhotoFile = async (targetName = 'Compartir') => {
    const file = await dataUrlToPhotoFile(finalPhotoUrl)
    if (file && typeof navigator !== 'undefined' && navigator.share) {
      const sharePayload = {
        title: `${eventTitle} - Viralco`,
        text: '',
        files: [file],
      }
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        await navigator.share(sharePayload)
        setCaptureStatus(`${targetName}: elige la app y envía la imagen.`)
        return true
      }
    }
    return false
  }

  const downloadFinalPhoto = () => {
    if (!finalPhotoUrl || typeof document === 'undefined') return
    const link = document.createElement('a')
    link.href = finalPhotoUrl
    link.download = `${eventTitle.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase() || 'foto-viralco'}.jpg`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const ensurePhotoPublicUrl = async () => {
    if (savedPhotoUrl) {
      setQrPhotoUrl(savedPhotoUrl)
      return savedPhotoUrl
    }
    const result = await saveFinalPhotoToServer(finalPhotoUrl, photoFrames)
    const publicUrl = result?.absoluteUrl || result?.url || ''
    if (publicUrl) setQrPhotoUrl(publicUrl)
    return publicUrl
  }

  const rememberEventPhoto = (photoUrl, serverResult = null) => {
    if (!photoUrl) return
    const publicUrl = serverResult?.absoluteUrl || serverResult?.url || ''
    const item = {
      id: serverResult?.id || `foto-${Date.now()}`,
      eventId: eventGalleryId,
      operatorId: selectedRecentEvent?.operatorId || activeProfile.id,
      eventName: eventTitle,
      photoType: selectedType.name,
      templateName: selectedTemplate.name,
      createdAt: new Date().toISOString(),
      src: publicUrl || photoUrl,
      publicUrl,
      localUrl: photoUrl,
      frames: photoFrames.length,
    }

    setEventGalleries((current) => {
      const gallery = current[eventGalleryId] || { id: eventGalleryId, eventName: eventTitle, operatorId: item.operatorId, items: [] }
      const withoutDuplicate = (gallery.items || []).filter((photo) => photo.id !== item.id && photo.src !== item.src)
      return {
        ...current,
        [eventGalleryId]: {
          ...gallery,
          eventName: eventTitle,
          operatorId: item.operatorId,
          updatedAt: item.createdAt,
          items: [item, ...withoutDuplicate].slice(0, 60),
        },
      }
    })
  }

  const runCountdownAndCapture = async () => {
    if (countdownRef.current || cameraOpening) return
    const replacingIndex = Number.isInteger(retakeFrameIndex) ? retakeFrameIndex : null

    if (!eventReady) {
      setEventNameError('Escribe el nombre del evento para continuar.')
      setShowCreateEventModal(true)
      setCaptureStatus('Primero escribe el nombre del evento.')
      return
    }

    setCaptureStatus('Verificando cámara antes del conteo...')
    const openedStream = await ensureCameraReady('Verificando cámara antes del conteo...')
    if (!openedStream) {
      countdownRef.current = null
      return
    }

    if (videoRef.current && (!videoRef.current.videoWidth || !videoRef.current.videoHeight)) {
      await wait(450)
      if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
        countdownRef.current = null
        setCaptureStatus('La cámara abrió pero aún no muestra imagen. Oprime otra vez para reiniciarla.')
        await openCamera({ force: true, reason: 'Reiniciando cámara sin imagen...' })
        return
      }
    }
    await wait(300)

    setCaptureIntroActive(false)
    const countdownSeconds = replacingIndex === null && framesReady > 0 ? photoCountdownNext : photoCountdownFirst

    countdownRef.current = { active: true }
    setAnimationOverlay({
      mode: captureAnimation,
      title: 'SONRÍE',
      text: replacingIndex === null
        ? (framesReady ? `Prepárate para la foto ${framesReady + 1}` : 'La foto empieza en segundos')
        : `Prepárate para repetir foto ${replacingIndex + 1}`,
      stage: 'beforeCountdown',
      videoUrl: getAnimationStageVideoUrl('beforeCountdown'),
    })
    setCaptureStatus(replacingIndex === null ? 'Mostrando animación antes de la foto...' : `Preparando reemplazo de foto ${replacingIndex + 1}...`)
    await wait(flashBeforePhoto ? 3400 : 2800)

    if (!countdownRef.current?.active) return
    setAnimationOverlay(null)
    await wait(250)

    if (!countdownRef.current?.active) return

    for (let seconds = countdownSeconds; seconds > 0; seconds -= 1) {
      setCountdown(String(seconds))
      setCaptureStatus(`Preparando foto en ${seconds}...`)
      await wait(1000)
    }

    setCountdown('')

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
        title: 'FOTO REEMPLAZADA',
        text: `Actualizando foto ${replacingIndex + 1}`,
        stage: 'processing',
        videoUrl: getAnimationStageVideoUrl('processing'),
      })
      setCaptureStatus(`Foto ${replacingIndex + 1} reemplazada. Armando resultado final...`)
      try {
        const output = await composeFinalPhoto(nextFrames)
        setFinalPhotoUrl(output)
        const savedResult = await saveFinalPhotoToServer(output, nextFrames)
        rememberEventPhoto(output, savedResult)
        setCaptureStatus(`Foto ${replacingIndex + 1} actualizada en el resultado final.`)
        setShowCapturePhotoScreen(false)
        setShowPreviewScreen(true)
        setShowShareScreen(false)
        updateAppRoute('preview')
      } catch {
        setCaptureStatus('No se pudo armar el resultado final. Intenta repetir la foto.')
        setCaptureIntroActive(true)
      } finally {
        setRetakeFrameIndex(null)
        setAnimationOverlay(null)
        setCountdown('')
        countdownRef.current = null
      }
      return
    }

    if (nextFrames.length < selectedShotCount) {
      setAnimationOverlay({
        mode: captureAnimation,
        title: 'FOTO GUARDADA',
        text: `Prepárate para la siguiente foto`,
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
      title: 'LISTO',
      text: 'Armando recuerdo final',
      stage: 'processing',
      videoUrl: getAnimationStageVideoUrl('processing'),
    })
    setCaptureStatus('Armando foto final...')
    try {
      const output = await composeFinalPhoto(nextFrames)
      setFinalPhotoUrl(output)
      const savedResult = await saveFinalPhotoToServer(output, nextFrames)
      rememberEventPhoto(output, savedResult)
      setCaptureStatus(`${selectedType.name} listo para compartir o imprimir.`)
      setShowCapturePhotoScreen(false)
      setShowPreviewScreen(true)
      setShowShareScreen(false)
      updateAppRoute('preview')
    } catch {
      setCaptureStatus('No se pudo armar el resultado final. Intenta tomar la foto otra vez.')
      setCaptureIntroActive(true)
    } finally {
      setAnimationOverlay(null)
      setCountdown('')
      countdownRef.current = null
    }
  }

  const resetPhoto = () => {
    setPhotoFrames([])
    setFinalPhotoUrl('')
    clearSavedPhoto()
    setRetakeFrameIndex(null)
    setCountdown('')
    setCaptureIntroActive(true)
    setCaptureStatus(`${selectedType.name}: listo para tomar fotos`)
  }

  const chooseType = (type) => {
    setSelectedType(type)
    setPhotoFrames([])
    setFinalPhotoUrl('')
    clearSavedPhoto()
    setRetakeFrameIndex(null)
    setAnimationVideoPromptAnswered(false)
    setAnimationVideoQuestionMode('question')
    if (type.id === 'personalizar-5x15') {
      setShowCustomPhotoLayoutScreen(true)
      updateAppRoute('personalizar')
      setCustomPhotoOrder((current) => normalizeCustomPhotoOrder(current, customPhotoCount))
      setCustomPhotoLayout((current) => normalizeCustomPhotoLayout(current, customPhotoCount))
      setSelectedCustomLayoutPhoto(1)
      setSelectedCustomLayoutPhotos(customPhotoCount ? [1] : [])
      setMultiCustomLayoutSelect(false)
      setCaptureStatus(customPhotoCount ? `${type.name}: ${customPhotoCount} recuadro${customPhotoCount === 1 ? '' : 's'} manual${customPhotoCount === 1 ? '' : 'es'}.` : 'Personalizar: agrega fotos manualmente sobre el fondo.')
      return
    }
    setShowCustomPhotoLayoutScreen(false)
    setCaptureStatus(`${type.name}: toma ${type.shots} foto${type.shots === 1 ? '' : 's'}`)
  }

  const getSelectedTypeLayoutSlots = () => {
    if (selectedType.id === 'personalizar-5x15') {
      return customPhotoSequence.map((photoNumber) => (
        customLayoutSlots.find((slot) => slot.photoNumber === photoNumber)
        || createDefaultCustomPhotoLayout(customPhotoCount)[photoNumber - 1]
      )).filter(Boolean)
    }

    return getSlots(selectedType, selectedType.width, selectedType.height).map((slot, index) => ({
      photoNumber: index + 1,
      x: (slot.x / selectedType.width) * 100,
      y: (slot.y / selectedType.height) * 100,
      width: (slot.width / selectedType.width) * 100,
      height: (slot.height / selectedType.height) * 100,
    }))
  }

  const openSelectedTypeLayoutEditor = () => {
    const nextCount = selectedType.id === 'personalizar-5x15'
      ? Math.max(customPhotoCount, customLayoutSlots.length)
      : selectedType.shots
    const nextSlots = selectedType.id === 'personalizar-5x15'
      ? customLayoutSlots
      : getSelectedTypeLayoutSlots()
    const customType = photoTypes.find((item) => item.id === 'personalizar-5x15') || selectedType

    setSelectedType(customType)
    setCustomPhotoCount(nextCount)
    setCustomPhotoOrder(normalizeCustomPhotoOrder([], nextCount))
    setCustomPhotoLayout(normalizeCustomPhotoLayout(nextSlots, nextCount))
    setSelectedCustomLayoutPhoto(1)
    setSelectedCustomLayoutPhotos(nextCount ? [1] : [])
    setMultiCustomLayoutSelect(false)
    setPhotoFrames([])
    setFinalPhotoUrl('')
    clearSavedPhoto()
    setRetakeFrameIndex(null)
    setShowCustomPhotoLayoutScreen(true)
    updateAppRoute('personalizar')
    setCaptureStatus(`Layout editable creado con ${nextCount} foto${nextCount === 1 ? '' : 's'}.`)
  }

  const updateCustomPhotoCount = (nextCount) => {
    const boundedCount = Math.min(Math.max(Math.round(Number(nextCount) || 0), 0), customPhotoMaxSlots)
    setCustomPhotoCount(boundedCount)
    setCustomPhotoOrder((current) => normalizeCustomPhotoOrder(current, boundedCount))
    setCustomPhotoLayout((current) => normalizeCustomPhotoLayout(current, boundedCount))
    setSelectedCustomLayoutPhoto((current) => {
      const nextSelected = Math.min(current, Math.max(boundedCount, 1))
      setSelectedCustomLayoutPhotos(boundedCount ? [nextSelected] : [])
      return nextSelected
    })
    setMultiCustomLayoutSelect(false)
    setPhotoFrames([])
    setFinalPhotoUrl('')
    clearSavedPhoto()
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
    setSelectedCustomLayoutPhotos([nextPhotoNumber])
    setPhotoFrames([])
    setFinalPhotoUrl('')
    clearSavedPhoto()
    setRetakeFrameIndex(null)
    setCaptureStatus(`Recuadro ${nextPhotoNumber} agregado. Muévelo y agrándalo manualmente.`)
  }

  const selectCustomLayoutPhoto = (photoNumber, additive = multiCustomLayoutSelect) => {
    setSelectedCustomLayoutPhoto(photoNumber)
    setSelectedCustomLayoutPhotos((current) => {
      if (!additive) return [photoNumber]
      if (current.includes(photoNumber)) {
        const next = current.filter((item) => item !== photoNumber)
        return next.length ? next : [photoNumber]
      }
      return [...current, photoNumber].sort((a, b) => a - b)
    })
  }

  const duplicateCustomLayoutPhoto = () => {
    const selectedSlots = customLayoutSlots.filter((item) => selectedCustomLayoutPhotos.includes(item.photoNumber))
    const sourceSlots = selectedSlots.length > 1 ? selectedSlots : [customLayoutSlots.find((item) => item.photoNumber === selectedCustomLayoutPhoto) || customLayoutSlots[customLayoutSlots.length - 1]].filter(Boolean)
    if (!sourceSlots.length) {
      addCustomLayoutPhoto()
      return
    }
    const available = customPhotoMaxSlots - customLayoutSlots.length
    const slotsToCopy = sourceSlots.slice(0, available)
    if (!slotsToCopy.length) {
      setCaptureStatus(`Máximo ${customPhotoMaxSlots} recuadros por diseño.`)
      return
    }
    const nextSlots = [...customLayoutSlots]
    slotsToCopy.forEach((sourceSlot, index) => {
      const nextPhotoNumber = nextSlots.length + 1
      nextSlots.push(createManualCustomPhotoSlot(nextPhotoNumber, nextSlots.length, {
        ...sourceSlot,
        x: clampNumber(sourceSlot.x + 4 + index * 2, 0, 100 - sourceSlot.width),
        y: clampNumber(sourceSlot.y + 4 + index * 2, 0, 100 - sourceSlot.height),
      }))
    })
    const normalizedSlots = normalizeCustomPhotoLayout(nextSlots, nextSlots.length)
    const duplicatedNumbers = normalizedSlots.slice(-slotsToCopy.length).map((slot) => slot.photoNumber)
    setCustomPhotoCount(normalizedSlots.length)
    setCustomPhotoOrder(normalizeCustomPhotoOrder([], normalizedSlots.length))
    setCustomPhotoLayout(normalizedSlots)
    setSelectedCustomLayoutPhoto(duplicatedNumbers[0] || 1)
    setSelectedCustomLayoutPhotos(duplicatedNumbers)
    setPhotoFrames([])
    setFinalPhotoUrl('')
    clearSavedPhoto()
    setRetakeFrameIndex(null)
    setCaptureStatus(`${duplicatedNumbers.length} recuadro${duplicatedNumbers.length === 1 ? '' : 's'} duplicado${duplicatedNumbers.length === 1 ? '' : 's'}.`)
  }

  const deleteCustomLayoutPhoto = () => {
    if (!customLayoutSlots.length) return
    const numbersToDelete = selectedCustomLayoutPhotos.length ? selectedCustomLayoutPhotos : [selectedCustomLayoutPhoto]
    const nextSlots = customLayoutSlots
      .filter((slot) => !numbersToDelete.includes(slot.photoNumber))
      .map((slot, index) => ({ ...slot, photoNumber: index + 1 }))
    setCustomPhotoCount(nextSlots.length)
    setCustomPhotoOrder(normalizeCustomPhotoOrder([], nextSlots.length))
    setCustomPhotoLayout(normalizeCustomPhotoLayout(nextSlots, nextSlots.length))
    const nextSelected = Math.min(selectedCustomLayoutPhoto, Math.max(nextSlots.length, 1))
    setSelectedCustomLayoutPhoto(nextSelected)
    setSelectedCustomLayoutPhotos(nextSlots.length ? [nextSelected] : [])
    setPhotoFrames([])
    setFinalPhotoUrl('')
    clearSavedPhoto()
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
    const activePhotoNumbers = selectedCustomLayoutPhotos.includes(photoNumber)
      ? selectedCustomLayoutPhotos.filter((item) => customLayoutSlots.some((slotItem) => slotItem.photoNumber === item))
      : [photoNumber]
    const activeSlots = customLayoutSlots.filter((slotItem) => activePhotoNumbers.includes(slotItem.photoNumber))

    event?.preventDefault?.()
    event?.stopPropagation?.()
    nativeEvent.preventDefault?.()
    nativeEvent.stopPropagation?.()
    if (multiCustomLayoutSelect) {
      setSelectedCustomLayoutPhoto(photoNumber)
      setSelectedCustomLayoutPhotos((current) => current.includes(photoNumber) ? current : [...current, photoNumber].sort((a, b) => a - b))
    } else {
      setSelectedCustomLayoutPhoto(photoNumber)
      setSelectedCustomLayoutPhotos([photoNumber])
    }
    customLayoutPointerRef.current = {
      mode,
      photoNumber,
      photoNumbers: activePhotoNumbers,
      rect,
      slot,
      slots: activeSlots,
      startX,
      startY,
    }
  }

  const beginCustomTextPointer = (textId, event) => {
    const nativeEvent = event?.nativeEvent || event
    const touch = nativeEvent?.touches?.[0] || nativeEvent?.changedTouches?.[0]
    const startX = touch?.clientX ?? nativeEvent?.clientX ?? nativeEvent?.pageX
    const startY = touch?.clientY ?? nativeEvent?.clientY ?? nativeEvent?.pageY
    const rect = customEditorStripRef.current?.getBoundingClientRect?.()
    const layer = customTextLayers[textId]
    if (!rect || !layer || !Number.isFinite(startX) || !Number.isFinite(startY)) return

    event?.preventDefault?.()
    event?.stopPropagation?.()
    nativeEvent.preventDefault?.()
    nativeEvent.stopPropagation?.()
    setSelectedCustomTextLayer(textId)
    customLayoutPointerRef.current = {
      kind: 'text',
      textId,
      rect,
      layer,
      startX,
      startY,
    }
  }

  const updateCustomTextLayer = (textId, patch) => {
    setSelectedCustomTextLayer(textId)
    setCustomTextLayers((current) => ({
      ...current,
      [textId]: {
        ...(current[textId] || defaultCustomTextLayers[textId]),
        ...patch,
      },
    }))
    setPhotoFrames([])
    setFinalPhotoUrl('')
    clearSavedPhoto()
  }

  const nudgeCustomTextLayer = (textId, axis, amount) => {
    const layer = customTextLayers[textId] || defaultCustomTextLayers[textId]
    updateCustomTextLayer(textId, {
      [axis]: axis === 'x'
        ? clampNumber(layer.x + amount, 0, 100 - layer.width)
        : clampNumber(layer.y + amount, 0, 96),
    })
  }

  const cycleCustomTextFont = (textId) => {
    const layer = customTextLayers[textId] || defaultCustomTextLayers[textId]
    const fonts = customFontChoices.length ? customFontChoices : customTextFonts
    const nextFont = fonts[(fonts.indexOf(layer.font) + 1) % fonts.length]
    updateCustomTextLayer(textId, { font: nextFont })
    setCaptureStatus(`Fuente de texto cambiada a ${nextFont}.`)
  }

  const chooseCustomTextFont = (textId, font) => {
    updateCustomTextLayer(textId, { font })
    setShowCustomTextFontMenu(false)
    setCaptureStatus(`Fuente de texto cambiada a ${font}.`)
  }

  const handleCustomFontFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const cleanName = file.name
      .replace(/\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 34) || 'Fuente personalizada'
    const family = `Viralco-${cleanName}-${Date.now().toString(36)}`
    const reader = new FileReader()
    reader.onload = async () => {
      const source = String(reader.result || '')
      try {
        if (typeof FontFace !== 'undefined') {
          const fontFace = new FontFace(family, `url(${source})`)
          const loadedFace = await fontFace.load()
          document.fonts?.add?.(loadedFace)
        }
        setUploadedCustomFonts((current) => [...current, { family, name: cleanName, source }].slice(-8))
        chooseCustomTextFont(selectedCustomTextLayer, family)
        setCaptureStatus(`Fuente ${cleanName} cargada.`)
      } catch {
        setCaptureStatus('No se pudo cargar esa fuente. Intenta con TTF, OTF, WOFF o WOFF2.')
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const cycleCustomTextColor = (textId) => {
    const layer = customTextLayers[textId] || defaultCustomTextLayers[textId]
    const nextColor = customTextColors[(customTextColors.indexOf(layer.color) + 1) % customTextColors.length]
    updateCustomTextLayer(textId, { color: nextColor })
    setCaptureStatus('Color de texto actualizado.')
  }

  const chooseCustomTextColor = (textId, color) => {
    updateCustomTextLayer(textId, { color })
    setCaptureStatus('Color de texto actualizado.')
  }

  const nudgeCustomLayoutPhoto = (photoNumber, axis, amount) => {
    if (!customLayoutSlots.length) return
    setSelectedCustomLayoutPhoto(photoNumber)
    const selectedNumbers = selectedCustomLayoutPhotos.length && selectedCustomLayoutPhotos.includes(photoNumber)
      ? selectedCustomLayoutPhotos
      : [photoNumber]
    const selectedSlots = customLayoutSlots.filter((slot) => selectedNumbers.includes(slot.photoNumber))
    const clampGroupAmount = () => {
      if (axis === 'x') {
        const minAmount = Math.max(...selectedSlots.map((slot) => -slot.x))
        const maxAmount = Math.min(...selectedSlots.map((slot) => 100 - slot.x - slot.width))
        return clampNumber(amount, minAmount, maxAmount)
      }
      if (axis === 'y') {
        const minAmount = Math.max(...selectedSlots.map((slot) => -slot.y))
        const maxAmount = Math.min(...selectedSlots.map((slot) => 100 - slot.y - slot.height))
        return clampNumber(amount, minAmount, maxAmount)
      }
      return amount
    }
    const nextAmount = clampGroupAmount()
    setCustomPhotoLayout((current) =>
      normalizeCustomPhotoLayout(current, customPhotoCount).map((slot) => {
        if (axis === 'x' && selectedNumbers.includes(slot.photoNumber)) return { ...slot, x: clampNumber(slot.x + nextAmount, 0, 100 - slot.width) }
        if (axis === 'y' && selectedNumbers.includes(slot.photoNumber)) return { ...slot, y: clampNumber(slot.y + nextAmount, 0, 100 - slot.height) }
        if (axis === 'width' && selectedNumbers.includes(slot.photoNumber)) return { ...slot, width: clampNumber(slot.width + amount, 18, 100 - slot.x) }
        if (axis === 'height' && selectedNumbers.includes(slot.photoNumber)) return { ...slot, height: clampNumber(slot.height + amount, 7, 100 - slot.y) }
        return slot
      }),
    )
    setPhotoFrames([])
    setFinalPhotoUrl('')
    clearSavedPhoto()
    setRetakeFrameIndex(null)
  }

  const resetCustomPhotoLayout = () => {
    setCustomPhotoCount(0)
    setCustomPhotoOrder([])
    setCustomPhotoLayout([])
    setSelectedCustomLayoutPhoto(1)
    setSelectedCustomLayoutPhotos([])
    setMultiCustomLayoutSelect(false)
    setPhotoFrames([])
    setFinalPhotoUrl('')
    clearSavedPhoto()
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
      setPhotoReviewSeconds(5)
      setQualityMode('Media')
      setFlashBeforePhoto(false)
    }
    if (preset === 'Rápido') {
      setPhotoCountdownFirst(3)
      setPhotoCountdownNext(2)
      setPhotoReviewSeconds(3)
      setQualityMode('Alta')
      setFlashBeforePhoto(true)
    }
    if (preset === 'Fiesta') {
      setPhotoCountdownFirst(5)
      setPhotoCountdownNext(4)
      setPhotoReviewSeconds(4)
      setQualityMode('Alta')
      setFlashBeforePhoto(true)
    }
    if (preset === 'Evento') {
      setPhotoCountdownFirst(6)
      setPhotoCountdownNext(5)
      setPhotoReviewSeconds(4)
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

  const printGalleryQueue = (photoItems = []) => {
    if (typeof window === 'undefined') return
    const printablePhotos = photoItems
      .map((photo) => ({
        ...photo,
        printSrc: getGalleryPhotoSource(photo),
      }))
      .filter((photo) => photo.printSrc)

    if (!printablePhotos.length) {
      setCaptureStatus('Selecciona una o varias fotos de la galería para imprimir.')
      return
    }

    const existingFrame = window.document.getElementById('viralco-print-frame')
    existingFrame?.remove()

    const printFrame = window.document.createElement('iframe')
    printFrame.id = 'viralco-print-frame'
    printFrame.title = 'Cola de impresión Viralco'
    printFrame.setAttribute('aria-hidden', 'true')
    Object.assign(printFrame.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '1px',
      height: '1px',
      border: '0',
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '-1',
    })
    window.document.body.appendChild(printFrame)

    const printWindow = printFrame.contentWindow
    const printDocument = printWindow?.document
    if (!printWindow || !printDocument) {
      printFrame.remove()
      setCaptureStatus('No se pudo preparar la cola de impresión en esta pestaña.')
      return
    }

    const cleanupPrintFrame = () => {
      setTimeout(() => {
        printFrame.remove()
        setCaptureStatus(`Galería lista después de imprimir o cancelar en papel ${printSizeLabel}.`)
      }, 250)
    }
    printWindow.addEventListener('afterprint', cleanupPrintFrame, { once: true })

    const pageWidthCm = cp1500ShortEdgeCm
    const pageHeightCm = cp1500LongEdgeCm
    const printSafeMarginCm = 0.18
    const printableWidth = `${pageWidthCm}cm`
    const printableHeight = `${pageHeightCm}cm`
    const safePrintWidth = `${pageWidthCm - printSafeMarginCm * 2}cm`
    const safePrintHeight = `${pageHeightCm - printSafeMarginCm * 2}cm`
    const queuedPhotos = printablePhotos.flatMap((photo) => (
      Array.from({ length: normalizedPrintSettings.copies }, () => photo)
    ))
    const imagePages = queuedPhotos.map((photo, index) => (
      `<section class="print-page"><img src="${escapeHtml(photo.printSrc)}" alt="Foto de galería Viralco ${index + 1}" /></section>`
    )).join('')

    printDocument.open()
    printDocument.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(eventTitle)} - Cola Viralco</title>
    <style>
      body { margin: 0; background: #f3f4f6; font-family: Arial, sans-serif; }
      main { min-height: 100vh; display: grid; place-items: center; gap: 24px; padding: 24px; }
      img { max-width: min(92vw, 760px); max-height: 92vh; background: #111827; box-shadow: 0 20px 60px rgba(0,0,0,.18); }
      @page { size: ${pageWidthCm}cm ${pageHeightCm}cm; margin: 0; }
      @media print {
        html, body { width: ${printableWidth}; height: ${printableHeight}; margin: 0; background: #fff; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        main { width: ${printableWidth}; min-height: 0; padding: 0; margin: 0; display: block; }
        .print-page { width: ${printableWidth}; height: ${printableHeight}; padding: ${printSafeMarginCm}cm; margin: 0; box-sizing: border-box; display: grid; place-items: center; break-inside: avoid; page-break-after: always; break-after: page; }
        .print-page:last-child { page-break-after: auto; break-after: auto; }
        img { width: ${safePrintWidth}; height: ${safePrintHeight}; max-width: none; max-height: none; object-fit: contain; object-position: center center; box-shadow: none; display: block; }
      }
    </style>
  </head>
  <body>
    <main>${imagePages}</main>
    <script>
      window.addEventListener('load', () => {
        setTimeout(() => {
          window.focus();
          window.print();
        }, 350);
      });
    </script>
  </body>
</html>`)
    printDocument.close()
    setCaptureStatus(`Cola de impresión lista: ${printablePhotos.length} foto${printablePhotos.length === 1 ? '' : 's'} seleccionada${printablePhotos.length === 1 ? '' : 's'}, ${normalizedPrintSettings.copies} copia${normalizedPrintSettings.copies === 1 ? '' : 's'} cada una.`)
  }

  const executePrint = () => {
    if (!captureComplete || typeof window === 'undefined') return

    const existingFrame = window.document.getElementById('viralco-print-frame')
    existingFrame?.remove()

    const printFrame = window.document.createElement('iframe')
    printFrame.id = 'viralco-print-frame'
    printFrame.title = 'Impresión Viralco'
    printFrame.setAttribute('aria-hidden', 'true')
    Object.assign(printFrame.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '1px',
      height: '1px',
      border: '0',
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '-1',
    })
    window.document.body.appendChild(printFrame)

    const printWindow = printFrame.contentWindow
    const printDocument = printWindow?.document
    if (!printWindow || !printDocument) {
      printFrame.remove()
      setCaptureStatus('No se pudo preparar la impresión en esta pestaña.')
      return
    }

    const cleanupPrintFrame = () => {
      setTimeout(() => {
        printFrame.remove()
        setCaptureStatus(`Vista previa lista después de imprimir o cancelar en papel ${printSizeLabel}.`)
      }, 250)
    }
    printWindow.addEventListener('afterprint', cleanupPrintFrame, { once: true })

    const pageWidthCm = cp1500ShortEdgeCm
    const pageHeightCm = cp1500LongEdgeCm
    const printSafeMarginCm = 0.18
    const printableWidth = `${pageWidthCm}cm`
    const printableHeight = `${pageHeightCm}cm`
    const safePrintWidth = `${pageWidthCm - printSafeMarginCm * 2}cm`
    const safePrintHeight = `${pageHeightCm - printSafeMarginCm * 2}cm`
    const imageCopies = Array.from({ length: normalizedPrintSettings.copies }, (_, index) => (
      `<section class="print-page"><img src="${escapeHtml(finalPhotoUrl)}" alt="Foto Viralco ${index + 1}" /></section>`
    )).join('')
    printDocument.open()
    printDocument.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(eventTitle)} - Viralco</title>
    <style>
      body { margin: 0; background: #f3f4f6; font-family: Arial, sans-serif; }
      main { min-height: 100vh; display: grid; place-items: center; gap: 24px; padding: 24px; }
      img { max-width: min(92vw, 760px); max-height: 92vh; background: #111827; box-shadow: 0 20px 60px rgba(0,0,0,.18); }
      @page { size: ${pageWidthCm}cm ${pageHeightCm}cm; margin: 0; }
	      @media print {
	        html, body { width: ${printableWidth}; height: ${printableHeight}; margin: 0; background: #fff; }
	        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
	        main { width: ${printableWidth}; min-height: 0; padding: 0; margin: 0; display: block; }
	        .print-page { width: ${printableWidth}; height: ${printableHeight}; padding: ${printSafeMarginCm}cm; margin: 0; box-sizing: border-box; display: grid; place-items: center; break-inside: avoid; page-break-after: always; break-after: page; }
	        .print-page:last-child { page-break-after: auto; break-after: auto; }
	        img { width: ${safePrintWidth}; height: ${safePrintHeight}; max-width: none; max-height: none; object-fit: contain; object-position: center center; box-shadow: none; display: block; }
	      }
    </style>
  </head>
  <body>
	    <main>${imageCopies}</main>
	    <script>
	      window.addEventListener('load', () => {
	        setTimeout(() => {
	          window.focus();
	          window.print();
	        }, 350);
	      });
	    </script>
	  </body>
	</html>`)
    printDocument.close()
    setShowPrintOptions(false)
    setCaptureStatus(`Impresión abierta en esta misma pestaña: ${printSizeLabel}, ${normalizedPrintSettings.copies} copia${normalizedPrintSettings.copies === 1 ? '' : 's'}${normalizedPrintSettings.secondaryPrinter ? ' usando impresora secundaria' : ''}.`)
  }

  const runTool = async (tool) => {
    if (!captureComplete) {
      setCaptureStatus('Primero toma la foto final.')
      return
    }

    closePreviewShareMenu()

    if (tool === 'WhatsApp') {
      try {
        const sharedFile = await shareFinalPhotoFile('WhatsApp')
        if (sharedFile) return
      } catch {
        // Fall back to opening WhatsApp without prefilled preview links.
      }

      if (typeof window !== 'undefined') {
        window.open('https://wa.me/', '_blank', 'noopener,noreferrer')
        setCaptureStatus('WhatsApp abierto. Este navegador no permite adjuntar la imagen automáticamente.')
        return
      }
    }

    if (tool === 'QR') {
      const publicPhotoUrl = await ensurePhotoPublicUrl()
      if (!publicPhotoUrl) {
        setCaptureStatus('Para QR de foto falta activar el guardado público en servidor.')
        return
      }
      setShowQrOptions(true)
      setCaptureStatus('QR listo: abre la foto final del cliente.')
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

  const runPreviewShareAction = async (action) => {
    if (!captureComplete) {
      setCaptureStatus('Primero toma la foto final.')
      return
    }

    if (action === 'Compartir') {
      closePreviewShareMenu()
      try {
        const sharedFile = await shareFinalPhotoFile('Compartir')
        if (sharedFile) return
      } catch {
        setCaptureStatus('Compartir imagen cancelado.')
        return
      }

      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: `${eventTitle} - Viralco`,
            text: shareText,
            url: sharePageUrl,
          })
          setCaptureStatus('Compartir abierto en el dispositivo.')
          return
        } catch {
          setCaptureStatus('Compartir cancelado.')
          return
        }
      }
      if (typeof window !== 'undefined') {
        window.open(sharePageUrl, '_blank', 'noopener,noreferrer')
      }
      downloadFinalPhoto()
      setCaptureStatus('Imagen descargada para compartir manualmente.')
      return
    }

    if (action === 'Email' && typeof window !== 'undefined') {
      closePreviewShareMenu()
      try {
        const sharedFile = await shareFinalPhotoFile('Email')
        if (sharedFile) return
      } catch {
        // Fall back to mailto.
      }
      window.location.href = `mailto:?subject=${encodeURIComponent(`Foto Viralco - ${eventTitle}`)}&body=${encodedShareText}`
      setCaptureStatus('Email listo. Si no adjunta imagen, usa el enlace o descarga la foto.')
      return
    }

    if (action === 'SMS' && typeof window !== 'undefined') {
      closePreviewShareMenu()
      try {
        const sharedFile = await shareFinalPhotoFile('SMS')
        if (sharedFile) return
      } catch {
        // Fall back to SMS text.
      }
      window.location.href = `sms:?&body=${encodedShareText}`
      setCaptureStatus('SMS listo. Si no adjunta imagen, usa el enlace directo.')
      return
    }

    runTool(action)
  }

  const openStartEditor = () => {
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowLaunchIntroScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    setShowStartEditor(true)
    updateAppRoute('editor-inicio')
    setCaptureStatus('Personaliza la pantalla de inicio para los invitados')
  }

  const openPhotoDesignScreen = () => {
    openCaptureConfigScreen(false)
    setCaptureStatus('Configuración de captura lista para fotos')
  }

  const openCaptureModeScreen = () => {
    openCaptureConfigScreen(false)
    setCaptureStatus('Modo Foto habilitado para el espejo mágico')
  }

  const openCaptureConfigScreen = (fromOperator = false) => {
    const keepOperatorMode = fromOperator || operatorSettingsActive
    setOperatorSettingsActive(keepOperatorMode)
    setShowHomeLauncher(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowLaunchIntroScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowBackgroundRemovalScreen(false)
    setShowPrintConfigScreen(false)
    setShowCaptureConfigScreen(true)
    updateAppRoute('configuracion-captura')
    setCaptureStatus('Configuración de captura lista para fotos')
  }

  const saveCaptureConfigAndReturn = () => {
    saveCurrentSetupToRecentEvents('Configuración de captura guardada.')
    openEventOptionsScreen(operatorSettingsActive)
  }

  const savePrintConfigAndReturn = () => {
    saveCurrentSetupToRecentEvents('Configuración de impresión guardada.')
    openEventOptionsScreen(operatorSettingsActive)
  }

  const openPrintConfigScreen = (fromOperator = false) => {
    const keepOperatorMode = fromOperator || operatorSettingsActive
    setOperatorSettingsActive(keepOperatorMode)
    setShowHomeLauncher(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowLaunchIntroScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(true)
    setShowBackgroundRemovalScreen(false)
    updateAppRoute('impresion')
    setCaptureStatus(`Configuración de impresión lista para papel ${printSizeLabel}.`)
  }

  const openBackgroundRemovalScreen = () => {
    openCaptureConfigScreen(operatorSettingsActive)
    setCaptureStatus('Configuración de captura lista para fotos')
  }

  const openEventOptionsScreen = (fromOperator = false) => {
    const keepOperatorMode = fromOperator || operatorSettingsActive
    setOperatorSettingsActive(keepOperatorMode)
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(true)
    setShowAnimationVideoScreen(false)
    setShowLaunchIntroScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    updateAppRoute('configurar-evento')
    setCaptureStatus('Configura tipo de foto, efectos y marcos.')
  }

  const openCapturePhotoScreen = () => {
    if (selectedType.id === 'personalizar-5x15' && customPhotoCount < 1) {
      setShowCustomPhotoLayoutScreen(true)
      updateAppRoute('personalizar')
      setCaptureStatus('Agrega al menos un recuadro de foto antes de capturar.')
      return
    }
    setRetakeFrameIndex(null)
    setOperatorSettingsActive(false)
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowLaunchIntroScreen(false)
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
    updateAppRoute('captura')
    void ensureCameraReady('Verificando cámara antes de abrir captura...')
  }

  const closeOperatorSettingsToCapture = () => {
    setOperatorSettingsActive(false)
    setShowOperatorMenu(false)
    setOperatorQuickPanel(null)
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowLaunchIntroScreen(false)
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
    void ensureCameraReady('Verificando cámara antes de volver a captura...')
  }

  const openOperatorQuickPanel = (panel) => {
    setShowOperatorMenu(false)
    setOperatorSettingsActive(false)
    setOperatorQuickPanel(panel)
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowLaunchIntroScreen(false)
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
    void ensureCameraReady('Verificando cámara para el panel del operario...')
  }

  const runOperatorAction = (action, opensSettings = false) => {
    setShowOperatorMenu(false)
    setOperatorSettingsActive(opensSettings)
    action(opensSettings)
  }

  const startRetakeFrame = (index) => {
    if (!photoFrames[index]) return
    countdownRef.current = null
    setRetakeFrameIndex(index)
    setAnimationOverlay(null)
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
    setCaptureStatus(`Vuelve a tomar la foto ${index + 1}. Las otras fotos se conservan.`)
    updateAppRoute('captura')
    void ensureCameraReady(`Verificando cámara para repetir foto ${index + 1}...`)
  }

  const openAnimationVideoScreen = () => {
    setShowAnimationVideoScreen(false)
    setAnimationVideoPromptAnswered(true)
    openCapturePhotoScreen()
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
      updateAppRoute('personalizar')
      setCaptureStatus('Agrega al menos un recuadro de foto antes de capturar.')
      return
    }

    openCapturePhotoScreen()
  }

  const openPreviewScreen = () => {
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowLaunchIntroScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(true)
    setShowShareScreen(false)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    updateAppRoute('preview')
    setCaptureStatus(captureComplete ? 'Preview listo para revisar.' : 'Toma una foto para generar el preview.')
  }

  const openShareScreen = () => {
    setShowHomeLauncher(false)
    setShowCreateEventModal(false)
    setShowEventOptionsScreen(false)
    setShowAnimationVideoScreen(false)
    setShowLaunchIntroScreen(false)
    setShowCapturePhotoScreen(false)
    setShowPreviewScreen(false)
    setShowShareScreen(true)
    setShowStartEditor(false)
    setShowPhotoDesignScreen(false)
    setShowCaptureModeScreen(false)
    setShowCaptureConfigScreen(false)
    setShowPrintConfigScreen(false)
    setShowBackgroundRemovalScreen(false)
    updateAppRoute('compartir')
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
    if (key === 'widthCm' || key === 'heightCm') return
    setPrintSettings((current) => ({
      ...current,
      presetId: '10x15',
      widthCm: '10',
      heightCm: '15',
      orientation: 'Vertical',
      [key]: value,
      ...(key === 'orientation' ? { orientation: 'Vertical' } : {}),
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
          <Text style={styles.printPaperSelectorText}>10 x 15</Text>
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
          const active = true
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
          { key: 'widthCm', label: 'Ancho cm', value: '10', locked: true },
          { key: 'heightCm', label: 'Alto cm', value: '15', locked: true },
          { key: 'marginCm', label: 'Margen cm', value: printSettings.marginCm },
          { key: 'copies', label: 'Copias', value: printSettings.copies },
        ].map((field) => (
          <View key={field.key} style={styles.printInputWrap}>
            <Text style={styles.printInputLabel}>{field.label}</Text>
            <TextInput
              value={field.value}
              onChangeText={(value) => updatePrintSetting(field.key, value)}
              editable={!field.locked}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#9ca3af"
              style={[styles.printInput, field.locked && styles.printInputLocked]}
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
        <Pressable
          onPress={() => {
            setShowCreateEventModal(false)
            updateAppRoute('inicio')
          }}
          style={styles.closeButton}
        >
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

  const renderProfileSwitcher = () => (
    <View style={[styles.profileSwitcher, isPhone && styles.profileSwitcherPhone]}>
      <View style={styles.profileSwitcherHeader}>
        <Text style={styles.profileSwitcherEyebrow}>Acceso rápido</Text>
        <Text style={styles.profileSwitcherActive}>{activeProfile.name}</Text>
      </View>
      <View style={[styles.profileSwitcherOptions, isPhone && styles.profileSwitcherOptionsPhone]}>
        {profileOptions.map((profile) => {
          const active = profile.id === activeProfile.id
          return (
            <Pressable
              key={profile.id}
              onPress={() => switchProfile(profile.id)}
              style={[styles.profileChip, isPhone && styles.profileChipPhone, active && styles.profileChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`Cambiar a ${profile.name}`}
            >
              <Text style={[styles.profileChipText, active && styles.profileChipTextActive]}>{isPhone ? profile.shortName : profile.name}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )

  const renderRecentEventsLauncher = () => {
    const mainEvent = visibleLaunchEvents[0]
    const getEventDisplayData = (recentEvent) => {
      const type = photoTypes.find((item) => item.id === recentEvent.photoTypeId) || photoTypes[0]
      const recentEventTemplates = getTemplatesForEventType(recentEvent.eventType)
      const template =
        recentEventTemplates.find((item) => item.id === recentEvent.templateId) ||
        templates.find((item) => item.id === recentEvent.templateId) ||
        recentEventTemplates[0] ||
        templates[0]
      const shotCount = recentEvent.photoTypeId === 'personalizar-5x15'
        ? Math.max(Number(recentEvent.customPhotoCount) || type.shots || 0, 0)
        : type.shots
      const active = (recentEvent.id || recentEvent.name) === (selectedRecentEvent?.id || selectedRecentEvent?.name)
      return { type, template, shotCount, active }
    }

    return (
      <View style={[styles.recentEventsPanel, isPhone && styles.recentEventsPanelPhone]}>
        <View style={[styles.recentEventsHeader, isMobile && styles.recentEventsHeaderMobile]}>
          <View style={styles.recentEventsHeading}>
            <Text style={styles.panelTitle}>{isAdminProfile ? 'Lanzar evento' : `Evento de ${activeProfile.shortName}`}</Text>
            <Text style={styles.recentEventsIntro}>
              {isAdminProfile
                ? 'Crea, configura o lanza el último evento guardado.'
                : 'Este perfil solo puede lanzar el evento asignado por el administrador.'}
            </Text>
          </View>
        </View>

        {mainEvent ? (() => {
          const { type, template, shotCount, active } = getEventDisplayData(mainEvent)
          return (
            <View style={styles.recentEventsGrid}>
              <View
                key={mainEvent.id || mainEvent.name}
                style={[styles.recentEventCard, isPhone && styles.recentEventCardPhone, active && styles.recentEventCardActive]}
              >
                <View style={styles.recentEventContent}>
                  <View style={styles.recentEventTopRow}>
                    <Text style={styles.recentEventMeta}>{mainEvent.updatedAt || 'Reciente'}</Text>
                    <Text style={styles.recentEventProfile}>{isAdminProfile ? 'Administrador' : activeProfile.name}</Text>
                  </View>
                  <Text style={styles.recentEventTitle}>{mainEvent.name || 'Último evento'}</Text>
                  <Text style={styles.recentEventDetails}>{mainEvent.eventType || 'Evento'} / {type.name}</Text>
                  <View style={styles.recentEventDataGrid}>
                    <View style={styles.recentEventDataItem}>
                      <Text style={styles.recentEventDataLabel}>Formato</Text>
                      <Text style={styles.recentEventDataValue}>{type.name}</Text>
                    </View>
                    <View style={styles.recentEventDataItem}>
                      <Text style={styles.recentEventDataLabel}>Plantilla</Text>
                      <Text style={styles.recentEventDataValue}>{template.name}</Text>
                    </View>
                    <View style={styles.recentEventDataItem}>
                      <Text style={styles.recentEventDataLabel}>Fotos</Text>
                      <Text style={styles.recentEventDataValue}>{shotCount || type.shots}</Text>
                    </View>
                    <View style={styles.recentEventDataItem}>
                      <Text style={styles.recentEventDataLabel}>Entrega</Text>
                      <Text style={styles.recentEventDataValue}>QR / WhatsApp / Print</Text>
                    </View>
                  </View>
                  <View style={styles.recentEventActions}>
                    {isAdminProfile ? (
                      <Pressable
                        onPress={() => {
                          setSelectedRecentId(mainEvent.id || mainEvent.name)
                          launchEvent(mainEvent, 'options')
                        }}
                        style={styles.editRecentButton}
                        accessibilityRole="button"
                        accessibilityLabel={`Editar ${mainEvent.name || 'evento'}`}
                      >
                        <Text style={styles.editRecentButtonText}>Editar evento</Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      onPress={() => {
                        setSelectedRecentId(mainEvent.id || mainEvent.name)
                        launchEvent(mainEvent)
                      }}
                      style={styles.launchRecentButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Lanzar ${mainEvent.name || 'último evento'}`}
                    >
                      <Text style={styles.launchRecentButtonText}>Lanzar evento</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          )
        })() : (
          <View style={styles.recentEventEmpty}>
            <Text style={styles.recentEventEmptyTitle}>Sin eventos recientes</Text>
            <Text style={styles.recentEventEmptyText}>
              {isAdminProfile ? 'Crea un evento nuevo para dejarlo listo aquí.' : 'Este operario aún no tiene eventos asignados.'}
            </Text>
          </View>
        )}
      </View>
    )
  }

  const renderHomeActionCard = () => {
    if (!isAdminProfile) return null

    return (
      <View style={[styles.homeActionCard, isPhone && styles.homeActionCardPhone]}>
        <Pressable onPress={openNewEventModal} style={styles.homeCreateButton} accessibilityRole="button" accessibilityLabel="Crear evento nuevo">
          <Text style={styles.homeCreateButtonText}>+ Crear evento nuevo</Text>
        </Pressable>
      </View>
    )
  }

  const renderAdminEventsSummary = () => {
    if (!isAdminProfile) return null
    const orderedEvents = recentEvents.filter((item) => !deletedEventIds.includes(getEventIdentity(item))).slice()

    return (
      <View style={[styles.adminEventsSummary, isPhone && styles.adminEventsSummaryPhone]}>
        <View style={styles.adminEventsSummaryHeader}>
          <View>
            <Text style={styles.panelEyebrow}>Administrador</Text>
            <Text style={styles.adminEventsSummaryTitle}>Resumen de eventos</Text>
          </View>
          <Text style={styles.adminEventsSummaryCount}>{orderedEvents.length}</Text>
        </View>
        <View style={styles.adminEventsList}>
          {orderedEvents.map((item, index) => {
            const type = photoTypes.find((photoType) => photoType.id === item.photoTypeId) || photoTypes[0]
            const templateOptions = getTemplatesForEventType(item.eventType)
            const template =
              templateOptions.find((templateItem) => templateItem.id === item.templateId) ||
              templates.find((templateItem) => templateItem.id === item.templateId) ||
              templateOptions[0] ||
              templates[0]
            const assignedProfile = profileOptions.find((profile) => profile.id === item.operatorId)
            const active = (item.id || item.name) === (selectedRecentEvent?.id || selectedRecentEvent?.name)
            const shotCount = item.photoTypeId === 'personalizar-5x15'
              ? Math.max(Number(item.customPhotoCount) || type.shots || 0, 0)
              : type.shots

            return (
              <Pressable
                key={`admin-event-${item.id || item.name}-${index}`}
                onPress={() => {
                  setSelectedRecentId(item.id || item.name)
                  applyEventSetup(item, 'cargado desde resumen')
                }}
                style={[styles.adminEventRow, active && styles.adminEventRowActive]}
                accessibilityRole="button"
                accessibilityLabel={`Cargar evento ${item.name || 'sin nombre'}`}
              >
                <Text style={styles.adminEventIndex}>{index + 1}</Text>
                <View style={styles.adminEventMain}>
                  <Text style={styles.adminEventName}>{item.name || 'Evento sin nombre'}</Text>
                  <Text style={styles.adminEventMeta}>{item.eventType || 'Evento'} / {type.name}</Text>
                </View>
                <View style={styles.adminEventTags}>
                  <Text style={styles.adminEventTag}>{template.name}</Text>
                  <Text style={styles.adminEventTag}>{shotCount} foto{shotCount === 1 ? '' : 's'}</Text>
                  <Text style={styles.adminEventTag}>{assignedProfile?.shortName || 'Admin'}</Text>
                </View>
                <View style={styles.adminEventActions}>
                  <Pressable
                    onPress={(event) => {
                      event?.stopPropagation?.()
                      setSelectedRecentId(item.id || item.name)
                      launchEvent(item, 'options')
                    }}
                    style={styles.adminEventEditButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar evento ${item.name || 'sin nombre'}`}
                  >
                    <Text style={styles.adminEventEditText}>Editar</Text>
                  </Pressable>
                  <Pressable
                    onPress={(event) => {
                      event?.stopPropagation?.()
                      deleteRecentEvent(item)
                    }}
                    style={styles.adminEventDeleteButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Eliminar evento ${item.name || 'sin nombre'}`}
                  >
                    <Text style={styles.adminEventDeleteText}>Eliminar</Text>
                  </Pressable>
                </View>
              </Pressable>
            )
          })}
        </View>
      </View>
    )
  }

  const renderEventGalleryFolders = () => {
    if (!visibleGalleryFolders.length) return null
    return (
      <View style={[styles.eventFoldersPanel, isPhone && styles.eventFoldersPanelPhone]}>
        <View style={styles.adminEventsSummaryHeader}>
          <View>
            <Text style={styles.panelEyebrow}>{isAdminProfile ? 'Administrador' : activeProfile.name}</Text>
            <Text style={styles.adminEventsSummaryTitle}>{isAdminProfile ? 'Galerías por evento' : 'Galería asignada'}</Text>
          </View>
          <Text style={styles.adminEventsSummaryCount}>{visibleGalleryFolders.length}</Text>
        </View>
        <View style={[styles.eventFoldersGrid, isPhone && styles.eventFoldersGridPhone]}>
          {visibleGalleryFolders.map((folder, index) => {
            const assignedProfile = profileOptions.find((profile) => profile.id === folder.operatorId)
            return (
              <Pressable
                key={`gallery-folder-${folder.id}-${index}`}
                onPress={() => {
                  openEventGallery(folder.id)
                }}
                style={styles.eventFolderCard}
                accessibilityRole="button"
                accessibilityLabel={`Abrir galería de ${folder.eventName}`}
              >
                <View style={styles.eventFolderPreview}>
                  {folder.latest?.src ? (
                    <Image source={{ uri: folder.latest.src }} style={styles.eventFolderPreviewImage} accessibilityLabel={`Última foto de ${folder.eventName}`} />
                  ) : (
                    <View style={styles.eventFolderEmptyPreview}>
                      <Text style={styles.eventFolderEmptyIcon}>+</Text>
                    </View>
                  )}
                  <View style={styles.eventFolderCount}>
                    <Text style={styles.eventFolderCountText}>{folder.items.length}</Text>
                  </View>
                </View>
                <View style={styles.eventFolderInfo}>
                  <Text style={styles.eventFolderName}>{folder.eventName}</Text>
                  <Text style={styles.eventFolderMeta}>
                    {folder.items.length ? `${folder.items.length} foto${folder.items.length === 1 ? '' : 's'}` : 'Sin fotos todavía'} · {assignedProfile?.shortName || 'Admin'}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      </View>
    )
  }

  const renderHomeLauncher = () => (
    <View style={[styles.homeLauncherPage, isPhone && styles.homeLauncherPagePhone]}>
      {renderProfileSwitcher()}
      {React.createElement(
        'h1',
        {
          style: {
            margin: 0,
            color: colors.blue,
            fontSize: 'clamp(24px, 2.8svh, 40px)',
            lineHeight: 'clamp(30px, 3.4svh, 48px)',
            fontWeight: 900,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 0,
          },
        },
        'Viralco',
      )}
      <Text style={[styles.homeWelcome, isPhone && styles.homeWelcomePhone]}>Espejo mágico</Text>
      <Text style={[styles.homeWelcomeSub, isPhone && styles.homeWelcomeSubPhone]}>Eventos, fotos y entregas listas para imprimir o compartir</Text>
      {renderRecentEventsLauncher()}
      {renderHomeActionCard()}
      {renderAdminEventsSummary()}
      {renderEventGalleryFolders()}
    </View>
  )

  const renderEventSetupPreview = () => {
    const slots = getSelectedTypeLayoutSlots()
    const frameSource = overlayImageUrl ? { uri: overlayImageUrl } : selectedTemplate.image
    const isManualType = selectedType.id.startsWith('personalizar')

    return (
      <View style={[styles.eventOptionsSection, styles.setupPreviewSection, isPhone && styles.eventOptionsSectionPhone]}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelEyebrow}>Previsualizador</Text>
            <Text style={styles.panelTitle}>Así quedaría</Text>
          </View>
          <Pressable
            onPress={openSelectedTypeLayoutEditor}
            style={styles.setupPreviewEditButton}
            accessibilityRole="button"
            accessibilityLabel="Editar layout manual"
          >
            <Text style={styles.setupPreviewEditText}>{isMobile ? 'Editar' : 'Editar layout'}</Text>
          </Pressable>
        </View>

        <View style={[styles.setupPreviewContent, isManualType && styles.setupPreviewContentManual, isMobile && styles.setupPreviewContentMobile]}>
          {isManualType ? (
            <View
              style={[
                styles.customLayoutSheet,
                styles.setupPreviewManualSheet,
                customMirrorMode && styles.customLayoutSheetMirrorPaper,
                customMirrorMode && styles.setupPreviewManualSheetMirror,
                isMobile && styles.customLayoutSheetMobile,
              ]}
            >
              <View style={[styles.customLayoutStrip, styles.setupPreviewManualStrip]}>
                <Image
                  source={frameSource}
                  style={styles.customLayoutBackgroundImage}
                  accessibilityLabel={overlayFileName || `Plantilla ${selectedTemplate.name}`}
                />
                <View style={styles.customLayoutBackgroundShade} />
                {renderCustomTextPreviewLayers(false)}
                {!customLayoutSlots.length ? (
                  <View style={styles.customLayoutEmptyState}>
                    <Text style={styles.customLayoutEmptyTitle}>Fondo activo</Text>
                    <Text style={styles.customLayoutEmptyText}>Agrega una foto para crear un recuadro.</Text>
                  </View>
                ) : null}
                {renderCustomLayoutPhotoSlots(false, false)}
              </View>
              {customMirrorMode ? (
                <View style={[styles.customLayoutStrip, styles.setupPreviewManualStrip]}>
                  <Image
                    source={frameSource}
                    style={styles.customLayoutBackgroundImage}
                    accessibilityLabel={`Copia de plantilla ${selectedTemplate.name}`}
                  />
                  <View style={styles.customLayoutBackgroundShade} />
                  {renderCustomTextPreviewLayers(false)}
                  {renderCustomLayoutPhotoSlots(false, false)}
                </View>
              ) : null}
            </View>
          ) : (
            <View
              style={[
                styles.setupPreviewCanvas,
                { aspectRatio: selectedType.width / selectedType.height },
                isMobile && styles.setupPreviewCanvasMobile,
              ]}
            >
              <Image source={frameSource} style={styles.setupPreviewFrameImage} accessibilityLabel={`Vista previa de ${selectedTemplate.name}`} />
              <View style={styles.setupPreviewWash} />
              <View style={styles.setupPreviewEventText}>
                <Text style={styles.setupPreviewEventName}>{eventTitle}</Text>
                <Text style={styles.setupPreviewEventMeta}>{selectedType.name} / {selectedTemplate.name}</Text>
              </View>
              {slots.length ? slots.map((slot) => (
                <View
                  key={`setup-preview-slot-${slot.photoNumber}`}
                  style={[
                    styles.setupPreviewSlot,
                    {
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      width: `${slot.width}%`,
                      height: `${slot.height}%`,
                    },
                  ]}
                >
                  <Text style={styles.setupPreviewSlotNumber}>{slot.photoNumber}</Text>
                  <Text style={styles.setupPreviewSlotLabel}>Foto</Text>
                </View>
              )) : (
                <View style={styles.setupPreviewEmpty}>
                  <Text style={styles.setupPreviewEmptyText}>Agrega recuadros para ver el diseño.</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.setupPreviewInfo}>
            <Text style={styles.setupPreviewInfoTitle}>{selectedType.name}</Text>
            <Text style={styles.setupPreviewInfoText}>{selectedType.note}</Text>
            <View style={styles.setupPreviewStats}>
              <Text style={styles.setupPreviewStat}>{slots.length || selectedShotCount} foto{(slots.length || selectedShotCount) === 1 ? '' : 's'}</Text>
              <Text style={styles.setupPreviewStat}>{selectedTemplate.name}</Text>
            </View>
            <Text style={styles.setupPreviewHint}>Puedes editar posición, tamaño, textos, colores y marco desde el layout manual.</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderEventOptionsScreen = () => (
    <View style={styles.eventOptionsPage}>
      <View style={[styles.eventOptionsHeader, isMobile && styles.eventOptionsHeaderMobile, isPhone && styles.eventOptionsHeaderPhone]}>
        <View style={styles.eventOptionsHeading}>
          <Text style={styles.panelEyebrow}>Evento nuevo</Text>
          <Text style={[styles.eventOptionsTitle, isMobile && styles.eventOptionsTitleMobile, isPhone && styles.eventOptionsTitlePhone]}>{eventTitle}</Text>
          <Text style={[styles.eventOptionsText, isPhone && styles.eventOptionsTextPhone]}>
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

      <View style={[styles.eventOptionsBody, isPhone && styles.eventOptionsBodyPhone]}>
        <View style={[styles.eventOptionsSection, isPhone && styles.eventOptionsSectionPhone]}>
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

        {renderEventSetupPreview()}

        <View style={[styles.eventOptionsSection, isPhone && styles.eventOptionsSectionPhone]}>
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

      <View style={[styles.eventOptionsFooter, isMobile && styles.eventOptionsFooterMobile, isPhone && styles.eventOptionsFooterPhone]}>
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

  const getCustomTextPreviewItems = () => [
    { id: 'script', label: 'Frase', value: photoScriptText.trim() || photoTextPresets[0] },
    { id: 'name', label: 'Nombre', value: getPhotoNameText() },
    { id: 'event', label: 'Evento', value: getPhotoEventText() },
    { id: 'date', label: 'Fecha', value: getPhotoDateText() },
  ].filter((item) => item.value)

  const renderCustomTextPreviewLayers = (interactive = false) => getCustomTextPreviewItems().map((item) => {
    const layer = customTextLayers[item.id] || defaultCustomTextLayers[item.id]
    const selected = interactive && selectedCustomTextLayer === item.id
    const content = (
      <Text
        style={[
          styles.customTextLayerValue,
          {
            color: layer.color,
            fontFamily: layer.font,
            fontSize: `clamp(${Math.max(10, layer.size - 4)}px, ${layer.size / 10}vw, ${layer.size + 8}px)`,
            lineHeight: `clamp(${Math.max(14, layer.size)}px, ${(layer.size + 5) / 10}vw, ${layer.size + 14}px)`,
          },
        ]}
      >
        {item.value}
      </Text>
    )
    const layerStyle = [
      styles.customTextLayer,
      {
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        width: `${layer.width}%`,
      },
      selected && styles.customTextLayerSelected,
      !interactive && styles.customMirrorPreviewLayer,
    ]

    if (!interactive) {
      return (
        <View key={`custom-text-preview-${item.id}`} style={layerStyle}>
          {content}
        </View>
      )
    }

    return (
      <Pressable
        key={`custom-text-${item.id}`}
        onPress={() => setSelectedCustomTextLayer(item.id)}
        onPressIn={(event) => beginCustomTextPointer(item.id, event)}
        style={layerStyle}
        accessibilityRole="button"
        accessibilityLabel={`Editar texto ${item.label}`}
      >
        {content}
      </Pressable>
    )
  })

  const renderCustomLayoutPhotoSlots = (interactive = false, mutedPreview = !interactive) => customLayoutSlots.map((slot, index) => {
    const photoNumber = slot.photoNumber
    const selected = interactive && selectedCustomLayoutPhotos.includes(photoNumber)
    if (!slot) return null
    const slotStyle = [
      styles.customLayoutSlot,
      !interactive && mutedPreview && styles.customLayoutSlotMirror,
      {
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        width: `${slot.width}%`,
        height: `${slot.height}%`,
        zIndex: selected ? 10 : index + 1,
      },
      selected && styles.customLayoutSlotSelected,
    ]

    if (!interactive) {
      return (
        <View key={`custom-layout-preview-slot-${photoNumber}-${index}`} style={slotStyle}>
          <Text style={styles.customLayoutSlotNumber}>{photoNumber}</Text>
          <Text style={styles.customLayoutSlotMeta}>Foto {photoNumber}</Text>
        </View>
      )
    }

    return (
      <Pressable
        key={`custom-layout-slot-${photoNumber}-${index}`}
        testID={`custom-layout-slot-${photoNumber}`}
        onPress={() => selectCustomLayoutPhoto(photoNumber)}
        onPressIn={(event) => beginCustomLayoutPointer(photoNumber, 'move', event)}
        style={slotStyle}
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
  })

  const renderCustomPhotoLayoutScreen = () => (
    <View style={[styles.customLayoutPage, isPortraitMirrorScreen && styles.customLayoutPagePortrait]}>
      <View style={[styles.startEditorHeader, isMobile && styles.startEditorHeaderMobile, isPortraitMirrorScreen && styles.startEditorHeaderPortrait]}>
        <View style={styles.startEditorHeading}>
          <Text style={styles.panelEyebrow}>Personalizar</Text>
          <Text style={[styles.startEditorTitle, isMobile && styles.startEditorTitleMobile]}>Layout manual</Text>
          <Text style={[styles.startEditorSubtitle, isMobile && styles.startEditorSubtitleMobile]}>
            Usa la plantilla o marco activo como fondo. Agrega fotos, textos y formato, luego mueve o agranda cada recuadro.
          </Text>
        </View>
      </View>

      <View style={[styles.customLayoutContent, isMobile && styles.customLayoutContentMobile, isPortraitMirrorScreen && styles.customLayoutContentPortrait]}>
        <View style={styles.customLayoutPreviewPanel}>
          <View
            style={[
              styles.customLayoutSheet,
              customMirrorMode && styles.customLayoutSheetMirrorPaper,
              isMobile && styles.customLayoutSheetMobile,
              isPortraitMirrorScreen && styles.customLayoutSheetPortrait,
              isPortraitMirrorScreen && customMirrorMode && styles.customLayoutSheetMirrorPaperPortrait,
            ]}
          >
            <View
              ref={customEditorStripRef}
              style={[styles.customLayoutStrip, customMirrorMode && styles.customLayoutStripHalf, styles.customLayoutStripEditable]}
            >
              <Image
                source={overlayImageUrl ? { uri: overlayImageUrl } : selectedTemplate.image}
                style={styles.customLayoutBackgroundImage}
                accessibilityLabel={overlayFileName || `Plantilla ${selectedTemplate.name}`}
              />
              <View style={styles.customLayoutBackgroundShade} />
              {customAlignmentGuides.x.map((guide) => (
                <View key={`guide-x-${guide}`} style={[styles.customAlignGuideVertical, { left: `${guide}%` }]} />
              ))}
              {customAlignmentGuides.y.map((guide) => (
                <View key={`guide-y-${guide}`} style={[styles.customAlignGuideHorizontal, { top: `${guide}%` }]} />
              ))}
              {renderCustomTextPreviewLayers(true)}
              {!customLayoutSlots.length ? (
                <View style={styles.customLayoutEmptyState}>
                  <Text style={styles.customLayoutEmptyTitle}>Fondo activo</Text>
                  <Text style={styles.customLayoutEmptyText}>Toca “Agregar foto” para crear un recuadro.</Text>
                </View>
              ) : null}
              {renderCustomLayoutPhotoSlots(true)}
            </View>
            {customMirrorMode ? (
              <View style={[styles.customLayoutStrip, styles.customLayoutStripHalf, styles.customLayoutMirrorCopy]}>
                <Image
                  source={overlayImageUrl ? { uri: overlayImageUrl } : selectedTemplate.image}
                  style={styles.customLayoutBackgroundImage}
                  accessibilityLabel={`Copia de plantilla ${selectedTemplate.name}`}
                />
                <View style={styles.customLayoutBackgroundShade} />
                {renderCustomTextPreviewLayers(false)}
                {renderCustomLayoutPhotoSlots(false)}
                <View style={styles.customLayoutMirrorBadge}>
                  <Text style={styles.customLayoutMirrorBadgeText}>Copia 5x15</Text>
                </View>
              </View>
            ) : null}
          </View>
          <Text style={styles.customLayoutHint}>
            {customMirrorMode
              ? 'Modo espejo activo: editas la tira izquierda 5x15 y la app imprime una copia igual en la derecha para papel 10x15.'
              : 'Arrastra los recuadros sobre el fondo. Activa modo espejo para imprimir dos tiras 5x15 en papel 10x15.'}
          </Text>
        </View>

        <View style={[styles.customLayoutControls, isPortraitMirrorScreen && styles.customLayoutControlsPortrait]}>
          <View style={styles.customMenuTabs}>
            {[
              { id: 'photos', label: 'Fotos' },
              { id: 'text', label: 'Textos' },
              { id: 'format', label: 'Formato' },
              { id: 'frame', label: 'Marco' },
              { id: 'move', label: 'Ajustar' },
              { id: 'list', label: 'Lista' },
            ].map((item) => (
              <Pressable
                key={`custom-menu-${item.id}`}
                onPress={() => setActiveCustomMenu(item.id)}
                style={[styles.customMenuTab, activeCustomMenu === item.id && styles.customMenuTabActive]}
                accessibilityRole="button"
                accessibilityLabel={`Abrir menú ${item.label}`}
              >
                <Text style={[styles.customMenuTabText, activeCustomMenu === item.id && styles.customMenuTabTextActive]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          {activeCustomMenu === 'photos' ? <View style={styles.customLayoutCard}>
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
              <Pressable
                onPress={() => {
                  setMultiCustomLayoutSelect((current) => {
                    const next = !current
                    if (!next) setSelectedCustomLayoutPhotos([selectedCustomLayoutPhoto])
                    return next
                  })
                  setCaptureStatus(`Selección múltiple ${multiCustomLayoutSelect ? 'desactivada' : 'activa'}.`)
                }}
                style={[styles.customManualButton, multiCustomLayoutSelect && styles.customManualButtonActive]}
                accessibilityRole="button"
                accessibilityLabel="Seleccionar varios recuadros"
              >
                <Text style={[styles.customManualButtonText, multiCustomLayoutSelect && styles.customManualButtonTextActive]}>Seleccionar varios</Text>
              </Pressable>
              <Pressable onPress={resetCustomPhotoLayout} style={styles.customManualGhostButton} accessibilityRole="button" accessibilityLabel="Limpiar todos los recuadros">
                <Text style={styles.customManualGhostText}>Limpiar fondo</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setCustomMirrorMode((current) => !current)
                  setPhotoFrames([])
                  setFinalPhotoUrl('')
                  clearSavedPhoto()
                  setRetakeFrameIndex(null)
                  setCaptureStatus(`Modo espejo ${customMirrorMode ? 'desactivado' : 'activado'}.`)
                }}
                style={[styles.customManualMirrorButton, customMirrorMode && styles.customManualMirrorButtonActive]}
                accessibilityRole="button"
                accessibilityLabel="Activar modo espejo"
              >
                <Text style={[styles.customManualMirrorText, customMirrorMode && styles.customManualMirrorTextActive]}>
                  Modo espejo {customMirrorMode ? 'activo' : ''}
                </Text>
              </Pressable>
            </View>
          </View> : null}

          {activeCustomMenu === 'text' ? <View style={styles.customLayoutCard}>
            <View style={styles.customLayoutCardHeader}>
              <View>
                <Text style={styles.panelEyebrow}>Textos</Text>
                <Text style={styles.customLayoutTitle}>Datos del marco</Text>
              </View>
              <Text style={styles.customLayoutCount}>{customTextLabels[selectedCustomTextLayer]}</Text>
            </View>
            <View style={styles.customTextLayerPicker}>
              {[
                { id: 'script', label: 'Frase' },
                { id: 'name', label: 'Nombre' },
                { id: 'event', label: 'Evento' },
                { id: 'date', label: 'Fecha' },
              ].map((item) => (
                <Pressable
                  key={`text-picker-${item.id}`}
                  onPress={() => {
                    setSelectedCustomTextLayer(item.id)
                    setShowCustomTextColorPalette(false)
                    setShowCustomTextFontMenu(false)
                  }}
                  style={[styles.customTextPickerButton, selectedCustomTextLayer === item.id && styles.customTextPickerButtonActive]}
                >
                  <Text style={[styles.customTextPickerText, selectedCustomTextLayer === item.id && styles.customTextPickerTextActive]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.customTextGrid, styles.customTextGridSingle]}>
              {selectedCustomTextLayer === 'name' ? (
                <TextInput
                  value={photoNameText}
                  onChangeText={(value) => {
                    setPhotoNameText(value)
                    setCaptureStatus('Nombre del diseño actualizado.')
                  }}
                  placeholder="Nombre principal"
                  placeholderTextColor="#9ca3af"
                  style={styles.customTextInput}
                />
              ) : null}
              {selectedCustomTextLayer === 'event' ? (
                <TextInput
                  value={photoEventText}
                  onChangeText={(value) => {
                    setPhotoEventText(value)
                    setCaptureStatus('Texto del evento actualizado.')
                  }}
                  placeholder="Texto del evento"
                  placeholderTextColor="#9ca3af"
                  style={styles.customTextInput}
                />
              ) : null}
              {selectedCustomTextLayer === 'date' ? (
                <input
                  type="date"
                  value={dateTextToISO(photoDateText)}
                  onChange={(event) => updatePhotoDateFromISO(event.target.value, 'Fecha del diseño actualizada.')}
                  aria-label="Fecha del diseño"
                  style={styles.customTextDateInput}
                />
              ) : null}
              {selectedCustomTextLayer === 'script' ? (
                <TextInput
                  value={photoScriptText}
                  onChangeText={(value) => {
                    setPhotoScriptText(value)
                    setCaptureStatus('Frase superior actualizada.')
                  }}
                  placeholder="Frase superior"
                  placeholderTextColor="#9ca3af"
                  style={styles.customTextInput}
                />
              ) : null}
            </View>
            <View style={styles.customTextStyleGrid}>
              <Pressable
                onPress={() => {
                  setShowCustomTextColorPalette(false)
                  setShowCustomTextFontMenu((current) => !current)
                }}
                style={styles.customTextStyleButton}
              >
                <Text style={styles.customTextStyleButtonText}>Fuente</Text>
                <Text style={styles.customTextStyleButtonValue}>
                  {uploadedCustomFonts.find((font) => font.family === customTextLayers[selectedCustomTextLayer]?.font)?.name || customTextLayers[selectedCustomTextLayer]?.font}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowCustomTextFontMenu(false)
                  setShowCustomTextColorPalette((current) => !current)
                }}
                style={styles.customTextStyleButton}
              >
                <Text style={styles.customTextStyleButtonText}>Color</Text>
                <View style={[styles.customTextColorSwatch, { backgroundColor: customTextLayers[selectedCustomTextLayer]?.color }]} />
              </Pressable>
              <Pressable
                onPress={() => updateCustomTextLayer(selectedCustomTextLayer, { size: clampNumber((customTextLayers[selectedCustomTextLayer]?.size || 16) - 2, 8, 54) })}
                style={styles.customTextStyleButton}
              >
                <Text style={styles.customTextStyleButtonText}>Texto -</Text>
              </Pressable>
              <Pressable
                onPress={() => updateCustomTextLayer(selectedCustomTextLayer, { size: clampNumber((customTextLayers[selectedCustomTextLayer]?.size || 16) + 2, 8, 54) })}
                style={styles.customTextStyleButton}
              >
                <Text style={styles.customTextStyleButtonText}>Texto +</Text>
              </Pressable>
              {showCustomTextFontMenu ? (
                <View style={styles.customTextFontMenu}>
                  {customFontChoices.map((font) => {
                    const uploadedFont = uploadedCustomFonts.find((item) => item.family === font)
                    const label = uploadedFont?.name || font
                    const active = customTextLayers[selectedCustomTextLayer]?.font === font
                    return (
                      <Pressable
                        key={`custom-text-font-${font}`}
                        onPress={() => chooseCustomTextFont(selectedCustomTextLayer, font)}
                        style={[styles.customTextFontChoice, active && styles.customTextFontChoiceActive]}
                        accessibilityRole="button"
                        accessibilityLabel={`Elegir fuente ${label}`}
                      >
                        <Text style={[styles.customTextFontChoiceText, active && styles.customTextFontChoiceTextActive, { fontFamily: font }]}>
                          {label}
                        </Text>
                      </Pressable>
                    )
                  })}
                  <label style={styles.customTextFontUpload}>
                    <Text style={styles.customTextFontUploadTitle}>+ Subir fuente</Text>
                    <Text style={styles.customTextFontUploadText}>TTF, OTF, WOFF</Text>
                    <input
                      accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
                      type="file"
                      onChange={handleCustomFontFile}
                      style={{ display: 'none' }}
                    />
                  </label>
                </View>
              ) : null}
              {showCustomTextColorPalette ? (
                <View style={styles.customTextColorPalette}>
                  <View style={styles.customTextColorPaletteHeader}>
                    <Text style={styles.customTextColorPaletteTitle}>Paleta de colores</Text>
                    <label style={styles.customTextColorPickerLabel}>
                      <Text style={styles.customTextColorPickerText}>Color libre</Text>
                      <input
                        type="color"
                        value={customTextLayers[selectedCustomTextLayer]?.color || defaultCustomTextLayers[selectedCustomTextLayer]?.color || '#111827'}
                        onChange={(event) => chooseCustomTextColor(selectedCustomTextLayer, event.target.value)}
                        style={styles.customTextColorPickerInput}
                      />
                    </label>
                  </View>
                  <View style={styles.customTextColorGrid}>
                    {customTextColors.map((color) => {
                      const active = (customTextLayers[selectedCustomTextLayer]?.color || defaultCustomTextLayers[selectedCustomTextLayer]?.color) === color
                      return (
                        <Pressable
                          key={`custom-text-color-${color}`}
                          onPress={() => chooseCustomTextColor(selectedCustomTextLayer, color)}
                          style={[styles.customTextColorChoice, active && styles.customTextColorChoiceActive]}
                          accessibilityRole="button"
                          accessibilityLabel={`Elegir color ${color}`}
                        >
                          <View style={[styles.customTextColorChoiceSwatch, { backgroundColor: color }]} />
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
              ) : null}
              <Pressable onPress={() => nudgeCustomTextLayer(selectedCustomTextLayer, 'y', -1.5)} style={styles.customFineButton}>
                <Text style={styles.customFineButtonText}>↑</Text>
              </Pressable>
              <Pressable onPress={() => nudgeCustomTextLayer(selectedCustomTextLayer, 'x', -1.5)} style={styles.customFineButton}>
                <Text style={styles.customFineButtonText}>←</Text>
              </Pressable>
              <Pressable onPress={() => nudgeCustomTextLayer(selectedCustomTextLayer, 'x', 1.5)} style={styles.customFineButton}>
                <Text style={styles.customFineButtonText}>→</Text>
              </Pressable>
              <Pressable onPress={() => nudgeCustomTextLayer(selectedCustomTextLayer, 'y', 1.5)} style={styles.customFineButton}>
                <Text style={styles.customFineButtonText}>↓</Text>
              </Pressable>
            </View>
          </View> : null}

          {activeCustomMenu === 'format' ? <View style={styles.customLayoutCard}>
            <View style={styles.customLayoutCardHeader}>
              <View>
                <Text style={styles.panelEyebrow}>Tipo de foto</Text>
                <Text style={styles.customLayoutTitle}>Formato</Text>
              </View>
              <Text style={styles.customLayoutCount}>{selectedType.name}</Text>
            </View>
            <View style={styles.customTypePills}>
              {photoTypes.map((type) => (
                <Pressable
                  key={`custom-type-${type.id}`}
                  onPress={() => chooseType(type)}
                  style={[styles.customTypePill, selectedType.id === type.id && styles.customTypePillActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Usar tipo de foto ${type.name}`}
                >
                  <Text style={[styles.customTypePillText, selectedType.id === type.id && styles.customTypePillTextActive]}>{type.name}</Text>
                </Pressable>
              ))}
            </View>
          </View> : null}

          {activeCustomMenu === 'frame' ? <View style={styles.customLayoutCard}>
            <View style={styles.customLayoutCardHeader}>
              <View>
                <Text style={styles.panelEyebrow}>Plantilla / marco</Text>
                <Text style={styles.customLayoutTitle}>Fondo del diseño</Text>
              </View>
            </View>
            <View style={styles.customTemplateRow}>
              {eventTemplateOptions.slice(0, 4).map((template) => {
                const active = selectedTemplate.id === template.id && !overlayImageUrl
                return (
                  <Pressable
                    key={`custom-template-${template.id}`}
                    onPress={() => chooseTemplate(template)}
                    style={[styles.customTemplateThumb, active && styles.customTemplateThumbActive]}
                    accessibilityRole="button"
                    accessibilityLabel={`Usar plantilla ${template.name}`}
                  >
                    <Image source={template.image} style={styles.customTemplateImage} accessibilityLabel={`Plantilla ${template.name}`} />
                  </Pressable>
                )
              })}
              <label style={overlayImageUrl ? { ...styles.customUploadThumb, ...styles.customTemplateThumbActive } : styles.customUploadThumb}>
                <Text style={styles.customUploadThumbText}>+</Text>
                <input accept="image/png,image/jpeg,image/webp" type="file" onChange={handleOverlayFile} style={{ display: 'none' }} />
              </label>
            </View>
            <Text style={styles.customLayoutHint}>{overlayFileName || selectedTemplate.name}</Text>
          </View> : null}

          {activeCustomMenu === 'move' ? <View style={styles.customLayoutCard}>
            <View style={styles.customLayoutCardHeader}>
              <View>
                <Text style={styles.panelEyebrow}>Mouse</Text>
              <Text style={styles.customLayoutTitle}>Tamaño y posición</Text>
              </View>
              <Text style={styles.customLayoutCount}>
                {customLayoutSlots.length ? (selectedCustomLayoutPhotos.length > 1 ? `${selectedCustomLayoutPhotos.length} fotos` : `Foto ${selectedCustomLayoutPhoto}`) : 'Sin foto'}
              </Text>
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
          </View> : null}

          {activeCustomMenu === 'list' ? <View style={styles.customLayoutCard}>
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
                const selected = selectedCustomLayoutPhotos.includes(photoNumber)
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
                      onPress={() => selectCustomLayoutPhoto(photoNumber)}
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
          </View> : null}

          <Pressable
            onPress={async () => {
              setFinalPhotoUrl('')
              clearSavedPhoto()
              setRetakeFrameIndex(null)
              setSelectedCustomLayoutPhotos(selectedCustomLayoutPhotos.length ? selectedCustomLayoutPhotos : [selectedCustomLayoutPhoto])
              saveCurrentSetupToRecentEvents('Layout manual guardado en el evento.')
              if (photoFrames.length >= selectedShotCount) {
                setCaptureStatus('Layout manual guardado. Actualizando resultado final...')
                const output = await composeFinalPhoto(photoFrames)
                setFinalPhotoUrl(output)
                setCaptureStatus('Layout manual guardado y resultado actualizado.')
              } else {
                setCaptureStatus('Layout manual guardado. Toma o repite las fotos para generar el resultado actualizado.')
              }
              setShowCustomPhotoLayoutScreen(false)
              updateAppRoute('configurar-evento')
            }}
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

    const hasAnimationVideo = Boolean(animationOverlay.videoUrl || animationVideoUrl)
    const isBeforeCountdown = animationOverlay.stage === 'beforeCountdown'
    const isAfterCapture = animationOverlay.stage === 'afterCapture'
    const fallbackTitle = isBeforeCountdown ? 'SONRÍE' : isAfterCapture ? 'GENIAL' : 'LISTO'
    const stageKicker = isBeforeCountdown ? 'DI QUESO' : isAfterCapture ? 'QUEDÓ' : 'VIRALCO'
    const stageFooter = isBeforeCountdown ? 'Prepárate para brillar' : isAfterCapture ? 'Foto guardada' : 'Armando recuerdo'

    return (
      <View style={[styles.animationOverlay, isBeforeCountdown && styles.animationOverlayBefore]}>
        <View style={[styles.animationHalo, (isBeforeCountdown || isAfterCapture) && styles.animationHaloLarge, animationOverlay.mode === 'confeti' && styles.animationHaloConfetti]} />
        <View style={[styles.animationCard, (isBeforeCountdown || isAfterCapture) && styles.animationCardImmersive, animationOverlay.mode === 'destello' && styles.animationCardLight]}>
          {hasAnimationVideo ? (
            React.createElement('video', {
              src: animationOverlay.videoUrl || animationVideoUrl,
              autoPlay: true,
              muted: true,
              playsInline: true,
              loop: true,
              style: {
                width: '100%',
                height: isBeforeCountdown || isAfterCapture ? 'clamp(260px, 52svh, 680px)' : 150,
                objectFit: 'cover',
                display: 'block',
                borderRadius: 8,
                marginBottom: isBeforeCountdown || isAfterCapture ? 20 : 12,
              },
            })
          ) : (
            React.createElement(
              'div',
              { className: `viralco-capture-effect viralco-capture-effect-${animationOverlay.mode || 'base'} viralco-capture-stage-${animationOverlay.stage || 'processing'}` },
              React.createElement('div', { className: 'viralco-effect-scanline' }),
              React.createElement('div', { className: 'viralco-effect-orbit viralco-effect-orbit-one' }),
              React.createElement('div', { className: 'viralco-effect-orbit viralco-effect-orbit-two' }),
              React.createElement('span', { className: 'viralco-effect-spark viralco-effect-spark-a' }),
              React.createElement('span', { className: 'viralco-effect-spark viralco-effect-spark-b' }),
              React.createElement('span', { className: 'viralco-effect-spark viralco-effect-spark-c' }),
              React.createElement('span', { className: 'viralco-effect-spark viralco-effect-spark-d' }),
              React.createElement('span', { className: 'viralco-effect-spark viralco-effect-spark-e' }),
              React.createElement(
                'div',
                { className: 'viralco-effect-triangle' },
                React.createElement('div', { className: 'viralco-effect-triangle-glow' }),
                React.createElement('div', { className: 'viralco-effect-kicker' }, stageKicker),
                React.createElement(
                  'div',
                  { className: 'viralco-effect-camera' },
                  React.createElement('div', { className: 'viralco-effect-camera-top' }),
                  React.createElement('div', { className: 'viralco-effect-camera-lens' }),
                ),
                React.createElement('div', { className: 'viralco-effect-caption' }, fallbackTitle),
                React.createElement('div', { className: 'viralco-effect-footer' }, stageFooter),
              ),
            )
          )}
          {isBeforeCountdown || isAfterCapture ? null : <Text style={styles.animationTitle}>{animationOverlay.title}</Text>}
          <Text style={[styles.animationText, (isBeforeCountdown || isAfterCapture) && styles.animationTextPill]}>{animationOverlay.text}</Text>
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
        <View style={[styles.flowStepPage, isPhone && styles.flowStepPagePhone]}>
          <View style={[styles.flowStepHeader, isMobile && styles.flowStepHeaderMobile, isPhone && styles.flowStepHeaderPhone]}>
            <View>
              <Text style={styles.panelEyebrow}>Antes de tomar fotos</Text>
              <Text style={[styles.flowStepTitle, isMobile && styles.flowStepTitleMobile, isPhone && styles.flowStepTitlePhone]}>Video de animación</Text>
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
      <View style={[styles.flowStepPage, isPhone && styles.flowStepPagePhone]}>
        <View style={[styles.flowStepHeader, isMobile && styles.flowStepHeaderMobile, isPhone && styles.flowStepHeaderPhone]}>
          <View>
            <Text style={styles.panelEyebrow}>Antes de tomar fotos</Text>
            <Text style={[styles.flowStepTitle, isMobile && styles.flowStepTitleMobile, isPhone && styles.flowStepTitlePhone]}>Video de animación</Text>
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

  const renderCamera = (shellStyle = null, onPress = null, showBadge = true, showLiveFrame = false) => {
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
      {showLiveFrame ? (
        <>
          {renderLiveCaptureFrameOverlay()}
          <View style={styles.safeFrame} />
        </>
      ) : <View style={styles.safeFrame} />}
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

    const promptText = cameraOpening
      ? 'Abriendo cámara'
      : Number.isInteger(retakeFrameIndex)
        ? `Oprimir para repetir foto ${retakeFrameIndex + 1}`
      : framesReady
        ? 'Oprimir para tomar la siguiente foto'
        : 'Oprimir para tomar fotos'
    const actionText = cameraOpening ? 'Abriendo' : Number.isInteger(retakeFrameIndex) ? 'Repetir' : framesReady ? 'Siguiente' : 'Tomar'
    const helperText = cameraOpening ? 'cámara' : Number.isInteger(retakeFrameIndex) ? `foto ${retakeFrameIndex + 1}` : framesReady ? 'foto' : 'fotos'
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
        {(cameraOpening || captureStatus) ? (
          <Text style={styles.captureStartHint}>
            {cameraOpening ? 'Revisa el permiso de cámara del navegador.' : captureStatus}
          </Text>
        ) : null}
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
                        max: 8,
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

  const renderLaunchIntroScreen = () => {
    const configuredStartVideo = animationStageVideos.start && !animationStageVideos.start.isExample
      ? animationStageVideos.start
      : null
    const startVideoUrl = configuredStartVideo?.url || animationVideoUrl

    return (
      <Pressable
        onPress={startLaunchIntroExperience}
        style={styles.launchIntroPage}
        accessibilityRole="button"
        accessibilityLabel="Tocar para iniciar experiencia de fotos"
      >
        {startVideoUrl ? (
          React.createElement('video', {
            src: startVideoUrl,
            autoPlay: true,
            loop: true,
            muted: true,
            playsInline: true,
            className: 'viralco-launch-video',
          })
        ) : (
          <>
            <View style={styles.launchIntroTopDot} />
            <View style={styles.launchIntroGlow} />
            {React.createElement(
              'div',
              { className: 'viralco-launch-camera', 'aria-hidden': 'true' },
              React.createElement('div', { className: 'viralco-camera-top' }),
              React.createElement('div', { className: 'viralco-camera-button viralco-camera-button-left' }),
              React.createElement('div', { className: 'viralco-camera-button viralco-camera-button-right' }),
              React.createElement(
                'div',
                { className: 'viralco-camera-body' },
                React.createElement('div', { className: 'viralco-camera-flash' }),
                React.createElement('div', { className: 'viralco-camera-side viralco-camera-side-left' }),
                React.createElement('div', { className: 'viralco-camera-side viralco-camera-side-right' }),
                React.createElement(
                  'div',
                  { className: 'viralco-camera-lens' },
                  React.createElement('div', { className: 'viralco-camera-lens-glow' }),
                  React.createElement('div', { className: 'viralco-camera-diamond' }),
                ),
              ),
            )}
            <View style={styles.launchIntroPrompt}>
              <Text style={styles.launchIntroPromptTop}>Toca para</Text>
              <Text style={styles.launchIntroPromptMain}>empezar</Text>
            </View>
          </>
        )}
      </Pressable>
    )
  }

  const renderCapturePhotoScreen = () => (
    <View style={styles.mirrorCapturePage}>
      {renderCamera(styles.mirrorCameraShell, runCountdownAndCapture, false, true)}
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

  const renderPreviewOutput = (emptyTitle, emptyText, extraStyle = null) => (
    <View
      style={[
        styles.outputPreview,
        finalPhotoUrl && styles.outputPreviewFinal,
        finalPhotoUrl && { aspectRatio: selectedType.width / selectedType.height },
        extraStyle,
      ]}
    >
      {finalPhotoUrl ? (
        <>
          <Image source={{ uri: finalPhotoUrl }} style={styles.outputImage} accessibilityLabel="Resultado final de la foto" />
          <View style={styles.previewRetakeLayer} pointerEvents="box-none">
            {getPreviewRetakeSlots()
              .filter((slot) => photoFrames[slot.index])
              .map((slot, hotspotIndex) => (
                <Pressable
                  key={`preview-retake-${slot.photoNumber}-${hotspotIndex}`}
                  onPress={() => startRetakeFrame(slot.index)}
                  style={[
                    styles.previewRetakeHotspot,
                    {
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      width: `${slot.width}%`,
                      height: `${slot.height}%`,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Volver a tomar foto ${slot.photoNumber}`}
                >
                  <View style={styles.previewRetakePill}>
                    <Text style={styles.previewRetakePillText}>Repetir foto {slot.photoNumber}</Text>
                  </View>
                </Pressable>
              ))}
          </View>
        </>
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

  const renderMirrorShareMenu = () => {
    const actions = [
      { key: 'Email', icon: '✉️', label: 'Email' },
      { key: 'SMS', icon: '💬', label: 'SMS' },
      { key: 'WhatsApp', icon: '🟢', label: 'WhatsApp' },
      { key: 'Compartir', icon: '📤', label: 'Share' },
      { key: 'QR', icon: '▣', label: 'Scan QR' },
      { key: 'Imprimir', icon: '🖨️', label: 'Print' },
    ]

    return (
      <View style={[styles.mirrorShareDock, isMobile && styles.mirrorShareDockMobile, isPhone && styles.mirrorShareDockPhone]} pointerEvents="box-none">
        {showPreviewShareMenu ? (
          <View style={[styles.mirrorShareMenu, isMobile && styles.mirrorShareMenuMobile, isPhone && styles.mirrorShareMenuPhone]}>
            {actions.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => runPreviewShareAction(action.key)}
                style={[styles.mirrorShareOption, isMobile && styles.mirrorShareOptionMobile, isPhone && styles.mirrorShareOptionPhone]}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <Text style={[styles.mirrorShareOptionIcon, isMobile && styles.mirrorShareOptionIconMobile, isPhone && styles.mirrorShareOptionIconPhone]}>{action.icon}</Text>
                <Text style={[styles.mirrorShareOptionLabel, isMobile && styles.mirrorShareOptionLabelMobile, isPhone && styles.mirrorShareOptionLabelPhone]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Pressable
          onPress={() => setShowPreviewShareMenu((value) => !value)}
          style={[styles.mirrorShareToggle, isMobile && styles.mirrorShareToggleMobile, isPhone && styles.mirrorShareTogglePhone, showPreviewShareMenu && styles.mirrorShareToggleOpen]}
          accessibilityRole="button"
          accessibilityLabel={showPreviewShareMenu ? 'Cerrar menú de compartir' : 'Abrir menú de compartir'}
        >
          {showPreviewShareMenu ? (
            <Text style={styles.mirrorShareToggleClose}>×</Text>
          ) : (
            <View style={styles.mirrorShareHamburger}>
              <View style={styles.mirrorShareHamburgerLine} />
              <View style={styles.mirrorShareHamburgerLine} />
              <View style={styles.mirrorShareHamburgerLine} />
            </View>
          )}
        </Pressable>
      </View>
    )
  }

  const renderEventGalleryThumb = () =>
    latestEventGalleryPhoto ? (
      <Pressable
        onPress={() => {
          openEventGallery(eventGalleryId)
        }}
        style={[styles.eventGalleryThumbButton, isMobile && styles.eventGalleryThumbButtonMobile, isPhone && styles.eventGalleryThumbButtonPhone]}
        accessibilityRole="button"
        accessibilityLabel="Abrir galería del evento"
      >
        <Image source={{ uri: latestEventGalleryPhoto.src }} style={styles.eventGalleryThumbImage} accessibilityLabel="Última foto del evento" />
        <View style={styles.eventGalleryThumbStack} />
        <View style={styles.eventGalleryThumbCount}>
          <Text style={styles.eventGalleryThumbCountText}>{currentEventGallery.length}</Text>
        </View>
      </Pressable>
    ) : null

  const renderEventGalleryModal = () => {
    const selectedFolder = selectedGalleryId
      ? visibleGalleryFolders.find((folder) => folder.id === selectedGalleryId)
      : null
    const modalGalleryItems = selectedFolder?.items || (selectedGalleryId ? (eventGalleries[selectedGalleryId]?.items || []) : currentEventGallery)
    const modalGalleryTitle = selectedFolder?.eventName || eventGalleries[selectedGalleryId]?.eventName || eventTitle
    const selectedPrintIdSet = new Set(selectedGalleryPrintIds)
    const selectedPrintItems = modalGalleryItems.filter((photo, index) => selectedPrintIdSet.has(getGalleryPhotoKey(photo, index)))
    const allGallerySelected = modalGalleryItems.length > 0 && selectedPrintItems.length === modalGalleryItems.length

    return showEventGallery ? (
      <View style={styles.eventGalleryOverlay}>
        <Pressable onPress={closeEventGallery} style={styles.eventGalleryBackdrop} />
        <View style={[styles.eventGalleryPanel, isMobile && styles.eventGalleryPanelMobile]}>
          <View style={[styles.eventGalleryHeader, isMobile && styles.eventGalleryHeaderMobile]}>
            <View>
              <Text style={styles.eventGalleryEyebrow}>Galería del evento</Text>
              <Text style={[styles.eventGalleryTitle, isMobile && styles.eventGalleryTitleMobile]}>{modalGalleryTitle}</Text>
              <Text style={styles.eventGalleryMeta}>
                {modalGalleryItems.length} foto{modalGalleryItems.length === 1 ? '' : 's'} guardada{modalGalleryItems.length === 1 ? '' : 's'}
                {selectedPrintItems.length ? ` · ${selectedPrintItems.length} en cola` : ''}
              </Text>
            </View>
            <Pressable onPress={closeEventGallery} style={[styles.eventGalleryClose, isMobile && styles.eventGalleryCloseMobile]}>
              <Text style={[styles.eventGalleryCloseText, isMobile && styles.eventGalleryCloseTextMobile]}>×</Text>
            </Pressable>
          </View>
          <View style={[styles.eventGalleryActionBar, isPhone && styles.eventGalleryActionBarPhone]}>
            <View style={styles.eventGallerySelectionPill}>
              <Text style={styles.eventGallerySelectionText}>
                {selectedPrintItems.length ? `${selectedPrintItems.length} seleccionada${selectedPrintItems.length === 1 ? '' : 's'}` : 'Toca fotos para imprimir'}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setSelectedGalleryPrintIds(allGallerySelected ? [] : modalGalleryItems.map((photo, index) => getGalleryPhotoKey(photo, index)))
              }}
              style={styles.eventGalleryActionButton}
              accessibilityRole="button"
            >
              <Text style={styles.eventGalleryActionButtonText}>{allGallerySelected ? 'Limpiar' : 'Todas'}</Text>
            </Pressable>
            <Pressable
              onPress={() => printGalleryQueue(selectedPrintItems)}
              disabled={!selectedPrintItems.length}
              style={[styles.eventGalleryPrimaryActionButton, !selectedPrintItems.length && styles.eventGalleryPrimaryActionButtonDisabled]}
              accessibilityRole="button"
            >
              <Text style={styles.eventGalleryPrimaryActionText}>Imprimir cola</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={[styles.eventGalleryGrid, isMobile && styles.eventGalleryGridMobile, isPhone && styles.eventGalleryGridPhone]}>
            {modalGalleryItems.map((photo, index) => {
              const photoKey = getGalleryPhotoKey(photo, index)
              const photoSelected = selectedPrintIdSet.has(photoKey)
              return (
                <Pressable
                  key={photoKey}
                  onPress={() => toggleGalleryPrintSelection(photo, index)}
                  style={[styles.eventGalleryCard, photoSelected && styles.eventGalleryCardSelected]}
                  accessibilityRole="button"
                  accessibilityLabel={`Seleccionar foto ${index + 1} para imprimir`}
                >
                  <View style={styles.eventGalleryImageWrap}>
                    <Image source={{ uri: photo.src }} style={[styles.eventGalleryImage, isMobile && styles.eventGalleryImageMobile]} accessibilityLabel={`Foto guardada ${index + 1}`} />
                    <View style={[styles.eventGallerySelectBadge, photoSelected && styles.eventGallerySelectBadgeActive]}>
                      <Text style={[styles.eventGallerySelectBadgeText, photoSelected && styles.eventGallerySelectBadgeTextActive]}>{photoSelected ? '✓' : '+'}</Text>
                    </View>
                  </View>
                  <View style={styles.eventGalleryCardFooter}>
                    <Text style={styles.eventGalleryCardTitle}>Foto {modalGalleryItems.length - index}</Text>
                    <Text style={styles.eventGalleryCardText}>{photo.photoType}</Text>
                    <View style={styles.eventGalleryCardActions}>
                      <Pressable
                        onPress={(event) => {
                          event?.stopPropagation?.()
                          setFinalPhotoUrl(photo.localUrl || photo.src)
                          if (photo.publicUrl) {
                            setSavedPhotoUrl(photo.publicUrl)
                            setQrPhotoUrl(photo.publicUrl)
                          }
                          closeEventGallery()
                        }}
                        style={styles.eventGalleryMiniButton}
                        accessibilityRole="button"
                      >
                        <Text style={styles.eventGalleryMiniButtonText}>Ver</Text>
                      </Pressable>
                      <Pressable
                        onPress={(event) => {
                          event?.stopPropagation?.()
                          printGalleryQueue([photo])
                        }}
                        style={[styles.eventGalleryMiniButton, styles.eventGalleryMiniButtonPrimary]}
                        accessibilityRole="button"
                      >
                        <Text style={[styles.eventGalleryMiniButtonText, styles.eventGalleryMiniButtonPrimaryText]}>Imprimir</Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              )
            })}
            {!modalGalleryItems.length ? (
              <View style={styles.eventGalleryEmptyState}>
                <Text style={styles.eventGalleryCardTitle}>Sin fotos guardadas</Text>
                <Text style={styles.eventGalleryCardText}>Cuando este evento tome fotos, aparecerán aquí.</Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    ) : null
  }

  const renderMirrorPreviewScreen = () => (
    <View style={styles.mirrorPreviewPage}>
      {showPreviewShareMenu ? (
        <Pressable onPress={closePreviewShareMenu} style={styles.mirrorShareScrim} />
      ) : null}
      <View style={[styles.mirrorPreviewStage, isMobile && styles.mirrorPreviewStageMobile, isShortScreen && styles.mirrorPreviewStageShort]}>
        {renderPreviewOutput('Preview pendiente', 'Toma la foto para ver el resultado final aquí.', [
          styles.mirrorPreviewOutput,
          isMobile && styles.mirrorPreviewOutputMobile,
          isPhone && styles.mirrorPreviewOutputPhone,
          isShortScreen && styles.mirrorPreviewOutputShort,
        ])}
      </View>

      <View style={[styles.mirrorTopBar, styles.mirrorPreviewTopBar, isMobile && styles.mirrorTopBarMobile, isMobile && styles.mirrorPreviewTopBarMobile]}>
        <View style={styles.mirrorTopInfo}>
          <View style={styles.mirrorBrandRow}>
            <Text style={styles.mirrorBrandText}>Viralco</Text>
            <Text style={styles.mirrorStepText}>Ventana 4</Text>
          </View>
          <Text style={[styles.mirrorTitle, isMobile && styles.mirrorTitleMobile, isMobile && styles.mirrorPreviewTitleMobile]}>Preview</Text>
          <Text style={[styles.mirrorSubText, isMobile && styles.mirrorPreviewSubTextMobile]}>{eventTitle} / {selectedType.name}</Text>
        </View>
        <View style={[styles.mirrorPreviewTopActions, isMobile && styles.mirrorPreviewTopActionsMobile]}>
          <Pressable
            onPress={returnToHomeScreen}
            style={[styles.mirrorPreviewHomeButton, isMobile && styles.mirrorPreviewHomeButtonMobile]}
            accessibilityRole="button"
            accessibilityLabel="Volver a pantalla principal"
          >
            <Text style={[styles.mirrorPreviewHomeButtonText, isMobile && styles.mirrorPreviewHomeButtonTextMobile]}>
              {isMobile ? 'Inicio' : '← Inicio'}
            </Text>
          </Pressable>
          <View style={[styles.mirrorStatusPill, styles.mirrorPreviewStatusPill]}>
            <Text style={[styles.mirrorStatusText, isMobile && styles.mirrorPreviewStatusTextMobile]}>{framesReady}/{selectedShotCount}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.mirrorPreviewActions, isMobile && styles.mirrorPreviewActionsMobile, isPhone && styles.mirrorPreviewActionsPhone]}>
        <Pressable
          onPress={() => {
            resetPhoto()
            openCapturePhotoScreen()
          }}
          style={[styles.mirrorPreviewSecondaryButton, isMobile && styles.mirrorPreviewButtonMobile]}
          accessibilityRole="button"
          accessibilityLabel="Tomar otra foto"
        >
          <Text style={[styles.mirrorPreviewSecondaryText, isMobile && styles.mirrorPreviewButtonTextMobile]}>+ Otra foto</Text>
        </Pressable>
      </View>
      {renderEventGalleryThumb()}
      {renderMirrorShareMenu()}
      {renderEventGalleryModal()}
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
          { key: 'QR', title: 'QR', helper: 'Abrir foto final', icon: 'QR' },
          { key: 'Imprimir', title: 'Imprimir', helper: `${activePrintLabel} · ${normalizedPrintSettings.copies} copia${normalizedPrintSettings.copies === 1 ? '' : 's'}`, icon: 'IMP' },
          { key: 'WhatsApp', title: 'WhatsApp', helper: 'Compartir imagen final', icon: 'WA' },
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
            <Text style={styles.qrOptionsTitle}>QR de la foto final</Text>
          </View>
          <Pressable onPress={() => setShowQrOptions(false)} style={styles.qrOptionsClose}>
            <Text style={styles.qrOptionsCloseText}>×</Text>
          </Pressable>
        </View>
        <View style={styles.qrImageFrame}>
          <Image source={{ uri: qrImageUrl }} style={styles.qrImage} accessibilityLabel="Código QR para abrir la foto del cliente" />
        </View>
        <Text style={styles.qrOptionsEvent}>{eventTitle}</Text>
        <Text style={styles.qrOptionsText}>El cliente escanea este código y abre directamente la imagen final.</Text>
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
    captureComplete ? renderMirrorPreviewScreen() : (
      <View style={[styles.flowStepPage, isPhone && styles.flowStepPagePhone]}>
        <View style={[styles.flowStepHeader, isMobile && styles.flowStepHeaderMobile, isPhone && styles.flowStepHeaderPhone]}>
          <View>
            <Text style={styles.panelEyebrow}>Ventana 4</Text>
            <Text style={[styles.flowStepTitle, isMobile && styles.flowStepTitleMobile, isPhone && styles.flowStepTitlePhone]}>Preview</Text>
            <Text style={styles.flowStepText}>Revisa el resultado antes de compartir o imprimir.</Text>
          </View>
        </View>

        <View style={styles.previewOnlyBody}>
          {renderPreviewOutput('Preview pendiente', 'Toma la foto para ver el resultado final aquí.', styles.previewMainOutput)}
          <Text style={styles.captureStatus}>{captureStatus}</Text>
        </View>
      </View>
    )
  )

  const renderShareScreen = () => (
    <View style={[styles.flowStepPage, isPhone && styles.flowStepPagePhone]}>
      <View style={[styles.flowStepHeader, isMobile && styles.flowStepHeaderMobile, isPhone && styles.flowStepHeaderPhone]}>
        <View>
          <Text style={styles.panelEyebrow}>Ventana 5</Text>
          <Text style={[styles.flowStepTitle, isMobile && styles.flowStepTitleMobile, isPhone && styles.flowStepTitlePhone]}>Compartir</Text>
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
          <Pressable onPress={() => openCaptureConfigScreen(false)} style={styles.editorNextButton}>
            <Text style={styles.editorNextButtonText}>Configuración de captura →</Text>
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
                window.open('https://wa.me/', '_blank', 'noopener,noreferrer')
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
            max: 8,
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

  const renderCaptureConfigPreview = () => {
    const slots = getSelectedTypeLayoutSlots()
    const frameSource = overlayImageUrl ? { uri: overlayImageUrl } : selectedTemplate.image
    const usesManualText = selectedType.id.startsWith('personalizar')

    return (
      <View style={[styles.photoConfigCard, styles.capturePreviewConfigCard]}>
        <View style={styles.capturePreviewConfigHeader}>
          <View>
            <Text style={styles.photoConfigTitle}>Vista previa de foto</Text>
            <Text style={styles.capturePreviewConfigMeta}>
              {selectedType.name} / {selectedTemplate.name} / {slots.length || selectedShotCount} foto{(slots.length || selectedShotCount) === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.capturePreviewConfigCanvas,
            { aspectRatio: selectedType.width / selectedType.height },
            isPhone && styles.capturePreviewConfigCanvasPhone,
          ]}
        >
          <Image source={frameSource} style={styles.capturePreviewConfigFrame} accessibilityLabel={`Vista previa de ${selectedTemplate.name}`} />
          <View style={styles.capturePreviewConfigSoftWash} />
          {usesManualText ? renderCustomTextPreviewLayers(false) : (
            <View style={styles.capturePreviewConfigEventText}>
              <Text style={styles.capturePreviewConfigEventName}>{eventTitle}</Text>
              <Text style={styles.capturePreviewConfigEventMeta}>{selectedType.name}</Text>
            </View>
          )}
          {slots.length ? slots.map((slot) => (
            <View
              key={`capture-config-preview-${slot.photoNumber}`}
              style={[
                styles.capturePreviewConfigSlot,
                {
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  width: `${slot.width}%`,
                  height: `${slot.height}%`,
                },
              ]}
            >
              <Text style={styles.capturePreviewConfigSlotNumber}>{slot.photoNumber}</Text>
              <Text style={styles.capturePreviewConfigSlotLabel}>Foto</Text>
            </View>
          )) : (
            <View style={styles.capturePreviewConfigEmpty}>
              <Text style={styles.capturePreviewConfigEmptyText}>Agrega recuadros para ver el diseño.</Text>
            </View>
          )}
        </View>
      </View>
    )
  }

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
          <Text style={styles.activeToolText}>
            {captureStatus.toLowerCase().includes('gif') ? 'Configuración de captura lista para fotos.' : captureStatus}
          </Text>
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
                max: 8,
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

        </View>

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

        </View>

        {renderCaptureConfigPreview()}
      </View>

      <View style={[styles.captureModeFooter, styles.captureConfigSimpleFooter, isMobile && styles.captureModeFooterMobile]}>
        <Pressable onPress={saveCaptureConfigAndReturn} style={[styles.captureModeFooterPrimaryButton, styles.captureConfigSaveButton, isMobile && styles.captureModeFooterPrimaryButtonMobile]}>
          <Text style={[styles.captureModeFooterPrimaryText, isMobile && styles.captureModeFooterTextMobile]}>
            Guardar y volver
          </Text>
        </Pressable>
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
          <Text style={styles.activeToolText}>
            {captureStatus.match(/4x6|5 x 15|10 x 20|15 x 20|manual/i)
              ? 'Medida de impresora seleccionada: 10 x 15 (10 x 15 cm).'
              : captureStatus}
          </Text>
        </View>
        {renderPrintSettingsMenu()}
      </View>

      <View style={[styles.captureModeFooter, styles.captureConfigSimpleFooter, isMobile && styles.captureModeFooterMobile]}>
        <Pressable onPress={savePrintConfigAndReturn} style={[styles.captureModeFooterPrimaryButton, styles.captureConfigSaveButton, isMobile && styles.captureModeFooterPrimaryButtonMobile]}>
          <Text style={[styles.captureModeFooterPrimaryText, isMobile && styles.captureModeFooterTextMobile]}>
            Guardar y volver
          </Text>
        </Pressable>
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
              clearSavedPhoto()
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
        <ScrollView style={styles.configScrollView} contentContainerStyle={[styles.pageContent, isPhone && styles.pageContentPhone]}>
          {renderStartEditor()}
        </ScrollView>
      </View>
    )
  }

  if (showPhotoDesignScreen) {
    return (
      <View style={styles.page}>
        <ScrollView style={styles.configScrollView} contentContainerStyle={[styles.pageContent, isPhone && styles.pageContentPhone]}>
          {renderPhotoDesignScreen()}
        </ScrollView>
      </View>
    )
  }

  if (showCaptureModeScreen) {
    return (
      <View style={styles.page}>
        <ScrollView style={styles.configScrollView} contentContainerStyle={[styles.pageContent, isPhone && styles.pageContentPhone]}>
          {renderCaptureModeScreen()}
        </ScrollView>
      </View>
    )
  }

  if (showCaptureConfigScreen) {
    return (
      <View style={styles.page}>
        <ScrollView
          style={styles.configScrollView}
          contentContainerStyle={[styles.captureConfigScrollContent, isPhone && styles.captureConfigScrollContentPhone]}
        >
          {renderCaptureConfigScreen()}
        </ScrollView>
        {renderHiddenHomeButton()}
      </View>
    )
  }

  if (showPrintConfigScreen) {
    return (
      <View style={styles.page}>
        <ScrollView style={styles.configScrollView} contentContainerStyle={[styles.pageContent, isPhone && styles.pageContentPhone]}>
          {renderPrintConfigScreen()}
        </ScrollView>
      </View>
    )
  }

  if (showBackgroundRemovalScreen) {
    return (
      <View style={styles.page}>
        <ScrollView style={styles.configScrollView} contentContainerStyle={[styles.pageContent, isPhone && styles.pageContentPhone]}>
          {renderBackgroundRemovalScreen()}
        </ScrollView>
        {renderHiddenHomeButton()}
      </View>
    )
  }

  if (showHomeLauncher) {
    return (
      <View style={styles.page}>
        <ScrollView style={styles.configScrollView} contentContainerStyle={[styles.pageContent, isPhone && styles.pageContentPhone, styles.homePageContent, isPhone && styles.homePageContentPhone]}>
          {renderHomeLauncher()}
        </ScrollView>
        {renderEventGalleryModal()}
        {showCreateEventModal && renderCreateEventModal()}
        {renderHiddenHomeButton()}
      </View>
    )
  }

  if (showCustomPhotoLayoutScreen) {
    return (
      <View style={styles.page}>
        <ScrollView
          style={styles.configScrollView}
          contentContainerStyle={[
            styles.customLayoutScrollContent,
            isPhone && styles.pageContentPhone,
            isPortraitMirrorScreen && styles.customLayoutScrollContentPortrait,
          ]}
        >
          {renderCustomPhotoLayoutScreen()}
        </ScrollView>
        {renderHiddenHomeButton()}
      </View>
    )
  }

  if (showEventOptionsScreen) {
    if (showCustomPhotoLayoutScreen) {
      return (
        <View style={styles.page}>
          <ScrollView
            style={styles.configScrollView}
            contentContainerStyle={[
              styles.customLayoutScrollContent,
              isPhone && styles.pageContentPhone,
              isPortraitMirrorScreen && styles.customLayoutScrollContentPortrait,
            ]}
          >
            {renderCustomPhotoLayoutScreen()}
          </ScrollView>
          {renderHiddenHomeButton()}
        </View>
      )
    }

    return (
      <View style={styles.page}>
        <ScrollView style={styles.configScrollView} contentContainerStyle={[styles.pageContent, isPhone && styles.pageContentPhone]}>
          {renderEventOptionsScreen()}
        </ScrollView>
        {showCreateEventModal && renderCreateEventModal()}
        {renderHiddenHomeButton()}
      </View>
    )
  }

  if (showAnimationVideoScreen) {
    return (
      <View style={styles.page}>
        <ScrollView style={styles.configScrollView} contentContainerStyle={[styles.pageContent, isPhone && styles.pageContentPhone]}>
          {renderAnimationVideoScreen()}
        </ScrollView>
        {renderHiddenHomeButton()}
      </View>
    )
  }

  if (showLaunchIntroScreen) {
    return (
      <View style={styles.page}>
        {renderLaunchIntroScreen()}
        {renderHiddenHomeButton()}
      </View>
    )
  }

  if (showCapturePhotoScreen) {
    return (
      <View style={styles.page}>
        <ScrollView style={styles.configScrollView} contentContainerStyle={styles.mirrorPageContent}>
          {renderCapturePhotoScreen()}
        </ScrollView>
        {renderHiddenHomeButton()}
      </View>
    )
  }

  if (showPreviewScreen) {
    return (
      <View style={styles.page}>
        <ScrollView style={styles.configScrollView} contentContainerStyle={[styles.pageContent, isPhone && styles.pageContentPhone]}>
          {renderPreviewScreen()}
        </ScrollView>
        {showPrintOptions && renderPrintOptionsModal()}
        {showQrOptions && renderQrOptionsModal()}
        {renderHiddenHomeButton()}
      </View>
    )
  }

  if (showShareScreen) {
    return (
      <View style={styles.page}>
        <ScrollView style={styles.configScrollView} contentContainerStyle={[styles.pageContent, isPhone && styles.pageContentPhone]}>
          {renderShareScreen()}
        </ScrollView>
        {showPrintOptions && renderPrintOptionsModal()}
        {showQrOptions && renderQrOptionsModal()}
        {renderHiddenHomeButton()}
      </View>
    )
  }

  return (
    <View style={styles.page}>
      <ScrollView style={styles.configScrollView} contentContainerStyle={[styles.pageContent, isPhone && styles.pageContentPhone, styles.homePageContent, isPhone && styles.homePageContentPhone]}>
        {renderHomeLauncher()}
      </ScrollView>
      {renderEventGalleryModal()}
      {showCreateEventModal && renderCreateEventModal()}
      {renderHiddenHomeButton()}
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
  hiddenHomeButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 99999,
    width: 56,
    height: 56,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 10,
  },
  hiddenHomeButtonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.rose,
    opacity: 0.12,
  },
  pageContent: {
    height: 'auto',
    minHeight: '100svh',
    padding: 'clamp(10px, 2svh, 18px)',
    paddingBottom: 'clamp(90px, 12svh, 180px)',
    overflow: 'visible',
  },
  pageContentPhone: {
    height: 'auto',
    minHeight: '100svh',
    padding: 8,
    paddingTop: 8,
    paddingBottom: 8,
    overflow: 'visible',
  },
  configScrollView: {
    height: '100svh',
    width: '100vw',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  captureConfigScrollContent: {
    minHeight: '100svh',
    padding: 'clamp(10px, 2svh, 18px)',
    paddingBottom: 160,
    overflow: 'visible',
  },
  captureConfigScrollContentPhone: {
    padding: 8,
    paddingBottom: 170,
  },
  customLayoutScrollContent: {
    height: 'auto',
    minHeight: '100svh',
    padding: 'clamp(10px, 2svh, 18px)',
    paddingBottom: 220,
    overflow: 'visible',
  },
  customLayoutScrollContentPortrait: {
    height: 'auto',
    minHeight: '100svh',
    padding: 10,
    paddingBottom: 190,
    overflow: 'visible',
  },
  homePageContent: {
    height: 'auto',
    minHeight: '100svh',
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 'clamp(12px, 2svh, 28px) clamp(18px, 4vw, 56px)',
    paddingBottom: 'clamp(16px, 2.5svh, 32px)',
  },
  homePageContentPhone: {
    justifyContent: 'flex-start',
    padding: 10,
    paddingTop: 14,
    paddingBottom: 12,
  },
  mirrorPageContent: {
    minHeight: '100vh',
    padding: 0,
    backgroundColor: colors.dark,
  },
  profileSwitcher: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    boxShadow: '0 10px 22px rgba(15,23,42,0.07)',
  },
  profileSwitcherPhone: {
    padding: 8,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
  },
  profileSwitcherHeader: {
    gap: 1,
    flexShrink: 0,
  },
  profileSwitcherEyebrow: {
    color: colors.blue,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '950',
    textTransform: 'uppercase',
  },
  profileSwitcherActive: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '950',
  },
  profileSwitcherOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  profileSwitcherOptionsPhone: {
    justifyContent: 'stretch',
    gap: 6,
  },
  profileChip: {
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    cursor: 'pointer',
  },
  profileChipPhone: {
    flex: 1,
    minHeight: 36,
    paddingHorizontal: 8,
  },
  profileChipActive: {
    borderColor: colors.blue,
    backgroundColor: colors.blue,
    boxShadow: '0 10px 22px rgba(10,77,232,0.22)',
  },
  profileChipText: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  profileChipTextActive: {
    color: '#ffffff',
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
    maxWidth: 1120,
    minHeight: 'calc(100svh - clamp(28px, 4svh, 56px))',
    alignSelf: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    paddingBottom: 0,
    gap: 'clamp(10px, 1.35svh, 18px)',
  },
  homeLauncherPagePhone: {
    height: 'auto',
    minHeight: 'calc(100svh - 24px)',
    gap: 10,
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
    fontSize: 'clamp(40px, 4.9svh, 68px)',
    lineHeight: 'clamp(47px, 5.5svh, 76px)',
    fontWeight: '900',
    textAlign: 'center',
  },
  homeWelcomePhone: {
    fontSize: 38,
    lineHeight: 43,
  },
  homeWelcomeSub: {
    color: colors.muted,
    fontSize: 'clamp(17px, 2svh, 26px)',
    lineHeight: 'clamp(23px, 2.6svh, 32px)',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 0,
  },
  homeWelcomeSubPhone: {
    fontSize: 16,
    lineHeight: 21,
  },
  recentEventsPanel: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 'clamp(14px, 1.8svh, 24px)',
    gap: 'clamp(10px, 1.25svh, 16px)',
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
  },
  recentEventsPanelPhone: {
    padding: 10,
    gap: 10,
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
    fontSize: 'clamp(15px, 1.7svh, 20px)',
    lineHeight: 'clamp(20px, 2.25svh, 27px)',
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
    minHeight: 'clamp(330px, 42svh, 460px)',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: colors.line,
    boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
  },
  recentEventCardPhone: {
    minHeight: 390,
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
    minHeight: '100%',
    padding: 'clamp(22px, 2.6svh, 36px)',
    justifyContent: 'space-between',
    gap: 'clamp(12px, 1.4svh, 18px)',
  },
  recentEventTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  recentEventMeta: {
    alignSelf: 'flex-start',
    minHeight: 'clamp(32px, 3.3svh, 44px)',
    borderRadius: 22,
    backgroundColor: colors.roseSoft,
    color: colors.rose,
    fontSize: 'clamp(14px, 1.6svh, 18px)',
    lineHeight: 'clamp(32px, 3.3svh, 44px)',
    fontWeight: '900',
    paddingHorizontal: 'clamp(14px, 1.8vw, 22px)',
  },
  recentEventProfile: {
    color: colors.muted,
    fontSize: 'clamp(12px, 1.4svh, 16px)',
    lineHeight: 'clamp(16px, 1.9svh, 21px)',
    fontWeight: '900',
    textAlign: 'right',
  },
  recentEventTitle: {
    color: colors.ink,
    fontSize: 'clamp(30px, 4svh, 52px)',
    lineHeight: 'clamp(37px, 4.7svh, 60px)',
    fontWeight: '900',
  },
  recentEventDetails: {
    color: colors.muted,
    fontSize: 'clamp(17px, 2svh, 24px)',
    lineHeight: 'clamp(24px, 2.7svh, 32px)',
    fontWeight: '700',
  },
  recentEventDataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  recentEventDataItem: {
    minHeight: 74,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  recentEventDataLabel: {
    color: colors.rose,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '950',
    textTransform: 'uppercase',
  },
  recentEventDataValue: {
    color: colors.ink,
    fontSize: 'clamp(14px, 1.7svh, 18px)',
    lineHeight: 'clamp(18px, 2.1svh, 23px)',
    fontWeight: '900',
    marginTop: 4,
  },
  launchRecentButton: {
    minHeight: 'clamp(58px, 7svh, 86px)',
    borderRadius: 43,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flex: 1,
    boxShadow: '0 8px 14px rgba(10,77,232,0.28)',
  },
  launchRecentButtonText: {
    color: '#ffffff',
    fontSize: 'clamp(18px, 2.1svh, 26px)',
    fontWeight: '900',
  },
  recentEventActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editRecentButton: {
    minHeight: 'clamp(58px, 7svh, 86px)',
    borderRadius: 43,
    borderWidth: 2,
    borderColor: colors.blue,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flex: 0.55,
  },
  editRecentButtonText: {
    color: colors.blue,
    fontSize: 'clamp(16px, 1.8svh, 22px)',
    fontWeight: '900',
    textAlign: 'center',
  },
  secondaryEventsPanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    padding: 14,
    gap: 10,
  },
  secondaryEventsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryEventsTitle: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  secondaryEventsList: {
    gap: 8,
  },
  secondaryEventRow: {
    minHeight: 68,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryEventRowActive: {
    borderColor: colors.blue,
    backgroundColor: '#eff6ff',
  },
  secondaryEventIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.roseSoft,
    color: colors.rose,
    fontSize: 14,
    lineHeight: 34,
    fontWeight: '950',
    textAlign: 'center',
    flexShrink: 0,
  },
  secondaryEventCopy: {
    flex: 1,
    minWidth: 0,
  },
  secondaryEventName: {
    color: colors.ink,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  secondaryEventMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '750',
    marginTop: 2,
  },
  secondaryEventEditButton: {
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.blue,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    flexShrink: 0,
  },
  secondaryEventEditText: {
    color: colors.blue,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  secondaryEventLaunchButton: {
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    flexShrink: 0,
  },
  secondaryEventLaunchText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  homeActionCard: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 'clamp(16px, 2svh, 28px)',
    justifyContent: 'center',
    boxShadow: '0 10px 18px rgba(15,23,42,0.08)',
  },
  homeActionCardPhone: {
    padding: 10,
  },
  homeLaunchButton: {
    minHeight: 66,
    borderRadius: 33,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    boxShadow: '0 10px 18px rgba(10,77,232,0.22)',
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
    minHeight: 'clamp(66px, 7.4svh, 92px)',
    borderRadius: 46,
    borderWidth: 2,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  homeCreateButtonText: {
    color: colors.blue,
    fontSize: 'clamp(20px, 2.3svh, 30px)',
    fontWeight: '900',
  },
  adminEventsSummary: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 'clamp(14px, 1.7svh, 22px)',
    gap: 12,
    boxShadow: '0 10px 18px rgba(15,23,42,0.06)',
  },
  adminEventsSummaryPhone: {
    padding: 10,
  },
  adminEventsSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  adminEventsSummaryTitle: {
    color: colors.ink,
    fontSize: 'clamp(22px, 2.4svh, 30px)',
    lineHeight: 'clamp(27px, 3svh, 36px)',
    fontWeight: '950',
  },
  adminEventsSummaryCount: {
    minWidth: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.roseSoft,
    color: colors.rose,
    fontSize: 20,
    lineHeight: 46,
    fontWeight: '950',
    textAlign: 'center',
  },
  adminEventsList: {
    gap: 8,
  },
  adminEventRow: {
    minHeight: 74,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    cursor: 'pointer',
  },
  adminEventRowActive: {
    borderColor: colors.rose,
    backgroundColor: colors.roseSoft,
  },
  adminEventIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.rose,
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 34,
    fontWeight: '950',
    textAlign: 'center',
    flexShrink: 0,
  },
  adminEventMain: {
    flex: 1,
    minWidth: 0,
  },
  adminEventName: {
    color: colors.ink,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '950',
  },
  adminEventMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  adminEventTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
    maxWidth: '42%',
  },
  adminEventTag: {
    minHeight: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.rose,
    fontSize: 11,
    lineHeight: 24,
    fontWeight: '900',
    paddingHorizontal: 9,
  },
  adminEventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  adminEventEditButton: {
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.rose,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    flexShrink: 0,
  },
  adminEventEditText: {
    color: colors.rose,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '950',
  },
  adminEventDeleteButton: {
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fff7f7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    flexShrink: 0,
  },
  adminEventDeleteText: {
    color: '#b91c1c',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '950',
  },
  eventFoldersPanel: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 'clamp(14px, 1.7svh, 22px)',
    gap: 14,
    boxShadow: '0 10px 18px rgba(15,23,42,0.06)',
  },
  eventFoldersPanelPhone: {
    padding: 10,
  },
  eventFoldersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
  },
  eventFoldersGridPhone: {
    display: 'flex',
  },
  eventFolderCard: {
    minHeight: 210,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    overflow: 'hidden',
    cursor: 'pointer',
  },
  eventFolderPreview: {
    position: 'relative',
    height: 132,
    backgroundColor: colors.dark,
  },
  eventFolderPreviewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  eventFolderEmptyPreview: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.roseSoft,
  },
  eventFolderEmptyIcon: {
    color: colors.rose,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '950',
  },
  eventFolderCount: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  eventFolderCountText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '950',
  },
  eventFolderInfo: {
    padding: 12,
    gap: 3,
  },
  eventFolderName: {
    color: colors.ink,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '950',
  },
  eventFolderMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
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
  eventOptionsHeaderPhone: {
    padding: 10,
    gap: 8,
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
  eventOptionsTitlePhone: {
    fontSize: 22,
    lineHeight: 27,
  },
  eventOptionsText: {
    color: colors.muted,
    fontSize: 'clamp(13px, 1.9svh, 15px)',
    lineHeight: 'clamp(18px, 2.5svh, 22px)',
    marginTop: 6,
    maxWidth: 680,
  },
  eventOptionsTextPhone: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
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
  eventOptionsBodyPhone: {
    padding: 8,
    gap: 8,
  },
  eventOptionsSection: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    padding: 'clamp(10px, 1.7svh, 14px)',
    gap: 'clamp(10px, 1.7svh, 14px)',
  },
  eventOptionsSectionPhone: {
    padding: 9,
    gap: 9,
  },
  setupPreviewSection: {
    backgroundColor: '#ffffff',
  },
  setupPreviewContent: {
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 360px) minmax(0, 1fr)',
    gap: 16,
    alignItems: 'center',
  },
  setupPreviewContentManual: {
    gridTemplateColumns: 'minmax(280px, 520px) minmax(240px, 1fr)',
  },
  setupPreviewContentMobile: {
    display: 'flex',
  },
  setupPreviewCanvas: {
    position: 'relative',
    width: '100%',
    maxHeight: 420,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: colors.blue,
    backgroundColor: colors.dark,
    boxShadow: '0 18px 42px rgba(15,23,42,0.16)',
  },
  setupPreviewCanvasMobile: {
    maxHeight: 340,
  },
  setupPreviewManualSheet: {
    minWidth: 0,
    width: '100%',
    maxWidth: 520,
    padding: 12,
    borderWidth: 2,
    borderColor: colors.rose,
    boxShadow: '0 18px 42px rgba(15,23,42,0.16)',
  },
  setupPreviewManualSheetMirror: {
    maxWidth: 640,
    gap: 6,
  },
  setupPreviewManualStrip: {
    minHeight: 0,
  },
  setupPreviewFrameImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  setupPreviewWash: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  setupPreviewEventText: {
    position: 'absolute',
    left: '7%',
    top: '6%',
    right: '7%',
    zIndex: 2,
  },
  setupPreviewEventName: {
    color: '#ffffff',
    fontSize: 'clamp(20px, 3.4vw, 30px)',
    lineHeight: 'clamp(25px, 4vw, 36px)',
    fontWeight: '950',
    textShadowColor: 'rgba(0,0,0,0.32)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  setupPreviewEventMeta: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.28)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  setupPreviewSlot: {
    position: 'absolute',
    zIndex: 3,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(224,242,254,0.76)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 26px rgba(15,23,42,0.18)',
  },
  setupPreviewSlotNumber: {
    color: colors.blue,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '950',
  },
  setupPreviewSlotLabel: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
  },
  setupPreviewEmpty: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '42%',
    minHeight: 72,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.blue,
    backgroundColor: 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  setupPreviewEmptyText: {
    color: colors.blue,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  setupPreviewInfo: {
    gap: 9,
  },
  setupPreviewInfoTitle: {
    color: colors.ink,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '950',
  },
  setupPreviewInfoText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '750',
  },
  setupPreviewStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setupPreviewStat: {
    minHeight: 30,
    borderRadius: 15,
    backgroundColor: colors.roseSoft,
    color: colors.roseDark,
    fontSize: 12,
    lineHeight: 30,
    fontWeight: '950',
    paddingHorizontal: 12,
  },
  setupPreviewHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
  setupPreviewEditButton: {
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    boxShadow: '0 12px 28px rgba(10,77,232,0.22)',
    cursor: 'pointer',
  },
  setupPreviewEditText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '950',
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
  eventOptionsFooterPhone: {
    padding: 8,
    gap: 7,
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
  flowStepPagePhone: {
    minHeight: 'calc(100svh - 16px)',
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
  flowStepHeaderPhone: {
    padding: 10,
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
  flowStepTitlePhone: {
    fontSize: 23,
    lineHeight: 28,
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
    maxWidth: 1180,
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
    fontSize: 'clamp(13px, 1.4svh, 18px)',
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 'clamp(30px, 3.4svh, 46px)',
    lineHeight: 'clamp(36px, 4svh, 54px)',
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
  launchIntroPage: {
    position: 'relative',
    width: '100vw',
    height: '100svh',
    overflow: 'hidden',
    backgroundColor: '#020403',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 'clamp(18px, 5vw, 72px)',
    paddingVertical: 'clamp(18px, 4svh, 64px)',
    cursor: 'pointer',
  },
  launchIntroTopDot: {
    position: 'absolute',
    top: 'clamp(16px, 2svh, 28px)',
    width: 'clamp(8px, 0.9svh, 13px)',
    height: 'clamp(8px, 0.9svh, 13px)',
    borderRadius: 999,
    backgroundColor: '#22c55e',
    boxShadow: '0 0 18px rgba(34,197,94,0.95)',
  },
  launchIntroGlow: {
    position: 'absolute',
    width: '70vmin',
    height: '70vmin',
    borderRadius: 999,
    backgroundColor: 'rgba(20,184,166,0.1)',
    filter: 'blur(70px)',
  },
  launchIntroShade: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  launchIntroPrompt: {
    position: 'absolute',
    left: 'clamp(26px, 7vw, 140px)',
    right: 'clamp(26px, 7vw, 140px)',
    top: 'clamp(72px, 10svh, 140px)',
    alignItems: 'center',
    zIndex: 1,
  },
  launchIntroPromptTop: {
    color: 'rgba(255,255,255,0.94)',
    fontSize: 'clamp(34px, 5.4svh, 78px)',
    lineHeight: 'clamp(42px, 6.2svh, 90px)',
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  launchIntroPromptMain: {
    color: '#67e8f9',
    fontSize: 'clamp(44px, 7svh, 104px)',
    lineHeight: 'clamp(52px, 7.8svh, 116px)',
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadow: '0 0 34px rgba(103,232,249,0.38)',
  },
  launchIntroCopy: {
    position: 'absolute',
    left: 'clamp(20px, 5vw, 78px)',
    right: 'clamp(20px, 5vw, 78px)',
    bottom: 'clamp(124px, 14svh, 184px)',
    alignItems: 'center',
    gap: 4,
  },
  launchIntroBrand: {
    color: '#7dd3fc',
    fontSize: 'clamp(18px, 2.2svh, 30px)',
    lineHeight: 'clamp(24px, 2.8svh, 38px)',
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
  },
  launchIntroTitle: {
    color: '#ffffff',
    fontSize: 'clamp(32px, 5svh, 72px)',
    lineHeight: 'clamp(40px, 5.8svh, 82px)',
    fontWeight: '900',
    textAlign: 'center',
  },
  launchIntroMeta: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 'clamp(16px, 2svh, 26px)',
    lineHeight: 'clamp(22px, 2.8svh, 34px)',
    fontWeight: '800',
    textAlign: 'center',
  },
  launchIntroAction: {
    position: 'absolute',
    left: 'clamp(24px, 8vw, 160px)',
    right: 'clamp(24px, 8vw, 160px)',
    bottom: 'clamp(34px, 5svh, 76px)',
    minHeight: 'clamp(64px, 7svh, 92px)',
    borderRadius: 999,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 18px 46px rgba(10,77,232,0.38)',
  },
  launchIntroActionText: {
    color: '#ffffff',
    fontSize: 'clamp(20px, 2.4svh, 32px)',
    lineHeight: 'clamp(26px, 3svh, 40px)',
    fontWeight: '900',
    textAlign: 'center',
  },
  mirrorCapturePage: {
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: colors.dark,
    overflow: 'hidden',
  },
  mirrorPreviewPage: {
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: colors.dark,
    overflow: 'hidden',
  },
  mirrorPreviewStage: {
    minHeight: '100vh',
    paddingTop: 'clamp(124px, 12svh, 170px)',
    paddingRight: 'clamp(18px, 4vw, 56px)',
    paddingBottom: 'clamp(122px, 13svh, 170px)',
    paddingLeft: 'clamp(18px, 4vw, 56px)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mirrorPreviewStageMobile: {
    paddingTop: 'clamp(92px, 10svh, 126px)',
    paddingRight: 10,
    paddingBottom: 128,
    paddingLeft: 10,
  },
  mirrorPreviewStageShort: {
    paddingTop: 82,
    paddingBottom: 104,
  },
  mirrorPreviewOutput: {
    width: 'auto',
    height: 'min(74svh, calc(100svh - 270px))',
    maxWidth: '94vw',
    maxHeight: 'calc(100svh - 230px)',
    alignSelf: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    boxShadow: '0 28px 90px rgba(0,0,0,0.36)',
  },
  mirrorPreviewOutputMobile: {
    height: 'min(76svh, calc(100svh - 210px))',
    maxHeight: 'calc(100svh - 190px)',
    maxWidth: '96vw',
  },
  mirrorPreviewOutputPhone: {
    height: 'min(78svh, calc(100svh - 188px))',
    maxWidth: '98vw',
    borderRadius: 6,
  },
  mirrorPreviewOutputShort: {
    height: 'min(72svh, calc(100svh - 168px))',
    maxHeight: 'calc(100svh - 154px)',
  },
  mirrorPreviewToast: {
    position: 'absolute',
    left: 'clamp(80px, 30vw, 430px)',
    bottom: 'clamp(82px, 8svh, 112px)',
    right: 'clamp(80px, 30vw, 430px)',
    minHeight: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 5,
  },
  mirrorPreviewToastMobile: {
    left: 24,
    right: 24,
    bottom: 74,
    minHeight: 28,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  mirrorPreviewTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flexShrink: 0,
  },
  mirrorPreviewTopActionsMobile: {
    gap: 6,
  },
  mirrorPreviewHomeButton: {
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: colors.blue,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    boxShadow: '0 10px 22px rgba(10,77,232,0.24)',
    cursor: 'pointer',
  },
  mirrorPreviewHomeButtonMobile: {
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: 10,
  },
  mirrorPreviewHomeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '950',
  },
  mirrorPreviewHomeButtonTextMobile: {
    fontSize: 12,
    lineHeight: 15,
  },
  mirrorPreviewActions: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    zIndex: 5,
  },
  mirrorPreviewActionsMobile: {
    left: 14,
    right: 14,
    bottom: 14,
  },
  mirrorPreviewActionsPhone: {
    left: 12,
    right: 88,
    bottom: 12,
  },
  mirrorPreviewSecondaryButton: {
    minHeight: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: colors.rose,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 14px 34px rgba(0,0,0,0.22)',
  },
  mirrorPreviewSecondaryText: {
    color: colors.rose,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  mirrorPreviewButtonMobile: {
    minHeight: 46,
    borderRadius: 23,
    paddingHorizontal: 16,
    maxWidth: 170,
  },
  mirrorPreviewButtonTextMobile: {
    fontSize: 14,
    lineHeight: 18,
  },
  mirrorPreviewPrimaryButton: {
    minHeight: 58,
    borderRadius: 29,
    backgroundColor: colors.rose,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 16px 34px rgba(10,77,232,0.28)',
  },
  mirrorPreviewPrimaryText: {
    color: '#ffffff',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  mirrorShareScrim: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.20)',
    zIndex: 6,
  },
  mirrorShareDock: {
    position: 'absolute',
    right: 24,
    bottom: 22,
    alignItems: 'center',
    gap: 14,
    zIndex: 8,
  },
  mirrorShareDockMobile: {
    right: 16,
    bottom: 14,
    gap: 10,
  },
  mirrorShareDockPhone: {
    right: 10,
    bottom: 10,
    gap: 8,
  },
  mirrorShareMenu: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  mirrorShareMenuMobile: {
    gap: 8,
    maxHeight: 'calc(100svh - 104px)',
    overflowY: 'auto',
    paddingVertical: 2,
  },
  mirrorShareMenuPhone: {
    gap: 7,
    maxHeight: 'calc(100svh - 96px)',
  },
  mirrorShareOption: {
    width: 76,
    minHeight: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.76)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    boxShadow: '0 12px 28px rgba(0,0,0,0.28)',
    cursor: 'pointer',
  },
  mirrorShareOptionMobile: {
    width: 62,
    minHeight: 62,
    borderRadius: 31,
  },
  mirrorShareOptionPhone: {
    width: 56,
    minHeight: 56,
    borderRadius: 28,
  },
  mirrorShareOptionIcon: {
    color: colors.rose,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '950',
    textAlign: 'center',
  },
  mirrorShareOptionIconMobile: {
    fontSize: 12,
    lineHeight: 14,
  },
  mirrorShareOptionIconPhone: {
    fontSize: 11,
    lineHeight: 13,
  },
  mirrorShareOptionLabel: {
    color: '#6b7280',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  mirrorShareOptionLabelMobile: {
    fontSize: 8,
    lineHeight: 10,
  },
  mirrorShareOptionLabelPhone: {
    fontSize: 7,
    lineHeight: 9,
  },
  mirrorShareToggle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.rose,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 18px 42px rgba(10,77,232,0.38)',
    cursor: 'pointer',
  },
  mirrorShareToggleMobile: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  mirrorShareTogglePhone: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  mirrorShareToggleOpen: {
    backgroundColor: 'rgba(5,10,22,0.94)',
    boxShadow: '0 16px 42px rgba(0,0,0,0.44)',
  },
  mirrorShareHamburger: {
    width: 34,
    gap: 7,
  },
  mirrorShareHamburgerLine: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  mirrorShareToggleClose: {
    color: '#ffffff',
    fontSize: 58,
    lineHeight: 62,
    fontWeight: '300',
  },
  eventGalleryThumbButton: {
    position: 'absolute',
    left: 26,
    bottom: 96,
    width: 118,
    height: 86,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
    overflow: 'visible',
    zIndex: 7,
    boxShadow: '0 18px 42px rgba(0,0,0,0.34)',
    cursor: 'pointer',
  },
  eventGalleryThumbButtonMobile: {
    left: 16,
    bottom: 78,
    width: 88,
    height: 64,
    borderWidth: 2,
  },
  eventGalleryThumbButtonPhone: {
    left: 12,
    bottom: 68,
    width: 76,
    height: 56,
    borderRadius: 7,
  },
  eventGalleryThumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    objectFit: 'cover',
  },
  eventGalleryThumbStack: {
    position: 'absolute',
    left: 8,
    top: 8,
    right: -10,
    bottom: -10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.92)',
    backgroundColor: 'rgba(255,255,255,0.22)',
    zIndex: -1,
    transform: [{ rotate: '7deg' }],
  },
  eventGalleryThumbCount: {
    position: 'absolute',
    right: -10,
    top: -10,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.rose,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  eventGalleryThumbCountText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '950',
  },
  eventGalleryOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventGalleryBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(3,7,18,0.82)',
  },
  eventGalleryPanel: {
    width: 'min(92vw, 980px)',
    maxHeight: '88svh',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.98)',
    overflow: 'hidden',
    boxShadow: '0 34px 90px rgba(0,0,0,0.46)',
  },
  eventGalleryPanelMobile: {
    width: '96vw',
    maxHeight: '90svh',
    borderRadius: 7,
  },
  eventGalleryHeaderMobile: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  eventGalleryHeader: {
    minHeight: 86,
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  eventGalleryEyebrow: {
    color: colors.rose,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '950',
    textTransform: 'uppercase',
  },
  eventGalleryTitle: {
    color: colors.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '950',
  },
  eventGalleryTitleMobile: {
    fontSize: 21,
    lineHeight: 26,
  },
  eventGalleryMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  eventGalleryClose: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  eventGalleryCloseMobile: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  eventGalleryCloseText: {
    color: '#ffffff',
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '300',
  },
  eventGalleryCloseTextMobile: {
    fontSize: 32,
    lineHeight: 36,
  },
  eventGalleryActionBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.soft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  eventGalleryActionBarPhone: {
    flexWrap: 'wrap',
    justifyContent: 'stretch',
  },
  eventGallerySelectionPill: {
    marginRight: 'auto',
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  eventGallerySelectionText: {
    color: colors.ink,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '950',
  },
  eventGalleryActionButton: {
    minHeight: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    cursor: 'pointer',
  },
  eventGalleryActionButtonText: {
    color: colors.ink,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '950',
  },
  eventGalleryPrimaryActionButton: {
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    cursor: 'pointer',
    boxShadow: '0 10px 22px rgba(21,88,230,0.20)',
  },
  eventGalleryPrimaryActionButtonDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
  eventGalleryPrimaryActionText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '950',
  },
  eventGalleryGrid: {
    padding: 16,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 14,
  },
  eventGalleryGridMobile: {
    padding: 12,
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  eventGalleryGridPhone: {
    padding: 10,
    gap: 8,
  },
  eventGalleryCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    boxShadow: '0 12px 30px rgba(15,23,42,0.10)',
    cursor: 'pointer',
  },
  eventGalleryCardSelected: {
    borderColor: colors.blue,
    boxShadow: '0 18px 38px rgba(21,88,230,0.18)',
  },
  eventGalleryImageWrap: {
    position: 'relative',
    backgroundColor: colors.dark,
  },
  eventGalleryImage: {
    width: '100%',
    aspectRatio: 0.78,
    objectFit: 'cover',
    backgroundColor: colors.dark,
  },
  eventGalleryImageMobile: {
    aspectRatio: 0.74,
  },
  eventGalleryCardFooter: {
    padding: 10,
    gap: 8,
  },
  eventGallerySelectBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 22px rgba(0,0,0,0.20)',
  },
  eventGallerySelectBadgeActive: {
    backgroundColor: colors.blue,
  },
  eventGallerySelectBadgeText: {
    color: colors.blue,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '950',
  },
  eventGallerySelectBadgeTextActive: {
    color: '#ffffff',
  },
  eventGalleryCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  eventGalleryMiniButton: {
    minHeight: 34,
    flex: 1,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    cursor: 'pointer',
  },
  eventGalleryMiniButtonPrimary: {
    borderColor: colors.blue,
    backgroundColor: colors.blue,
  },
  eventGalleryMiniButtonText: {
    color: colors.ink,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '950',
  },
  eventGalleryMiniButtonPrimaryText: {
    color: '#ffffff',
  },
  eventGalleryEmptyState: {
    minHeight: 180,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  eventGalleryCardTitle: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '950',
  },
  eventGalleryCardText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
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
  mirrorPreviewTopBar: {
    left: 28,
    right: 28,
    top: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: 'rgba(255,255,255,0.62)',
    boxShadow: '0 10px 28px rgba(0,0,0,0.08)',
  },
  mirrorPreviewTopBarMobile: {
    left: 10,
    right: 10,
    top: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.52)',
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
  mirrorPreviewTitleMobile: {
    fontSize: 18,
    lineHeight: 22,
    marginTop: 1,
  },
  mirrorSubText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    maxWidth: '100%',
  },
  mirrorPreviewSubTextMobile: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
  mirrorStatusPill: {
    minWidth: 56,
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mirrorPreviewStatusPill: {
    minWidth: 46,
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(238,245,255,0.72)',
  },
  mirrorPreviewStatusTextMobile: {
    fontSize: 13,
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
    backgroundColor: 'rgba(0,0,0,0.1)',
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
  liveFrameOverlayLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
  },
  liveFrameOverlaySurface: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  liveFrameOverlayImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.68,
  },
  liveFrameOverlaySoftWash: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  liveFrameOuterBorder: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '12%',
    bottom: '12%',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.46)',
  },
  liveFrameCurrentBadge: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10,77,232,0.94)',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.86)',
  },
  liveFrameCurrentBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
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
  captureStartHint: {
    maxWidth: 430,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
    backgroundColor: 'rgba(3,7,18,0.68)',
    overflow: 'hidden',
    zIndex: 4,
  },
  animationOverlayBefore: {
    backgroundColor: 'rgba(3,7,18,0.64)',
  },
  animationHalo: {
    position: 'absolute',
    width: 'min(58vw, 560px)',
    height: 'min(58vw, 560px)',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.36)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    boxShadow: '0 0 90px rgba(255,255,255,0.16)',
  },
  animationHaloLarge: {
    width: 'min(92vw, 920px)',
    height: 'min(92vw, 920px)',
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.04)',
    boxShadow: '0 0 160px rgba(255,255,255,0.18)',
  },
  animationHaloConfetti: {
    borderStyle: 'dashed',
    backgroundColor: 'rgba(56,189,248,0.18)',
  },
  animationCard: {
    minWidth: 'min(88vw, 390px)',
    maxWidth: 'min(88vw, 560px)',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.90)',
    paddingHorizontal: 'clamp(28px, 4vw, 48px)',
    paddingVertical: 'clamp(26px, 4svh, 42px)',
    alignItems: 'center',
    boxShadow: '0 34px 90px rgba(0,0,0,0.34)',
  },
  animationCardImmersive: {
    minWidth: 'min(98vw, 1040px)',
    maxWidth: 'min(98vw, 1120px)',
    minHeight: 'min(78svh, 820px)',
    borderRadius: 8,
    backgroundColor: 'transparent',
    paddingHorizontal: 'clamp(16px, 3vw, 48px)',
    paddingVertical: 'clamp(14px, 3svh, 40px)',
    boxShadow: 'none',
  },
  animationCardLight: {
    backgroundColor: 'rgba(255,253,248,0.95)',
  },
  animationVideoMockInline: {
    width: '100%',
    height: 'clamp(190px, 24svh, 290px)',
    borderRadius: 8,
    marginBottom: 18,
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
    fontSize: 'clamp(38px, 5.2vw, 70px)',
    lineHeight: 'clamp(42px, 5.8vw, 78px)',
    fontFamily: '"Brush Script MT", "Segoe Script", "Comic Sans MS", cursive',
    textAlign: 'center',
  },
  animationTitle: {
    color: '#ffffff',
    fontSize: 'clamp(44px, 7vw, 108px)',
    lineHeight: 'clamp(48px, 7.6vw, 116px)',
    fontWeight: '950',
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadow: '0 18px 44px rgba(0,0,0,0.46)',
  },
  animationText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 'clamp(18px, 2.1vw, 30px)',
    lineHeight: 'clamp(23px, 2.6vw, 36px)',
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 10,
    textShadow: '0 10px 28px rgba(0,0,0,0.4)',
  },
  animationTextPill: {
    marginTop: 12,
    paddingHorizontal: 'clamp(18px, 3vw, 30px)',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    color: colors.ink,
    fontSize: 'clamp(15px, 1.7vw, 22px)',
    lineHeight: 'clamp(20px, 2vw, 28px)',
    textShadow: 'none',
    boxShadow: '0 16px 38px rgba(0,0,0,0.26)',
  },
  animationDots: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  animationDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
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
  previewMainOutput: {
    width: 'min(92vw, 760px)',
    maxWidth: '100%',
    alignSelf: 'center',
    boxShadow: '0 18px 50px rgba(15,23,42,0.12)',
  },
  outputImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  previewRetakeLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 2,
  },
  previewRetakeHotspot: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(10,77,232,0.28)',
    backgroundColor: 'rgba(10,77,232,0.02)',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 10,
    cursor: 'pointer',
  },
  previewRetakePill: {
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(10,77,232,0.94)',
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 22px rgba(15,23,42,0.18)',
  },
  previewRetakePillText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textAlign: 'center',
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
  startEditorHeaderPortrait: {
    minHeight: 104,
    paddingHorizontal: 'clamp(18px, 3vw, 34px)',
    paddingVertical: 'clamp(16px, 2svh, 24px)',
    paddingRight: 'clamp(80px, 8vw, 112px)',
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
  printInputLocked: {
    backgroundColor: '#eef2ff',
    borderColor: '#bfdbfe',
    color: colors.roseDark,
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
  captureModeFooterPrimaryButton: {
    flex: 1.15,
    minHeight: 52,
    borderRadius: 28,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    boxShadow: '0 12px 26px rgba(10,77,232,0.18)',
  },
  captureModeFooterPrimaryButtonMobile: {
    flex: 1.25,
    minHeight: 48,
  },
  captureModeFooterPrimaryText: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '950',
    textAlign: 'center',
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
  captureConfigSimpleFooter: {
    justifyContent: 'center',
  },
  captureConfigSaveButton: {
    flex: 0,
    minWidth: 320,
    maxWidth: 520,
    width: '100%',
  },
  captureConfigPage: {
    minHeight: 'auto',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'visible',
  },
  captureConfigContent: {
    maxWidth: 920,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 140,
    gap: 18,
  },
  customLayoutPage: {
    minHeight: 'auto',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'visible',
  },
  customLayoutPagePortrait: {
    minHeight: 'auto',
    overflow: 'visible',
  },
  customLayoutContent: {
    display: 'grid',
    gridTemplateColumns: 'minmax(460px, 1.45fr) minmax(320px, 0.85fr)',
    gap: 'clamp(12px, 1.6vw, 20px)',
    padding: 'clamp(10px, 1.6vw, 28px)',
    alignItems: 'start',
  },
  customLayoutContentMobile: {
    gridTemplateColumns: 'minmax(0, 1fr)',
    padding: 14,
  },
  customLayoutContentPortrait: {
    gridTemplateColumns: 'minmax(0, 1fr)',
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
    padding: 'clamp(12px, 1.6svh, 22px)',
    gap: 16,
  },
  customLayoutPreviewPanel: {
    gap: 14,
    alignItems: 'center',
    minWidth: 0,
  },
  customLayoutSheet: {
    width: '100%',
    maxWidth: 'min(54vw, 560px)',
    minWidth: 420,
    aspectRatio: cp1500ShortEdgeCm / cp1500LongEdgeCm,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 'clamp(14px, 1.5vw, 22px)',
    alignSelf: 'center',
  },
  customLayoutSheetPortrait: {
    minWidth: 0,
    width: '100%',
    maxWidth: 'min(86vw, 700px)',
  },
  customLayoutSheetMirrorPaper: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    maxWidth: 'min(66vw, 720px)',
  },
  customLayoutSheetMirrorPaperPortrait: {
    maxWidth: 'min(94vw, 760px)',
    gap: 6,
    padding: 'clamp(10px, 1.2vw, 16px)',
  },
  customLayoutSheetMobile: {
    minWidth: 0,
    maxWidth: '100%',
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
  customLayoutStripHalf: {
    flex: 1,
    minWidth: 0,
  },
  customLayoutMirrorCopy: {
    opacity: 0.92,
    boxShadow: 'inset 0 0 0 1px rgba(10,77,232,0.18)',
  },
  customLayoutMirrorBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    borderRadius: 999,
    backgroundColor: colors.rose,
    paddingHorizontal: 8,
    paddingVertical: 5,
    zIndex: 30,
  },
  customLayoutMirrorBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '950',
  },
  customLayoutBackgroundImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    pointerEvents: 'none',
  },
  customLayoutBackgroundShade: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.18)',
    pointerEvents: 'none',
  },
  customAlignGuideVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    backgroundColor: '#0a4de8',
    opacity: 0.9,
    zIndex: 16,
    pointerEvents: 'none',
  },
  customAlignGuideHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    marginTop: -1,
    backgroundColor: '#0a4de8',
    opacity: 0.9,
    zIndex: 16,
    pointerEvents: 'none',
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
  customLayoutScriptText: {
    position: 'absolute',
    top: '6.4%',
    left: '8%',
    right: '8%',
    color: '#7f1d1d',
    fontSize: 'clamp(16px, 1.8vw, 24px)',
    lineHeight: 'clamp(21px, 2.2vw, 30px)',
    fontWeight: '900',
    textAlign: 'center',
    textShadow: '0 1px 8px rgba(255,255,255,0.72)',
    pointerEvents: 'none',
  },
  customTextLayer: {
    position: 'absolute',
    minHeight: 28,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    userSelect: 'none',
    touchAction: 'none',
    zIndex: 18,
  },
  customTextLayerSelected: {
    backgroundColor: 'rgba(255,255,255,0.34)',
    boxShadow: '0 0 0 2px rgba(10,77,232,0.9)',
  },
  customMirrorPreviewLayer: {
    pointerEvents: 'none',
  },
  customTextLayerValue: {
    fontWeight: '900',
    textAlign: 'center',
    textShadow: '0 1px 8px rgba(255,255,255,0.76)',
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
  customLayoutSlotMirror: {
    opacity: 0.54,
    borderStyle: 'dashed',
    borderColor: colors.rose,
    backgroundColor: 'rgba(238,245,255,0.52)',
    cursor: 'default',
    pointerEvents: 'none',
  },
  customLayoutSlotNumber: {
    color: colors.rose,
    fontSize: 'clamp(22px, 2.2vw, 34px)',
    lineHeight: 'clamp(28px, 2.7vw, 40px)',
    fontWeight: '900',
  },
  customLayoutSlotMeta: {
    color: colors.muted,
    fontSize: 'clamp(11px, 1.1vw, 16px)',
    lineHeight: 'clamp(15px, 1.5vw, 21px)',
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
    right: -4,
    bottom: -4,
    width: 'clamp(30px, 3vw, 42px)',
    height: 'clamp(30px, 3vw, 42px)',
    borderTopLeftRadius: 8,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'nwse-resize',
    touchAction: 'none',
  },
  customLayoutResizeText: {
    color: '#ffffff',
    fontSize: 'clamp(14px, 1.4vw, 19px)',
    lineHeight: 'clamp(18px, 1.8vw, 24px)',
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
  customLayoutTextFooter: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    bottom: '5.2%',
    alignItems: 'center',
    gap: 2,
    pointerEvents: 'none',
  },
  customLayoutNameText: {
    color: '#7f1d1d',
    fontSize: 'clamp(18px, 2vw, 28px)',
    lineHeight: 'clamp(23px, 2.5vw, 34px)',
    fontWeight: '900',
    textAlign: 'center',
    textShadow: '0 1px 8px rgba(255,255,255,0.72)',
  },
  customLayoutEventText: {
    color: colors.ink,
    fontSize: 'clamp(12px, 1.3vw, 18px)',
    lineHeight: 'clamp(16px, 1.7vw, 23px)',
    fontWeight: '900',
    textAlign: 'center',
    textShadow: '0 1px 8px rgba(255,255,255,0.72)',
  },
  customLayoutDateText: {
    color: colors.muted,
    fontSize: 'clamp(11px, 1.1vw, 16px)',
    lineHeight: 'clamp(15px, 1.5vw, 21px)',
    fontWeight: '800',
    textAlign: 'center',
    textShadow: '0 1px 8px rgba(255,255,255,0.72)',
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
    minWidth: 0,
  },
  customLayoutControlsPortrait: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  customMenuTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    boxShadow: '0 12px 34px rgba(15,23,42,0.07)',
  },
  customMenuTab: {
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  customMenuTabActive: {
    borderColor: colors.rose,
    backgroundColor: colors.rose,
  },
  customMenuTabText: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  customMenuTabTextActive: {
    color: '#ffffff',
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
  customManualButtonActive: {
    backgroundColor: colors.roseSoft,
    borderColor: colors.rose,
    boxShadow: '0 0 0 3px rgba(10,77,232,0.14)',
  },
  customManualButtonText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  customManualButtonTextActive: {
    color: colors.rose,
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
  customManualMirrorButton: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  customManualMirrorButtonActive: {
    borderColor: colors.rose,
    backgroundColor: colors.rose,
  },
  customManualMirrorText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  customManualMirrorTextActive: {
    color: '#ffffff',
  },
  customTextGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  customTextGridSingle: {
    gridTemplateColumns: '1fr',
  },
  customTextInput: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 12,
    outlineStyle: 'none',
  },
  customTextDateInput: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 12,
    outlineStyle: 'none',
    cursor: 'pointer',
  },
  customTextLayerPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customTextPickerButton: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 11,
  },
  customTextPickerButtonActive: {
    borderColor: colors.rose,
    backgroundColor: colors.rose,
  },
  customTextPickerText: {
    color: colors.ink,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  customTextPickerTextActive: {
    color: '#ffffff',
  },
  customTextStyleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 8,
  },
  customTextStyleButton: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  customTextStyleButtonText: {
    color: colors.ink,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  customTextStyleButtonValue: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  customTextColorSwatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  customTextFontMenu: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
  },
  customTextFontChoice: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    cursor: 'pointer',
  },
  customTextFontChoiceActive: {
    borderColor: colors.rose,
    backgroundColor: colors.roseSoft,
  },
  customTextFontChoiceText: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  customTextFontChoiceTextActive: {
    color: colors.rose,
  },
  customTextFontUpload: {
    minHeight: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.rose,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    cursor: 'pointer',
  },
  customTextFontUploadTitle: {
    color: colors.rose,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '950',
    textAlign: 'center',
  },
  customTextFontUploadText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
  },
  customTextColorPalette: {
    gridColumn: '1 / -1',
    gap: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    boxShadow: '0 12px 28px rgba(15,23,42,0.08)',
  },
  customTextColorPaletteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  customTextColorPaletteTitle: {
    color: colors.ink,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '950',
  },
  customTextColorPickerLabel: {
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 6,
    cursor: 'pointer',
  },
  customTextColorPickerText: {
    color: colors.rose,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '950',
  },
  customTextColorPickerInput: {
    width: 34,
    height: 34,
    border: 0,
    padding: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  customTextColorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(46px, 1fr))',
    gap: 10,
  },
  customTextColorChoice: {
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.soft,
    cursor: 'pointer',
  },
  customTextColorChoiceActive: {
    borderColor: colors.rose,
    backgroundColor: colors.roseSoft,
    boxShadow: '0 0 0 3px rgba(10,77,232,0.16)',
  },
  customTextColorChoiceSwatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.18)',
  },
  customTypePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customTypePill: {
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  customTypePillActive: {
    borderColor: colors.rose,
    backgroundColor: colors.rose,
  },
  customTypePillText: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  customTypePillTextActive: {
    color: '#ffffff',
  },
  customTemplateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  customTemplateThumb: {
    width: 58,
    height: 74,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: colors.soft,
  },
  customTemplateThumbActive: {
    borderColor: colors.rose,
  },
  customTemplateImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  customUploadThumb: {
    width: 58,
    height: 74,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rose,
    borderStyle: 'dashed',
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  customUploadThumbText: {
    color: colors.rose,
    fontSize: 28,
    lineHeight: 34,
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
  capturePreviewConfigCard: {
    gap: 16,
  },
  capturePreviewConfigHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    flexWrap: 'wrap',
  },
  capturePreviewConfigMeta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    marginTop: 3,
  },
  capturePreviewConfigCanvas: {
    position: 'relative',
    width: 'min(100%, 560px)',
    maxHeight: 640,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: colors.dark,
    borderWidth: 2,
    borderColor: colors.rose,
    boxShadow: '0 18px 44px rgba(15,23,42,0.16)',
  },
  capturePreviewConfigCanvasPhone: {
    width: '100%',
    maxHeight: 520,
  },
  capturePreviewConfigFrame: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  capturePreviewConfigSoftWash: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  capturePreviewConfigEventText: {
    position: 'absolute',
    left: '7%',
    top: '6%',
    right: '7%',
    zIndex: 2,
  },
  capturePreviewConfigEventName: {
    color: '#ffffff',
    fontSize: 'clamp(22px, 4vw, 34px)',
    lineHeight: 'clamp(27px, 4.6vw, 40px)',
    fontWeight: '950',
    textShadowColor: 'rgba(0,0,0,0.34)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  capturePreviewConfigEventMeta: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.28)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  capturePreviewConfigSlot: {
    position: 'absolute',
    zIndex: 3,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(224,242,254,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 26px rgba(15,23,42,0.18)',
  },
  capturePreviewConfigSlotNumber: {
    color: colors.rose,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '950',
  },
  capturePreviewConfigSlotLabel: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
  },
  capturePreviewConfigEmpty: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '42%',
    minHeight: 78,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.rose,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    zIndex: 4,
  },
  capturePreviewConfigEmptyText: {
    color: colors.rose,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
    textAlign: 'center',
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
  scriptDateInput: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    outlineStyle: 'none',
    cursor: 'pointer',
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
    padding: 'clamp(10px, 2svh, 20px)',
    zIndex: 20,
  },
  modalCard: {
    width: 540,
    maxWidth: 'calc(100vw - 24px)',
    maxHeight: 'calc(100svh - 24px)',
    overflow: 'auto',
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: '#ffffff',
    paddingHorizontal: 'clamp(22px, 4vw, 38px)',
    paddingVertical: 'clamp(28px, 5svh, 46px)',
    alignItems: 'center',
    gap: 'clamp(14px, 2.4svh, 20px)',
    boxShadow: '0 20px 70px rgba(15,23,42,0.18)',
  },
  modalCardMobile: {
    width: 'calc(100vw - 18px)',
    maxWidth: 380,
    maxHeight: 'calc(100svh - 18px)',
    minHeight: 0,
    paddingHorizontal: 22,
    paddingVertical: 30,
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
    fontSize: 34,
    lineHeight: 40,
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
    fontSize: 20,
    lineHeight: 27,
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
    minHeight: 58,
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
