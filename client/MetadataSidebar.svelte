<style lang="sass">
</style>

<div class="meta-root">
    <div>
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
            <Error>Page already exists: <a class="wikilink" href="#/page/{alreadyExists[0]}">{alreadyExists[1]}</a>.</Error>
        {/if}
        </ul>
    </div>

    <h2>Info</h2>
    <div>Created {formatDate(page.created)}.</div>
    <div>Updated {formatDate(page.updated)}.</div>
    <div>{applyMetricPrefix(page.size.bytes, "B")}, {applyMetricPrefix(page.size.words, "")} words, {applyMetricPrefix(page.size.lines, "")} lines.</div>

    {#if page.backlinks.length > 0}
        <h2>Backlinks</h2>
        <ul>
        {#each Object.values(page.backlinks) as [backlink, title]}
            <li>
                <a href={`#/page/${backlink.from}`} class="wikilink">{title}</a>
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
    import { formatDate, applyMetricPrefix, submitIfEnterKey } from "./util.js"
    import Loading from "./Loading.svelte"
    import Error from "./Error.svelte"
    import rpc from "./rpc.js"
    import DeleteButton from "./DeleteButton.svelte"

    export let page
    var newName = ""
    var newTag = ""
    var addingName = false
    var addingTag = false
    var alreadyExists

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
    }

    const addTag = async () => {
        if (addingTag) return
        addingTag = true
        page.tags = page.tags.concat([await rpc("AddTag", [page.id, newTag])])
        addingTag = false
        newTag = ""
    }
    const removeTag = async tag => {
        if (addingTag) return
        addingTag = true
        const slug = await rpc("RemoveTag", [page.id, tag])
        page.tags = page.tags.filter(x => x !== slug)
        addingTag = false
    }
    const removeName = async name => {
        if (addingName) return
        addingName = true
        await rpc("RemoveName", [page.id, name])
        page.names = page.names.filter(x => x !== name)
        addingName = false
    }
</script>