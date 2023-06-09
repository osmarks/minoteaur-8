<script>
    export let name
    export let count
    export let owncount
    export let children
</script>

<div>
    {#if name !== ""}
        <a class="wikilink tag" href={`#/search/${encodeURIComponent("#" + name)}`}>#{name}</a> {count} {#if owncount !== 0 && owncount !== count}({owncount} directly){/if}
    {/if}
    <ul>
        {#each children as child}
            <li>
                <svelte:self {...child} />
            </li>
        {/each}
    </ul>
</div>