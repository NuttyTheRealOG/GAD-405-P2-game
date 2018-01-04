//lambda
const mainState = { // create main scean

  create: function () { // static code

    game.scale.pageAlignVertically = true;
    game.scale.pageAlignHorizontally = true;

    game.stage.backgroundColor = '#2d2d2d'; // colour load in before background image loads, mostly used to be sure the program is running
    this.background = game.add.sprite(0, 0, 'background'); // add the background

    this.man = game.add.sprite(400, 105, 'man'); // add the main character
    //this.pistol = game.add.sprite(this.man.position.x, this.man.position.y, 'pistol');
    game.physics.enable(this.man, Phaser.Physics.ARCADE); // give the sprite physics (collider body)

    this.isPaused = false; // boolean for pausing game
    this.isWaveCleared = false; // boolean for wave interval
    this.clothesBought = 0; // Sets ammount of clothes bought
    this.health = 1; // sets starting health
    this.currentWave = 0;
    this.canBuyItem = true;
    this.maxWave = 6;

    this.guns = { // class for weapons
        Pistol : { // weapon name
        roundsPerMinute : 175, // rounds per min of gun
        cost : 20, // points needed to get it
        sprite : null, // sprite doesnt load in at start
        spriteName : "pistol", // sprite it will use
        sound : null, // sound doesnt load in at start
        soundName : "pistol_s",  // sound it will use
        isBought : false
      },
      Smg : { // weapon name of gun
        roundsPerMinute : 580, // rounds per min of gun
        cost : 50, // points needed to get it
        sprite : null,// doesnt load in at start
        spriteName : "smg", // sprite it will use
        sound : null, // sound doesnt load in at start
        soundName : "smg_s", // sound it will use
        isBought : false
      },
      Shotgun : { // weapon name of gun
        roundsPerMinute : 50, // rounds per min of gun
        cost : 45, // points needed to get it
        sprite : null,// doesnt load in at start
        spriteName : "shotgun", // sprite it will use
        sound : null, // sound doesnt load in at start
        soundName : "shotgun_s", // sound it will use
        isBought : false
      },
      Sniper : { // weapon name of gun
        roundsPerMinute : 60, // rounds per min of gun
        cost : 40, // points needed to get it
        sprite : null,// doesnt load in at start
        spriteName : "sniper", // sprite it will use
        sound : null, // sound doesnt load in at start
        soundName : "sniper_s", // sound it will use
        isBought : false
      }
    };
    this.currentGun = this.guns.Pistol; // sets the starting gun to the pistol
    this.timeBetweenShots = 1/(this.currentGun / 60000); // minute into milliseconds (60 seconds and 60,000 milliseconds)


    this.changeGun(this.currentGun); // changes the gun on event

    this.mineCount = 0;

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
    this.mineCost= 20;
    this.boughtArmour = []; // creates empty array

    //zombie---------------------------------------------

    this.zombies = game.add.group(); // put sprites in a group
    this.zombies.enableBody = true;  // add physics to group
    this.zombies.physicsBodyType = Phaser.Physics.ARCADE; // add physics to group

    this.waveSpawn(); // calls wavespawn event

    this.zombieMoveSpeed = 0.1; //  sets the speed the enemys move towards player
    this.zombieMoveSpeedIncrease = 0.075; // sets how much faster they get each round

    //zombie---------------------------------------------

    this.bullets = game.add.group(); // puts bullet sprite in group
    this.bullets.enableBody = true;  // add physics to group
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;  // add physics to group

    this.mines = game.add.group(); // puts bullet sprite in group
    this.mines.enableBody = true;  // add physics to group
    this.mines.physicsBodyType = Phaser.Physics.ARCADE;

    for (let i = 0; i < 40; i++) { // create up tp 40 bullets
      let b = this.bullets.create(0, 0, 'bullet');
      b.exists = false; // sprite doesnt exist
      b.visible = false;  // sprite is invisible
      b.checkWorldBounds = true; // will see if bullet is out of canvas
      b.events.onOutOfBounds.add((bullet) => { bullet.kill(); }); // will kill bullet if it is out of canvas
    }

    this.bulletTime = 0;



    this.score = 0;
    this.scoreDisplay = game.add.text(1100, 20, `Money £${this.score}`, { font: '30px Arial', fill: '#584f99' });
    this.waveDisplay = game.add.text(1100, 65, `Wave ${this.currentWave}/${this.maxWave}`, { font: '30px Arial', fill: '#584f99' });
    this.mineDisplay = game.add.text(10, 60, `Mines: ${this.mineCount}`, { font: '15px Arial', fill: '#ffffff' });


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
    this.Mine = game.add.sprite(960, 40, "Mine");

    //this.clothes = game.add.sprite( 845, 20, "clothes");

    this.armourT1 = game.add.sprite(850, 20,"armourT1")  // adds sprite of clothing/ armour
    this.armourT2 = game.add.sprite(900, 20,"armourT2") // adds sprite of clothing/ armour
    this.armourB1 = game.add.sprite(850, 60,"armourB1") // adds sprite of clothing/ armour
    this.armourB2 = game.add.sprite(900, 65,"armourB2") // adds sprite of clothing/ armour



    this.adjustShopVisibility(false); // make above sprites invisible

// the shop---------------------------------------------------------------

  this.fullHealth = game.add.group() // puts healt into a group

  //game.add.sprite(10, 10, "heart")

  this.updateHealth(); // calls updateHealth function

  },

  waveSpawn: function ()  { // create function wavespawn

      game.time.events.add(Phaser.Timer.SECOND *1, ()=>{}, this);
    let spawn = function(){ // create spawn function
      this.zombieMoveSpeed += this.zombieMoveSpeedIncrease; // increase enemys speed
      for (let i = 0; i < 16; i++) { // create 28 zombies
        let c = this.zombies.create(105 + (i % 4) * 90, 350 + Math.floor(i / 4) * 80, 'zss'); // set there starting postion
        c.body.immovable = true;

        c.animations.add('crawl', [0,1], 3, true); // add frames of sprite sheet
        c.animations.play("crawl"); // play animation
      }
      this.currentWave ++;
      this.waveDisplay.text = `Wave ${this.currentWave}/${this.maxWave}`;

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

    for (let i = 0; i < this.health; i++) {
      let j = this.fullHealth.create(i * 70, 0, 'heart');// adds health
    }
  },

  fire: function () { // the shooting function
    if (game.time.now > this.bulletTime) { //
      this.fireSound.play(); // play the gun sound

      if(this.currentGun === this.guns.Shotgun){
        this.fireBullet(500, 1500);
        this.fireBullet(-500, 1500);
        this.fireBullet(0, 1500);
        this.fireBullet(1250, 1500);
        this.fireBullet(-1250, 1500);
      }
      else { // applys to all other guns
        this.fireBullet(0, 1500);
        
      }

      if(this.currentGun == this.guns.Shotgun){ // if gun is shotgun
        game.camera.shake(0.015, 100); // shake the screen
      }
      else if(this.currentGun == this.guns.Sniper){ // if gun is shotgun
        game.camera.shake(0.005, 200);// shake the screen
      }
    }
  },

  fireBullet: function (xVelocity, yVelocity){
    let bullet = this.bullets.getFirstExists(false);
    if (bullet) {
      bullet.reset(this.currentGun.sprite.x + (this.currentGun.sprite.width - 45), this.currentGun.sprite.y - (this.currentGun.sprite.height -130)); // set bullet spawn postion starting from the guns postion
      bullet.body.velocity.x = xVelocity;
      bullet.body.velocity.y = yVelocity;  // makes bullets move at speed
      this.bulletTime = game.time.now + this.timeBetweenShots; // adds time between each shot
    }
  },

  placeMine: function () {
    if(this.mineCount <= 0) {
      return;
    }

      if (game.time.now > this.bulletTime && this.score >= this.mineCost) {
          this.bulletTime = game.time.now + this.timeBetweenShots;
          this.mines.create(this.man.position.x + this.man.width /2 -5 , this.man.position.y + this.man.height , "mine");
          this.mineCount -- ;
          this.mineDisplay.text = `Mines :${this.mineCount}`;
      }

  },

  gameOver: function () { // create function called game over
    game.state.start('gameover'); // change state to game over screen
  },

  winner: function() {
    game.state.start('won')
  },

  hit: function (bullet, zss) { // create hit function that applys to bullet and zss
    this.score = this.score + Math.floor(Math.random() * 4) + 0   ; // and 10 to score

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

  hitMine: function(mine, zss) {
    mine.kill();
    zss.kill();
  },

  preload: function () { // load in assets before game starts
    game.load.spritesheet('zss', 'assets/ZSS.png', 64, 64, 2); // load zombie sprite sheet

    //misc-----------------------------------------------------
    game.load.image('bullet', 'assets/bullet.png'); // load bullet
    //game.load.spritesheet('explode', 'assets/explode.png', 128, 128); // load
    game.load.image('background', 'assets/background.png'); // load background
    game.load.image('man', 'assets/Naked Man.png'); // // load character
    game.load.image('sm', 'assets/salesman.png'); // load shopkeeper
    game.load.image('sm hole', 'assets/hidey wall.png'); // load wall
    game.load.image('shop', 'assets/shopscreen.png'); // load shop
    game.load.image('heart', 'assets/heart.png');
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
    game.load.image('mine', 'assets/mine.png');
    //guns-------------------------------------------------------

    //shop sprites----------------------------------------------
    game.load.image('shopSmg', 'assets/ShopSprites/smg.png'); // load smg shop image
    game.load.image('shopShotgun', 'assets/ShopSprites/shotgun.png');  // load shotgun shop image
    game.load.image('shopSniper', 'assets/ShopSprites/sniper.png');  // load sniper shop image
    game.load.image('clothes', 'assets/ShopSprites/health.png'); // load clothe image
    game.load.image('Mine', 'assets/ShopSprites/Mine.png');

    game.load.image('armourT1', 'assets/ShopSprites/vest.png'); // adds shop image for vest
    game.load.image('armourB1', 'assets/ShopSprites/jeans.png'); // adds shop image for jeans
    game.load.image('armourT2', 'assets/ShopSprites/jacket.png'); // adds shop image for jacket
    game.load.image('armourB2', 'assets/ShopSprites/shoes.png'); // adds shop image for shoes
    //shop sprites----------------------------------------------
  },

  gotHit: function (zombie, man) { // create function for when the zombie hits the man
  //  this.explosion.reset(this.man.x + (this.man.width / 2), this.man.y + (this.man.height / 2));
    this.man.kill(); // kills man
  //  this.explosion.animations.play('boom');
  },

  shop: function () { // create shop function
    let distance = Math.abs(this.man.x - this.sm.x); // measure x distance between man and shop keeper

    if (distance < 62 && this.isWaveCleared === true) { // and if its witihin range and the wave is clear
      console.log("your shoppin, good jobbin"); // console print (For debugging)
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
    this.Mine.visible = visibility;
    this.armourT1.visible = visibility;// make vest invisible and visible when it needs to be
    this.armourT2.visible = visibility;// make jacket invisible and visible when it needs to be
    this.armourB1.visible = visibility;// make jeans invisible and visible when it needs to be
    this.armourB2.visible = visibility;// make shoes invisible and visible when it needs to be

    //this.clothes.visible = visibility;

    this.shopSmg.inputEnabled = true;// allows imput on smg
    this.shopSmg.events.onInputDown.add(()=>{
      if(this.canBuyItem === false)
        return;

      if (this.score < this.guns.Smg.cost) { // your score(money) must be higher than the cost of the weapon to by
          console.log("cant afford")
          return;
      }

      this.changeGun(this.guns.Smg); // on click change to gun
      this.score -= this.guns.Smg.cost
      this.scoreDisplay.text = `Money £${this.score}`;
      this.canBuyItem = false;
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this);
    }); // function to change gun

      this.shopShotgun.inputEnabled = true; // allows imput on shotgun
      this.shopShotgun.events.onInputDown.add(()=>{
      if(this.canBuyItem === false)
      return;

      if (this.score < this.guns.Shotgun.cost) { // your score(money) must be higher than the cost of the weapon to by
        console.log("cant afford")
        return;
      }

      this.changeGun(this.guns.Shotgun); // on click change to gun
      this.score -= this.guns.Shotgun.cost
      this.scoreDisplay.text = `Money £${this.score}`;
      this.canBuyItem = false;
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this);
    }); // function to change gun

    this.shopSniper.inputEnabled = true; // allows imput on sniper
    this.shopSniper.events.onInputDown.add(()=>{
      if(this.canBuyItem === false)
      return;

      if (this.score < this.guns.Sniper.cost) { // your score(money) must be higher than the cost of the weapon to by
        console.log("cant afford")
        return;
      }

      this.changeGun(this.guns.Sniper); // on click change to gun
      this.score -= this.guns.Sniper.cost
      this.scoreDisplay.text = `Money £${this.score}`;
      this.canBuyItem = false;
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this);
    }); // function to change gun

    this.Mine.inputEnabled = true; // allows imput on sniper
    this.Mine.events.onInputDown.add(()=>{
      if(this.canBuyItem === false)
        return;

      if(this.score < this.mineCost)
        return;

        this.score -= this.mineCost;
        this.scoreDisplay.text = `Money £${this.score}`;
      this.mineCount ++;
      this.mineDisplay.text = `Mines :${this.mineCount}`;
      this.canBuyItem = false;
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this);
    }); // on click change to gun

    this.armourB1.inputEnabled = true; // allows imput on jeans
    this.armourB1.events.onInputDown.add(()=>{
      if(this.canBuyItem === false)
        return;

      if (this.score < this.armour.Jeans.cost) { // your score(money) must be higher than the cost of the weapon to by
        console.log("cant afford")
        return;
      }

      this.changeClothes(this.armour.Jeans ); // on click change to gun
      this.score -= this.armour.Jeans.cost
      this.scoreDisplay.text = `Money £${this.score}`;
      this.canBuyItem = false;
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this);
    });

    this.armourB2.inputEnabled = true; // allows imput on shoes
    this.armourB2.events.onInputDown.add(()=>{
      if(this.canBuyItem === false)
        return;

      if (this.score < this.armour.Shoes.cost) { // your score(money) must be higher than the cost of the weapon to by
        console.log("cant afford")
        return;
      }

      this.changeClothes(this.armour.Shoes ); // on click change to gun
      this.score -= this.armour.Shoes.cost
      this.scoreDisplay.text = `Money £${this.score}`;
      this.canBuyItem = false;
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this);
    });// click on to equip

    this.armourT1.inputEnabled = true; // allows imput on vest
    this.armourT1.events.onInputDown.add(()=>{
      if(this.canBuyItem === false)
      return;

      if (this.score < this.armour.Shirt.cost) { // your score(money) must be higher than the cost of the weapon to by
        console.log("cant afford")
        return;
      }

      this.changeClothes(this.armour.Shirt ); // on click change to gun
      this.score -= this.armour.Shirt.cost
      this.scoreDisplay.text = `Money £${this.score}`;
      this.canBuyItem = false;
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this);
    });// click on to equip

    this.armourT2.inputEnabled = true; // allows imput on jacket
    this.armourT2.events.onInputDown.add(()=>{if(this.canBuyItem === false)
      return;
      if (this.score < this.armour.Jacket.cost) { // your score(money) must be higher than the cost of the weapon to by
        console.log("cant afford")
        return;
      }

      this.changeClothes(this.armour.Jacket ); // on click change to gun
      this.score -= this.armour.Jacket.cost
      this.scoreDisplay.text = `Money £${this.score}`;
      this.canBuyItem = false;
      game.time.events.add(Phaser.Timer.SECOND * 0.2, ()=>{ this.canBuyItem = true; }, this);
    });// click on to equip

    //this.clothes.inputEnabled = true;
    //this.clothes.events.onInputDown.add(()=>{this.changeClothes(this.armour.Jeans);});

  },

  changeClothes: function(armour){ // sets function c
      if(armour.sprite === null) // if there is no gun
        armour.sprite = game.add.sprite(this.man.position.x, this.man.position.y, armour.spriteName, this.health ++, console.log(this.health)); // add clicked on armour, add to health, and print health in the console

        //if(armour === this.armourT1) {
        //  }

    this.boughtArmour.push(armour); // add this armour to the array
    this.updateHealth(); // calls update health function

  },

  changeGun: function (gun) { // function to change gun

    if(this.currentGun.sprite != null){
      this.currentGun.sprite.kill(); // kill currant gun
    } // if gun is null

    this.currentGun = gun; // and becoms new gun
    this.currentGun.isBought = true;
    gun.sprite = game.add.sprite(this.man.position.x, this.man.position.y, gun.spriteName); // attach gun to man/character
    this.timeBetweenShots = 1/(gun.roundsPerMinute / 60000); // minute into milliseconds (60 seconds and 60,000 milliseconds)
    this.fireSound = game.add.audio(gun.soundName); // change gun soung to selected gun sound
    gun.sound = this.fireSound; // change gun soung to selected gun sound

  },


  update: function () { // function that updates each frame
    this.isWaveCleared = (this.zombies.countLiving() == 0); //

    game.physics.arcade.overlap(this.bullets, this.zombies, this.hit, null, this); // when a bullet touches a zombie, run hit function
    game.physics.arcade.overlap(this.mines, this.zombies, this.hitMine, null, this);
  //  game.physics.arcade.overlap(this.zombies, this.man, this.manGotHit, null, this);


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
        zombie.kill(); // destroy the zombie
          this.health --; // take away health
          console.log(this.health); // paste health in console
          this.updateHealth(); // call update health
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

    if (this.cursors.down.isDown) {
      this.placeMine();

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

    if(game.input.keyboard.justPressed(Phaser.Keyboard.ONE)) {
      console.log("you did it");
      if(this.guns.Pistol.isBought === true) {
        this.changeGun(this.guns.Pistol);
      }
    }
    else if(game.input.keyboard.justPressed(Phaser.Keyboard.TWO)) {
      console.log("u did it");
      if(this.guns.Smg.isBought === true) {
        this.changeGun(this.guns.Smg);
      }
    }
    else if(game.input.keyboard.justPressed(Phaser.Keyboard.THREE)) {
      console.log("woo did it");
      if(this.guns.Shotgun.isBought === true) {
        this.changeGun(this.guns.Shotgun);
      }
    }
    else if(game.input.keyboard.justPressed(Phaser.Keyboard.FOUR)) {
      console.log("coo did it");
      if(this.guns.Sniper.isBought === true) {
        this.changeGun(this.guns.Sniper);
      }
    }
    else if(game.input.keyboard.justPressed(Phaser.Keyboard.FIVE)) {
      console.log("who did it?");
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
      'gg');
      game.input.onDown.add(() => { game.state.start('main'); }); // on mouse click, load mainstate (restart game)
    }
  };

  const wonState = { // game over state
    preload: function () { // load in assets before game starts
      game.load.image('win', 'assets/win.png'); // load image
    },
    create: function () {  // static code
    game.add.image(0, 0, "win")
  }
  };

  const game = new Phaser.Game(1280, 720); // Phaser game in 720p
  game.state.add('main', mainState); // add mainState
  game.state.add('gameover', gameoverState);  // add gameover
  game.state.add('won', wonState );
  game.state.start('main'); // start main
