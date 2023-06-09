<style lang="sass">
    ul.regular
        list-style-type: none
        padding: 0
</style>

<ul class={inline ? "inline" : "regular"}>
{#each kvPairs as [key, value]}
    <li>
        <span>
            <a href={`#/search/${encodeURIComponent("=" + key + ":" + Object.values(value)[0])}`} class="wikilink structured-data">{key}</a>
        </span>
        <!-- has to be one line due to HTML whitespace considerations -->
        {#if "Number" in value}<span class="value number">{value.Number}</span>{:else if "Text" in value}<span class="value text">{value.Text}</span>{/if}</li>
{/each}
</ul>

<script>
    export let kvPairs
    export let inline
</script>