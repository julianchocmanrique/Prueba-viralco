import React, { useEffect, useMemo, useState } from 'react'
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
const shareSteps = ['Capturar', 'Revisar', 'Imprimir', 'Compartir']

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
    tools: ['QR', 'Print', 'Mail'],
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
    tools: ['QR', 'SMS', 'Mail'],
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
    tools: ['QR', 'Mail', 'SMS'],
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
    tools: ['QR', 'Mail', 'Drive'],
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
    tools: ['QR', 'Print', 'Mail'],
  },
}

const WebApp = () => {
  const { width } = useWindowDimensions()
  const [selectedTemplate, setSelectedTemplate] = useState(templates[1])
  const [selectedMode, setSelectedMode] = useState('360')
  const [selectedFilter, setSelectedFilter] = useState('Original')
  const [copies, setCopies] = useState(1)
  const [eventName, setEventName] = useState('Viralco live booth')
  const [capturePhase, setCapturePhase] = useState('idle')
  const [activityMessage, setActivityMessage] = useState('Camara lista')
  const [captureCount, setCaptureCount] = useState(0)
  const isMobile = width < 760
  const modeDetails = captureModeDetails[selectedMode]
  const activeSteps = modeDetails.steps || shareSteps
  const isCapturing = capturePhase === 'capturing'

  useEffect(() => {
    if (!isCapturing) {
      return undefined
    }

    const timer = setTimeout(() => {
      setCapturePhase('complete')
      setCaptureCount((count) => count + 1)
      setActivityMessage(`${modeDetails.output} para ${eventName}`)
    }, 1300)

    return () => clearTimeout(timer)
  }, [eventName, isCapturing, modeDetails.output])

  const chooseMode = (mode) => {
    setSelectedMode(mode)
    setCapturePhase('idle')
    setActivityMessage(`${captureModeDetails[mode].title}: listo para capturar`)
  }

  const startCapture = () => {
    setCapturePhase('capturing')
    setActivityMessage(`${modeDetails.primary} en progreso`)
  }

  const runTool = (tool) => {
    const messages = {
      QR: 'QR generado para descarga',
      Print: `${copies} copia${copies === 1 ? '' : 's'} enviada${copies === 1 ? '' : 's'} a impresion`,
      Mail: 'Formulario de email abierto',
      SMS: 'Link preparado para SMS',
      Drive: 'Video guardado en cola de entrega',
    }
    setCapturePhase('complete')
    setActivityMessage(messages[tool] || `${tool} listo`)
  }

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
              <View style={styles.mobileIconLens} />
              <Text style={styles.mobileIconMark}>V</Text>
            </View>
            <View style={styles.mobileHeaderText}>
              <Text style={styles.mobileAppName}>Viralco Booth</Text>
              <Text style={styles.mobileAppSub}>Photo booth para eventos</Text>
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

        <View style={styles.mobileCameraCard}>
          <Image source={selectedTemplate.image} style={styles.mobileCameraImage} />
          <View style={styles.mobileCameraShade} />
          <View style={[styles.mobileCountdown, isCapturing && styles.mobileCountdownActive]}>
            <Text style={styles.mobileCountdownText}>{modeDetails.countdown}</Text>
          </View>
          <View style={styles.mobileCaptureMeta}>
            <Text style={styles.mobileCaptureMode}>{modeDetails.title}</Text>
            <Text style={styles.mobileCaptureBadge}>{modeDetails.badge}</Text>
          </View>
          <Text style={styles.mobileCameraCopy}>{modeDetails.instruction}</Text>
          <View style={styles.mobileProgress}>
            {modeDetails.progress.map((step, index) => {
              const active = isCapturing || capturePhase === 'complete'
              return (
                <View key={step} style={styles.mobileProgressItem}>
                  <View
                    style={[
                      styles.mobileProgressDot,
                      active && index < (isCapturing ? 2 : 3) && styles.mobileProgressDotActive,
                    ]}
                  />
                  <Text style={styles.mobileProgressText}>{step}</Text>
                </View>
              )
            })}
          </View>
          <View style={styles.mobileQuickActions}>
            {modeDetails.tools.map((tool) => (
              <Pressable key={tool} onPress={() => runTool(tool)} style={styles.mobileQuickButton}>
                <Text style={styles.mobileQuickText}>{tool}</Text>
              </Pressable>
            ))}
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
          <Text style={styles.mobileActivityMeta}>{captureCount} capturas en esta sesion</Text>
        </View>

        <View style={styles.mobileSection}>
          <Text style={styles.mobileSectionTitle}>Modo de captura</Text>
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

        <View style={styles.mobileTwoCards}>
          <View style={styles.mobileMiniCard}>
            <Text style={styles.mobileSectionTitle}>Flujo</Text>
            {activeSteps.map((step, index) => (
              <View key={step} style={styles.mobileStep}>
                <Text style={styles.mobileStepNumber}>{index + 1}</Text>
                <Text style={styles.mobileStepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.mobileMiniCard}>
            <Text style={styles.mobileSectionTitle}>Copias</Text>
            <View style={styles.mobileCopies}>
              {[1, 2, 3, 4].map((number) => (
                <Pressable
                  key={number}
                  onPress={() => setCopies(number)}
                  style={[styles.mobileCopyButton, copies === number && styles.mobileCopyActive]}
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
              <Text style={styles.mobilePrimaryText}>Imprimir</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.mobileSection}>
          <View style={styles.mobileSectionHeader}>
            <Text style={styles.mobileSectionTitle}>Filtros</Text>
            <Text style={styles.mobileAccentText}>{selectedFilter}</Text>
          </View>
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
            <Text style={styles.mobileSectionTitle}>Plantillas</Text>
            <Text style={styles.mobileAccentText}>{selectedTemplate.name}</Text>
          </View>
          <View style={styles.mobileTemplateGrid}>
            {templates.map((template) => {
              const active = selectedTemplate.id === template.id
              return (
                <Pressable
                  key={template.id}
                  onPress={() => setSelectedTemplate(template)}
                  style={[styles.mobileTemplateCard, active && styles.mobileTemplateActive]}
                >
                  <Image source={template.image} style={styles.mobileTemplateImage} />
                  <Text style={styles.mobileTemplateName}>{template.name}</Text>
                </Pressable>
              )
            })}
          </View>
        </View>
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
            <View style={styles.iconLens} />
            <Text style={styles.iconMark}>V</Text>
          </View>
          <View>
            <Text style={styles.heroName}>Prueba Viralco</Text>
            <Text style={styles.heroSub}>Booth web para eventos</Text>
          </View>
        </View>
        <View style={styles.heroLine} />
      </View>

      <View style={styles.appShell}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>Viralco Booth</Text>
            <Text style={styles.brandSub}>Captura, imprime y comparte experiencias de evento.</Text>
          </View>
          <View style={styles.topActions}>
            <View style={styles.syncPill}>
              <View style={styles.syncDot} />
              <Text style={styles.syncText}>LISTO</Text>
            </View>
            <Text style={styles.topMeta}>Evento / {selectedMode} / {capturePhase}</Text>
          </View>
        </View>

        <View style={styles.mainGrid}>
          <View style={styles.captureColumn}>
            <View style={styles.captureHeader}>
              <View>
                <Text style={styles.screenTitle}>{eventName}</Text>
                <Text style={styles.screenCaption}>{modeDetails.instruction}</Text>
              </View>
              <TextInput
                value={eventName}
                onChangeText={setEventName}
                style={styles.eventInput}
                placeholder="Nombre del evento"
                placeholderTextColor="#7d8188"
              />
            </View>

            <View style={styles.cameraFrame}>
              <Image source={selectedTemplate.image} style={styles.cameraImage} />
              <View style={styles.cameraOverlay}>
                <Text style={[styles.countdown, isCapturing && styles.countdownActive]}>
                  {modeDetails.countdown}
                </Text>
                <Text style={styles.cameraInstruction}>{modeDetails.title}</Text>
              </View>
              <View style={styles.captureStatus}>
                <Text style={styles.captureStatusLabel}>{modeDetails.badge}</Text>
                <Text style={styles.captureStatusText}>{activityMessage}</Text>
              </View>
              <View style={styles.progressRail}>
                {modeDetails.progress.map((step, index) => (
                  <View key={step} style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressBar,
                        (isCapturing || capturePhase === 'complete') &&
                          index < (isCapturing ? 2 : 3) &&
                          styles.progressBarActive,
                      ]}
                    />
                    <Text style={styles.progressStepText}>{step}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.sideTools}>
                {modeDetails.tools.map((tool) => (
                  <Pressable key={tool} onPress={() => runTool(tool)} style={styles.sideTool}>
                    <Text style={styles.sideToolText}>{tool}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.captureControls}>
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

              <View style={styles.printPanel}>
                <View>
                  <Text style={styles.panelLabel}>Copias</Text>
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
                </View>
                <Pressable
                  onPress={startCapture}
                  disabled={isCapturing}
                  style={[styles.printButton, isCapturing && styles.printButtonBusy]}
                >
                  <Text style={styles.printButtonText}>
                    {isCapturing ? 'Capturando...' : modeDetails.primary}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.workflowColumn}>
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Flujo del invitado</Text>
              <View style={styles.steps}>
                {activeSteps.map((step, index) => (
                  <View key={step} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Efectos y filtros</Text>
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
              <View style={styles.beautyRow}>
                <Text style={styles.beautyLabel}>Beauty mode</Text>
                <View style={styles.toggle}>
                  <View style={styles.toggleKnob} />
                  <Text style={styles.toggleText}>OFF</Text>
                </View>
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Layout de impresion</Text>
              <View style={styles.printLayout}>
                {layoutSlots.map((slot) => (
                  <View
                    key={slot.id}
                    style={[
                      styles.layoutSlot,
                      {
                        width: slot.width,
                        height: slot.height,
                        top: slot.top,
                        left: slot.left,
                        right: slot.right,
                        bottom: slot.bottom,
                        backgroundColor: slot.color,
                      },
                    ]}
                  >
                    <Text style={styles.layoutSlotText}>{slot.id}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.templateBand}>
          <View style={styles.bandHeader}>
            <View>
              <Text style={styles.bandTitle}>Plantillas del evento</Text>
              <Text style={styles.bandCaption}>Elige una experiencia y cambia todo el booth.</Text>
            </View>
            <Text style={styles.bandMeta}>{selectedTemplate.name}</Text>
          </View>

          <View style={styles.templateGrid}>
            {templates.map((template) => {
              const active = selectedTemplate.id === template.id
              return (
                <Pressable
                  key={template.id}
                  onPress={() => setSelectedTemplate(template)}
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
  red: '#d72b74',
  blue: '#18a9c8',
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
    backgroundColor: 'rgba(215, 43, 116, 0.34)',
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
    boxShadow: '0 14px 30px rgba(215, 43, 116, 0.34)',
  },
  mobileIconLens: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    right: 8,
    bottom: 8,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  mobileIconMark: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    marginTop: -4,
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
  mobileAppSub: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
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
    top: 128,
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 5,
    borderColor: colors.red,
    backgroundColor: 'rgba(255,255,255,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileCountdownActive: {
    backgroundColor: '#ffffff',
    boxShadow: '0 0 34px rgba(215, 43, 116, 0.72)',
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
    top: 282,
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    backgroundColor: 'rgba(0,0,0,0.46)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  mobileProgress: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 68,
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
  mobileQuickActions: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  mobileQuickButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileQuickText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  mobileCaptureButton: {
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 16px 34px rgba(215, 43, 116, 0.30)',
  },
  mobileCaptureButtonBusy: {
    backgroundColor: '#9e194f',
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
    boxShadow: '0 8px 18px rgba(215, 43, 116, 0.22)',
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
    boxShadow: '0 22px 48px rgba(215, 43, 116, 0.34)',
  },
  iconLens: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    right: 22,
    bottom: 22,
    borderWidth: 8,
    borderColor: '#ffffff',
    opacity: 0.94,
  },
  iconMark: {
    color: '#ffffff',
    fontSize: 78,
    lineHeight: 86,
    fontWeight: '900',
    marginTop: -8,
  },
  heroName: {
    color: '#f8fbff',
    fontSize: 44,
    fontWeight: '400',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
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
  brandSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
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
    backgroundColor: '#fff0f6',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#f7c3db',
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  syncText: {
    color: '#a31352',
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
    boxShadow: '0 0 42px rgba(215, 43, 116, 0.66)',
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
    backgroundColor: '#9e194f',
  },
  printButtonText: {
    color: '#ffffff',
    fontSize: 16,
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
    boxShadow: '0 8px 24px rgba(239, 75, 75, 0.22)',
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
    iconLens: {
      width: 36,
      height: 36,
      borderRadius: 18,
      right: 14,
      bottom: 14,
      borderWidth: 6,
    },
    iconMark: {
      fontSize: 54,
      lineHeight: 60,
    },
    heroName: {
      fontSize: 32,
    },
    heroSub: {
      fontSize: 13,
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
    iconLens: {
      width: 24,
      height: 24,
      borderRadius: 12,
      right: 9,
      bottom: 9,
      borderWidth: 4,
    },
    iconMark: {
      fontSize: 38,
      lineHeight: 44,
      marginTop: -5,
    },
    heroName: {
      fontSize: 25,
      lineHeight: 29,
      fontWeight: '700',
    },
    heroSub: {
      fontSize: 12,
      marginTop: 4,
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
    brandSub: {
      fontSize: 12,
      lineHeight: 17,
      maxWidth: 310,
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
