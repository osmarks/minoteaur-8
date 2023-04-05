const esbuild = require("esbuild")
const sveltePlugin = require("esbuild-svelte")
const path = require("path")
const { sass } = require("svelte-preprocess-sass")
const fs = require("fs")

fs.copyFile(path.join(__dirname, "icon.png"), path.join(__dirname, "../static/icon.png"), () => {})

esbuild
    .build({
        entryPoints: [path.join(__dirname, "app.js")],
        bundle: true,
        //minify: true,
        outfile: path.join(__dirname, "../static/app.js"),
        plugins: [sveltePlugin({
            preprocess: {
                style: sass()
            }
        })],
        loader: {
            ".woff": "file",
            ".woff2": "file",
            ".ttf": "file"
        },
        logLevel: "info",
        watch: process.argv.join(" ").includes("watch")
    })
    .catch(() => process.exit(1))