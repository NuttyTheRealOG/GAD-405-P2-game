const mainState = {

  create: function () {
    game.stage.backgroundColor = '#2d2d2d';
    this.background = game.add.sprite(0, 0, 'background');

    this.man = game.add.sprite(400, 105, 'man');
    this.pistol = game.add.sprite(this.man.position.x, this.man.position.y, 'pistol');
    game.physics.enable(this.man, Phaser.Physics.ARCADE);

    this.isPaused = false;

//zombie---------------------------------------------

    this.zombies = game.add.group();
    this.zombies.enableBody = true;
    this.zombies.physicsBodyType = Phaser.Physics.ARCADE;

    this.waveSpawn();

    this.zombieMoveSpeed = 0.1;

//zombie---------------------------------------------

    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

    for (let i = 0; i < 20; i++) {
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
    this.scoreDisplay = game.add.text(200, 20, `Score: ${this.score} \nHighScore: ${this.highScore}`, { font: '30px Arial', fill: '#ffffff' });

    this.fireSound = game.add.audio('pistol');

    this.cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
  },

  waveSpawn: function ()  {
    this.zombieMoveSpeed += 0.075;
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
  },



  fire: function () {
    if (game.time.now > this.bulletTime) {
      this.fireSound.play();
      let bullet = this.bullets.getFirstExists(false);
      if (bullet) {
        bullet.reset(this.pistol.x + (this.pistol.width - 50), this.pistol.y - (this.pistol.height -110));
        bullet.body.velocity.y = 1500;
        this.bulletTime = game.time.now + 150;
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
    this.scoreDisplay.text = `Score: ${this.score} \nHighScore: ${this.highScore}`;
  },

  preload: function () {
    game.load.image('ship', 'assets/ship.png');
    game.load.spritesheet('zss', 'assets/ZSS.png', 64, 64, 2);
    game.load.image('bullet', 'assets/bullet.png');
    game.load.spritesheet('explode', 'assets/explode.png', 128, 128);
    game.load.audio('fire', 'assets/fire.mp3');

    game.load.audio('pistol', 'assets/Soundz/Pistol.mp3');

    game.load.image('background', 'assets/background.png');

    game.load.image('man', 'assets/Naked Man.png');
    game.load.image('pistol', 'assets/Gunz/Pistol.png');
  },

  GotHit: function (zombie, man) {
    this.explosion.reset(this.man.x + (this.man.width / 2), this.man.y + (this.man.height / 2));
    this.man.kill();
    this.explosion.animations.play('boom');
  },

  update: function () {
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
      if (this.man.position.x < 1280 - distFromSides - 75) {
        this.man.body.velocity.x = 300;
      }
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      this.fire();
    }


    this.pistol.position = this.man.position;
  },

// guns

  pistol: function () {

  },

  smg: function() {

  },

  shotgun: function() {

  },

  sniper: function() {

  }

// guns


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
