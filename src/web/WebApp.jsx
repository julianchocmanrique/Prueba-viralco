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
    category: 'Elegante',
    duration: '30s',
    image: bodaImage,
    description: 'Una salida sobria para ceremonias, brindis y momentos formales.',
  },
  {
    id: 'fiesta',
    name: 'Fiestas privadas',
    category: 'Live',
    duration: '30s',
    image: fiestaImage,
    description: 'Color, ritmo y una presencia visual pensada para alta energia.',
  },
  {
    id: 'corporativo',
    name: 'Corporativos',
    category: 'Marca',
    duration: '30s',
    image: navidadImage,
    description: 'Un look pulido para activaciones, lanzamientos y eventos de empresa.',
  },
  {
    id: 'cumple',
    name: 'Cumpleanos',
    category: 'Social',
    duration: '30s',
    image: cumpleImage,
    description: 'Un flujo cercano y brillante para celebraciones familiares.',
  },
  {
    id: 'tropical',
    name: 'Tropical',
    category: 'Color',
    duration: '30s',
    image: tropicalImage,
    description: 'Vibras intensas para eventos de verano, playa y fiesta abierta.',
  },
]

const effects = ['Normal', 'Rapida 2x', 'Rapida 4x', 'Lenta 0.5x', 'Boomerang']

const WebApp = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [selectedEffect, setSelectedEffect] = useState(effects[0])
  const [clientName, setClientName] = useState('')

  const summary = useMemo(
    () => [
      { label: 'Plantilla', value: selectedTemplate.name },
      { label: 'Efecto', value: selectedEffect },
      { label: 'Duracion', value: selectedTemplate.duration },
    ],
    [selectedEffect, selectedTemplate],
  )

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>Prueba viralco</Text>
          <Text style={styles.brandSub}>Experiencia 360 para eventos</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>WEB ACTIVA</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>React Native Web</Text>
          <Text style={styles.title}>Crea una experiencia 360 lista para presentar</Text>
          <Text style={styles.subtitle}>
            Selecciona una plantilla, ajusta el ritmo y prepara una propuesta visual
            para el cliente desde el navegador.
          </Text>

          <View style={styles.formRow}>
            <TextInput
              value={clientName}
              onChangeText={setClientName}
              placeholder="Nombre del evento o cliente"
              placeholderTextColor="#73736d"
              style={styles.input}
            />
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Preparar flujo</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.previewPanel}>
          <Image source={selectedTemplate.image} style={styles.previewImage} />
          <View style={styles.previewFooter}>
            <Text style={styles.previewTitle}>{selectedTemplate.name}</Text>
            <Text style={styles.previewMeta}>
              {clientName.trim() || 'Evento sin nombre'} / {selectedEffect}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryRow}>
        {summary.map((item) => (
          <View key={item.label} style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{item.label}</Text>
            <Text style={styles.summaryValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Plantillas</Text>
          <Text style={styles.sectionText}>Opciones importadas del proyecto movil original.</Text>
        </View>
      </View>

      <View style={styles.templateGrid}>
        {templates.map((template) => {
          const isActive = selectedTemplate.id === template.id
          return (
            <Pressable
              key={template.id}
              onPress={() => setSelectedTemplate(template)}
              style={[styles.templateCard, isActive && styles.templateCardActive]}
            >
              <Image source={template.image} style={styles.templateImage} />
              <View style={styles.templateContent}>
                <View style={styles.templateMetaRow}>
                  <Text style={styles.templateCategory}>{template.category}</Text>
                  <Text style={styles.templateDuration}>{template.duration}</Text>
                </View>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
              </View>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.controlsBand}>
        <View>
          <Text style={styles.sectionTitle}>Efectos</Text>
          <Text style={styles.sectionText}>Selecciona el ritmo base del video 360.</Text>
        </View>
        <View style={styles.effectsRow}>
          {effects.map((effect) => (
            <Pressable
              key={effect}
              onPress={() => setSelectedEffect(effect)}
              style={[styles.effectChip, selectedEffect === effect && styles.effectChipActive]}
            >
              <Text
                style={[
                  styles.effectText,
                  selectedEffect === effect && styles.effectTextActive,
                ]}
              >
                {effect}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default WebApp

const colors = {
  ink: '#101820',
  muted: '#5f635f',
  paper: '#f4f1ea',
  panel: '#fffaf0',
  line: '#d7c9ad',
  amber: '#d9951e',
  teal: '#0b6f6a',
}

const styles = StyleSheet.create({
  page: {
    minHeight: '100vh',
    backgroundColor: colors.paper,
  },
  pageContent: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 48,
  },
  topBar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  brand: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  brandSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  statusPill: {
    borderWidth: 1,
    borderColor: colors.teal,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: '800',
  },
  hero: {
    flexDirection: 'row',
    gap: 28,
    paddingTop: 42,
    alignItems: 'stretch',
  },
  heroCopy: {
    flex: 1.05,
    justifyContent: 'center',
    minWidth: 280,
  },
  kicker: {
    color: colors.teal,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: colors.ink,
    fontSize: 54,
    lineHeight: 58,
    fontWeight: '900',
    maxWidth: 650,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 18,
    lineHeight: 28,
    marginTop: 18,
    maxWidth: 590,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
    maxWidth: 620,
  },
  input: {
    flex: 1,
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    color: colors.ink,
    fontSize: 15,
    paddingHorizontal: 16,
  },
  primaryButton: {
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  previewPanel: {
    flex: 0.95,
    minWidth: 280,
    backgroundColor: colors.ink,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    resizeMode: 'cover',
  },
  previewFooter: {
    padding: 18,
  },
  previewTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  previewMeta: {
    color: '#dce9e7',
    marginTop: 6,
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  summaryItem: {
    flex: 1,
    borderTopWidth: 2,
    borderTopColor: colors.amber,
    backgroundColor: colors.panel,
    padding: 16,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 8,
  },
  sectionHeader: {
    marginTop: 42,
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '900',
  },
  sectionText: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 5,
  },
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
  },
  templateCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  templateCardActive: {
    borderColor: colors.teal,
    boxShadow: '0 8px 24px rgba(16, 24, 32, 0.14)',
  },
  templateImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    resizeMode: 'cover',
  },
  templateContent: {
    padding: 14,
  },
  templateMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  templateCategory: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  templateDuration: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  templateName: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 10,
  },
  templateDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  controlsBand: {
    marginTop: 36,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 24,
  },
  effectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  effectChip: {
    minHeight: 42,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
  },
  effectChipActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  effectText: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 14,
  },
  effectTextActive: {
    color: '#ffffff',
  },
  '@media (max-width: 820px)': {
    hero: {
      flexDirection: 'column',
      paddingTop: 28,
    },
    title: {
      fontSize: 38,
      lineHeight: 42,
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 24,
    },
    formRow: {
      flexDirection: 'column',
    },
    summaryRow: {
      flexDirection: 'column',
    },
  },
})
