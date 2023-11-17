<style lang="sass">
    .structured-data
        button
            margin-left: 1px

        textarea
            width: 100%
            //resize: vertical

        
</style>

<div class="meta-root">
    <div>
        <ul class="inline">
            {#each page.adjacent as [id, title]}
                <li><Wikilink id={id} title={title} /></li>
            {/each}
        </ul>
        <h2>Tags</h2>
        <ul class="inline">
            {#each page.tags as tag}
                <li><DeleteButton onclick={() => removeTag(tag)} /><a class="wikilink tag" href={`#/search/${encodeURIComponent("#" + tag)}`}>#{tag}</a></li>
            {/each}
            {#if addingTag}
                <Loading operation={newTag} />
            {:else}
                <input type="text" placeholder="add another" bind:value={newTag} on:keydown={submitIfEnterKey(addTag)}><button on:click={addTag}>+</button>
            {/if}
        </ul>
        <h2>Names</h2>
        <ul class="inline">
            {#each page.names as name}
                <li><DeleteButton onclick={() => removeName(name)} />{name}</li>
            {/each}
            <li>
            {#if addingName}
                <Loading operation={newName} />
            {:else}
                <input type="text" placeholder="add another" bind:value={newName} on:keydown={submitIfEnterKey(addName)}><button on:click={addName}>+</button>
            {/if}
            </li>
        {#if alreadyExists}
            <Error>Page already exists: <Wikilink title={alreadyExists[1]} id={alreadyExists[0]} />.</Error>
        {/if}
        </ul>
    </div>

    <h2>Structured Data</h2>
    <div class="structured-data">
        <button on:click={editStructuredData}>{editingStructuredData ? "Done" : "Edit"}</button>
        {#if editingStructuredData}
            <button on:click={exitStructuredData}>Exit</button>
            <textarea use:autosize bind:value={structuredDataText} on:keydown={keydown} />
        {:else}
            <StructuredDataView kvPairs={page.structured_data} />
        {/if}
    </div>

    <h2>Info</h2>
    <div>Created {formatDate(page.created)}.</div>
    <div>Updated {formatDate(page.updated)}.</div>
    <div>{applyMetricPrefix(page.size.bytes, "B")}, {applyMetricPrefix(page.size.words, "")} words, {applyMetricPrefix(page.size.lines, "")} lines.</div>
    <div>
        Theme:
        <select bind:value={page.theme} on:change={setTheme}>
            <option></option>
            {#each Object.keys($config.themes) as theme}
                <option>{theme}</option>
            {/each}
        </select>
    </div>

    {#if page.backlinks.length > 0}
        <h2>Backlinks</h2>
        <ul>
        {#each Object.values(page.backlinks) as [backlink, title]}
            <li>
                <Wikilink id={backlink.from} title={title} />
                {#if backlink.text.toLowerCase() != page.title.toLowerCase()}
                    {` (as ${backlink.text})`}
                {/if}
                <div>{@html backlink.context}</div>
            </li>
        {/each}
        </ul>
    {/if}
</div>

<script>
    import autosize from "svelte-autosize";

    import { formatDate, applyMetricPrefix, submitIfEnterKey, config } from "./util.js"
    import Loading from "./Loading.svelte"
    import Error from "./Error.svelte"
    import rpc from "./rpc.js"
    import Wikilink from "./Wikilink.svelte"
    import DeleteButton from "./DeleteButton.svelte"
    import StructuredDataView from "./StructuredDataView.svelte"

    export let page
    var newName = ""
    var newTag = ""
    var addingName = false
    var addingTag = false
    var alreadyExists
    var editingStructuredData = false
    var structuredDataText

    const structuredDataToText = kvpairs => kvpairs.map(([k, v]) => `${k} ${Object.values(v)[0]}`).join("\n")
    const textToStructuredData = text => {
        const mapLine = line => {
            const parts = line.split(" ")
            const k = parts[0]
            if (!k) return
            const v = parts.slice(1).join(" ").trim()
            const vFloat = parseFloat(v)
            return [k, !isNaN(vFloat) && /^\-?\d+(.\d+)?$/.exec(v) ? {"Number": vFloat} : {"Text": v}]
        }
        return text.split("\n").map(mapLine).filter(x => x)
    }

    const exitStructuredData = () => {
        editingStructuredData = false
    }
    const editStructuredData = async () => {
        if (editingStructuredData) {
            console.log(structuredDataText)
            const data = textToStructuredData(structuredDataText)
            await rpc("SetStructuredData", [page.id, data])
            page.structured_data = data
            editingStructuredData = false
        } else {
            // render, go to edit mode
            structuredDataText = structuredDataToText(page.structured_data)
            editingStructuredData = true
        }
        page = page
    }

    const keydown = event => {
        if (event.ctrlKey && event.key === "Enter") editStructuredData()
    }

    console.log(page)

    const addName = async () => {
        if (addingName) return
        addingName = true
        try {
            page.names = page.names.concat([await rpc("AddName", [page.id, newName])])
            alreadyExists = null
        } catch(e) {
            if (e.type === "Conflict") {
                alreadyExists = [e.arg, newName]
            }
        }
        addingName = false
        newName = ""
        page = page
    }

    const addTag = async () => {
        if (addingTag) return
        addingTag = true
        page.tags = page.tags.concat([await rpc("AddTag", [page.id, newTag])])
        page = page
        addingTag = false
        newTag = ""
    }
    const removeTag = async tag => {
        if (addingTag) return
        addingTag = true
        const slug = await rpc("RemoveTag", [page.id, tag])
        page.tags = page.tags.filter(x => x !== slug)
        page = page
        addingTag = false
    }
    const removeName = async name => {
        if (addingName) return
        addingName = true
        await rpc("RemoveName", [page.id, name])
        page.names = page.names.filter(x => x !== name)
        page = page
        addingName = false
    }
    const setTheme = async () => {
        console.log("set", page.theme)
        await rpc("SetTheme", [page.id, page.theme])
        page = page
    }
</script>