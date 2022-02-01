class GolScene extends spnr.GameEngine.Scene {
    fpsSlider = spnr.dom.id('fpsSlider');
    fpsSliderLabel = spnr.dom.id('fpsSliderLabel');
    pauseButton = spnr.dom.id('pauseButton');
    wrapGridToggle = spnr.dom.id('wrapGridToggle');
    
    constructor() {
        super('gol', spnr.v(0, 0), 0);

        this.gol = new GOL(60, Math.floor(cHeight / (cWidth / 60)));

        this.pausedText = new spnr.GameEngine.Label('paused label', 'The simulation is currently paused.',
            spnr.v(spnr.GameEngine.canvasSize.x / 2, 50), spnr.PI, {fill : 0xff0000});
        this.addChild(this.pausedText);

        this.paused = true;
        this.simulationFps = 0;

        this.setupEvents();
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
            var sprite = new spnr.GameEngine.DrawableEntity('cell #' + idx, spnr.v(0, 0), 0,
                PIXI.Texture.WHITE, spnr.v(this.cellSize, this.cellSize), spnr.v(1, 1));
            this.addChild(sprite);
            this.sprites.push(sprite);
        });

        this.updateSpritePositions();

        // Remove and add text to make it on top
        this.removeChild(this.pausedText);
        this.addChild(this.pausedText);
    }

    setupEvents() {
        spnr.GameEngine.mouse.onPointerDown.add(() => {
            var index = this.idxFromSpritePos(spnr.GameEngine.mouse.position);
            this.gol.toggleCellAtIndex(index);
        });
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
        var newSpeed = this.fpsSlider.value / 10;
        if (newSpeed != this.simulationFps) {
            if (this.updateInterval != null) clearInterval(this.updateInterval);
            this.simulationFps = newSpeed;
            this.updateInterval = setInterval(() => {
                if (! this.paused) this.gol.step();
            }, 1000 / this.simulationFps);
        }
        
        this.fpsSliderLabel.innerText = 'Speed: ' + this.simulationFps.toFixed(1) + ' fps';
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

        this.frameCount ++;
    }
}