var connectFour = {};

connectFour.game = (function() {
    'use strict';

    var board = [],
    columns = 7,
    rows = 6,
    winner = false,
    player = "red",

    clearBoard = function(){

        board.length = 0;
        winner = false;
        player = "red";
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

        if(column >= 7 || column < 0 || board[column].length >= rows){
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

        this.player = this.player === "red" ? "yellow" : "red";
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
        board: board
    };

}) ();

connectFour.util = (function ($, window, document) {

    var i, j,
    player1 = $('#player1'),
    player2 = $('#player2'),
    newGameButton = $('#newGame'),
    winner = $('#winner'),
    winnerName = $('#winnerName'),

    initializeBoard = function (board) {

        var discs = [];
        for (i = 0; i < 7; i++) {
            for (j = 0; j < 6; j++) {
                var disc = $('<div>', {class: "emptyDisc",
                    "data-column": i
                });
                var left = i * 60 + 5;
                var bottom = j * 60 + 5;
                $(disc).css({left: left, bottom: bottom});
                discs.push(disc);
            }
        }
        board.append(discs);
        connectFour.game.clearBoard();
    },

    addDisc = function (board, left, bottom, selectedColumn) {

        var disc = document.createElement("div");
        disc.style.left = left + "px";
        disc.style.bottom = "370px";
        board.get(0).appendChild(disc);

        disc.setAttribute("class", connectFour.game.player==="red"? "redDisc" : "yellowDisc");
        disc.setAttribute("data-column", selectedColumn);

        /* called to allow CSS3 transitions for dynamically created dom element. */
        /*jshint -W030 */
        window.getComputedStyle(disc).bottom;
        disc.style.bottom = bottom + "px";
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

        winnerName.text(connectFour.game.player === "red" ? "Player one" : "Player two");
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

    discDestination = function(e){

        var selectedColumn;

        if(e.target === this) {
            selectedColumn = Math.floor(e.offsetX / 60);
        }
        else {
            selectedColumn = $(e.target).data('column');
        }
        return {
            selectedColumn: selectedColumn,
            left: selectedColumn * 60 + 5,
            bottom: connectFour.game.board[selectedColumn].length * 60 + 5
        };
    },

    init = function (board) {

        initializeBoard(board);

        board.on('click', function (e) {

            var destination = discDestination(e);

            if(connectFour.game.winner) {
                return;
            }

            if(connectFour.game.dropDisc(destination.selectedColumn, connectFour.game.player)) {
                addDisc(board, destination.left, destination.bottom, destination.selectedColumn);
                if(connectFour.game.winningMove(destination.selectedColumn, connectFour.game.player)){
                    announceWinner();
                    return;
                }
                togglePlayer();
            }

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
    };

}) (window.jQuery, window, document);