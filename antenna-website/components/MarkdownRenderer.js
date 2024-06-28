// // components/MarkdownRenderer.js
// import { useEffect, useState } from 'react';
// import { remark } from 'remark';
// import html from 'remark-html';

// const MarkdownRenderer = ({ markdown }) => {
//     const [content, setContent] = useState('');

//     useEffect(() => {
//         const renderMarkdown = async () => {
//             const processedContent = await remark().use(html).process(markdown);
//             setContent(processedContent.toString());
//         };

//         renderMarkdown();
//     }, [markdown]);

//     return <div className="markdown text-text" dangerouslySetInnerHTML={{ __html: content }} />;
// };


// export default MarkdownRenderer;

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const MarkdownRenderer = ({ markdown }) => {
    return (
        <div className="markdown text-text">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {markdown}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
