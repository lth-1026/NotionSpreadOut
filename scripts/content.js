// 페이지에서 텍스트 추출
function getPageContent() {
    const pages = document.querySelectorAll('.notion-collection-item[data-block-id]'); 
    pages.forEach((page) => {
        const id = page.getAttribute('data-block-id');
        fetchNotionContent(id)
            .then(content => console.log(content))
            .catch(error => console.error(error));
    })
    // for (let page of pages) {
    //     const id = page.getAttribute('data-block-id');
    //     const pageContent = fetchNotionContent(id);
    //     console.log(pageContent);
    // }
    // return pageContent || 'Not found Data';
}

async function fetchNotionContent(id) {
    return new Promise((resolve, reject) => {
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
                        resolve(notionContent.innerHTML);
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
    // 현재 URL 가져오기
    const currentDomain = window.location.origin;
    const targetUrl = `${currentDomain}/${id}`;

    const iframe = document.createElement('iframe');
    iframe.src = targetUrl;
    iframe.style.display = 'none';
    const checkComplete = () => {
        const iframeDoc = iframe.contentWindow.document;
        const notionContent = iframeDoc.querySelector(".notion-page-content");
        if(notionContent != null) {
            console.log("Notion Content:", notionContent?.innerHTML || "Not Found");
            iframe.remove();
            return notionContent?.innerHTML || "Not Found";
        } else {
            console.log('대기 중...');
            setTimeout(() => {
                checkComplete()
            }, 100);
        }
    };

    document.body.append(iframe);
    return checkComplete()
  }
  
// 메시지 수신 시 페이지 내용 반환
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "readDOM") {
        const content = getPageContent();
        sendResponse({ data: content });
    }
});