class GOL {
    // Conway's Game Of Life simulation
    // contains a grid of numbers, which are the cells
    // a 0 means that the cell is dead,
    // a 1 means that the cell is alive
    // this greatly simplifies storing as json, among many other things

    settings = {
        wrapGrid : true
    };
    
    constructor(colAmount, rowAmount) {
        this.colAmount = colAmount;
        this.rowAmount = rowAmount;

        this.grid = new Array(this.colAmount * this.rowAmount).fill(0);

        this.surroundingCellPatterns = [
            [-1, 0], // left
            [-1, -1], // up left
            [0, -1], // up
            [1, -1], // up right
            [1, 0], // right
            [1, 1], // down right
            [0, 1], // down
            [-1, 1] // down left
        ];
    }

    coordsToIndex(colNum, rowNum) {
        return rowNum * this.colAmount + colNum;
    }

    indexToCoords(index) {
        // Unpack the return value like so:
        // var [col, row] = gol.indexToCoords(55);

        var colNum = index % this.colAmount;
        var rowNum = Math.floor(index / this.colAmount);
        return [colNum, rowNum];
    }

    getCellAtIndex(index) {
        return this.grid[index];
    }

    getCellAtCoords(colNum, rowNum) {
        return this.getCellAtIndex(this.coordsToIndex(colNum, rowNum));
    }

    setCellAtIndex(index, value) {
        this.grid[index] = value;
    }

    setCellAtCoords(colNum, rowNum, value) {
        this.setCellAtIndex(this.coordsToIndex(colNum, rowNum));
    }

    toggleCellAtIndex(index) {
        if (this.grid[index] == 0) this.grid[index] = 1;
        else this.grid[index] = 0;
    }

    toggleCellAtCoords(colNum, rowNum) {
        this.toggleCellAtIndex(this.coordsToIndex(colNum, rowNum));
    }

    clear() {
        this.grid.fill(0);
    }

    step() {
        // Step the game of life simulation forward by one generation
        // This is the main function

        // You'll notice that we create a new grid for the new generation,
        // instead of editing the old one.
        // This is because if we edited the old one, some parts of the grid...
        // ...would be updated before others, which would seriously mess things up
        
        var newGrid = [];
        for (var rowNum = 0; rowNum < this.rowAmount; rowNum ++) {
            for (var colNum = 0; colNum < this.colAmount; colNum ++) {
                var index = this.coordsToIndex(colNum, rowNum);
                newGrid[index] = this.updateCell(colNum, rowNum, this.grid[index]);
            }
        }

        // Set the grid to the new grid
        this.grid = newGrid.concat([]);
    }

    updateCell(colNum, rowNum, crntValue) {
        var newValue = 0;

        var neighborCount = this.getSurroundingCells(colNum, rowNum).reduce((a, b) => a + b);

        // If there are not enough neighbors
        if (neighborCount < 2) {
            newValue = 0;
        }
        // If there are 2 neighbors stay alive
        else if (crntValue == 1 && neighborCount == 2) {
            newValue = 1;
        }
        // If there are 3 neighbors either stay alive or become alive
        else if (neighborCount == 3) {
            newValue = 1;
        }
        // If it's too crowded, die
        else {
            newValue = 0;
        }
        return newValue;
    }

    getSurroundingCells(colNum, rowNum) {
        // Performance critical so we don't use the proper accessor for getCellAtIndex

        var surroundingCells = [];
        for (var offset of this.surroundingCellPatterns) {
            var col = colNum + offset[0];
            var row = rowNum + offset[1];
            if (this.settings.wrapGrid) {
                if (row < 0) row = this.rowAmount - 1;
                if (row >= this.rowAmount) row = 0;
                if (col < 0) col = this.colAmount - 1;
                if (col >= this.colAmount) col = 0;
            }
            else {
                if (col < 0 || row < 0 || col >= this.colAmount || row >= this.rowAmount) {
                    surroundingCells.push(0);
                    continue;
                }
            }
            surroundingCells.push(this.getCellAtCoords(col, row));
        }
    
        return surroundingCells;
    }
}