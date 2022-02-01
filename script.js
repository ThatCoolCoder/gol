const viewportSizeTakenX = 0.9;
const viewportSizeTakenY = 0.85;

var cWidth = spnr.dom.viewportWidth() * viewportSizeTakenX;
var cHeight = spnr.dom.viewportHeight() * viewportSizeTakenY;

spnr.GameEngine.init(spnr.v(cWidth, cHeight), 1, 0x000000);

var fps = 60;

var golScene = new GolScene();

for (var i = 0; i < Math.min(initialGridValue.length, golScene.gol.grid.length); i ++) {
    golScene.gol.grid[i] = initialGridValue[i];
}

spnr.GameEngine.selectScene(golScene);