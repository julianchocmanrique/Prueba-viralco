#!/usr/bin/env node

const http = require('http')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const port = Number(process.env.VIRALCO_PHOTO_API_PORT || 4174)
const uploadRoot = process.env.VIRALCO_PHOTO_UPLOAD_DIR || '/var/www/html/prueba-viralco/uploads/photos'
const stateRoot = process.env.VIRALCO_STATE_DIR || '/var/www/html/prueba-viralco/uploads/state'
const publicBaseUrl = process.env.VIRALCO_PHOTO_PUBLIC_BASE || 'https://www.viralcoproducciones.com/prueba-viralco/uploads/photos'
const maxBodyBytes = Number(process.env.VIRALCO_PHOTO_MAX_BYTES || 60 * 1024 * 1024)
const stateFilePath = path.join(stateRoot, 'app-state.json')
const syncToken = process.env.VIRALCO_SYNC_TOKEN || 'viralco-reset-20260821-login'
const resetStartedAt = new Date(process.env.VIRALCO_RESET_STARTED_AT || '2026-08-21T17:50:00.000Z').getTime()

const json = (response, statusCode, payload) => {
  const body = JSON.stringify(payload)
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  })
  response.end(body)
}

const defaultAppState = () => ({
  version: 2,
  updatedAt: new Date(0).toISOString(),
  users: [
    { id: 'super-admin', name: 'Super Admin', username: 'Superadmin', password: 'Superadmin1234', role: 'super_admin' },
    { id: 'admin-isaju', name: 'Isaju', username: 'Isaju', password: 'Isaju1234', role: 'admin' },
    { id: 'operador', name: 'Operador', username: 'operador', password: 'operador1234', role: 'operator', adminId: 'admin-isaju' },
  ],
  recentEvents: [],
  deletedEventIds: [],
  deletedGalleryPhotoIds: [],
  eventGalleries: {},
})

const allowedUserIds = new Set(defaultAppState().users.map((user) => user.id))

const sanitizeArray = (value, limit = 300) => (
  Array.isArray(value) ? value.filter(Boolean).slice(0, limit) : []
)

const itemIdentity = (item) => safeText(item?.id || item?.name || item?.eventName, 180) || crypto
  .createHash('md5')
  .update(JSON.stringify(item || {}))
  .digest('hex')

const itemTimestamp = (item) => safeText(item?.updatedAt || item?.createdAt || item?.savedAt, 80)

const mergeItemsByIdentity = (currentItems = [], incomingItems = [], limit = 300) => {
  const merged = new Map()
  ;[...sanitizeArray(currentItems, limit), ...sanitizeArray(incomingItems, limit)].forEach((item) => {
    const identity = itemIdentity(item)
    const existing = merged.get(identity)
    if (!existing || itemTimestamp(item) >= itemTimestamp(existing)) {
      merged.set(identity, item)
    }
  })
  return [...merged.values()]
    .sort((a, b) => itemTimestamp(b).localeCompare(itemTimestamp(a)))
    .slice(0, limit)
}

const isAfterReset = (item) => {
  const stamp = Date.parse(item?.createdAt || item?.savedAt || item?.updatedAt || '')
  return Number.isFinite(stamp) && stamp >= resetStartedAt
}

const sanitizeGalleryItems = (items) => (
  sanitizeArray(items, 120).filter(isAfterReset).map((item) => ({
    id: safeText(item?.id, 180),
    eventId: safeText(item?.eventId, 180),
    operatorId: safeText(item?.operatorId, 80),
    eventName: safeText(item?.eventName, 160),
    photoType: safeText(item?.photoType, 120),
    templateName: safeText(item?.templateName, 120),
    createdAt: safeText(item?.createdAt, 80),
    src: safeText(item?.src || item?.publicUrl, 600),
    publicUrl: safeText(item?.publicUrl || item?.src, 600),
    localUrl: '',
    frames: Number.isFinite(Number(item?.frames)) ? Number(item.frames) : 0,
  })).filter((item) => item.src || item.publicUrl)
)

const galleryPhotoIdentity = (item) => safeText(item?.id || item?.publicUrl || item?.src, 600)

const sanitizeUsers = (users) => (
  sanitizeArray(users, 100).map((user) => ({
    id: safeText(user?.id, 80),
    name: safeText(user?.name, 120),
    username: safeText(user?.username, 80),
    password: safeText(user?.password, 120),
    role: ['super_admin', 'admin', 'operator'].includes(user?.role) ? user.role : 'operator',
    adminId: safeText(user?.adminId, 80),
  })).filter((user) => allowedUserIds.has(user.id) && user.username && user.role)
)

