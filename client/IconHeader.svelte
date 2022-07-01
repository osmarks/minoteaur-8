<style lang="sass">
    h1
        display: flex
        justify-content: space-between
        align-items: center
        img
            height: 1.25em
</style>

<script>
    export let page
    let url = page.icon_filename && `/file/${page.id}/${encodeURIComponent(page.icon_filename)}`
    export let style = ""
</script>

<h1 style={style}>
    <div class="other"><slot /></div>
    {#if url}
        <!-- svelte-ignore a11y-missing-attribute -->
        <img src={url} />
    {/if}
</h1>