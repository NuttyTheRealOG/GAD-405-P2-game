const mainState = {

  create: function () {
    game.stage.backgroundColor = '#2d2d2d';
    this.background = game.add.sprite(0, 0, 'background');

    this.man = game.add.sprite(400, 105, 'man');
    //this.pistol = game.add.sprite(this.man.position.x, this.man.position.y, 'pistol');
    game.physics.enable(this.man, Phaser.Physics.ARCADE);

    this.isPaused = false;
    this.isWaveCleared = false;

    this.guns = {
      Pistol : {
        reloadTime : 0.7,
        roundsPerMinute : 175,
        magazineSize : 12,
        cost : 0,
        sprite : null,
        spriteName : "pistol",
        sound : null,
        soundName : "pistol_s"
      },
      Smg : {
        reloadTime : 1.6,
        roundsPerMinute : 600,
        magazineSize : 25,
        cost : 250,
        sprite : null,
        spriteName : "smg",
        sound : null,
        soundName : "smg_s"
      },
      Shotgun : {
        reloadTime : 2,
        roundsPerMinute : 30,
        magazineSize : 8,
        cost : 500,
        sprite : null,
        spriteName : "shotgun",
        sound : null,
        soundName : "shotgun_s"
      },
      Sniper : {
        reloadTime : 1,
        roundsPerMinute : 45,
        magazineSize : 15,
        cost : 750,
        sprite : null,
        spriteName : "sniper",
        sound : null,
        soundName : "sniper_s"
      }
    };
    this.currentGun = this.guns.Pistol;
    this.timeBetweenShots = 1/(this.currentGun / 60000); // minute into milliseconds (60 seconds and 60,000 milliseconds)
    this.gunSound

    this.changeGun(this.currentGun);

    console.log(this.guns.Pistol);

    //zombie---------------------------------------------

    this.zombies = game.add.group();
    this.zombies.enableBody = true;
    this.zombies.physicsBodyType = Phaser.Physics.ARCADE;

    this.waveSpawn();

    this.zombieMoveSpeed = 0.1;
    this.zombieMoveSpeedIncrease = 0.075;

    //zombie---------------------------------------------

    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

    for (let i = 0; i < 40; i++) {
      let b = this.bullets.create(0, 0, 'bullet');
      b.exists = false;
      b.visible = false;
      b.checkWorldBounds = true;
      b.events.onOutOfBounds.add((bullet) => { bullet.kill(); });
    }

    this.bulletTime = 0;

    this.explosion = this.game.add.sprite(0, 0, 'explode');
    this.explosion.exists = false;
    this.explosion.visible = false;
    // this.explosion.frame = 6; // show one frame of the spritesheet
    this.explosion.anchor.x = 0.5;
    this.explosion.anchor.y = 0.5;
    this.explosion.animations.add('boom');

    this.highScore = localStorage.getItem('invadershighscore');
    if (this.highScore === null) {
      localStorage.setItem('invadershighscore', 0);
      this.highScore = 0;
    }

    this.score = 0;
    this.scoreDisplay = game.add.text(200, 20, `Money £${this.score} \nHighScore: ${this.highScore}`, { font: '30px Arial', fill: '#ffffff' });


    this.cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

    this.sm = game.add.sprite(1125, 122 , 'sm');

    game.physics.enable(this.sm, Phaser.Physics.ARCADE);
    game.time.events.add(Phaser.Timer.SECOND *5, ()=>{}, this);
    game.add.tween(this.sm.body).to( {y:175}, 1500, Phaser.Easing.Linear.None, true );

    game.add.sprite(0, 0, "sm hole");

    this.shopSprite = game.add.sprite(0, 0, "shop");
    this.shopSmg = game.add.sprite(475, 20, "shopSmg");
    this.shopShotgun = game.add.sprite(675, 20, "shopShotgun");
    this.shopSniper = game.add.sprite(875, 20, "shopSniper");
    this.adjustShopVisibility(false);
  },

  waveSpawn: function ()  {
    let spawn = function(){
      this.zombieMoveSpeed += this.zombieMoveSpeedIncrease;
      for (let i = 0; i < 28; i++) {
        let c = this.zombies.create(105 + (i % 4) * 90, 350 + Math.floor(i / 8) * 80, 'zss');
        c.body.immovable = true;

        c.animations.add('crawl', [0,1], 3, true);
        c.animations.play("crawl");
      }
      for (let i = 0; i < 30; i++) {
        let c = this.zombies.create(580 + (i % 6) * 90, 350 + Math.floor(i / 8) * 80, 'zss');
        c.body.immovable = true;

        c.animations.add('crawl', [0,1], 3, true);
        c.animations.play("crawl");
      }
    };

    game.time.events.add(Phaser.Timer.SECOND *8, spawn, this);
  },

  fire: function () {
    if (game.time.now > this.bulletTime) {
      this.fireSound.play();
      let bullet = this.bullets.getFirstExists(false);
      if (bullet) {
        bullet.reset(this.currentGun.sprite.x + (this.currentGun.sprite.width - 45), this.currentGun.sprite.y - (this.currentGun.sprite.height -130));
        bullet.body.velocity.y = 1500;
        this.bulletTime = game.time.now + this.timeBetweenShots;
      }
    }
  },

  gameOver: function () {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('invadershighscore', this.highScore);
    }
    game.state.start('gameover');
  },

  hit: function (bullet, zss) {
    this.score = this.score + 10;
    bullet.kill();
    zss.kill();
    if (this.zombies.countLiving() === 0) {
      this.score = this.score + 100;
      this.waveSpawn();
      // this.gameOver();
    }

    this.scoreDisplay.text = `Money £${this.score} \nHighScore: ${this.highScore}`;
  },

  preload: function () {
    game.load.spritesheet('zss', 'assets/ZSS.png', 64, 64, 2);

    //misc-----------------------------------------------------
    game.load.image('bullet', 'assets/bullet.png');
    game.load.spritesheet('explode', 'assets/explode.png', 128, 128);
    game.load.image('background', 'assets/background.png');
    game.load.image('man', 'assets/Naked Man.png');
    game.load.image('sm', 'assets/salesman.png');
    game.load.image('sm hole', 'assets/hidey wall.png');
    game.load.image('shop', 'assets/shopscreen.png');
    //misc-----------------------------------------------------

    //sounds----------------------------------------------------
    game.load.audio('pistol_s', 'assets/Soundz/Pistol.mp3');
    game.load.audio('smg_s', 'assets/Soundz/smg.mp3');
    game.load.audio('shotgun_s', 'assets/Soundz/shotty.mp3');
    game.load.audio('sniper_s', 'assets/Soundz/snooiper.mp3');
    //sounds-----------------------------------------------------

    //armour-----------------------------------------------------
    game.load.image('top1', 'assets/armour/top 1.png');
    game.load.image('top2', 'assets/armour/top 2.png');
    game.load.image('bottom 1', 'assets/armour/bottom 1.png');
    game.load.image('bottom 2', 'assets/armour/bottom 2.png');
    //armour-----------------------------------------------------

    //guns-------------------------------------------------------
    game.load.image('pistol', 'assets/Gunz/Pistol.png');
    game.load.image('smg', 'assets/Gunz/SMG.png');
    game.load.image('shotgun', 'assets/Gunz/Shotgun.png');
    game.load.image('sniper', 'assets/Gunz/Sniper.png');
    //guns-------------------------------------------------------

    //shop sprites----------------------------------------------
    game.load.image('shopSmg', 'assets/ShopSprites/smg.png');
    game.load.image('shopShotgun', 'assets/ShopSprites/shotgun.png');
    game.load.image('shopSniper', 'assets/ShopSprites/sniper.png');
    //shop sprites----------------------------------------------
  },

  GotHit: function (zombie, man) {
    this.explosion.reset(this.man.x + (this.man.width / 2), this.man.y + (this.man.height / 2));
    this.man.kill();
    this.explosion.animations.play('boom');
  },

  shop: function () {
    let distance = Math.abs(this.man.x - this.sm.x);

    if (distance < 62 && this.isWaveCleared === true) {
      console.log("your shoppin, good jobbin");
      this.adjustShopVisibility(true);

    }
    else {
      this.adjustShopVisibility(false);
    }
  },

  adjustShopVisibility: function(visibility){
    this.shopSprite.visible = visibility;
    this.shopSmg.visible = visibility
    this.shopShotgun.visible = visibility;
    this.shopSniper.visible = visibility;

    this.shopSmg.inputEnabled = true;
    this.shopSmg.events.onInputDown.add(()=>{ this.changeGun(this.guns.Smg);

     });


    //get gun
    // - Money
    // profit
    this.shopShotgun.inputEnabled = true;
    this.shopShotgun.events.onInputDown.add(()=>{ this.changeGun(this.guns.Shotgun); });

    this.shopSniper.inputEnabled = true;
    this.shopSniper.events.onInputDown.add(()=>{ this.  changeGun(this.guns.Sniper); });

  },

  changeGun: function (gun) {
    if(this.currentGun.sprite != null)
      this.currentGun.sprite.kill();
    this.currentGun = gun;
    gun.sprite = game.add.sprite(this.man.position.x, this.man.position.y, gun.spriteName);
    this.timeBetweenShots = 1/(gun.roundsPerMinute / 60000);
    this.fireSound = game.add.audio(gun.soundName);
    gun.sound = this.fireSound;

  },

  update: function () {
    this.isWaveCleared = (this.zombies.countLiving() == 0);

    game.physics.arcade.overlap(this.bullets, this.zombies, this.hit, null, this);
    game.physics.arcade.overlap(this.zombies, this.man, this.manGotHit, null, this);

    if (game.input.keyboard.justPressed(Phaser.Keyboard.P)) {
      this.isPaused = !this.isPaused;
      console.log('Pause toggled');
    }

    if (this.isPaused === true) {
      // Now paused
      this.zombies.forEach((zombie)=>{
        zombie.animations.stop();
      });
    }
    else {
      // Now unpaused
      this.zombies.forEach((zombie) => {
        zombie.animations.play('crawl');
      });
    }

    if(this.isPaused === true){
      return;
    }

    this.man.body.velocity.x = 0;
    this.zombies.forEach(
      (zombie) => {
        zombie.body.position.y = zombie.body.position.y - this.zombieMoveSpeed;
        if (zombie.y + zombie.height < 200) { this.gameOver(); }
      }
    );

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

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      this.fire();
    }

    this.currentGun.sprite.position = this.man.position;

    if (this.isWaveCleared ===  false) {
       game.add.tween(this.sm.body).to( {y:175}, 500, Phaser.Easing.Linear.None, true );

     }
     else {
       game.add.tween(this.sm.body).to( {y:122}, 500, Phaser.Easing.Linear.None, true );
    }
    //this.adjustShopVisibility(this.isWaveCleared);

    this.shop();
  },


};

const gameoverState = {
  preload: function () {
    game.load.image('gg', 'assets/gg no re.png');
  },
  create: function () {
    const gameOverImg = game.cache.getImage('gg');
    game.add.sprite(
      game.world.centerX - gameOverImg.width / 2,
      game.world.centerY - gameOverImg.height / 2,
      'gg');
      game.input.onDown.add(() => { game.state.start('main'); });
    }
  };

  const game = new Phaser.Game(1280, 720);
  game.state.add('main', mainState);
  game.state.add('gameover', gameoverState);
  game.state.start('main');
