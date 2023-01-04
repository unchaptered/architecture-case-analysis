function getFormatedFilename(filename: string) {

    const [ createdAt, realFilename ] = filename.split(' - ');

    return {
        createdAt,
        realFilename
    };
}

export function convertMarkdownFile(folderMap: Map<string, string[]>) {

    const awsLink = 'https://aws.amazon.com/ko/architecture/this-is-my-architecture/?tma.sort-by=item.additionalFields.airDate&amp;tma.sort-order=desc&amp;awsf.category=*all&amp;awsf.industry=*all&amp;awsf.language=*all&amp;awsf.show=*all';
    let markdown = `
# architecture-case-analysis

architecture-case-analysis with [This is My Architecture](${awsLink})

## Chaters

`;
    const folderEntries = [...folderMap].sort();
    // console.log(folderEntries);
    for (let idx = 0; idx < folderEntries.length; idx ++) {

        const BASE_URL = 'https://github.com/unchaptered/architecture-case-analysis/tree/main/';
        // [ media-service, ['20230103 - Audio Live Streaming...', ... 'somethimes...'] ]
        const [ chapter, filenameList ] = folderEntries[idx];
        
        markdown += `${idx + 1}. [${chapter}](${encodeURI(BASE_URL + chapter)})\n`;
        for (let jdx = 0; jdx < filenameList.length; jdx++) {
            const { createdAt, realFilename } = getFormatedFilename(filenameList[jdx]);
            markdown += `\n   ${createdAt} - [${realFilename}](${encodeURI(BASE_URL + chapter)}) \n`
        }
    }

    //
    return markdown;
}