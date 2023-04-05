<script>

    import IconHeader from "./IconHeader.svelte"
    import LinkButton from "./LinkButton.svelte"
    import { formatDate } from "./util.js"

    export let page
    export let id

    export let revs
</script>

{#if page}
    <nav>
        <LinkButton href="#/page/{id}/view" color="#76cd26">View</LinkButton>
        <LinkButton href="#/page/{id}/edit" color="#75bbfd">Edit</LinkButton>
    </nav>
    <IconHeader page={page}>{page.title}</IconHeader>
{/if}
<ul>
    {#each revs as rev}
        <li>
            {#if !page}
                <a class="wikilink" href={`#/page/${rev.page}`}>{rev.pageData.title}</a>
            {/if}
            <div>{formatDate(rev.time)}</div>
            {#if rev.ty == "PageCreated"}
                Page created.
            {:else if "ContentUpdate" in rev.ty}
                {rev.ty.ContentUpdate.edit_distance} bytes changed, page is now {rev.ty.ContentUpdate.new_content_size.bytes} bytes/{rev.ty.ContentUpdate.new_content_size.words} words.
                <a class="wikilink" href={`#/page/${id || rev.page}/revision/${rev.id}`}>View</a> old version.
            {:else if "AddTag" in rev.ty}
                Added <a class="wikilink tag" href={`#/search/${encodeURIComponent("#" + rev.ty.AddTag)}`}>#{rev.ty.AddTag}</a>.
            {:else if "AddName" in rev.ty}
                Added name {rev.ty.AddName}.
            {:else if "RemoveTag" in rev.ty}
                Removed <a class="wikilink tag" href={`#/search/${encodeURIComponent("#" + rev.ty.AddTag)}`}>#{rev.ty.RemoveTag}</a>.
            {:else if "RemoveName" in rev.ty}
                Removed name {rev.ty.RemoveName}.
            {:else if "AddFile" in rev.ty}
                Added file <a href={`/file/${rev.page}/${encodeURIComponent(rev.ty.AddFile)}`}>{rev.ty.AddFile}</a>.
            {:else if "RemoveFile" in rev.ty}
                Removed file {rev.ty.RemoveFile}.
            {:else if "SetIconFilename" in rev.ty}
                Set icon to <a href={`/file/${rev.page}/${encodeURIComponent(rev.ty.SetIconFilename)}`}>{rev.ty.SetIconFilename}</a>.
            {/if}
        </li>
    {/each}
</ul>