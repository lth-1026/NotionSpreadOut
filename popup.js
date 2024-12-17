document.getElementById("readDOM").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    // 현재 탭에 메시지 보내기
    chrome.tabs.sendMessage(tab.id, { action: "readDOM" }, (response) => {
        if (chrome.runtime.lastError) {
            document.getElementById("output").innerText = "Failed to read DOM.";
            return;
        }

        // 결과를 새 창에 출력
        const newWindow = window.open("", "_blank");
        if(newWindow) {
            newWindow.document.write(response.data);
            newWindow.document.close();
        } else {
            alert('팝업 차단이 활성화되어 새 창을 열 수 없습니다.');
        }
        // 결과 표시
        document.getElementById("output").innerHTML = response.data;
        document.getElementById('output').insertAdjacentHTML('afterend', response.data);
    });
});