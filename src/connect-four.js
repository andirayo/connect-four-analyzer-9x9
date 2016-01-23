var CONFIG = {
  BOARDSIZE_WIDTH:  9,
  BOARDSIZE_HEIGHT: 9,
  CELL_SIZE:        60,
  PLAYER1:          'yellow',
  PLAYER2:          'red',
};

var connectFour = {};

connectFour.game = (function() {
  'use strict';

  var board = [],
      columns = CONFIG.BOARDSIZE_WIDTH,
      rows = CONFIG.BOARDSIZE_HEIGHT,
      winner = false,
      player = CONFIG.PLAYER1,

      removeWinner = function(){
        winner = false;
      },

      clearBoard = function(){

        board.length = 0;
        winner = false;
        player = CONFIG.PLAYER1;
        while(board.push([]) < columns){
        }
      },

      dropDisc = function (column, color) {

        if(column === undefined || color === undefined || winner){
          return false;
        }

        if(board.length === 0){
          clearBoard();
        }

        if(column >= CONFIG.BOARDSIZE_WIDTH || column < 0 || board[column].length >= rows){
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

        for (i = column + 1; i < columns; i++) {
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
        for (i = column + 1, j = numberDiscs; i < columns && j < rows; i++) {
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
        for (i = column - 1, j = numberDiscs; i >= 0 && j < rows; i--) {
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

        for (i = column + 1, j = numberDiscs - 2; i < columns && j >= 0; i++) {
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
          if(board[i].length !== rows){
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

connectFour.util = (function ($, window, document) {

  var i, j, board,
      player1 = $('#player1'),
      player2 = $('#player2'),
      newGameButton = $('#newGame'),
      winner = $('#winner'),
      winnerName = $('#winnerName'),
      listOfDiscs = [],

      setBoard = function(b) {
        board = b;
      },

      initializeBoard = function (board) {
        setBoard( board );
        board.get(0).style.width   = (CONFIG.CELL_SIZE * CONFIG.BOARDSIZE_WIDTH) + 'px';
        board.get(0).style.height  = (CONFIG.CELL_SIZE * CONFIG.BOARDSIZE_HEIGHT) + 'px';

        var discs = [];
        for (i = 0; i < CONFIG.BOARDSIZE_WIDTH; i++) {
          for (j = 0; j < CONFIG.BOARDSIZE_HEIGHT; j++) {
            var disc = $('<div>', {class: "emptyDisc",
              "data-column": i
            });
            var left = i * CONFIG.CELL_SIZE;
            var bottom = j * CONFIG.CELL_SIZE;
            $(disc).css({left: left, bottom: bottom});
            discs.push(disc);
          }
        }
        board.append(discs);
        connectFour.game.clearBoard();
      },

      addDisc = function (board, left, bottom, selectedColumn) {

        var disc = document.createElement("div");
        listOfDiscs.push( [disc, selectedColumn] );

        disc.style.left = left + "px";
        disc.style.bottom = (10 + CONFIG.CELL_SIZE * CONFIG.BOARDSIZE_HEIGHT) + "px";
        board.get(0).appendChild(disc);

        disc.setAttribute("class", connectFour.game.player=== CONFIG.PLAYER1 ? "yellowDisc" : "redDisc");
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

        connectFour.game.board[column].pop();
        disc.outerHTML = '';
        connectFour.game.removeWinner();
        togglePlayer();
      },


      showNewGame = function () {

        player1.addClass('hidden');
        player2.addClass('hidden');
        newGameButton.removeClass('hidden');
      },

      togglePlayer = function () {

        connectFour.game.togglePlayer();
        player1.toggleClass('hidden');
        player2.toggleClass('hidden');
      },

      announceWinner = function () {

        winnerName.text(connectFour.game.player === CONFIG.PLAYER1 ? "Player one" : "Player two");
        winnerName.addClass(connectFour.game.player);
        winner.removeClass('hidden');
        showNewGame();
      },

      newGame = function () {

        connectFour.game.clearBoard();
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
        if (CONFIG.BOARDSIZE_WIDTH <= selectedColumn) {
          return null;
        }
        if (0 > selectedColumn) {
          return null;
        }

        return {
          selectedColumn: selectedColumn,
          left: selectedColumn * CONFIG.CELL_SIZE,
          bottom: connectFour.game.board[selectedColumn].length * CONFIG.CELL_SIZE
        };
      },

      tryingToDropDisc = function (selectedColumn) {

        destination = discDestination(selectedColumn);

        if (null == destination) {
          return null;
        }

        if(connectFour.game.dropDisc(destination.selectedColumn, connectFour.game.player)) {
          addDisc(board, destination.left, destination.bottom, destination.selectedColumn);
          if(connectFour.game.winningMove(destination.selectedColumn, connectFour.game.player)){
            announceWinner();
            //return;
          }
          togglePlayer();
        }
      },

      init = function (board) {

        $('#headline_size').text('9x9');

        initializeBoard(board);

        $(document).keyup(function(e){
          if (8 == e.which) {
            removeLastDisc();
          }
        });

        $(document).keypress(function(e){
          if(connectFour.game.winner) {
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

        board.on('click', function (e) {

          if(connectFour.game.winner) {
            return;
          }

          var selectedColumn = selectedColumnMouse(e);
          tryingToDropDisc( selectedColumn );

          if(connectFour.game.fullBoard()){
            showNewGame();
            return;
          }
        });

        newGameButton.on('click', function () {
          newGame();
        });
      };

  return {
    init: init,
    togglePlayer: togglePlayer,
    announceWinner: announceWinner,
  };

}) (window.jQuery, window, document);