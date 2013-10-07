describe('connectFour.game', function () {
    beforeEach(function(){
        connectFour.game.clearBoard();
    });

    describe('.clearBoard()', function(){
        it('should set the board to an array of seven empty arrays', function(){
            connectFour.game.clearBoard();
            expect(connectFour.game.board.length).to.be(7);
        });
    });

    describe('.dropDisc(column, color)', function(){
        it('should return false when dropping into non-existent columns to the left', function(){
            var result = connectFour.game.dropDisc(-1, "red");
            expect(result).to.be(false);
        });

        it('should return false when dropping into non-existent columns to the right', function(){
            var result = connectFour.game.dropDisc(7, "red");
            expect(result).to.be(false);
        });

        it('should return false when dropping into full columns', function(){
            for (var i = 0; i < 6; i++) {
                connectFour.game.dropDisc(3, "red");
            }
            var result = connectFour.game.dropDisc(3, "red");
            expect(result).to.be(false);
        });

        it('should return true when disc successfully dropped into column', function(){
            var result = connectFour.game.dropDisc(3, "red");
            expect(result).to.be(true);
        });

        it('should set the correct disc color when successfully dropped into column', function(){
            connectFour.game.dropDisc(3, "red");
            expect(connectFour.game.board[3][0]).to.be("red");
        });
    });

    describe('.winningMove(column, color)', function() {
        it('should return true when four discs of same color align horizontal', function(){
            for (var i = 2; i < 6; i++) {
                connectFour.game.dropDisc(i,"red");
            }
            var result = connectFour.game.winningMove(i-1, "red");
            expect(result).to.be(true);
        });

        it('should return false when three discs of same color align horizontal', function(){
             for (var i = 0; i < 2; i++) {
                connectFour.game.dropDisc(i,"red");
            }
            var result = connectFour.game.winningMove(i-1, "red");
            expect(result).to.be(false);
        });

        it('should return true when four discs of the same color align vertically', function(){
            for (var i = 0; i < 4; i++) {
                connectFour.game.dropDisc(2,"red");
            }
            var result = connectFour.game.winningMove(2, "red");
            expect(result).to.be(true);
        });

        it('should return false when two discs of the same color align vertically', function(){
            for (var i = 0; i < 2; i++) {
                connectFour.game.dropDisc(2,"red");
            }
            var result = connectFour.game.winningMove(2, "red");
            expect(result).to.be(false);
        });

        it('should return true when four discs of the same color align diagonally right', function(){
            connectFour.game.dropDisc(1, "yellow");
            connectFour.game.dropDisc(2, "yellow");
            connectFour.game.dropDisc(2, "yellow");
            connectFour.game.dropDisc(3, "yellow");
            connectFour.game.dropDisc(3, "yellow");
            connectFour.game.dropDisc(3, "yellow");
            for (var i = 0; i < 4; i++) {
                connectFour.game.dropDisc(i,"red");
            }
            var result = connectFour.game.winningMove(i-1, "red");
            expect(result).to.be(true);
        });

        it('should return false when three discs of the same color align diagonally right', function(){
            connectFour.game.dropDisc(1, "yellow");
            connectFour.game.dropDisc(2, "yellow");
            connectFour.game.dropDisc(2, "yellow");
            connectFour.game.dropDisc(3, "yellow");
            connectFour.game.dropDisc(3, "yellow");
            for (var i = 0; i < 4; i++) {
                connectFour.game.dropDisc(i,"red");
            }
            var result = connectFour.game.winningMove(i-1, "red");
            expect(result).to.be(false);
        });

        it('should return true when four discs of the same color align diagonally left', function(){
            connectFour.game.dropDisc(0, "yellow");
            connectFour.game.dropDisc(0, "yellow");
            connectFour.game.dropDisc(0, "yellow");
            connectFour.game.dropDisc(1, "yellow");
            connectFour.game.dropDisc(1, "yellow");
            connectFour.game.dropDisc(2, "yellow");
            for (var i = 0; i < 4; i++) {
                connectFour.game.dropDisc(i,"red");
            }
            var result = connectFour.game.winningMove(i-1, "red");
            expect(result).to.be(true);
        });

        it('should return false when two discs of the same color align diagonally right', function(){
            connectFour.game.dropDisc(0, "yellow");
            connectFour.game.dropDisc(0, "yellow");
            connectFour.game.dropDisc(0, "yellow");
            connectFour.game.dropDisc(1, "yellow");
            connectFour.game.dropDisc(1, "yellow");
            for (var i = 0; i < 4; i++) {
                connectFour.game.dropDisc(i,"red");
            }
            var result = connectFour.game.winningMove(i-1, "red");
            expect(result).to.be(false);
        });
    });


    describe('.togglePlayer()',function () {
        it('should change the current player from red to yellow', function(){
            connectFour.game.togglePlayer();
            expect(connectFour.game.player).to.be("yellow");
        });

        it('should change the current player from yellow to red', function(){
            connectFour.game.togglePlayer();
            expect(connectFour.game.player).to.be("red");
        });
    });

    describe('.fullBoard()',function () {
        it('should return true when board is full of discs', function(){
            for(var i = 0; i < 7; i++){
                for (var j = 0; j < 6; j++) {
                    connectFour.game.dropDisc(i, "red");
                }
            }
            expect(connectFour.game.fullBoard()).to.be(true);
        });

        it('should return false when board is not full of discs', function(){
            expect(connectFour.game.fullBoard()).to.be(false);
        });
    });
});
