import dayjs from "dayjs"

export let setRoute = (...parts) => {
    window.location.hash = "#/" + parts.map(encodeURIComponent).join("/")
}

export let formatDate = dt => dayjs(dt).format("YYYY-MM-DD HH:mm:ss")

const metricPrefixes = ["", "k", "M", "G", "T", "P", "E", "Z", "Y"]
export const applyMetricPrefix = (x, unit) => {
    let exp = Math.floor(Math.log10(x) / 3)
    let val = x / Math.pow(10, exp * 3)
    return val.toFixed(3) + metricPrefixes[exp] + unit
}

const keyboardShortcuts = {}
// TODO: reregistering things on every component initialization is possibly actually bad
export let registerShortcut = (key, handler) => {
    keyboardShortcuts[key] = handler
}

window.addEventListener("keydown", ev => {
    if (ev.altKey && ev.key in keyboardShortcuts) {
        keyboardShortcuts[ev.key](ev)
        ev.preventDefault()
    }
})