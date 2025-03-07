define(require => {
    const prizeData = require('skbJet/componentManchester/standardIW/prizeData');

    return function scenarioTransform(scenarioString) {


        //console.log("OLD SCENARIO --> " + scenarioString);

        //----------------------------------------------------------------------------------
        // split the string into the three components; winning, instant and player numbers
        //----------------------------------------------------------------------------------

        //----------------------------------------------------------------------------------
        // FAKE SCENARIOS IN ORDER TO TEST QUICKLY SCENARIOS
        //----------------------------------------------------------------------------------
        //NON WINNING SCENARIO
        //scenarioString = "5M|6H,4C|8K,3N,5K|2M,7D,1O,4G|5L,3E,4O,8B,2A|";

        // WINNING SCENARIO WITHOUT BONUS
        //scenarioString = "0A|2N,2M|8L,5J,6G|4D,5F,8E,1O|1N,2G,3B,5I,7M|";

        //WINNING SCENARIO WITH BONUS
        //scenarioString = "7B|1N,0M|6O,5K,9|3M,2O,7N,0I|2H,8E,0C,8J,4A|WW454W14XZYW";

        //WINNING SCENARIO WITH BONUS
        //scenarioString = "6A|0G,0C|3N,0M,4E|9,1B,0D,2E|4O,5L,8F,2F,7J|Y1X211YZ12WYY";

        //No bonus example (crashing cause of the prizeTable and multiplier stuff)
        //scenarioString = "8F|0C,0E|0I,0I,0L|5O,3M,1A,0J|4N,6K,2B,5G,7L|";

        //----------------------------------------------------------------------------------

        console.log("REAL SCENARIO --> " + scenarioString);


        // Split the scenario string
        const scenarioSplit = scenarioString.split("|");

        // For the bonus outcome, grab the last element from scenarioSplit
        // This will simply return an array of length 0 if there is no bonus outcome
        const bonusData = scenarioSplit.pop().split("");

        // Create array for main game
        const mainGame = [];

        // Run through the remaining scenarioSplit array
        scenarioSplit.forEach((str) => {
            // Create empty array
            const newArr = [];
            // Turn this string into an array
            const tempArr = str.split(',');

            // Run through this array, convert each element into its own array
            // That way we can convert the letter to an actual prize amount
            tempArr.forEach((element) => {
                const newArr2 = [];
                const [symbol, prize] = element.split("");
                newArr2.push(symbol);
                if (prize) {
                    //console.log("PRIZEDATA--->", prizeData.prizeTable[prize]);
                    newArr2.push(prizeData.prizeTable[prize]); // This will return undefined if this prize is not in the prize table
                } // else {
                //  newArr2.push("5000");
                //}

                newArr.push(newArr2);
            });

            // Push into main game array
            mainGame.push(newArr);
        });

        console.log("REAL MAIN GAME --> " + mainGame);
        console.log("REAL BONUS DATA (SPLITTED)) --> " + bonusData);

        if (bonusData.length > 0) {
            console.log("GAME HAS A BONUS? --> TRUE || -->" + bonusData.length);
        } else {
            console.log("GAME HAS A BONUS? --> FALSE || -- >" + bonusData.length);
        }


        return {
            mainGame,
            bonusData
        };
    };
});