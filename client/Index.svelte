<style lang="sass">
</style>

<script>
    import RevisionHistory from "./RevisionHistory.svelte"
    import ShortPageDescription from "./ShortPageDescription.svelte"
    import Wikilink from "./Wikilink.svelte"

	export let recentChanges
    export let randomPages
    export let deadLinks
    export let stats
</script>

<h1>Index</h1>

<p>{stats.total_words} words and {stats.total_links} links in {stats.total_pages} pages with {stats.total_revisions} revisions.</p>

<h2>Recent Changes</h2>
<RevisionHistory revs={recentChanges} />

<h2>Dead Links</h2>
{#each deadLinks as link}
<ul>
    <li><Wikilink id={link[0]} title={link[1]} /> → <a href={`#/create/${link[2]}`} class="wikilink nonexistent">{link[3]}</a></li>
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