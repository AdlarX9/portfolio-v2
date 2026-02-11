import { Effect } from "../app/effects.js"

// utils
const lenis = new Lenis()

// update
function raf(time) {
	lenis.raf(time)
}

const smoothScrollEffect = new Effect()
smoothScrollEffect.mobile = true
smoothScrollEffect.smallScreen = true
smoothScrollEffect.update = raf

export default smoothScrollEffect
