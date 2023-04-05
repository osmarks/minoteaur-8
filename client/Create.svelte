<style lang="sass">
    .title
        width: 100%
        font-size: 1.2em
</style>

<h1>Create Page</h1>
<input class="title" bind:value={title} />
<br/>
<h2>Tags</h2>
<ul class="inline">
    {#each tags as tag}
        <li><DeleteButton onclick={() => removeTag(tag)} /><a class="wikilink tag" href={`#/search/${encodeURIComponent("#" + tag)}`}>#{tag}</a></li>
    {/each}
    <input type="text" placeholder="add another" bind:value={newTag} on:keydown={submitIfEnterKey(addTag)}><button on:click={addTag}>+</button>
</ul>
<br/>
<LargeButton onclick={done} color="#bf77f6">Done</LargeButton>
{#if error}
    {#if error.type === "Conflict"}
        <Error>Page already exists: <a class="wikilink" href="#/page/{error.arg}">{title}</a>.</Error>
    {:else}
        <Error>{error}</Error>
    {/if}
{/if}

<script>
    import LargeButton from "./LargeButton.svelte"
    import Error from "./Error.svelte"
    import rpc from "./rpc.js"
    import DeleteButton from "./DeleteButton.svelte"
    import { setRoute, submitIfEnterKey } from "./util.js"

    export let title = ""
    export let tags = []
    let newTag = ""
    let error

    const done = async () => {
        try {
            const newID = await rpc("CreatePage", [title, tags])
            error = null
            setRoute("page", newID, "edit")
        } catch(e) {
            error = e
        }
    }

    const addTag = () => {
        tags.push(newTag)
        tags = tags
        newTag = ""
    }

    const removeTag = tag => {
        tags = tags.filter(x => x !== tag)
    }
</script>