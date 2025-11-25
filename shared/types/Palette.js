import { Color } from './Color.js';

export class Palette {
    constructor(colors = []) {
        this.colors = colors; // Array of Color instances
    }

    visualize() {
        //create an html file to visualize palette
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Palette Visualization</title>
    <style>
        body { margin: 0; padding: 0; display: flex; }
        .color-swatch { flex: 1; height: 100vh; }
    </style>
</head>
<body>
    ${this.colors.map(color => {
            const { r, g, b } = color.getRGB();
            return `<div class="color-swatch" style="background-color: rgb(${r}, ${g}, ${b});"></div>`;
        }).join('')}
</body>
</html>`;

    return htmlContent;
    }
}
