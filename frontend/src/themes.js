export const DEFAULT_THEME = {
    id: 'neutral',
    colors: {
        primary: '#6C63FF',      
        primaryLight: '#8F88FF',
        secondary: '#F5F3FF',    
        accent: '#FFF8E7',       
        background: '#F5F3FF',
        surface: '#FFFFFF',
        text: '#2D3748',         
        muted: '#718096'
    },
    shadows: {
        soft: '0 10px 25px -5px rgba(108, 99, 255, 0.1), 0 8px 10px -6px rgba(108, 99, 255, 0.05)',
        card: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }
};

export const EMOTION_THEMES = {
    'happy': { colors: { primary: '#48BB78', secondary: '#F0FFF4', text: '#22543D' } },
    'sad': { colors: { primary: '#4299E1', secondary: '#EBF8FF', text: '#2A4365' } },
    'anxious': { colors: { primary: '#ED64A6', secondary: '#FFF5F7', text: '#702459' } },
    'calm': { colors: { primary: '#6C63FF', secondary: '#F5F3FF', text: '#2D3748' } },
    'annoyed': { colors: { primary: '#F56565', secondary: '#FFF5F5', text: '#742A2A' } }
};