const mergeUsersWithDefaults = (users) => {
  const merged = sanitizeUsers(users)
  defaultAppState().users.forEach((defaultUser) => {
    const currentIndex = merged.findIndex((user) => user.id === defaultUser.id)
    if (currentIndex >= 0) merged[currentIndex] = { ...merged[currentIndex], ...defaultUser }
    else merged.push(defaultUser)
  })
  return merged
}

const sanitizeAppState = (payload, current = defaultAppState()) => {
  const acceptsSharedData = Number(payload?.schemaVersion) >= 2 && payload?.syncToken === syncToken
  const deletedGalleryPhotoIds = [...new Set([
    ...sanitizeArray(current.deletedGalleryPhotoIds, 500),
    ...(acceptsSharedData ? sanitizeArray(payload?.deletedGalleryPhotoIds, 500) : []),
  ].map((id) => safeText(id, 600)).filter(Boolean))].slice(-500)
  const deletedGalleryPhotoSet = new Set(deletedGalleryPhotoIds)
  const eventGalleries = { ...(current.eventGalleries || {}) }
  if (acceptsSharedData && payload?.eventGalleries && typeof payload.eventGalleries === 'object') {
    Object.entries(payload.eventGalleries).slice(0, 300).forEach(([key, gallery]) => {
      const galleryId = safeText(gallery?.id || key, 180)
      if (!galleryId) return
      const currentGallery = eventGalleries[galleryId] || {}
      const items = sanitizeGalleryItems(mergeItemsByIdentity(currentGallery.items, gallery?.items, 120))
        .filter((item) => !deletedGalleryPhotoSet.has(galleryPhotoIdentity(item)))
      if (!items.length) {
        delete eventGalleries[galleryId]
        return
      }
      eventGalleries[galleryId] = {
        id: galleryId,
        eventName: safeText(gallery?.eventName || currentGallery.eventName, 160),
        operatorId: safeText(gallery?.operatorId || currentGallery.operatorId, 80),
        updatedAt: safeText(gallery?.updatedAt || currentGallery.updatedAt, 80),
        items,
      }
    })
  }

  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    users: mergeUsersWithDefaults(sanitizeUsers(payload?.users).length ? payload.users : current.users),
    recentEvents: acceptsSharedData
      ? mergeItemsByIdentity(current.recentEvents, sanitizeArray(payload?.recentEvents, 300).filter(isAfterReset), 300)
      : sanitizeArray(current.recentEvents, 300),
    deletedEventIds: [...new Set([
      ...sanitizeArray(current.deletedEventIds, 300),
      ...(acceptsSharedData ? sanitizeArray(payload?.deletedEventIds, 300) : []),
    ].map((id) => safeText(id, 180)).filter(Boolean))],
    deletedGalleryPhotoIds,
    eventGalleries,
  }
}

const readAppState = async () => {
  await fs.promises.mkdir(stateRoot, { recursive: true })
  try {
    const state = JSON.parse(await fs.promises.readFile(stateFilePath, 'utf8'))
    return {
      ...defaultAppState(),
      ...state,
      users: mergeUsersWithDefaults(state.users),
      recentEvents: sanitizeArray(state.recentEvents, 300),
      deletedEventIds: sanitizeArray(state.deletedEventIds, 300),
      deletedGalleryPhotoIds: sanitizeArray(state.deletedGalleryPhotoIds, 500),
      eventGalleries: state.eventGalleries && typeof state.eventGalleries === 'object' ? state.eventGalleries : {},
    }
  } catch {
    return defaultAppState()
  }
}

const writeAppState = async (payload) => {
  await fs.promises.mkdir(stateRoot, { recursive: true })
  const current = await readAppState()
  const next = sanitizeAppState(payload, current)
  const tmpPath = `${stateFilePath}.${process.pid}.${Date.now()}.tmp`
  await fs.promises.writeFile(tmpPath, JSON.stringify(next, null, 2))
  await fs.promises.rename(tmpPath, stateFilePath)
  return next
}

const readBody = (request) =>
  new Promise((resolve, reject) => {
    const chunks = []
    let size = 0

    request.on('data', (chunk) => {
      size += chunk.length
      if (size > maxBodyBytes) {
        reject(new Error('La foto es demasiado pesada.'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })

    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    request.on('error', reject)
  })

const parseImage = (value) => {
  if (typeof value !== 'string') return null
  const match = value.match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\r\n]+)$/)
  if (!match) return null

  const extension = match[1] === 'jpeg' ? 'jpg' : match[1]
  return {
    extension,
    buffer: Buffer.from(match[2].replace(/\s/g, ''), 'base64'),
  }
}

