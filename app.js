const mainState = { // create main scean

  create: function () { // static code
    game.stage.backgroundColor = '#2d2d2d'; // colour load in before background image loads, mostly used to be sure the program is running
    this.background = game.add.sprite(0, 0, 'background'); // add the background

    this.man = game.add.sprite(400, 105, 'man'); // add the main character
    //this.pistol = game.add.sprite(this.man.position.x, this.man.position.y, 'pistol');
    game.physics.enable(this.man, Phaser.Physics.ARCADE); // give the sprite physics (collider body)

    this.isPaused = false; // boolean for pausing game
    this.isWaveCleared = false; // boolean for wave interval
    this.clothesBought = 0;
    this.health = 1;


    this.guns = { // class for weapons
        Pistol : { // weapon name
        reloadTime : 0.7, // reload time of gun
        roundsPerMinute : 175, // rounds per min of gun
        magazineSize : 12, // ammount of bullets untill reload of gun
        cost : 0, // gun cost
        sprite : null, // sprite doesnt load in at start
        spriteName : "pistol", // sprite it will use
        sound : null, // sound doesnt load in at start
        soundName : "pistol_s"  // sound it will use
      },
      Smg : { // weapon name of gun
        reloadTime : 1.6, // reload time of gun
        roundsPerMinute : 600, // rounds per min of gun
        magazineSize : 25, // ammount of bullets untill reload of gun
        cost : 0, // gun cost
        sprite : null,// doesnt load in at start
        spriteName : "smg", // sprite it will use
        sound : null, // sound doesnt load in at start
        soundName : "smg_s" // sound it will use
      },
      Shotgun : { // weapon name of gun
        reloadTime : 2, // reload time of gun
        roundsPerMinute : 50, // rounds per min of gun
        magazineSize : 8, // ammount of bullets untill reload of gun
        cost : 0, // gun cost
        sprite : null,// doesnt load in at start
        spriteName : "shotgun", // sprite it will use
        sound : null, // sound doesnt load in at start
        soundName : "shotgun_s" // sound it will use
      },
      Sniper : { // weapon name of gun
        reloadTime : 1, // reload time of gun
        roundsPerMinute : 60, // rounds per min of gun
        magazineSize : 15, // ammount of bullets untill reload of gun
        cost : 0, // gun cost
        sprite : null,// doesnt load in at start
        spriteName : "sniper", // sprite it will use
        sound : null, // sound doesnt load in at start
        soundName : "sniper_s" // sound it will use
      }
    };
    this.currentGun = this.guns.Pistol; // sets the starting gun to the pistol
    this.timeBetweenShots = 1/(this.currentGun / 60000); // minute into milliseconds (60 seconds and 60,000 milliseconds)


    this.changeGun(this.currentGun); // changes the gun on event


    this.armour = {
      Jeans : {
        sprite : null,
        spriteName : "bottom1",
        healthBouns: 1,
        cost : 250,
      },

      Shirt : {
        sprite : null,
        spriteName : "top1",
        healthBouns: 1,
        cost : 500,
      },

      Shoes : {
        sprite : null,
        spriteName : "bottom2",
        healthBouns: 1,
        cost : 750,
      },

      Jacket : {
        sprite : null,
        spriteName : "top2",
        healthBouns: 1,
        cost : 1000
      }
    }
this.boughtArmour = [];




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

    for (let i = 0; i < 40; i++) { // create up tp 40 bullets
      let b = this.bullets.create(0, 0, 'bullet');
      b.exists = false; // sprite doesnt exist
      b.visible = false;  // sprite is invisible
      b.checkWorldBounds = true; // will see if bullet is out of canvas
      b.events.onOutOfBounds.add((bullet) => { bullet.kill(); }); // will kill bullet if it is out of canvas
    }

    this.bulletTime = 0; //
/* can go
    this.explosion = this.game.add.sprite(0, 0, 'explode');
    this.explosion.exists = false;
    this.explosion.visible = false;
    // this.explosion.frame = 6; // show one frame of the spritesheet
    this.explosion.anchor.x = 0.5;
    this.explosion.anchor.y = 0.5;
    this.explosion.animations.add('boom');
*/

// score stuff i bearly understand-------------------------------------------



    this.score = 0;
    this.scoreDisplay = game.add.text(1100, 20, `Money £${this.score}`, { font: '30px Arial', fill: '#584f99' });
// score stuff i bearly understand-------------------------------------------

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
    this.shopShotgun = game.add.sprite(595, 20, "shopShotgun"); // add specific gun icon
    this.shopSniper = game.add.sprite(740, 20, "shopSniper"); // add specific gun icon

    //this.clothes = game.add.sprite( 845, 20, "clothes");

    this.armourT1 = game.add.sprite(875, 20,"armourT1")
    this.armourT2 = game.add.sprite(925, 20,"armourT2")
    this.armourB1 = game.add.sprite(875, 60,"armourB1")
    this.armourB2 = game.add.sprite(925, 65,"armourB2")



    this.adjustShopVisibility(false); // make above sprites invisible

// the shop---------------------------------------------------------------

this.armourt1 = game.add.group();
this.armourb1 = game.add.group();
this.armourt2 = game.add.group();
this.armourb2 = game.add.group();

  this.fullHealth = game.add.group()

  //game.add.sprite(10, 10, "heart")

  this.updateHealth();

  },

  waveSpawn: function ()  { // create function wavespawn
    let spawn = function(){ // create spawn function
      this.zombieMoveSpeed += this.zombieMoveSpeedIncrease; // increase enemys speed
      for (let i = 0; i < 16; i++) { // create 28 zombies
        let c = this.zombies.create(105 + (i % 4) * 90, 350 + Math.floor(i / 4) * 80, 'zss'); // set there starting postion
        c.body.immovable = true;

        c.animations.add('crawl', [0,1], 3, true); // add frames of sprite sheet
        c.animations.play("crawl"); // play animation
      }

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

  updateHealth: function() {
    this.fullHealth.forEach((hp)=>{
      hp.destroy();
    });

    for (let i = 0; i < this.health; i++) {
      let j = this.fullHealth.create(i * 70, 0, 'heart');
    }
  },

  fire: function () { // the shooting function
    if (game.time.now > this.bulletTime) { //
      this.fireSound.play(); // play the gun sound
      let bullet = this.bullets.getFirstExists(false);
      if (bullet && this.currentGun == this.guns.Shotgun) { // if this is true
        bullet.reset(this.currentGun.sprite.x + (this.currentGun.sprite.width - 45), this.currentGun.sprite.y - (this.currentGun.sprite.height -130)); // set bullet spawn postion starting from the guns postion
        bullet.body.velocity.y = 1500;  bullet.body.velocity.x = 500; // makes bullets move at speed
      }
      let bullet2 = this.bullets.getFirstExists(false);
      if (bullet2 && this.currentGun == this.guns.Shotgun) {
        bullet2.reset(this.currentGun.sprite.x + (this.currentGun.sprite.width - 45), this.currentGun.sprite.y - (this.currentGun.sprite.height -130)); // set bullet spawn postion starting from the guns postion
        bullet2.body.velocity.y = 1500;  bullet2.body.velocity.x = -500; // makes bullets move at speed
        this.bulletTime = game.time.now + this.timeBetweenShots; //
      }
      let bullet3 = this.bullets.getFirstExists(false);
      if (bullet3 && this.currentGun == this.guns.Shotgun) {
        bullet3.reset(this.currentGun.sprite.x + (this.currentGun.sprite.width - 45), this.currentGun.sprite.y - (this.currentGun.sprite.height -130)); // set bullet spawn postion starting from the guns postion
        bullet3.body.velocity.y = 1500; // makes bullets move at speed
        this.bulletTime = game.time.now + this.timeBetweenShots; //
      }
      let bullet4 = this.bullets.getFirstExists(false);
      if (bullet4 && this.currentGun == this.guns.Shotgun) {
        bullet4.reset(this.currentGun.sprite.x + (this.currentGun.sprite.width - 45), this.currentGun.sprite.y - (this.currentGun.sprite.height -130)); // set bullet spawn postion starting from the guns postion
        bullet4.body.velocity.y = 1500; bullet4.body.velocity.x = 1250; // makes bullets move at speed
        this.bulletTime = game.time.now + this.timeBetweenShots; //
      }
      let bullet5 = this.bullets.getFirstExists(false);
      if (bullet5 && this.currentGun == this.guns.Shotgun) {
        bullet5.reset(this.currentGun.sprite.x + (this.currentGun.sprite.width - 45), this.currentGun.sprite.y - (this.currentGun.sprite.height -130)); // set bullet spawn postion starting from the guns postion
        bullet5.body.velocity.y = 1500; bullet5.body.velocity.x = -1250; // makes bullets move at speed
        this.bulletTime = game.time.now + this.timeBetweenShots; //
      }







      else {
        bullet.reset(this.currentGun.sprite.x + (this.currentGun.sprite.width - 45), this.currentGun.sprite.y - (this.currentGun.sprite.height -130)); // set bullet spawn postion starting from the guns postion
        bullet.body.velocity.y = 1500; // makes bullets move at speed
        this.bulletTime = game.time.now + this.timeBetweenShots; //
      }
    }
  },

  gameOver: function () { // create function called game over
    game.state.start('gameover'); // change state to game over screen
  },

  hit: function (bullet, zss) { // create hit function that applys to bullet and zss
    this.score = this.score + Math.floor(Math.random() * 4) + 0   ; // and 10 to score

    if (this.currentGun == this.guns.Pistol || this.currentGun == this.guns.Smg || this.currentGun == this.guns.Shotgun) {
      bullet.kill();
    }

    zss.kill(); // kill the zss
    if (this.zombies.countLiving() === 0) {// when there are no zombies left
      this.score = this.score + 10; // add 100 to score
      this.waveSpawn(); // run wave spawn function
      // this.gameOver();
    }

    this.scoreDisplay.text = `Money £${this.score}`; // displays score and high score
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
    //guns-------------------------------------------------------

    //shop sprites----------------------------------------------
    game.load.image('shopSmg', 'assets/ShopSprites/smg.png'); // load smg shop image
    game.load.image('shopShotgun', 'assets/ShopSprites/shotgun.png');  // load shotgun shop image
    game.load.image('shopSniper', 'assets/ShopSprites/sniper.png');  // load sniper shop image
    game.load.image('clothes', 'assets/ShopSprites/health.png'); // load clothe image


    game.load.image('armourT1', 'assets/ShopSprites/vest.png');
    game.load.image('armourB1', 'assets/ShopSprites/jeans.png');
    game.load.image('armourT2', 'assets/ShopSprites/jacket.png');
    game.load.image('armourB2', 'assets/ShopSprites/shoes.png');
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
    this.shopSprite.visible = visibility; // make shop visible
    this.shopSmg.visible = visibility // make smg visble
    this.shopShotgun.visible = visibility;// make shotgun visible
    this.shopSniper.visible = visibility;// make sniper visible
    this.armourT1.visible = visibility;
    this.armourT2.visible = visibility;
    this.armourB1.visible = visibility;
    this.armourB2.visible = visibility;
    //this.clothes.visible = visibility;

    this.shopSmg.inputEnabled = true;// allows imput on smg
    this.shopSmg.events.onInputDown.add(()=>{ this.changeGun(this.guns.Smg); // on click change to gun

    }); // function to change gun
    this.shopShotgun.inputEnabled = true; // allows imput on shotgun
    this.shopShotgun.events.onInputDown.add(()=>{ this.changeGun(this.guns.Shotgun); }); // on click change to gun

    this.shopSniper.inputEnabled = true; // allows imput on sniper
    this.shopSniper.events.onInputDown.add(()=>{ this.changeGun(this.guns.Sniper); }); // on click change to gun

    this.armourB1.inputEnabled = true;
    this.armourB1.events.onInputDown.add(()=>{this.changeClothes(this.armour.Jeans );});

    this.armourB2.inputEnabled = true;
    this.armourB2.events.onInputDown.add(()=>{this.changeClothes(this.armour.Shoes);});

    this.armourT1.inputEnabled = true;
    this.armourT1.events.onInputDown.add(()=>{this.changeClothes(this.armour.Shirt);});

    this.armourT2.inputEnabled = true;
    this.armourT2.events.onInputDown.add(()=>{this.changeClothes(this.armour.Jacket);});

    //this.clothes.inputEnabled = true;
    //this.clothes.events.onInputDown.add(()=>{this.changeClothes(this.armour.Jeans);});

  },

  changeClothes: function(armour){
    //clothesBought
      if(armour.sprite === null)
        armour.sprite = game.add.sprite(this.man.position.x, this.man.position.y, armour.spriteName, this.health ++, console.log(this.health));

        if(armour === this.armourT1) {


        }

      this.boughtArmour.push(armour);
    //  this.clothesBought = this.clothesBought + 1;
    this.updateHealth();

  },

  changeGun: function (gun) { // function to change gun
    if (this.score < gun.cost) {
      console.log("lol2poor")
      return;
    }
    if(this.currentGun.sprite != null) // if gun is null
      this.currentGun.sprite.kill(); // kill currant gun
    this.currentGun = gun; // and becoms new gun
    gun.sprite = game.add.sprite(this.man.position.x, this.man.position.y, gun.spriteName); // attach gun to man/character
    this.timeBetweenShots = 1/(gun.roundsPerMinute / 60000); // minute into milliseconds (60 seconds and 60,000 milliseconds)
    this.fireSound = game.add.audio(gun.soundName); // change gun soung to selected gun sound
    gun.sound = this.fireSound; // change gun soung to selected gun sound


  },


  update: function () { // function that updates each frame
    this.isWaveCleared = (this.zombies.countLiving() == 0); //

    game.physics.arcade.overlap(this.bullets, this.zombies, this.hit, null, this); // when a bullet touches a zombie, run hit function
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
      (zombie) => {
        zombie.body.position.y = zombie.body.position.y - this.zombieMoveSpeed; // adds incremental speed
        if (zombie.y + zombie.height < 200) {
        zombie.destroy();
          this.health --;
          console.log(this.health);
          this.updateHealth();
        }
      }
    );

    if (this.health <= 0) {
      this.gameOver();
    }

    // Distance in pixels the player can walk from the edge of the screen
    let distFromSides = 50;
    if (this.cursors.left.isDown) {
      if (this.man.position.x > distFromSides) {
        this.man.body.velocity.x = -300 ;
      }
    } else if (this.cursors.right.isDown) {
      // Hardcoded the width of the game, get this somehow
      if (this.man.position.x < 1280 - distFromSides - 170) {
        this.man.body.velocity.x = 300;
      }
    }
// Distance in pixels the player can walk from the edge of the screen

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) { //when spacebar is down
      this.fire(); // run fucntion fire (shoot)
    }

    this.currentGun.sprite.position = this.man.position; // fix gun postion to man/ character
                                    //this.armour.sprite.postion = this.man.position;
    this.boughtArmour.forEach((armour)=>{armour.sprite.position = this.man.position ; });


    if (this.isWaveCleared ===  false) { // if there are zombies remaining
       game.add.tween(this.sm.body).to( {y:175}, 500, Phaser.Easing.Linear.None, true ); // shop keep goes down

     }
     else { // if not
       game.add.tween(this.sm.body).to( {y:122}, 500, Phaser.Easing.Linear.None, true ); // shop keep goes up
    }
    //this.adjustShopVisibility(this.isWaveCleared);

    this.shop(); // runs shop function
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

  const game = new Phaser.Game(1280, 720); // Phaser game in 720p
  game.state.add('main', mainState); // add mainState
  game.state.add('gameover', gameoverState);  // add gameover
  game.state.start('main'); // start main
