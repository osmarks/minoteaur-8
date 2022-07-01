<script>
    import IconHeader from "./IconHeader.svelte"
    import InteractiveListPage from "./InteractiveListPage.svelte"

    export let id
    export let page
</script>

<a href="#/page/{id}/edit">Edit</a>
<IconHeader page={page}>{page.title}</IconHeader>
{#if page.rendered_content.Markdown}
    <div>{@html page.rendered_content.Markdown}</div>
{:else if page.rendered_content.List}
    <InteractiveListPage items={page.rendered_content.List}></InteractiveListPage>
{/if}