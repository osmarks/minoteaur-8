<style lang="sass">
</style>

<script>
    import RevisionHistory from "./RevisionHistory.svelte"
    import ShortPageDescription from "./ShortPageDescription.svelte"

	export let recentChanges
    export let randomPages
    export let deadLinks
</script>

<h1>Index</h1>

<h2>Recent Changes</h2>
<RevisionHistory revs={recentChanges} />

<h2>Dead Links</h2>
{#each deadLinks as link}
<ul>
    <li><a href={`#/page/${link[0]}`} class="wikilink">{link[1]}</a> → <a href={`#/create/${link[2]}`} class="wikilink nonexistent">{link[2]}</a></li>
</ul>
{/each}

<h2>Random Pages</h2>
<ul>
    {#each randomPages as page}
        <li>
            <ShortPageDescription page={page} />
        </li>
    {/each}
</ul>