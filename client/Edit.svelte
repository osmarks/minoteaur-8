<style lang="sass">
    textarea
        resize: vertical
        width: 100%
        height: 70vh
        border: 1px solid gray

    .title
        width: 100%
        font-size: 1.2em

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
    import { setRoute, formatDate, applyMetricPrefix, registerShortcut } from "./util.js"
    import LargeButton from "./LargeButton.svelte"
    import IconHeader from "./IconHeader.svelte"
    import InteractiveListPage from "./InteractiveListPage.svelte"

    export let id
    export let title
    export let page

    let contentObj = page?.content
    let contentType = page?.content && Object.keys(page?.content)[0]
    let content = page?.content?.Markdown || ""
    let error
    let newID
    let keypresses = 0

    const wordCount = s => {
        let words = 0
        for (const possibleWord of s.split(/\s+/)) {
            if (/[^#*+>|`-]/.test(possibleWord)) { words += 1 }
        }
        return words
    }
    const lineCount = s => s.split("\n").length

    let saving = false
    const save = async () => {
        if (saving) { return }
        saving = true
        error = null
        try {
            if (id) {
                await rpc("UpdatePage", [id, { Markdown: content }])
            } else {
                newID = await rpc("CreatePage", { content, title })
            }
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
        if (await save()) setRoute("page", newID || id)
    }

    let nextID = 0
    let pendingFiles = {}

    const extantFiles = {}

    if (page?.files) {
        for (const file of page.files) {
            extantFiles[file.id] = file
            file.path = `/file/${file.page}/${encodeURIComponent(file.filename)}`
            file.type = file.mime_type.split("/")[0]
        }
    }

    /*
    const upload = file => {
        let thisID = nextID
        pendingFiles[thisID] = { file, progress: 0 }
        nextID++

        let data = new FormData()
        data.append("page", id)
        data.append("file", file)

        let request = new XMLHttpRequest()
        request.responseType = "arraybuffer"
        request.open("POST", "/upload")

        request.upload.addEventListener("progress", e => {
            pendingFiles[thisID].progress = e.loaded / e.total
        });

        /*
        request.addEventListener("load", e => {
            if (request.status !== 200) {
                pendingFiles[thisID].error = request.status
            } else {
                const ret = decode(request.response)
                const file = { ...ret[3], filename: ret[2] }
                file.path = `/file/${id}/${encodeURIComponent(file.filename)}`
                file.type = file.mime_type.split("/")[0]
                extantFiles[ret[1]] = file
                delete pendingFiles[thisID]
                pendingFiles = pendingFiles
            }
        });
        request.send(data)
    }
    */

    const addFile = async () => {
        const input = document.createElement("input")
        input.type = "file"
        input.multiple = true
        input.click()
        input.oninput = ev => {
            for (const file of ev.target.files) {
                upload(file)
            }
        }
    }

    let editorTextarea

    const insertFileIntoDocument = file => {
        console.log(file)
        const start = editorTextarea.value.slice(0, editorTextarea.selectionStart) + `[`
        editorTextarea.value = start + `](${file.path})` + editorTextarea.value.slice(editorTextarea.selectionEnd)
        editorTextarea.focus()
        editorTextarea.selectionEnd = editorTextarea.selectionStart = start.length
    }

    const deleteFile = async id => {
        await rpc("delete_file", id)
        delete extantFiles[id]
        extantFiles = extantFiles
    }
    const setAsIcon = async filename => {
        await rpc("set_as_icon", id, filename)
        page.icon_filename = filename
        page = page
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
    }

    registerShortcut("Enter", done)
    registerShortcut("s", save)
</script>

{#if page}
    <a href="#/page/{id}/">View</a>
    <IconHeader page={page}>Editing {page.title}</IconHeader>
{:else}
    <input class="title" bind:value={title} />
{/if}
{#if contentType === "Markdown"}
    <textarea class="editor" bind:value={content} on:keydown={textareaKeydown} on:keypress={textareaKeypress} bind:this={editorTextarea}></textarea>
{:else if contentType === "List"}
    <InteractiveListPage items={content} />
{:else}
    invalid content type
{/if}
<LargeButton onclick={save} color="#06c2ac">Save</LargeButton>
<LargeButton onclick={done} color="#bf77f6">Done</LargeButton>
<LargeButton onclick={addFile} color="#fcb001">Add File</LargeButton>
{#if saving}
    <Loading operation="Saving" />
{/if}
{#if error}
{@debug error}
    {#if error.type === "Conflict"}
        <Error>Page already exists: <a class="wikilink" href="#/page/{error.arg}">{title}</a>.</Error>
    {:else}
        <Error>{error}</Error>
    {/if}
{/if}
<div class="info">
    <div>{keypresses} keypresses</div>
    <div>{content.length} characters</div>
    <div>{wordCount(content)} words</div>
    <div>{lineCount(content)} lines</div>
</div>
<ul class="files">
    {#each Object.values(pendingFiles) as file}
        <li>
            {#if file.error}
                <div class="error">Failed, code {file.error}</div>
            {/if}
            <div><progress min=0 max=1 value={file.progress}></progress></div>
            <span>{file.file.name} - {formatDate(file.file.lastModified)} - {applyMetricPrefix(file.file.size, "B")}</span>
        </li>
    {/each}
    {#each Object.entries(extantFiles) as [id, file]}
        <li class="file">
            <div class="info">
                <LargeButton onclick={() => deleteFile(id)} color="#ff5b00">Delete</LargeButton>
                {#if file.type == "image"}
                    <LargeButton onclick={() => setAsIcon(file.filename)} color="#75fd63">Make Icon</LargeButton>
                {/if}
                <!-- svelte-ignore a11y-invalid-attribute -->
                <a href="" on:click|preventDefault={() => insertFileIntoDocument(file)}>{file.filename}</a>
                <div>{file.mime_type}</div>
                <div>{formatDate(file.upload_time)}</div>
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
    {/each}
</ul>