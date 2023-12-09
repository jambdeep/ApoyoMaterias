// Declaración de variables
var level = 2;
var playerMulti = 2;
var player = "";
var player2 = "";
var stars = "";
var bombs = "";
var scoreText = "";
var scoreTextPlayer2 = "";
var musicStart = true;
var goLeftP1 = false;
var goLeftP2 = false;
var goRightP1 = false;
var goRightP2 = false;
var goUpP1 = false;
var goUpP2 = false;

class MainScene extends Phaser.Scene{
    constructor(){
        super('gameScene');
    }

    preload(){

    }

    create(){
        if (musicStart){
            musicStart = false;
            const music = this.sound.add('musica');
            music.play({
                volume: 0.25,
                loop: true,
            })
        }
        this.add.image(640, 360, 'fondo');
        // Construcción de piso para todos los niveles
        var platforms = this.physics.add.staticGroup();
        platforms.create(184, 686, 'plarga');
        platforms.create(368, 686, 'plarga');
        platforms.create(552, 686, 'plarga');
        platforms.create(736, 686, 'plarga');
        platforms.create(920, 686, 'plarga');
        platforms.create(1104, 686, 'plarga');

        // Construcción de niveles
        if ( level == 1){
            platforms.create(500, 500, 'plarga');
            platforms.create(800, 350, 'pcorta');
            platforms.create(1000, 250, 'pcorta');
        }else if(level == 2){
            platforms.create(770, 180, 'plarga');
            platforms.create(500, 350, 'pcorta');        
            platforms.create(300, 500, 'pcorta');        
            platforms.create(1100, 400, 'pcorta');        
        }

        // Inicialización de jugador1
        player = this.physics.add.sprite(1200,50,'male').setScale(1.5);        
        player.setCollideWorldBounds(true);
        player.setBounce(0.2);        
        this.physics.add.collider(player, platforms);       

        // Inicialización de jugador2
        if (playerMulti == 2){
            player2 = this.physics.add.sprite(1250,50,'zmale').setScale(1.5);            
            player2.setCollideWorldBounds(true);
            player2.setBounce(0.2);            
            this.physics.add.collider(player2, platforms);
        }

        // Inicialización estrellas
        stars = this.physics.add.group({
            key: 'estrella',
            repeat: 8,
            setXY: { x:350, y:0, stepX: 100}
        });
        // Colisión estrellas y plataformas
        this.physics.add.collider(stars, platforms);
        stars.children.iterate(function(child){
            child.setBounce(0.3);
        });

        // Objetivo del juego (Recolectar estrellas)
        this.physics.add.overlap(player, stars, collectStar, null, this);
        if (playerMulti == 2){
            this.physics.add.overlap(player2, stars, collectStarPlayer2, null, this);
        }

        // Recolección de estrellas
        function collectStar (player, estrella){            
            player.score += 10;
            colliderStar(estrella, this);
            scoreText.setText('Score: '+ player.score);            
        }
        function collectStarPlayer2 (player2, estrella){                
            player2.score += 10;
            colliderStar(estrella, this);
            scoreTextPlayer2.setText('Score: ' + player2.score);            
        }   
        function colliderStar (estrella, context){
            const musicPuntos = context.sound.add('puntos');
            musicPuntos.play({
                volume: 1,
                loop: false,
            });
            estrella.disableBody(true, true);
            if (stars.countActive(true) === 0){
                var bomba = bombs.create(Phaser.Math.Between(0,800),16,'bomba');
                bomba.setBounce(1);
                bomba.setCollideWorldBounds(true);
                bomba.setVelocity(Phaser.Math.Between(-400*level, 400*level), 20);
                stars.children.iterate(function (child){
                    child.enableBody(true, child.x, 0, true, true);
                });
            }
        }

        // Inicialización bombas
        bombs = this.physics.add.group();
        this.physics.add.collider(bombs, platforms);
        // Efectos de las colisiones con bombas         
        this.physics.add.collider(player, bombs, hitBomb, null, this);
        this.physics.add.collider(player2, bombs, hitBomb, null, this);
        function hitBomb (element, bomb) {
            const musicCrash = this.sound.add('kaboom');
            musicCrash.play({
                volume: 1,
                loop: false,
            });            
            if (playerMulti == 1) {
                this.physics.pause();
                player.setTint(0xff0000);
                player.anims.play('turn');
                this.time.addEvent({
                    delay: 1500,
                    loop: false,
                    callback: () => {
                        this.scene.start("endScene");
                    }
                });
            }else {
                if (element.anims.currentFrame.textureKey == "zmale") {
                    if (player2.score - 50 <= 0) {
                        player2.score = 0;
                    }else{
                        player2.score -= 50;
                    }
                    scoreTextPlayer2.setText('Score: ' + player2.score);
                }else {
                    if (player.score - 50 <= 0) {
                        player.score = 0;
                    }else{
                        player.score -= 50;
                    }
                    scoreText.setText('Score: ' + player.score);
                }
            }
        }

        // Inicialización de Marcadores
        player.score = 0;
        scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000'});
        if (playerMulti == 2){
            player2.score = 0;
            scoreTextPlayer2 = this.add.text(1100, 16, 'score: 0', { fontSize: '32px', fill: '#0ff'});
            this.gameTime = 60;
            this.timeTXT = this.add.text(650, 0, this.gameTime, {fontFamily: 'font1', fontSize: '64px', color:'white'});
            this.refreshTime();    
        }     

        // Etiquetas para cada animación
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('male',{ start:0, end:2}),
            frameRate: 10,
            repeat: -1
        });
        // girar
        this.anims.create({
            key: 'turn',
            frames: this.anims.generateFrameNumbers('male',{ start:3, end:5}),
            frameRate: 3,
            repeat: -1
        });    
        // derecha
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('male',{ start:6, end:8}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'leftP2',
            frames: this.anims.generateFrameNumbers('zmale', { start: 0, end: 2}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turnP2',            
            frames: this.anims.generateFrameNumbers('zmale', { start: 3, end: 5}),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: 'rightP2',
            frames: this.anims.generateFrameNumbers('zmale', { start: 6, end: 8}),
            frameRate: 10,
            repeat: -1
        });
        
        /* MOBILE CONTROLS */
        if (screen.width <= 900) {
            var cp01 = this.add.image(100, 650, 'controlsPlayer1').setScale(2);
            cp01.alpha = 0.5;
            const leftOptionP1 = this.add.zone(5, 655, 60, 60);
            leftOptionP1.setOrigin(0);
            leftOptionP1.setInteractive();
            leftOptionP1.on('pointerdown', () => setLeftP1(true));
            leftOptionP1.on('pointerup', () => setLeftP1(false));
            leftOptionP1.on('pointerout', () => setLeftP1(false));
            this.add.graphics().lineStyle(2, 0xff0000).strokeRectShape(leftOptionP1);

            const rightOptionP1 = this.add.zone(135, 655, 60, 60);
            rightOptionP1.setOrigin(0);
            rightOptionP1.setInteractive();
            rightOptionP1.on('pointerdown', () => setRightP1(true));
            rightOptionP1.on('pointerup', () => setRightP1(false));
            rightOptionP1.on('pointerout', () => setRightP1(false));
            this.add.graphics().lineStyle(2, 0xff0000).strokeRectShape(rightOptionP1);

            const upOptionP1 = this.add.zone(70, 590, 60, 60);
            upOptionP1.setOrigin(0);
            upOptionP1.setInteractive();
            upOptionP1.on('pointerdown', () => setUpP1(true));
            upOptionP1.on('pointerup', () => setUpP1(false));
            upOptionP1.on('pointerout', () => setUpP1(false));
            this.add.graphics().lineStyle(2, 0xff0000).strokeRectShape(upOptionP1);

            if (playerMulti == 2) {
                var cp02 = this.add.image(1190, 650, 'controlsPlayer2').setScale(2);
                cp02.alpha = 0.5;
                const leftOptionP2 = this.add.zone(1095, 655, 60, 60);
                leftOptionP2.setOrigin(0);
                leftOptionP2.setInteractive();
                leftOptionP2.on('pointerdown', () => setLeftP2(true));
                leftOptionP2.on('pointerup', () => setLeftP2(false));
                leftOptionP2.on('pointerout', () => setLeftP2(false));
                this.add.graphics().lineStyle(2, 0xff0000).strokeRectShape(leftOptionP2);

                const rightOptionP2 = this.add.zone(1220, 655, 60, 60);
                rightOptionP2.setOrigin(0);
                rightOptionP2.setInteractive();
                rightOptionP2.on('pointerdown', () => setRightP2(true));
                rightOptionP2.on('pointerup', () => setRightP2(false));
                rightOptionP2.on('pointerout', () => setRightP2(false));
                this.add.graphics().lineStyle(2, 0xff0000).strokeRectShape(rightOptionP2);

                const upOptionP2 = this.add.zone(1160, 590, 60, 60);
                upOptionP2.setOrigin(0);
                upOptionP2.setInteractive();
                upOptionP2.on('pointerdown', () => setUpP2(true));
                upOptionP2.on('pointerup', () => setUpP2(false));
                upOptionP2.on('pointerout', () => setUpP2(false));
                this.add.graphics().lineStyle(2, 0xff0000).strokeRectShape(upOptionP2);
            }

            function setLeftP1(status) {
                goLeftP1 = status;
            }

            function setLeftP2(status) {
                goLeftP2 = status;
            }

            function setRightP1(status) {
                goRightP1 = status;
            }

            function setRightP2(status) {
                goRightP2 = status;
            }

            function setUpP1(status) {
                goUpP1 = status;
            }

            function setUpP2(status) {
                goUpP2 = status;
            }
        }
        /* END MOBILE CONTROLS */        
        
        
    }

    // Inicialización de temporizador
    refreshTime() {
        this.gameTime--;
        this.timeTXT.setText(this.gameTime);
        if (this.gameTime === 0) {
            this.physics.pause();
            player.setTint(0xff00ff);
            player2.setTint(0xff00ff);

            this.time.addEvent({
                delay: 1500,
                loop: false,
                callback: () => {
                    this.scene.start("endScene");
                }
            })
        }else {
            this.time.delayedCall(1000, this.refreshTime, [], this);
        }
    }

    // Actualización de teclas presionadas y su movimiento
    update(){
        var cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown || goLeftP1){
            player.setVelocityX(-160); 
            player.anims.play('left', true);           
        }else if (cursors.right.isDown || goRightP1){
            player.setVelocityX(160);
            player.anims.play('right', true);            
        }else {
            player.setVelocityX(0);
            player.anims.play('turn', true);            
        }
        if ((cursors.up.isDown || goUpP1) && player.body.touching.down){
            player.setVelocityY(-380);
        }
        if (playerMulti == 2){
            var keyObjUp = this.input.keyboard.addKey('W');
            var player2Up = keyObjUp.isDown;
            var keyObjRight = this.input.keyboard.addKey('D');
            var player2Right = keyObjRight.isDown;
            var keyObjLeft = this.input.keyboard.addKey('A');
            var player2Left = keyObjLeft.isDown;
            if (player2Left || goLeftP2){
                player2.setVelocityX(-160); 
                player2.anims.play('leftP2', true);           
            }else if (player2Right || goRightP2){
                player2.setVelocityX(160);            
                player2.anims.play('rightP2', true);           
            }else {
                player2.setVelocityX(0); 
                player2.anims.play('turnP2', true);                      
            }    
            if ((player2Up || goUpP2) && player2.body.touching.down){
                player2.setVelocityY(-380);
            }
        }
        
    }

}

