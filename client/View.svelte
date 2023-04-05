<script>
    import IconHeader from "./IconHeader.svelte"
    import LinkButton from "./LinkButton.svelte"
    import { formatDate } from "./util.js"

    export let id
    export let page
</script>

<nav>
    <LinkButton href="#/page/{id}/edit" color="#75bbfd">Edit</LinkButton>
    <LinkButton href="#/page/{id}/revisions" color="#f97306">Revisions</LinkButton>
</nav>
<IconHeader page={page}>{page.title}</IconHeader>
{#if page.revision}
    <div>Version from {formatDate(page.revision.time)}.</div>
    <details>
        <summary>View source</summary>
        <pre><code>{page.content}</code></pre>
    </details>
{/if}
{@html page.rendered_content}