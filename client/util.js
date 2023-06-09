import { format, formatDistanceToNowStrict } from "date-fns"
import localforage from "localforage"
import { onDestroy } from 'svelte'

export let setRoute = (...parts) => {
    window.location.hash = "#/" + parts.map(encodeURIComponent).join("/")
}

export let formatDateRelative = dt => formatDistanceToNowStrict(dt, { addSuffix: true }) 
export let formatDate = dt => `${format(dt, "yyyy-MM-dd HH:mm:ss")} (${formatDateRelative(dt)})`

const metricPrefixes = ["", "k", "M", "G", "T", "P", "E", "Z", "Y"]
export const applyMetricPrefix = (x, unit) => {
    let log = Math.log10(x)
    let exp = x !== 0 ? Math.floor(log / 3) : 0
    let val = x / Math.pow(10, exp * 3)
    return (exp !== 0 ? val.toFixed(3 - (log - exp * 3)) : val) + metricPrefixes[exp] + unit
}

const keyboardShortcuts = {}
// TODO: reregistering things on every component initialization is possibly actually bad
export let registerShortcut = (key, handler) => {
    keyboardShortcuts[key] = handler
    onDestroy(() => keyboardShortcuts[key] = undefined)
}

window.addEventListener("keydown", ev => {
    if (ev.altKey && ev.key in keyboardShortcuts && keyboardShortcuts[ev.key]) {
        keyboardShortcuts[ev.key](ev)
        ev.preventDefault()
    }
})

export const draftsStorage = localforage.createInstance({
    name: "drafts"
})

export const generalStorage = localforage.createInstance({
    name: "general"
})

export const submitIfEnterKey = fn => ev => {
    if (ev.key === "Enter") {
        fn()
    }
}

export const ihash = x => {
    x = ((x >> 16) ^ x) * 0x45d9f3b
    x = ((x >> 16) ^ x) * 0x45d9f3b
    x = (x >> 16) ^ x
    return x
}

export const shash = str => {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return ihash(hash)
}

const palette = [0x8dd3c7, 0xffffb3, 0xbebada, 0xfb8072, 0x80b1d3, 0xfdb462, 0x3de69, 0xfccde5, 0xd9d9d9, 0xbc80bd, 0xccebc5, 0xffed6f]
const applyOffset = (i, x) => Math.min(Math.max(ihash(i) % 16 - 8 + x, 0), 255)
const offsetColor = (i, x) => applyOffset(i, (x >> 16) & 0xFF) << 16 | applyOffset(i + 1, (x >> 8) & 0xFF) << 8 | applyOffset(i + 2, x & 0xFF)
const numToHexCol = x => "#" + x.toString(16).padStart(6, "0")