class Menu extends Phaser.Scene{
    constructor(){
        super('menuScene');
    }

    preload(){
        // Directorio raíz
        this.load.baseURL = '/231202';
        // Elementos para la construcción de niveles
        this.load.image('fondo','../img/background.png');
        this.load.image('plarga', '../img/plataformal.png');        
        this.load.image('pcorta', '../img/plataformac.png');        
        this.load.image('estrella', '../img/estrella.png');        
        this.load.image('bomba', '../img/bomba.png');        
        // Controles para jugadores
        this.load.image('controlsPlayer1', '../img/keysp01.png');    
        this.load.image('controlsPlayer2', '../img/keysp02.png');            
        // Elementos para Personajes 
        this.load.spritesheet('male','../img/personaje01.png', {frameWidth: 32, frameHeight: 50});
        this.load.spritesheet('zmale','../img/personaje02.png', {frameWidth: 32, frameHeight: 50});  
        // Elementos de audio 
        this.load.audio('musica', '../sounds/themesong.mp3');  
        this.load.audio('puntos', '../sounds/coin.wav');  
        this.load.audio('kaboom', '../sounds/kaboom.mp3');  
        // Elementos de escena final
        this.load.image('fondofinal','../img/background_ant.png');
        this.load.image('estrellas','../img/estrellas.png');
        this.load.image('logo','../img/logo.png');
        this.load.image('player01','../img/player01.png'); 
        // Escena Menu
        //https://nectanebo.itch.io/menu-buttons
        //https://www.1001fonts.com/search.html?search=zombie
        this.load.image('botonesmenu','../img/botones.png');          
    }

