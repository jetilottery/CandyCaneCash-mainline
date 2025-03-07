define(function(require) {

    var msgBus = require('skbJet/component/gameMsgBus/GameMsgBus');
    var displayList = require('skbJet/componentManchester/standardIW/displayList');
    var orientation = require('skbJet/componentManchester/standardIW/orientation');
    const audio = require('skbJet/componentManchester/standardIW/audio');

    var columns = [
        [1],
        [1, 1],
        [1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1, 1]
    ];

    //let currentColumn;
    var columnToAnimate = null;

    function init() {
        //console.log("MULTIPLIER INITIALIZATION...");
    }

    function addMultiplier(position) {
        // Add multiplier and check if the columns are filled with multipliers.
        if (position > 9) {
            columns[4].shift();

            if (columns[4].length === 0) {
                multiplierFilled(5);
            }
        } else if (position > 5) {
            columns[3].shift();

            if (columns[3].length === 0) {
                multiplierFilled(4);
            }
        } else if (position > 2) {
            columns[2].shift();

            if (columns[2].length === 0) {
                multiplierFilled(3);
            }
        } else if (position > 0) {
            columns[1].shift();

            if (columns[1].length === 0) {
                multiplierFilled(2);
            }
        } else {
            columns[0].shift();

            if (columns[0].length === 0) {
                multiplierFilled(1);
            }
        }

    }

    function reset() {

        //console.log("RESET MULTIPLIER ANIMATION BAR");
        //console.log(currentColumn);

        for (let i = 1; i < 6; i++) {

            displayList['multiplier' + i].visible = false;
            displayList['multiplier' + i + "Static"].visible = true;

        }

        columns = [
            [1],
            [1, 1],
            [1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1, 1]
        ];
    }

    function multiplierFilled(column) {

        console.log("ANIMATE COLUMN FULFILLED WITH RED CHILIS!");

        audio.play('revealMultiplierColumn');

        //let currentColumn = column;
        columnToAnimate = displayList['multiplier' + column];

        //add the mask, only for portrait
        if (orientation.get() === orientation.PORTRAIT) {
            var mask = displayList['multiplier' + column + "Mask"];
            columnToAnimate.mask = mask;
        }

        var staticMultiplerToHide = displayList['multiplier' + column + "Static"];
        columnToAnimate.visible = true;
        staticMultiplerToHide.visible = false;
        msgBus.publish('animation.play', {
            index: "multiplier" + column,
            anim: "Land_X" + column + "_intro",
            delay: 0,
            loop: false
        });
        msgBus.publish('animation.add', {
            index: "multiplier" + column,
            anim: "Land_X" + column + "_loop",
            delay: 0.9,
            loop: 1
        });
        msgBus.publish('animation.add', {
            index: "multiplier" + column,
            anim: "Land_X" + column + "_static",
            delay: 1.9,
            loop: true
        });
        msgBus.publish('game.pickPoint', {
            value: column
        });

        //update and multiply the prize * multiplier value when a row is filled.
        msgBus.publish('game.gameArea.updatePrize', {
            value: column
        });



    }

    msgBus.subscribe('game.multiplierMeter.reset', reset);


    return {
        init: init,
        addMultiplier: addMultiplier,
        reset: reset,
        multiplierFilled: multiplierFilled
    };
});