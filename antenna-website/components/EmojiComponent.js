import twemoji from 'twemoji';
import { useEffect } from 'react';

const EmojiComponent = ({ text }) => {
    useEffect(() => {
        twemoji.parse(document.body, {
            folder: 'svg',
            ext: '.svg',
        });
    }, [text]);

    return <span className="emoji-text" dangerouslySetInnerHTML={{ __html: twemoji.parse(text) }} />;
};

export default EmojiComponent;
