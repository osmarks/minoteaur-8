<a class="wikilink" href={`#/page/${id}`}>{title}</a>

<script>
    /*
    function fnv32a( str )
    {
        var FNV1_32A_INIT = 0x811c9dc5;
        var hval = FNV1_32A_INIT;
        for ( var i = 0; i < str.length; ++i )
        {
            hval ^= str.charCodeAt(i);
            hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
        }
        return hval >>> 0;
    }

    const doHSL = (x, i) => `hsl(${fnv32a(x + 0..toString()) % 360 + i * 30}deg, 100%, 40%)`
    const generateGradientBackground = n => `background: linear-gradient(to right, ${doHSL(n, 0)}, ${doHSL(n, 1)})`
    */

    export let id
    export let title
</script>