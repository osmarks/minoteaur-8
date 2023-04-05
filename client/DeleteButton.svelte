<style lang="sass">
    span
        &::after
            content: " "
        cursor: pointer
</style>

<script>
    export let onclick
</script>

<span on:click={onclick} title="Remove">🞪</span>