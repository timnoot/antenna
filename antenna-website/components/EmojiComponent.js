import twemoji from 'twemoji';
import { useEffect } from 'react';

const EmojiComponent = ({ text }) => {
    let newText = twemoji.parse(text, {
        folder: 'svg',
        ext: '.svg',
        base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
    });

    return <span className="emoji-text" dangerouslySetInnerHTML={{ __html: newText }} />;
};

export default EmojiComponent;
