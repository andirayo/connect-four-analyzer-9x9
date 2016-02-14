var CONFIG = {
  NUMBER_OF_BOARDS:          8,

  BOARDSIZE_WIDTH_DEFAULT:   9,
  BOARDSIZE_HEIGHT_DEFAULT:  9,
  CELL_SIZE_PIXELS_DEFAULT: 34,

  PLAYER_COLORS: {
    1: 'yellow',
    2: 'red',
  },
  PLAYER_CLASSES: {
    1: 'yellowDisc',
    2: 'redDisc',
  },
};

var c4 = { boardsizeWidth: CONFIG.BOARDSIZE_WIDTH_DEFAULT, boardsizeHeight: CONFIG.BOARDSIZE_HEIGHT_DEFAULT };

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
            horizontal, diagonalRight, diagonalLeft;
        horizontal = diagonalRight = diagonalLeft = 1;

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

        /* check diagonal right */
        for (i = column + 1, j = numberDiscs; i < c4.boardsizeWidth && j < c4.boardsizeHeight; i++) {
          if(gameCells[i][j] !== color){
            break;
          }
          if(gameCells[i][j] === color){
            diagonalRight ++;
          }
          if(diagonalRight >= 4){
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
            diagonalRight ++;
          }
          if(diagonalRight >= 4){
            winner = true;
            return true;
          }
          j--;
        }

        /* check diagonal left */
        for (i = column - 1, j = numberDiscs; i >= 0 && j < c4.boardsizeHeight; i--) {
          if(gameCells[i][j] !== color){
            break;
          }
          if(gameCells[i][j] === color){
            diagonalLeft ++;
          }
          if(diagonalLeft >= 4){
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
            diagonalLeft ++;
          }
          if(diagonalLeft >= 4){
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

        var bottomLocation = (10 + CONFIG.CELL_SIZE_PIXELS_DEFAULT * c4.boardsizeHeight);
        $(disc).css({left: left, bottom: bottomLocation, width: CONFIG.CELL_SIZE_PIXELS_DEFAULT, height: CONFIG.CELL_SIZE_PIXELS_DEFAULT, 'background-size': CONFIG.CELL_SIZE_PIXELS_DEFAULT});
        board().appendChild( disc );

        disc.setAttribute( "class", CONFIG.PLAYER_CLASSES[nextPlayer()] );
        disc.setAttribute( "data-column", selectedColumn );
        $(disc).on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(e) {
          $(this).css('z-index', 3);
          $(this).off(e);
        });


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
          left: selectedColumn * CONFIG.CELL_SIZE_PIXELS_DEFAULT,
          bottom: gameCells[selectedColumn].length * CONFIG.CELL_SIZE_PIXELS_DEFAULT
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
  var buttonBoardsize76   = $('#buttonBoardsize76'),
      buttonBoardsize88   = $('#buttonBoardsize88'),
      buttonBoardsize99   = $('#buttonBoardsize99'),
      buttonBoardsizeAA   = $('#buttonBoardsizeAA'),
      buttonSendMovelist  = $('#buttonSendMovelist'),

      boardAreas          = $('.boardArea'),

      externalMoveList    = [],
      lastBoardPlayed,
      getParams,


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
        board.css({width: CONFIG.CELL_SIZE_PIXELS_DEFAULT * c4.boardsizeWidth, height: CONFIG.CELL_SIZE_PIXELS_DEFAULT * c4.boardsizeHeight});

        var discs = [];
        for (var i = 0; i < c4.boardsizeWidth; i++) {
          for (var j = 0; j < c4.boardsizeHeight; j++) {
            var disc = $('<div>', {class: "boardPiece", "data-column": i});
            var left = i * CONFIG.CELL_SIZE_PIXELS_DEFAULT;
            var bottom = j * CONFIG.CELL_SIZE_PIXELS_DEFAULT;
            $(disc).css({left: left, bottom: bottom, width: CONFIG.CELL_SIZE_PIXELS_DEFAULT, height: CONFIG.CELL_SIZE_PIXELS_DEFAULT, 'background-size': CONFIG.CELL_SIZE_PIXELS_DEFAULT});
            discs.push(disc);
          }
        }

        board.append(discs);
        boardAreas.append( board );
      },

      changeBoardSize = function( boardsize_width, boardsize_height ) {
        c4.boardsizeWidth = boardsize_width;
        c4.boardsizeHeight = boardsize_height;
        $('#headline_boardsize').text( c4.boardsizeWidth + 'x' + c4.boardsizeHeight);

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
          selectedColumn = Math.floor(e.offsetX / CONFIG.CELL_SIZE_PIXELS_DEFAULT);
        }
        else {
          selectedColumn = $(e.target).data('column');
        }
        return selectedColumn;
      },

      parseMoveList = function( moveListString ) {
        var moveListStringB4;
        console.log( '01: Move-List input: ' + moveListString );


        // Whitespaces (added since textarea input is possible):
        moveListStringB4 = moveListString;
        moveListString  = moveListString.replace(/\s+/g, ' ');
        if (moveListStringB4.length != moveListString.length) {
          console.log('10: Consolidated white-spaces: ' + moveListString);
        }


        // Removing JijBent, BSN, YTMT specific naming conventions
        moveListStringB4 = moveListString
        moveListString  = moveListString.replace('Play',  'k0');
        moveListString  = moveListString.replace('Speel', 'k0');
        moveListString  = moveListString.replace('Zieh',  'k0');
        // Removing LG specific result conventions
        moveListString  = moveListString.replace('resign', '0');
        moveListString  = moveListString.replace('aufg.',  '0');
        moveListString  = moveListString.replace('draw',   '0');
        if (moveListStringB4.length != moveListString.length) {
          console.log('20: Removed JijBent/LG specific naming: ' + moveListString);
        }

        // LG, YTMT, BSN:
        // Example (BSN):  Zugliste    <<    <     >    >>
        // Example (LG):   Move List  TXT
        moveListStringB4 = moveListString
        moveListString  = moveListString.replace(/Move\s*list(\s+TXT)?\s*/i, '');
        moveListString  = moveListString.replace('Zugliste', '');
        moveListString  = moveListString.replace(/\(?\s*<<\s+<\s+>\s+>>\s*\)?\s*/, '');
        if (moveListStringB4.length != moveListString.length) {
          console.log('22: Removed move list header: ' + moveListString);
        }



        // Brettspielnetz  move list
        // Example:
        //  5. 	d4 	d5 	 6. 	e4 	c2 3. 	e2 	a1 	 4. 	d3 	e3  1. 	d1 	d2 	 2. 	c1 	e1
        //  5. Zieh 3. d5 e1 4. b1 g1 1. d1 d2 2. d3 d4
        if (/^(?!1\.)\d+\.\s+([a-k])1?[0-9](\s+?:([a-k])1?[0-9])?\s+/.test(moveListString)) {
          console.log( '30: Matched Brettspielnetz (BSN)!' );

          // parse cells
          moveListString = moveListString.replace(/(?:\d+\.)?\s?([a-k])1?[0-9](?:\s+([a-k])1?[0-9])?\s*/g, '$1$2');
          console.log( '40: Parsed stones of move-list: ' + moveListString );

          // remove noise
          moveListString = moveListString.replace( /[^a-j]/g, '' );
          console.log( '50: Removed noise: ' + moveListString );

          // sort (BSN has weird sorting)
          moveListSorted = '';
          while (4 < moveListString.length) {
            moveListSorted += moveListString.substring( moveListString.length-4 );
            moveListString  = moveListString.substring( 0, moveListString.length-4 )
          }
          moveListSorted  += moveListString;
          console.log( '60: Fixed BSN order: ' + moveListSorted );

          // identify column numbers
          return moveListSorted.split('').map(function(str) {return str.charCodeAt(0) - 96;});
        }
        
        // YourTurnMyTurn / JijBent move list
        // Example:
        // 1. d1 d2 2. e1 f1 3. e2 e3 4. e4 c1 5. d3 d4 6. d5 f2 7. g1 c2 8. c3 g2 9. e5 d6 10. e6 e7
        if (/\d+\.\s([a-k])1?[0-9]\s([a-k])1?[0-9]\s+/.test(moveListString)) {
          console.log( '30: Matched JijBent (Jij) or YourTurnMyTurn (YTMT)!' );

          // parse cells
          moveListString = moveListString.replace(/(?:\d+\.)?\s?([a-k])1?[1-9](?:\s+([a-k])1?[0-9])?\s*/g, '$1$2');
          console.log( '40: Parsed stones of move-list: ' + moveListString );

          // remove noise
          moveListString = moveListString.replace( /[^a-j]/g, '' );
          console.log( '50: Removed noise: ' + moveListString );

          // identify column numbers
          return moveListString.split('').map(function(str) {return str.charCodeAt(0) - 96;});
        }

        // LittleGolem move list
        // Example:
        // 1.5 2.5 3.5 4.5 5.5 6.5 7.6 8.7 9.3
        if (/\d+\.(\d+)\s*/.test(moveListString)) {
          console.log( '30: Matched LittleGolem (LG)!' );

          // parse columns
          moveListString = moveListString.replace(/\d+\.(\d+)\s*/g, '$1 ')
          console.log( '40: Parsed stones of move-list: ' + moveListString );

          // remove noise
          moveListString = moveListString.replace( / [^1-9]\d*/g, '' );
          console.log( '50: Removed noise: ' + moveListString );

          return moveListString.trim().split(' ').map(function(str) {return parseInt(str);});
        }

        // Manual input in form of letter+number (column+row) list:
        // Example:
        // g1, e1, e2, e3, e4, g2, e5, d1, e6, e7, c1, d2, d3, c2, c3
        if (/(([a-k])1?[0-9],\s*){5,}/.test(moveListString)) {
          console.log( '30: Matched Manual input: letter+number list!' );

          // parse columns
          moveListString = (moveListString + ',').replace(/([a-k])1?[0-9],\s*/g, '$1')
          console.log( '40: Parsed stones of move-list: ' + moveListString );

          // remove noise
          moveListString = moveListString.replace( /[^a-j]/g, '' );
          console.log( '50: Removed noise: ' + moveListString );

          // identify column numbers
          return moveListString.split('').map(function(str) {return str.charCodeAt(0) - 96;});
        }

        // Manual input
        // Example:
        // 444445251333313
        console.log( '30: Matched Manual Input!' );
        return moveListString.trim().split('').map(function(str) {return parseInt(str);});
      },

      parse_movelist_and_redirect = function( paramMoves, forceRedirect ) {
        externalMoveList = parseMoveList(decodeURIComponent(paramMoves.trim()));
        console.log( '80: Identified move-list: ' + externalMoveList );

        if ( forceRedirect
            ||  ( paramMoves != externalMoveList.join('')
               && (! getParams['r']  ||  ! parseInt(getParams['r']))
            )
           ) {
          newUrl  = window.location.href;
          console.log( '90: Starting redirection from: ' + newUrl );

          // remove redirect/reload parameter
          newUrl  = newUrl.replace( /([?&])r=[^&]*/, '$1' );
          console.log( '91: Removed redirect/reload parameter "r": ' + newUrl );

          // remove moves parameter
          newUrl  = newUrl.replace( /([?&])moves=[^&]*/, '$1' );
          console.log( '92: Removed moves parameter: ' + newUrl );

          // remove size parameter
          newUrl  = newUrl.replace( /([?&])size=[^&]*/, '$1' );
          console.log( '93: Removed size parameter: ' + newUrl );

          // removing old move-list (this should be covered by removing the moves-parameter, but because we allow erroneous input, this is done to make sure
          newUrl  = newUrl.replace( paramMoves + '=', '' );
          newUrl  = newUrl.replace( paramMoves, '' );
          console.log( '95: Removed old (raw) move-list: ' + newUrl );

          // adding new short move-list  AND  add redirect parameter
          newUrl  = newUrl.replace( /\?|$/, '?r=1&size=' + c4.boardsizeWidth + 'x' + c4.boardsizeHeight + '&moves=' + externalMoveList.join('') + '&' );
          console.log( '97: Added new (parsed) move-list: ' + newUrl );

          // remove moves parameter
          newUrl  = newUrl.replace( /\?&+/, '?' );
          newUrl  = newUrl.replace( /&+/g, '&' );
          console.log( '99: Removed double dividers: ' + newUrl );

          // redirect the user
          console.log( 'Redirecting to ' + newUrl );
          window.location.href  = newUrl;
        }
      },

      dealWithGetParameters = function( getParameters ) {
        getParams = getParameters;
        boardAreas.each( function(index, boardArea) {
          boardArea.game  = new C4Game( boardArea );
        } );


        var paramMoves = '';
        if ( ! getParams['moves']
            && 1 == Object.keys(getParams).length
            && (! getParams[Object.keys(getParams)[0]] || '' == getParams[Object.keys(getParams)[0]])
            && 10 < Object.keys(getParams)[0].length
        ) {
          paramMoves = Object.keys(getParams)[0];
        } else {
          paramMoves = getParams['moves'];
        }

        if (paramMoves  &&  1 < paramMoves.length) {
          parse_movelist_and_redirect( paramMoves, false );
        }


        // allowing to set board-size via Get-parameter
        if (getParams['size']) {
          var boardSize = getParams['size'].split('x').map(function(str) {return parseInt(str);});

          if (2 == boardSize.length) {
            c4.boardsizeWidth   = boardSize[0];
            c4.boardsizeHeight  = boardSize[1];
          }
        }
      },

      init = function( getParameters ) {
        for (var i = 1; Math.pow(2,i) <= CONFIG.NUMBER_OF_BOARDS; i++) {
          $( ".gameAnalyzer").clone().appendTo( ".gameAnalyzers" );
        }
        boardAreas          = $('.boardArea');

        dealWithGetParameters( getParameters );

        changeBoardSize( c4.boardsizeWidth, c4.boardsizeHeight );


        // ==================================================================
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


        // ==================================================================
        boardAreas.on('click', function (e) {
          var selectedColumn = selectedColumnMouse(e);
          $(this).get(0).game.playerSelectsColumn( selectedColumn );

          lastBoardPlayed = $(this).get(0);
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
        buttonSendMovelist.on('click', function () {
          parse_movelist_and_redirect( $('#textMovelist').val(), true );
        });

        $( ".gameAnalyzer").each(function (index, gameAnalyzer) {
          $(gameAnalyzer).find('.buttonRestart').on('click', function () {
            lastBoardPlayed = $(gameAnalyzer).find('.boardArea').get(0);
            lastBoardPlayed.game.reset();
          });
          $(gameAnalyzer).find('.buttonBack').on('click', function () {
            lastBoardPlayed = $(gameAnalyzer).find('.boardArea').get(0);
            lastBoardPlayed.game.removeLastDisc();
          });
          $(gameAnalyzer).find('.buttonForth').on('click', function () {
            lastBoardPlayed = $(gameAnalyzer).find('.boardArea').get(0);
            lastBoardPlayed.game.addNextDisc();
          });
        });
      };

  return {
    init: init,
  };

}) (window.jQuery, window, document);


