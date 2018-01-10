//lambda
const mainState = { // create main scean

  create: function () { // static code

    game.scale.pageAlignVertically = true; // center phaser game canvas vertically
    game.scale.pageAlignHorizontally = true; // center phaser game canvas horizontally

    game.stage.backgroundColor = '#2d2d2d'; // colour load in before background image loads, mostly used to be sure the program is running
      this.background = game.add.sprite(0, 0, 'background'); // add the background

    this.man = game.add.sprite(400, 105, 'man'); // add the main character
    //this.pistol = game.add.sprite(this.man.position.x, this.man.position.y, 'pistol');
    game.physics.enable(this.man, Phaser.Physics.ARCADE); // give the sprite physics (collider body)

    this.isPaused = false; // boolean for pausing game
    this.isWaveCleared = false; // boolean for wave interval
    this.clothesBought = 0; // Sets ammount of clothes bought
    this.health = 1; // sets starting health
    this.currentWave = 0; // sets the starting wave
    this.canBuyItem = true; // boolean to stop you buying 1 item per frame of clicking
    this.maxWave = 5; // sets the maximen wave for game over
    this.randFire = 1.2; // value for SMG's random fire

    this.guns = { // class for weapons
        Pistol : { // weapon name
        roundsPerMinute : 175, // rounds per min of gun
        cost : 20, // points needed to get it
        sprite : null, // sprite doesnt load in at start
        spriteName : "pistol", // sprite it will use
        sound : null, // sound doesnt load in at start
        soundName : "pistol_s",  // sound it will use
        isBought : false // sets starting state to not bought
      },
      Smg : { // weapon name of gun
        roundsPerMinute : 560, // rounds per min of gun
        cost : 50, // points needed to get it
        sprite : null,// doesnt load in at start
        spriteName : "smg", // sprite it will use
        sound : null, // sound doesnt load in at start
        soundName : "smg_s", // sound it will use
        isBought : false // sets starting state to not bought
      },
      Shotgun : { // weapon name of gun
        roundsPerMinute : 50, // rounds per min of gun
        cost : 45, // points needed to get it
        sprite : null,// doesnt load in at start
        spriteName : "shotgun", // sprite it will use
        sound : null, // sound doesnt load in at start
        soundName : "shotgun_s", // sound it will use
        isBought : false// sets starting state to not bought
      },
      Sniper : { // weapon name of gun
        roundsPerMinute : 65, // rounds per min of gun
        cost : 40, // points needed to get it
        sprite : null,// doesnt load in at start
        spriteName : "sniper", // sprite it will use
        sound : null, // sound doesnt load in at start
        soundName : "sniper_s", // sound it will use
        isBought : false// sets starting state to not bought
      }
    };
    this.currentGun = this.guns.Pistol; // sets the starting gun to the pistol
    this.timeBetweenShots = 1/(this.currentGun / 60000); // minute into milliseconds (60 seconds and 60,000 milliseconds)


    this.changeGun(this.currentGun); // changes the gun on event

    this.mineCount = 0; // game starts with player having 0 mines

    this.armour = { // class for armour
      Jeans : { // name of armour
        sprite : null, // doesnt load at the start
        spriteName : "bottom1", // sprite it will use
        healthBouns: 1, // amount of health it will give you
        cost : 20, // points needed to get it
      },

      Shirt : { // name of armour
        sprite : null,// doesnt load at the start
        spriteName : "top1",// sprite it will use
        healthBouns: 1,// amount of health it will give you
        cost : 20,// points needed to get it
      },

      Shoes : {// name of armour
        sprite : null,// doesnt load at the start
        spriteName : "bottom2",// sprite it will use
        healthBouns: 1,// amount of health it will give you
        cost : 30,// points needed to get it
      },

      Jacket : {// name of armour
        sprite : null,// doesnt load at the start
        spriteName : "top2",// sprite it will use
        healthBouns: 1,// amount of health it will give you
        cost : 30// points needed to get it
      }
    }
    this.mineCost= 20; // price per mine
    this.boughtArmour = []; // creates empty array

    //zombie---------------------------------------------

    this.zombies = game.add.group(); // put sprites in a group
    this.zombies.enableBody = true;  // add physics to group
    this.zombies.physicsBodyType = Phaser.Physics.ARCADE; // add physics to group

    this.waveSpawn(); // calls wavespawn event

    this.zombieMoveSpeed = 0.1; //  sets the speed the enemys move towards player
    this.zombieMoveSpeedIncrease = 0.055; // sets how much faster they get each round

    //zombie---------------------------------------------

    this.bullets = game.add.group(); // puts bullet sprite in group
    this.bullets.enableBody = true;  // add physics to group
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;  // add physics to group

    this.mines = game.add.group(); // puts bullet sprite in group
    this.mines.enableBody = true;  // add physics to group
    this.mines.physicsBodyType = Phaser.Physics.ARCADE; // add physics to group

    for (let i = 0; i < 40; i++) { // create up tp 40 bullets
      let b = this.bullets.create(0, 0, 'bullet');//
      b.exists = false; // sprite doesnt exist
      b.visible = false;  // sprite is invisible
      b.checkWorldBounds = true; // will see if bullet is out of canvas
      b.events.onOutOfBounds.add((bullet) => { bullet.kill(); }); // will kill bullet if it is out of canvas
    }

    this.bulletTime = 0; // sets bullet time to 0



    this.score = 0; // starting "score" / money is 0
    this.scoreDisplay = game.add.text(1100, 20, `Money £${this.score}`, { font: '30px Arial', fill: '#584f99' }); // display money
    this.waveDisplay = game.add.text(1100, 65, `Wave ${this.currentWave}/${this.maxWave}`, { font: '30px Arial', fill: '#584f99' }); // display wave
    this.mineDisplay = game.add.text(10, 60, `Mines: ${this.mineCount}`, { font: '15px Arial', fill: '#ffffff' }); // display amount of mines


    this.cursors = game.input.keyboard.createCursorKeys(); // setting spacebar as a button
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]); // setting spacebar as a button

    this.sm = game.add.sprite(1125, 122 , 'sm'); // add "sm" (shopkeeper)

    game.physics.enable(this.sm, Phaser.Physics.ARCADE); // give sm physics
    game.time.events.add(Phaser.Timer.SECOND *5, ()=>{}, this); // event takes 5 seconds
    game.add.tween(this.sm.body).to( {y:175}, 1500, Phaser.Easing.Linear.None, true ); // move sprite around on event

    game.add.sprite(0, 0, "sm hole"); // adds the background that covers the shopkeeper

