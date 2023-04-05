<style lang="sass">
    a
        border: none
        padding: 0.75em
        background: gray
        text-align: center
        text-decoration: none
        color: black
        display: inline-block
        font-size: 1rem
        &:hover
            // very hacky way to make the button darker when hovered
            background-image: linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2))
</style>

<script>
    export let href
    export let color
</script>

<a href={href} style={`background-color: ${color}`}><slot /></a>