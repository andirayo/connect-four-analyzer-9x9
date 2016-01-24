var CONFIG = {
  BOARDSIZE_WIDTH:  9,
  BOARDSIZE_HEIGHT: 9,
  CELL_SIZE:        30,
  PLAYER1:          'yellow',
  PLAYER2:          'red',
};

var c4 = { boardsizeWidth: CONFIG.BOARDSIZE_WIDTH, boardsizeHeight: CONFIG.BOARDSIZE_HEIGHT };

c4.game = (function() {
  'use strict';

  var board = [],
      winner = false,
      player = CONFIG.PLAYER1,

      removeWinner = function(){
        winner = false;
      },

      clearBoard = function(){

        board.length = 0;
        winner = false;
        player = CONFIG.PLAYER1;
        while(board.push([]) < c4.boardsizeWidth){
        }
      },

      dropDisc = function (column, color) {

        if(column === undefined || color === undefined || winner){
          return false;
        }

        if(board.length === 0){
          clearBoard();
        }

        if(column >= c4.boardsizeWidth || column < 0 || board[column].length >= c4.boardsizeHeight){
          return false;
        }

        board[column].push(color);

        return true;
      },

      winningMove = function (column, color) {

        if(column === undefined || color === undefined){
          return false;
        }

        /* check vertically */
        var numberDiscs = board[column].length,
            fourInColumn = board[column].slice(numberDiscs - 4, numberDiscs),
            i, j;

        for (i = 0; i < 4; i++) {
          if(color !== fourInColumn[i]){
            break;
          }
          if(i === 3){
            winner = true;
            return true;
          }
        }

        /* check horizontal */
        var row = board[column].length - 1,
            horizontal, diagnalRight, diagnalLeft;
        horizontal = diagnalRight = diagnalLeft = 1;

        for (i = column - 1; i >= 0; i--) {

          if(board[i][row] !== color) {
            break;
          }
          if(board[i][row] === color){
            horizontal++;
          }
          if(horizontal >= 4){
            winner = true;
            return true;
          }
        }

        for (i = column + 1; i < c4.boardsizeWidth; i++) {
          if(board[i][row] !== color){
            break;
          }
          if(board[i][row] === color){
            horizontal++;
          }
          if(horizontal >= 4){
            winner = true;
            return true;
          }
        }

        /* check diagnal right */
        for (i = column + 1, j = numberDiscs; i < c4.boardsizeWidth && j < c4.boardsizeHeight; i++) {
          if(board[i][j] !== color){
            break;
          }
          if(board[i][j] === color){
            diagnalRight ++;
          }
          if(diagnalRight >= 4){
            winner = true;
            return true;
          }
          j++;
        }

        for (i = column - 1, j = numberDiscs - 2; i >= 0 && j >= 0; i--) {
          if(board[i][j] !== color){
            break;
          }
          if(board[i][j] === color){
            diagnalRight ++;
          }
          if(diagnalRight >= 4){
            winner = true;
            return true;
          }
          j--;
        }

        /* check diagnal left */
        for (i = column - 1, j = numberDiscs; i >= 0 && j < c4.boardsizeHeight; i--) {
          if(board[i][j] !== color){
            break;
          }
          if(board[i][j] === color){
            diagnalLeft ++;
          }
          if(diagnalLeft >= 4){
            winner = true;
            return true;
          }
          j++;
        }

        for (i = column + 1, j = numberDiscs - 2; i < c4.boardsizeWidth && j >= 0; i++) {
          if(board[i][j] !== color){
            break;
          }
          if(board[i][j] === color){
            diagnalLeft ++;
          }
          if(diagnalLeft >= 4){
            winner = true;
            return true;
          }
          j--;
        }

        return false;

      },

      togglePlayer = function () {

        this.player = this.player === CONFIG.PLAYER1 ? CONFIG.PLAYER2 : CONFIG.PLAYER1;
      },

      fullBoard = function () {

        for (var i = 0; i < board.length; i++) {
          if(board[i].length !== c4.boardsizeHeight){
            return false;
          }
        }
        return true;
      };


  return {
    clearBoard: clearBoard,
    dropDisc: dropDisc,
    winningMove: winningMove,
    togglePlayer: togglePlayer,
    fullBoard: fullBoard,
    player: player,
    board: board,
    winner: winner,
    removeWinner: removeWinner
  };

}) ();