// the shop---------------------------------------------------------------
    this.shopSprite = game.add.sprite(0, 0, "shop"); // add the shop
    this.shopSmg = game.add.sprite(450, 20, "shopSmg"); // add specific gun icon
    this.shopShotgun = game.add.sprite(575, 20, "shopShotgun"); // add specific gun icon
    this.shopSniper = game.add.sprite(700, 20, "shopSniper"); // add specific gun icon
    this.Mine = game.add.sprite(960, 40, "Mine"); // add specific mine icon


    this.shopSale = game.add.sprite(0, 0,"shopSale"); // add sprite for prices

    this.armourT1 = game.add.sprite(850, 20,"armourT1");  // adds sprite of clothing/ armour
    this.armourT2 = game.add.sprite(900, 20,"armourT2"); // adds sprite of clothing/ armour
    this.armourB1 = game.add.sprite(850, 60,"armourB1"); // adds sprite of clothing/ armour
    this.armourB2 = game.add.sprite(900, 65,"armourB2"); // adds sprite of clothing/ armour

    this.adjustShopVisibility(false); // make above sprites invisible

// the shop---------------------------------------------------------------

  this.fullHealth = game.add.group() // puts healt into a group

  this.updateHealth(); // calls updateHealth function

  },

  waveSpawn: function ()  { // create function wavespawn

      game.time.events.add(Phaser.Timer.SECOND *1, ()=>{}, this); // wait one second (this makes transition smoother when loading the win state)
    let spawn = function(){ // create spawn function
      this.zombieMoveSpeed += this.zombieMoveSpeedIncrease; // increase enemys speed
      for (let i = 0; i < 16; i++) { // create 28 zombies
        let c = this.zombies.create(105 + (i % 4) * 90, 350 + Math.floor(i / 4) * 80, 'zss'); // set there starting postion
        c.body.immovable = true;

        c.animations.add('crawl', [0,1], 3, true); // add frames of sprite sheet
        c.animations.play("crawl"); // play animation
      }
      this.currentWave ++; // add 1 to wave
      this.waveDisplay.text = `Wave ${this.currentWave}/${this.maxWave}`; // display the new wave

      for (let i = 0; i < 16; i++) { // create 30 zombies
        let c = this.zombies.create(580 + (i % 4) * 90, 350 + Math.floor(i / 4) * 80, 'zss');  // set there starting postion
        c.body.immovable = true;

        c.animations.add('crawl', [0,1], 3, true); // add frames of sprite sheet
        c.animations.play("crawl"); // play animation
      }

      for (let i = 0; i < 8; i++) { // create 30 zombies
        let c = this.zombies.create(950 + (i % 2) * 90, 350 + Math.floor(i / 2) * 80, 'zss');  // set there starting postion
        c.body.immovable = true;

        c.animations.add('crawl', [0,1], 3, true); // add frames of sprite sheet
        c.animations.play("crawl"); // play animation
      }
    };

    game.time.events.add(Phaser.Timer.SECOND *8, spawn, this); // 8 seconds spawn time gap bettween waves
  },

  updateHealth: function() { // sets a function
    this.fullHealth.forEach((hp)=>{ // creates a for loop for fullHealth
      hp.destroy();// destroys hp
    });

    for (let i = 0; i < this.health; i++) { // Displays hearts on the screen
      let j = this.fullHealth.create(i * 70, 0, 'heart');// adds heart sprite
    }
  },

  fire: function () { // the shooting function
    if (game.time.now > this.bulletTime) { //creates bullet interval
      this.fireSound.play(); // play the gun sound

      if(this.currentGun === this.guns.Shotgun){ // if the gun is shotgun
        this.fireBullet(500, 1500); // fire bullet slightly right
        this.fireBullet(-500, 1500); // fire bullet slightly left
        this.fireBullet(0, 1500); // fire bullet stright down
        this.fireBullet(1250, 1500); // fire bullet far to the right
        this.fireBullet(-1250, 1500);// fire bullet far to the left
      }

      else if(this.currentGun === this.guns.Smg) { // if the gun is smg
        this.fireBullet2(0, 1500); // use a different bullet
      }

      else { // applys to all other guns
        this.fireBullet(0, 1500); // fire bullet stright down

      }

      if(this.currentGun == this.guns.Shotgun){ // if gun is shotgun
        game.camera.shake(0.015, 100); // shake the screen
      }
      else if(this.currentGun == this.guns.Sniper){ // if gun is shotgun
        game.camera.shake(0.005, 200);// shake the screen
      }
    }
  },

  fireBullet: function (xVelocity, yVelocity){ // create fuction that effects velocity
    let bullet = this.bullets.getFirstExists(false); // get first exists
    if (bullet) { // if bullet
      bullet.reset(this.currentGun.sprite.x + (this.currentGun.sprite.width - 45), this.currentGun.sprite.y - (this.currentGun.sprite.height -130)); // set bullet spawn postion starting from the guns postion
      bullet.body.velocity.x = xVelocity; // bullet body horizontal velocity = xVelocity
      bullet.body.velocity.y = yVelocity;   // bullet body vertical velocity = yVelocity
      this.bulletTime = game.time.now + this.timeBetweenShots; // adds time between each shot
    }
  },


    fireBullet2: function (xVelocity, yVelocity){ // create fuction that effects velocity
      let bullet2 = this.bullets.getFirstExists(false); // get first exists
      if (bullet2) { // if bullet
        bullet2.reset(this.currentGun.sprite.x + (this.currentGun.sprite.width - 45), this.currentGun.sprite.y - (this.currentGun.sprite.height -130)); // set bullet spawn postion starting from the guns postion
        bullet2.body.velocity.x = xVelocity; // bullet body horizontal velocity = xVelocity
        bullet2.body.velocity.y = yVelocity;   // bullet body vertical velocity = yVelocity
        bulletRot = (Math.random()/2) + this.randFire; // gives variation in velocity

        game.physics.arcade.velocityFromRotation(bulletRot, 1000, bullet2.body.velocity);
        bullet2.rotation = bulletRot - 1.3; // gives bullet rotation
        this.bulletTime = game.time.now + this.timeBetweenShots; // adds time between each shot
      }
    },

  placeMine: function () { // function for placing mines
    if(this.mineCount <= 0) { // if there are 0 or less mines
      return; // do nothing
    }

      if (game.time.now > this.bulletTime && this.score >= this.mineCost) { // if you can afford mines
         this.bulletTime = game.time.now + this.timeBetweenShots;
          this.mines.create(this.man.position.x + this.man.width /2 -5 , this.man.position.y + this.man.height , "mine"); // place mine under character
          this.mineCount -- ; // take away 1 mine
          this.mineDisplay.text = `Mines :${this.mineCount}`; // update text for mines
      }

  },

  gameOver: function () { // create function called game over
    game.state.start('gameover'); // change state to game over screen
  },

  winner: function() { // creates function for winning
    game.state.start('won') // cahnge game state to the won scre
  },

  hit: function (bullet, zss) { // create hit function that applys to bullet and zss
    this.score = this.score + Math.floor(Math.random() * 4) + 0   ; // and random number from 1 to 5 to score/money

    if (this.currentGun == this.guns.Pistol || this.currentGun == this.guns.Smg || this.currentGun == this.guns.Shotgun) { // if all guns other than the sniper
      bullet.kill(); // destroy bullet on impact with zombie
      // this makes the sniper round go through zombies
    }

    zss.kill(); // kill the zss

    if (this.zombies.countLiving() === 0) {// when there are no zombies left
      this.score = this.score + 10; // add 100 to score
      this.waveSpawn(); // run wave spawn function
    }

    this.scoreDisplay.text = `Money £${this.score}`; // displays score and high score
  },

  hitMine: function(mine, zss) { // create fucntion that effects mine and zss
    mine.kill(); // kill mine
    zss.kill(); // kill zss
  },

  preload: function () { // load in assets before game starts
    game.load.spritesheet('zss', 'assets/ZSS.png', 64, 64, 2); // load zombie sprite sheet

    //misc-----------------------------------------------------
    game.load.image('bullet', 'assets/bullet.png'); // load bullet
    game.load.image('background', 'assets/background.png'); // load background
    game.load.image('man', 'assets/Naked Man.png'); // // load character
    game.load.image('sm', 'assets/salesman.png'); // load shopkeeper
    game.load.image('sm hole', 'assets/hidey wall.png'); // load wall
    game.load.image('shop', 'assets/shopscreen.png'); // load shop
    game.load.image('heart', 'assets/heart.png'); // load heart
    //misc-----------------------------------------------------

    //sounds----------------------------------------------------
    game.load.audio('pistol_s', 'assets/Soundz/Pistol.mp3'); // load pistol sound
    game.load.audio('smg_s', 'assets/Soundz/smg.mp3'); // load smg sound
    game.load.audio('shotgun_s', 'assets/Soundz/shotty.mp3'); // load shotgun sounds
    game.load.audio('sniper_s', 'assets/Soundz/snooiper.mp3'); // load sniper sound
    //sounds-----------------------------------------------------

    //armour-----------------------------------------------------
    game.load.image('top1', 'assets/armour/top 1.png'); // load armour peice
    game.load.image('top2', 'assets/armour/top 2.png'); // load armour peice
    game.load.image('bottom1', 'assets/armour/bottom 1.png'); // load armour peice
    game.load.image('bottom2', 'assets/armour/bottom 2.png'); // load armour peice
    //armour-----------------------------------------------------

    //guns-------------------------------------------------------
    game.load.image('pistol', 'assets/Gunz/Pistol.png'); // load pistol
    game.load.image('smg', 'assets/Gunz/SMG.png'); // load smg
    game.load.image('shotgun', 'assets/Gunz/Shotgun.png'); // load shotgun
    game.load.image('sniper', 'assets/Gunz/Sniper.png'); // load sniper
    game.load.image('mine', 'assets/mine.png'); // load mine
    //guns-------------------------------------------------------

    //shop sprites----------------------------------------------
    game.load.image('shopSmg', 'assets/ShopSprites/smg.png'); // load smg shop image
    game.load.image('shopShotgun', 'assets/ShopSprites/shotgun.png');  // load shotgun shop image
    game.load.image('shopSniper', 'assets/ShopSprites/sniper.png');  // load sniper shop image
    game.load.image('clothes', 'assets/ShopSprites/health.png'); // load shop heart image image
    game.load.image('Mine', 'assets/ShopSprites/Mine.png'); // load mine shop image

    game.load.image('armourT1', 'assets/ShopSprites/vest.png'); // load shop image for vest
    game.load.image('armourB1', 'assets/ShopSprites/jeans.png'); // load shop image for jeans
    game.load.image('armourT2', 'assets/ShopSprites/jacket.png'); // load shop image for jacket
    game.load.image('armourB2', 'assets/ShopSprites/shoes.png'); // load shop image for shoes

    game.load.image('shopSale', 'assets/ShopPrice.png'); // load price image

    //shop sprites----------------------------------------------
  },

  shop: function () { // create shop function
    let distance = Math.abs(this.man.x - this.sm.x); // measure x distance between man and shop keeper

    if (distance < 62 && this.isWaveCleared === true) { // and if its witihin range and the wave is clear

      this.adjustShopVisibility(true); // makes shop visible
    }
    else { // and if not
      this.adjustShopVisibility(false); // shop is invisible
    }
  },

  adjustShopVisibility: function(visibility){ // function of shop availbility
    this.shopSprite.visible = visibility; // make shop invisible and visible when it needs to be
    this.shopSmg.visible = visibility // make smg invisble and visible when it needs to be
    this.shopShotgun.visible = visibility;// make shotgun invisible and visible when it needs to be
    this.shopSniper.visible = visibility;// make sniper invisible and visible when it needs to be
    this.Mine.visible = visibility; // make mine invisble and visible when it needs to be
    this.armourT1.visible = visibility;// make vest invisible and visible when it needs to be
    this.armourT2.visible = visibility;// make jacket invisible and visible when it needs to be
    this.armourB1.visible = visibility;// make jeans invisible and visible when it needs to be
    this.armourB2.visible = visibility;// make shoes invisible and visible when it needs to be
    this.shopSale.visible = visibility;;// make prices invisible and visible when it needs to be

    this.shopSmg.inputEnabled = true;// allows imput on smg
    this.shopSmg.events.onInputDown.add(()=>{ // when clicked on
      if(this.canBuyItem === false) // if can buy iteam is false
        return; // do nothing

      if (this.score < this.guns.Smg.cost) { // your score(money) must be higher than the cost of the weapon to buy
          console.log("cant afford") // print "cant afford" to cthe console
          return; // do nothing / end
      }

      this.changeGun(this.guns.Smg); // on click change to gun
      this.score -= this.guns.Smg.cost // take away price of gun from money
      this.scoreDisplay.text = `Money £${this.score}`; // update amaount of money
      this.canBuyItem = false; // can buy iteam is false
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this); // wait a 0.2 seconds after being clicked on
    });

      this.shopShotgun.inputEnabled = true; // allows imput on shotgun
      this.shopShotgun.events.onInputDown.add(()=>{ // when clicked on
      if(this.canBuyItem === false) // if can buy iteam is false
      return; // do nothing

      if (this.score < this.guns.Shotgun.cost) { // your score(money) must be higher than the cost of the weapon to buy
        console.log("cant afford") // print "cant afford" to cthe console
        return; // do nothing / end
      }

      this.changeGun(this.guns.Shotgun); // on click change to gun
      this.score -= this.guns.Shotgun.cost // take away price of gun from money
      this.scoreDisplay.text = `Money £${this.score}`;  // update amaount of money
      this.canBuyItem = false; // can buy iteam is false
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this);  // wait a 0.2 seconds after being clicked on
    });

    this.shopSniper.inputEnabled = true; // allows imput on sniper
    this.shopSniper.events.onInputDown.add(()=>{  // when clicked on
      if(this.canBuyItem === false) // if can buy iteam is false
      return; // do nothing

      if (this.score < this.guns.Sniper.cost) { // your score(money) must be higher than the cost of the weapon to buy
        console.log("cant afford") // print "cant afford" to cthe console
        return; // do nothing / end
      }

      this.changeGun(this.guns.Sniper); // on click change to gun
      this.score -= this.guns.Sniper.cost // take away price of gun from money
      this.scoreDisplay.text = `Money £${this.score}`;  // update amaount of money
      this.canBuyItem = false; // can buy iteam is false
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this);  // wait a 0.2 seconds after being clicked on
    });

    this.Mine.inputEnabled = true; // allows imput on mine
    this.Mine.events.onInputDown.add(()=>{ // when clicked on
      if(this.canBuyItem === false)  // if can buy iteam is false
        return; // do nothing

      if(this.score < this.mineCost) // if smoney is less than the cost of a mine
        return; // do nothing

        this.score -= this.mineCost; // take away price of mine away from money
        this.scoreDisplay.text = `Money £${this.score}`; // update money
      this.mineCount ++; // add 1 to mine count
      this.mineDisplay.text = `Mines :${this.mineCount}`; // update mine count
      this.canBuyItem = false; // set canBuyItem to false
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this);   // wait a 0.2 seconds after being clicked on
    });

    this.armourB1.inputEnabled = true; // allows imput on jeans
    this.armourB1.events.onInputDown.add(()=>{  // when clicked on
      if(this.canBuyItem === false)  // if can buy iteam is false
        return;

      if (this.score < this.armour.Jeans.cost) { // your score(money) must be higher than the cost of the armour to buy
        console.log("cant afford") // print "cant afford" to cthe console
        return; // do nothing
      }

      this.changeClothes(this.armour.Jeans ); // run change clothes for jeans
      this.score -= this.armour.Jeans.cost // take away price of jeans from money
      this.scoreDisplay.text = `Money £${this.score}`; // update money text
      this.canBuyItem = false; // can buy item is false
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this);  // wait a 0.2 seconds after being clicked on
    });

    this.armourB2.inputEnabled = true; // allows imput on shoes
    this.armourB2.events.onInputDown.add(()=>{ // when clicked on
      if(this.canBuyItem === false) // if can buy iteam is false
        return; // do nothing

      if (this.score < this.armour.Shoes.cost) { // your score(money) must be higher than the cost of the armour to by
        console.log("cant afford") // print "cant afford" to cthe console
        return; // do nothing
      }

      this.changeClothes(this.armour.Shoes );  // run change clothes for shoes
      this.score -= this.armour.Shoes.cost //  take away price of jeans from money
      this.scoreDisplay.text = `Money £${this.score}`;  // update money text
      this.canBuyItem = false; // can buy item is false
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this); // wait a 0.2 seconds after being clicked on
    });

    this.armourT1.inputEnabled = true; // allows imput on vest
    this.armourT1.events.onInputDown.add(()=>{ // when clicked on
      if(this.canBuyItem === false) // if can buy iteam is false
      return; // do nothing

      if (this.score < this.armour.Shirt.cost) {  // your score(money) must be higher than the cost of the armour to by
        console.log("cant afford") // print "cant afford" to cthe console
        return; // do nothing
      }

      this.changeClothes(this.armour.Shirt ); // run change clothes for shirt
      this.score -= this.armour.Shirt.cost //  take away price of jeans from money
      this.scoreDisplay.text = `Money £${this.score}`; // update money text
      this.canBuyItem = false; // can buy item is false
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this); // wait a 0.2 seconds after being clicked on
    });

    this.armourT2.inputEnabled = true; // allows imput on jacket
    this.armourT2.events.onInputDown.add(()=>{  // when clicked on
      if(this.canBuyItem === false) // if can buy iteam is false
      return; // do nothing
      if (this.score < this.armour.Jacket.cost) { // your score(money) must be higher than the cost of the armour to by
        console.log("cant afford") // print "cant afford" to cthe console
        return; // do nothing
      }

      this.changeClothes(this.armour.Jacket ); // run change clothes for jacket
      this.score -= this.armour.Jacket.cost //  take away price of jeans from money
      this.scoreDisplay.text = `Money £${this.score}`; // update money text
      this.canBuyItem = false; // can buy item is false
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this); // wait a 0.2 seconds after being clicked on
    });


  },

  changeClothes: function(armour){ // sets function for changeClothes
      if(armour.sprite === null) // if there is no armour
        armour.sprite = game.add.sprite(this.man.position.x, this.man.position.y, armour.spriteName, this.health ++, console.log(this.health)); // add clicked on armour, add to health, and print health in the console

    this.boughtArmour.push(armour); // add this armour to the array
    this.updateHealth(); // calls update health function

  },

  changeGun: function (gun) { // function to change gun

    if(this.currentGun.sprite != null){
      this.currentGun.sprite.kill(); // kill currant gun
    } // if gun is null

    this.currentGun = gun; // and becoms new gun
    this.currentGun.isBought = true; // gun becomes bought
    gun.sprite = game.add.sprite(this.man.position.x, this.man.position.y, gun.spriteName); // attach gun to man/character
    this.timeBetweenShots = 1/(gun.roundsPerMinute / 60000); // minute into milliseconds (60 seconds and 60,000 milliseconds)
    this.fireSound = game.add.audio(gun.soundName); // change gun soung to selected gun sound
    gun.sound = this.fireSound; // change gun soung to selected gun sound
  },

  update: function () { // function that updates each frame
    this.isWaveCleared = (this.zombies.countLiving() == 0); // there must be 0 zombines for wave to be clear

    game.physics.arcade.overlap(this.bullets, this.zombies, this.hit, null, this); // when a bullet touches a zombie, run hit function
    game.physics.arcade.overlap(this.mines, this.zombies, this.hitMine, null, this); // when a mine touches a zmobie, run hitMine function


    if (game.input.keyboard.justPressed(Phaser.Keyboard.P)) { // if p is pressed
      this.isPaused = !this.isPaused; // invert pause boolean
      console.log('Pause toggled'); // write to console on event
    }

    if (this.isPaused === true) { // if game is pasued
      // Now paused
      this.zombies.forEach((zombie)=>{ // stop zombies
        zombie.animations.stop(); // stop zombies
      });
    }
    else { // if not
      // Now unpaused
      this.zombies.forEach((zombie) => { // resume animation
        zombie.animations.play('crawl'); // resume animation
      });
    }

    if(this.isPaused === true){ // if game is paused
      return; // leave this function
    }

    this.man.body.velocity.x = 0; // man isnt moving

    this.zombies.forEach( // every zombie
      (zombie) => { // lambda for zombie

        zombie.body.position.y = zombie.body.position.y - this.zombieMoveSpeed; // adds incremental speed
        if (zombie.y + zombie.height < 200) { // if they reach the top of the building
          zombie.destroy(); // destroy the zombie
          this.health --; // take away health
          console.log(this.health); // paste health in console
          this.updateHealth(); // call update health
          game.camera.flash(0xbff0000 , 200) // makes camera flash red when character takes damage

          if (this.zombies.countLiving() === 0) {// when there are no zombies left
            this.score = this.score + 10; // add 100 to score
            this.waveSpawn(); // run wave spawn function
          }
        }
      }
    );

    if (this.health <= 0) { // if your health is 0 or lower
      this.gameOver(); // call gameOver
      }

    if (this.currentWave > this.maxWave) { // if your health is 0 or lower
      this.winner(); // call gameOver
    }

    // Distance in pixels the player can walk from the edge of the screen
    let distFromSides = 50; // creats movement boundry
    if (this.cursors.left.isDown) { // if left button is down
      if (this.man.position.x > distFromSides) { // move left up to "distFromSides"
        this.man.body.velocity.x = -300 ; // at this speed
      }
    } else if (this.cursors.right.isDown) { // if right is down

      if (this.man.position.x < 1280 - distFromSides - 170) { // move right up to "distfromsides"
        this.man.body.velocity.x = 300; // at this speed
      }
    }
// Distance in pixels the player can walk from the edge of the screen
    if(this.currentGun === this.guns.Pistol) {
      if (game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR)) { //when spacebar is down
        this.fire(); // run fucntion fire (shoot)
      }
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) { //when spacebar is down
      this.fire(); // run fucntion fire (shoot)
    }

    if (this.cursors.down.isDown) { // if donw arrow is place
      this.placeMine(); // run placeMine
    }

    this.currentGun.sprite.position = this.man.position; // fix gun postion to man/ character

    this.boughtArmour.forEach((armour)=>{armour.sprite.position = this.man.position ; }); // move clothes on to character

    if (this.isWaveCleared ===  false) { // if there are zombies remaining
       game.add.tween(this.sm.body).to( {y:175}, 500, Phaser.Easing.Linear.None, true ); // shop keep goes down

     }
     else { // if not
       game.add.tween(this.sm.body).to( {y:122}, 500, Phaser.Easing.Linear.None, true ); // shop keep goes up
    }
    //this.adjustShopVisibility(this.isWaveCleared);

    this.shop(); // runs shop function

    if(game.input.keyboard.justPressed(Phaser.Keyboard.ONE)) { // if 1 is pressed
      if(this.guns.Pistol.isBought === true) { // if Pistol has been bought
        this.changeGun(this.guns.Pistol); // swtich to pistol
      }
    }
    else if(game.input.keyboard.justPressed(Phaser.Keyboard.TWO)) { // if 2 is pressed
      if(this.guns.Smg.isBought === true) { // if smg has been bought
        this.changeGun(this.guns.Smg); // switch to smg
      }
    }
    else if(game.input.keyboard.justPressed(Phaser.Keyboard.THREE)) { // if 3 is pressed
      if(this.guns.Shotgun.isBought === true) { // if shotgun has been bought
        this.changeGun(this.guns.Shotgun); // switch to shotgun
      }
    }
    else if(game.input.keyboard.justPressed(Phaser.Keyboard.FOUR)) { // if 4 is pressed
      if(this.guns.Sniper.isBought === true) { // if sniper has been bought
        this.changeGun(this.guns.Sniper); // switch to sniper
      }
    }
  },
};

