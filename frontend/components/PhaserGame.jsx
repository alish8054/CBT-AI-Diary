import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MainScene from '../src/game/MainScene';
import { useLanguage } from '../src/i18n/LanguageContext';

export default function PhaserGame({ onExit }) {
    const gameRef = useRef(null);
    const { t } = useLanguage();

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: 'phaser-container',
            physics: {
                default: 'arcade',
                arcade: { gravity: { y: 0 }, debug: false }
            },
            scene: [MainScene]
        };

        gameRef.current = new Phaser.Game(config);

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
            }
        };
    }, []);

    return (
        <div className="animate-in phaser-game-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 'var(--space-md)' }}>
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h3 style={{ margin: 0 }}>{t('world_garden_title')}</h3>
                    <small style={{ color: 'var(--text-muted)' }}>{t('world_controls_hint')}</small>
                </div>
                <button className="btn-secondary" onClick={onExit} style={{ padding: '8px 20px' }}>{t('world_exit_btn')}</button>
            </div>

            <div 
                id="phaser-container" 
                style={{ 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    boxShadow: 'var(--shadow-lg)',
                    border: '8px solid var(--bg-surface)',
                    maxWidth: '100%',
                    height: 'auto'
                }}
            />
        </div>
    );
}
