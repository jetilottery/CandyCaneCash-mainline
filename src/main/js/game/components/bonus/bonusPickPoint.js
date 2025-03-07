define(require => {
    const PIXI = require('com/pixijs/pixi');
    const Pressable = require('skbJet/componentManchester/standardIW/components/pressable');
    const autoPlay = require('skbJet/componentManchester/standardIW/autoPlay');
    //const SKBeInstant = require('skbJet/component/SKBeInstant/SKBeInstant');
    //const textStyles = require('skbJet/componentManchester/standardIW/textStyles');
    const msgBus = require('skbJet/component/gameMsgBus/GameMsgBus');
    const displayList = require('skbJet/componentManchester/standardIW/displayList');
    const audio = require('skbJet/componentManchester/standardIW/audio');
    const bonusMeter = require('game/components/bonus/bonusMeter');

    //const orientation = require('skbJet/componentManchester/standardIW/orientation');
    //const multiplierMeter = require('game/components/multiplierMeter');


    require('com/gsap/TweenLite');
    require('com/gsap/easing/EasePack');

    const Tween = window.TweenLite;

    const spineAnimationsArray = {
        0: 'Peppers/RedPepper_',
        1: 'Peppers/OrangePepper_',
        2: 'Peppers/YellowPepper_',
        3: 'Peppers/GreenPepper_',
    };

    const spineMultipliersAnimationsArray = {
        0: 'Multipliers/X1_',
        1: 'Multipliers/X2_',
        2: 'Multipliers/X3_',
        3: 'Multipliers/X4_',
        4: 'Multipliers/X5_',
    };

    class BonusPickPoint extends Pressable {
        constructor(parent, reveal, spine) {
            super();

            this.spineBonus = spine;
            this.revealSpineBonus = reveal;
            this.id = this;

            //console.log("bonusPoint --> " + this.id);

            this.spineBonus.interactive = false;
            this.spineBonus.interactiveChildren = false;

            this.revealSpineBonus.interactive = false;
            this.revealSpineBonus.interactiveChildren = false;

            this.spineLayerBonus = displayList.bonusArraySpineLayer;

            // Create all the empty sprites
            this.symbolAnim = new PIXI.extras.AnimatedSprite([PIXI.Texture.EMPTY]);
            this.symbolAnim.loop = false;
            this.symbolAnim.visible = false;

            //this.prizeValue = new PIXI.Text('');
            //this.prizeValue.style = textStyles.parse('prizeValueNoWin');
            //this.prizeValue.y = 50;

            this.parent = parent;



            // Center everything
            this.symbolAnim.anchor.set(0.5);
            //this.prizeValue.anchor.set(0.5);


            this.hitArea = new PIXI.Rectangle(-50, -50, 110, 110);


            this.holdArea = new PIXI.Container();

            this.spineLayerBonus.addChild(this.holdArea);
            this.holdArea.addChild(this.revealSpineBonus);
            this.holdArea.addChild(this.spineBonus);

            this.spineBonus.position.set(this.parent.x, this.parent.y);
            this.revealSpineBonus.position.set(this.parent.x, this.parent.y);

            // Add all the result elements to a container
            this.resultContainer = new PIXI.Container();
            this.resultContainer.addChild(this.symbolAnim);
            this.resultContainer.name = 'resultContainer';

            this.resultContainer.y = -12;

            this.appendArray = {
                'resultContainer': this.resultContainer,
            };

            Object.keys(this.appendArray).forEach(e => {
                this.addChild(this.appendArray[e]);
                this.appendArray[e].name = e;
            });

            // State
            this.revealed = false;
            this.number = undefined;
            this.prize = "";

            this.last = false;

            this.revealSpineBonus.renderable = false;

            this.win = false;

            this.on('press', () => {
                if (!autoPlay.enabled) {
                    this.reveal();
                }
            });

            this.on('mouseover', () => {
                msgBus.publish('game.bonusArea.hoverOver', {
                    index: this.childPosition
                });
            });

            this.on('mouseout', () => {
                msgBus.publish('game.bonusArea.mouseout', {
                    index: this.childPosition
                });
            });

            msgBus.publish('animation.play', {
                index: this.parent.name,
                anim: 'Static',
                delay: 0,
            });


            this.enabled = false;


            msgBus.subscribe('Game.AutoPlayStart', () => {
                if (!this.revealed) {
                    msgBus.publish('animation.play', {
                        index: this.parent.name,
                        anim: 'Static',
                        delay: 0,
                        loop: true,
                    });
                }
            });


            msgBus.publish('animation.setEvents', {
                index: this.parent.name,
                event: {
                    // THIS IS THE EVENT TRIGGERED BY SPINE!!
                    'showGem': () => {

                        this.symbolAnim.alpha = 0;
                        var _this = this;

                        function revealBonusSymbolWin(color, index){
                            Tween.delayedCall(0.1, () => {
                                _this.revealSpineBonus.renderable = true;
                            });

                            // Add pip counter to the collector
                            Tween.delayedCall(1, () => {
                                bonusMeter.addPipToMeter(color);
                            });

                            msgBus.publish('animation.play', { 
                                index: _this.revealSpineBonus.index,
                                anim: spineAnimationsArray[index] + 'REVEAL',
                                delay: 0,
                                loop: false
                            });

                            msgBus.publish('animation.add', {
                                index: _this.revealSpineBonus.index,
                                anim: spineAnimationsArray[index] + 'IDLE',
                                delay: 0.8,
                                loop: 2
                            });
                        }

                        function revealMultiplier(multiplier, index){
                            Tween.delayedCall(0.1, () => {
                                _this.revealSpineBonus.renderable = true;
                                audio.play('BonusSymbolMultiplierReveal');
                            });

                            Tween.delayedCall(0.2, () => {
                                bonusMeter.checkMultipliers(multiplier);
                            });

                            msgBus.publish('animation.play', {
                                index: _this.revealSpineBonus.index,
                                anim: spineMultipliersAnimationsArray[index] + 'REVEAL',
                                delay: 0,
                                loop: false
                            });

                            msgBus.publish('animation.add', {
                                index: _this.revealSpineBonus.index,
                                anim: spineMultipliersAnimationsArray[index] + 'IDLE',
                                delay: 0.8,
                                loop: 2
                            });

                            _this.bringToFront();
                        }

                        switch (this.number) {
                            case "W": {
                                revealBonusSymbolWin("red", 0);
                                    break;
                                }
                            case "X": {
                                revealBonusSymbolWin("orange", 1);
                                    break;
                                }
                            case "Y":{
                                revealBonusSymbolWin("yellow", 2);
                                break;
                            }
                            case "Z":{
                                revealBonusSymbolWin("green", 3);
                                break;
                            }
                            case "1": {
                                revealMultiplier(1, 0);
                                break;
                            }
                            case "2": {
                                revealMultiplier(2, 1);
                                break;
                            }
                            case "3": {
                                revealMultiplier(3, 2);
                                break;
                            }
                            case "4": {
                                revealMultiplier(4, 3);
                                break;
                            }
                            case "5": {
                                revealMultiplier(5, 4);
                                break;
                            }
                        }
                    }
                }
            });
        }

        bringToFront() {
            // we need to move this pick point to the front
            // as otherwise the spineAnim will underlap neighbouring pickPoints
            this.parent.parent.setChildIndex(
                this.parent,
                this.parent.parent.children.length - 1
            );
        }

        enable() {
            return new Promise(resolve => {
                this.reveal = resolve;
                this.enabled = true;
                this.interactive = true;
                this.interactiveChildren = true;
            }).then(() => {
                this.enabled = false;
            });
        }

        mouseout(data) {
            if (!this.revealed) {
                if (data.index === this.childPosition) {
                    msgBus.publish('animation.play', {
                        index: this.parent.name,
                        anim: 'Static',
                        delay: 0,
                        loop: 0
                    });
                    msgBus.publish('game.bonusArea.updateLastIndex', {
                        index: this.childPosition
                    });
                } else {
                    msgBus.publish('animation.play', {
                        index: this.parent.name,
                        anim: 'Static',
                        delay: 0,
                        loop: false
                    });
                }
            }
        }

        idle() {
            if (!this.revealed) {
                msgBus.publish('animation.play', {
                    index: this.parent.name,
                    anim: 'Idle', // IdleLoop
                    delay: 0,
                    loop: true
                });
            }
        }

        hover(data) {
            if (!this.revealed) {
                if (data.index === this.childPosition) {
                    msgBus.publish('animation.play', {
                        index: this.parent.name,
                        anim: 'Mouseover',
                        delay: 0,
                        loop: true
                    });
                    msgBus.publish('game.bonusArea.updateLastIndex', {
                        index: this.childPosition
                    });
                } else {
                    msgBus.publish('animation.play', {
                        index: this.parent.name,
                        anim: 'Static',
                        delay: 0,
                        loop: false
                    });
                }
            }
        }

        populate(number /*, prizeAmount*/ ) {
            this.number = number;

            /*
                  if (prizeAmount !== undefined) {
                    this.prize = SKBeInstant.formatCurrency(prizeAmount).amount;
                  }
                  this.prizeValue.visible = false;

                  if (this.number !== 0 || this.number !== 9) {
                    this.prizeValue.text = SKBeInstant.formatCurrency(this.prize).formattedAmount;
                  }
                  */
        }

        dimNonRevealedPickPoints() {

            this.enabled = false;
            this.reveal = undefined;

            if (!this.revealed) {

                this.interactive = false;
                //displayList[this.parent.name].alpha = 0.5

                Tween.to(displayList[this.parent.name], 0.5, {
                    alpha: 0.5
                });

                msgBus.publish('animation.play', {
                    index: this.parent.name,
                    anim: 'Static',
                    delay: 0,
                    track: 0
                });
            }

        }

        disable() {
            this.enabled = false;
            this.reveal = undefined;



            /*
            msgBus.publish('animation.play', {
                index: this.parent.name,
                anim: 'Static',
                delay: 0,
                loop: 0
            });

            if (!this.revealed) {
                this.alpha = 0.2;
            }
            */
            //msgBus.publish('animation.play', {
            //  index: this.parent.name,
            //anim: 'Static',
            //delay: 0,
            //track: 0
            //});
        }

        //updatePrize(multiplier) {

        //console.log("MULTIPLY PRIZE x " + multiplier.value);
        //this.prize = (this.prize * multiplier.value);
        //this.win = true;
        //}

        reset() {

            console.log("Reset bonus symbols...");

            this.alpha = 1;
            this.parent.alpha = 1;
            this.enabled = false;
            this.symbolAnim.visible = false;
            this.symbolAnim.texture = PIXI.Texture.EMPTY;
            this.symbolAnim.alpha = 1;
            this.resultContainer.y = -12;
            this.revealed = false;
            this.matched = false;
            this.win = false;
            this.number = undefined;
            //this.prizeValue.text = "";
            this.revealSpineBonus.renderable = false;
            this.interactive = true;
            this.interactiveChildren = true;
            this.last = false;
            // msgBus.publish('animation.clearTrack', {
            //     index: this.parent.name,
            //     all:true
            // });

            msgBus.publish('animation.play', {
                index: this.parent.name,
                anim: 'Static',
                delay: 0,
                track: 0
            });


        }

        async uncover() {
            await new Promise(resolve => {
                this.revealed = true;
                //this.removeAllListeners();
                this.interactiveChildren = false;
                this.spineLayerBonus.setChildIndex(this.holdArea, this.spineLayerBonus.children.length - 1);
                msgBus.publish('animation.play', {
                    index: this.parent.name,
                    anim: 'Reveal',
                    delay: 0,
                    loop: 0,
                });
                Tween.delayedCall(1, () => {
                    resolve();
                });
            });
        }

        static fromContainer(container) {
            const bonusPickPoint = new BonusPickPoint(container, container.children[container.children.length - 1], container.children[container.children.length - 2]);
            container.addChild(bonusPickPoint);
            bonusPickPoint.childPosition = container.parent.getChildIndex(container);
            return bonusPickPoint;
        }
    }

    return BonusPickPoint;
});