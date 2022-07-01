<style lang="sass">
</style>

<script>
    let items
</script>

<ul>
    {#each item as el}
        <div>{@html el}</div>
    {/each}
</ul>