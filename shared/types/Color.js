class Color {
    constructor(r = 0, g = 0, b = 0, a = 1) {
    }

    static fromHex(hex) {
        // Convert hex to RGBA
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return new Color(r, g, b, 1);
    }
}