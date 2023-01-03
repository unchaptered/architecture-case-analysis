import fs from 'fs';

import { getFolderList } from "./folder.explorer";
import { convertMarkdownFile } from "./markdown.converter";

const folderList = getFolderList('/');
const fileListInFolder = folderList.map(folder => getFolderList(folder));

const folderMap = new Map();
for (let idx = 0; idx < folderList.length; idx++)
    folderMap.set(folderList[idx], fileListInFolder[idx]);

const markdown = convertMarkdownFile(folderMap);
fs.writeFileSync('./README.md', markdown, { encoding: 'utf8' });