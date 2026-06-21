import React from 'react'
import { createRoot } from 'react-dom/client'
import { AppRegistry } from 'react-native'
import WebApp from './src/web/WebApp.jsx'
import './src/web/global.css'

AppRegistry.registerComponent('PruebaViralcoWeb', () => WebApp)

const rootTag = document.getElementById('root')
const RootComponent = AppRegistry.getApplication('PruebaViralcoWeb').element

createRoot(rootTag).render(RootComponent)
