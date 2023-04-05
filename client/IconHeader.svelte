<style lang="sass">
    h1, div
        display: flex
        justify-content: flex-start
        align-items: center
        img
            height: 1.25em
            margin-right: 0.5em

    div
        font-size: 1.2em
</style>

<script>
    export let page
    export let basic
    $: url = page.icon_filename && `/file/${page.id}/${encodeURIComponent(page.icon_filename)}`
    export let style = ""
</script>

{#if basic}
    <div style={style}>
        {#if url}
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src={url} />
        {/if}
        <div class="other"><slot /></div>
    </div>
{:else}
    <h1 style={style}>
        {#if url}
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src={url} />
        {/if}
        <div class="other"><slot /></div>
    </h1>
{/if}