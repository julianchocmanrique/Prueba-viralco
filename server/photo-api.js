#!/usr/bin/env node

const http = require('http')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const port = Number(process.env.VIRALCO_PHOTO_API_PORT || 4174)
const uploadRoot = process.env.VIRALCO_PHOTO_UPLOAD_DIR || '/var/www/html/prueba-viralco/uploads/photos'
const publicBaseUrl = process.env.VIRALCO_PHOTO_PUBLIC_BASE || 'https://www.viralcoproducciones.com/prueba-viralco/uploads/photos'
const maxBodyBytes = Number(process.env.VIRALCO_PHOTO_MAX_BYTES || 60 * 1024 * 1024)

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

const handlePhotoUpload = async (request, response) => {
  const rawBody = await readBody(request)
  const payload = JSON.parse(rawBody || '{}')
  const finalImage = parseImage(payload.finalPhoto)

  if (!finalImage?.buffer?.length) {
    json(response, 400, { ok: false, error: 'No llegó una foto final válida.' })
    return
  }

  await fs.promises.mkdir(uploadRoot, { recursive: true })

  const id = createPhotoId()
  const photoDir = path.join(uploadRoot, id)
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
    url: `/prueba-viralco/uploads/photos/${id}/${finalFileName}`,
    absoluteUrl: `${publicBaseUrl}/${id}/${finalFileName}`,
    frames: savedFrames.map((fileName) => `${publicBaseUrl}/${id}/${fileName}`),
  })
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost')

    if (request.method === 'OPTIONS') {
      json(response, 204, {})
      return
    }

    if (request.method === 'GET' && (url.pathname === '/health' || url.pathname === '/prueba-viralco/api/photos/health')) {
      json(response, 200, { ok: true })
      return
    }

    if (request.method === 'POST' && (url.pathname === '/photos' || url.pathname === '/prueba-viralco/api/photos')) {
      await handlePhotoUpload(request, response)
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
