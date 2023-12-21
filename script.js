var App = React.createClass({ displayName: "App",
  render: function () {
    return /*#__PURE__*/(
      React.createElement("div", { className: "main" }, /*#__PURE__*/
      React.createElement(Conway, null)));


  } });


var Conway = React.createClass({ displayName: "Conway",

  mixins: [React.addons.LinkedStateMixin],

  componentWillMount: function () {
    window.addEventListener('resize', this.windowResized);
    this.setState({ worldDimensions: this.getWorldDimensions() });
  },

  getDefaultProps: function () {
    return {
      cellDimension: 15,
      cellMargin: 2,
      lifeSpeed: 150 };

  },

  getInitialState: function () {
    return {
      lifeRunning: false,
      lifeSpeed: this.props.lifeSpeed,
      livingCells: {},
      lifeGeneration: 0,
      worldDimensions: {
        height: 0,
        width: 0 } };


  },

  render: function () {
    return /*#__PURE__*/(
      React.createElement("div", { className: "conway" }, /*#__PURE__*/
      React.createElement("div", this.getWorldProps(),
      this.renderCells()), /*#__PURE__*/

      React.createElement("div", { className: "conway--controls" }, /*#__PURE__*/
      React.createElement("button", { onClick: this.handleBeginClick }, "begin"), /*#__PURE__*/
      React.createElement("button", { onClick: this.handleStopClick }, "stop"), /*#__PURE__*/
      React.createElement("button", { onClick: this.handleRandomClick }, "random"), /*#__PURE__*/
      React.createElement("button", { onClick: this.handleResetClick }, "reset"), "speed (in ms)", /*#__PURE__*/
      React.createElement("input", { type: "text", valueLink: this.linkState('lifeSpeed') }), /*#__PURE__*/
      React.createElement("div", null, "Generation: ", this.state.lifeGeneration))));



  },

  renderCells: function () {
    var aliveClass;
    var colCount = this.getCellCount('width');
    var rowCount = this.getCellCount('height');
    var cellKey;
    var cellProps;
    var cells = [];
    var deadClass;

    for (var yCord = 0; yCord < rowCount; yCord += 1) {
      for (var xCord = 0; xCord < colCount; xCord += 1) {
        cellKey = xCord + '-' + yCord;
        aliveClass = this.state.livingCells[cellKey] ? ' conway--cell_alive' : '';
        deadClass = this.state.livingCells[cellKey] === false ? ' conway--cell_dead' : '';
        cellProps = {
          className: 'conway--cell' + aliveClass + deadClass,
          key: cellKey,
          onClick: this.handleCellClick.bind(null, cellKey) };


        cells.push( /*#__PURE__*/React.createElement("div", cellProps));
      }
    }

    return cells;
  },

  getWorldProps: function () {
    return {
      className: 'conway-world',
      style: this.getWorldDimensions() };

  },

  getWorldDimensions: function () {
    var controlsheight = 100;

    return {
      height: window.innerHeight - controlsheight,
      width: window.innerWidth || document.body.clientWidth };

  },

  getCellCount: function (dimensionType) {
    return Math.floor(
    this.state.worldDimensions[dimensionType] / (this.props.cellDimension + this.props.cellMargin));

  },

  windowResized: function () {
    this.setState({ worldDimensions: this.getWorldDimensions() });
  },

  progressLife: function () {
    if (this.state.lifeRunning) {
      this.life = setTimeout(function () {
        var cells = this.state.livingCells;
        var cellKeys = Object.keys(cells);
        var potentialLife = {};
        var extinctLife = [];
        var potentialLifeKeys;

        for (var index = 0, length = cellKeys.length; index < length; index += 1) {
          var currentCell = cellKeys[index];

          if (cells[currentCell]) {
            var split = currentCell.split('-');
            var xParsedCord = parseInt(split[0]);
            var yParsedCord = parseInt(split[1]);
            var xCords = this.getNeighbors(xParsedCord, 'width');
            var yCords = this.getNeighbors(yParsedCord, 'height');
            var livingAdjacentCells = 0;

            for (var xIndex = 0; xIndex < xCords.length; xIndex += 1) {
              for (var yIndex = 0; yIndex < yCords.length; yIndex += 1) {
                var cellToCheck = xCords[xIndex] + '-' + yCords[yIndex];

                if (cellToCheck !== currentCell) {
                  if (cells[cellToCheck]) {
                    livingAdjacentCells += 1;
                  } else {
                    potentialLife[cellToCheck] ?
                    potentialLife[cellToCheck] += 1 :
                    potentialLife[cellToCheck] = 1;
                  }
                }
              }
            }

            if (livingAdjacentCells < 2 || livingAdjacentCells > 3) {
              extinctLife.push(currentCell);
            }
          }
        }

        for (var index = 0, length = extinctLife.length; index < length; index += 1) {
          cells[extinctLife[index]] = false;
        }

        potentialLifeKeys = Object.keys(potentialLife);

        for (var index = 0, length = potentialLifeKeys.length; index < length; index += 1) {
          var newLifeKey = potentialLifeKeys[index];

          if (potentialLife[newLifeKey] === 3) {
            cells[newLifeKey] = true;
          }
        }

        this.setState({
          livingCells: cells,
          lifeGeneration: this.state.lifeGeneration += 1 },
        this.progressLife);

      }.bind(this), this.state.lifeSpeed);
    }
  },

  getNeighbors: function (originalCord, dimension) {
    var maxCount = this.getCellCount(dimension);
    var neighbors = [originalCord];

    if (originalCord - 1 >= 0) {neighbors.push(originalCord - 1);}
    if (originalCord + 1 < maxCount) {neighbors.push(originalCord + 1);}

    return neighbors;
  },

  randomlyGiveLife: function () {
    var colCount = this.getCellCount('width');
    var rowCount = this.getCellCount('height');
    var cells = {};

    for (var yCord = 0; yCord < rowCount; yCord += 1) {
      for (var xCord = 0; xCord < colCount; xCord += 1) {
        if (Math.floor(Math.random() * 3) === 0) {
          cells[xCord + '-' + yCord] = true;
        }
      }
    }

    this.setState({
      lifeRunning: true,
      livingCells: cells },
    this.progressLife);
  },

  handleBeginClick: function () {
    if (!this.state.lifeRunning) {
      this.setState({
        drawingMode: false,
        lifeRunning: true },
      this.progressLife);
    }
  },

  handleStopClick: function () {
    clearTimeout(this.life);

    this.setState({
      drawingMode: false,
      lifeRunning: false });

  },

  handleRandomClick: function () {
    this.handleResetClick();
    this.randomlyGiveLife();
  },

  handleDrawClick: function () {
    this.setState({
      drawingMode: !this.state.drawingMode,
      lifeRunning: false });

  },

  handleResetClick: function () {
    clearTimeout(this.life);

    this.setState({
      drawingMode: false,
      lifeRunning: false,
      livingCells: {},
      lifeGeneration: 0 });

  },

  handleCellClick: function (cellKey, event) {
    var updatedLivingCells = this.state.livingCells;

    updatedLivingCells[cellKey] = !updatedLivingCells[cellKey];

    this.setState({ livingCells: updatedLivingCells });
  } });


ReactDOM.render( /*#__PURE__*/React.createElement(App, null), document.getElementById('app'));