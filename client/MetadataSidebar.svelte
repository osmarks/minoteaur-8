<style lang="sass">
</style>

<div class="meta-root">
    <div>
        <h2>Names</h2>
        <ul>
            {#each page.names as name}
                <li>{name}</li>
            {/each}
            <li>
            {#if addingName}
                <Loading operation={newName} />
            {:else}
                <input type="text" placeholder="add another" bind:value={newName} on:keydown={submitIfEnterKey}><button on:click={addName}>+</button>
            {/if}
            </li>
        {#if alreadyExists}
            <Error>Page already exists: <a class="wikilink" href="#/page/{alreadyExists[0]}">{alreadyExists[1]}</a>.</Error>
        {/if}
        </ul>
    </div>

    <h2>Info</h2>
    <div>Created {formatDate(page.created)}</div>
    <div>Updated {formatDate(page.updated)}</div>

    {#if page.backlinks.length > 0}
        <h2>Backlinks</h2>
        <ul>
        {#each Object.values(page.backlinks) as [backlink, title]}
            <li>
                <a href={`#/page/${backlink.from}`} class="wikilink">{title}</a>
                {#if backlink.text.toLowerCase() != page.title.toLowerCase()}
                    {` (as ${backlink.text})`}
                {/if}
                <div>{backlink.context}</div>
            </li>
        {/each}
        </ul>
    {/if}
</div>

<script>
    import { formatDate } from "./util.js"
    import Loading from "./Loading.svelte"
    import Error from "./Error.svelte"
    import rpc from "./rpc.js"

    export let page
    var newName = ""
    var addingName = false
    var alreadyExists

    const addName = async () => {
        if (addingName) return
        addingName = true
        console.log("add name", newName)
        try {
            console.log("invoking dark bee gods... please wait.")
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

    const submitIfEnterKey = ev => {
        if (ev.key === "Enter") {
            addName()
        }
    }

</script>