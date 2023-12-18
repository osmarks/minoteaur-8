<style lang="sass">
</style>

<script>
    import RevisionHistory from "./RevisionHistory.svelte"
    import ShortPageDescription from "./ShortPageDescription.svelte"
    import Wikilink from "./Wikilink.svelte"
    import TagTree from "./TagTree.svelte"

	export let recentChanges
    export let randomPages
    export let deadLinks
    export let stats

    const buildTree = stats => {
        const tree = { count: 0, ochildren: {}, name: "" }
        for (const [tag, count] of Object.entries(stats.tag_counts)) {
            const hier = tag.split("/")
            let ptr = tree
            for (const level of hier) {
                ptr.ochildren[level] = ptr.ochildren[level] || { count: 0, ochildren: {}, name: (ptr.name ? ptr.name + "/" : "") + level }
                ptr = ptr.ochildren[level]
            }
            ptr.count = count
        }
        const rewriteTree = tree => {
            const newChildren = Object.values(tree.ochildren)
            newChildren.forEach(rewriteTree)
            tree.children = newChildren
            newChildren.sort((a, b) => b.count - a.count)
        }
        rewriteTree(tree)
        console.log("produced", tree)
        return tree
    }

    $: tree = buildTree(stats)
</script>

<h1>Index</h1>

<p>{stats.total_words} words and {stats.total_links} links in {stats.total_pages} pages with {stats.total_revisions} revisions.</p>
<p>Running {stats.version}.</p>

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

<h2>Tags</h2>

<TagTree {...tree} />