c4.util = (function ($, window, document) {

  var i, j, board,

      buttonRestart       = $('#buttonRestart'),
      buttonBack          = $('#buttonBack'),
      buttonForth         = $('#buttonForth'),
      buttonBoardsize76   = $('#buttonBoardsize76'),
      buttonBoardsize88   = $('#buttonBoardsize88'),
      buttonBoardsize99   = $('#buttonBoardsize99'),

      boardAreas          = $('.boardArea'),

      listOfDiscs         = [],

      winner = $('#winner'),
      winnerName = $('#winnerName'),
      player1 = $('#player1'),
      player2 = $('#player2'),

      resetBoardAreas = function() {
        boardAreas.each( function(index, boardArea) {
          while (boardArea.firstChild) {
            boardArea.firstChild.remove();
            boardArea.removeChild(boardArea.firstChild);
          }
        })
      },

      initializeBoards = function() {
        resetBoardAreas();

        board = $('<div>', {class: "board"});
        board.css({width: CONFIG.CELL_SIZE * c4.boardsizeWidth, height: CONFIG.CELL_SIZE * c4.boardsizeHeight});

        var discs = [];
        for (i = 0; i < c4.boardsizeWidth; i++) {
          for (j = 0; j < c4.boardsizeHeight; j++) {
            var disc = $('<div>', {class: "boardPiece", "data-column": i});
            var left = i * CONFIG.CELL_SIZE;
            var bottom = j * CONFIG.CELL_SIZE;
            $(disc).css({left: left, bottom: bottom, width: CONFIG.CELL_SIZE, height: CONFIG.CELL_SIZE, 'background-size': CONFIG.CELL_SIZE});
            discs.push(disc);
          }
        }

        board.append(discs);
        boardAreas.append( board );

        c4.game.clearBoard();
      },

      addDisc = function (left, bottom, selectedColumn) {

        var disc = document.createElement("div");
        listOfDiscs.push( [disc, selectedColumn] );

        var bottomLocation = (10 + CONFIG.CELL_SIZE * c4.boardsizeHeight);
        $(disc).css({left: left, bottom: bottomLocation, width: CONFIG.CELL_SIZE, height: CONFIG.CELL_SIZE, 'background-size': CONFIG.CELL_SIZE});
        board.get(0).appendChild(disc);

        disc.setAttribute("class", c4.game.player=== CONFIG.PLAYER1 ? "yellowDisc" : "redDisc");
        disc.setAttribute("data-column", selectedColumn);

        /* called to allow CSS3 transitions for dynamically created dom element. */
        /*jshint -W030 */
        window.getComputedStyle(disc).bottom;
        disc.style.bottom = bottom + "px";

      },
      removeLastDisc = function () {
        var last    = listOfDiscs.pop();
        var disc    = last[0];
        var column  = last[1];

        c4.game.board[column].pop();
        //disc.outerHTML = '';
        board.get(0).removeChild(disc);
        c4.game.removeWinner();
        togglePlayer();
      },


      showNewGame = function () {

        player1.addClass('hidden');
        player2.addClass('hidden');
        newGameButton.removeClass('hidden');
      },

      togglePlayer = function () {

        c4.game.togglePlayer();
        player1.toggleClass('hidden');
        player2.toggleClass('hidden');
      },

      announceWinner = function () {

        winnerName.text(c4.game.player === CONFIG.PLAYER1 ? "Player one" : "Player two");
        winnerName.addClass(c4.game.player);
        winner.removeClass('hidden');
        showNewGame();
      },

      newGame = function () {

        c4.game.clearBoard();
        $('.yellowDisc').remove();
        $('.redDisc').remove();
        winner.addClass('hidden');
        newGameButton.addClass('hidden');
        player1.removeClass('hidden');
        player2.addClass('hidden');
      },

      selectedColumnMouse = function(e) {
        var selectedColumn;
        if (e.target === this) {
          selectedColumn = Math.floor(e.offsetX / CONFIG.CELL_SIZE);
        }
        else {
          selectedColumn = $(e.target).data('column');
        }
        return selectedColumn;
      },

      discDestination = function(selectedColumn){
        if (c4.boardsizeWidth <= selectedColumn) {
          return null;
        }
        if (0 > selectedColumn) {
          return null;
        }

        return {
          selectedColumn: selectedColumn,
          left: selectedColumn * CONFIG.CELL_SIZE,
          bottom: c4.game.board[selectedColumn].length * CONFIG.CELL_SIZE
        };
      },

      tryingToDropDisc = function (selectedColumn) {

        destination = discDestination(selectedColumn);

        if (null == destination) {
          return null;
        }

        if(c4.game.dropDisc(destination.selectedColumn, c4.game.player)) {
          addDisc(destination.left, destination.bottom, destination.selectedColumn);
          if(c4.game.winningMove(destination.selectedColumn, c4.game.player)){
            announceWinner();
            //return;
          }
          togglePlayer();
        }
      },

      changeBoardSize = function( boardsize_width, boardsize_height ) {
        c4.boardsizeWidth = boardsize_width;
        c4.boardsizeHeight = boardsize_height;
        $('#headline_size').text( c4.boardsizeWidth + 'x' + c4.boardsizeHeight);

        initializeBoards();
      },

      init = function (getParams) {
        changeBoardSize( CONFIG.BOARDSIZE_WIDTH, CONFIG.BOARDSIZE_HEIGHT );

        $(document).keyup(function(e){
          // backspace
          if (8 == e.which) {
            removeLastDisc();
          }
          // left
          if (37 == e.which) {
            removeLastDisc();
          }
          //right
          if (39 == e.which) {

          }
        });

        $(document).keypress(function(e){
          if(c4.game.winner) {
            return;
          }

          if (48 == e.which) {
            tryingToDropDisc( 9 );
          }
          if (45 == e.which) {
            tryingToDropDisc( 10 );
          }
          if (49 <= e.which  && e.which <= 57) {
            tryingToDropDisc( e.which - 49 );
          }
        });

        boardAreas.on('click', function (e) {

          if(c4.game.winner) {
            return;
          }

          var selectedColumn = selectedColumnMouse(e);
          tryingToDropDisc( selectedColumn );

          if(c4.game.fullBoard()){
            showNewGame();
            return;
          }
        });

        buttonRestart.on('click', function () {
          console.log('HELLO1');
          newGame();
        });
        buttonBack.on('click', function () {
          console.log('HELLO');
          removeLastDisc();
        });
        buttonForth.on('click', function () {
          console.log('Button Forth');
        });
        buttonBoardsize76.on('click', function () {
          console.log('Button Forth333');
          changeBoardSize(7, 6);
        });
        buttonBoardsize88.on('click', function () {
          changeBoardSize(8, 8);
        });
        buttonBoardsize99.on('click', function () {
          changeBoardSize(9, 9);
        });
      };

  return {
    init: init,
    togglePlayer: togglePlayer,
    announceWinner: announceWinner,
  };

}) (window.jQuery, window, document);


