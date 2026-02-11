// === MAIN ===

import { effectManager } from './effects.js'
import {
	cursorEffect,
	glareEffect,
	hackerEffect,
	popupEffect,
	scatterEffect,
	scrollbarEffect,
	smoothScrollEffect
} from '../effects/index.js'

// Setup effects for all pages

effectManager.add(cursorEffect)
effectManager.add(glareEffect)
effectManager.add(smoothScrollEffect)
effectManager.add(hackerEffect)
effectManager.add(popupEffect)
effectManager.add(scatterEffect)
effectManager.add(scrollbarEffect)
