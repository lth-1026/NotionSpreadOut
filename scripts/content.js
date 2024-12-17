// 페이지에서 텍스트 추출
async function getPageContent() {
    const pages = document.querySelectorAll('.notion-collection-item[data-block-id]'); 

    let resultHTML;

    for (let [index, page] of pages.entries()) {
        try {
            const content = await fetchNotionContent(page);
            if (index === 0) {
                resultHTML = content;
            } else {
                const layoutContents = content.querySelector('.layout').childNodes;
                resultHTML.querySelector('.layout').append(...layoutContents);
            }
        } catch (error) {
            console.error('Error fetching Notion content:', error);
        }
    }

    return resultHTML.documentElement.outerHTML;
}

function getPageId(page) {
    return page.getAttribute('data-block-id');
}

async function fetchNotionContent(page) {
    return new Promise((resolve, reject) => {
        const id = getPageId(page);
        const currentDomain = window.location.origin;
        const targetUrl = `${currentDomain}/${id.replaceAll('-', '')}`;

        const iframe = document.createElement('iframe');
        iframe.src = targetUrl;
        iframe.style.display = 'none';

        document.body.append(iframe);

        iframe.onload = () => {
            try {
                const iframeDoc = iframe.contentWindow.document;

                const observer = new MutationObserver(() => {
                    const notionContent = iframeDoc.querySelector('.notion-page-content');
                    if(notionContent) {
                        console.log("notion content: ", notionContent.innerHTML);
                        observer.disconnect();
                        iframe.remove();
                        resolve(iframeDoc);
                    }
                });

                // iframe 내부 body 감지 시작
                observer.observe(iframeDoc.body, {childList: true, subtree: true});
            } catch (error) {
                reject("Access denied or CORS issue");
                iframe.remove();
            }
        };

        iframe.onerror = () => {
            reject("Failed to load iframe content.");
            iframe.remove();
        };
    });
  }
  
// 메시지 수신 시 페이지 내용 반환
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "readDOM") {
        getPageContent().then(content => {
            sendResponse({ data: content });
        }).catch(error => {
            sendResponse({ data: `Error: ${error}`});
        });
        return true;
    }
});