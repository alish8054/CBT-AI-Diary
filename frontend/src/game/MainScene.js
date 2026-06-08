import Phaser from 'phaser';
import API_URL from '../api';
import { getAuthItem, getAuthUser } from '../authStorage';





const GRASS_ASSET = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjVEMkRBNTgzNjVGMTFFMjlCNEZCODA0M0RGOUVCN0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjVEMkRBNTkzNjVGMTFFMjlCNEZCODA0M0RGOUVCN0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGNUQyREE1NjM2NUYxMUUyOUI0RkI4MDQzREY5RUI3QSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNUQyREE1NzM2NUYxMUUyOUI0RkI4MDQzREY5RUI3QSIvHjwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+1x5xQwAAAGtQTFRFj4+PkZGRk5OTlJSUlZWVlpaWl5eXmJiYmZmZmpqam5ubnJycnZ2dnp6en5+foKCgoaGhoqKio6OjpKSkpaWlpqamqKioqampqqqqq6urrKysra2trq6ur6+vsLCwsbGxsrKys7OztLS0v/sY4AAAAEdJREFUeNpiYCADMDIgA0ZcYozoQhAxJixijFiF0cVoYox4hDHiFqaIMWIVRlcDAmDFDGiEEVwaGRkZcWnEpgFkDBAgwAA65ADXzW24cAAAAABJRU5ErkJggg==';


const PLAYER_ASSET = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAgCAYAAAAF10VBAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTVEMkRBNUUzNjVGMTFFMjkCNEZCODA0M0RGOUVCN0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTVEMkRBNTkzNjVGMTFFMjlCNEZCODA0M0RGOUVCN0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFNUQyREE1QzM2NUYxMUUyOUI0RkI4MDQzREY5RUI3QSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFNUQyREE1RDM2NUYxMUUyOUI0RkI4MDQzREY5RUI3QSIvHjwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+fL8h4gAAAKVJREFUeNpi/P//PwM+wIglj64G3ID/2DAIgNKzF8/BaoC4H4h1gZgRixgIsGPRyIAtO34E1DxX5T0Qd0JFYxNjgAKYBoy/c0ACxH9A/AGI/6Gx0cWogQExYCQNMLFiE4fRGB50A2D03L90+QOQNoHiH6j8byj9D90AdDEQ/wHFh9BwcjG4AQj+QxUnF4MbgOA/tHBKArEYiEWAWIgRSw5dDQgAIMAAbZ4gJk4/7kAAAAAASUVORK5CYII=';


const WEED_ASSET = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjVEMkRBNjAzNjVGMTFFMjlCNEZCODA0M0RGOUVCN0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjVEMkRBNjEzNjVGMTFFMjlCNEZCODA0M0RGOUVCN0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGNUQyREE1RTM2NUYxMUUyOUI0RkI4MDQzREY5RUI3QSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNUQyREE1RjM2NUYxMUUyOUI0RkI4MDQzREY5RUI3QSIvHjwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+0+x05QAAAF5JREFUeNpi/P//PwMlgImBQsACxN9A/BaIfwIxG5QG4s9A/J0RwmYkwhCg+C8Q/4by/5GgACj+DIq/QeWJcQAo/oMmhg5A8WcojU2MEYh/A/F/dDAI/0cXYwQIMABn9CD2kC0q4wAAAABJRU5ErkJggg==';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    
    preload() {
        
        this.textures.addBase64('grass', GRASS_ASSET);
        this.textures.addBase64('player', PLAYER_ASSET);
        this.textures.addBase64('weed', WEED_ASSET);
    }

    create() {
        this.bg = this.add.tileSprite(400, 300, 800, 600, 'grass');
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(20, 20);
        this.player.body.setOffset(2, 6);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        this.weeds = this.physics.add.staticGroup();
        this.physics.add.overlap(this.player, this.weeds, (player, weed) => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                weed.destroy();
                window.dispatchEvent(new CustomEvent('weed-pulled'));
            }
        });

        const user = getAuthUser();
        fetch(API_URL(`/api/gamification/world-state/${user.id}`), {
            headers: { Authorization: `Bearer ${getAuthItem('accessToken')}` }
        })
            .then(res => res.json())
            .then(state => this.buildWorld(state))
            .catch(e => this.buildWorld({ moodScore: 5, weedsCount: 3 }));
    }

    buildWorld(state) {
        if (state.moodScore >= 8) {
            this.bg.clearTint();
        } else if (state.moodScore >= 5) {
            this.bg.setTint(0xaaddff);
        } else {
            this.bg.setTint(0x556677);
        }

        for (let i = 0; i < state.weedsCount; i++) {
            let x = Phaser.Math.Between(50, 750);
            let y = Phaser.Math.Between(50, 550);
            this.weeds.create(x, y, 'weed');
        }
    }

    update() {
        const speed = 200;
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown || this.wasd.left.isDown) this.player.body.setVelocityX(-speed);
        else if (this.cursors.right.isDown || this.wasd.right.isDown) this.player.body.setVelocityX(speed);

        if (this.cursors.up.isDown || this.wasd.up.isDown) this.player.body.setVelocityY(-speed);
        else if (this.cursors.down.isDown || this.wasd.down.isDown) this.player.body.setVelocityY(speed);
    }
}
