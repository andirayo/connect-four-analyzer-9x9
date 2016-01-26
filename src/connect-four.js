var CONFIG = {
  BOARDSIZE_WIDTH:  9,
  BOARDSIZE_HEIGHT: 9,
  CELL_SIZE:        30,

  PLAYER_COLORS: {
    1: 'yellow',
    2: 'red',
  },
  PLAYER_CLASSES: {
    1: 'yellowDisc',
    2: 'redDisc',
  },
};

var c4 = { boardsizeWidth: CONFIG.BOARDSIZE_WIDTH, boardsizeHeight: CONFIG.BOARDSIZE_HEIGHT };

var C4Game = function( newBoardArea ) {
  var boardArea, gameCells, winner,
      // go back, go forward
      listOfDiscs         = [],
      possibleNextDiscs   = [],

      reset = function() {
        while (removeLastDisc()) {}

        gameCells = [];
        while (c4.boardsizeWidth > gameCells.length) {
          gameCells.push( [] );
        }
        winner = false;
      },

      nextPlayer = function() {
        return gameCells.map(function(e){return e.length;}).reduce(function(m,e){return m+e;})  %  2  +  1;
      },
      lastPlayer = function() {
        return (1 + gameCells.map(function(e){return e.length;}).reduce(function(m,e){return m+e;}))  %  2  +  1;
      },

      checkWinner = function (column) {
        if(column === undefined){
          return false;
        }
        var color = gameCells[column][gameCells[column].length - 1];

        /* check vertically */
        var numberDiscs = gameCells[column].length,
            fourInColumn = gameCells[column].slice(numberDiscs - 4, numberDiscs),
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
        var row = gameCells[column].length - 1,
            horizontal, diagnalRight, diagnalLeft;
        horizontal = diagnalRight = diagnalLeft = 1;

        for (i = column - 1; i >= 0; i--) {

          if(gameCells[i][row] !== color) {
            break;
          }
          if(gameCells[i][row] === color){
            horizontal++;
          }
          if(horizontal >= 4){
            winner = true;
            return true;
          }
        }

        for (i = column + 1; i < c4.boardsizeWidth; i++) {
          if(gameCells[i][row] !== color){
            break;
          }
          if(gameCells[i][row] === color){
            horizontal++;
          }
          if(horizontal >= 4){
            winner = true;
            return true;
          }
        }

        /* check diagnal right */
        for (i = column + 1, j = numberDiscs; i < c4.boardsizeWidth && j < c4.boardsizeHeight; i++) {
          if(gameCells[i][j] !== color){
            break;
          }
          if(gameCells[i][j] === color){
            diagnalRight ++;
          }
          if(diagnalRight >= 4){
            winner = true;
            return true;
          }
          j++;
        }

        for (i = column - 1, j = numberDiscs - 2; i >= 0 && j >= 0; i--) {
          if(gameCells[i][j] !== color){
            break;
          }
          if(gameCells[i][j] === color){
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
          if(gameCells[i][j] !== color){
            break;
          }
          if(gameCells[i][j] === color){
            diagnalLeft ++;
          }
          if(diagnalLeft >= 4){
            winner = true;
            return true;
          }
          j++;
        }

        for (i = column + 1, j = numberDiscs - 2; i < c4.boardsizeWidth && j >= 0; i++) {
          if(gameCells[i][j] !== color){
            break;
          }
          if(gameCells[i][j] === color){
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


      // #####################################################################################
      // ### HTML methods ####################################################################
      // #####################################################################################
      board = function() {
        return boardArea.firstChild;
      },

      addDisc = function (left, bottom, selectedColumn) {
        var disc = document.createElement("div");
        listOfDiscs.push( [disc, selectedColumn] );

        var bottomLocation = (10 + CONFIG.CELL_SIZE * c4.boardsizeHeight);
        $(disc).css({left: left, bottom: bottomLocation, width: CONFIG.CELL_SIZE, height: CONFIG.CELL_SIZE, 'background-size': CONFIG.CELL_SIZE});
        board().appendChild( disc );

        disc.setAttribute( "class", CONFIG.PLAYER_CLASSES[nextPlayer()] );
        disc.setAttribute( "data-column", selectedColumn );

        /* called to allow CSS3 transitions for dynamically created dom element. */
        /*jshint -W030 */
        window.getComputedStyle(disc).bottom;
        disc.style.bottom = bottom + "px";
      },

      removeLastDisc = function () {
        var last    = listOfDiscs.pop();

        if (null == last) {
          return false;
        }

        var disc    = last[0];
        var column  = last[1];

        possibleNextDiscs.push( column );

        board().removeChild( disc );
        disc.remove();

        gameCells[column].pop();
        winner = false;

        return true;
      },

      addNextDisc = function () {
        column  = possibleNextDiscs.pop();
        tryingToDropDisc( column );
      },

      discDestination = function( selectedColumn ){
        if (null == selectedColumn  ||  ! Number.isInteger(selectedColumn)) {
          return null;
        }
        if (selectedColumn < 0  ||  c4.boardsizeWidth <= selectedColumn) {
          return null;
        }
        if (gameCells[selectedColumn].length >= c4.boardsizeHeight) {
          return null;
        }
        if (winner) {
          return null;
        }

        return {
          selectedColumn: selectedColumn,
          left: selectedColumn * CONFIG.CELL_SIZE,
          bottom: gameCells[selectedColumn].length * CONFIG.CELL_SIZE
        };
      },

      tryingToDropDisc = function( selectedColumn ) {
        destination = discDestination( selectedColumn );

        if (null == destination) {
          return null;
        }

        addDisc(destination.left, destination.bottom, destination.selectedColumn);
        gameCells[selectedColumn].push( CONFIG.PLAYER_COLORS[nextPlayer()] );

        if (checkWinner(destination.selectedColumn)){
          winner = lastPlayer();
        }
      },
      
      playerSelectsColumn = function( selectedColumn ) {
        if (discDestination( selectedColumn )) {
          possibleNextDiscs = [];
        }

        tryingToDropDisc( selectedColumn );
      };


  // initial setup:
  boardArea  = newBoardArea;
  reset();

  return {
    reset: reset,
    playerSelectsColumn: playerSelectsColumn,
    removeLastDisc: removeLastDisc,
    addNextDisc: addNextDisc,
  }
};



c4.util = (function ($, window, document) {
  var buttonRestart       = $('#buttonRestart'),
      buttonBack          = $('#buttonBack'),
      buttonForth         = $('#buttonForth'),
      buttonBoardsize76   = $('#buttonBoardsize76'),
      buttonBoardsize88   = $('#buttonBoardsize88'),
      buttonBoardsize99   = $('#buttonBoardsize99'),
      buttonBoardsizeAA   = $('#buttonBoardsizeAA'),

      boardAreas          = $('.boardArea'),

      externalMoveList    = [],
      lastBoardPlayed,


      // clean up everything
      resetBoardAreas = function() {
        boardAreas.each( function(index, boardArea) {
          boardArea.game.reset();

          while (boardArea.firstChild) {
            board = boardArea.firstChild;
            boardArea.removeChild( board );
            board.remove();
          }
        })
      },

      // clean up everything and create fresh HTML boards
      initializeBoards = function() {
        resetBoardAreas();

        var board = $('<div>', {class: "board"});
        board.css({width: CONFIG.CELL_SIZE * c4.boardsizeWidth, height: CONFIG.CELL_SIZE * c4.boardsizeHeight});

        var discs = [];
        for (var i = 0; i < c4.boardsizeWidth; i++) {
          for (var j = 0; j < c4.boardsizeHeight; j++) {
            var disc = $('<div>', {class: "boardPiece", "data-column": i});
            var left = i * CONFIG.CELL_SIZE;
            var bottom = j * CONFIG.CELL_SIZE;
            $(disc).css({left: left, bottom: bottom, width: CONFIG.CELL_SIZE, height: CONFIG.CELL_SIZE, 'background-size': CONFIG.CELL_SIZE});
            discs.push(disc);
          }
        }

        board.append(discs);
        boardAreas.append( board );
      },

      changeBoardSize = function( boardsize_width, boardsize_height ) {
        c4.boardsizeWidth = boardsize_width;
        c4.boardsizeHeight = boardsize_height;
        $('#headline_size').text( c4.boardsizeWidth + 'x' + c4.boardsizeHeight);

        initializeBoards();

        boardAreas.each(function (index, boardArea) {
          externalMoveList.forEach(function (column) {
            boardArea.game.playerSelectsColumn( column - 1 );
          })
        });
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

      parseMoveList = function( moveListString ) {
        console.log( '01: Move-List input: ' + moveListString );
        var moveListStringB4 = moveListString


        // Removing JijBent, BSN, YTMT specific naming conventions
        moveListString  = moveListString.replace('Play', 'k9');
        moveListString  = moveListString.replace('Speel', 'k9');
        moveListString  = moveListString.replace('Zieh', 'k9');

        // YTMT:
        moveListString  = moveListString.replace(/Move\s+list\s*/, '');
        moveListString  = moveListString.replace(/\(\s*<<\s+<\s+>\s+>>\s*\)\s*/, '');
        if (moveListStringB4.length != moveListString.length) {
          console.log('10: Removed JijBent specific naming: ' + moveListString);
        }


        // Brettspielnetz  move list
        // Example:
        //  5. 	d4 	d5 	 6. 	e4 	c2 3. 	e2 	a1 	 4. 	d3 	e3  1. 	d1 	d2 	 2. 	c1 	e1
        //  5. Zieh 3. d5 e1 4. b1 g1 1. d1 d2 2. d3 d4
        if (/^(?!1\.)\d+\.\s+([a-k])[1-9]0?\s+(?:([a-k])[1-9]0?\s+)?/.test(moveListString)) {
          console.log( '20: Matched Brettspielnetz (BSN)!' );

          // parse cells
          moveListString = moveListString.replace(/(?:\d+\.)?\s?([a-k])[1-9]0?\s([a-k])[1-9]0?\s*/g, '$1$2');
          console.log( '30: Parsed stones of move-list: ' + moveListString );

          // remove noise
          moveListString = moveListString.replace( /[^a-j]/g, '' );
          console.log( '40: Removed noise: ' + moveListString );

          // sort (BSN has weird sorting)
          moveListSorted = '';
          while (4 < moveListString.length) {
            moveListSorted += moveListString.substring( moveListString.length-4 );
            moveListString  = moveListString.substring( 0, moveListString.length-4 )
          }
          moveListSorted  += moveListString;
          console.log( '50: Fixed BSN order: ' + moveListSorted );

          // identify column numbers
          return moveListSorted.split('').map(function(str) {return str.charCodeAt(0) - 96;});
        }
        
        // YourTurnMyTurn / JijBent move list
        // Example:
        // 1. d1 d2 2. e1 f1 3. e2 e3 4. e4 c1 5. d3 d4 6. d5 f2 7. g1 c2 8. c3 g2 9. e5 d6 10. e6 e7
        if (/\d+\.\s([a-k])[1-9]0?\s([a-k])[1-9]0?\s+/.test(moveListString)) {
          console.log( '20: Matched JijBent (Jij) or YourTurnMyTurn (YTMT)!' );

          // parse cells
          moveListString = moveListString.replace(/(?:\d+\.)?\s?([a-k])[1-9]0?\s([a-k])[1-9]0?\s*/g, '$1$2');
          console.log( '30: Parsed stones of move-list: ' + moveListString );

          // remove noise
          moveListString = moveListString.replace( /[^a-j]/g, '' );
          console.log( '40: Removed noise: ' + moveListString );

          // identify column numbers
          return moveListString.split('').map(function(str) {return str.charCodeAt(0) - 96;});
        }

        // LittleGolem move list
        // Example:
        // 1.5 2.5 3.5 4.5 5.5 6.5 7.6 8.7 9.3
        if (/\d+\.(\d+)\s*/.test(moveListString)) {
          console.log( '20: Matched LittleGolem (LG)!' );

          // parse columns
          moveListString = moveListString.replace(/\d+\.(\d+)\s*/g, '$1 ')
          console.log( '30: Parsed stones of move-list: ' + moveListString );

          return moveListString.trim().split(' ').map(function(str) {return parseInt(str);});
        }

        // Manual input
        // Example:
        // 444445251333313
        console.log( '20: Matched Manual Input!' );
        return moveListString.trim().split('').map(function(str) {return parseInt(str);});
      },

      init = function (getParams) {
        boardAreas.each( function(index, boardArea) {
          boardArea.game  = new C4Game( boardArea );
        } );


        var param_moves = '';
        if ( ! getParams['moves']
          && 1 == Object.keys(getParams).length
          && '' == getParams[Object.keys(getParams)[0]]
          && 10 < Object.keys(getParams)[0].length
           ) {
          param_moves = Object.keys(getParams)[0];
        } else {
          param_moves = getParams['moves'];
        }

        if (param_moves  &&  1 < param_moves.length) {
          externalMoveList = parseMoveList(decodeURIComponent(param_moves.trim()));
          console.log( '80: Identified move-list: ' + externalMoveList );

          if ( param_moves != externalMoveList.join('')
            && (! getParams['r']  ||  ! parseInt(getParams['r']))
             ) {
            newUrl  = window.location.href;
            console.log( '90: Starting redirection from: ' + newUrl );

            // remove redirect parameter
            newUrl  = newUrl.replace( /([?&])r=.*?(&|$)/, '$1' );
            console.log( '92: Removed redirect parameter: ' + newUrl );

            // remove moves parameter
            newUrl  = newUrl.replace( 'moves=', '' );
            console.log( '94: Removed moves parameter: ' + newUrl );

            // shorten move-list to readable length  AND  add redirect parameter
            newUrl  = newUrl.replace( param_moves + '=', '&r=1&moves=' + externalMoveList.join('') );
            newUrl  = newUrl.replace( param_moves, '&r=1&moves=' + externalMoveList.join('') );
            console.log( '96: Replaced raw move-list: ' + newUrl );

            // remove moves parameter
            newUrl  = newUrl.replace( /\?&+/, '?' );
            console.log( '98: Removed double dividors: ' + newUrl );

            // redirect the user
            console.log( 'Redirecting to ' + newUrl );
            window.location.href  = newUrl;
          }
        }

        changeBoardSize( CONFIG.BOARDSIZE_WIDTH, CONFIG.BOARDSIZE_HEIGHT );

        $(document).keydown(function(e){
          if (! lastBoardPlayed) { return; }

          // backspace
          if (8 == e.which) {
            lastBoardPlayed.game.removeLastDisc();
          }
          // left
          if (37 == e.which) {
            lastBoardPlayed.game.removeLastDisc();
          }
          //right
          if (39 == e.which) {
            lastBoardPlayed.game.addNextDisc();
          }
        });

        $(document).keypress(function(e){
          if (! lastBoardPlayed) { return; }

          if (48 == e.which) {
            lastBoardPlayed.game.playerSelectsColumn( 9 );
          }
          if (45 == e.which) {
            lastBoardPlayed.game.playerSelectsColumn( 10 );
          }
          if (49 <= e.which  && e.which <= 57) {
            lastBoardPlayed.game.playerSelectsColumn( e.which - 49 );
          }
        });

        boardAreas.on('click', function (e) {
          var selectedColumn = selectedColumnMouse(e);
          $(this).get(0).game.playerSelectsColumn( selectedColumn );

          lastBoardPlayed = $(this).get(0);
        });

        buttonRestart.on('click', function () {
          lastBoardPlayed.game.reset();
        });
        buttonBack.on('click', function () {
          lastBoardPlayed.game.removeLastDisc();
        });
        buttonForth.on('click', function () {
          lastBoardPlayed.game.addNextDisc();
        });
        buttonBoardsize76.on('click', function () {
          changeBoardSize(7, 6);
        });
        buttonBoardsize88.on('click', function () {
          changeBoardSize(8, 8);
        });
        buttonBoardsize99.on('click', function () {
          changeBoardSize(9, 9);
        });
        buttonBoardsizeAA.on('click', function () {
          changeBoardSize(10, 10);
        });
      };

  return {
    init: init,
  };

}) (window.jQuery, window, document);


