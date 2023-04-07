<style lang="sass">
    :global(*)
        box-sizing: border-box

    :global(html)
        scrollbar-color: black lightgray
            
    :global(body)
        font-family: "Fira Sans", "Noto Sans", "Segoe UI", Verdana, sans-serif
        font-weight: 300
        //margin: 0
        //min-height: 100vh

    :global(strong)
        font-weight: bold

    @mixin header
        border-bottom: 1px solid gray
        margin: 0
        margin-bottom: 0.5em
        font-weight: 500
        //a
            //color: inherit

    :global(h1)
        @include header
    :global(h2)
        @include header
    :global(h3)
        @include header
    :global(h4)
        @include header
    :global(h5)
        @include header
    :global(h6)
        @include header
    :global(ul)
        list-style-type: square
        padding: 0
        padding-left: 1em

    :global(a.wikilink)
        text-decoration: none
        //color: #0165fc
        //font-style: italic
        background: blue
        color: white
        font-weight: 500
        font-family: monospace
        padding: 1px
        &:hover
            text-decoration: underline
    :global(a.wikilink.nonexistent)
        background: red
    :global(a.wikilink.tag)
        background: limegreen

    :global(.error)
        color: red

    :global(ul.inline li)
        display: inline
    :global(ul.inline li:not(:last-child)::after)
        content: ", "
    :global(ul.inline)
        padding: 0
    :global(ul.very-inline)
        display: inline

    :global(input[type=text])
        border: 1px solid gray

    :global(button)
        border: 1px solid gray
        margin-left: -1px

    :global(ul)
        margin: 0

    :global(.markdown)
        :global(img)
            max-width: 100%
        :global(blockquote)
            border-left: 0.2em solid black
            margin-left: 0
            padding-left: 0.3em
        :global(.captioned-image-block)
            border: 1px solid gray
            padding: 0.5em
            background: lightgray
            display: inline-block
            margin: -1px
            width: calc(50% - 1px)
            min-width: 15em
            :global(img)
                width: 100%
        :global(.ralign)
            text-align: right
    :global(.snippet p)
        margin: 0

    :global(nav)
        margin-bottom: 0.5em

    :global(.footnote-definition > p)
        display: inline-block

    main
        display: flex
        &.vertical
            display: block
            .navigation, .meta
                width: 100%
            .main-ui
                max-width: 100%
                overflow: scroll
                padding-top: 1em
                padding-bottom: 1em

    .navigation, .meta
        flex-shrink: 0
        width: 25%
        min-width: 10em
    .navigation
        margin-right: 8px
        &.search-mode
            width: 100%
            input[type=search]
                font-size: 1.5em
    .sidebar
        height: calc(100vh - 16px)
        overflow-y: scroll
        position: sticky
        top: 8px
    .meta
        margin-left: 8px

    .main-ui
        width: 100%

    input[type=search]
        width: 100%

    .result-page
        margin-top: 1em
        word-wrap: break-word

    .search-input
        margin-top: 1rem

    // TODO
    @media print
        .sidebar
            display: none
        :global(nav)
            display: none

    :global(code), :global(pre)
        background: black
        color: white
        font-weight: 600
        padding: 1px
    :global(pre)
        padding: 4px

</style>

