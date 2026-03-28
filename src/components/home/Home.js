import React, { useRef } from 'react'
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
  Pressable,
  Animated,
  StatusBar,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

const DS = {
  bg: '#0b1326',
  bgElevated: '#171f33',
  bgPanel: '#222a3d',
  bgInteractive: '#2d3449',
  textPrimary: '#dae2fd',
  textSecondary: '#b9c7e0',
  textMuted: '#abb9d2',
  amber: '#ffbf00',
  amberSoft: '#ffe2ab',
  amberPressed: '#fbbc00',
  cyan: '#04dcff',
  cyanSoft: 'rgba(4, 220, 255, 0.16)',
  borderSubtle: 'rgba(156, 143, 120, 0.15)',
  borderAccent: 'rgba(255, 191, 0, 0.35)',
  overlay: 'rgba(6, 14, 32, 0.24)',
}

const templates = [
  {
    id: 1,
    name: 'Bodas',
    subtitle: 'Elegancia cinematografica para capturar el "si" eterno y los momentos magicos.',
    tone: 'Signature',
    image: require('../../assets/plantillas/boda.png'),
  },
  {
    id: 2,
    name: 'Fiestas Privadas',
    subtitle: 'Diversion sin limites, luces de neon y energia en bucle para toda la noche.',
    tone: 'Live',
    image: require('../../assets/plantillas/fiesta.png'),
  },
  {
    id: 3,
    name: 'Eventos Corporativos',
    subtitle: 'Networking y presencia de marca con una estetica premium.',
    tone: 'Brand',
    image: require('../../assets/plantillas/navidad.png'),
  },
  {
    id: 4,
    name: 'Cumpleanos',
    subtitle: 'Velas, sonrisas y recuerdos calidos en una toma inolvidable.',
    tone: 'Warm',
    image: require('../../assets/plantillas/cumple.png'),
  },
  {
    id: 5,
    name: 'Tropical',
    subtitle: 'Vibras de verano y color para fiestas intensas.',
    tone: 'Color',
    image: require('../../assets/plantillas/tropical.png'),
  },
]

const heroMetrics = [
  { label: 'Plantillas activas', value: '05' },
  { label: 'Flujo listo', value: '360' },
  { label: 'Estado', value: 'LIVE' },
]

