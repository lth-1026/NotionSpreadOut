// 페이지에서 텍스트 추출
function getPageContent() {
    const data = document.querySelector('.notion-collection-item[data-block-id]'); 
    const id = data.getAttribute('data-block-id');
    const dataContent = fetchNotionContent(id.replaceAll("-", ""));
    return data.dataContent || 'Not found Data';
}

async function fetchNotionContent(id) {
    // 현재 URL 가져오기
    const currentDomain = window.location.origin;
    const targetUrl = `${currentDomain}/2-${id}`;

    const iframe = document.createElement('iframe');
    iframe.src = targetUrl;
    iframe.style.display = 'none';

    const checkComplete = () => {
        const iframeDoc = iframe.contentWindow.document;

        if(iframeDoc.readyState == 'complete') {
            const notionContent = iframeDoc.querySelector(".notion-page-content");
            console.log("Notion Content:", notionContent?.innerHTML || "Not Found");
            document.body.remove(iframe);
        } else {
            console.log('대기 중...');
            setTimeout(() => {
                checkComplete()
            }, 100);
        }

    };


    // iframe.onload = () => {

    //     const checkComplete = () => {
    //         const iframeDoc = iframe.contentWindow.document;

    //         if(iframeDoc.readyState == 'complete') {
    //             const notionContent = iframeDoc.querySelector(".notion-page-content");
    //             console.log("Notion Content:", notionContent?.innerHTML || "Not Found");
    //             document.body.remove(iframe);
    //         } else {
    //             console.log('대기 중...');
    //             setTimeout(() => {
    //                 checkComplete
    //             }, 100);
    //         }

    //     };

    //     checkComplete();
    // };

    document.body.append(iframe);
    setTimeout(() => checkComplete(), 1000);
  
    // try {
    //     // Fetch 요청
    //     const response = await fetch(targetUrl);
    //     if (!response.ok) throw new Error("Failed to fetch content.");
    
    //     const pageContent = await response.text();  // 텍스트로 응답 수신
    //     console.log("Notion Page Content:", pageContent);

    //         // 텍스트를 DOM 객체로 변환
    //     const parser = new DOMParser();
    //     const doc = parser.parseFromString(pageContent, "text/html");

    //     // 콘텐츠 추가
    //     document.body.innerHTML = doc.body.innerHTML;

    //     // 예시: 특정 요소 가져오기
    //     const notionContent = doc.querySelector(".notion-page-content");
    //     console.log("Notion Content:", notionContent?.innerHTML || "Not Found");

    
    //     // 원하는 DOM 요소로 결과 표시
    //     return notionContent?.innerHTML || "Not Found";
    // } catch (error) {
    //   console.error("Error fetching Notion content:", error);
    // }
  }
  
// 메시지 수신 시 페이지 내용 반환
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "readDOM") {
        const content = getPageContent();
        sendResponse({ data: content });
    }
});