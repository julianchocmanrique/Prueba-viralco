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
const setupTabs = [
  { id: 'evento', label: 'Evento', title: 'Nombre y captura' },
  { id: 'config', label: 'Config', title: 'Configuracion del modo' },
  { id: 'diseno', label: 'Diseno', title: 'Plantilla y filtro' },
  { id: 'grabar', label: 'Grabar', title: 'Prueba de captura' },
  { id: 'salida', label: 'Salida', title: 'Entrega e impresion' },
]

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
    tools: ['QR', 'SMS', 'Mail'],
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
    tools: ['QR', 'Mail', 'SMS'],
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
    tools: ['QR', 'Mail', 'Drive'],
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
    tools: ['QR', 'Print', 'Mail'],
    settings: ['Giro completo', 'Render rapido', 'Overlay del evento'],
    control: { label: 'Duracion del giro', min: 4, max: 20, defaultValue: 10, unit: 's' },
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
  const [activeTab, setActiveTab] = useState('evento')
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
  const activeSteps = modeDetails.steps || shareSteps
  const isCapturing = capturePhase === 'capturing'
  const selectedConfigValue = modeConfigValues[selectedMode]
  const controlLabel = `${selectedConfigValue} ${modeDetails.control.unit}`
  const hasRecording = captureCount > 0 || capturePhase === 'complete'
  const displayCountdown =
    selectedMode === 'GIF'
      ? `1/${selectedConfigValue}`
      : selectedMode === 'Video'
        ? 'REC'
        : selectedMode === '360'
          ? '360'
          : String(selectedConfigValue)
  const displayBadge =
    selectedMode === 'GIF'
      ? `${selectedConfigValue} fotos`
      : selectedMode === '360'
        ? `${selectedConfigValue}s giro`
        : `${selectedConfigValue}${modeDetails.control.unit}`

  useEffect(() => {
    if (!isCapturing) {
      return undefined
    }

    const timer = setTimeout(() => {
      setCapturePhase('complete')
      setCaptureCount((count) => count + 1)
      setActivityMessage(`${modeDetails.output} para ${eventName} (${controlLabel})`)
      setActiveTab('salida')
    }, 1300)

    return () => clearTimeout(timer)
  }, [controlLabel, eventName, isCapturing, modeDetails.output])

  const chooseMode = (mode) => {
    setSelectedMode(mode)
    setCapturePhase('idle')
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

  const startCapture = () => {
    setCapturePhase('capturing')
    setActivityMessage(`${modeDetails.primary} en progreso (${controlLabel})`)
  }

  const runTool = (tool) => {
    if (!hasRecording) {
      setActiveTab('grabar')
      setActivityMessage('Primero graba una captura antes de compartir')
      return
    }

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

  const goToNextTab = () => {
    const currentIndex = setupTabs.findIndex((tab) => tab.id === activeTab)
    const nextTab = setupTabs[Math.min(currentIndex + 1, setupTabs.length - 1)]
    setActiveTab(nextTab.id)
  }

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
          style={[styles.mobileTabButton, activeTab === tab.id && styles.mobileTabButtonActive]}
        >
          <Text style={[styles.mobileTabNumber, activeTab === tab.id && styles.mobileTabTextActive]}>
            {index + 1}
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
          style={[styles.desktopTabButton, activeTab === tab.id && styles.desktopTabButtonActive]}
        >
          <Text style={[styles.desktopTabIndex, activeTab === tab.id && styles.desktopTabTextActive]}>
            {index + 1}
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
        <Image source={selectedTemplate.image} style={styles.mobileCameraImage} />
        <View style={styles.mobileCameraShade} />
        <View style={[styles.mobileCountdown, isCapturing && styles.mobileCountdownActive]}>
          <Text style={styles.mobileCountdownText}>{displayCountdown}</Text>
        </View>
        <View style={styles.mobileCaptureMeta}>
          <Text style={styles.mobileCaptureMode}>{modeDetails.title}</Text>
          <Text style={styles.mobileCaptureBadge}>{displayBadge}</Text>
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

        {activeTab === 'evento' && (
          <>
            <View style={styles.mobileSection}>
              <Text style={styles.mobileSectionTitle}>Nombre del evento</Text>
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

            <Pressable onPress={goToNextTab} style={styles.mobileCaptureButton}>
              <Text style={styles.mobileCaptureButtonText}>Continuar configuracion</Text>
            </Pressable>
          </>
        )}

        {activeTab === 'config' && (
          <>
            <View style={styles.mobileSection}>
              <View style={styles.mobileSectionHeader}>
                <Text style={styles.mobileSectionTitle}>{modeDetails.title}</Text>
                <Text style={styles.mobileAccentText}>{displayBadge}</Text>
              </View>
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
              {modeDetails.settings.map((setting) => (
                <View key={setting} style={styles.mobileSettingRow}>
                  <View style={styles.mobileSettingDot} />
                  <Text style={styles.mobileSettingText}>{setting}</Text>
                </View>
              ))}
            </View>

            <View style={styles.mobileSection}>
              <Text style={styles.mobileSectionTitle}>Flujo</Text>
              {activeSteps.map((step, index) => (
                <View key={step} style={styles.mobileStep}>
                  <Text style={styles.mobileStepNumber}>{index + 1}</Text>
                  <Text style={styles.mobileStepText}>{step}</Text>
                </View>
              ))}
            </View>

            <Pressable onPress={goToNextTab} style={styles.mobileCaptureButton}>
              <Text style={styles.mobileCaptureButtonText}>Continuar diseno</Text>
            </Pressable>
          </>
        )}

        {activeTab === 'diseno' && (
          <>
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

            <Pressable onPress={goToNextTab} style={styles.mobileCaptureButton}>
              <Text style={styles.mobileCaptureButtonText}>Continuar a grabar</Text>
            </Pressable>
          </>
        )}

        {activeTab === 'grabar' && renderMobilePreview()}

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
                <Text style={styles.mobileSectionTitle}>Entrega</Text>
                <View style={styles.mobileModes}>
                  {modeDetails.tools.map((tool) => (
                    <Pressable
                      key={tool}
                      onPress={() => runTool(tool)}
                      style={styles.mobileModeButton}
                    >
                      <Text style={styles.mobileModeText}>{tool}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {hasRecording && (
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

            {activeTab === 'evento' && (
              <>
                <Text style={styles.panelLabel}>Nombre del evento</Text>
                <TextInput
                  value={eventName}
                  onChangeText={setEventName}
                  style={styles.desktopInput}
                  placeholder="Nombre del evento"
                  placeholderTextColor="#7d8188"
                />

                <Text style={styles.panelLabel}>Tipo de captura</Text>
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

            {activeTab === 'config' && (
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
                {modeDetails.settings.map((setting) => (
                  <View key={setting} style={styles.settingRow}>
                    <View style={styles.settingDot} />
                    <Text style={styles.settingText}>{setting}</Text>
                  </View>
                ))}
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
              </>
            )}

            {activeTab === 'diseno' && (
              <>
                <Text style={styles.panelLabel}>Filtro</Text>
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

                <Text style={styles.panelLabel}>Plantilla</Text>
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
                    <Text style={styles.panelLabel}>Canales de entrega</Text>
                    <View style={styles.modeRow}>
                      {modeDetails.tools.map((tool) => (
                        <Pressable key={tool} onPress={() => runTool(tool)} style={styles.modeButton}>
                          <Text style={styles.modeButtonText}>{tool}</Text>
                        </Pressable>
                      ))}
                    </View>

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
          </View>

          <View style={styles.previewColumn}>
            <View style={styles.cameraFrame}>
              <Image source={selectedTemplate.image} style={styles.cameraImage} />
              <View style={styles.cameraOverlay}>
                <Text style={[styles.countdown, isCapturing && styles.countdownActive]}>
                  {displayCountdown}
                </Text>
                <Text style={styles.cameraInstruction}>{modeDetails.title}</Text>
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
                        (isCapturing || capturePhase === 'complete') &&
                          index < (isCapturing ? 2 : 3) &&
                          styles.progressBarActive,
                      ]}
                    />
                    <Text style={styles.progressStepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
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
  mobileTabNumber: {
    width: 20,
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
    backgroundColor: colors.red,
  },
  mobileSettingText: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
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
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
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
  configControl: {
    backgroundColor: '#eef5ff',
    borderWidth: 1,
    borderColor: '#b8d5ff',
    padding: 14,
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
    backgroundColor: colors.red,
  },
  settingText: {
    color: colors.ink,
    fontSize: 14,
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
    backgroundColor: '#063fd1',
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
