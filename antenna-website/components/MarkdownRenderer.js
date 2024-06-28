// // components/MarkdownRenderer.js
// import { useEffect, useState } from 'react';
// import { remark } from 'remark';
// import html from 'remark-html';

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
