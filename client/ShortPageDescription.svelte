<script>
    import IconHeader from "./IconHeader.svelte"
    import Wikilink from "./Wikilink.svelte"
    import StructuredDataView from "./StructuredDataView.svelte"
    import { formatDateRelative, applyMetricPrefix } from "./util.js"

    export let page
</script>

<IconHeader page={page} basic={true}><Wikilink id={page.id} title={page.title} on:click /></IconHeader>
<div>
    <ul class="inline">
        {#each page.tags as tag}
            <li><a class="wikilink tag" href={`#/search/${encodeURIComponent("#" + tag)}`}>#{tag}</a></li>
        {/each}
    </ul>
</div>
<div>
    <StructuredDataView kvPairs={page.structured_data} inline={true} />
</div>
Updated {formatDateRelative(page.updated)}, created {formatDateRelative(page.created)}. {applyMetricPrefix(page.size.bytes, "B")}, {applyMetricPrefix(page.size.words, "")} words, {applyMetricPrefix(page.size.lines, "")} lines.
<div class="snippet">{@html page.snippet}</div>