const safeText = (value, maxLength = 120) =>
  String(value || '')
    .replace(/[\u0000-\u001f<>:"/\\|?*]+/g, ' ')
    .trim()
    .slice(0, maxLength)

const createPhotoId = () => {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-')
  return `${stamp}-${crypto.randomBytes(4).toString('hex')}`
}

const safePhotoId = (value) =>
  String(value || '')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .slice(0, 180)

const safeEventFolderId = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'sin-evento'

const photoUrl = (eventFolderId, photoId, fileName) => {
  const folder = eventFolderId ? `${eventFolderId}/` : ''
  return `${publicBaseUrl}/${folder}${photoId}/${fileName}`
}

const readSavedPhotos = async () => {
  await fs.promises.mkdir(uploadRoot, { recursive: true })
  const entries = await fs.promises.readdir(uploadRoot, { withFileTypes: true })
  const photos = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const rootEntryPath = path.join(uploadRoot, entry.name)
    const candidates = []

    // Keeps photos uploaded before event folders were introduced available.
    if (fs.existsSync(path.join(rootEntryPath, 'metadata.json'))) {
      candidates.push({ photoDir: rootEntryPath, photoId: entry.name, eventFolderId: '' })
    } else {
      const children = await fs.promises.readdir(rootEntryPath, { withFileTypes: true }).catch(() => [])
      children.filter((child) => child.isDirectory()).forEach((child) => {
        candidates.push({
          photoDir: path.join(rootEntryPath, child.name),
          photoId: child.name,
          eventFolderId: entry.name,
        })
      })
    }

    for (const candidate of candidates) {
      try {
        const metadata = JSON.parse(await fs.promises.readFile(path.join(candidate.photoDir, 'metadata.json'), 'utf8'))
        const finalFileName = metadata.finalFileName || 'final.jpg'
        photos.push({
          ...metadata,
          id: metadata.id || candidate.photoId,
          eventFolderId: metadata.eventFolderId || candidate.eventFolderId,
          url: `/prueba-viralco/uploads/photos/${candidate.eventFolderId ? `${candidate.eventFolderId}/` : ''}${candidate.photoId}/${finalFileName}`,
          absoluteUrl: photoUrl(candidate.eventFolderId, candidate.photoId, finalFileName),
          frameCount: Array.isArray(metadata.frames) ? metadata.frames.length : 0,
        })
      } catch {
        // Ignore incomplete upload folders.
      }
    }
  }

  return photos.sort((a, b) => (
    new Date(b.createdAt || b.savedAt || 0).getTime() - new Date(a.createdAt || a.savedAt || 0).getTime()
  ))
}

const handlePhotoUpload = async (request, response) => {
  const rawBody = await readBody(request)
  const payload = JSON.parse(rawBody || '{}')
  if (payload?.syncToken !== syncToken) {
    json(response, 409, { ok: false, error: 'Actualiza la página para sincronizar fotos.' })
    return
  }
  const finalImage = parseImage(payload.finalPhoto)

  if (!finalImage?.buffer?.length) {
    json(response, 400, { ok: false, error: 'No llegó una foto final válida.' })
    return
  }

  await fs.promises.mkdir(uploadRoot, { recursive: true })

  const id = createPhotoId()
  const eventFolderId = safeEventFolderId(payload.eventId || payload.eventName)
  const photoDir = path.join(uploadRoot, eventFolderId, id)
  await fs.promises.mkdir(photoDir, { recursive: true })

  const finalFileName = `final.${finalImage.extension}`
  await fs.promises.writeFile(path.join(photoDir, finalFileName), finalImage.buffer)

  const savedFrames = []
  if (Array.isArray(payload.frames)) {
    for (const [index, frameValue] of payload.frames.entries()) {
      const frameImage = parseImage(frameValue)
      if (!frameImage?.buffer?.length) continue
      const fileName = `foto-${index + 1}.${frameImage.extension}`
      await fs.promises.writeFile(path.join(photoDir, fileName), frameImage.buffer)
      savedFrames.push(fileName)
    }
  }

  const metadata = {
    id,
    eventId: safeText(payload.eventId),
    eventFolderId,
    operatorId: safeText(payload.operatorId),
    eventName: safeText(payload.eventName),
    eventType: safeText(payload.eventType),
    photoType: safeText(payload.photoType),
    photoTypeId: safeText(payload.photoTypeId),
    templateId: safeText(payload.templateId),
    templateName: safeText(payload.templateName),
    filter: safeText(payload.filter),
    createdAt: payload.createdAt || new Date().toISOString(),
    savedAt: new Date().toISOString(),
    finalFileName,
    frames: savedFrames,
  }

  await fs.promises.writeFile(path.join(photoDir, 'metadata.json'), JSON.stringify(metadata, null, 2))

  json(response, 200, {
    ok: true,
    id,
    url: `/prueba-viralco/uploads/photos/${eventFolderId}/${id}/${finalFileName}`,
    absoluteUrl: photoUrl(eventFolderId, id, finalFileName),
    frames: savedFrames.map((fileName) => photoUrl(eventFolderId, id, fileName)),
  })
}

const handlePhotoDelete = async (request, response) => {
  const rawBody = await readBody(request)
  const payload = JSON.parse(rawBody || '{}')
  if (payload?.syncToken !== syncToken) {
    json(response, 409, { ok: false, error: 'Actualiza la página para sincronizar fotos.' })
    return
  }

  const id = safePhotoId(payload.id)
  if (!id) {
    json(response, 400, { ok: false, error: 'No llegó el id de la foto.' })
    return
  }

  const rootPath = path.resolve(uploadRoot)
  const eventFolderId = safeEventFolderId(payload.eventId)
  let photoDir = path.resolve(uploadRoot, eventFolderId, id)

  // Fall back to the previous flat layout and to a scan for old gallery records.
  if (!fs.existsSync(photoDir)) {
    const flatDir = path.resolve(uploadRoot, id)
    if (fs.existsSync(flatDir)) {
      photoDir = flatDir
    } else {
      const folders = await fs.promises.readdir(uploadRoot, { withFileTypes: true }).catch(() => [])
      for (const folder of folders) {
        if (!folder.isDirectory()) continue
        const candidate = path.resolve(uploadRoot, folder.name, id)
        if (fs.existsSync(candidate)) {
          photoDir = candidate
          break
        }
      }
    }
  }
  if (!photoDir.startsWith(`${rootPath}${path.sep}`)) {
    json(response, 400, { ok: false, error: 'Id de foto no válido.' })
    return
  }

  await fs.promises.rm(photoDir, { recursive: true, force: true })
  json(response, 200, { ok: true, id })
}

const handleEventGalleryDelete = async (request, response) => {
  const rawBody = await readBody(request)
  const payload = JSON.parse(rawBody || '{}')
  if (payload?.syncToken !== syncToken) {
    json(response, 409, { ok: false, error: 'Actualiza la página para sincronizar fotos.' })
    return
  }

  const eventFolderId = safeEventFolderId(payload.eventId || payload.eventName)
  if (eventFolderId === 'sin-evento') {
    json(response, 400, { ok: false, error: 'No llegó el evento a eliminar.' })
    return
  }
  const rootPath = path.resolve(uploadRoot)
  const eventDir = path.resolve(uploadRoot, eventFolderId)
  if (!eventDir.startsWith(`${rootPath}${path.sep}`)) {
    json(response, 400, { ok: false, error: 'Evento no válido.' })
    return
  }
  await fs.promises.rm(eventDir, { recursive: true, force: true })
  json(response, 200, { ok: true, eventFolderId })
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost')
    const pathname = url.pathname.replace(/\/+$/, '') || '/'

    if (request.method === 'OPTIONS') {
      json(response, 204, {})
      return
    }

    if (request.method === 'GET' && (pathname === '/health' || pathname === '/prueba-viralco/api/photos/health')) {
      json(response, 200, { ok: true })
      return
    }

    if (request.method === 'GET' && (pathname === '/photos' || pathname === '/prueba-viralco/api/photos')) {
      const photos = await readSavedPhotos()
      json(response, 200, { ok: true, photos })
      return
    }

    if (request.method === 'GET' && (pathname === '/state' || pathname === '/prueba-viralco/api/state')) {
      const state = await readAppState()
      json(response, 200, { ok: true, state })
      return
    }

    if (request.method === 'POST' && (pathname === '/state' || pathname === '/prueba-viralco/api/state')) {
      const rawBody = await readBody(request)
      const payload = JSON.parse(rawBody || '{}')
      const state = await writeAppState(payload)
      json(response, 200, { ok: true, state })
      return
    }

    if (request.method === 'POST' && (pathname === '/photos' || pathname === '/prueba-viralco/api/photos')) {
      await handlePhotoUpload(request, response)
      return
    }

    if (request.method === 'POST' && (pathname === '/photos/delete' || pathname === '/prueba-viralco/api/photos/delete')) {
      await handlePhotoDelete(request, response)
      return
    }

    if (request.method === 'POST' && (pathname === '/photos/delete-event' || pathname === '/prueba-viralco/api/photos/delete-event')) {
      await handleEventGalleryDelete(request, response)
      return
    }

    json(response, 404, { ok: false, error: 'Ruta no encontrada.' })
  } catch (error) {
    json(response, 500, { ok: false, error: error.message || 'Error guardando la foto.' })
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Viralco photo API listening on http://127.0.0.1:${port}`)
  console.log(`Saving photos in ${uploadRoot}`)
})
