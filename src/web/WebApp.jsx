import React, { useMemo, useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

const WebApp = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[1])
  const [selectedMode, setSelectedMode] = useState('360')
  const [selectedFilter, setSelectedFilter] = useState('Original')
  const [copies, setCopies] = useState(1)
  const [eventName, setEventName] = useState('Viralco live booth')

  const layoutSlots = useMemo(
    () => [
      { id: 1, width: '58%', height: 138, top: 18, left: 18, color: selectedTemplate.tone },
      { id: 2, width: '34%', height: 138, top: 18, right: 18, color: '#101820' },
      { id: 3, width: '43%', height: 118, bottom: 18, left: 18, color: '#f1c75b' },
      { id: 4, width: '49%', height: 118, bottom: 18, right: 18, color: '#5d7287' },
    ],
    [selectedTemplate],
  )

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={styles.appShell}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>Prueba Viralco Booth</Text>
            <Text style={styles.brandSub}>Kiosco web inspirado en flujo tipo LumaBooth</Text>
          </View>
          <View style={styles.topActions}>
            <View style={styles.syncPill}>
              <View style={styles.syncDot} />
              <Text style={styles.syncText}>LISTO</Text>
            </View>
            <Text style={styles.topMeta}>Evento / {selectedMode}</Text>
          </View>
        </View>

        <View style={styles.mainGrid}>
          <View style={styles.captureColumn}>
            <View style={styles.captureHeader}>
              <View>
                <Text style={styles.screenTitle}>{eventName}</Text>
                <Text style={styles.screenCaption}>Vista de captura para invitado</Text>
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
                <Text style={styles.countdown}>3</Text>
                <Text style={styles.cameraInstruction}>Mira a la camara</Text>
              </View>
              <View style={styles.sideTools}>
                {['Email', 'SMS', 'QR', 'Print'].map((tool) => (
                  <Pressable key={tool} style={styles.sideTool}>
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
                    onPress={() => setSelectedMode(mode)}
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
                <Pressable style={styles.printButton}>
                  <Text style={styles.printButtonText}>Imprimir</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.workflowColumn}>
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Flujo del invitado</Text>
              <View style={styles.steps}>
                {shareSteps.map((step, index) => (
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
  bg: '#f2f3f5',
  panel: '#ffffff',
  ink: '#22252a',
  muted: '#6b717a',
  line: '#dedfe3',
  red: '#ef4b4b',
  blue: '#1688d6',
  dark: '#2f3136',
}

const shadow = {
  boxShadow: '0 12px 32px rgba(20, 24, 33, 0.10)',
}

const styles = StyleSheet.create({
  page: {
    minHeight: '100vh',
    backgroundColor: colors.bg,
  },
  pageContent: {
    width: '100%',
    padding: 18,
  },
  appShell: {
    width: '100%',
    maxWidth: 1320,
    alignSelf: 'center',
  },
  topBar: {
    minHeight: 68,
    paddingHorizontal: 22,
    backgroundColor: colors.panel,
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
    backgroundColor: '#eef8f2',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#c9ead6',
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#23a35b',
  },
  syncText: {
    color: '#177644',
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
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    color: colors.red,
    fontSize: 82,
    lineHeight: 140,
    fontWeight: '900',
    textAlign: 'center',
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
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
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
})
