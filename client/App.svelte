<style lang="sass">
    \:global(*)
        box-sizing: border-box

    \:global(html)
        scrollbar-color: black lightgray
            
    \:global(body)
        font-family: "Fira Sans", "Noto Sans", "Segoe UI", Verdana, sans-serif
        font-weight: 300
        //margin: 0
        //min-height: 100vh

    \:global(strong)
        font-weight: bold

    @mixin header
        border-bottom: 1px solid gray
        margin: 0
        margin-bottom: 0.5em
        font-weight: 500
        //a
            //color: inherit

    \:global(h1)
        @include header
    \:global(h2)
        @include header
    \:global(h3)
        @include header
    \:global(h4)
        @include header
    \:global(h5)
        @include header
    \:global(h6)
        @include header
    \:global(ul)
        list-style-type: square
        padding: 0
        padding-left: 1em

    \:global(a.wikilink)
        text-decoration: none
        color: #0165fc
        font-style: italic
        &:hover
            text-decoration: underline
    \:global(a.wikilink.nonexistent)
        color: red

    \:global(.error)
        color: red

    main
        display: flex

    .navigation, .meta
        flex-shrink: 0
        width: 30em
    .navigation
        margin-right: 8px
        &.search-mode
            width: 100%
            input[type=search]
                font-size: 1.5em
    .meta
        margin-left: 8px

    .main-ui
        width: 100%

    \:global(input[type=text])
        border: 1px solid gray

    \:global(button)
        border: 1px solid gray
        margin-left: -1px

    \:global(img)
        max-width: 100%

    \:global(ul)
        margin: 0

    input[type=search]
        width: 100%

    .result-page
        margin-top: 1em
        word-wrap: break-word
</style>

<script>
    import { onMount } from "svelte"

    import View from "./View.svelte"
    import Edit from "./Edit.svelte"
    import Index from "./Index.svelte"
    import IconHeader from "./IconHeader.svelte"
    import { registerShortcut } from "./util.js"

    import rpc from "./rpc.js"
    import MetadataSidebar from "./MetadataSidebar.svelte"

    window.rpc = rpc

    var child
    var params
    var page
    var searchMode = false
    var currentPage

    const parseURL = () => window.location.hash.slice(1).split("/").filter(x => x !== "").map(decodeURIComponent)
    const unparseURL = parts => { window.location.hash = "/" + parts.filter(x => x != "").map(encodeURIComponent).join("/") }

    const updateRoute = async () => {
        const parts = parseURL()
        console.log(parts)
        searchMode = false
        currentPage = null
        if (parts[0] === "page") {
            currentPage = parts[1]
            page = await rpc("GetPage", parts[1])
            params = { id: currentPage, page }
            page.id = currentPage
            if (parts[2] === "edit") { child = Edit }
            else { child = View }
        }
        else if (parts[0] === "search") {
            child = null
            page = null
            searchMode = true
        }
        else if (parts[0] === "create") {
            page = null
            params = { title: parts[1] }
            child = Edit
        } else {
            child = Index
            page = null
            params = {}
        }
    }

    const switchPageState = newState => {
        const parts = parseURL()
        if (parts[0] === "page") {
            parts[2] = newState
            unparseURL(parts)
        }
    }
    const switchPage = page => {
        unparseURL(["page", page])
    }

    var searchQuery
    var searchResults

    const searchInputHandler = async () => {
        if (searchQuery) {
            searchResults = await rpc("Search", searchQuery)
        } else {
            searchResults = []
        }
    }

    const searchKeypress = ev => {
        if (ev.key === "Enter" && searchResults) {
            const results = searchResults.filter(x => x[0] !== currentPage)
            if (results.length > 0) {
                switchPage(results[0][0])
            }
        }
    }

    onMount(updateRoute)

    var searchInput
    registerShortcut("/", () => searchInput.focus())
    registerShortcut("e", () => switchPageState("edit"))
    registerShortcut("v", () => switchPageState(""))
</script>

<svelte:window on:hashchange={updateRoute} />

<main>
    <div class={"navigation " + (searchMode ? "search-mode" : "")}>
        <a href="#/">Index</a>
        <a href="#/search">Search</a>
        <a href="#/page/2849188017017574009">C++ page</a>
        <a href="#/create">Create page</a>
        <input type="search" bind:value={searchQuery} on:input={searchInputHandler} on:keydown={searchKeypress} bind:this={searchInput} placeholder="Search">
        {#if searchResults}
            <div class="result-pages">
            <!--
            {#each searchResults as page}
            {#key page.id}
                <div class="result-page">
                    <IconHeader page={page} style={"font-size: 1.6em; margin-bottom: 0.2em;"}>
                        <a class="wikilink" href={`#/page/${page.id}`}>{page.title}</a>
                    </IconHeader>
                    <div>
                        {#each page.results as sent}
                            <div style={`color: hsl(0, 0%, ${sent.score * -50 + 50}%)`}>{sent.text.slice(0, 256)}</div>
                        {/each}
                    </div>
                </div>
            {/key}
            {/each}
            -->
            {#each searchResults as [id, title]}
            <div>
                <a class="wikilink" href={`#/page/${id}`}>{title}</a>
            </div>
            {/each}
            </div>
        {/if}
    </div>
    {#if child}
        <div class="main-ui">
            {#key params?.id || ""}
                <svelte:component this={child} {...params} />
            {/key}
        </div>
    {/if}
    {#if page}
        <div class="meta">
            <MetadataSidebar page={page} />
        </div>
    {/if}
</main>