    create(){
        this.add.image(640,380,'fondofinal');
        this.add.image(650,580,'player01').setScale(0.6);
        this.add.image(400,200,'logo').setScale(0.3);
        this.add.image(950,400,'botonesmenu').setScale(1.4);

        // INICIO ===> Crear zonas
        const startOption = this.add.zone(825, 155, 250, 110);
        startOption.setOrigin(0);
        startOption.setInteractive();
        startOption.once('pointerdown', ()=> this.redirectScene('gameScene'));
        // this.add.graphics().lineStyle(2, 0xff0000).strokeRectShape(startOption);

        // NIVEL ===> Crear zonas
        const levelOption = this.add.zone(825, 275, 250, 110);
        levelOption.setOrigin(0);
        levelOption.setInteractive();
        levelOption.once('pointerdown', ()=> this.redirectScene('levelScene'));
        // this.add.graphics().lineStyle(2, 0xff0000).strokeRectShape(levelOption);

        // MODO ===> Crear zonas
        const modoOption = this.add.zone(825, 390, 250, 110);
        modoOption.setOrigin(0);
        modoOption.setInteractive();
        modoOption.once('pointerdown', ()=> this.redirectScene('modeScene'));
        // this.add.graphics().lineStyle(2, 0xff0000).strokeRectShape(modoOption);

        // CONTROLES ===> Crear zonas
        const controlesOption = this.add.zone(825, 505, 250, 110);
        controlesOption.setOrigin(0);
        controlesOption.setInteractive();
        controlesOption.once('pointerdown', ()=> this.redirectScene('controlsScene'));
        // this.add.graphics().lineStyle(2, 0xff0000).strokeRectShape(controlesOption);
    }

