<style lang="sass">
    textarea
        resize: vertical
        width: 100%
        height: 70vh
        border: 1px solid gray

    progress
        width: 100%

    .file
        max-width: 40em

    .file, .file .info
        margin-bottom: 0.5em
</style>

<script>
    import Loading from "./Loading.svelte"
    import Error from "./Error.svelte"
    import rpc from "./rpc.js"
    import { setRoute, formatDate, applyMetricPrefix, registerShortcut, draftsStorage } from "./util.js"
    import LargeButton from "./LargeButton.svelte"
    import IconHeader from "./IconHeader.svelte"
    import LinkButton from "./LinkButton.svelte";

    export let id
    export let page

    let content = page.content
    let error
    let keypresses = 0
    let draft

    const wordCount = s => {
        let words = 0
        for (const possibleWord of s.split(/\s+/)) {
            if (/[^#*+>|`-]/.test(possibleWord)) { words += 1 }
        }
        return words
    }
    const lineCount = s => s.split("\n").length

    let timer
    let saving = false
    const save = async () => {
        if (saving) { return }
        saving = true
        error = null
        draft = null
        if (timer) clearInterval(timer)
        try {
            await rpc("UpdatePage", [id, content])
            error = null
            saving = false
            return true
        } catch(e) {
            error = e
            saving = false
            return false
        }
    }

    const done = async () => {
        if (await save()) setRoute("page", id)
    }

    let uploadState = null

    let extantFiles = {}

    for (const file of Object.values(page.files)) {
        extantFiles[file.filename] = file
        file.path = `/file/${file.page}/${encodeURIComponent(file.filename)}`
        file.type = file.mime_type.split("/")[0]
    }

    const upload = files => {
        uploadState = { progress: 0 }

        let data = new FormData()
        for (const file of files) {
            data.set(file.name, file)
        }

        let request = new XMLHttpRequest()
        request.open("POST", "/api/upload/" + id)

        request.upload.addEventListener("progress", e => {
            //pendingFiles[thisID].progress = e.loaded / e.total
        });

        request.addEventListener("load", e => {
            if (request.status !== 200) {
                uploadState.error = request.status
                console.log(request.response)
            } else {
                const ret = JSON.parse(request.response)
                for (const file of ret) {
                    file.path = `/file/${id}/${encodeURIComponent(file.filename)}`
                    file.type = file.mime_type.split("/")[0]
                    extantFiles[file.filename] = file
                }
                uploadState = null
            }
        });
        request.send(data)
    }

    const addFile = async () => {
        const input = document.createElement("input")
        input.type = "file"
        input.multiple = true
        input.click()
        input.oninput = ev => {
            upload(Array.from(ev.target.files))
        }
    }

    const setIcon = async icon => {
        await rpc("SetIcon", [id, icon])
    }

    let editorTextarea

    const insertFileIntoDocument = file => {
        console.log(file)
        const start = editorTextarea.value.slice(0, editorTextarea.selectionStart) + `[`
        editorTextarea.value = start + `](${file.path})` + editorTextarea.value.slice(editorTextarea.selectionEnd)
        editorTextarea.focus()
        editorTextarea.selectionEnd = editorTextarea.selectionStart = start.length
    }

    const deleteFile = async filename => {
        await rpc("DeleteFile", [id, filename])
        delete extantFiles[filename]
        extantFiles = extantFiles
    }

    let lastDraft
    const runSave = () => {
        const now = Date.now()
        lastDraft = now
        console.log("saved draft")
        draftsStorage.setItem(id, { ts: now, content })
    }
    const saveDraft = () => {
        const now = Date.now()
        if (!lastDraft || (now - lastDraft) > 5000) {
            runSave()
        } else {
            if (timer) clearInterval(timer)
            timer = setTimeout(runSave, 5000)
        }
    }

    const textareaKeypress = ev => {
        const editor = ev.target
        const selStart = editor.selectionStart
        const selEnd = editor.selectionEnd
        if (selStart !== selEnd) return // text is actually selected; these shortcuts are not meant for that situation

        const search = "\n" + editor.value.substr(0, selStart)
        const lastLineStart = search.lastIndexOf("\n") + 1 // drop the \n
        const nextLineStart = selStart + (editor.value.substr(selStart) + "\n").indexOf("\n")

        if (ev.code === "Enter") { // enter
            // save on ctrl+enter
            if (ev.ctrlKey) {
                done()
                return
            }

            const line = search.substr(lastLineStart)
            // detect lists on the previous line to continue on the next one
            const match = /^(\s*)(([*+-])|(\d+)([).]))(\s*)/.exec(line)
            if (match) {
                // if it is an unordered list, just take the bullet type + associated whitespace
                // if it is an ordered list, increment the number and take the dot/paren and whitespace
                const lineStart = match[1] + (match[4] ? (parseInt(match[4]) + 1).toString() + match[5] : match[2]) + match[6]
                // get everything after the cursor on the same line
                const contentAfterCursor = editor.value.slice(selStart, nextLineStart)
                // all the content of the textbox preceding where the cursor should now be
                const prev = editor.value.substr(0, selStart) + "\n" + lineStart
                // update editor
                editor.value = prev + contentAfterCursor + editor.value.substr(nextLineStart)
                editor.selectionStart = editor.selectionEnd = prev.length
                //resize()
                ev.preventDefault()
            }
        }

        keypresses++
        saveDraft()
    }
    const textareaKeydown = ev => {
        const editor = ev.target
        const selStart = editor.selectionStart
        const selEnd = editor.selectionEnd
        if (selStart !== selEnd) return

        const search = "\n" + editor.value.substr(0, selStart)
        // this is missing the + 1 that the enter key listener has. I forgot why. Good luck working out this!
        const lastLineStart = search.lastIndexOf("\n")
        const nextLineStart = selStart + (editor.value.substr(selStart) + "\n").indexOf("\n")
        if (ev.code === "Backspace") {
            // detect if backspacing the start of a list line
            const re = /^\s*([*+-]|\d+[).])\s*$/y
            if (re.test(editor.value.slice(lastLineStart, selStart))) {
                // if so, remove entire list line start at once
                const before = editor.value.substr(0, lastLineStart)
                const after = editor.value.substr(selStart)
                editor.value = before + after
                editor.selectionStart = editor.selectionEnd = before.length
                //resize()
                ev.preventDefault()
            }
        } else if (ev.code === "Tab") {
            // indent/dedent lists by 2 spaces, depending on shift key
            const match = /^(\s*)([*+-]|\d+[).])/.exec(editor.value.slice(lastLineStart, nextLineStart))
            let line = editor.value.substr(lastLineStart)
            if (ev.shiftKey) {
                line = line.replace(/^  /, "")
            } else {
                line = "  " + line
            }
            if (match) {
                editor.value = editor.value.substr(0, lastLineStart) + line
                editor.selectionStart = editor.selectionEnd = selStart + (ev.shiftKey ? -2 : 2)
                //resize()
                ev.preventDefault()
            }
        }
        saveDraft()
    }

    draftsStorage.getItem(id).then(newDraft => {
        if (newDraft) {
            if (!page || !page.updated || page.updated < newDraft.ts) {
                console.log("draft from", formatDate(newDraft.ts))
                draft = newDraft
            }
        }
    })

    const loadDraft = () => {
        if (draft) {
            content = draft.content
        }
    }

    registerShortcut("Enter", done)
    registerShortcut("s", save)
