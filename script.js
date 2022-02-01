const viewportSizeTakenX = 0.9;
const viewportSizeTakenY = 0.85;

var cWidth = spnr.dom.viewportWidth() * viewportSizeTakenX;
var cHeight = spnr.dom.viewportHeight() * viewportSizeTakenY;

spnr.GameEngine.init(spnr.v(cWidth, cHeight), 1, 0x000000);

var fps = 60;

function mousePressed() {
    var colNum = Math.floor(mouseX / cellSize);
    var rowNum = Math.floor(mouseY / cellSize);

    gol.toggleCellAtCoords(colNum, rowNum);
    drawGol(gol);
}

class GolScene extends spnr.GameEngine.Scene {
    speedSlider = spnr.dom.id('speedSlider');
    speedSliderLabel = spnr.dom.id('speedSliderLabel');
    pauseButton = spnr.dom.id('pauseButton');
    wrapGridToggle = spnr.dom.id('wrapGridToggle');
    
    constructor() {
        super('gol', spnr.v(0, 0), 0);

        this.gol = new GOL(60, Math.floor(cHeight / (cWidth / 60)));
        for (var i = 0; i < Math.min(initialGridValue.length, this.gol.grid.length); i ++) {
            this.gol.grid[i] = initialGridValue[i];
        }

        this.pausedText = new spnr.GameEngine.Label('paused label', 'The simulation is currently paused.',
            spnr.v(spnr.GameEngine.canvasSize.x / 2, 50), spnr.PI, {fill : 0xff0000});
        this.addChild(this.pausedText);

        this.frameCount = 0;
        this.paused = true;
        this.mouseDownLastFrame = false;

        this.createSprites();
    }

    togglePause() {
        this.paused = ! this.paused;
        if (this.paused) {
            this.pauseButton.innerText = 'Unpause';
            this.pausedText.setVisible(true);
        }
        else {
            this.pauseButton.innerText = 'Pause';
            this.pausedText.setVisible(false);
        }
    }

    findCellSize() {
        this.cellSize = Math.min(cWidth / this.gol.colAmount, cHeight / this.gol.rowAmount);
    }

    createSprites() {
        this.findCellSize(this.gol);
        this.removeChildren();
        this.sprites = [];

        this.gol.grid.forEach((cell, idx) => {
            var sprite = new spnr.GameEngine.DrawableEntity('this.gol cell #' + idx, spnr.v(0, 0), 0,
                PIXI.Texture.WHITE, spnr.v(this.cellSize, this.cellSize), spnr.v(1, 1));
            this.addChild(sprite);
            this.sprites.push(sprite);
        });

        this.updateSpritePositions();

        // Remove and add text to make it on top
        this.removeChild(this.pausedText);
        this.addChild(this.pausedText);
    }

    updateSpritePositions() {
        this.sprites.forEach((sprite, idx) => {
            var pos = this.calcSpritePos(idx);
            sprite.setLocalPosition(pos);
        });
    }

    calcSpritePos(idx) {
        var [col, row] = this.gol.indexToCoords(idx);
        var position = spnr.v(0, 0);
        position.x = col * this.cellSize;
        position.y = row * this.cellSize;
        return position;
    }

    idxFromSpritePos(pos) {
        var golCoord = spnr.v.copyDiv(pos, this.cellSize);
        return this.gol.coordsToIndex(spnr.floor(golCoord.x), spnr.floor(golCoord.y));
    }

    updateSettings() {
        this.speed = this.speedSlider.value / 10;
        this.speedSliderLabel.innerText = 'Speed: ' + this.speed.toFixed(1) + ' fps';
        this.gol.settings.wrapGrid = this.wrapGridToggle.checked;
    }

    drawGol(gol) {
        this.gol.grid.forEach((value, idx) => {
            this.drawCell(idx, value);
        });
    }

    drawCell(idx, value) {
        var sprite = this.sprites[idx];
        if (value == 1) sprite.setTint(0xffffff);
        else sprite.setTint(0x000000);
    }

    update() {
        this.drawGol();

        this.updateSettings();

        // If the mouse went down this frame, then draw here
        if (spnr.GameEngine.mouse.pointerDown && ! this.mouseDownLastFrame) {
            var index = this.idxFromSpritePos(spnr.GameEngine.mouse.position);
            this.gol.toggleCellAtIndex(index);
        }

        if (! this.paused && this.frameCount % (fps / this.speed) < 1) {
            this.gol.step();
        }
        this.frameCount ++;
        this.mouseDownLastFrame = spnr.GameEngine.mouse.pointerDown;
    }
}

var golScene = new GolScene();

spnr.GameEngine.selectScene(golScene);