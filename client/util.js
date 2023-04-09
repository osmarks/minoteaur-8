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