    redirectScene(sceneName){
        this.scene.start(sceneName);
    }

    update(){
        
    }

}

class Level extends Phaser.Scene{
    constructor(){
        super('levelScene');
    }

    preload(){
        
    }

    create(){
        
    }

    update(){
        
    }

}

class Mode extends Phaser.Scene{
    constructor(){
        super('modeScene');
    }

    preload(){
        
    }

    create(){
        
    }

    update(){
        
    }

}

class Controls extends Phaser.Scene{
    constructor(){
        super('controlsScene');
    }

    preload(){
        
    }

    create(){
        
    }

    update(){
        
    }

}

class EndGame extends Phaser.Scene{
    constructor(){
        super('endScene');
    }

    preload(){
    
    }

    create(){
        this.add.image(640,380,'fondofinal');
        this.add.image(300,200,'estrellas').setScale(0.7);
        this.add.image(600,200,'estrellas').setScale(0.4);
        this.add.image(400,450,'estrellas').setScale(0.5);
        this.add.image(300,550,'player01').setScale(0.6);
        this.add.image(1000,180,'logo').setScale(0.3);

        this.add.text(750, 350, 'Player 1: ' + player.score + ' Points', {fontSize: '32px', fill: '#ff00ff'});
        if (playerMulti == 2){
            this.add.text(750, 390, 'Player 2: ' + player2.score + ' Points', {fontSize: '32px', fill: '#00ffff'});
        }    
        
    }

    update(){
        
    }

}


// 3) Configuración base del videojuego
const config={
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    // Array que indica el orden de visualización del vj
    scene: [Menu, MainScene, Level, Mode, Controls, EndGame],
    scale: {
        mode: Phaser.Scale.FIT
    },physics:{
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                y : 300,
            },
        },
    },
}
// 4) Inicialización de Phaser
new Phaser.Game(config);