<script>
    import { onMount, tick } from "svelte"

    import View from "./View.svelte"
    import Edit from "./Edit.svelte"
    import Create from "./Create.svelte"
    import Index from "./Index.svelte"
    import RevisionHistory from "./RevisionHistory.svelte"
    import ShortPageDescription from "./ShortPageDescription.svelte"
    import { registerShortcut, generalStorage } from "./util.js"
    import LinkButton from "./LinkButton.svelte"

    import rpc from "./rpc.js"
    import MetadataSidebar from "./MetadataSidebar.svelte"

    let vertical = window.innerHeight > window.innerWidth

    window.rpc = rpc

    var child
    var params
    var page
    var searchMode = false
    var currentPage

    history.scrollRestoration = "manual"
    const scrollHeights = {}

    var recent = []
    const broadcast = new BroadcastChannel("minoteaur")

    generalStorage.getItem("recent").then(x => {
        recent = x || []
    })
    const syncRecent = () => {
        recent = recent
        broadcast.postMessage(["recent", recent])
    }
    broadcast.addEventListener("message", ev => {
        const type = ev.data[0]
        if (type === "reload") window.location.reload()
        else if (type === "recent") { recent = ev.data[1] }
    })

    const parseURL = () => {
        const [hash, query] = window.location.hash.slice(1).split("?")
        const parts = hash.split("/").filter(x => x !== "").map(decodeURIComponent)
        if (query) {
            query.split("&").map(x => x.split("=").map(decodeURIComponent)).forEach(([k, v]) => parts[k] = v)
        }
        return parts
    }
    const actuallyUnparse = (parts, query = {}) => "/" + parts.filter(x => x != "").map(encodeURIComponent).join("/")
    const unparseURL = (parts, query = {}) => { window.location.hash = actuallyUnparse(parts, query) }

    const setTitle = title => document.title = `${title} - Minoteaur`
    
    let previousURL = actuallyUnparse(parseURL())
    const updateRoute = async () => {
        const parts = parseURL()
        scrollHeights[previousURL] = window.scrollY
        console.log(parts)
        searchMode = false
        currentPage = null
        if (parts[0] === "page") {
            currentPage = parts[1]
            let revisionID = null
            if (parts[2] === "revision" && parts[3]) {
                revisionID = parts[3]
            }
            page = await rpc("GetPage", [parts[1], revisionID])
            if (page) {
                recent = recent.filter(([a, b]) => a !== currentPage)
                recent.push([ currentPage, page.title ])
                if (recent.length > 8) recent.shift()
                generalStorage.setItem("recent", recent)
                syncRecent()
            }
            params = { id: currentPage, page }
            page.id = currentPage
            if (parts[2] === "edit") {
                child = Edit
                setTitle(`${page.title} - Editing`)
            }
            else if (parts[2] === "revisions") {
                revs = await rpc("GetRevisions", currentPage)
                revs.sort((a, b) => b.time - a.time)
                params.revs = revs
                child = RevisionHistory
                setTitle(`${page.title} - Revisions`)
            }
            else {
                child = View
                let title = page.title
                if (revisionID) {
                    title += " (old)"
                }
                setTitle(title)
            }
        }
        else if (parts[0] === "search") {
            child = null
            searchMode = true
            if (parts[1]) {
                searchQuery = parts[1]
                await searchInputHandler()
            }
            page = null
            setTitle("Search")
        }
        else if (parts[0] === "create") {
            page = null
            params = { title: parts[1] }
            if (parts.tags) {
                params.tags = parts.tags.split(",")
            }
            child = Create
            setTitle(`Creating ${parts[1] || "page"}`)
        } else {
            const { recent_changes, random_pages, dead_links, stats } =  await rpc("IndexPage", null)
            page = null
            params = { recentChanges: recent_changes.map(([revision, page]) => ({ ...revision, pageData: page })), randomPages: random_pages, deadLinks: dead_links, stats }
            child = Index
            setTitle("Index")
        }
        const unparsed = actuallyUnparse(parts)
        previousURL = unparsed
        let height = scrollHeights[unparsed] || 0
        await tick()
        window.scrollTo(0, height)
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
            searchResults = { title_matches: [], content_matches: [] }
        }
    }

    const searchKeypress = ev => {
        if (ev.key === "Enter" && searchResults) {
            const results = (ev.shiftKey ? searchResults.title_matches : searchResults.content_matches).filter(x => x[0] !== currentPage)
            if (results.length > 0) {
                switchPage(results[0][0])
            }
        }
    }

    const reverse = xs => {
        const xsprime = xs.map(x => x)
        xsprime.reverse()
        return xsprime
    }

    let clearButton

    const hideSearchResults = async () => {
        if (searchResults) {
            searchResults.content_matches = []
            await tick()
            clearButton.scrollIntoView()
        }
    }

    onMount(updateRoute)

    var searchInput
    registerShortcut("/", () => searchInput.focus())
    registerShortcut("e", () => switchPageState("edit"))
    registerShortcut("v", () => switchPageState(""))
</script>

<svelte:window on:hashchange={updateRoute} />

<main class={vertical ? "vertical" : ""}>
    <div class={"navigation " + (searchMode ? "search-mode" : vertical ? "" : "sidebar")}>
        <LinkButton href="#/" color="#5170d7">Index</LinkButton>
        <LinkButton href="#/search" color="#fac205">Search</LinkButton>
        <LinkButton href="#/create" color="#bc13fe">Create</LinkButton>
        <div>
            {#if recent}
                Last: <ul class="inline very-inline">
                    {#each reverse(recent) as r}
                        <li><a class="wikilink" href={`#/page/${r[0]}`}>{r[1]}</a></li>
                    {/each}
                </ul>
            {/if}
        </div>
        <input type="search" bind:value={searchQuery} on:input={searchInputHandler} on:keydown={searchKeypress} bind:this={searchInput} placeholder="Search" class="search-input">
        {#if searchResults}
            <ul class="inline">
                {#each searchResults.title_matches as [id, title]}
                    <li><a class="wikilink" href={`#/page/${id}`}>{title}</a></li>
                {/each}
            </ul>
            <div class="result-pages">
                {#each searchResults.content_matches as [id, page]}
                <div class="result-page">
                    <ShortPageDescription page={page} />
                </div>
                {/each}
            </div>
        {/if}
        {#if vertical}
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a href="#" on:click|preventDefault={hideSearchResults} bind:this={clearButton}>Clear</a>
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
        <div class={"meta " + vertical ? "" : "sidebar"}>
            <MetadataSidebar page={page} />
        </div>
    {/if}
</main>