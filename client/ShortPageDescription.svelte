<script>
    import IconHeader from "./IconHeader.svelte"
    import { formatDateRelative, applyMetricPrefix } from "./util.js"

    export let page
</script>

<IconHeader page={page} basic={true}><a class="wikilink" href={`#/page/${page.id}`}>{page.title}</a></IconHeader>
<ul class="inline">
    {#each page.tags as tag}
        <li><a class="wikilink tag" href={`#/search/${encodeURIComponent("#" + tag)}`}>#{tag}</a></li>
    {/each}
</ul>
Updated {formatDateRelative(page.updated)}, created {formatDateRelative(page.created)}. {applyMetricPrefix(page.size.bytes, "B")}, {applyMetricPrefix(page.size.words, "")} words, {applyMetricPrefix(page.size.lines, "")} lines.
<div class="snippet">{@html page.snippet_html}</div>