const TemplateCard = ({ item, onSelect }) => {
  const scale = useRef(new Animated.Value(1)).current

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 22,
      bounciness: 4,
    }).start()
  }

  return (
    <Animated.View style={[styles.templateCard, { transform: [{ scale }] }]}>
      <Image source={item.image} style={styles.templateImage} />
      <View style={styles.templateShade} />
      <View style={styles.templateGlow} />

      <View style={styles.templateTopRow}>
        <View style={styles.templateTonePill}>
          <View style={styles.templateToneDot} />
          <Text style={styles.templateToneText}>{item.tone}</Text>
        </View>
        <View style={styles.templateIndex}>
          <Text style={styles.templateIndexText}>{String(item.id).padStart(2, '0')}</Text>
        </View>
      </View>

      <View style={styles.templateBody}>
        <Text style={styles.templateName}>{item.name}</Text>
        <Text style={styles.templateSubtitle}>{item.subtitle}</Text>
        <Pressable
          style={styles.selectBtn}
          onPress={() => onSelect()}
          onPressIn={() => animateTo(0.985)}
          onPressOut={() => animateTo(1)}
        >
          <Text style={styles.selectBtnText}>Crear nuevo evento</Text>
          <View style={styles.selectBtnIcon}>
            <Icon name="arrow-forward" size={14} color={DS.bg} />
          </View>
        </Pressable>
      </View>
    </Animated.View>
  )
}

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <View style={styles.chromeGlowOne} />
      <View style={styles.chromeGlowTwo} />

      <View style={styles.header}>
        <View style={styles.brandBlock}>
          <View style={styles.brandIcon}>
            <Icon name="videocam" size={16} color={DS.bg} />
          </View>
          <View>
            <Text style={styles.brandLabel}>INMERSA</Text>
            <Text style={styles.brandSubLabel}>Nocturnal console</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.headerAction}>
          <Icon name="notifications-outline" size={17} color={DS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroPanel}>
          <View style={styles.heroStatusRow}>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Sistema listo</Text>
            </View>
            <Text style={styles.heroMeta}>Viralco DS</Text>
          </View>

          <Text style={styles.heroEyebrow}>Inicio / Eventos inmersivos</Text>
          <Text style={styles.heroTitle}>Que celebramos hoy?</Text>
          <Text style={styles.heroSubtitle}>
            Elige una plantilla y lanza un flujo visual con atmosfera premium, ritmo rapido y salida lista para 360.
          </Text>

          <View style={styles.metricsRow}>
            {heroMetrics.map((metric) => (
              <View key={metric.label} style={styles.metricCard}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Plantillas curadas</Text>
            <Text style={styles.sectionSubtitle}>Capas tonales, foco cinematico y accion directa.</Text>
          </View>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{templates.length} modos</Text>
          </View>
        </View>

        <View style={styles.cardsWrap}>
          {templates.map((item) => (
            <TemplateCard
              key={item.id}
              item={item}
              onSelect={() => navigation.navigate('Configuracion', { plantilla: item })}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomNavShell}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.activeIconWrap}>
              <Icon name="home" size={18} color={DS.bg} />
            </View>
            <Text style={[styles.navText, styles.navTextActive]}>INICIO</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('VideosList')}>
            <View style={styles.navIconWrap}>
              <Icon name="images-outline" size={18} color={DS.textSecondary} />
            </View>
            <Text style={styles.navText}>GALERIA</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <View style={styles.navIconWrap}>
              <Icon name="settings-outline" size={18} color={DS.textSecondary} />
            </View>
            <Text style={styles.navText}>AJUSTES</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  chromeGlowOne: {
    position: 'absolute',
    top: -110,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 191, 0, 0.09)',
  },
  chromeGlowTwo: {
    position: 'absolute',
    top: 130,
    left: -90,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(4, 220, 255, 0.07)',
  },
  header: {
    paddingTop: 46,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: DS.amber,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: DS.amber,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  brandLabel: {
    color: DS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  brandSubLabel: {
    color: DS.textMuted,
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(45, 52, 73, 0.7)',
    borderWidth: 1,
    borderColor: DS.borderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 132,
  },
  heroPanel: {
    marginHorizontal: 16,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(23, 31, 51, 0.92)',
    borderWidth: 1,
    borderColor: DS.borderSubtle,
    shadowColor: '#020612',
    shadowOpacity: 0.34,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  heroStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: DS.cyanSoft,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: DS.cyan,
    marginRight: 8,
  },
  liveText: {
    color: DS.cyan,
    fontSize: 12,
    fontWeight: '700',
  },
  heroMeta: {
    color: DS.amberSoft,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  heroEyebrow: {
    color: DS.textMuted,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroTitle: {
    color: DS.textPrimary,
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 40,
    letterSpacing: -1.3,
    maxWidth: '92%',
  },
  heroSubtitle: {
    color: DS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: 18,
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(45, 52, 73, 0.68)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  metricValue: {
    color: DS.amberSoft,
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    color: DS.textMuted,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  sectionHeader: {
    marginTop: 20,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    color: DS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    marginTop: 4,
    color: DS.textMuted,
    fontSize: 12,
    maxWidth: 220,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 191, 0, 0.1)',
    borderWidth: 1,
    borderColor: DS.borderAccent,
  },
  sectionBadgeText: {
    color: DS.amberSoft,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardsWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  templateCard: {
    marginTop: 14,
    height: 330,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: DS.bgElevated,
    borderWidth: 1,
    borderColor: DS.borderSubtle,
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  templateShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS.overlay,
  },
  templateGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 190,
    backgroundColor: 'rgba(6, 14, 32, 0.92)',
  },
  templateTopRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateTonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 19, 38, 0.74)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.12)',
  },
  templateToneDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: DS.cyan,
    marginRight: 8,
  },
  templateToneText: {
    color: DS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  templateIndex: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(11, 19, 38, 0.74)',
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateIndexText: {
    color: DS.amberSoft,
    fontSize: 12,
    fontWeight: '800',
  },
  templateBody: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  templateName: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 36,
    letterSpacing: -0.9,
  },
  templateSubtitle: {
    color: DS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  selectBtn: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: DS.amber,
    borderWidth: 1,
    borderColor: DS.amberPressed,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectBtnText: {
    color: DS.bg,
    fontSize: 14,
    fontWeight: '800',
  },
  selectBtnIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(11, 19, 38, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  bottomNav: {
    height: 78,
    borderRadius: 20,
    backgroundColor: 'rgba(23, 31, 51, 0.96)',
    borderWidth: 1,
    borderColor: DS.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#020612',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: DS.amber,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  navIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: DS.bgInteractive,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  navText: {
    color: DS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  navTextActive: {
    color: DS.textPrimary,
  },
})