const gameoverState = { // game over state
  preload: function () { // load in assets before game starts
    game.load.image('gg', 'assets/gg no re.png'); // load image
  },
  create: function () {  // static code
    const gameOverImg = game.cache.getImage('gg'); // get image
    game.add.sprite(// add sprite
      game.world.centerX - gameOverImg.width / 2, // postion is half the width
      game.world.centerY - gameOverImg.height / 2, // postion is half the height
      'gg'); // image name
      game.input.onDown.add(() => { game.state.start('main'); }); // on mouse click, load mainstate (restart game)
    }
  };

  const wonState = { // game over state
    preload: function () { // load in assets before game starts
      game.load.image('win', 'assets/win.png'); // load image
    },
    create: function () {  // static code
    game.add.image(0, 0, "win") // add image
    game.input.onDown.add(() => { game.state.start('main'); });//  on mouse click, load mainstate (restart game)
  }
  };

  const ControlState = { // game over state
    preload: function () { // load in assets before game starts
      game.load.image('controls', 'assets/tutorial screen.png'); // load image
    },
    startGame: function  () { // new function
      game.state.start('main'); // load main game
    },

    create: function () {  // static code
      game.scale.pageAlignVertically = true; // center phaser game canvas vertically
      game.scale.pageAlignHorizontally = true; // center phaser game canvas horizontally
    game.add.image(0, 0, "controls") // add image
    game.input.onDown.add(() => { this.startGame(); }); // on click load function (start the game)
    game.time.events.add(Phaser.Timer.SECOND *10, ()=>{this.startGame()}, this); // wait 10 seconds, then then start the game
  },

  };
  const game = new Phaser.Game(1280, 720); // Phaser game in 720p
  game.state.add('controls', ControlState) // add controlsstate
  game.state.add('main', mainState); // add mainState
  game.state.add('gameover', gameoverState);  // add gameover
  game.state.add('won', wonState ); // and won
  game.state.start('controls'); // start at the tutorial