</script>

<nav>
    <LinkButton href="#/page/{id}/" color="#76cd26">View</LinkButton>
    <LinkButton href="#/page/{id}/revisions" color="#f97306">Revisions</LinkButton>
</nav>
<IconHeader page={page}>Editing {page.title}</IconHeader>
<textarea class="editor" bind:value={content} on:keydown={textareaKeydown} on:keypress={textareaKeypress} bind:this={editorTextarea}></textarea>
<LargeButton onclick={save} color="#06c2ac">Save</LargeButton>
<LargeButton onclick={done} color="#bf77f6">Done</LargeButton>
<LargeButton onclick={addFile} color="#fcb001">Add File</LargeButton>
{#if draft}
    <LargeButton onclick={loadDraft} color="#ff796c">Load Draft</LargeButton>
{/if}
{#if saving}
    <Loading operation="Saving" />
{/if}
{#if error}
{@debug error}
    <Error>{error}</Error>
{/if}
<div class="info">
    <div>{applyMetricPrefix(keypresses, "")} keypresses</div>
    <div>{applyMetricPrefix(content.length, " ")} chars</div>
    <div>{applyMetricPrefix(wordCount(content), "")} words</div>
    <div>{applyMetricPrefix(lineCount(content), "")} lines</div>
</div>
{#if uploadState}
    {#if uploadState.error}
        <div class="error">Failed to upload: code {uploadState.error}</div>
    {:else if uploadState.progress}
        <div><progress min=0 max=1 value={uploadState.progress}></progress></div>
    {/if}
{/if}
{#if draft}
    <div>
        Draft from {formatDate(draft.ts)}.
    </div>
{/if}
{#if Object.entries(extantFiles).length > 0}
<h2>Files</h2>
Page icon:
    <select bind:value={page.icon_filename} on:blur={ev => setIcon(ev.target.value)}>
        <option value={null}>(none)</option>
        {#each Object.values(extantFiles) as file}
            {#if file.type === "image"}
                <option value={file.filename}>{file.filename}</option>
            {/if}
        {/each}
    </select>
{/if}
<ul class="files">
    {#each Object.entries(extantFiles) as [id, file]}
        {#key id}
            <li class="file">
                <div class="info">
                    <LargeButton onclick={() => deleteFile(id)} color="#ff5b00">Delete</LargeButton>
                    <!-- svelte-ignore a11y-invalid-attribute -->
                    <a href="#" on:click|preventDefault={() => insertFileIntoDocument(file)}>{file.filename}</a>
                    <ul>
                        <li>Size: {applyMetricPrefix(file.size, "B")}</li>
                        <li>MIME type: {file.mime_type}</li>
                        <li>Uploaded: {formatDate(file.created)}</li>
                    {#each Object.entries(file.metadata) as [key, value]}
                        <li>{key}: {value}</li>
                    {/each}
                    </ul>
                </div>
                <a href={file.path}>
                    {#if file.type == "image"}
                        <img src={file.path} alt={file.filename} class="file" />
                    {:else if file.type == "audio"}
                        <!-- svelte-ignore a11y-media-has-caption -->
                        <audio src={file.path} alt={file.filename} class="file" controls />
                    {:else if file.type == "video"}
                        <!-- svelte-ignore a11y-media-has-caption -->
                        <video src={file.path} alt={file.filename} class="file" controls />
                    {:else}
                        No preview available; click to view/download
                    {/if}
                </a>
            </li>
        {/key}
    {/each}
</ul>